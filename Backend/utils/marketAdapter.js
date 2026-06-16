import { Stock } from "../models/StockModel.js";

let cache = { timestamp: 0, data: [] };
const REFRESH_MS = Number(process.env.MARKET_REFRESH_MS) || 30000;
const provider = (process.env.MARKET_PROVIDER || "yahoo").toLowerCase();
const apiKey = process.env.MARKET_API_KEY;

async function fetchFromProvider(symbols) {
  try {
    if (provider === "yahoo") {
      const qs = new URLSearchParams({
        symbols: symbols.slice(0, 100).join(","),
        fields: "symbol,regularMarketPrice,regularMarketPreviousClose,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow,regularMarketVolume,marketCap"
      });
      const res = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?${qs.toString()}`, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      if (!res.ok) return null;
      const json = await res.json();
      const quotes = json?.quoteResponse?.result || [];
      return quotes.map((quote) => ({
        symbol: quote.symbol,
        price: Number(quote.regularMarketPrice || 0),
        previousClose: Number(quote.regularMarketPreviousClose || quote.regularMarketPrice || 0),
        open: Number(quote.regularMarketOpen || quote.regularMarketPrice || 0),
        high: Number(quote.regularMarketDayHigh || quote.regularMarketPrice || 0),
        low: Number(quote.regularMarketDayLow || quote.regularMarketPrice || 0),
        volume: Number(quote.regularMarketVolume || 0),
        marketCap: Number(quote.marketCap || 0)
      }));
    }

    if (!apiKey) return null;

    if (provider === "twelvedata") {
      const qs = new URLSearchParams({ symbol: symbols.join(","), apikey: apiKey });
      const res = await fetch(`https://api.twelvedata.com/quote?${qs.toString()}`);
      if (!res.ok) return null;
      const json = await res.json();
      return symbols
        .map((symbol) => {
          const quote = json[symbol] || (json.symbol === symbol ? json : null);
          if (!quote) return null;
          return {
            symbol,
            price: Number(quote.close || quote.price || 0),
            previousClose: Number(quote.previous_close || quote.close || 0),
            open: Number(quote.open || quote.close || 0),
            high: Number(quote.high || quote.close || 0),
            low: Number(quote.low || quote.close || 0),
            volume: Number(quote.volume || 0)
          };
        })
        .filter(Boolean);
    }

    if (provider === "finnhub") {
      const results = [];
      for (const s of symbols.slice(0, 50)) {
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(s)}&token=${apiKey}`);
        if (!res.ok) continue;
        const j = await res.json();
        results.push({
          symbol: s,
          price: Number(j.c || 0),
          previousClose: Number(j.pc || j.c || 0),
          high: Number(j.h || j.c || 0),
          low: Number(j.l || j.c || 0),
          open: Number(j.o || j.c || 0),
          volume: Number(j.v || 0)
        });
      }
      return results;
    }
  } catch (err) {
    console.error("marketAdapter provider fetch failed:", err?.message || err);
    return null;
  }

  return null;
}

export async function getLiveMarketData() {
  const now = Date.now();
  if (now - cache.timestamp < REFRESH_MS && cache.data && cache.data.length) return cache.data;

  // Refresh cached data
  try {
    const stocks = await Stock.find().sort({ symbol: 1 }).lean();
    const symbols = stocks.map((s) => s.symbol).slice(0, 100);

    const providerData = await fetchFromProvider(symbols);

    const merged = stocks.map((s) => {
      const p = providerData ? providerData.find((d) => d.symbol === s.symbol) : null;
      const price = p?.price || s.price;
      const previousClose = p?.previousClose || s.previousClose || price;
      const latestHistory = s.history?.slice(-1)[0];
      return {
        symbol: s.symbol,
        name: s.name,
        sector: s.sector,
        price,
        previousClose,
        open: p?.open || s.open || previousClose,
        high: p?.high || s.high || price,
        low: p?.low || s.low || price,
        volume: p?.volume || s.volume || latestHistory?.volume || 0,
        marketCap: p?.marketCap || s.marketCap || 0,
        history: s.history || []
      };
    });

    cache = { timestamp: Date.now(), data: merged };
    return merged;
  } catch (err) {
    console.error("marketAdapter refresh failed:", err?.message || err);
    return cache.data || [];
  }
}
