import React from "react";
import { WalletCards } from "lucide-react";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function PortfolioPanel({ portfolio, isHighlighted, className = "" }) {
  return (
    <div className={`${isHighlighted ? "panel highlighted-panel" : "panel"} ${className}`.trim()}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Portfolio tracking</p>
          <h2>Holdings</h2>
        </div>
        <WalletCards size={20} />
      </div>

      {!portfolio?.holdings?.length ? (
        <div className="empty-state">No positions yet. Buy a stock to start tracking P/L.</div>
      ) : (
        <div className="holding-list">
          {portfolio.holdings.map((holding) => (
            <article className="holding-row" key={holding.symbol}>
              <div>
                <strong>{holding.symbol}</strong>
                <span>{holding.quantity} shares at {money.format(holding.averageCost)}</span>
              </div>
              <div>
                <strong>{money.format(holding.marketValue)}</strong>
                <span className={holding.unrealizedPnl >= 0 ? "positive" : "negative"}>
                  {money.format(holding.unrealizedPnl)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default PortfolioPanel;
