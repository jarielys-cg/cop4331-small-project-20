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
    $first_name = $input['first_name'] ?? '';
    $last_name = $input['last_name'] ?? '';
    $email = $input['email'] ?? '';
    $phone = $input['phone'] ?? '';
    $user_id = intval($input['user_id'] ?? 0);
    
    $stmt = $conn->prepare("INSERT INTO Contacts (`FirstName`, `LastName`, `Email`, `PhoneNumber`, `UserID`) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssi", $first_name, $last_name, $email, $phone, $user_id);
    
    if ($stmt->execute()) 
    {
        echo json_encode([
            "success" => true,
            "id" => $stmt->insert_id,
            "message" => "Contact added successfully"
        ]);
    } 
    else 
    {
        echo json_encode([
            "success" => false,
            "message" => "Failed to add contact: " . $stmt->error
        ]);
    }

    $stmt->close();
    $conn->close();
?>
