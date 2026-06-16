import React from "react";
import { LogOut, Trophy, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Navbar({ user, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="topbar app-navbar">
      <div>
        <p className="eyebrow">Simulator ecosystem</p>
        <h1>Stockking Trading Simulator</h1>
      </div>
      <div className="topbar-actions">
        <div className="status-pill muted">{user?.name || user?.email}</div>
        <div className="status-pill">
          <span />
          Live market
        </div>
        <div className="status-pill muted">
          <Trophy size={16} />
          Solo mode
        </div>
        <button className="icon-button" type="button" onClick={toggleTheme} aria-pressed={theme === "dark"} title="Toggle theme">
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="logout-button" type="button" onClick={onLogout}>
          <LogOut size={17} />
          Logout
        </button>
        <ToastContainer position="top-right" autoClose={2500} hideProgressBar theme={theme === "dark" ? "dark" : "light"} />
      </div>
    </header>
  );
}

export default Navbar;
