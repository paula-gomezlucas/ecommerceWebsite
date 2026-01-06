import { apiFetch, clearSession } from "./api.js";
import { requireAdmin, handleAuthError } from "./guards.js";

const session = requireAdmin("login.html");
if (!session) {
  // redirected
} else {
  const msg = document.getElementById("message");
  const welcome = document.getElementById("welcome");

  const productsSection = document.getElementById("productsSection");
  const ordersSection = document.getElementById("ordersSection");

  const productsTbody = document.getElementById("productsTbody");
  const productsCount = document.getElementById("productsCount");
  const ordersTbody = document.getElementById("ordersTbody");

  welcome.textContent = `Hola, ${session.user.username} (admin)`;

  document.getElementById("logout").addEventListener("click", () => {
    clearSession();
    window.location.href = "login.html";
  });

  document.getElementById("goCatalog").addEventListener("click", () => {
    window.location.href = "catalog.html";
  });

  document.getElementById("tabProducts").addEventListener("click", () => {
    productsSection.classList.remove("hidden");
    ordersSection.classList.add("hidden");
    msg.textContent = "";
  });

  document.getElementById("tabOrders").addEventListener("click", () => {
    ordersSection.classList.remove("hidden");
    productsSection.classList.add("hidden");
    msg.textContent = "";
    loadOrders(); // refresh when opening
  });

  // ---------- PRODUCTS ----------
  document.getElementById("createProduct").addEventListener("click", createProduct);

  async function loadProducts() {
    productsTbody.innerHTML = "";
    try {
      const products = await apiFetch("/products");
      productsCount.textContent = `${products.length} producto(s)`;

      for (const p of products) {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${p.id}</td>
          <td>
            <strong>${p.name}</strong><br>
            <span class="muted">${p.code} • ${p.category}</span>
          </td>
          <td>${Number(p.price).toFixed(2)} €</td>
          <td>${p.stock}</td>
          <td></td>
        `;

        const actionsTd = tr.querySelector("td:last-child");

        const btnEdit = document.createElement("button");
        btnEdit.className = "btn btn-secondary";
        btnEdit.textContent = "Editar";
        btnEdit.addEventListener("click", () => editProductPrompt(p));

        const btnDelete = document.createElement("button");
        btnDelete.className = "btn btn-danger";
        btnDelete.style.marginLeft = "8px";
        btnDelete.textContent = "Eliminar";
        btnDelete.addEventListener("click", () => deleteProduct(p.id));

        actionsTd.appendChild(btnEdit);
        actionsTd.appendChild(btnDelete);

        productsTbody.appendChild(tr);
      }
    } catch (err) {
      handleAuthError(err, "login.html");
      showError(err);
    }
  }

  async function createProduct() {
    msg.textContent = "";
    try {
      const payload = {
        code: document.getElementById("p_code").value.trim(),
        name: document.getElementById("p_name").value.trim(),
        category: document.getElementById("p_category").value.trim(),
        description: document.getElementById("p_description").value.trim(),
        price: Number(document.getElementById("p_price").value),
        stock: Number(document.getElementById("p_stock").value),
        imageurl: document.getElementById("p_imageurl").value.trim()
      };

      await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      showOk("Producto creado");
      // clear form
      ["p_code","p_name","p_category","p_description","p_price","p_stock","p_imageurl"].forEach(id => {
        document.getElementById(id).value = "";
      });

      loadProducts();
    } catch (err) {
      handleAuthError(err, "login.html");
      showError(err);
    }
  }

  async function editProductPrompt(p) {
    // Simple prompt-based edit (fast + functional). If you want, we can make a modal later.
    const name = prompt("Nombre", p.name);
    if (name === null) return;

    const category = prompt("Categoría", p.category);
    if (category === null) return;

    const description = prompt("Descripción", p.description ?? "");
    if (description === null) return;

    const priceStr = prompt("Precio (€)", String(p.price));
    if (priceStr === null) return;

    const stockStr = prompt("Stock", String(p.stock));
    if (stockStr === null) return;

    const imageurl = prompt("Image URL (/images/...)", p.imageurl);
    if (imageurl === null) return;

    const payload = {
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      price: Number(priceStr),
      stock: Number(stockStr),
      imageurl: imageurl.trim()
    };

    try {
      await apiFetch(`/products/${p.id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      showOk("Producto actualizado");
      loadProducts();
    } catch (err) {
      handleAuthError(err, "login.html");
      showError(err);
    }
  }

  async function deleteProduct(id) {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      await apiFetch(`/products/${id}`, { method: "DELETE" });
      showOk("Producto eliminado");
      loadProducts();
    } catch (err) {
      handleAuthError(err, "login.html");
      showError(err);
    }
  }

  // ---------- ORDERS ----------
  async function loadOrders() {
    ordersTbody.innerHTML = "";
    try {
      const orders = await apiFetch("/orders/admin/all?status=ORDER");

      for (const o of orders) {
        const tr = document.createElement("tr");

        const created = new Date(o.created_at).toLocaleString();
        const confirmed = o.confirmed_at ? "Confirmado" : "Pendiente";

        tr.innerHTML = `
          <td>${o.id}</td>
          <td>${o.customer}</td>
          <td>${created}</td>
          <td>${confirmed}</td>
          <td></td>
        `;

        const actionTd = tr.querySelector("td:last-child");

        if (o.confirmed_at) {
          actionTd.innerHTML = `<span class="muted">—</span>`;
        } else {
          const btn = document.createElement("button");
          btn.className = "btn btn-primary";
          btn.textContent = "Confirmar";
          btn.addEventListener("click", () => confirmOrder(o.id));
          actionTd.appendChild(btn);
        }

        ordersTbody.appendChild(tr);
      }
    } catch (err) {
      handleAuthError(err, "login.html");
      showError(err);
    }
  }

  async function confirmOrder(orderId) {
    try {
      await apiFetch(`/orders/${orderId}/confirm`, { method: "PUT" });
      showOk(`Pedido #${orderId} confirmado`);
      loadOrders();
    } catch (err) {
      handleAuthError(err, "login.html");
      showError(err);
    }
  }

  function showOk(text) {
    msg.style.color = "green";
    msg.textContent = text;
  }

  function showError(err) {
    msg.style.color = "#cc0000";
    msg.textContent = err.message || "Error";
  }

  // init
  loadProducts();
}
