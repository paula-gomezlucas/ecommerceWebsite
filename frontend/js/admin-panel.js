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
  const tabProductsBtn = document.getElementById("tabProducts");
  const tabOrdersBtn = document.getElementById("tabOrders");

  const productsTbody = document.getElementById("productsTbody");
  const productsCount = document.getElementById("productsCount");
  const ordersTbody = document.getElementById("ordersTbody");

  const editCard = document.getElementById("editCard");
  const closeEditBtn = document.getElementById("closeEdit");
  const saveEditBtn = document.getElementById("saveEdit");

  closeEditBtn.addEventListener("click", () => {
    editCard.classList.add("hidden");
    msg.textContent = "";
  });

  welcome.textContent = `Hola, ${session.user.username} (admin)`;

  document.getElementById("logout").addEventListener("click", () => {
    clearSession();
    window.location.href = "login.html";
  });

  document.getElementById("goCatalog").addEventListener("click", () => {
    window.location.href = "catalog.html";
  });

  function setActiveTab(tab) {
    const isProducts = tab === "products";

    productsSection.classList.toggle("hidden", !isProducts);
    ordersSection.classList.toggle("hidden", isProducts);

    tabProductsBtn.classList.toggle("btn-tab-active", isProducts);
    tabOrdersBtn.classList.toggle("btn-tab-active", !isProducts);

    msg.textContent = "";
  }

  tabProductsBtn.addEventListener("click", () => {
    setActiveTab("products");
  });

  tabOrdersBtn.addEventListener("click", () => {
    setActiveTab("orders");
    loadOrders(); // refresh when opening
  });

  const badge = document.getElementById("roleBadge");
  badge.textContent = "Administrador";
  badge.className = "badge badge-admin";

  // ---------- PRODUCTS ----------
  document
    .getElementById("createProduct")
    .addEventListener("click", createProduct);

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
        btnEdit.addEventListener("click", () => openEdit(p));

        const btnDelete = document.createElement("button");
        btnDelete.className = "btn btn-danger ml-8";
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
        imageurl: document.getElementById("p_imageurl").value.trim(),
      };

      await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      showOk("Producto creado");
      // clear form
      [
        "p_code",
        "p_name",
        "p_description",
        "p_price",
        "p_stock",
        "p_imageurl",
      ].forEach((id) => {
        document.getElementById(id).value = "";
      });
      document.getElementById("p_category").value = "core-work";

      loadProducts();
    } catch (err) {
      handleAuthError(err, "login.html");
      showError(err);
    }
  }

  function openEdit(p) {
    msg.textContent = "";

    document.getElementById("e_id").value = p.id;
    document.getElementById("e_name").value = p.name ?? "";
    document.getElementById("e_category").value = p.category ?? "core-work";
    document.getElementById("e_description").value = p.description ?? "";
    document.getElementById("e_price").value = p.price ?? 0;
    document.getElementById("e_stock").value = p.stock ?? 0;
    document.getElementById("e_imageurl").value = p.imageurl ?? "";

    editCard.classList.remove("hidden");
    editCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  saveEditBtn.addEventListener("click", async () => {
    msg.textContent = "";

    const id = Number(document.getElementById("e_id").value);

    const payload = {
      name: document.getElementById("e_name").value.trim(),
      category: document.getElementById("e_category").value, // <-- dropdown
      description: document.getElementById("e_description").value.trim(),
      price: Number(document.getElementById("e_price").value),
      stock: Number(document.getElementById("e_stock").value),
      imageurl: document.getElementById("e_imageurl").value.trim(),
    };

    try {
      await apiFetch(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      showOk("Producto actualizado");
      editCard.classList.add("hidden");
      loadProducts();
    } catch (err) {
      handleAuthError(err, "login.html");
      showError(err);
    }
  });

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
