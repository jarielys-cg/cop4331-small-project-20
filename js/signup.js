function redirectToLogin() {
    window.location.href = "./index.html";
}

function validateForm() {
    let isError = false;

    const firstName = document.getElementById("firstname").value.trim();
    const lastName = document.getElementById("lastname").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordconfirm").value;

    const errorMessageDisplay = document.createElement("div");
    errorMessageDisplay.className = "error-message";
    let errorMessageContent = "";

    // Remove existing error message if any
    const existingErrorMessage = document.querySelector(".error-message");
    if (existingErrorMessage) {
        existingErrorMessage.remove();
    }

    // Check for empty fields
    if (!firstName || !lastName || !username || !password || !passwordConfirm) {
        errorMessageContent = "All fields are required.";
        isError = true;
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

    return true;
}