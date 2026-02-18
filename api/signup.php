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
    $ENV = parse_ini_file(__DIR__ . '/../.env');
    $conn = new mysqli($ENV['DB_HOST'], $ENV['DB_USER'], $ENV['DB_PASS'], $ENV['DB_NAME']);
    if($conn->connect_error) 
	{
        echo json_encode(["success" => false, "error" => $conn->connect_error]);
        exit;
	} 

    //get input from frontend
    $input = json_decode(file_get_contents("php://input"), true);
    $username = $input['username'] ?? ''; //username or empty string
    $password = $input['password'] ?? ''; //password or empty string
    $email = $input['email'] ?? ''; //email or empty string
    
    $stmt = $conn->prepare("INSERT INTO Users (`Username`, `Password`, `Email`) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $password, $email);
    
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
