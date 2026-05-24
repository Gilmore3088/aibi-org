// Stripe client singleton — server-only.
// Never import this from Client Components or expose to the browser.
// Uses Stripe SDK v22. API version: 2026-03-25.dahlia.
//
// Lazy init via Proxy: when STRIPE_SECRET_KEY is missing (local dev without
// .env.local, preview without keys, test runners) we defer the throw until
// the FIRST property access on `stripe`. That keeps the throw inside the
// caller's try/catch — e.g. /api/addie/checkout/* — so the route can return
// a proper JSON error instead of an HTML 500 from Next.js's module-load
// error handler. Before this, the route's `body.error` was undefined on the
// client side because the response had no JSON body, and PayOptionCard
// rendered "HTTP 500" with no actionable detail.

import Stripe from 'stripe';

let cached: Stripe | null = null;

function getStripeClient(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add it to .env.local (sk_test_... for dev, sk_live_... for production).',
    );
  }
  cached = new Stripe(key, {
    apiVersion: '2026-03-25.dahlia',
    appInfo: {
      name: 'The AI Banking Institute',
      url: 'https://aibankinginstitute.com',
    },
  });
  return cached;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const client = getStripeClient();
    return Reflect.get(client as unknown as object, prop, receiver);
  },
});

// ============================================================
// Shared metadata type — used by create-checkout and webhook handler
// to ensure consistent key names and value shapes across both sides
// of the Stripe Checkout session lifecycle.
// ============================================================

export interface CheckoutMetadata {
  // 'aibi-p' kept for legacy Stripe webhook retries; new sessions emit 'foundation'.
  // The webhook handler accepts both via normalizeProduct(); see src/lib/products/normalize.ts.
  product: 'aibi-p' | 'foundation' | 'in-depth-assessment';
  mode: 'individual' | 'institution';
  tier?: 'individual' | 'team';
  user_email?: string;
  institution_name?: string;
  /** Number of institution seats, serialised as a string (Stripe metadata values are strings). */
  quantity?: string;
  discount_applied?: 'institution_persistent';
}
