import { requireLogin } from "./guards.js";
import { clearSession } from "./api.js";

const session = requireLogin("login.html");
if (!session) {
  // redirected by guard
} else {
  document.getElementById("welcome").textContent = `Hola, ${session.user.username}`;
  document.getElementById("role").textContent = `Rol: ${session.user.role}`;

  document.getElementById("goCatalog").addEventListener("click", () => {
    window.location.href = "catalog.html";
  });

  document.getElementById("goCart").addEventListener("click", () => {
    window.location.href = "cart.html";
  });

  document.getElementById("goOrders").addEventListener("click", () => {
    window.location.href = "orders.html";
  });

  document.getElementById("logout").addEventListener("click", () => {
    clearSession();
    window.location.href = "login.html";
  });
}
