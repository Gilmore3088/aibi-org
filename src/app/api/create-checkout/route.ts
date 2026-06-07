// POST /api/create-checkout
// Creates a Stripe Checkout Session for AiBI-Foundation course purchase.
//
// Individual mode: $295/seat (STRIPE_FOUNDATION_PRICE_ID, fallback STRIPE_AIBIP_PRICE_ID)
// Institution/team mode: $199/seat x quantity (STRIPE_FOUNDATION_INSTITUTION_PRICE_ID,
// fallback STRIPE_AIBIP_INSTITUTION_PRICE_ID), min 10 seats
//
// Persistent discount: if an individual buyer's email is associated with an institution
// that has discount_locked=true, they get the institution price automatically (PAY-03).
//
// Returns: { url: string } — the Stripe-hosted Checkout URL for client-side redirect.
// Errors: 400 for validation, 503 for missing config, 500 for Stripe errors.

import { NextResponse } from 'next/server';
import { hasLockedInstitutionDiscount } from '@/lib/stripe/institution-discount';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';
import {
  checkoutIdempotencyKey,
  dynamicPaymentMethodDefaults,
} from '@/lib/stripe/checkout-defaults';

// Lazy-import the stripe singleton so the module-level throw only fires
// when the route is actually invoked, not at build time.
async function getStripe() {
  const { stripe } = await import('@/lib/stripe');
  return stripe;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CheckoutBody {
  mode?: unknown;
  quantity?: unknown;
  institution_name?: unknown;
  user_email?: unknown;
}

type CheckoutMode = 'individual' | 'institution';

function getOrigin(request: Request): string {
  const host = request.headers.get('host') ?? 'aibankinginstitute.com';
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}


export async function POST(request: Request) {
  const limited = await rateLimitOrFail({
    key: 'create-checkout',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 20,
    windowSeconds: 3600,
  });
  if (limited) return limited;

  // Parse body
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const mode = body.mode as CheckoutMode | undefined;

  // Validate mode
  if (mode !== 'individual' && mode !== 'institution') {
    return NextResponse.json(
      { error: 'mode must be "individual" or "institution".' },
      { status: 400 }
    );
  }

  // Validate institution-specific fields
  if (mode === 'institution') {
    const quantity = typeof body.quantity === 'number' ? body.quantity : NaN;
    if (!Number.isInteger(quantity) || quantity < 10) {
      return NextResponse.json(
        { error: 'Team purchases require quantity >= 10 (integer).' },
        { status: 400 }
      );
    }
    if (typeof body.institution_name !== 'string' || body.institution_name.trim().length === 0) {
      return NextResponse.json(
        { error: 'institution_name is required for institution purchases.' },
        { status: 400 }
      );
    }
  }

  // Validate user_email format when provided
  if (body.user_email !== undefined && body.user_email !== null) {
    if (typeof body.user_email !== 'string' || !EMAIL_RE.test(body.user_email)) {
      return NextResponse.json({ error: 'user_email must be a valid email address.' }, { status: 400 });
    }
  }

  // Check required environment variables.
  // Phase 5 (2026-05-10): expand/contract rename of STRIPE_AIBIP_* -> STRIPE_FOUNDATION_*.
  // Code reads new var first, falls back to old name. Phase 5a: both vars set in Vercel
  // (same value). Phase 5b: code stops checking the legacy var. Phase 5c: legacy var
  // removed from Vercel.
  //
  // 2026-05-16: also accept STRIPE_FOUNDATIONS_* (plural) — that's the name
  // currently set in Vercel. The plural form was a one-letter typo when the
  // env var was created; cheaper to read both names than to ask the operator
  // to rename in the Vercel dashboard.
  // SHIM #4 — do NOT remove the process.env.STRIPE_AIBIP_* fallback tail.
  // Prod Vercel currently holds the plural STRIPE_FOUNDATIONS_* name, and
  // some setups may still carry the original STRIPE_AIBIP_*; both are read
  // as fallbacks so live checkout never 503s on an env-name mismatch. The
  // local consts use the canonical "foundation" name.
  const foundationPriceId =
    process.env.STRIPE_FOUNDATION_PRICE_ID ??
    process.env.STRIPE_FOUNDATIONS_PRICE_ID ??
    process.env.STRIPE_AIBIP_PRICE_ID;
  const foundationInstitutionPriceId =
    process.env.STRIPE_FOUNDATION_INSTITUTION_PRICE_ID ??
    process.env.STRIPE_FOUNDATIONS_INSTITUTION_PRICE_ID ??
    process.env.STRIPE_AIBIP_INSTITUTION_PRICE_ID;

  if (!foundationPriceId) {
    console.error('[create-checkout] STRIPE_FOUNDATION_PRICE_ID (or legacy STRIPE_AIBIP_PRICE_ID / STRIPE_FOUNDATIONS_PRICE_ID) is not set.');
    return NextResponse.json({ error: 'Payment system not configured.' }, { status: 503 });
  }

  if (mode === 'institution' && !foundationInstitutionPriceId) {
    console.error('[create-checkout] STRIPE_FOUNDATION_INSTITUTION_PRICE_ID (or legacy STRIPE_AIBIP_INSTITUTION_PRICE_ID) is not set.');
    return NextResponse.json({ error: 'Payment system not configured.' }, { status: 503 });
  }

  const origin = getOrigin(request);
  const userEmail = typeof body.user_email === 'string' ? body.user_email : undefined;

  try {
    const stripe = await getStripe();

    if (mode === 'individual') {
      // PAY-03: persistent discount check — if this user is associated with a
      // discount-locked institution, apply institution pricing automatically.
      let priceId = foundationPriceId;
      let discountApplied: string | undefined;

      if (userEmail && foundationInstitutionPriceId) {
        const locked = await hasLockedInstitutionDiscount(userEmail);
        if (locked) {
          priceId = foundationInstitutionPriceId;
          discountApplied = 'institution_persistent';
        }
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        // Issue #319 — BNPL + consumer-fintech rails off-brand for a
        // $295 community-bank-staff product. Implemented as
        // excluded_payment_method_types (Stripe-recommended) instead of
        // payment_method_types: ['card'] so dynamic payment methods stays
        // on and the Dashboard can flip on, e.g., ACH later without a
        // code change. See src/lib/stripe/checkout-defaults.ts.
        ...dynamicPaymentMethodDefaults(),
        // #314 — disable the Stripe Link 'Save my information' toggle.
        // Default-on, the toggle silently requires a phone number to
        // enroll the customer in Link, and the Pay button stays inert
        // until that field is filled. Card-only buyers should not be
        // routed through Link enrollment without opting in.
        // customer_creation:'always' satisfies Stripe's requirement that
        // saved_payment_method_options needs a customer in scope.
        customer_creation: 'always',
        saved_payment_method_options: { payment_method_save: 'disabled' },
        allow_promotion_codes: true,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${origin}/courses/foundation/program/purchased?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/courses/foundation/program/purchase`,
        metadata: {
          // Canonical post-rename slug. Webhook handler accepts both 'aibi-p'
          // (legacy retries) and 'foundation' (new sessions) via normalizeProduct().
          product: 'foundation',
          mode: 'individual',
          tier: 'individual',
          ...(userEmail ? { user_email: userEmail } : {}),
          ...(discountApplied ? { discount_applied: discountApplied } : {}),
        },
        ...(userEmail ? { customer_email: userEmail } : {}),
      }, {
        // Dedupe near-simultaneous duplicate sessions (double-clicked
        // CTA, client network retry). Same buyer + product + minute
        // returns the same session URL.
        idempotencyKey: checkoutIdempotencyKey({
          product: 'foundation-individual',
          email: userEmail,
        }),
      });

      return NextResponse.json({ url: session.url });
    }

    // Institution mode (PAY-02)
    const quantity = body.quantity as number;
    const institutionName = (body.institution_name as string).trim();

    if (!foundationInstitutionPriceId) {
      return NextResponse.json({ error: 'Payment system not configured.' }, { status: 503 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // #319 — same DPM-with-exclusions strategy as individual mode.
      ...dynamicPaymentMethodDefaults(),
      line_items: [{ price: foundationInstitutionPriceId, quantity }],
      success_url: `${origin}/courses/foundation/program?enrolled=true`,
      cancel_url: `${origin}/courses/foundation/program/purchase`,
      metadata: {
        // Canonical post-rename slug; webhook accepts both via normalizeProduct().
        product: 'foundation',
        mode: 'institution',
        tier: 'team',
        institution_name: institutionName,
        quantity: String(quantity),
        ...(userEmail ? { user_email: userEmail } : {}),
      },
      ...(userEmail ? { customer_email: userEmail } : {}),
    }, {
      idempotencyKey: checkoutIdempotencyKey({
        product: 'foundation-institution',
        email: userEmail,
        quantity,
      }),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[create-checkout] Stripe error:', err);
    return NextResponse.json({ error: 'Payment error. Please try again.' }, { status: 500 });
  }
}
