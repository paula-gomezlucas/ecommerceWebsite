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
        row.className = "card cart-item";

        const img = document.createElement("img");
        img.className = "cart-item__img";
        img.src = `${BACKEND_BASE}${it.imageurl}`;
        img.alt = it.name;

        const info = document.createElement("div");

        const title = document.createElement("h3");
        title.className = "cart-item__title";
        title.textContent = it.name;

        const meta = document.createElement("div");
        meta.className = "muted cart-item__meta";
        meta.textContent = `${it.unitPrice.toFixed(2)} € / unidad`;

        info.appendChild(title);
        info.appendChild(meta);

        const controls = document.createElement("div");
        controls.className = "cart-item__controls";

        const qty = document.createElement("input");
        qty.className = "cart-qty";
        qty.type = "number";
        qty.min = "1";
        qty.value = it.quantity;
        qty.addEventListener("change", () => updateItem(it.itemId, qty.value));

        const lineTotal = document.createElement("strong");
        lineTotal.textContent = `${it.lineTotal.toFixed(2)} €`;

        const del = document.createElement("button");
        del.className = "btn btn-danger";
        del.textContent = "Eliminar";
        del.addEventListener("click", () => removeItem(it.itemId));

        controls.appendChild(qty);
        controls.appendChild(lineTotal);
        controls.appendChild(del);

        row.appendChild(img);
        row.appendChild(info);
        row.appendChild(controls);

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
        body: JSON.stringify({ quantity: Number(quantity) }),
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
