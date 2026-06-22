// Server-only enrollment lookup — never import from Client Components.
// Returns the enrollment row for the current authenticated user,
// or null if unauthenticated, unconfigured, or not enrolled in 'aibi-p'.

import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import type { CourseEnrollment } from '@/types/course';
import { dbReadValues } from '@/lib/products/normalize';
import { emailVariants } from '@/lib/email/canonicalize';
import { isPreviewAuthBypassEnabled } from '@/lib/auth/previewBypass';
import { foundationCourseConfig } from '@content/courses/foundation-program';

// NOTE (2026-05-17, #106): getEnrollment retains its inline supabase query
// rather than delegating to findEnrollmentByEmailOrUserId because it needs
// to surface the distinct 'fetch_failed' branch for the
// "couldn't load progress" UI state. The shared helper collapses transient
// errors to null. The In-Depth callers — getInDepthEnrollment and the
// take page — use the shared helper.

export type EnrollmentData = Pick<
  CourseEnrollment,
  'id' | 'user_id' | 'completed_modules' | 'current_module' | 'enrolled_at' | 'onboarding_answers'
>;

/**
 * Look up the current user's AiBI-Foundation enrollment from Supabase.
 *
 * Returns null when Supabase is not configured or when the request has no
 * valid auth session. Callers should treat null as "not enrolled" and
 * redirect to /courses/foundation/program/purchase accordingly.
 *
 * Uses getAll/setAll cookie pattern (recommended by @supabase/ssr 0.5+).
 */
export type EnrollmentResult = EnrollmentData | { error: 'fetch_failed' } | null;
export const DEV_COURSE_ENROLLMENT_ID = 'dev-bypass';
const DEV_UNLOCKED_MODULES = Array.from(
  { length: foundationCourseConfig.modules.length },
  (_, index) => index + 1,
);

export function isDevCourseEnrollmentBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.SKIP_ENROLLMENT_GATE === 'true'
  );
}

export function isFetchError(
  result: EnrollmentResult,
): result is { error: 'fetch_failed' } {
  return result !== null && 'error' in result && result.error === 'fetch_failed';
}

function createDevEnrollment(): EnrollmentData {
  return {
    id: DEV_COURSE_ENROLLMENT_ID,
    user_id: DEV_COURSE_ENROLLMENT_ID,
    completed_modules: DEV_UNLOCKED_MODULES,
    current_module: DEV_UNLOCKED_MODULES.length,
    enrolled_at: new Date().toISOString(),
    onboarding_answers: {
      role: 'other',
      department: 'local-preview',
      tools: [],
      weekly_ai_usage: 'testing',
    },
  } as unknown as EnrollmentData;
}

function isLocalMissingCourseSchema(error: {
  readonly code?: string;
  readonly message?: string;
}): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  const message = error.message ?? '';
  return (
    error.code === 'PGRST205' ||
    message.includes("Could not find the table 'public.course_enrollments'") ||
    message.includes('course_enrollments') && message.includes('schema cache')
  );
}

// Variant that exposes the fetch_failed branch for callers that want to render
// a distinct "couldn't load progress" state. Most callers should keep using
// getEnrollment(), which collapses the error case back to null for backwards
// compatibility.
export async function getEnrollmentResult(): Promise<EnrollmentResult> {
  // Dev-only enrollment bypass.
  // Activates ONLY when NODE_ENV !== 'production' AND SKIP_ENROLLMENT_GATE === 'true'.
  // Returns a synthetic enrolled record so testers can access course content
  // without a real Supabase enrollment row. Never fires in production — the
  // NODE_ENV guard is hard-coded and cannot be overridden by env vars.
  if (isDevCourseEnrollmentBypassEnabled()) {
    return createDevEnrollment();
  }

  if (isPreviewAuthBypassEnabled()) {
    return createDevEnrollment();
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const cookieStore = await cookies();

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

  // Match by user_id OR any email variant (covers Gmail +alias forms left
  // over from Stripe checkout). When a row is found by email-only, the
  // user_id stays NULL until a back-fill job binds it; that's fine here —
  // the gate just needs ONE match across either column.
  const variants = user.email ? emailVariants(user.email) : [];
  const emailClause = variants.map((e) => `email.eq.${e}`).join(',');
  const orClause = emailClause ? `user_id.eq.${user.id},${emailClause}` : `user_id.eq.${user.id}`;

  const { data, error } = await supabase
    .from('course_enrollments')
    .select('id, user_id, completed_modules, current_module, enrolled_at, onboarding_answers')
    .or(orClause)
    .in('product', dbReadValues('foundation'))
    .limit(1)
    .maybeSingle();

  // PGRST116 = "no rows returned" — user is signed in but not enrolled.
  // Any other error code means the fetch itself failed; surface that distinctly
  // so the page can show "Couldn't load progress" instead of pretending the
  // user has no enrollment.
  if (error && error.code !== 'PGRST116') {
    if (isLocalMissingCourseSchema(error)) {
      console.warn('[getEnrollment] using local course preview:', error.message);
      return createDevEnrollment();
    }

    if (process.env.NODE_ENV === 'production') {
      console.error('[getEnrollment] supabase error:', error);
    } else {
      console.warn('[getEnrollment] supabase lookup skipped:', error.message);
    }
    return { error: 'fetch_failed' } as const;
  }
  if (!data) {
    return null;
  }

  // Normalize current_module so URL-bound consumers never see 0.
  // The DB allows current_module=0 (means "enrolled, not started"), but every
  // UI consumer that builds a /courses/foundation/program/{N} URL needs N >= 1. Coercing
  // here keeps page.tsx, layout.tsx, and the [module] redirect aligned.
  // Server-side validators (api/courses/submit-activity, save-progress) use
  // a separate query and continue to see the raw value.
  return {
    ...data,
    current_module: Math.max(1, data.current_module ?? 1),
  } as EnrollmentData;
}

/**
 * Back-compat wrapper. Collapses the fetch_failed branch to null so existing
 * callers keep working. Logs the error for monitoring; new callers that want
 * to render a distinct error state should use getEnrollmentResult().
 */
export async function getEnrollment(): Promise<EnrollmentData | null> {
  const result = await getEnrollmentResult();
  return isFetchError(result) ? null : result;
}
