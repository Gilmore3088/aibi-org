// HomeContextStrip — server component. Reads the Supabase session from
// cookies and renders a "welcome back" band for authenticated users.
//
// 2026-05-17 perf rewrite: was a 'use client' component that called
// supabase.auth.getUser() from the browser. That pulled the full
// Supabase JS SDK (+ Web3 auth providers) into the homepage bundle —
// ~80 KB wire on every anonymous request, for a band that's hidden
// for 99% of visitors. Moved to the server: no client JS for anonymous
// users; the Supabase SDK no longer enters the homepage critical path.
//
// Caveat: the localStorage-only fallback that used to upgrade the band
// for users with stale browser-only assessment data is gone. If we want
// that back, render this server-shell first and hydrate with a small
// client island that swaps in localStorage data when available.

import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';
import { dbReadValues } from '@/lib/products/normalize';

const TOTAL_FOUNDATION_PROGRAM_MODULES = 12;

interface EnrollmentRow {
  readonly current_module: number;
  readonly completed_modules: readonly number[] | null;
}

interface ProfileRow {
  readonly readiness_score: number | null;
  readonly readiness_tier_label: string | null;
  readonly readiness_max_score: number | null;
  readonly readiness_answers: unknown;
}

export async function HomeContextStrip() {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServerClientWithCookies(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Enrollment is the strongest signal — gives the most useful CTA.
  const { data: enrollmentRaw } = await supabase
    .from('course_enrollments')
    .select('current_module, completed_modules')
    .eq('user_id', user.id)
    .in('product', dbReadValues('foundation'))
    .maybeSingle();

  const enrollment = enrollmentRaw as EnrollmentRow | null;
  if (enrollment) {
    const completedCount = enrollment.completed_modules?.length ?? 0;
    return (
      <ContextBand>
        <p className="text-sm text-[color:var(--slate-600)]">
          Welcome back. You&apos;re on{' '}
          <span className="text-[color:var(--ink)]">
            Module {enrollment.current_module} of {TOTAL_FOUNDATION_PROGRAM_MODULES}
          </span>{' '}
          ({completedCount} complete).
        </p>
        <Link
          href={`/courses/foundation/program/${enrollment.current_module}`}
          className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--gold)] hover:text-[color:var(--ink)]"
        >
          Resume course →
        </Link>
      </ContextBand>
    );
  }

  // 2. Authenticated user with an assessment on file in Supabase.
  const { data: profileRaw } = await supabase
    .from('user_profiles')
    .select('readiness_score, readiness_tier_label, readiness_max_score, readiness_answers')
    .eq('user_id', user.id)
    .maybeSingle();

  const profile = profileRaw as ProfileRow | null;
  if (
    profile &&
    typeof profile.readiness_score === 'number' &&
    typeof profile.readiness_tier_label === 'string'
  ) {
    const answers = profile.readiness_answers as unknown[] | null;
    const maxScore =
      profile.readiness_max_score ?? (Array.isArray(answers) && answers.length === 12 ? 48 : 32);
    return (
      <ContextBand>
        <p className="text-sm text-[color:var(--slate-600)]">
          Welcome back. Your readiness:{' '}
          <span className="text-[color:var(--ink)]">{profile.readiness_tier_label}</span>{' '}
          <span className="font-mono tabular-nums">
            ({profile.readiness_score}/{maxScore})
          </span>
          .
        </p>
        <Link
          href="/courses/foundation/program"
          className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--gold)] hover:text-[color:var(--ink)]"
        >
          Explore the AiBI-Foundation course →
        </Link>
      </ContextBand>
    );
  }

  // 3. Authenticated, no progress yet — acknowledge by name.
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split('@')[0] ??
    'there';

  return (
    <ContextBand>
      <p className="text-sm text-[color:var(--slate-600)]">
        Welcome back, <span className="text-[color:var(--ink)]">{displayName}</span>.
        Take the readiness assessment to see your starting point.
      </p>
      <Link
        href="/assessment/take"
        className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--gold)] hover:text-[color:var(--ink)]"
      >
        Take the assessment →
      </Link>
    </ContextBand>
  );
}

function ContextBand({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="border-b border-[color:var(--ink)]/10 bg-[color:#FFFFFF]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        {children}
      </div>
    </div>
  );
}
