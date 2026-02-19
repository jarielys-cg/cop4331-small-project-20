function redirectToLogin() {
    window.location.href = "./index.html";
}

function redirectToRegistration() {
    window.location.href = "./signup.html";
}

function validateLoginForm() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    let isValid = true;

    // Remove old error message
    const existingError = document.querySelector(".error-message");
    if (existingError) existingError.remove();

    // Remove old red styling
    usernameInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");

    if (!username || !password) {
        isValid = false;

        // Add red styling
        usernameInput.classList.add("input-error");
        passwordInput.classList.add("input-error");

        // Show error message
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = "All fields are required.";

        const passwordRow = document.querySelectorAll(".input-row")[1];
        passwordRow.after(errorDiv);
    }

    return isValid;

}

function handleLogin(event) {
    event.preventDefault();
    if (validateLoginForm()) {
        callLoginAPI();
    }
}

async function callLoginAPI() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const data = {
        username: usernameInput.value.trim(),
        password: passwordInput.value
    };

    try {
        const response = await fetch('http://134.199.200.89/api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        // Remove old error message
        const existingError = document.querySelector(".error-message");
        if (existingError) existingError.remove();

        // Remove old red styling
        usernameInput.classList.remove("input-error");
        passwordInput.classList.remove("input-error");

        if (result.success) {
            sessionStorage.setItem('userId', result.id);
            sessionStorage.setItem('username', result.username);
            window.location.href = './dashboard.html';
        } else {
            // Add red styling
            usernameInput.classList.add("input-error");
            passwordInput.classList.add("input-error");

            // Show error message
            const errorDiv = document.createElement("div");
            errorDiv.className = "error-message";
            errorDiv.textContent = "Inavlid username or password.";

            const passwordRow = document.querySelectorAll(".input-row")[1];
            passwordRow.after(errorDiv);
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
        document.getElementById("email").focus();
    }
    else if (password !== passwordConfirm) {
        errorMessageContent = "Passwords do not match.";
        isError = true;
    }

    if (isError) {
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

async function AddToDatabase() {
    const data = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
        email: document.getElementById("email").value
    };

    try {
        const response = await fetch('http://134.199.200.89/api/signup.php',
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

        if (result.success) {
            const loginResponse = await fetch('http://134.199.200.89/api/login.php',
                {
                    method: 'POST',
                    headers:
                    {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: data.username, password: data.password })
                });
            const loginResult = await loginResponse.json();
            if (loginResult.success) {
                sessionStorage.setItem('userId', loginResult.id);
                sessionStorage.setItem('username', loginResult.username);
                window.location.href = "dashboard.html"
            }
        }
        else {
            alert('Error: ' + result.error);
        }
    }
    catch (err) {
        console.error('Fetch error:', err);
    }
}
