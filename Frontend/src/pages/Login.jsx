import React from "react";
import { useState } from "react";
import { LockKeyhole, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function getLoginMessage(message) {
  if (/invalid email or password|wrong password|unauthorized/i.test(message)) {
    return "Wrong email or password. Please try again or use Forgot password.";
  }

  return message || "Login failed. Please try again.";
}

function Login({ onShowRegister, onForgotPassword }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(form);
    } catch (loginError) {
      setError(getLoginMessage(loginError.message));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-icon">
          <LockKeyhole size={24} />
        </div>
        <p className="eyebrow">Stockking access</p>
        <h1>Sign In</h1>
        <p className="auth-copy">Practice stock trading with virtual capital and detailed portfolio analytics.</p>

        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            required
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button auth-submit" disabled={isSubmitting} type="submit">
          <LogIn size={18} />
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        <button className="link-button subtle-link" type="button" onClick={onForgotPassword}>
          Forgot password?
        </button>

        <button className="link-button" type="button" onClick={onShowRegister}>
          Create new account
        </button>
      </form>
    </main>
  );
}

export default Login;
