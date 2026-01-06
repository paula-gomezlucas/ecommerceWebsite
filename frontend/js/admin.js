// Recuperamos el usuario almacenado en localStorage
const username = localStorage.getItem("username");

// Mostramos el mensaje de bienvenida
const welcomeMessage = document.getElementById("welcome");
welcomeMessage.textContent = "Bienvenido, " + username;

// Gestion del logou
const logoutButton = document.getElementById("logout");

logoutButton.addEventListener("click", () => {

    // Eliminamos el usuario actual de localStorage
    localStorage.removeItem("username");
    // Salimos al login de nuevo
    window.location.href = "login.html";
});
