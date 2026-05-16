// Recover the buyer's email from a Stripe Checkout Session id.
//
// Used by post-purchase pages to pre-fill auth forms so a buyer who paid
// with email X doesn't have to type X again on /auth/signup. The Stripe
// success_url appends ?session_id={CHECKOUT_SESSION_ID}; this helper reads
// that id back and asks Stripe for the customer email.
//
// Returns null on any error — caller should fall back gracefully (the
// auth form simply renders empty instead of pre-filled).
//
// Server-only. Uses STRIPE_SECRET_KEY.

export async function getSessionEmail(sessionId: string | undefined): Promise<string | null> {
  if (!sessionId || typeof sessionId !== 'string') return null;
  if (!sessionId.startsWith('cs_')) return null;
  if (!process.env.STRIPE_SECRET_KEY) return null;

  try {
    const { stripe } = await import('@/lib/stripe');
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return (
      session.customer_details?.email ??
      session.customer_email ??
      (typeof session.metadata?.user_email === 'string'
        ? session.metadata.user_email
        : null)
    );
  } catch (err) {
    console.warn('[stripe/get-session-email] retrieve failed:', err);
    return null;
  }
}
