import { Router } from "express";
import { Portfolio } from "../models/PortfolioModel.js";
import { Stock } from "../models/StockModel.js";
import { calculateUnrealizedPnl } from "../utils/calculateProfit.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const owner = req.user.id;
    const portfolio = await Portfolio.findOneAndUpdate(
      { owner },
      { $setOnInsert: { cash: Number(process.env.STARTING_CASH || 100000), holdings: [] } },
      { upsert: true, new: true }
    );
    const stocks = await Stock.find();
    const priceBySymbol = new Map(stocks.map((stock) => [stock.symbol, stock.price]));

    const holdings = portfolio.holdings.map((holding) => {
      const price = priceBySymbol.get(holding.symbol) || 0;
      const marketValue = Number((price * holding.quantity).toFixed(2));
      return {
        symbol: holding.symbol,
        quantity: holding.quantity,
        averageCost: holding.averageCost,
        price,
        marketValue,
        unrealizedPnl: calculateUnrealizedPnl({ price, quantity: holding.quantity, averageCost: holding.averageCost })
      };
    });

    const holdingsValue = Number(
      holdings.reduce((sum, holding) => sum + holding.marketValue, 0).toFixed(2)
    );

    res.json({
      cash: portfolio.cash,
      realizedPnl: portfolio.realizedPnl,
      holdings,
      holdingsValue,
      totalEquity: Number((portfolio.cash + holdingsValue).toFixed(2)),
      unrealizedPnl: Number(
        holdings.reduce((sum, holding) => sum + holding.unrealizedPnl, 0).toFixed(2)
      )
    });
  } catch (error) {
    next(error);
  }
});

export default router;
