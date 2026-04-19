// Server-only enrollment lookup — never import from Client Components.
// Returns the enrollment row for the current authenticated user,
// or null if unauthenticated, unconfigured, or not enrolled in 'aibi-p'.

import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import type { CourseEnrollment } from '@/types/course';

export type EnrollmentData = Pick<
  CourseEnrollment,
  'id' | 'user_id' | 'completed_modules' | 'current_module' | 'enrolled_at' | 'onboarding_answers'
>;

/**
 * Look up the current user's AiBI-P enrollment from Supabase.
 *
 * Returns null when Supabase is not configured or when the request has no
 * valid auth session. Callers should treat null as "not enrolled" and
 * redirect to /courses/aibi-p/purchase accordingly.
 *
 * Uses getAll/setAll cookie pattern (recommended by @supabase/ssr 0.5+).
 */
export async function getEnrollment(): Promise<EnrollmentData | null> {
  // Dev-only enrollment bypass.
  // Activates ONLY when NODE_ENV !== 'production' AND SKIP_ENROLLMENT_GATE === 'true'.
  // Returns a synthetic enrolled record so testers can access course content
  // without a real Supabase enrollment row. Never fires in production — the
  // NODE_ENV guard is hard-coded and cannot be overridden by env vars.
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.SKIP_ENROLLMENT_GATE === 'true'
  ) {
    return {
      id: 'dev-bypass',
      user_id: 'dev-bypass',
      completed_modules: [],
      current_module: 1,
      enrolled_at: new Date().toISOString(),
      onboarding_answers: null,
    };
  }

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

  const { data, error } = await supabase
    .from('course_enrollments')
    .select('id, user_id, completed_modules, current_module, enrolled_at, onboarding_answers')
    .eq('user_id', user.id)
    .eq('product', 'aibi-p')
    .single();

  if (error || !data) {
    return null;
  }

  // Normalize current_module so URL-bound consumers never see 0.
  // The DB allows current_module=0 (means "enrolled, not started"), but every
  // UI consumer that builds a /courses/aibi-p/{N} URL needs N >= 1. Coercing
  // here keeps page.tsx, layout.tsx, and the [module] redirect aligned.
  // Server-side validators (api/courses/submit-activity, save-progress) use
  // a separate query and continue to see the raw value.
  return {
    ...data,
    current_module: Math.max(1, data.current_module ?? 1),
  } as EnrollmentData;
}
