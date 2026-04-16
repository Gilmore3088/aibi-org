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
 * Graceful fallback: returns null when Supabase is not configured (local dev)
 * or when the request has no valid auth session. Callers should treat null as
 * "not enrolled" and redirect to /courses/aibi-p/purchase accordingly.
 *
 * Uses getAll/setAll cookie pattern (recommended by @supabase/ssr 0.5+).
 */
export async function getEnrollment(): Promise<EnrollmentData | null> {
  // Graceful fallback — do not throw when env vars are absent (local dev without Supabase)
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

  return data as EnrollmentData;
}
