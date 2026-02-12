<?php

header('Content-type: application/json');

// Connects to database
$conn = new mysqli("localhost", "Group20Admin", "ContactManagerAccess", "ContactManager");

if($conn->connect_error) {
    echo json_encode(["error" => $conn->connect_error]);
    exit;
}

// Stores input to edit from front-end
$input = json_decode(file_get_contents("php://input"), true);
$id = $input['ID'] ?? null;
$first_name = $input['FirstName'] ?? '';
$last_name = $input['LastName'] ?? '';
$email = $input['Email'] ?? '';
$phone_number = $input['PhoneNumber'] ?? '';

// Unique contact ID is required to edit contact information
if(!$id) {
    echo json_encode([
        "message" => "Missing contact ID"
    ]);
    exit;
}

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
    echo json_encode ([
        "message" => "Contact updated"
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