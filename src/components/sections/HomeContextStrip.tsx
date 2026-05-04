'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUserDataWithSupabaseFallback, type UserData } from '@/lib/user-data';

interface LearnerSnapshot {
  readonly enrollment: {
    readonly currentModule: number;
    readonly completedModules: readonly number[];
  } | null;
}

type Mode =
  | { kind: 'hidden' }
  | { kind: 'assessment-only'; tierLabel: string; score: number; maxScore: number }
  | { kind: 'enrolled'; currentModule: number; completedCount: number; totalModules: number };

const TOTAL_AIBIP_MODULES = 12;

export function HomeContextStrip() {
  const [mode, setMode] = useState<Mode>({ kind: 'hidden' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const user = await getUserDataWithSupabaseFallback();
      if (cancelled) return;

      let enrollment: LearnerSnapshot['enrollment'] = null;
      try {
        const res = await fetch('/api/dashboard/learner', { cache: 'no-store' });
        if (res.ok) {
          const data = (await res.json()) as LearnerSnapshot;
          enrollment = data.enrollment;
        }
      } catch {
        /* silently fall back to assessment-only or hidden */
      }
      if (cancelled) return;

      if (enrollment) {
        setMode({
          kind: 'enrolled',
          currentModule: enrollment.currentModule,
          completedCount: enrollment.completedModules.length,
          totalModules: TOTAL_AIBIP_MODULES,
        });
        return;
      }

      if (user?.readiness) {
        const maxScore = user.readiness.maxScore ?? (user.readiness.answers.length === 12 ? 48 : 32);
        setMode({
          kind: 'assessment-only',
          tierLabel: user.readiness.tierLabel,
          score: user.readiness.score,
          maxScore,
        });
        return;
      }
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
          href={`/courses/aibi-p/${mode.currentModule}`}
          className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] hover:text-[color:var(--color-ink)]"
        >
          Resume course →
        </Link>
      </ContextBand>
    );
  }

  return (
    <ContextBand>
      <p className="text-sm text-[color:var(--color-slate)]">
        Welcome back. Your readiness:{' '}
        <span className="text-[color:var(--color-ink)]">{mode.tierLabel}</span>{' '}
        <span className="font-mono tabular-nums">({mode.score}/{mode.maxScore})</span>.
      </p>
      <Link
        href="/courses/aibi-p"
        className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] hover:text-[color:var(--color-ink)]"
      >
        Explore the Practitioner course →
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
