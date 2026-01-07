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

  const ratingSummaryEl = document.getElementById("ratingSummary");
  const reviewsListEl = document.getElementById("reviewsList");

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderStars(rating) {
    // rating: 0..5 (can be decimal)
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;

    // Use simple unicode to avoid extra CSS/images
    return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
  }

  function pseudoRandom(seedStr) {
    // deterministic-ish generator based on product id/code
    let h = 2166136261;
    for (let i = 0; i < seedStr.length; i++) {
      h ^= seedStr.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return function next() {
      h += 0x6d2b79f5;
      let t = Math.imul(h ^ (h >>> 15), 1 | h);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildFakeReviews(product) {
    const rand = pseudoRandom(`${product.id}-${product.code}-${product.name}`);

    const authors = [
      "Marta",
      "Álvaro",
      "Lucía",
      "Diego",
      "Sara",
      "Javier",
      "Noa",
      "Irene",
      "Carlos",
      "Sofía",
      "Miguel",
      "Paula",
      "David",
      "Laura",
      "Pablo",
    ];
    const titles = [
      "Perfecto para trabajar viajando",
      "Muy buena compra",
      "Cumple lo que promete",
      "Detalles mejorables, pero recomendable",
      "Me salvó en un coworking",
      "Calidad/precio excelente",
    ];
    const bodies = [
      "Muy fácil de usar y se integra bien con el resto de mi setup. Envío rápido y todo correcto.",
      "Lo he usado durante varias semanas en cafés y aeropuertos. Se nota pensado para movilidad.",
      "Buen producto en general, aunque cambiaría algún detalle. Aun así, lo volvería a comprar.",
      "Me ayudó bastante a mantener un setup consistente cuando estoy fuera de casa.",
      "Sólido y fiable. Justo lo que necesitaba para trabajar sin sorpresas.",
    ];

    const count = 4 + Math.floor(rand() * 3); // 4..6 reviews

    const reviews = Array.from({ length: count }, () => {
      // Bias ratings toward 4–5 to look like a curated store
      const r = rand();
      const rating = r < 0.15 ? 3 : r < 0.55 ? 4 : 5;

      const author = authors[Math.floor(rand() * authors.length)];
      const title = titles[Math.floor(rand() * titles.length)];
      const body = bodies[Math.floor(rand() * bodies.length)];

      const daysAgo = 2 + Math.floor(rand() * 40);
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      return { rating, author, title, body, date };
    });

    return reviews;
  }

  function renderReviews(reviews) {
    if (!ratingSummaryEl || !reviewsListEl) return;

    const avg =
      reviews.reduce((sum, r) => sum + r.rating, 0) /
      Math.max(1, reviews.length);

    ratingSummaryEl.textContent = `${avg.toFixed(1)}/5 · ${
      reviews.length
    } reseñas`;

    reviewsListEl.innerHTML = reviews
      .map((r) => {
        const dateStr = r.date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        });

        return `
        <li class="review">
          <article>
            <header>
              <p class="no-margin"><strong>${escapeHtml(r.title)}</strong></p>
              <p class="muted no-margin">
                ${renderStars(r.rating)} · ${escapeHtml(
          r.author
        )} · ${escapeHtml(dateStr)}
              </p>
            </header>
            <p class="no-margin">${escapeHtml(r.body)}</p>
          </article>
        </li>
      `;
      })
      .join("");
  }

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
      const reviews = buildFakeReviews(p);
      renderReviews(reviews);

      document.getElementById("add").addEventListener("click", async () => {
        try {
          await apiFetch("/orders/cart/items", {
            method: "POST",
            body: JSON.stringify({ productId: p.id, quantity: 1 }),
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
