<?php
    // CORS headers
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Content-Type: application/json');

    // Handle preflight request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }

    //connect to database
    $conn = new mysqli("localhost", "Group20Admin", "ContactManagerAccess", "ContactManager");
    if($conn->connect_error) 
	{
        echo json_encode(["success" => false, "error" => $conn->connect_error]);
        exit;
	} 

    //get input from frontend
    $input = json_decode(file_get_contents("php://input"), true);
    $first = $input['firstname'] ?? '';
    $last = $input['lastname'] ?? '';
    $email = $input['email'] ?? '';
    $phonenum = $input['phonenum'] ?? '';
    $userid = intval($input['userid'] ?? 0);
    $isfav = intval($input['isfav'] ?? 0);
    $groupid = intval($input['groupid'] ?? 0);
    
    $stmt = $conn->prepare("INSERT INTO Contacts (`FirstName`, `LastName`, `Email`, `PhoneNumber`, `UserID`, `IsFavorite`, `GroupID`) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssiii", $first, $last, $email, $phonenum, $userid, $isfav, $groupid);
    
    if ($stmt->execute()) 
    {
        echo json_encode([
            "success" => true,
            "id" => $stmt->insert_id
        ]);
    } 
    else 
    {
        echo json_encode([
            "success" => false,
            "error" => $stmt->error
        ]);
    }

    $stmt->close();
    $conn->close();
?>
