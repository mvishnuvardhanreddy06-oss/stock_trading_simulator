import React from "react";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function Register({ onShowLogin }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      await register(form);
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-icon">
          <UserPlus size={24} />
        </div>
        <p className="eyebrow">Start trading</p>
        <h1>Create Account</h1>
        <p className="auth-copy">Create your Stockking account and start simulated trading without risk.</p>

        <label>
          Name
          <input name="name" value={form.name} onChange={updateField} required />
        </label>

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
            minLength="4"
            value={form.password}
            onChange={updateField}
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button auth-submit" disabled={isSubmitting} type="submit">
          <UserPlus size={18} />
          {isSubmitting ? "Creating..." : "Register"}
        </button>

        <button className="link-button" type="button" onClick={onShowLogin}>
          Already have an account? Login
        </button>
      </form>
    </main>
  );
}

export default Register;
