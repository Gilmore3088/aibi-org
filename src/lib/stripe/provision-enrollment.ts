// Enrollment provisioning logic for Stripe webhook handler.
// Extracted from route.ts so it can be exported without violating Next.js
// route file export constraints (only HTTP method handlers are valid exports).

import type Stripe from 'stripe';
import { createServiceRoleClient } from '@/lib/supabase/client';
import type { CheckoutMetadata } from '@/lib/stripe';
import { canonicalEmail } from '@/lib/email/canonicalize';

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
 * auth admin API.
 *
 * Match priority:
 *   1. Exact email match (case-insensitive) — the "real" account.
 *   2. Canonical match (Gmail +alias / dots stripped) AS A FALLBACK only.
 *      If multiple users share a canonical email, prefer the one with the
 *      most recent last_sign_in_at, since that's almost certainly the
 *      account the buyer is actively using.
 *
 * This ordering matters: an earlier version did canonical-first and bound
 * an in-depth purchase to a never-signed-in ghost +alias account that
 * Stripe checkout had auto-created, while the real account sat with no
 * entitlement. See 2026-05-11 incident.
 *
 * Returns null if no user exists yet — enrollments are created with
 * user_id=null in that case; the value can be back-filled once the user
 * creates their account.
 */
async function resolveUserId(
  email: string,
  supabase: ReturnType<typeof createServiceRoleClient>
): Promise<string | null> {
  const targetLower = email.trim().toLowerCase();
  const targetCanonical = canonicalEmail(email);
  try {
    const { data: userList } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const users = userList?.users ?? [];

    const exact = users.find((u) => u.email?.toLowerCase() === targetLower);
    if (exact) return exact.id;

    const canonicalMatches = users.filter(
      (u) => u.email && canonicalEmail(u.email) === targetCanonical,
    );
    if (canonicalMatches.length === 0) return null;

    // Pick the most recently active account.
    canonicalMatches.sort((a, b) => {
      const at = a.last_sign_in_at ? Date.parse(a.last_sign_in_at) : 0;
      const bt = b.last_sign_in_at ? Date.parse(b.last_sign_in_at) : 0;
      return bt - at;
    });
    return canonicalMatches[0].id;
  } catch {
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
      ...(userId ? { user_id: userId } : {}),
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
