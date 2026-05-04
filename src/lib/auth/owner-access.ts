// Owner email allowlist. Lets specific authenticated users (project owner,
// invited collaborators) skip purchase gates without paying — so we can
// test the full signed-in flow end-to-end on any environment.
//
// Compared to the retired SKIP_ENROLLMENT_GATE env var:
//   - Real auth is still required (you must sign in with the allowlisted
//     email; no anonymous bypass).
//   - Works in production. SKIP_ENROLLMENT_GATE was non-prod only.
//   - Auto-provisions a real DB row instead of returning synthetic data,
//     so every downstream code path (save-progress, submit-activity,
//     certificate generation) treats the owner like a normal enrollee.
//
// Configure via the OWNER_EMAILS env var (comma-separated list of emails).
// If unset, the default below applies — keeps testing painless without
// requiring env wiring.

import type { SupabaseClient } from '@supabase/supabase-js';

// Default fallback when OWNER_EMAILS is not set. Project owner per repo
// git history. Override in .env.local / Vercel env to add collaborators.
const DEFAULT_OWNER_EMAILS = ['jlgilmore2@gmail.com'];

export type PaidProduct = 'aibi-p' | 'aibi-s' | 'aibi-l';

function ownerEmailSet(): Set<string> {
  const env = process.env.OWNER_EMAILS;
  const raw = env && env.trim().length > 0
    ? env.split(',')
    : DEFAULT_OWNER_EMAILS;
  return new Set(raw.map((e) => e.trim().toLowerCase()).filter((e) => e.length > 0));
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ownerEmailSet().has(email.toLowerCase());
}

export function listOwnerEmails(): readonly string[] {
  return Array.from(ownerEmailSet());
}

/**
 * Auto-provision a course_enrollments row for an authenticated owner who
 * doesn't already have one. Idempotent: checks existence first so repeated
 * calls don't create duplicate rows. (course_enrollments has no UNIQUE
 * constraint on user_id+product, so we cannot rely on ON CONFLICT.)
 *
 * Returns true if a row exists after the call, false on any error.
 *
 * Owners get a fresh enrollment (current_module=1, no completed modules).
 * To test specific module states, edit the row directly in Studio.
 */
export async function ensureOwnerEnrollment(
  supabase: SupabaseClient,
  args: {
    readonly userId: string;
    readonly email: string;
    readonly product: PaidProduct;
  }
): Promise<boolean> {
  try {
    const { data: existing, error: lookupError } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', args.userId)
      .eq('product', args.product)
      .limit(1);

    if (lookupError) {
      console.warn('[owner-access] enrollment lookup failed:', lookupError);
      return false;
    }
    if (existing && existing.length > 0) {
      return true; // already provisioned
    }

    const { error: insertError } = await supabase.from('course_enrollments').insert({
      user_id: args.userId,
      email: args.email,
      product: args.product,
      current_module: 1,
      completed_modules: [],
      enrolled_at: new Date().toISOString(),
    });

    if (insertError) {
      console.warn('[owner-access] enrollment insert failed:', insertError);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[owner-access] unexpected provisioning error:', err);
    return false;
  }
}
