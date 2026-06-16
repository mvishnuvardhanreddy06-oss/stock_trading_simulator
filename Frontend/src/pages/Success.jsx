import React, { useEffect } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import "../styles/Success.css";

function SuccessPage({ onReturnToLogin }) {
  useEffect(() => {
    // Optional: Auto-redirect to login after 5 seconds
    const timeout = setTimeout(() => {
      // Uncomment to auto-redirect:
      // onReturnToLogin();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [onReturnToLogin]);

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-animation">
          <CheckCircle2 size={80} className="check-icon" />
        </div>

        <div className="success-content">
          <h1>Password Reset Successfully!</h1>
          <p className="success-message">Your password has been changed successfully.</p>
          <p className="success-subtext">You can now log in with your new password.</p>
        </div>

        <div className="success-features">
          <div className="feature">
            <span className="feature-icon">🔒</span>
            <p>Your account is now secure</p>
          </div>
          <div className="feature">
            <span className="feature-icon">✓</span>
            <p>Password updated successfully</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <p>Ready to trade</p>
          </div>
        </div>

        <button className="return-button" onClick={onReturnToLogin}>
          Return to Login
          <ArrowRight size={20} />
        </button>

        <p className="auto-redirect-text">Redirecting to login in 5 seconds...</p>
      </div>
    </div>
  );
}

export default SuccessPage;
