// frontend/js/api.js
export const API_BASE = "http://localhost:3000/api";
export const BACKEND_BASE = "http://localhost:3000";

export function getSession() {
  const raw = localStorage.getItem("session");
  return raw ? JSON.parse(raw) : null;
}

export function setSession(session) {
  localStorage.setItem("session", JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem("session");
}

// Generic fetch wrapper that automatically adds Authorization if logged in
export async function apiFetch(path, options = {}) {
  const session = getSession();

  const headers = new Headers(options.headers || {});
  // If you send JSON, ensure content-type is set
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Try to parse JSON responses
  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    // Normalize error
    const message =
      (data && typeof data === "object" && data.error) ? data.error : `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}