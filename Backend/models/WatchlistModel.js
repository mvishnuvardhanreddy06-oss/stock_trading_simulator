import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true, unique: true, index: true },
    symbols: [{ type: String, uppercase: true, trim: true }]
  },
  { timestamps: true }
);

export const Watchlist = mongoose.model("Watchlist", watchlistSchema);
