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
  // Optional photographic hero (migration 00058). Passed straight through
  // to ModuleIllustration; when null the bespoke SVG illustration renders.
  readonly heroImageUrl?: string | null;
  readonly heroImageAlt?: string | null;
  readonly heroImageCredit?: string | null;
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
  heroImageUrl,
  heroImageAlt,
  heroImageCredit,
}: ModuleCardProps) {
  const moduleKey = (id as ModuleKey);
  const pct = lessonCount > 0 ? Math.round((completed / lessonCount) * 100) : 0;
  const isDone = lessonCount > 0 && completed >= lessonCount;
  return (
    <Link href={`/foundation/${id}`} className="block h-full focus:outline-none">
      <article
        className="addie-module-card addie-module-card--tight h-full"
        data-tier={tier}
        data-reveal
        data-reveal-delay={delay}
      >
        {/* Illustration occupies the full card width above the meta —
            no longer floats centered between header and summary, which
            is what created the awkward dead space. */}
        <div className="addie-module-card__media">
          <ModuleIllustration
            module={moduleKey}
            photoUrl={heroImageUrl}
            photoAlt={heroImageAlt}
            photoCredit={heroImageCredit}
          />
        </div>

        <div className="px-1 pt-1 flex flex-col gap-2 flex-1">
          <div className="flex items-start justify-between gap-3">
            <span className="addie-chip" data-tone={tier === 'paid' ? 'accent' : undefined}>
              Module {ordinal} · {tier === 'paid' ? 'Paid' : 'Free'}
            </span>
            {lessonCount > 0 && (completed > 0 || isDone) ? (
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--ledger-accent)] tabular-nums">
                {isDone ? 'Done' : `${pct}%`}
              </span>
            ) : null}
          </div>

          <h3 className="font-serif text-xl text-[var(--ledger-ink)] leading-tight">
            {title}
          </h3>

          {summary ? (
            <p className="text-sm text-[var(--ledger-ink-2)] leading-snug line-clamp-2">
              {summary}
            </p>
          ) : null}

          <div className="mt-auto pt-3 border-t border-[var(--ledger-rule)] flex items-center justify-between gap-3">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--ledger-muted)] tabular-nums">
              {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
            </span>
            <span
              className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--ledger-ink)] inline-flex items-center gap-1.5"
              aria-hidden="true"
            >
              {current ? 'Continue' : isDone ? 'Review' : 'Start'} →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
