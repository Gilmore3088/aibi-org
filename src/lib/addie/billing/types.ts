// Stripe-free types + formatters for the billing pages. Kept in a
// separate module so server components can render without importing the
// Stripe client (which throws at import time if STRIPE_SECRET_KEY is
// missing — common on previews and local dev).

export interface InvoiceListItem {
  readonly id: string;
  readonly created: number;
  readonly amount_cents: number;
  readonly currency: string;
  readonly status: string;
  readonly description: string | null;
  readonly hosted_url: string | null;
  readonly pdf_url: string | null;
  readonly source: 'invoice' | 'charge';
}

export function formatAmount(cents: number, currency: string): string {
  const amt = (cents / 100).toFixed(2);
  return `${currency.toUpperCase()} ${amt}`;
}
