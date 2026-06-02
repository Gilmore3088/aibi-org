// Shared helper for the persistent institution discount (PAY-03).
//
// If a buyer's email is associated with an institution that has
// discount_locked=true, they get the institution (team) price automatically
// — even on an individual purchase, and without re-qualifying on seat count.
//
// This lives in one place so two call sites agree on the rule:
//   1. /api/create-checkout — actually applies the institution price.
//   2. /courses/foundation/program/purchase — surfaces a transparency note
//      so the lower price at checkout doesn't read as inconsistent.

import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { dbReadValues } from '@/lib/products/normalize';

/**
 * Returns true if the given email belongs to an institution with
 * discount_locked=true (i.e. a persistent team rate applies). Non-fatal on
 * any error — callers fall through to individual pricing.
 */
export async function hasLockedInstitutionDiscount(email: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('course_enrollments')
      .select('institution_enrollment_id, institution_enrollments!inner(discount_locked)')
      .eq('email', email)
      .in('product', dbReadValues('foundation'))
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
