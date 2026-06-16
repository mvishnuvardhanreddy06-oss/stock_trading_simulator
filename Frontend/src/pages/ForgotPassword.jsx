import React, { useState } from "react";
import { Mail, ArrowLeft, Loader } from "lucide-react";
import "../styles/ForgotPassword.css";
import { api } from "../services/axios.js";

function ForgotPasswordPage({ onBack, onSuccess }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      await api.sendResetOTP(email);

      setSuccess(true);
      const normalizedEmail = email.trim().toLowerCase();
      setEmail(normalizedEmail);
      
      // Navigate to OTP verification page after 2 seconds
      setTimeout(() => {
        onSuccess(normalizedEmail);
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-card success-state">
          <div className="success-icon">✓</div>
          <h2>OTP Sent Successfully!</h2>
          <p>We've sent a 6-digit verification code to your email.</p>
          <p className="email-display">{email}</p>
          <p className="redirecting">Redirecting to verification page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <button className="back-button" onClick={onBack} disabled={isLoading}>
          <ArrowLeft size={20} />
          Back to Login
        </button>

        <div className="card-header">
          <div className="icon-box">
            <Mail size={32} />
          </div>
          <h1>Forgot Password?</h1>
          <p className="subtitle">Don't worry! Enter your email address and we'll send you a verification code.</p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Enter your registered email"
              disabled={isLoading}
              autoFocus
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader size={18} className="spinner" />
                Sending OTP...
              </>
            ) : (
              <>
                <Mail size={18} />
                Send OTP
              </>
            )}
          </button>
        </form>

        <div className="form-footer">
          <p>Remember your password? <button className="link-button" onClick={onBack} disabled={isLoading}>Log In</button></p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
