import React from "react";
import { ShoppingCart, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function OrderTicket({ stock, onSubmit }) {
  const [side, setSide] = useState("BUY");
  const [quantity, setQuantity] = useState(5);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setError("");
  }, [stock?.symbol]);

  async function submitOrder(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit({ side, symbol: stock.symbol, quantity: Number(quantity) });
    } catch (orderError) {
      setError(orderError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel order-ticket" onSubmit={submitOrder}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Order matching</p>
          <h2>Trade Ticket</h2>
        </div>
        <ShoppingCart size={20} />
      </div>

      <div className="stock-focus">
        <div>
          <span>{stock?.symbol || "--"}</span>
          <small>{stock?.name || "Select a stock"}</small>
        </div>
        <strong>{stock ? money.format(stock.price) : "$0.00"}</strong>
      </div>

      <div className="segmented-control">
        <button
          className={side === "BUY" ? "active buy" : ""}
          type="button"
          onClick={() => setSide("BUY")}
          aria-label="Buy"
        >
          <TrendingUp size={17} />
          Buy
        </button>
        <button
          className={side === "SELL" ? "active sell" : ""}
          type="button"
          onClick={() => setSide("SELL")}
          aria-label="Sell"
        >
          <TrendingDown size={17} />
          Sell
        </button>
      </div>

      <label>
        Shares
        <input
          min="1"
          step="1"
          type="number"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />
      </label>

      <div className="order-total">
        <span>Estimated total</span>
        <strong>{money.format((stock?.price || 0) * Number(quantity || 0))}</strong>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="primary-button" disabled={!stock || isSubmitting} type="submit">
        {isSubmitting ? "Sending..." : "Place Order"}
      </button>
    </form>
  );
}

export default OrderTicket;
