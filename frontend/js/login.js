// frontend/js/login.js
import { apiFetch, setSession } from "./api.js";

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");

document.getElementById("btn-login").addEventListener("click", async (event) => {
  event.preventDefault();
  errorMessage.style.color = "#cc0000";
  errorMessage.textContent = "";

  try {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const session = await apiFetch("/users", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });

    // session expected from backend: { token, user: { id, username, role } }
    setSession(session);

    if (session.user.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "catalog.html";
    }
  } catch (err) {
    errorMessage.textContent = err.message || "Login failed";
  }
});

document.getElementById("btn-register").addEventListener("click", async (event) => {
  event.preventDefault();
  errorMessage.style.color = "#cc0000";
  errorMessage.textContent = "";

  try {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    await apiFetch("/users/register", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });

    errorMessage.style.color = "green";
    errorMessage.textContent = "Usuario registrado correctamente. Ya puedes iniciar sesión.";

    usernameInput.value = "";
    passwordInput.value = "";
  } catch (err) {
    errorMessage.textContent = err.message || "Register failed";
  }
});
