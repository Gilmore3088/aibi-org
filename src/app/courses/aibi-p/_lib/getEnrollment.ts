// Server-only enrollment lookup — never import from Client Components.
// Returns the enrollment row for the current authenticated user,
// or null if unauthenticated, unconfigured, or not enrolled in 'aibi-p'.

import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { ensureOwnerEnrollment, isOwnerEmail } from '@/lib/auth/owner-access';
import type { CourseEnrollment } from '@/types/course';

export type EnrollmentData = Pick<
  CourseEnrollment,
  'id' | 'user_id' | 'completed_modules' | 'current_module' | 'enrolled_at' | 'onboarding_answers'
>;

const SELECT_COLUMNS =
  'id, user_id, completed_modules, current_module, enrolled_at, onboarding_answers';

/**
 * Look up the current user's AiBI-P enrollment from Supabase.
 *
 * Returns null when Supabase is not configured or when the request has no
 * valid auth session. Callers should treat null as "not enrolled" and
 * redirect to /courses/aibi-p/purchase accordingly.
 *
 * Owners (per OWNER_EMAILS env var; see src/lib/auth/owner-access.ts) get
 * an auto-provisioned enrollment row the first time they hit this — so the
 * project owner can test the full signed-in flow on any environment without
 * buying. Replaces the retired SKIP_ENROLLMENT_GATE escape hatch.
 *
 * Uses getAll/setAll cookie pattern (recommended by @supabase/ssr 0.5+).
 */
export async function getEnrollment(): Promise<EnrollmentData | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const cookieStore = cookies();

  const supabase = ssrCreateServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // setAll is a no-op in Server Components — middleware keeps the session alive
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const initial = await supabase
    .from('course_enrollments')
    .select(SELECT_COLUMNS)
    .eq('user_id', user.id)
    .eq('product', 'aibi-p')
    .maybeSingle();

  let row = initial.data ?? null;

  // Owner allowlist auto-provision. If the signed-in user is on OWNER_EMAILS
  // and has no enrollment yet, create one and re-fetch. Owners go through the
  // same downstream code paths (save-progress, submit-activity, certificate
  // generation) as paying users — no special-case branching elsewhere.
  if (!row && user.email && isOwnerEmail(user.email)) {
    const provisioned = await ensureOwnerEnrollment(createServiceRoleClient(), {
      userId: user.id,
      email: user.email,
      product: 'aibi-p',
    });
    if (provisioned) {
      const refetch = await supabase
        .from('course_enrollments')
        .select(SELECT_COLUMNS)
        .eq('user_id', user.id)
        .eq('product', 'aibi-p')
        .maybeSingle();
      row = refetch.data ?? null;
    }
  }

  if (!row) {
    return null;
  }

  // Normalize current_module so URL-bound consumers never see 0.
  // The DB allows current_module=0 (means "enrolled, not started"), but every
  // UI consumer that builds a /courses/aibi-p/{N} URL needs N >= 1. Coercing
  // here keeps page.tsx, layout.tsx, and the [module] redirect aligned.
  // The API routes apply the same normalization on read so server-side
  // forward-only enforcement matches what the UI shows.
  return {
    ...row,
    current_module: Math.max(1, row.current_module ?? 1),
  } as EnrollmentData;
}
