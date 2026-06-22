// POST /api/checkout/team-assessment
// Creates a Stripe Checkout Session for the paid Team Assessment.

import { NextResponse } from 'next/server';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';
import {
  checkoutIdempotencyKey,
  dynamicPaymentMethodDefaults,
} from '@/lib/stripe/checkout-defaults';
import { TEAM_ASSESSMENT_MIN_SEATS } from '@/lib/team-assessment/constants';
import { getTeamAssessmentOrigin } from '@/lib/team-assessment/db';
import { isTeamAssessmentSelfServeEnabled } from '@/lib/team-assessment/self-serve';

async function getStripe() {
  const { stripe } = await import('@/lib/stripe');
  return stripe;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CheckoutBody {
  buyer_email?: unknown;
  institution_name?: unknown;
  quantity?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isTeamAssessmentSelfServeEnabled()) {
    return NextResponse.json(
      { error: 'Team Assessment checkout is assisted-sales only right now.' },
      { status: 403 },
    );
  }

  const limited = await rateLimitOrFail({
    key: 'checkout-team-assessment',
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

  const buyerEmail =
    typeof body.buyer_email === 'string' ? body.buyer_email.trim().toLowerCase() : '';
  const institutionName =
    typeof body.institution_name === 'string' ? body.institution_name.trim() : '';
  const quantity =
    typeof body.quantity === 'number'
      ? body.quantity
      : typeof body.quantity === 'string'
        ? Number.parseInt(body.quantity, 10)
        : NaN;

  if (!EMAIL_RE.test(buyerEmail)) {
    return NextResponse.json(
      { error: 'buyer_email must be a valid email address.' },
      { status: 400 },
    );
  }
  if (institutionName.length < 2) {
    return NextResponse.json(
      { error: 'institution_name is required.' },
      { status: 400 },
    );
  }
  if (!Number.isInteger(quantity) || quantity < TEAM_ASSESSMENT_MIN_SEATS) {
    return NextResponse.json(
      { error: `quantity must be at least ${TEAM_ASSESSMENT_MIN_SEATS}.` },
      { status: 400 },
    );
  }

  const { STRIPE_TEAM_ASSESSMENT_PRICE_ID } = process.env;
  if (!STRIPE_TEAM_ASSESSMENT_PRICE_ID) {
    console.error('[checkout/team-assessment] STRIPE_TEAM_ASSESSMENT_PRICE_ID is not set.');
    return NextResponse.json(
      { error: 'Payment system not configured.' },
      { status: 503 },
    );
  }

  try {
    const stripe = await getStripe();
    const origin = getTeamAssessmentOrigin(request);
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        ...dynamicPaymentMethodDefaults(),
        customer_creation: 'always',
        saved_payment_method_options: { payment_method_save: 'disabled' },
        allow_promotion_codes: true,
        customer_email: buyerEmail,
        line_items: [{ price: STRIPE_TEAM_ASSESSMENT_PRICE_ID, quantity }],
        success_url: `${origin}/assessment/team/purchased?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/assessment/team`,
        metadata: {
          product: 'team-assessment',
          mode: 'institution',
          tier: 'team',
          user_email: buyerEmail,
          institution_name: institutionName,
          quantity: String(quantity),
        },
      },
      {
        idempotencyKey: checkoutIdempotencyKey({
          product: 'team-assessment',
          email: buyerEmail,
          quantity,
        }),
      },
    );

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[checkout/team-assessment] Stripe error:', err);
    return NextResponse.json(
      { error: 'Payment error. Please try again.' },
      { status: 500 },
    );
  }
}
