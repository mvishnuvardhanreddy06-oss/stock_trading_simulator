import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    startingCash: { type: Number, default: 100000 },
    lastPasswordResetAt: { type: Date, default: null },
    passwordResetAttempts: { type: Number, default: 0 },
    passwordResetLastAttempt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
