// POST /api/create-checkout
// Creates a Stripe Checkout Session for a supported product.
//
// Dispatches on `product` in the request body:
//   - 'aibi-p' (default if absent for backwards compatibility) — AiBI-P course
//       individual: $295/seat (STRIPE_AIBIP_PRICE_ID)
//       institution: $199/seat × N (STRIPE_AIBIP_INSTITUTION_PRICE_ID), min 10
//       persistent discount via discount_locked institutions (PAY-03)
//   - 'indepth-assessment' — paid In-Depth Assessment
//       individual: $99 single seat (STRIPE_INDEPTH_ASSESSMENT_PRICE_ID)
//       institution: $79/seat × N (STRIPE_INDEPTH_ASSESSMENT_VOLUME_PRICE_ID), min 10
//       leader_email always required; allow_promotion_codes always true
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
const MIN_INSTITUTION_QUANTITY = 10;

interface CheckoutBody {
  product?: unknown;
  mode?: unknown;
  quantity?: unknown;
  institution_name?: unknown;
  user_email?: unknown;
  leader_email?: unknown;
}

type CheckoutMode = 'individual' | 'institution';

function getOrigin(request: Request): string {
  const host = request.headers.get('host') ?? 'aibankinginstitute.com';
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

function badRequest(error: string): NextResponse {
  return NextResponse.json({ error }, { status: 400 });
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
      .eq('product', 'aibi-p')
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
    return badRequest('Invalid JSON body.');
  }

  // Default product to 'aibi-p' for backwards compatibility — pre-existing
  // callers (the AiBI-P purchase page, server actions, etc.) post without a
  // `product` field and must keep working unchanged.
  const product = body.product === undefined ? 'aibi-p' : body.product;

  if (product === 'aibi-p') return handleAibiP(body, request);
  if (product === 'indepth-assessment') return handleIndepth(body, request);

  return badRequest('product must be "aibi-p" or "indepth-assessment".');
}

// ---------------------------------------------------------------------------
// AiBI-P handler — preserves prior route behavior verbatim
// ---------------------------------------------------------------------------

async function handleAibiP(body: CheckoutBody, request: Request): Promise<NextResponse> {
  const mode = body.mode as CheckoutMode | undefined;

  if (mode !== 'individual' && mode !== 'institution') {
    return badRequest('mode must be "individual" or "institution".');
  }

  if (mode === 'institution') {
    const quantity = typeof body.quantity === 'number' ? body.quantity : NaN;
    if (!Number.isInteger(quantity) || quantity < MIN_INSTITUTION_QUANTITY) {
      return badRequest('Team purchases require quantity >= 10 (integer).');
    }
    if (typeof body.institution_name !== 'string' || body.institution_name.trim().length === 0) {
      return badRequest('institution_name is required for institution purchases.');
    }
  }

  if (body.user_email !== undefined && body.user_email !== null) {
    if (typeof body.user_email !== 'string' || !EMAIL_RE.test(body.user_email)) {
      return badRequest('user_email must be a valid email address.');
    }
  }

  const { STRIPE_AIBIP_PRICE_ID, STRIPE_AIBIP_INSTITUTION_PRICE_ID } = process.env;

  if (!STRIPE_AIBIP_PRICE_ID) {
    console.error('[create-checkout] STRIPE_AIBIP_PRICE_ID is not set.');
    return NextResponse.json({ error: 'Payment system not configured.' }, { status: 503 });
  }

  if (mode === 'institution' && !STRIPE_AIBIP_INSTITUTION_PRICE_ID) {
    console.error('[create-checkout] STRIPE_AIBIP_INSTITUTION_PRICE_ID is not set.');
    return NextResponse.json({ error: 'Payment system not configured.' }, { status: 503 });
  }

  const origin = getOrigin(request);
  const userEmail = typeof body.user_email === 'string' ? body.user_email : undefined;

  try {
    const stripe = await getStripe();

    if (mode === 'individual') {
      // PAY-03: persistent discount check.
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
        success_url: `${origin}/courses/aibi-p?enrolled=true`,
        cancel_url: `${origin}/courses/aibi-p/purchase`,
        metadata: {
          product: 'aibi-p',
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
      success_url: `${origin}/courses/aibi-p?enrolled=true`,
      cancel_url: `${origin}/courses/aibi-p/purchase`,
      metadata: {
        product: 'aibi-p',
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

// ---------------------------------------------------------------------------
// In-Depth Assessment handler
// ---------------------------------------------------------------------------

async function handleIndepth(body: CheckoutBody, request: Request): Promise<NextResponse> {
  // leader_email is always required for indepth-assessment (used for token issuance,
  // results email, and metadata for provisioning in the webhook).
  if (typeof body.leader_email !== 'string' || !EMAIL_RE.test(body.leader_email)) {
    return badRequest('leader_email is required and must be a valid email address.');
  }
  const leaderEmail = body.leader_email;

  const mode = body.mode as CheckoutMode | undefined;
  if (mode !== 'individual' && mode !== 'institution') {
    return badRequest('mode must be "individual" or "institution".');
  }

  let institutionName: string | undefined;
  let quantity = 1;

  if (mode === 'institution') {
    const q = typeof body.quantity === 'number' ? body.quantity : NaN;
    if (!Number.isInteger(q) || q < MIN_INSTITUTION_QUANTITY) {
      return badRequest('Institution mode requires quantity >= 10 (integer).');
    }
    if (typeof body.institution_name !== 'string' || body.institution_name.trim().length === 0) {
      return badRequest('institution_name is required for institution purchases.');
    }
    quantity = q;
    institutionName = body.institution_name.trim();
  }

  const priceId =
    mode === 'individual'
      ? process.env.STRIPE_INDEPTH_ASSESSMENT_PRICE_ID
      : process.env.STRIPE_INDEPTH_ASSESSMENT_VOLUME_PRICE_ID;

  if (!priceId) {
    console.error(
      `[create-checkout] STRIPE_INDEPTH_ASSESSMENT_${mode === 'individual' ? '' : 'VOLUME_'}PRICE_ID is not set.`
    );
    return NextResponse.json({ error: 'Payment system not configured.' }, { status: 503 });
  }

  const origin = getOrigin(request);

  try {
    const stripe = await getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity }],
      allow_promotion_codes: true,
      customer_email: leaderEmail,
      success_url:
        mode === 'institution'
          ? `${origin}/assessment/in-depth/dashboard?session={CHECKOUT_SESSION_ID}`
          : `${origin}/assessment/in-depth/take?from=checkout&session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/assessment/in-depth`,
      metadata: {
        product: 'indepth-assessment',
        mode,
        quantity: String(quantity),
        leader_email: leaderEmail,
        ...(institutionName ? { institution_name: institutionName } : {}),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[create-checkout] Stripe error (indepth-assessment):', err);
    return NextResponse.json({ error: 'Payment error. Please try again.' }, { status: 500 });
  }
}
