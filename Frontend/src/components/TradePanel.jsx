import React from "react";
import OrderTicket from "./OrderTicket.jsx";

function TradePanel({ stock, onSubmit }) {
  return (
    <aside className="panel trade-panel" aria-label="Trading panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Order entry</p>
          <h2>Trade {stock?.symbol || ""}</h2>
        </div>
      </div>

      <OrderTicket stock={stock} onSubmit={onSubmit} />
    </aside>
  );
}

export default TradePanel;
