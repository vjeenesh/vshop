function togglePassword() {
    const passwordField = document.getElementById("password");
    const fieldType = passwordField.getAttribute("type");
  
    if (fieldType === "password") {
      passwordField.setAttribute("type", "text");
      document.getElementById("peekPassword").innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
      passwordField.setAttribute("type", "password");
      document.getElementById("peekPassword").innerHTML = '<i class="bi bi-eye"></i>';
    }
}

function toggleConfirmPassword() {
    const passwordField = document.getElementById("confirmPassword");
    const fieldType = passwordField.getAttribute("type");
  
    if (fieldType === "password") {
      passwordField.setAttribute("type", "text");
      document.getElementById("peekConfirmPassword").innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
      passwordField.setAttribute("type", "password");
      document.getElementById("peekConfirmPassword").innerHTML = '<i class="bi bi-eye"></i>';
    }
}