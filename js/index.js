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

}