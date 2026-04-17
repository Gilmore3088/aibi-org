// Server-only enrollment lookup for AiBI-S — never import from Client Components.
// Returns the enrollment row for the current authenticated user,
// or null if unauthenticated, unconfigured, or not enrolled in 'aibi-s'.

import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import type { CourseEnrollment } from '@/types/course';

export type SEnrollmentData = Pick<
  CourseEnrollment,
  'id' | 'user_id' | 'completed_modules' | 'current_module' | 'enrolled_at' | 'onboarding_answers'
> & {
  readonly role_track: string | null;
  readonly cohort_id: string | null;
  readonly cohort_start_date: string | null;
};

/**
 * Look up the current user's AiBI-S enrollment from Supabase.
 *
 * Graceful fallback: returns null when Supabase is not configured (local dev)
 * or when the request has no valid auth session. Callers treat null as
 * "not enrolled" and redirect to /courses/aibi-s/purchase.
 */
export async function getEnrollment(): Promise<SEnrollmentData | null> {
  // Dev bypass — return mock enrollment in development so the course is
  // browsable locally without authentication. Set SKIP_DEV_BYPASS=true
  // to test real Supabase auth in development.
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_DEV_BYPASS !== 'true') {
    return {
      id: 'dev-mock-s-enrollment',
      user_id: 'dev-user',
      completed_modules: [1, 2, 3],
      current_module: 4,
      enrolled_at: new Date().toISOString(),
      onboarding_answers: {
        uses_m365: 'yes',
        personal_ai_subscriptions: ['chatgpt-plus'],
        primary_role: 'operations',
      },
      role_track: 'operations',
      cohort_id: 'cohort-2026-05',
      cohort_start_date: '2026-05-05',
    } as unknown as SEnrollmentData;
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
    .select(
      'id, user_id, completed_modules, current_module, enrolled_at, onboarding_answers, role_track, cohort_id, cohort_start_date',
    )
    .eq('user_id', user.id)
    .eq('product', 'aibi-s')
    .single();

  if (error || !data) {
    return null;
  }

  return data as SEnrollmentData;
}
