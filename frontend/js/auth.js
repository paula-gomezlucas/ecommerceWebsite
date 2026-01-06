// frontend/js/auth.js
import { apiFetch, setSession, clearSession, getSession } from "./api.js";

export async function login(username, password) {
  const data = await apiFetch("/users", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });

  // Expect backend returns: { token, user: {id, username, role} }
  setSession(data);
  return data;
}

export async function register(payload) {
  // payload can include shipping fields too
  return apiFetch("/users/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function logout() {
  clearSession();
}

export function currentUser() {
  return getSession()?.user || null;
}

export function isAdmin() {
  return getSession()?.user?.role === "admin";
}
