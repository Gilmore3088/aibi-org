// Canonical money formatting. Consolidates ad-hoc `(cents/100).toFixed(2)` and
// inline Intl.NumberFormat currency formatters.

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Format an integer cent amount as USD, e.g. 29500 → "$295.00". */
export function formatCents(cents: number): string {
  return USD.format(cents / 100);
}

/** Format a dollar amount as USD, e.g. 295 → "$295.00". */
export function formatUsd(dollars: number): string {
  return USD.format(dollars);
}
