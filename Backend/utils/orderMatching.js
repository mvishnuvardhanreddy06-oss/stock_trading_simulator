import { Order } from "../models/OrderModel.js";
import { Portfolio } from "../models/PortfolioModel.js";
import { Stock } from "../models/StockModel.js";
import { Transaction } from "../models/TransactionModel.js";
import { calculateRealizedPnl } from "./calculateProfit.js";

export async function executeMarketOrder({ side, symbol, quantity, owner }) {
  const normalizedSide = side?.toUpperCase();
  const normalizedSymbol = symbol?.toUpperCase();
  const orderQuantity = Number(quantity);

  if (!["BUY", "SELL"].includes(normalizedSide)) {
    const error = new Error("Order side must be BUY or SELL");
    error.status = 400;
    throw error;
  }

  if (!owner || !normalizedSymbol || !Number.isInteger(orderQuantity) || orderQuantity <= 0) {
    const error = new Error("Provide a stock symbol, user session, and a positive whole-share quantity");
    error.status = 400;
    throw error;
  }

  const stock = await Stock.findOne({ symbol: normalizedSymbol });
  if (!stock) {
    const error = new Error("Stock not found");
    error.status = 404;
    throw error;
  }

  let portfolio = await Portfolio.findOne({ owner });
  if (!portfolio) {
    portfolio = await Portfolio.create({ owner, cash: Number(process.env.STARTING_CASH || 100000), holdings: [] });
  }

  const total = Number((stock.price * orderQuantity).toFixed(2));
  let realizedPnl = 0;

  if (normalizedSide === "BUY") {
    if (portfolio.cash < total) {
      const error = new Error("Not enough cash for this order");
      error.status = 400;
      throw error;
    }

    const holding = portfolio.holdings.find((item) => item.symbol === normalizedSymbol);
    if (holding) {
      const nextQuantity = holding.quantity + orderQuantity;
      holding.averageCost = Number(
        ((holding.averageCost * holding.quantity + total) / nextQuantity).toFixed(2)
      );
      holding.quantity = nextQuantity;
    } else {
      portfolio.holdings.push({
        symbol: normalizedSymbol,
        quantity: orderQuantity,
        averageCost: stock.price
      });
    }

    portfolio.cash = Number((portfolio.cash - total).toFixed(2));
  } else {
    const holding = portfolio.holdings.find((item) => item.symbol === normalizedSymbol);
    if (!holding || holding.quantity < orderQuantity) {
      const error = new Error("Not enough shares to sell");
      error.status = 400;
      throw error;
    }

    realizedPnl = calculateRealizedPnl({
      price: stock.price,
      quantity: orderQuantity,
      averageCost: holding.averageCost
    });
    holding.quantity -= orderQuantity;
    portfolio.cash = Number((portfolio.cash + total).toFixed(2));
    portfolio.realizedPnl = Number((portfolio.realizedPnl + realizedPnl).toFixed(2));
    portfolio.holdings = portfolio.holdings.filter((item) => item.quantity > 0);
  }

  await portfolio.save();
  await Order.create({
    userId: owner,
    side: normalizedSide,
    symbol: normalizedSymbol,
    quantity: orderQuantity,
    status: "FILLED",
    fillPrice: stock.price
  });

  const transaction = await Transaction.create({
    userId: owner,
    side: normalizedSide,
    symbol: normalizedSymbol,
    quantity: orderQuantity,
    price: stock.price,
    total,
    realizedPnl
  });

  return { portfolio, transaction };
}
