import { Router } from "express";
import { User } from "../models/UserModel.js";
import { OTP } from "../models/OTPModel.js";
import { PasswordResetHistory } from "../models/PasswordResetHistory.js";
import { generateOTP, getOTPExpiry, isValidOTPFormat, isOTPExpired } from "../utils/otpGenerator.js";
import { sendOTPEmail } from "../utils/emailService.js";
import { validatePasswordStrength, hashPassword, comparePassword } from "../utils/passwordUtils.js";

const router = Router();

// Rate limiting helper (in production, use express-rate-limit package)
const otpAttempts = new Map();
const passwordResetAttempts = new Map();

function checkRateLimit(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  if (!otpAttempts.has(key)) {
    otpAttempts.set(key, []);
  }

  const attempts = otpAttempts.get(key).filter((time) => now - time < windowMs);
  if (attempts.length >= maxAttempts) {
    return false;
  }

  attempts.push(now);
  otpAttempts.set(key, attempts);
  return true;
}

/**
 * POST /forgot-password/send-otp
 * Send OTP to user's registered email
 */
router.post("/send-otp", async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email || !email.trim()) {
      const error = new Error("Email is required");
      error.status = 400;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      const error = new Error("Invalid email format");
      error.status = 400;
      throw error;
    }

    // Rate limiting
    if (!checkRateLimit(`otp-${normalizedEmail}`, 5, 15 * 60 * 1000)) {
      const error = new Error("Too many OTP requests. Please try again later.");
      error.status = 429;
      throw error;
    }

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const error = new Error("No account found with this email. Please register first.");
      error.status = 404;
      throw error;
    }

    // Clear old OTP for this email
    await OTP.deleteMany({ email: normalizedEmail });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    // Save OTP to database
    const otpRecord = new OTP({
      email: normalizedEmail,
      otp,
      expiresAt
    });

    await otpRecord.save();

    // Try to send email (non-critical failure)
    try {
      await sendOTPEmail(normalizedEmail, otp);
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
      // In development, you might want to return the OTP for testing
      // In production, log this and continue - user will be notified via email service logs
    }

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email.",
      email: normalizedEmail,
      // For development/testing - remove in production
      ...(process.env.NODE_ENV === "development" && { otp })
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /forgot-password/verify-otp
 * Verify OTP sent to user
 */
router.post("/verify-otp", async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !email.trim() || !otp || !otp.trim()) {
      const error = new Error("Email and OTP are required");
      error.status = 400;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otpValue = otp.trim();

    // Validate OTP format
    if (!isValidOTPFormat(otpValue)) {
      const error = new Error("Invalid OTP format. Must be 6 digits.");
      error.status = 400;
      throw error;
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email: normalizedEmail });

    if (!otpRecord) {
      const error = new Error("OTP not found or expired. Please request a new one.");
      error.status = 400;
      throw error;
    }

    // Check if OTP is expired
    if (isOTPExpired(otpRecord.expiresAt)) {
      await OTP.deleteOne({ _id: otpRecord._id });
      const error = new Error("OTP has expired. Please request a new one.");
      error.status = 400;
      throw error;
    }

    // Check attempts
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await OTP.deleteOne({ _id: otpRecord._id });
      const error = new Error("Maximum OTP verification attempts exceeded. Request a new OTP.");
      error.status = 400;
      throw error;
    }

    // Verify OTP
    if (otpRecord.otp !== otpValue) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const error = new Error(`Invalid OTP. Attempts remaining: ${otpRecord.maxAttempts - otpRecord.attempts}`);
      error.status = 401;
      throw error;
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      email: normalizedEmail,
      verified: true
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /forgot-password/reset-password
 * Reset password with verified OTP
 */
router.post("/reset-password", async (req, res, next) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Validation
    if (!email || !email.trim() || !newPassword || !confirmPassword) {
      const error = new Error("Email, new password, and confirm password are required");
      error.status = 400;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      const error = new Error("Passwords do not match");
      error.status = 400;
      throw error;
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      const error = new Error(passwordValidation.errors.join(". "));
      error.status = 400;
      throw error;
    }

    // Check if OTP is verified
    const otpRecord = await OTP.findOne({ email: normalizedEmail, verified: true });
    if (!otpRecord) {
      const error = new Error("OTP not verified. Please verify OTP first.");
      error.status = 401;
      throw error;
    }

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    user.password = hashedPassword;
    user.lastPasswordResetAt = new Date();
    user.passwordResetAttempts = 0;
    await user.save();

    // Record password reset in history
    const resetHistory = new PasswordResetHistory({
      userId: user._id,
      email: normalizedEmail,
      success: true,
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });
    await resetHistory.save();

    // Delete verified OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
      email: normalizedEmail
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /forgot-password/resend-otp
 * Resend OTP to user
 */
router.post("/resend-otp", async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email || !email.trim()) {
      const error = new Error("Email is required");
      error.status = 400;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Rate limiting for resend
    if (!checkRateLimit(`resend-otp-${normalizedEmail}`, 3, 5 * 60 * 1000)) {
      const error = new Error("Too many resend attempts. Please try again after 5 minutes.");
      error.status = 429;
      throw error;
    }

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const error = new Error("No account found with this email. Please register first.");
      error.status = 404;
      throw error;
    }

    // Delete old OTP
    await OTP.deleteMany({ email: normalizedEmail });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    // Save new OTP
    const otpRecord = new OTP({
      email: normalizedEmail,
      otp,
      expiresAt
    });
    await otpRecord.save();

    // Try to send email
    try {
      await sendOTPEmail(normalizedEmail, otp);
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
    }

    res.status(200).json({
      success: true,
      message: "OTP resent successfully.",
      email: normalizedEmail,
      // For development/testing - remove in production
      ...(process.env.NODE_ENV === "development" && { otp })
    });
  } catch (error) {
    next(error);
  }
});

export default router;
