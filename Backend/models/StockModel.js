import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true },
    sector: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    previousClose: { type: Number, required: true, min: 0 },
    high: { type: Number, min: 0 },
    low: { type: Number, min: 0 },
    open: { type: Number, min: 0 },
    volume: { type: Number, min: 0, default: 0 },
    marketCap: { type: Number, min: 0, default: 0 },
    history: [
      {
        price: Number,
        open: Number,
        high: Number,
        low: Number,
        close: Number,
        volume: Number,
        at: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const Stock = mongoose.model("Stock", stockSchema);
