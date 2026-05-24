// Stripe Customer Portal session creator + customer-id lookup.
//
// OPERATOR REQUIREMENT: the Customer Portal must be enabled and
// configured in the Stripe Dashboard (Settings → Billing → Customer
// portal). Until that is done, billingPortal.sessions.create() throws.
//
// We look up the Stripe customer id from any past checkout session
// associated with this learner. Stripe Checkout creates a customer
// implicitly for one-time payments when customer_email is set, so the
// id is on the session under `customer` (string or null on older
// sessions where no customer was attached).

import { stripe } from '@/lib/addie/stripe/client';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';

export interface PortalSessionArgs {
  readonly user_id: string;
  readonly email: string;
  readonly return_url: string;
}

export interface PortalSessionResult {
  readonly url: string;
  readonly customer_id: string;
}

/**
 * Find this learner's Stripe customer id by walking the entitlements
 * table to find a stripe_session_id, then retrieving that session and
 * reading its `customer` field. Falls back to searching Stripe by email
 * if no entitlement-linked session yields a customer.
 */
export async function resolveStripeCustomerId(args: {
  user_id: string;
  email: string;
}): Promise<string | null> {
  const supa = getAddieServiceClient();
  const { data: rows, error } = await supa
    .from('entitlements')
    .select('stripe_session_id')
    .eq('user_id', args.user_id)
    .not('stripe_session_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5);
  if (error) {
    console.warn('[addie/billing/portal] entitlement lookup failed:', error.message);
  }
  const sessionIds = (rows ?? [])
    .map((r) => (r as { stripe_session_id: string | null }).stripe_session_id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  for (const sid of sessionIds) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sid);
      const customer = typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id ?? null;
      if (customer) return customer;
    } catch (err) {
      console.warn(
        '[addie/billing/portal] session retrieve failed:',
        sid,
        (err as Error).message,
      );
    }
  }

  // Fallback: Stripe customer search by email. Requires the search
  // feature, available in all live + test accounts.
  try {
    const search = await stripe.customers.search({
      query: `email:'${args.email.replace(/'/g, "\\'")}'`,
      limit: 1,
    });
    if (search.data.length > 0) return search.data[0].id;
  } catch (err) {
    console.warn('[addie/billing/portal] customer search failed:', (err as Error).message);
  }
  return null;
}

export async function createPortalSession(
  args: PortalSessionArgs,
): Promise<PortalSessionResult | { error: string }> {
  const customer_id = await resolveStripeCustomerId({
    user_id: args.user_id,
    email: args.email,
  });
  if (!customer_id) return { error: 'no_stripe_customer' };

  const session = await stripe.billingPortal.sessions.create({
    customer: customer_id,
    return_url: args.return_url,
  });
  if (!session.url) {
    return { error: 'no_portal_url' };
  }
  return { url: session.url, customer_id };
}
