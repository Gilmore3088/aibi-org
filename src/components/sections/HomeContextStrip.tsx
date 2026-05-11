'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getUserDataWithSupabaseFallback } from '@/lib/user-data';

interface LearnerSnapshot {
  readonly enrollment: {
    readonly currentModule: number;
    readonly completedModules: readonly number[];
  } | null;
}

type Mode =
  | { kind: 'hidden' }
  | { kind: 'signed-in'; displayName: string }
  | { kind: 'assessment-only'; tierLabel: string; score: number; maxScore: number }
  | { kind: 'enrolled'; currentModule: number; completedCount: number; totalModules: number };

const TOTAL_FOUNDATION_PROGRAM_MODULES = 12;

export function HomeContextStrip() {
  const [mode, setMode] = useState<Mode>({ kind: 'hidden' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // The strip is "welcome back" copy — only render it for actually
      // authenticated users. A logged-out visitor with stale localStorage
      // from a prior assessment session should see the regular hero, not
      // a "welcome back" greeting that lies about their auth state.
      if (!isSupabaseConfigured()) return;

      let authUser = null;
      try {
        const supabase = createBrowserClient();
        const { data } = await supabase.auth.getUser();
        authUser = data.user;
      } catch {
        return;
      }
      if (cancelled || !authUser) return;

      // 1. Authenticated and enrolled — strongest signal, gives the most useful CTA.
      let enrollment: LearnerSnapshot['enrollment'] = null;
      try {
        const res = await fetch('/api/dashboard/learner', { cache: 'no-store' });
        if (res.ok) {
          const data = (await res.json()) as LearnerSnapshot;
          enrollment = data.enrollment;
        }
      } catch {
        /* fall through to lower-priority states */
      }
      if (cancelled) return;

      if (enrollment) {
        setMode({
          kind: 'enrolled',
          currentModule: enrollment.currentModule,
          completedCount: enrollment.completedModules.length,
          totalModules: TOTAL_FOUNDATION_PROGRAM_MODULES,
        });
        return;
      }

      // 2. Authenticated, has prior assessment in localStorage / supabase.
      const user = await getUserDataWithSupabaseFallback();
      if (cancelled) return;
      if (user?.readiness) {
        const maxScore =
          user.readiness.maxScore ?? (user.readiness.answers.length === 12 ? 48 : 32);
        setMode({
          kind: 'assessment-only',
          tierLabel: user.readiness.tierLabel,
          score: user.readiness.score,
          maxScore,
        });
        return;
      }

      // 3. Authenticated but no progress yet. Acknowledge them by name.
      const displayName =
        (authUser.user_metadata?.full_name as string | undefined) ??
        authUser.email?.split('@')[0] ??
        'there';
      setMode({ kind: 'signed-in', displayName });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (mode.kind === 'hidden') return null;

  if (mode.kind === 'enrolled') {
    return (
      <ContextBand>
        <p className="text-sm text-[color:var(--color-slate)]">
          Welcome back. You&apos;re on{' '}
          <span className="text-[color:var(--color-ink)]">
            Module {mode.currentModule} of {mode.totalModules}
          </span>{' '}
          ({mode.completedCount} complete).
        </p>
        <Link
          href={`/courses/foundation/program/${mode.currentModule}`}
          className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] hover:text-[color:var(--color-ink)]"
        >
          Resume course →
        </Link>
      </ContextBand>
    );
  }

  if (mode.kind === 'assessment-only') {
    return (
      <ContextBand>
        <p className="text-sm text-[color:var(--color-slate)]">
          Welcome back. Your readiness:{' '}
          <span className="text-[color:var(--color-ink)]">{mode.tierLabel}</span>{' '}
          <span className="font-mono tabular-nums">({mode.score}/{mode.maxScore})</span>.
        </p>
        <Link
          href="/courses/foundation/program"
          className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] hover:text-[color:var(--color-ink)]"
        >
          Explore the Practitioner course →
        </Link>
      </ContextBand>
    );
  }

  return (
    <ContextBand>
      <p className="text-sm text-[color:var(--color-slate)]">
        Welcome back, <span className="text-[color:var(--color-ink)]">{mode.displayName}</span>.
        Take the readiness assessment to see your starting point.
      </p>
      <Link
        href="/assessment/start"
        className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] hover:text-[color:var(--color-ink)]"
      >
        Take the assessment →
      </Link>
    </ContextBand>
  );
}

function ContextBand({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="border-b border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        {children}
      </div>
    </div>
  );
}
