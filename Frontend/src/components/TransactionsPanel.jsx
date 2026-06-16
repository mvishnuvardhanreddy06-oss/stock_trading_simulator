import React from "react";
import { ReceiptText } from "lucide-react";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function TransactionsPanel({ transactions, isHighlighted, className = "" }) {
  return (
    <div className={`${isHighlighted ? "panel highlighted-panel" : "panel"} ${className}`.trim()}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Transaction logs</p>
          <h2>Recent Fills</h2>
        </div>
        <ReceiptText size={20} />
      </div>

      {!transactions.length ? (
        <div className="empty-state">Filled orders will appear here.</div>
      ) : (
        <div className="transactions">
          {transactions.map((trade) => (
            <article className="trade-row" key={trade._id}>
              <span className={trade.side === "BUY" ? "badge buy" : "badge sell"}>{trade.side}</span>
              <strong>{trade.symbol}</strong>
              <span>{trade.quantity} @ {money.format(trade.price)}</span>
              <span>{new Date(trade.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionsPanel;
