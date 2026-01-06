import { apiFetch, clearSession, BACKEND_BASE } from "./api.js";
import { requireLogin, handleAuthError } from "./guards.js";

const session = requireLogin("login.html");
if (!session) {
  // redirected
} else {
  const list = document.getElementById("list");
  const totalEl = document.getElementById("total");
  const emptyEl = document.getElementById("empty");
  const message = document.getElementById("message");

  document.getElementById("logout").addEventListener("click", () => {
    clearSession();
    window.location.href = "login.html";
  });

  document.getElementById("goOrders").addEventListener("click", () => {
    window.location.href = "orders.html";
});


  document.getElementById("goCatalog").addEventListener("click", () => {
    window.location.href = "catalog.html";
  });

  document.getElementById("checkout").addEventListener("click", checkout);

  async function loadCart() {
    list.innerHTML = "";
    message.textContent = "";
    emptyEl.textContent = "";
    totalEl.textContent = "";

    try {
      const cart = await apiFetch("/orders/cart");

      if (!cart.items.length) {
        emptyEl.textContent = "El carrito está vacío.";
        document.getElementById("checkout").disabled = true;
        return;
      }

      document.getElementById("checkout").disabled = false;

      for (const it of cart.items) {
        const row = document.createElement("div");
        row.className = "item";

        const img = document.createElement("img");
        img.src = `${BACKEND_BASE}${it.imageurl}`;

        const info = document.createElement("div");
        info.innerHTML = `<strong>${it.name}</strong><br><span class="muted">${it.unitPrice.toFixed(2)} € / unidad</span>`;

        const qty = document.createElement("input");
        qty.type = "number";
        qty.min = 1;
        qty.value = it.quantity;
        qty.addEventListener("change", () => updateItem(it.itemId, qty.value));

        const lineTotal = document.createElement("strong");
        lineTotal.textContent = `${it.lineTotal.toFixed(2)} €`;

        const del = document.createElement("button");
        del.className = "btn btn-danger";
        del.textContent = "Eliminar";
        del.addEventListener("click", () => removeItem(it.itemId));

        row.appendChild(img);
        row.appendChild(info);
        row.appendChild(qty);
        row.appendChild(lineTotal);
        row.appendChild(del);

        list.appendChild(row);
      }

      totalEl.textContent = `Total: ${cart.total.toFixed(2)} €`;
    } catch (err) {
      handleAuthError(err, "login.html");
      message.style.color = "#cc0000";
      message.textContent = err.message;
    }
  }

  async function updateItem(itemId, quantity) {
    try {
      await apiFetch(`/orders/cart/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity: Number(quantity) })
      });
      loadCart();
    } catch (err) {
      handleAuthError(err, "login.html");
      message.style.color = "#cc0000";
      message.textContent = err.message;
    }
  }

  async function removeItem(itemId) {
    try {
      await apiFetch(`/orders/cart/items/${itemId}`, { method: "DELETE" });
      loadCart();
    } catch (err) {
      handleAuthError(err, "login.html");
      message.style.color = "#cc0000";
      message.textContent = err.message;
    }
  }

  async function checkout() {
    try {
      await apiFetch("/orders/cart/checkout", { method: "POST" });
      window.location.href = "orders.html";
    } catch (err) {
      handleAuthError(err, "login.html");
      message.style.color = "#cc0000";
      message.textContent = err.message;
    }
  }

  loadCart();
}
