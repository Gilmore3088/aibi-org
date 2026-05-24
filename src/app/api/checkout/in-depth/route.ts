// POST /api/checkout/in-depth
// Creates a Stripe Checkout Session for the In-Depth AI Readiness Assessment.
//
// Phase 1: individual purchase only ($99 — STRIPE_INDEPTH_PRICE_ID).
// Institution/team mode ($79 × N seats) is deferred — the seat-grant
// semantics for the assessment are different from AiBI-Foundation and want their
// own table; until that lands, return 503 with a contact-us nudge.
//
// On payment, /api/webhooks/stripe sees product='in-depth-assessment' in
// metadata and inserts a course_enrollments row that grants access to the
// 48-question assessment.

import { NextResponse } from 'next/server';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';

async function getStripe() {
  const { stripe } = await import('@/lib/stripe');
  return stripe;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CheckoutBody {
  mode?: unknown;
  user_email?: unknown;
  // Trust boundary: these fields are buyer-supplied claims from the
  // free-flow EmailGate hand-off, not verified identity. They round-trip
  // through Stripe Session metadata so the post-Stripe signup form can
  // prefill them. Self-attack only (the buyer's own session) — no
  // cross-user vector — but sanitize length / control chars below before
  // letting them into metadata.
  full_name?: unknown;
  /** @deprecated wire-name retained for one release while older clients
   *  may still send `first_name`. Newer clients send `full_name`. */
  first_name?: unknown;
  institution_name?: unknown;
}

function sanitizeIdentityField(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > max) return undefined;
  // Strip control characters; Stripe metadata is a JSON dictionary and
  // any string is allowed, but we don't want to round-trip newlines.
  return trimmed.replace(/[\r\n\t]+/g, ' ');
}

type CheckoutMode = 'individual' | 'institution';

function getOrigin(request: Request): string {
  const host = request.headers.get('host') ?? 'aibankinginstitute.com';
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export async function POST(request: Request) {
  const limited = await rateLimitOrFail({
    key: 'checkout-in-depth',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 20,
    windowSeconds: 3600,
  });
  if (limited) return limited;

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const mode = body.mode as CheckoutMode | undefined;

  if (mode !== 'individual' && mode !== 'institution') {
    return NextResponse.json(
      { error: 'mode must be "individual" or "institution".' },
      { status: 400 },
    );
  }

  if (mode === 'institution') {
    return NextResponse.json(
      {
        error:
          'Institution pricing for the In-Depth Assessment is coming soon. Email hello@aibankinginstitute.com for bulk orders of 10+ seats.',
      },
      { status: 503 },
    );
  }

  if (body.user_email !== undefined && body.user_email !== null) {
    if (typeof body.user_email !== 'string' || !EMAIL_RE.test(body.user_email)) {
      return NextResponse.json(
        { error: 'user_email must be a valid email address.' },
        { status: 400 },
      );
    }
  }

  const { STRIPE_INDEPTH_PRICE_ID } = process.env;
  if (!STRIPE_INDEPTH_PRICE_ID) {
    console.error('[checkout/in-depth] STRIPE_INDEPTH_PRICE_ID is not set.');
    return NextResponse.json(
      { error: 'Payment system not configured.' },
      { status: 503 },
    );
  }

  const origin = getOrigin(request);
  const userEmail = typeof body.user_email === 'string' ? body.user_email : undefined;
  const fullName =
    sanitizeIdentityField(body.full_name, 80) ??
    sanitizeIdentityField(body.first_name, 80);
  const institutionName = sanitizeIdentityField(body.institution_name, 120);

  try {
    const stripe = await getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: STRIPE_INDEPTH_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/assessment/in-depth/purchased?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/assessment/in-depth`,
      metadata: {
        product: 'in-depth-assessment',
        mode: 'individual',
        tier: 'individual',
        ...(userEmail ? { user_email: userEmail } : {}),
        // Forward identity captured at the free-flow EmailGate so the
        // post-payment signup form can prefill name + institution. Read
        // back on /assessment/in-depth/purchased via the Stripe session
        // metadata. The webhook also reads `full_name` to enrich the
        // auth user's user_metadata on create (see /api/webhooks/stripe).
        ...(fullName ? { full_name: fullName } : {}),
        ...(institutionName ? { institution_name: institutionName } : {}),
      },
      ...(userEmail ? { customer_email: userEmail } : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[checkout/in-depth] Stripe error:', err);
    return NextResponse.json(
      { error: 'Payment error. Please try again.' },
      { status: 500 },
    );
  }
}
