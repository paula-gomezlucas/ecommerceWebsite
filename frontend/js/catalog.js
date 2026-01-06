import { apiFetch, clearSession, BACKEND_BASE } from "./api.js";
import { requireLogin, handleAuthError } from "./guards.js";

const session = requireLogin("login.html");

function formatName(name) {
  if (!name) return "";
  const s = String(name).trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

if (!session) {
  // redirected
} else {
  document.getElementById("welcome").textContent =
  `Hola, ${formatName(session.user.username)}`;

  const grid = document.getElementById("grid");
  const categorySelect = document.getElementById("category");
  const searchInput = document.getElementById("search");
  const count = document.getElementById("count");
  const message = document.getElementById("message");
  const goPanelBtn = document.getElementById("goPanel");

  if (session.user.role === "admin") {
    goPanelBtn.textContent = "Panel admin";
    goPanelBtn.addEventListener("click", () => {
      window.location.href = "admin.html";
    });
  } else {
    goPanelBtn.textContent = "Mi cuenta";
    goPanelBtn.addEventListener("click", () => {
      window.location.href = "user.html";
    });
  }

  document.getElementById("logout").addEventListener("click", () => {
    clearSession();
    window.location.href = "login.html";
  });

  document.getElementById("goCart").addEventListener("click", () => {
    window.location.href = "cart.html";
  });

  document.getElementById("goOrders").addEventListener("click", () => {
    window.location.href = "orders.html";
  });

  let allProducts = [];

  function render(products) {
    grid.innerHTML = "";

    count.textContent = `${products.length} producto(s)`;

    for (const p of products) {
      const card = document.createElement("div");
      card.className = "card";

      const img = document.createElement("img");
      img.src = `${BACKEND_BASE}${p.imageurl}`;

      //   img.src = p.imageurl; // we’ll make it work with backend static next step if needed
      img.alt = p.name;

      const title = document.createElement("h3");
      const link = document.createElement("a");
      link.href = `product.html?id=${p.id}`;
      link.textContent = p.name;
      title.appendChild(link);

      const meta = document.createElement("div");
      meta.className = "muted";
      meta.textContent = `${p.category} • Stock: ${p.stock}`;

      const row = document.createElement("div");
      row.className = "row";

      const price = document.createElement("strong");
      price.textContent = `${Number(p.price).toFixed(2)} €`;

      const addBtn = document.createElement("button");
      addBtn.className = "btn btn-primary";
      addBtn.textContent = "Añadir al carrito";
      addBtn.addEventListener("click", async () => {
        message.textContent = "";
        try {
          await apiFetch("/orders/cart/items", {
            method: "POST",
            body: JSON.stringify({ productId: p.id, quantity: 1 }),
          });
          message.style.color = "green";
          message.textContent = `Añadido: ${p.name}`;
        } catch (err) {
          handleAuthError(err, "login.html");
          message.style.color = "#cc0000";
          message.textContent = err.message;
        }
      });

      row.appendChild(price);
      row.appendChild(addBtn);

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(row);

      grid.appendChild(card);
    }
  }

  function refreshView() {
    const cat = categorySelect.value;
    const q = searchInput.value.trim().toLowerCase();

    let filtered = allProducts;

    if (cat) filtered = filtered.filter((p) => p.category === cat);

    if (q) {
      filtered = filtered.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    }

    render(filtered);
  }

  function loadCategories(products) {
    const cats = Array.from(new Set(products.map((p) => p.category))).sort();
    // keep "Todas"
    for (const c of cats) {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      categorySelect.appendChild(opt);
    }
  }

  async function init() {
    message.textContent = "";
    try {
      allProducts = await apiFetch("/products");
      loadCategories(allProducts);

      categorySelect.addEventListener("change", refreshView);
      searchInput.addEventListener("input", refreshView);

      refreshView();
    } catch (err) {
      message.style.color = "#cc0000";
      message.textContent = err.message;
    }
  }

  init();
}
