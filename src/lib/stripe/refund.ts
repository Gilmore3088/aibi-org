// Refund helpers for the Stripe webhook handler.
//
// Stripe fires `charge.refunded` for BOTH partial and full refunds. Access
// revocation must only happen on a FULL refund — a partial refund (a goodwill
// credit, a seat adjustment) must not pull a paid buyer's access.

import type Stripe from 'stripe';

type RefundableCharge = Pick<Stripe.Charge, 'refunded' | 'amount' | 'amount_refunded'>;

/**
 * True only when the charge is fully refunded.
 *
 * Stripe sets `charge.refunded = true` once the charge is fully refunded.
 * As a defensive fallback we also treat amount_refunded >= amount as full,
 * in case the boolean lags on a specific event payload.
 */
export function isFullyRefunded(charge: RefundableCharge): boolean {
  if (charge.refunded === true) return true;
  if (typeof charge.amount === 'number' && charge.amount > 0) {
    return (charge.amount_refunded ?? 0) >= charge.amount;
  }
  return false;
}
