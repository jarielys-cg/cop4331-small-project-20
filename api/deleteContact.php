<?php
// CORS 
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

//  preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Connect to database (same as other endpoints)
$ENV = parse_ini_file(__DIR__ . '/../.env');
$conn = new mysqli($ENV['DB_HOST'], $ENV['DB_USER'], $ENV['DB_PASS'], $ENV['DB_NAME']);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => $conn->connect_error]);
    exit();
}

// Gets input from the frontend
$input = json_decode(file_get_contents("php://input"), true);

$contactid = intval($input['contactid'] ?? 0);
$userid    = intval($input['userid'] ?? 0);

if ($contactid <= 0 || $userid <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing contactid or userid"]);
    $conn->close();
    exit();
}

// Deletes only if it matches schema
$stmt = $conn->prepare("DELETE FROM Contacts WHERE ID = ? AND UserID = ?");
$stmt->bind_param("ii", $contactid, $userid);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Contact not found"]);
    }
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
