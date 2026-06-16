import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hash password using bcrypt
 * @param {string} password - Plain password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 * @param {string} password - Plain password to verify
 * @param {string} hash - Stored password hash
 * @returns {Promise<boolean>} Password match result
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with errors
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get password strength score (0-5)
 * @param {string} password - Password to analyze
 * @returns {number} Strength score
 */
export function getPasswordStrength(password) {
  let strength = 0;

  if (!password) return 0;

  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

  return Math.min(strength, 5);
}

/**
 * Get password strength label
 * @param {number} strength - Strength score (0-5)
 * @returns {string} Strength label
 */
export function getPasswordStrengthLabel(strength) {
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  return labels[Math.min(strength, 5)] || "Very Weak";
}
