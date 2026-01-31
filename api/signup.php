<?php
    function PrintUsers($conn)
    {
        $sql = "SELECT `ID`, `Username`, `Password`, `Email` FROM `Users`";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) 
        {
            while ($row = $result->fetch_assoc()) 
            {
                echo "ID: " . $row['ID'] . " Name: " . $row['FirstName'] . " " . $row['LastName'] . "\n";
            }
            echo "done";
        } 
        else 
        {
            echo "No users found.";
        }
        echo "<br>";
    }

    //connect to database
    $conn = new mysqli("localhost", "Group20Admin", "ContactManagerAccess", "ContactManager");
    if($conn->connect_error) 
	{
		returnWithError($conn->connect_error);
	} 
    else if($conn)
    {
        echo "connected<br>";
    }

    //get input from frontend
    // $input = json_decode(file_get_contents("php://input"), true);
    // $username = $input['username'] ?? ''; //username or empty string
    // $password = $input['password'] ?? ''; //password or empty string
    // $email = $input['email'] ?? ''; //email or empty string

    PrintUsers($conn);

    //add a user


    PrintUsers($conn);


    $conn->close();
?>