import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Loader, RotateCcw } from "lucide-react";
import "../styles/OTPVerification.css";
import { api } from "../services/axios.js";

function OTPVerificationPage({ email, onBack, onSuccess, onResendOTP }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOTPChange = (index, value) => {
    // Only allow digits
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      await api.verifyResetOTP({ email, otp: otpValue });
      onSuccess(email);
    } catch (err) {
      setError(err.message || "OTP verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);

    try {
      await api.resendResetOTP(email);
      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(60);
      setCanResend(false);
      setError("");
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const isExpired = timeLeft <= 0;

  return (
    <div className="otp-verification-page">
      <div className="otp-verification-card">
        <button className="back-button" onClick={onBack} disabled={isLoading}>
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="card-header">
          <div className="icon-box otp-icon">🔐</div>
          <h1>Verify Your Email</h1>
          <p className="subtitle">Enter the 6-digit code sent to</p>
          <p className="email-display">{email}</p>
        </div>

        <form onSubmit={handleVerifyOTP} className="otp-form">
          <div className="otp-inputs-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleOTPKeyDown(index, e)}
                className={`otp-input ${error ? "error" : ""}`}
                disabled={isLoading}
                placeholder="0"
              />
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="timer-container">
            <div className={`timer ${isExpired ? "expired" : ""}`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
            <p className="timer-label">{isExpired ? "Code has expired" : "Code expires in"}</p>
          </div>

          <button type="submit" className="verify-button" disabled={isLoading || isExpired}>
            {isLoading ? (
              <>
                <Loader size={18} className="spinner" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        <div className="form-footer">
          <p>Didn't receive the code?</p>
          <button
            type="button"
            className={`resend-button ${canResend ? "active" : "disabled"}`}
            onClick={handleResendOTP}
            disabled={!canResend || isLoading}
          >
            <RotateCcw size={16} />
            {canResend ? "Resend OTP" : "Resend available after timer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OTPVerificationPage;
