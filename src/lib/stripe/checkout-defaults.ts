// Shared Checkout Session defaults — used by /api/create-checkout and
// /api/checkout/in-depth so the two SKUs can't drift on payment-method
// strategy or idempotency.
//
// PAYMENT METHODS: The Stripe-recommended pattern is dynamic payment
// methods (DPM) — let the Dashboard's payment_method_configurations
// decide which methods are eligible per session. Hardcoding
// payment_method_types: ['card'] disables DPM entirely and locks the
// strategy in code (issue #319 used that approach).
//
// We keep the #319 product decision — BNPL (Klarna/Affirm/Afterpay) and
// consumer-fintech rails (Cash App Pay, Amazon Pay, Link enrollment)
// are off-brand for community-bank-staff purchases — but enforce it
// the Stripe-recommended way: excluded_payment_method_types. This lets
// future product decisions (e.g. ACH bank debits for $295 buyers) be
// flipped on from the Dashboard without a code change.

import type Stripe from 'stripe';

/**
 * Payment-method exclusions that match the #319 product decision.
 * Anything NOT listed here can be enabled per session from the
 * Dashboard's payment_method_configurations. Default-on rails on
 * card-only fintechs and BNPL stay off.
 *
 * Cast through the Stripe types — the field exists on the API surface
 * but isn't yet typed in every minor of stripe-node.
 */
// The set tracks the #319 product reasoning explicitly: BNPL is off-brand
// for a community-bank-staff purchase, consumer-fintech rails don't fit
// the buyer, and the "US bank with promo badge" call-out in CLAUDE.md
// excludes us_bank_account. Crypto is off-brand for the category.
//
// (Stripe Link's "Save my information" toggle is handled separately via
// saved_payment_method_options.payment_method_save = 'disabled' — that's
// a different axis than Link-as-a-payment-method, which is not in the
// Checkout excluded_payment_method_types enum at this API version.)
export const EXCLUDED_PAYMENT_METHODS = [
  'klarna',
  'affirm',
  'afterpay_clearpay',
  'cashapp',
  'amazon_pay',
  'paypal',
  'us_bank_account',
  'crypto',
] as const;

/**
 * Build a deterministic Stripe idempotency key for a Checkout Session
 * create. Same email + product + (line-item shape) submitted twice
 * within the same minute returns the SAME session — protects against
 * double-clicked CTAs and client-side network retries.
 *
 * A coarser-than-instant time bucket (60s) means a user who *intentionally*
 * retries after a minute gets a fresh session, which is the desired UX
 * (the prior session may have expired client-side, the user may have
 * changed their mind, etc.). Stripe enforces idempotency for 24h, so the
 * bucket is purely about deduping near-simultaneous duplicates.
 */
export function checkoutIdempotencyKey(parts: {
  product: string;
  email?: string;
  quantity?: number;
}): string {
  const minute = Math.floor(Date.now() / 60_000);
  const email = parts.email?.toLowerCase() ?? 'anon';
  const qty = parts.quantity ?? 1;
  return `checkout:${parts.product}:${email}:${qty}:${minute}`;
}

/**
 * Spread into stripe.checkout.sessions.create params.
 * The Stripe SDK at this API version types
 * excluded_payment_method_types as the ExcludedPaymentMethodType enum.
 */
export function dynamicPaymentMethodDefaults(): Pick<
  Stripe.Checkout.SessionCreateParams,
  'excluded_payment_method_types'
> {
  return {
    excluded_payment_method_types: [
      ...EXCLUDED_PAYMENT_METHODS,
    ] as Stripe.Checkout.SessionCreateParams.ExcludedPaymentMethodType[],
  };
}
