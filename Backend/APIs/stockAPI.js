import { Router } from "express";
import { Stock } from "../models/StockModel.js";
import { getLiveMarketData } from "../utils/marketAdapter.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const stocks = await Stock.find().sort({ symbol: 1 });
    res.json(stocks);
  } catch (error) {
    next(error);
  }
});

// New live endpoint that returns cached/near-real-time market data
router.get("/live", async (_req, res, next) => {
  try {
    const data = await getLiveMarketData();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
