// Enrollment provisioning logic for Stripe webhook handler.
// Extracted from route.ts so it can be exported without violating Next.js
// route file export constraints (only HTTP method handlers are valid exports).

import type Stripe from 'stripe';
import { createServiceRoleClient } from '@/lib/supabase/client';
import type { CheckoutMetadata } from '@/lib/stripe';
import { generateInviteToken } from '@/lib/indepth/tokens';
import { sendIndepthIndividualInvite } from '@/lib/resend';
import { tagSubscriberByEnv } from '@/lib/convertkit/sequences';

// Institution per-seat price for the In-Depth Assessment, in cents.
// Used to record amount_paid_cents on the institutions row.
const INDEPTH_INSTITUTION_SEAT_CENTS = 7900;

export interface ProvisionResult {
  action: 'created' | 'skipped';
  type: 'individual' | 'institution' | 'indepth-individual' | 'indepth-institution';
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

  // ---- In-Depth Assessment branches (must match before legacy AiBI-P
  //       branches, which are product-agnostic on the mode discriminator). --
  if (product === 'indepth-assessment' && mode === 'individual') {
    return provisionIndepthIndividual(session, metadata, supabase);
  }
  if (product === 'indepth-assessment' && mode === 'institution') {
    return provisionIndepthInstitution(session, metadata, supabase);
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
    // purchases associated with this institution get the $199 team price (PAY-03).
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
// In-Depth Assessment branches
// ============================================================

async function provisionIndepthIndividual(
  session: Pick<Stripe.Checkout.Session, 'id' | 'customer_details' | 'metadata'>,
  metadata: Partial<CheckoutMetadata>,
  supabase: ReturnType<typeof createServiceRoleClient>,
): Promise<ProvisionResult | ProvisionError> {
  const sessionId = session.id;

  // Idempotency: skip if this session was already processed.
  const { data: existing, error: existingErr } = await supabase
    .from('indepth_assessment_takers')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .limit(1);

  if (existingErr) {
    console.error('[webhook] indepth-individual lookup failed:', existingErr);
    return { error: 'Database lookup failed', code: 'db_error' };
  }
  if (existing && existing.length > 0) {
    return { action: 'skipped', type: 'indepth-individual' };
  }

  const leaderEmail = metadata.leader_email ?? session.customer_details?.email ?? null;
  if (!leaderEmail) {
    return { error: 'No email available for indepth-individual', code: 'missing_metadata' };
  }

  const token = generateInviteToken();

  const { error: insertErr } = await supabase.from('indepth_assessment_takers').insert({
    institution_id: null,
    invite_email: leaderEmail,
    invite_token: token,
    stripe_session_id: sessionId,
  });

  if (insertErr) {
    // Postgres unique-violation — race condition on a duplicate webhook delivery.
    if ((insertErr as { code?: string }).code === '23505') {
      return { action: 'skipped', type: 'indepth-individual' };
    }
    console.error('[webhook] indepth_assessment_takers insert error:', insertErr);
    return { error: 'Failed to create indepth taker record', code: 'db_error' };
  }

  // Best-effort: send the invite email and apply the CK tag. Failures here
  // must not block the success response — the row is already persisted.
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aibankinginstitute.com';
  const takeUrl = `${origin}/assessment/in-depth/take?token=${token}`;
  try {
    await sendIndepthIndividualInvite({ email: leaderEmail, takeUrl });
  } catch (err) {
    console.warn('[webhook] sendIndepthIndividualInvite error:', err);
  }
  try {
    await tagSubscriberByEnv({
      email: leaderEmail,
      tagIdEnv: 'CONVERTKIT_TAG_ID_INDEPTH_INDIVIDUAL',
      tagName: 'indepth-assessment-individual',
    });
  } catch (err) {
    console.warn('[webhook] tagSubscriberByEnv(indepth-individual) error:', err);
  }

  return { action: 'created', type: 'indepth-individual' };
}

async function provisionIndepthInstitution(
  session: Pick<Stripe.Checkout.Session, 'id' | 'customer_details' | 'metadata'>,
  metadata: Partial<CheckoutMetadata>,
  supabase: ReturnType<typeof createServiceRoleClient>,
): Promise<ProvisionResult | ProvisionError> {
  const sessionId = session.id;

  const { data: existing, error: existingErr } = await supabase
    .from('indepth_assessment_institutions')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .limit(1);

  if (existingErr) {
    console.error('[webhook] indepth-institution lookup failed:', existingErr);
    return { error: 'Database lookup failed', code: 'db_error' };
  }
  if (existing && existing.length > 0) {
    return { action: 'skipped', type: 'indepth-institution' };
  }

  const leaderEmail = metadata.leader_email ?? session.customer_details?.email ?? null;
  const seats = metadata.quantity ? parseInt(metadata.quantity, 10) : NaN;
  const instName = (metadata.institution_name ?? '').trim();

  if (!leaderEmail) {
    return { error: 'No leader email available for indepth-institution', code: 'missing_metadata' };
  }
  if (!instName) {
    return { error: 'Missing institution_name for indepth-institution', code: 'missing_metadata' };
  }
  if (!Number.isFinite(seats) || seats < 10) {
    return { error: 'Invalid seat quantity for indepth-institution (min 10)', code: 'missing_metadata' };
  }

  const { error: insertErr } = await supabase.from('indepth_assessment_institutions').insert({
    institution_name: instName,
    leader_email: leaderEmail,
    leader_user_id: null,
    seats_purchased: seats,
    stripe_session_id: sessionId,
    amount_paid_cents: seats * INDEPTH_INSTITUTION_SEAT_CENTS,
  });

  if (insertErr) {
    if ((insertErr as { code?: string }).code === '23505') {
      return { action: 'skipped', type: 'indepth-institution' };
    }
    console.error('[webhook] indepth_assessment_institutions insert error:', insertErr);
    return { error: 'Failed to create indepth institution record', code: 'db_error' };
  }

  // Best-effort tag — leader gets the leader-tier sequence.
  try {
    await tagSubscriberByEnv({
      email: leaderEmail,
      tagIdEnv: 'CONVERTKIT_TAG_ID_INDEPTH_LEADER',
      tagName: 'indepth-assessment-leader',
    });
  } catch (err) {
    console.warn('[webhook] tagSubscriberByEnv(indepth-leader) error:', err);
  }

  // Note: invite-driven taker rows are NOT generated here. The leader
  // creates them via the dashboard / Task 13 invite API.

  return { action: 'created', type: 'indepth-institution' };
}
