// POST /api/webhooks/stripe
// Handles Stripe webhook events for AiBI-P course enrollment provisioning.
//
// Security: Every request is verified via stripe.webhooks.constructEvent before
// any processing occurs. Unverified requests are rejected with 400.
//
// Events handled:
//   checkout.session.completed (individual mode) → creates course_enrollments row
//   checkout.session.completed (institution mode) → creates institution_enrollments row
//
// All other event types are acknowledged with 200 and ignored.
// Idempotency: duplicate deliveries of the same stripe_session_id are skipped.

import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createServiceRoleClient } from '@/lib/supabase/client';
import type { CheckoutMetadata } from '@/lib/stripe';

// Webhook needs raw body access; nodejs runtime required.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// Enrollment provisioning — extracted for testability
// ============================================================

export interface ProvisionResult {
  action: 'created' | 'skipped';
  type: 'individual' | 'institution';
}

export interface ProvisionError {
  error: string;
  code: 'missing_metadata' | 'db_error' | 'lookup_error';
}

/**
 * Resolves a user_id from an email address using the Supabase service role
 * auth admin API. Returns null if the user does not exist yet — enrollments
 * are created with user_id=null in that case; the value can be back-filled
 * once the user creates their account.
 */
async function resolveUserId(
  email: string,
  supabase: ReturnType<typeof createServiceRoleClient>
): Promise<string | null> {
  try {
    const { data: userList } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const matched = userList?.users?.find((u) => u.email === email);
    return matched?.id ?? null;
  } catch {
    // Non-fatal — proceed without user_id
    return null;
  }
}

/**
 * Provisions an enrollment for a completed Stripe Checkout Session.
 * Uses the service role client to bypass RLS for both tables.
 *
 * Returns ProvisionResult on success, ProvisionError on failure.
 */
export async function provisionEnrollment(
  session: Pick<Stripe.Checkout.Session, 'id' | 'customer_details' | 'metadata'>
): Promise<ProvisionResult | ProvisionError> {
  const metadata = (session.metadata ?? {}) as Partial<CheckoutMetadata>;
  const { product, mode, institution_name, quantity, user_email, discount_applied } = metadata;

  if (!product || !mode) {
    return { error: 'Missing required metadata: product and mode', code: 'missing_metadata' };
  }

  const supabase = createServiceRoleClient();
  const sessionId = session.id;
  const email = session.customer_details?.email ?? user_email ?? null;

  // ---- Individual enrollment (PAY-04) ----------------------------
  if (mode === 'individual') {
    // Idempotency: skip if this session was already processed
    const { data: existing, error: existingErr } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .limit(1);

    if (existingErr) {
      console.error('[webhook] Failed to check existing enrollment:', existingErr);
      return { error: 'Database lookup failed', code: 'db_error' };
    }

    if (existing && existing.length > 0) {
      return { action: 'skipped', type: 'individual' };
    }

    if (!email) {
      return { error: 'No email available for individual enrollment', code: 'missing_metadata' };
    }

    // Resolve user_id — nullable; user may not have an account yet
    const userId = await resolveUserId(email, supabase);

    // Resolve institution_enrollment_id for persistent-discount individual purchases
    let institutionEnrollmentId: string | null = null;
    if (discount_applied === 'institution_persistent') {
      const { data: instRow, error: instErr } = await supabase
        .from('institution_enrollments')
        .select('id')
        .eq('discount_locked', true)
        .limit(1);

      if (instErr) {
        console.error('[webhook] institution_enrollments lookup error:', instErr);
      } else if (instRow && instRow.length > 0) {
        institutionEnrollmentId = (instRow[0] as { id: string }).id;
      }
    }

    const { error: insertErr } = await supabase.from('course_enrollments').insert({
      ...(userId ? { user_id: userId } : {}),
      email,
      product: 'aibi-p',
      stripe_session_id: sessionId,
      current_module: 1,
      completed_modules: '{}',
      enrolled_at: new Date().toISOString(),
      ...(institutionEnrollmentId ? { institution_enrollment_id: institutionEnrollmentId } : {}),
    });

    if (insertErr) {
      console.error('[webhook] course_enrollments insert error:', insertErr);
      return { error: 'Failed to create enrollment record', code: 'db_error' };
    }

    return { action: 'created', type: 'individual' };
  }

  // ---- Institution bundle provisioning (PAY-05) ------------------
  if (mode === 'institution') {
    // Idempotency: skip if this session was already processed
    const { data: existing, error: existingErr } = await supabase
      .from('institution_enrollments')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .limit(1);

    if (existingErr) {
      console.error('[webhook] Failed to check existing institution_enrollments:', existingErr);
      return { error: 'Database lookup failed', code: 'db_error' };
    }

    if (existing && existing.length > 0) {
      return { action: 'skipped', type: 'institution' };
    }

    if (!institution_name) {
      return { error: 'Missing institution_name for institution enrollment', code: 'missing_metadata' };
    }

    const seatsPurchased = quantity ? parseInt(quantity, 10) : NaN;
    if (!Number.isFinite(seatsPurchased) || seatsPurchased < 1) {
      return { error: 'Invalid quantity for institution enrollment', code: 'missing_metadata' };
    }

    // discount_locked=true is set immediately on creation — all future per-learner
    // purchases associated with this institution get the ~$63 institution price (PAY-03).
    const { error: insertErr } = await supabase.from('institution_enrollments').insert({
      institution_name,
      seats_purchased: seatsPurchased,
      seats_used: 0,
      stripe_session_id: sessionId,
      discount_locked: true,
    });

    if (insertErr) {
      console.error('[webhook] institution_enrollments insert error:', insertErr);
      return { error: 'Failed to create institution enrollment record', code: 'db_error' };
    }

    return { action: 'created', type: 'institution' };
  }

  return { error: `Unrecognised mode: ${mode as string}`, code: 'missing_metadata' };
}

// ============================================================
// Route handler
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not configured.');
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 });
  }

  // Read raw body — signature verification requires the exact bytes received.
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  // Lazy-import to avoid module-level throw at build time when env var not set.
  const { stripe } = await import('@/lib/stripe');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  // Only process checkout.session.completed; acknowledge everything else.
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const result = await provisionEnrollment(session);

  if ('error' in result) {
    // Permanent failures (missing metadata) → 400, Stripe stops retrying.
    // Transient failures (db_error) → 500, Stripe retries for up to 3 days.
    const status = result.code === 'missing_metadata' ? 400 : 500;
    console.error(`[webhook] Provisioning failed (${result.code}):`, result.error);
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ received: true, ...result });
}
