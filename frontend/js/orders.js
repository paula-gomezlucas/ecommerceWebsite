import { apiFetch, clearSession } from "./api.js";
import { requireLogin, handleAuthError } from "./guards.js";

const session = requireLogin("login.html");
if (!session) {
  // redirected
} else {
  const list = document.getElementById("list");
  const emptyEl = document.getElementById("empty");
  const message = document.getElementById("message");

  const flash = sessionStorage.getItem("flash");
  const hadFlash = Boolean(flash);
  if (flash) {
    sessionStorage.removeItem("flash");
    message.style.color = "green";
    message.textContent = flash;
  }

  document.getElementById("logout").addEventListener("click", () => {
    clearSession();
    window.location.href = "login.html";
  });

  document.getElementById("goCatalog").addEventListener("click", () => {
    window.location.href = "catalog.html";
  });

  document.getElementById("goCart").addEventListener("click", () => {
    window.location.href = "cart.html";
  });

  async function loadOrders() {
    list.innerHTML = "";
    emptyEl.textContent = "";
    if (!hadFlash) message.textContent = "";

    try {
      const orders = await apiFetch("/orders");

      if (!orders.length) {
        emptyEl.textContent = "No has realizado ningún pedido todavía.";
        return;
      }

      for (const o of orders) {
        const card = document.createElement("div");
        card.className = "order";

        const row1 = document.createElement("div");
        row1.className = "row";

        const id = document.createElement("strong");
        id.textContent = `Pedido #${o.id}`;

        const date = document.createElement("span");
        date.className = "muted";
        date.textContent = new Date(o.created_at).toLocaleString();

        row1.appendChild(id);
        row1.appendChild(date);

        const row2 = document.createElement("div");
        row2.className = "row muted";

        const isConfirmed = Boolean(o.confirmed_at || o.confirmed_by);

        const status = document.createElement("span");
        status.className = "status " + (isConfirmed ? "confirmed" : "pending");
        status.textContent = isConfirmed ? "Confirmado" : "Pendiente de confirmación";

        const updated = document.createElement("span");
        if (isConfirmed && o.confirmed_at) {
          updated.textContent = `Confirmado el ${new Date(o.confirmed_at).toLocaleString()}`;
        } else {
          updated.textContent = `Última actualización: ${new Date(o.updated_at).toLocaleString()}`;
        }

        row2.appendChild(status);
        row2.appendChild(updated);

        card.appendChild(row1);
        card.appendChild(row2);

        list.appendChild(card);
      }
    } catch (err) {
      handleAuthError(err, "login.html");
      message.style.color = "#cc0000";
      message.textContent = err.message;
    }
  }

  loadOrders();
}
