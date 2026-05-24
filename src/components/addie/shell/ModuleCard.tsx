// ModuleCard — the redesigned module tile on /foundation home.
// Replaces the LedgerCard usage for module rows. Uses the addie-course-
// surface classes (hover lift, illustration, progress arc).

import Link from 'next/link';
import { ModuleIllustration } from '@/components/addie/illustrations/ModuleIllustration';

type ModuleKey = 'm0' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

interface ModuleCardProps {
  readonly id: string;
  readonly ordinal: number;
  readonly title: string;
  readonly tier: 'free' | 'paid';
  readonly summary: string | null;
  readonly lessonCount: number;
  readonly completed?: number;
  readonly current?: boolean;
  readonly delay?: number;
}

export function ModuleCard({
  id,
  ordinal,
  title,
  tier,
  summary,
  lessonCount,
  completed = 0,
  current = false,
  delay,
}: ModuleCardProps) {
  const moduleKey = (id as ModuleKey);
  const pct = lessonCount > 0 ? Math.round((completed / lessonCount) * 100) : 0;
  const isDone = lessonCount > 0 && completed >= lessonCount;
  return (
    <Link href={`/foundation/${id}`} className="block h-full focus:outline-none">
      <article
        className="addie-module-card h-full"
        data-tier={tier}
        data-reveal
        data-reveal-delay={delay}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="addie-chip" data-tone={tier === 'paid' ? 'accent' : undefined}>
              Module {ordinal} · {tier === 'paid' ? 'Paid' : 'Free'}
            </span>
            <h3 className="font-serif text-xl text-[var(--ledger-ink)] leading-tight">
              {title}
            </h3>
          </div>
          {lessonCount > 0 ? (
            <div
              className="addie-progress-arc shrink-0"
              style={{ ['--p' as string]: pct }}
              aria-label={`${pct}% complete`}
              role="img"
            >
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--ledger-ink)]">
                {isDone ? 'Done' : `${pct}%`}
              </span>
            </div>
          ) : null}
        </div>

        <ModuleIllustration module={moduleKey} />

        {summary ? (
          <p className="text-sm text-[var(--ledger-ink-2)] leading-relaxed">{summary}</p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2 border-t border-[var(--ledger-rule)]">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ledger-muted)]">
            {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
          </span>
          <span
            className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ledger-ink)] inline-flex items-center gap-1.5"
            aria-hidden="true"
          >
            {current ? 'Continue' : isDone ? 'Review' : 'Start'} →
          </span>
        </div>
      </article>
    </Link>
  );
}
