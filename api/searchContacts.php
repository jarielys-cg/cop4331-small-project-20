<?php
// tells the client that we're sending json back
header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $search = $_GET['q'] ?? $_GET['search'] ?? "";
    $userId = $_GET['userId'] ?? null;
    
    // NEW: Get pagination parameters
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 10;
} else {
    // grabs the raw request body
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    // stop if the json is invalid
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(["error" => "invalid json"]);
        exit();
    }
    // pull out what we need from the request
    $userId = $data["UserID"] ?? $data["userId"] ?? $data["userID"] ?? null;
    $search = $data["Search"] ?? $data["search"] ?? "";
    
    // NEW: Get pagination parameters from POST body
    $page = isset($data['page']) ? max(1, intval($data['page'])) : 1;
    $limit = isset($data['limit']) ? max(1, min(100, intval($data['limit']))) : 10;
}

// can't search without knowing the user
if ($userId === null) {
    http_response_code(400);
    echo json_encode(["error" => "missing user id"]);
    exit();
}

// basic cleanup
$userId = (int)$userId;
$search = trim((string)$search);

// NEW: Calculate offset for pagination
$offset = ($page - 1) * $limit;

// connect to the database
$ENV = parse_ini_file(__DIR__ . '/../.env');
$conn = new mysqli($ENV['DB_HOST'], $ENV['DB_USER'], $ENV['DB_PASS'], $ENV['DB_NAME']);

// stop if the connection failed
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "database connection failed"]);
    exit();
}

// wrap the search term so we can do partial matches
$like = "%" . $search . "%";

// NEW: First, get total count for pagination metadata
$countSql = "
SELECT COUNT(*) as total
FROM Contacts
WHERE UserID = ?
  AND (
    FirstName LIKE ?
    OR LastName LIKE ?
    OR Email LIKE ?
    OR PhoneNumber LIKE ?
  )
";

$countStmt = $conn->prepare($countSql);
if (!$countStmt) {
    http_response_code(500);
    echo json_encode(["error" => "count query prep failed"]);
    $conn->close();
    exit();
}

$countStmt->bind_param("issss", $userId, $like, $like, $like, $like);
$countStmt->execute();
$countResult = $countStmt->get_result();
$totalContacts = $countResult->fetch_assoc()['total'];
$totalPages = ceil($totalContacts / $limit);
$countStmt->close();

// sql to find matching contacts for this user with LIMIT and OFFSET
$sql = "
SELECT
  ID,
  FirstName,
  LastName,
  Email,
  PhoneNumber,
  UserID,
  CreatedAt
FROM Contacts
WHERE UserID = ?
  AND (
    FirstName LIKE ?
    OR LastName LIKE ?
    OR Email LIKE ?
    OR PhoneNumber LIKE ?
  )
ORDER BY LastName, FirstName
LIMIT ? OFFSET ?
";

$stmt = $conn->prepare($sql);

// make sure the query prepared correctly
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "query prep failed"]);
    $conn->close();
    exit();
}

// bind values to the placeholders (added limit and offset)
$stmt->bind_param("issssii", $userId, $like, $like, $like, $like, $limit, $offset);

// runs the query
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["error" => "query execution failed"]);
    $stmt->close();
    $conn->close();
    exit();
}

// fetch results into an array
$result = $stmt->get_result();
$contacts = [];

while ($row = $result->fetch_assoc()) {
    $contacts[] = [
        'id' => $row['ID'],
        'first_name' => $row['FirstName'],
        'last_name' => $row['LastName'],
        'email' => $row['Email'],
        'phone' => $row['PhoneNumber'],
        'created_at' => $row['CreatedAt']
    ];
}

// NEW: Send results back with pagination metadata
echo json_encode([
    "success" => true, 
    "contacts" => $contacts,
    "pagination" => [
        "current_page" => $page,
        "total_pages" => $totalPages,
        "total_contacts" => $totalContacts,
        "per_page" => $limit,
        "has_next" => $page < $totalPages,
        "has_previous" => $page > 1
    ]
]);

// cleanup
$stmt->close();
$conn->close();