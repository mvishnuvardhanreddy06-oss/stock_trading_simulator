import { Router } from "express";
import { Watchlist } from "../models/WatchlistModel.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const owner = req.user.id;
    const watchlist = await Watchlist.findOneAndUpdate(
      { owner },
      { $setOnInsert: { symbols: ["AAPL", "MSFT", "NVDA"] } },
      { upsert: true, new: true }
    );
    res.json(watchlist);
  } catch (error) {
    next(error);
  }
});

router.put("/", async (req, res, next) => {
  try {
    const owner = req.user.id;
    const symbols = Array.isArray(req.body.symbols)
      ? req.body.symbols.map((symbol) => String(symbol).toUpperCase())
      : [];
    const watchlist = await Watchlist.findOneAndUpdate(
      { owner },
      { symbols },
      { upsert: true, new: true }
    );
    res.json(watchlist);
  } catch (error) {
    next(error);
  }
});

export default router;
