// Server-only enrollment lookup — never import from Client Components.
// Returns the enrollment row for the current authenticated user,
// or null if unauthenticated, unconfigured, or not enrolled in 'aibi-s'.

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
 * Look up the current user's AiBI-S enrollment from Supabase.
 *
 * Returns null when Supabase is not configured or when the request has no
 * valid auth session. Callers should treat null as "not enrolled" and
 * redirect to /courses/aibi-s/purchase accordingly.
 *
 * Owners (per OWNER_EMAILS env var; see src/lib/auth/owner-access.ts) get
 * an auto-provisioned enrollment row the first time they hit this. Replaces
 * the retired SKIP_ENROLLMENT_GATE escape hatch.
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
    .eq('product', 'aibi-s')
    .maybeSingle();

  let row = initial.data ?? null;

  if (!row && user.email && isOwnerEmail(user.email)) {
    const provisioned = await ensureOwnerEnrollment(createServiceRoleClient(), {
      userId: user.id,
      email: user.email,
      product: 'aibi-s',
    });
    if (provisioned) {
      const refetch = await supabase
        .from('course_enrollments')
        .select(SELECT_COLUMNS)
        .eq('user_id', user.id)
        .eq('product', 'aibi-s')
        .maybeSingle();
      row = refetch.data ?? null;
    }
  }

  if (!row) {
    return null;
  }

  return row as EnrollmentData;
}
