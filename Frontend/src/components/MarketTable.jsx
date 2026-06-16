import React from "react";
import { Star } from "lucide-react";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function MarketTable({ stocks, selectedSymbol, onSelect, isLoading, watchlist, onToggleWatchlist }) {
  if (isLoading) {
    return <div className="empty-state">Loading market data...</div>;
  }

  if (!stocks.length) {
    return <div className="empty-state">No matching stocks found.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>Sector</th>
            <th>Price</th>
            <th>Change</th>
            <th>High</th>
            <th>Low</th>
            <th>Volume</th>
            <th>Watch</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => {
            const change = stock.price - stock.previousClose;
            const tone = change >= 0 ? "positive" : "negative";

            return (
              <tr
                className={stock.symbol === selectedSymbol ? "selected-row" : ""}
                key={stock.symbol}
                onClick={() => onSelect(stock.symbol)}
              >
                <td>
                  <strong>{stock.symbol}</strong>
                </td>
                <td>{stock.name}</td>
                <td>{stock.sector}</td>
                <td>{money.format(stock.price)}</td>
                <td className={tone}>{change >= 0 ? "+" : ""}{change.toFixed(2)}</td>
                <td>{money.format(stock.high || Math.max(stock.price, stock.previousClose))}</td>
                <td>{money.format(stock.low || Math.min(stock.price, stock.previousClose))}</td>
                <td>{new Intl.NumberFormat("en-US", { notation: "compact" }).format(stock.volume || 0)}</td>
                <td>
                  <button
                    className={watchlist.includes(stock.symbol) ? "icon-button active" : "icon-button"}
                    type="button"
                    aria-label={`${watchlist.includes(stock.symbol) ? "Remove" : "Add"} ${stock.symbol} watchlist`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleWatchlist(stock.symbol);
                    }}
                  >
                    <Star size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default MarketTable;
