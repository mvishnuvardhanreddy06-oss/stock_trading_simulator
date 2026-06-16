import { Stock } from "../models/StockModel.js";

const seedStocks = [
  { symbol: "AAPL", name: "Apple", sector: "Technology", price: 188.42 },
  { symbol: "MSFT", name: "Microsoft", sector: "Technology", price: 421.74 },
  { symbol: "NVDA", name: "Nvidia", sector: "Semiconductors", price: 924.79 },
  { symbol: "GOOGL", name: "Alphabet Class A", sector: "Communication", price: 174.36 },
  { symbol: "GOOG", name: "Alphabet Class C", sector: "Communication", price: 175.12 },
  { symbol: "AMZN", name: "Amazon", sector: "Consumer", price: 182.41 },
  { symbol: "META", name: "Meta Platforms", sector: "Communication", price: 501.18 },
  { symbol: "TSLA", name: "Tesla", sector: "Automotive", price: 176.29 },
  { symbol: "AVGO", name: "Broadcom", sector: "Semiconductors", price: 1386.22 },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Semiconductors", price: 160.43 },
  { symbol: "NFLX", name: "Netflix", sector: "Communication", price: 642.19 },
  { symbol: "ORCL", name: "Oracle", sector: "Technology", price: 124.36 },
  { symbol: "CRM", name: "Salesforce", sector: "Technology", price: 252.18 },
  { symbol: "ADBE", name: "Adobe", sector: "Technology", price: 475.12 },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Financials", price: 198.33 },
  { symbol: "BAC", name: "Bank of America", sector: "Financials", price: 39.44 },
  { symbol: "V", name: "Visa", sector: "Financials", price: 278.55 },
  { symbol: "MA", name: "Mastercard", sector: "Financials", price: 456.82 },
  { symbol: "UNH", name: "UnitedHealth", sector: "Healthcare", price: 520.91 },
  { symbol: "LLY", name: "Eli Lilly", sector: "Healthcare", price: 885.15 },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", price: 148.72 },
  { symbol: "XOM", name: "Exxon Mobil", sector: "Energy", price: 113.88 },
  { symbol: "CVX", name: "Chevron", sector: "Energy", price: 156.21 },
  { symbol: "WMT", name: "Walmart", sector: "Consumer Staples", price: 67.48 },
  { symbol: "COST", name: "Costco", sector: "Consumer Staples", price: 824.11 },
  { symbol: "KO", name: "Coca-Cola", sector: "Consumer Staples", price: 61.41 },
  { symbol: "PEP", name: "PepsiCo", sector: "Consumer Staples", price: 172.65 },
  { symbol: "DIS", name: "Disney", sector: "Consumer", price: 112.84 },
  { symbol: "NKE", name: "Nike", sector: "Consumer", price: 94.37 },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", sector: "ETF", price: 526.62 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", sector: "ETF", price: 449.94 },
  { symbol: "DIA", name: "SPDR Dow Jones ETF", sector: "ETF", price: 390.2 }
];

function buildInitialHistory(price) {
  const now = Date.now();
  const points = [];
  let previousClose = price * 0.985;

  for (let index = 47; index >= 0; index -= 1) {
    const drift = (Math.sin(index / 3) * 0.004) + ((index % 5) - 2) * 0.0015;
    const open = previousClose;
    const close = Math.max(1, open * (1 + drift));
    const spread = Math.max(Math.abs(close - open), close * 0.004);
    const high = Math.max(open, close) + spread * 0.7;
    const low = Math.max(0.5, Math.min(open, close) - spread * 0.7);
    const volume = Math.round(750000 + (48 - index) * 32000 + Math.abs(drift) * 90000000);

    points.push({
      price: Number(close.toFixed(2)),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
      at: new Date(now - index * 30 * 60 * 1000)
    });
    previousClose = close;
  }

  return points;
}

export async function ensureSeedData() {
  const seedSymbols = seedStocks.map((stock) => stock.symbol);
  await Stock.deleteMany({ symbol: { $nin: seedSymbols } });

  await Promise.all(
    seedStocks.map((stock) =>
      Stock.findOneAndUpdate(
        { symbol: stock.symbol },
        {
          $setOnInsert: {
            ...stock,
            previousClose: stock.price,
            open: stock.price,
            high: Number((stock.price * 1.01).toFixed(2)),
            low: Number((stock.price * 0.99).toFixed(2)),
            volume: 1000000,
            history: buildInitialHistory(stock.price)
          }
        },
        { upsert: true, new: true }
      )
    )
  );

}

export async function tickMarket() {
  const stocks = await Stock.find();

  await Promise.all(
    stocks.map((stock) => {
      const drift = (Math.random() - 0.48) * 0.018;
      const open = stock.price;
      const nextPrice = Math.max(1, stock.price * (1 + drift));
      const spread = Math.max(Math.abs(nextPrice - open), nextPrice * 0.003);
      const high = Math.max(open, nextPrice) + spread * 0.7;
      const low = Math.max(0.5, Math.min(open, nextPrice) - spread * 0.7);
      const volume = Math.round((stock.volume || 800000) * (0.96 + Math.random() * 0.12));
      const close = Number(nextPrice.toFixed(2));
      const nextHistory = [
        ...stock.history.slice(-79),
        {
          price: close,
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close,
          volume,
          at: new Date()
        }
      ];

      return Stock.updateOne(
        { _id: stock._id },
        {
          $set: {
            previousClose: stock.price,
            price: close,
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            volume,
            history: nextHistory
          }
        }
      );
    })
  );
}
