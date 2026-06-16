import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, uppercase: true },
    quantity: { type: Number, required: true, min: 0 },
    averageCost: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const portfolioSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true, unique: true, index: true },
    cash: { type: Number, required: true, min: 0 },
    realizedPnl: { type: Number, default: 0 },
    holdings: [holdingSchema]
  },
  { timestamps: true }
);

export const Portfolio = mongoose.model("Portfolio", portfolioSchema);
