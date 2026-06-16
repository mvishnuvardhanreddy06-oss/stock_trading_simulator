import React from "react";

const indexData = [
  { label: "Default Capital", value: "$100,000.00", change: "Practice mode" },
  { label: "Live Feed", value: "AAPL Tickers", change: "Simulated" },
  { label: "Order Policy", value: "Market Match", change: "Instant fill" },
  { label: "Risk Engine", value: "Portfolio P&L", change: "Live analytics" }
];

function MarketTicker() {
  return (
    <section className="market-ticker" aria-label="Market indexes">
      {indexData.map((item) => (
        <article className="ticker-item" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <small>{item.change}</small>
        </article>
      ))}
    </section>
  );
}

export default MarketTicker;
