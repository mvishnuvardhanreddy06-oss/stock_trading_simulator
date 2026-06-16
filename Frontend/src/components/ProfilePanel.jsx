import React from "react";
import { Bell, ChevronRight, LogOut, Settings, UserRound } from "lucide-react";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function ProfilePanel({ user, portfolio, onStartTrading, onLogout }) {
  const accountId = `#T-${(user?.email || "TRADER").slice(0, 8).replace(/[^a-z0-9]/gi, "").toUpperCase()}`;

  return (
    <section className="profile-page">
      <div className="profile-heading">
        <div>
          <h1>Your Account</h1>
          <p>Manage your personal settings, credentials, and virtual wallet summary.</p>
        </div>
        <button className="notification-button" type="button" aria-label="Notifications">
          <Bell size={20} />
        </button>
      </div>

      <div className="profile-grid-main">
        <article className="account-card">
          <div className="account-identity">
            <div className="avatar-box">
              <UserRound size={54} />
            </div>
            <div>
              <h2>{user?.name || "USER"}</h2>
              <p>{user?.email || "trader@example.com"}</p>
              <span className="trader-pill">Trader Account</span>
            </div>
          </div>

          <div className="account-details">
            <div>
              <span>Account ID Number</span>
              <strong>{accountId}</strong>
            </div>
            <div>
              <span>Membership Start</span>
              <strong>June 2026</strong>
            </div>
            <div>
              <span>Risk Profile</span>
              <strong className="accent-text">Medium</strong>
            </div>
            <div>
              <span>Time Horizon</span>
              <strong>Long Term</strong>
            </div>
            <div>
              <span>Investment Goal</span>
              <strong>Growth</strong>
            </div>
          </div>
        </article>

        <article className="wallet-card">
          <h2>Stockking Virtual Wallet</h2>
          <span>Available Credits</span>
          <strong>{money.format(portfolio?.cash || 100000)}</strong>
          <button className="primary-button" type="button" onClick={onStartTrading}>
            Start Trading
          </button>
          <p>All simulator credits are virtual and for performance testing only.</p>
        </article>
      </div>

      <article className="security-card">
        <h2>Privacy & Security Settings</h2>
        <button className="settings-row" type="button">
          <span>
            <Settings size={24} />
          </span>
          <div>
            <strong>Account Credentials</strong>
            <p>Update password, change username, or edit primary email.</p>
          </div>
          <ChevronRight size={22} />
        </button>
        <button className="settings-row logout-row" type="button" onClick={onLogout}>
          <span>
            <LogOut size={24} />
          </span>
          <div>
            <strong>Logout</strong>
            <p>End this simulator session and return to authentication.</p>
          </div>
          <ChevronRight size={22} />
        </button>
      </article>
    </section>
  );
}

export default ProfilePanel;
