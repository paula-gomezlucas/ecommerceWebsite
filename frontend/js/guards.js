// frontend/js/guards.js
import { getSession, clearSession } from "./api.js";

export function requireLogin(redirectTo = "login.html") {
  const session = getSession();
  if (!session?.token || !session?.user) {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}

export function requireAdmin(redirectTo = "login.html") {
  const session = requireLogin(redirectTo);
  if (!session) return null;

  if (session.user.role !== "admin") {
    // Optional: you can redirect to catalog later
    window.location.href = redirectTo;
    return null;
  }

  return session;
}

// Optional helper if token is invalid and API returns 401 in any page
export function handleAuthError(err, redirectTo = "login.html") {
  if (err?.status === 401) {
    clearSession();
    window.location.href = redirectTo;
  }
}
