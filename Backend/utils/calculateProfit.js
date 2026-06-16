export function calculateUnrealizedPnl({ price, quantity, averageCost }) {
  return Number(((price - averageCost) * quantity).toFixed(2));
}

export function calculateRealizedPnl({ price, quantity, averageCost }) {
  return Number(((price - averageCost) * quantity).toFixed(2));
}
