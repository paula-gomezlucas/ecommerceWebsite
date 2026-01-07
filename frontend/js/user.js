import { requireLogin } from "./guards.js";
import { clearSession, apiFetch } from "./api.js";

const session = requireLogin("login.html");

function formatName(name) {
  if (!name) return "";
  const s = String(name).trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

if (!session) {
  // redirected by guard
} else {
  document.getElementById("welcome").textContent = `Hola, ${formatName(
    session.user.username
  )}`;
  document.getElementById("role").textContent = `Rol: Usuario general`;

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

  const badge = document.getElementById("roleBadge");
  badge.textContent =
    session.user.role === "admin" ? "Administrador" : "Usuario";
  badge.className = `badge badge-${session.user.role}`;

  const fullNameEl = document.getElementById("fullName");
  const addressEl = document.getElementById("address");
  const phoneEl = document.getElementById("phone");
  const profileMsgEl = document.getElementById("profileMsg");

  function safeText(v) {
    return v ? String(v) : "—";
  }

  async function loadProfile() {
    if (!profileMsgEl) return;

    profileMsgEl.textContent = "";
    try {
      const res = await apiFetch("/users/me");
      const u = res.user;

      if (fullNameEl) fullNameEl.textContent = safeText(u.full_name);
      if (addressEl) addressEl.textContent = safeText(u.address);
      if (phoneEl) phoneEl.textContent = safeText(u.phone);
    } catch (err) {
      profileMsgEl.style.color = "#cc0000";
      profileMsgEl.textContent =
        "No se han podido cargar los datos personales.";
    }
  }

  loadProfile();
}
