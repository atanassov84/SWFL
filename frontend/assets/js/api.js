const API_BASE = "http://localhost:8000";

function getToken() {
  return localStorage.getItem("token");
}

function setAuth(data) {
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user_id", data.user_id);
  localStorage.setItem("user_role", data.role);
  localStorage.setItem("user_name", data.full_name);
}

function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_name");
}

function isLoggedIn() {
  return !!getToken();
}

function getUserRole() {
  return localStorage.getItem("user_role");
}

function getUserName() {
  return localStorage.getItem("user_name");
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearAuth();
    window.location.href = "/login.html";
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Fehler" }));
    throw new Error(err.detail || "Serverfehler");
  }

  if (res.status === 204) return null;
  return res.json();
}

const api = {
  // Auth
  login: (email, password) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  register: (data) =>
    apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  me: () => apiFetch("/auth/me"),
  updateMe: (data) => apiFetch("/auth/me", { method: "PUT", body: JSON.stringify(data) }),

  // Helpers
  listHelpers: (params = {}) => {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v != null)));
    return apiFetch(`/helpers${q.toString() ? "?" + q : ""}`);
  },
  getHelper: (id) => apiFetch(`/helpers/${id}`),
  updateHelperProfile: (data) =>
    apiFetch("/helpers/profile", { method: "PUT", body: JSON.stringify(data) }),

  // Bookings
  createBooking: (data) =>
    apiFetch("/bookings", { method: "POST", body: JSON.stringify(data) }),
  listBookings: () => apiFetch("/bookings"),
  getBooking: (id) => apiFetch(`/bookings/${id}`),
  updateBookingStatus: (id, status) =>
    apiFetch(`/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  addDocumentation: (id, data) =>
    apiFetch(`/bookings/${id}/documentation`, { method: "POST", body: JSON.stringify(data) }),
  confirmDocumentation: (id) =>
    apiFetch(`/bookings/${id}/confirm-documentation`, { method: "POST" }),
  addReview: (id, data) =>
    apiFetch(`/bookings/${id}/review`, { method: "POST", body: JSON.stringify(data) }),

  // Admin
  dashboard: () => apiFetch("/admin/dashboard"),
  adminUsers: () => apiFetch("/admin/users"),
  adminBookings: () => apiFetch("/admin/bookings"),
  adminInvoices: () => apiFetch("/admin/invoices"),
  createInvoice: (data) =>
    apiFetch("/admin/invoices", { method: "POST", body: JSON.stringify(data) }),
  serviceCategories: () => apiFetch("/admin/service-categories"),
  toggleUserActive: (id) =>
    apiFetch(`/admin/users/${id}/toggle-active`, { method: "PATCH" }),
};
