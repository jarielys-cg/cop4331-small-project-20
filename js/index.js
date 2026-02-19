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

    let isError = false;

    // Remove old error message
    const existingError = document.querySelector(".error-message");
    if (existingError) existingError.remove();

    // Remove old red styling
    usernameInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");

    if (!username || !password) {
        isError = true;

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

    return !isError;

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

    const emailInput = document.getElementById("email");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const passwordConfirmInput = document.getElementById("passwordconfirm");

    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Remove old errors
    document.querySelectorAll(".error-message").forEach(e => e.remove());
    document.querySelectorAll(".input-error").forEach(e => e.classList.remove("input-error"));

    let errorMessageContent = "";

    const existingErrorMessage = document.querySelector(".error-message");
    if (existingErrorMessage) {
        existingErrorMessage.remove();
    }

    if (!email || !username || !password || !passwordConfirm) {
        errorMessageContent = "All fields are required.";
        if (!email) emailInput.classList.add("input-error");
        if (!username) usernameInput.classList.add("input-error");
        if (!password) passwordInput.classList.add("input-error");
        if (!passwordConfirm) passwordConfirmInput.classList.add("input-error");
        isError = true;
    }
    else if (!emailRegex.test(email)) {
        errorMessageContent = "Invalid email format.";
        emailInput.classList.add("input-error");
        isError = true;
    }
    else if (password !== passwordConfirm) {
        errorMessageContent = "Passwords do not match.";
        passwordInput.classList.add("input-error");
        passwordConfirmInput.classList.add("input-error");
        isError = true;
    }

    if (isError) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = errorMessageContent;

        const confirmRow = passwordConfirmInput.closest(".input-row");
        confirmRow.after(errorDiv);
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
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const passwordConfirmInput = document.getElementById("passwordconfirm");
    const emailInput = document.getElementById("email");

    // Remove old errors
    document.querySelectorAll(".error-message").forEach(e => e.remove());
    document.querySelectorAll(".input-error").forEach(e => e.classList.remove("input-error"));

    const data = {
        username: usernameInput.value.trim(),
        password: passwordInput.value,
        email: emailInput.value.trim()
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
            // Show API error on the page
            if (result.error && result.error.toLowerCase().includes("username")) {
                usernameInput.classList.add("input-error");

                // Show error message
                const errorDiv = document.createElement("div");
                errorDiv.className = "error-message";
                errorDiv.textContent = "Username already taken.";

                const confirmRow = passwordConfirmInput.closest(".input-row");
                confirmRow.after(errorDiv);
            } else {
                // Show error message
                const errorDiv = document.createElement("div");
                errorDiv.className = "error-message";
                errorDiv.textContent = "Registration failed. Please try again.";

                const confirmRow = passwordConfirmInput.closest(".input-row");
                confirmRow.after(errorDiv);
            }
        }
    }
    catch (err) {
        console.error('Fetch error:', err);
    }
}
