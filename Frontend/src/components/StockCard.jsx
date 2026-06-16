import React from "react";
import { formatCurrency } from "../utils/formatCurrency.js";

function StockCard({ stock }) {
  if (!stock) return null;
  return (
    <article className="stat-card">
      <span>{stock.symbol}</span>
      <strong>{formatCurrency(stock.price)}</strong>
    </article>
  );
}

export default StockCard;
