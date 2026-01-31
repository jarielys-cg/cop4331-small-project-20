<?php
    function PrintUsers($conn)
    {
        $sql = "SELECT `ID`, `Username`, `Password`, `Email` FROM `Users`";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) 
        {
            while ($row = $result->fetch_assoc()) 
            {
                echo "ID: " . $row['ID'] . " Username: " . $row['Username'] . " Password: " . $row['Password'] . " Email: " . $row['Email'] . "<br>";
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
    $username = "wes";
    $password =  "wild";
    $email = "example@gmail.com";
    $sql = "INSERT INTO Users (`Username`, `Password`, `Email`) VALUES ('$username', '$password', '$email')";
    if ($conn->query($sql) === TRUE) 
    {
        echo "New record created successfully, ID: " . $conn->insert_id . "<br>";
    } 
    else 
    {
        echo "Error: " . $conn->error;
    }

    PrintUsers($conn);


    $conn->close();
?>