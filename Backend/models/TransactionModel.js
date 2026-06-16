import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    side: { type: String, enum: ["BUY", "SELL"], required: true },
    symbol: { type: String, required: true, uppercase: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    realizedPnl: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
