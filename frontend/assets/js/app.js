// ── Toast ──────────────────────────────────────────────────────────────────
function showToast(msg, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── Nav toggle ─────────────────────────────────────────────────────────────
function initNavToggle() {
  const toggle = document.getElementById("nav-toggle");
  const links  = document.getElementById("nav-links");
  if (toggle && links) toggle.addEventListener("click", () => links.classList.toggle("open"));
}

// ── Auth nav update ────────────────────────────────────────────────────────
function updateNavAuth() {
  const loginLink  = document.getElementById("nav-login");
  const logoutLink = document.getElementById("nav-logout");
  const dashLink   = document.getElementById("nav-dashboard");
  const name       = getUserName();
  const role       = getUserRole();

  if (isLoggedIn()) {
    if (loginLink)  loginLink.classList.add("hidden");
    if (logoutLink) logoutLink.classList.remove("hidden");
    if (dashLink) {
      dashLink.classList.remove("hidden");
      const href = role === "admin" ? "/dashboard-admin.html"
                 : role === "helper" ? "/dashboard-helfer.html"
                 : "/dashboard-kunde.html";
      dashLink.href = href;
      dashLink.textContent = name || "Dashboard";
    }
  } else {
    if (loginLink)  loginLink.classList.remove("hidden");
    if (logoutLink) logoutLink.classList.add("hidden");
    if (dashLink)   dashLink.classList.add("hidden");
  }
}

// ── Stars ──────────────────────────────────────────────────────────────────
function renderStars(rating) {
  const full  = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

// ── Status Badge ───────────────────────────────────────────────────────────
function statusBadge(status) {
  const map = {
    pending:   ["Ausstehend", "badge-pending"],
    confirmed: ["Bestätigt",  "badge-confirmed"],
    completed: ["Abgeschlossen", "badge-completed"],
    cancelled: ["Storniert", "badge-cancelled"],
    draft:     ["Entwurf",   "badge-draft"],
    sent:      ["Gesendet",  "badge-sent"],
    paid:      ["Bezahlt",   "badge-paid"],
    rejected:  ["Abgelehnt", "badge-cancelled"],
  };
  const [label, cls] = map[status] || [status, "badge-draft"];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ── Format Date ────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ── Modal helpers ──────────────────────────────────────────────────────────
function openModal(id) { document.getElementById(id)?.classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id)?.classList.add("hidden"); }

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  updateNavAuth();

  // Logout
  document.getElementById("nav-logout")?.addEventListener("click", (e) => {
    e.preventDefault();
    clearAuth();
    window.location.href = "/";
  });

  // Close modals on overlay click
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.add("hidden");
    });
  });
});
