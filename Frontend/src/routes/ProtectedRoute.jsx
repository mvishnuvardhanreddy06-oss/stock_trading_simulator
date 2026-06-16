import React from "react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import OTPVerification from "../pages/OTPVerification.jsx";
import ResetPassword from "../pages/ResetPassword.jsx";
import Success from "../pages/Success.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState("login");
  const [resetEmail, setResetEmail] = useState("");

  if (isAuthenticated) return children;

  // Forgot Password Flow
  if (mode === "forgot-password") {
    return (
      <ForgotPassword
        onBack={() => setMode("login")}
        onSuccess={(email) => {
          setResetEmail(email);
          setMode("otp-verification");
        }}
      />
    );
  }

  if (mode === "otp-verification") {
    return (
      <OTPVerification
        email={resetEmail}
        onBack={() => {
          setResetEmail("");
          setMode("forgot-password");
        }}
        onSuccess={(email) => {
          setResetEmail(email);
          setMode("reset-password");
        }}
        onResendOTP={() => {
          // Resend logic is handled inside OTPVerification component
        }}
      />
    );
  }

  if (mode === "reset-password") {
    return (
      <ResetPassword
        email={resetEmail}
        onBack={() => {
          setResetEmail("");
          setMode("otp-verification");
        }}
        onSuccess={() => {
          setResetEmail("");
          setMode("success");
        }}
      />
    );
  }

  if (mode === "success") {
    return (
      <Success
        onReturnToLogin={() => {
          setResetEmail("");
          setMode("login");
        }}
      />
    );
  }

  // Login/Register Flow
  return mode === "login" ? (
    <Login
      onShowRegister={() => setMode("register")}
      onForgotPassword={() => setMode("forgot-password")}
    />
  ) : (
    <Register onShowLogin={() => setMode("login")} />
  );
}

export default ProtectedRoute;
