import crypto from "crypto";

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate OTP expiry time (5 minutes from now)
 * @returns {Date} Expiry timestamp
 */
export function getOTPExpiry() {
  const now = new Date();
  return new Date(now.getTime() + 1 * 60 * 1000); // 1 minute
}

/**
 * Validate OTP format (6 digits)
 * @param {string} otp - OTP to validate
 * @returns {boolean} Is valid OTP format
 */
export function isValidOTPFormat(otp) {
  return /^\d{6}$/.test(otp);
}

/**
 * Check if OTP has expired
 * @param {Date} expiresAt - OTP expiry time
 * @returns {boolean} Is expired
 */
export function isOTPExpired(expiresAt) {
  return new Date() > expiresAt;
}

/**
 * Generate a cryptographically secure token
 * @returns {string} Random token
 */
export function generateSecureToken() {
  return crypto.randomBytes(32).toString("hex");
}
