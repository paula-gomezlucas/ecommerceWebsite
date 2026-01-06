import { apiFetch, clearSession, BACKEND_BASE } from "./api.js";
import { requireLogin, handleAuthError } from "./guards.js";

const session = requireLogin("login.html");
if (!session) {
  // redirected
} else {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const nameEl = document.getElementById("name");
  const metaEl = document.getElementById("meta");
  const descEl = document.getElementById("description");
  const priceEl = document.getElementById("price");
  const imgEl = document.getElementById("img");
  const msgEl = document.getElementById("message");

  document.getElementById("logout").addEventListener("click", () => {
    clearSession();
    window.location.href = "login.html";
  });

  document.getElementById("goCart").addEventListener("click", () => {
    window.location.href = "cart.html";
  });

  document.getElementById("goBack").addEventListener("click", () => {
    window.location.href = "catalog.html";
  });

  async function loadProduct() {
    msgEl.textContent = "";
    try {
      const p = await apiFetch(`/products/${id}`);

      nameEl.textContent = p.name;
      metaEl.textContent = `${p.category} • Código: ${p.code} • Stock: ${p.stock}`;
      descEl.textContent = p.description || "";
      priceEl.textContent = `${Number(p.price).toFixed(2)} €`;
      imgEl.src = `${BACKEND_BASE}${p.imageurl}`;
      imgEl.alt = p.name;

      document.getElementById("add").addEventListener("click", async () => {
        try {
          await apiFetch("/orders/cart/items", {
            method: "POST",
            body: JSON.stringify({ productId: p.id, quantity: 1 })
          });
          msgEl.style.color = "green";
          msgEl.textContent = "Añadido al carrito.";
        } catch (err) {
          handleAuthError(err, "login.html");
          msgEl.style.color = "#cc0000";
          msgEl.textContent = err.message;
        }
      });
    } catch (err) {
      handleAuthError(err, "login.html");
      msgEl.style.color = "#cc0000";
      msgEl.textContent = err.message;
    }
  }

  if (!id) {
    msgEl.style.color = "#cc0000";
    msgEl.textContent = "Falta el parámetro id.";
  } else {
    loadProduct();
  }
}
