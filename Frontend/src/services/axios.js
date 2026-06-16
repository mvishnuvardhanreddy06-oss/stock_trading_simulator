const API_PORT = import.meta.env.VITE_API_PORT || "5002";
const FALLBACK_API_URL = "https://stock-trading-simulator-1-675p.onrender.com/api";

function resolveApiUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return FALLBACK_API_URL;
  }

  const host = window.location.hostname;
  const protocol = window.location.protocol || "http:";
  return `${protocol}//${host}:${API_PORT}/api`;
}

const API_URL = resolveApiUrl();

async function request(path, options = {}) {
  const token = sessionStorage.getItem("stock-game-token");
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.error || error.message || "Request failed");
  }

  return response.json();
}

function normalizeEmail(value) {
  return value?.trim().toLowerCase() || "";
}

export const api = {
  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: normalizeEmail(credentials.email),
        password: credentials.password
      })
    }),
  register: (account) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: account.name.trim(),
        email: normalizeEmail(account.email),
        password: account.password
      })
    }),
  getMarket: () => request("/market/live"),
  getPortfolio: () => request("/portfolio"),
  getTransactions: () => request("/transactions"),
  placeOrder: (order) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify(order)
    }),
  getWatchlist: () => request("/watchlist"),
  updateWatchlist: (symbols) =>
    request("/watchlist", {
      method: "PUT",
      body: JSON.stringify({ symbols })
    }),
  sendResetOTP: (email) =>
    request("/forgot-password/send-otp", {
      method: "POST",
      body: JSON.stringify({ email: normalizeEmail(email) })
    }),
  verifyResetOTP: ({ email, otp }) =>
    request("/forgot-password/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email: normalizeEmail(email), otp })
    }),
  resetPassword: ({ email, newPassword, confirmPassword }) =>
    request("/forgot-password/reset-password", {
      method: "POST",
      body: JSON.stringify({ email: normalizeEmail(email), newPassword, confirmPassword })
    }),
  resendResetOTP: (email) =>
    request("/forgot-password/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email: normalizeEmail(email) })
    })
};
