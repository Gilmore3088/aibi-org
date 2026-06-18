// Enrollment provisioning logic for Stripe webhook handler.
// Extracted from route.ts so it can be exported without violating Next.js
// route file export constraints (only HTTP method handlers are valid exports).

import type Stripe from 'stripe';
import { createServiceRoleClient } from '@/lib/supabase/client';
import { ensureAuthUser } from '@/lib/supabase/auth-admin';
import type { CheckoutMetadata } from '@/lib/stripe';
import { TEAM_ASSESSMENT_MIN_SEATS } from '@/lib/team-assessment/constants';

export interface ProvisionResult {
  action: 'created' | 'skipped';
  type: 'individual' | 'institution' | 'team-assessment';
  cohortId?: string;
  publicToken?: string;
}

export interface ProvisionError {
  error: string;
  code: 'missing_metadata' | 'db_error' | 'lookup_error';
}

// F2 — a refunded Checkout Session must never be re-provisioned. Stripe can
// re-deliver checkout.session.completed (it retries non-2xx for ~3 days and can
// send occasional duplicates); the refund handler hard-deletes the enrollment,
// so without this guard a replay would silently re-create it and restore a
// refunded buyer's access. Fail-open: if the guard table is missing (migration
// 00041 not yet applied) or the read errors, do not block a legitimate provision.
async function isRefundedSession(
  supabase: ReturnType<typeof createServiceRoleClient>,
  sessionId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('refunded_checkout_sessions')
    .select('stripe_session_id')
    .eq('stripe_session_id', sessionId)
    .limit(1);
  if (error) {
    console.warn('[webhook] refunded-session check skipped:', error.message);
    return false;
  }
  return !!data && data.length > 0;
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

  // ---- Team Assessment cohort provisioning ----------------------
  if (product === 'team-assessment') {
    const { data: existing, error: existingErr } = await supabase
      .from('team_assessment_cohorts')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .limit(1);

    if (existingErr) {
      console.error('[webhook] Failed to check team_assessment_cohorts:', existingErr);
      return { error: 'Database lookup failed', code: 'db_error' };
    }

    if (existing && existing.length > 0) {
      return { action: 'skipped', type: 'team-assessment' };
    }

    if (await isRefundedSession(supabase, sessionId)) {
      return { action: 'skipped', type: 'team-assessment' };
    }

    if (!email) {
      return { error: 'No email available for team assessment buyer', code: 'missing_metadata' };
    }
    if (!institution_name) {
      return { error: 'Missing institution_name for team assessment', code: 'missing_metadata' };
    }

    const seatsPurchased = quantity ? parseInt(quantity, 10) : NaN;
    if (!Number.isFinite(seatsPurchased) || seatsPurchased < TEAM_ASSESSMENT_MIN_SEATS) {
      return { error: 'Invalid quantity for team assessment', code: 'missing_metadata' };
    }

    const { userId } = await ensureAuthUser(email);
    if (!userId) {
      console.error('[webhook] could not ensure auth user for team assessment', { product });
      return { error: 'Could not resolve buyer account', code: 'db_error' };
    }

    const { data: cohort, error: insertErr } = await supabase
      .from('team_assessment_cohorts')
      .insert({
        institution_name,
        buyer_email: email,
        buyer_user_id: userId,
        seats_purchased: seatsPurchased,
        stripe_session_id: sessionId,
      })
      .select('id, public_token')
      .single();

    if (insertErr) {
      console.error('[webhook] team_assessment_cohorts insert error:', insertErr);
      return { error: 'Failed to create team assessment cohort', code: 'db_error' };
    }

    return {
      action: 'created',
      type: 'team-assessment',
      cohortId: (cohort as { id: string }).id,
      publicToken: (cohort as { public_token: string }).public_token,
    };
  }

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

    // F2 — replay guard: a refunded session must not be re-provisioned.
    if (await isRefundedSession(supabase, sessionId)) {
      return { action: 'skipped', type: 'individual' };
    }

    if (!email) {
      return { error: 'No email available for individual enrollment', code: 'missing_metadata' };
    }

    // Ensure a Supabase auth account exists for the buyer BEFORE inserting the
    // enrollment. The entitlements sync trigger (00015/00035) fires on this
    // INSERT and writes entitlements.user_id = course_enrollments.user_id —
    // but entitlements.user_id is NOT NULL. An enrollment inserted with a null
    // user_id therefore makes that AFTER-INSERT trigger throw, which rolls back
    // the whole enrollment: the buyer is charged but never provisioned, and no
    // welcome email is sent. This bit the anonymous In-Depth purchase path,
    // where the buyer has no prior account. ensureAuthUser is idempotent —
    // it returns the existing id (exact, then Gmail-canonical match) or creates
    // a new account — so it both fixes the crash and dedupes +alias purchases.
    const { userId } = await ensureAuthUser(email);
    if (!userId) {
      // Could not resolve or create the account (transient admin-API failure,
      // or Supabase not configured). Return db_error so the webhook responds
      // 500 and Stripe retries — far safer than inserting a null-user_id row
      // that the entitlements trigger would reject with a cryptic constraint
      // error after partially running.
      console.error('[webhook] could not ensure auth user for enrollment', { product });
      return { error: 'Could not resolve buyer account', code: 'db_error' };
    }

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

    // course_enrollments.product accepts any string; we use it to gate access
    // to either the Foundation course or the In-Depth Assessment 48-question
    // version. The current_module / completed_modules columns are ignored
    // for in-depth-assessment (no module sequence to track).
    //
    // Per the 2026-05-10 rename, NEW writes emit 'foundation'. Legacy rows
    // with product='aibi-p' continue to read correctly via normalizeProduct()
    // (src/lib/products/normalize.ts). The DB CHECK constraint accepts both
    // values; backfill ships in 00029 after the dual-read code is live.
    const productSlug = product === 'in-depth-assessment' ? 'in-depth-assessment' : 'foundation';

    const { error: insertErr } = await supabase.from('course_enrollments').insert({
      user_id: userId,
      email,
      product: productSlug,
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

    // F2 — replay guard: a refunded session must not be re-provisioned.
    if (await isRefundedSession(supabase, sessionId)) {
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
    // purchases associated with this institution get the $79 team price (PAY-03).
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
