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

    const existingErrorMessage = document.querySelector(".error-message");
    if (existingErrorMessage) {
        existingErrorMessage.remove();
    }

    if (!username || !password) {
        errorMessageContent = "All fields are required.";
        error = true;
    }

    if(error) {
        errorMessageDisplay.textContent = errorMessageContent;
        const passwordDiv = document.querySelector(".password-entry");
        passwordDiv.after(errorMessageDisplay);
    }

    return !error;

}

function handleLogin(event) {
    event.preventDefault();
    if (validateLoginForm()) {
        callLoginAPI();
    }
}

async function callLoginAPI() {
    const data = {
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value
    };

    try {
        const response = await fetch('http://localhost:8000/api/Login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            sessionStorage.setItem('userId', result.id);
            sessionStorage.setItem('username', result.username);
            window.location.href = './dashboard.html';
        } else {
            const existingError = document.querySelector(".error-message");
            if (existingError) {
                existingError.remove();
            }
            const errorDiv = document.createElement("div");
            errorDiv.className = "error-message";
            errorDiv.textContent = result.error;
            const passwordDiv = document.querySelector(".password-entry");
            passwordDiv.after(errorDiv);
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
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

    const existingErrorMessage = document.querySelector(".error-message");
    if (existingErrorMessage) {
        existingErrorMessage.remove();
    }

    if (!email || !username || !password || !passwordConfirm) {
        errorMessageContent = "All fields are required.";
        isError = true;
    }
    else if (!emailRegex.test(email)) {
        errorMessageContent = "Invalid email format.";
        isError = true;
        email.focus();
    }
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
    event.preventDefault();

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
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
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
