// Stripe invoice + payment-history list for the /account/billing
// surface. One-time Foundation purchases don't generate Stripe Invoices
// by default (they go through Checkout's "payment" mode, which creates
// PaymentIntents + Charges, not Invoices). We therefore fold both into
// a single timeline: any Invoice the customer has, plus any Charge from
// their one-time Checkout sessions.

import { stripe } from '@/lib/addie/stripe/client';
import type { InvoiceListItem } from './types';
export { formatAmount } from './types';
export type { InvoiceListItem } from './types';

export async function listCustomerInvoices(
  customer_id: string,
): Promise<InvoiceListItem[]> {
  const out: InvoiceListItem[] = [];

  try {
    const invoices = await stripe.invoices.list({ customer: customer_id, limit: 24 });
    for (const inv of invoices.data) {
      out.push({
        id: inv.id ?? '',
        created: inv.created,
        amount_cents: inv.amount_paid ?? inv.amount_due ?? 0,
        currency: (inv.currency ?? 'usd').toLowerCase(),
        status: inv.status ?? 'unknown',
        description: inv.description ?? null,
        hosted_url: inv.hosted_invoice_url ?? null,
        pdf_url: inv.invoice_pdf ?? null,
        source: 'invoice',
      });
    }
  } catch (err) {
    console.warn('[addie/billing/invoices] invoice list failed:', (err as Error).message);
  }

  try {
    const charges = await stripe.charges.list({ customer: customer_id, limit: 24 });
    for (const ch of charges.data) {
      // If a charge is tied to an invoice we already listed it above.
      // Some Stripe API versions expand `invoice` differently; check both.
      const linkedInvoice = (ch as unknown as { invoice?: string | { id?: string } | null })
        .invoice;
      if (linkedInvoice) continue;
      out.push({
        id: ch.id,
        created: ch.created,
        amount_cents: ch.amount,
        currency: (ch.currency ?? 'usd').toLowerCase(),
        status: ch.status ?? (ch.paid ? 'paid' : 'pending'),
        description: ch.description ?? null,
        hosted_url: ch.receipt_url ?? null,
        pdf_url: ch.receipt_url ?? null,
        source: 'charge',
      });
    }
  } catch (err) {
    console.warn('[addie/billing/invoices] charge list failed:', (err as Error).message);
  }

  out.sort((a, b) => b.created - a.created);
  return out;
}

