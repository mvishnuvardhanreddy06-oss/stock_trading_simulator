import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    side: { type: String, enum: ["BUY", "SELL"], required: true },
    symbol: { type: String, required: true, uppercase: true },
    quantity: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["FILLED", "REJECTED"], default: "FILLED" },
    fillPrice: { type: Number, min: 0 }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
