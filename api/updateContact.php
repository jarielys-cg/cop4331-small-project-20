<?php

//CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Connects to database
$ENV = parse_ini_file(__DIR__ . '/../.env');
$conn = new mysqli($ENV['DB_HOST'], $ENV['DB_USER'], $ENV['DB_PASS'], $ENV['DB_NAME']);

if($conn->connect_error) {
    echo json_encode(["error" => $conn->connect_error]);
    exit;
}

// Stores input to edit from front-end
$input = json_decode(file_get_contents("php://input"), true);
$id = $input['id'] ?? null;
$first_name = $input['first_name'] ?? '';
$last_name = $input['last_name'] ?? '';
$email = $input['email'] ?? '';
$phone_number = $input['phone'] ?? '';

// Unique contact ID is required to edit contact information
if(!$id) {
    echo json_encode([
        "message" => "Missing contact ID"
    ]);
    exit;
}

// Searching contact data before updating contact information
$currentStmt = $conn->prepare("SELECT ID, FirstName, LastName, Email, PhoneNumber FROM Contacts WHERE ID = ?");
$currentStmt->bind_param("i", $id);
$currentStmt->execute();

// Storing contact information
$currentResult = $currentStmt->get_result();
$currentData = $currentResult->fetch_assoc();
$currentStmt->close();

// Declares empty arrays that stores the information to be updated 
$updates = [];
$params = [];
$types = "";

// Stores updated information and their data type to arrays
if(!empty($first_name)) {
    $updates[] = "FirstName = ?";
    $params[] = $first_name;
    $types .= "s";
}

if(!empty($last_name)) {
    $updates[] = "LastName = ?";
    $params[] = $last_name;
    $types .= "s";
}

if(!empty($email)) {
    $updates[] = "Email = ?";
    $params[] = $email;
    $types .= "s";
}

if(!empty($phone_number)) {
    $updates[] = "PhoneNumber = ?";
    $params[] = $phone_number;
    $types .= "s";
}

// Checks if the 'updated' information is identical to unedited information
if(empty($updates)) {
    echo json_encode([
        "message" => "Nothing can be updated"
    ]);
    exit;
}

$params[] = $id;
$types .= "i";

// Updates contact information in the database
$stmt = $conn->prepare("UPDATE Contacts SET " . implode(", ", $updates) . " WHERE ID = ?");
$stmt->bind_param($types, ...$params);

// Checks that contact was successfully updated
if($stmt->execute()) {

    // Searching and storing updated contact information for display
    $updatedStmt = $conn->prepare("SELECT ID, FirstName, LastName, Email, PhoneNumber FROM Contacts WHERE ID = ?");
    $updatedStmt->bind_param("i", $id);
    $updatedStmt->execute();    

    $result = $updatedStmt->get_result();
    $updatedData = $result->fetch_assoc();

    $updatedStmt->close();

    echo json_encode ([
        "success" => "true",
        "message" => "Contact updated",
        "Original Contact Info" => $currentData,
        "Updated Contact Info" => $updatedData
    ]);
}
else {
    echo json_encode ([
        "error" => $stmt->error
    ]);
}

$stmt->close(); 
$conn->close();

?>