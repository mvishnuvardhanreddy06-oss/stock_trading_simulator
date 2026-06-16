import mongoose from "mongoose";

const passwordResetHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    resetAt: { type: Date, default: Date.now },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    success: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Index for tracking reset history
passwordResetHistorySchema.index({ email: 1, resetAt: -1 });

export const PasswordResetHistory = mongoose.model("PasswordResetHistory", passwordResetHistorySchema);
