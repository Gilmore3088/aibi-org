// Validate that a Stripe Checkout session id refers to a real, paid session.
//
// Used by post-purchase pages to gate the "PURCHASE CONFIRMED" affordance.
// Without this, /purchased pages render the success view for any visitor
// regardless of session_id — see issue #321.
//
// Returns the session when it's real and paid, null otherwise.
// Caller is responsible for the redirect/404 decision.
//
// Server-only. Uses STRIPE_SECRET_KEY.

import type Stripe from 'stripe';

export async function getValidatedPaidSession(
  sessionId: string | undefined,
): Promise<Stripe.Checkout.Session | null> {
  if (!sessionId || typeof sessionId !== 'string') return null;
  if (!sessionId.startsWith('cs_')) return null;
  if (!process.env.STRIPE_SECRET_KEY) return null;

  try {
    const { stripe } = await import('@/lib/stripe');
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') return null;
    return session;
  } catch (err) {
    console.warn('[stripe/get-validated-paid-session] retrieve failed:', err);
    return null;
  }
}
