import React, { useState, useEffect } from "react";
import { ArrowLeft, Eye, EyeOff, Loader, Lock } from "lucide-react";
import "../styles/ResetPassword.css";
import { api } from "../services/axios.js";

function ResetPasswordPage({ email, onBack, onSuccess }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);

  // Password validation
  const validatePassword = (password) => {
    const errors = [];

    if (!password || password.length < 8) {
      errors.push("At least 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("One uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("One lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("One number");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("One special character");
    }

    return errors;
  };

  // Calculate password strength
  const calculateStrength = (password) => {
    let strength = 0;

    if (!password) return 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

    return Math.min(strength, 5);
  };

  useEffect(() => {
    const strength = calculateStrength(newPassword);
    setPasswordStrength(strength);
    const errors = validatePassword(newPassword);
    setValidationErrors(errors);
  }, [newPassword]);

  const getStrengthLabel = () => {
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
    return labels[passwordStrength] || "Very Weak";
  };

  const getStrengthColor = () => {
    const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#16a34a"];
    return colors[passwordStrength] || "#ef4444";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Please fill in all password fields");
      return;
    }

    if (validationErrors.length > 0) {
      setError("Please ensure your password meets all requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await api.resetPassword({ email, newPassword, confirmPassword });
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordValid = validationErrors.length === 0 && newPassword.length > 0;
  const doPasswordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <button className="back-button" onClick={onBack} disabled={isLoading}>
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="card-header">
          <div className="icon-box">
            <Lock size={32} />
          </div>
          <h1>Create New Password</h1>
          <p className="subtitle">Choose a strong password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          {/* New Password Field */}
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="password-input-wrapper">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isLoading}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={`strength-bar ${bar <= passwordStrength ? "filled" : ""}`}
                      style={{ backgroundColor: bar <= passwordStrength ? getStrengthColor() : "#e5e7eb" }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: getStrengthColor() }}>
                  {getStrengthLabel()}
                </span>
              </div>
            )}

            {/* Password Requirements Checklist */}
            {newPassword && (
              <div className="requirements">
                <p className="requirements-title">Password requirements:</p>
                <ul className="requirements-list">
                  <li className={newPassword.length >= 8 ? "valid" : ""}>
                    <span>✓</span> At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(newPassword) ? "valid" : ""}>
                    <span>✓</span> One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(newPassword) ? "valid" : ""}>
                    <span>✓</span> One lowercase letter
                  </li>
                  <li className={/\d/.test(newPassword) ? "valid" : ""}>
                    <span>✓</span> One number
                  </li>
                  <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? "valid" : ""}>
                    <span>✓</span> One special character
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Match Indicator */}
            {confirmPassword && (
              <div className={`password-match ${doPasswordsMatch ? "matched" : "unmatched"}`}>
                <span>{doPasswordsMatch ? "✓" : "✗"}</span>
                <span>{doPasswordsMatch ? "Passwords match" : "Passwords do not match"}</span>
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
          >
            {isLoading ? (
              <>
                <Loader size={18} className="spinner" />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
