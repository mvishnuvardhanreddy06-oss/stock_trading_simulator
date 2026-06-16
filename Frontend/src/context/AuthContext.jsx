import React, { createContext, useContext, useMemo, useState } from "react";
import { api } from "../services/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("stock-game-user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => sessionStorage.getItem("stock-game-token"));

  function saveSession(session) {
    sessionStorage.setItem("stock-game-token", session.token);
    sessionStorage.setItem("stock-game-user", JSON.stringify(session.user));
    setToken(session.token);
    setUser(session.user);
  }

  async function login(credentials) {
    const session = await api.login(credentials);
    saveSession(session);
  }

  async function register(account) {
    const session = await api.register(account);
    saveSession(session);
  }

  function logout() {
    sessionStorage.removeItem("stock-game-token");
    sessionStorage.removeItem("stock-game-user");
    localStorage.removeItem("stock-game-token");
    localStorage.removeItem("stock-game-user");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
