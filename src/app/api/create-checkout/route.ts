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
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

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

/**
 * Check whether the given email belongs to an institution with discount_locked=true.
 * Returns true if a persistent discount applies.
 */
async function hasLockedInstitutionDiscount(email: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('course_enrollments')
      .select('institution_enrollment_id, institution_enrollments!inner(discount_locked)')
      .eq('email', email)
      .in('product', ['aibi-p', 'foundation'])
      .limit(1);

    if (error || !data || data.length === 0) return false;

    const row = data[0] as unknown as {
      institution_enrollment_id: string | null;
      institution_enrollments: { discount_locked: boolean } | null;
    };

    return row.institution_enrollments?.discount_locked === true;
  } catch {
    // Non-fatal — fall through to individual pricing
    return false;
  }
}

export async function POST(request: Request) {
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
  const STRIPE_AIBIP_PRICE_ID =
    process.env.STRIPE_FOUNDATION_PRICE_ID ?? process.env.STRIPE_AIBIP_PRICE_ID;
  const STRIPE_AIBIP_INSTITUTION_PRICE_ID =
    process.env.STRIPE_FOUNDATION_INSTITUTION_PRICE_ID ??
    process.env.STRIPE_AIBIP_INSTITUTION_PRICE_ID;

  if (!STRIPE_AIBIP_PRICE_ID) {
    console.error('[create-checkout] STRIPE_FOUNDATION_PRICE_ID (or legacy STRIPE_AIBIP_PRICE_ID) is not set.');
    return NextResponse.json({ error: 'Payment system not configured.' }, { status: 503 });
  }

  if (mode === 'institution' && !STRIPE_AIBIP_INSTITUTION_PRICE_ID) {
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
      let priceId = STRIPE_AIBIP_PRICE_ID;
      let discountApplied: string | undefined;

      if (userEmail && STRIPE_AIBIP_INSTITUTION_PRICE_ID) {
        const locked = await hasLockedInstitutionDiscount(userEmail);
        if (locked) {
          priceId = STRIPE_AIBIP_INSTITUTION_PRICE_ID;
          discountApplied = 'institution_persistent';
        }
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${origin}/courses/foundation/program/purchased`,
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
      });

      return NextResponse.json({ url: session.url });
    }

    // Institution mode (PAY-02)
    const quantity = body.quantity as number;
    const institutionName = (body.institution_name as string).trim();

    if (!STRIPE_AIBIP_INSTITUTION_PRICE_ID) {
      return NextResponse.json({ error: 'Payment system not configured.' }, { status: 503 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: STRIPE_AIBIP_INSTITUTION_PRICE_ID, quantity }],
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
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[create-checkout] Stripe error:', err);
    return NextResponse.json({ error: 'Payment error. Please try again.' }, { status: 500 });
  }
}
