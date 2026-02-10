function redirectToLogin() {
    window.location.href = "./index.html";
}

function redirectToRegistration() {
    window.location.href = "./signup.html";
}

function validateLoginForm() {
    let error = false;

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const errorMessageDisplay = document.createElement("div");
    errorMessageDisplay.className = "error-message";
    let errorMessageContent = "";

    // Remove existing error message if any
    const existingErrorMessage = document.querySelector(".error-message");
    if (existingErrorMessage) {
        existingErrorMessage.remove();
    }

    // Check for empty fields
    if (!username || !password) {
        errorMessageContent = "All fields are required.";
        error = true;
    }

    if(error) {
        errorMessageDisplay.textContent = errorMessageContent;
        const passwordDiv = document.querySelector(".password-entry");
        passwordDiv.after(errorMessageDisplay);
    }

    // add actual authentication later

    return !error;

}

function validateRegistrationForm() {
    let isError = false;

    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordconfirm").value;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const errorMessageDisplay = document.createElement("div");
    errorMessageDisplay.className = "error-message";

    let errorMessageContent = "";

    // Remove existing error message if any
    const existingErrorMessage = document.querySelector(".error-message");
    if (existingErrorMessage) {
        existingErrorMessage.remove();
    }

    // Check for empty fields
    if (!email || !username || !password || !passwordConfirm) {
        errorMessageContent = "All fields are required.";
        isError = true;
    }
        // Validate email format
    else if (!emailRegex.test(email)) {
        errorMessageContent = "Invalid email format.";
        isError = true;
        email.focus();
    }

    // Check if passwords match
    else if (password !== passwordConfirm) {
        errorMessageContent = "Passwords do not match.";
        isError = true;
    }

    if(isError) {
        errorMessageDisplay.textContent = errorMessageContent;
        const passwordConfirmDiv = document.querySelector(".passwordconfirm-entry");
        passwordConfirmDiv.after(errorMessageDisplay);
        return false;
    }

    return !isError;
}

function handleRegister(event) {
    event.preventDefault(); // stop default submit

    if (validateRegistrationForm()) {
        AddToDatabase();
        return true;
    }
    return false;
}

async function AddToDatabase()
{
    const data = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
        email: document.getElementById("email").value
    };

    try 
    {
        const response = await fetch('http://localhost:8000/api/signup.php', 
        {
            method: 'POST',              // POST request
            headers: 
            {
                'Content-Type': 'application/json'  // Tell PHP we’re sending JSON
            },
            body: JSON.stringify(data)   // Convert JS object to JSON string
        });

        const result = await response.json(); // Parse JSON from PHP
        console.log(result);

        if (result.success) 
        {
            alert('Signup successful! User ID: ' + result.id);
        } 
        else 
        {
            alert('Error: ' + result.error);
        }
    } 
    catch (err) 
    {
        console.error('Fetch error:', err);
    }
}
