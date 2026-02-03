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

    PrintUsers($conn);
    $conn->close();
?>