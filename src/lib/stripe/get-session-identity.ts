// Recover the buyer's identity (email + firstName + institutionName) from
// a Stripe Checkout Session id. Used by post-purchase pages to prefill
// the signup form so a buyer who already provided this data at the free
// EmailGate doesn't re-type it after paying.
//
// Email source preference: customer_details.email → customer_email →
// session.metadata.user_email. firstName + institutionName come from
// session.metadata which we wrote on the checkout-session create call
// (see /api/checkout/in-depth/route.ts).
//
// Server-only. Uses STRIPE_SECRET_KEY. Returns null fields on any error
// so callers can fall through to empty form fields.

export interface SessionIdentity {
  readonly email: string | null;
  /** Buyer's full name as captured at the free-flow EmailGate. The
   *  field name preserves the legacy `firstName` shape exposed to
   *  /assessment/in-depth/purchased; the underlying Stripe metadata
   *  key is `full_name` (with `first_name` fallback for sessions
   *  created before the rename). */
  readonly firstName: string | null;
  readonly institutionName: string | null;
}

const EMPTY: SessionIdentity = {
  email: null,
  firstName: null,
  institutionName: null,
};

export async function getSessionIdentity(
  sessionId: string | undefined,
): Promise<SessionIdentity> {
  if (!sessionId || typeof sessionId !== 'string') return EMPTY;
  if (!sessionId.startsWith('cs_')) return EMPTY;
  if (!process.env.STRIPE_SECRET_KEY) return EMPTY;

  try {
    const { stripe } = await import('@/lib/stripe');
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadata = (session.metadata ?? {}) as Record<string, unknown>;
    const metadataString = (key: string): string | null => {
      const value = metadata[key];
      return typeof value === 'string' && value.length > 0 ? value : null;
    };

    const email =
      session.customer_details?.email ??
      session.customer_email ??
      metadataString('user_email');

    return {
      email: email ?? null,
      firstName:
        metadataString('full_name') ?? metadataString('first_name'),
      institutionName: metadataString('institution_name'),
    };
  } catch (err) {
    console.warn('[stripe/get-session-identity] retrieve failed:', err);
    return EMPTY;
  }
}
