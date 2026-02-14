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

	// connect to database
	$conn = new mysqli("localhost", "Group20Admin", "ContactManagerAccess", "ContactManager");
	if($conn->connect_error) 
	{
		echo json_encode(["success" => false, "error" => $conn->connect_error]);
		exit;
	}

	// get input from frontend and validate
	$input = json_decode(file_get_contents("php://input"), true);
	$username = $input['username'] ?? '';
	$password = $input['password'] ?? '';

	if ($username === '' || $password === '') {
		echo json_encode(["success" => false, "error" => "Missing username or password"]);
		exit;
	}

	$stmt = $conn->prepare("SELECT ID, Username, Password FROM Users WHERE Username = ? LIMIT 1");
	$stmt->bind_param("s", $username);

	if (!$stmt->execute()) {
		echo json_encode(["success" => false, "error" => $stmt->error]);
		$stmt->close();
		$conn->close();
		exit;
	}

	$result = $stmt->get_result();
	$user = $result->fetch_assoc();

	if ($user) {
		// NOTE: passwords are stored plaintext in the existing schema.
		// Compare directly to match current signup behavior.
		if ($password === $user['Password']) {
			echo json_encode([
				"success" => true,
				"id" => $user['ID'],
				"username" => $user['Username']
			]);
		} else {
			echo json_encode(["success" => false, "error" => "Invalid credentials"]);
		}
	} else {
		echo json_encode(["success" => false, "error" => "User not found"]);
	}

	$stmt->close();
	$conn->close();
?>


