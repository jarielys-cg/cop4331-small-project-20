<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["error" => "invalid json"]);
    exit();
}

$contactId = isset($data["ContactID"]) ? (int)$data["ContactID"] : null;
$userId    = isset($data["UserID"])    ? (int)$data["UserID"]    : null;

if ($contactId === null || $userId === null) {
    http_response_code(400);
    echo json_encode(["error" => "missing ContactID or UserID"]);
    exit();
}

$DB_HOST = "localhost";
$DB_USER = "YOUR_DB_USER";
$DB_PASS = "YOUR_DB_PASS";
$DB_NAME = "ContactManager";

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "database connection failed"]);
    exit();
}

// Flip IsFavorite for the contact only if it belongs to this user
$sql = "UPDATE Contacts SET IsFavorite = NOT IsFavorite WHERE ID = ? AND UserID = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "query prep failed"]);
    $conn->close();
    exit();
}

$stmt->bind_param("ii", $contactId, $userId);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["error" => "query execution failed"]);
    $stmt->close();
    $conn->close();
    exit();
}

if ($stmt->affected_rows === 0) {
    http_response_code(404);
    echo json_encode(["error" => "contact not found or not owned by user"]);
    $stmt->close();
    $conn->close();
    exit();
}

// Return the new favorite state
$stmt->close();

$sel = $conn->prepare("SELECT IsFavorite FROM Contacts WHERE ID = ?");
$sel->bind_param("i", $contactId);
$sel->execute();
$sel->bind_result($newState);
$sel->fetch();
$sel->close();
$conn->close();

echo json_encode(["success" => true, "isFavorite" => (bool)$newState]);
