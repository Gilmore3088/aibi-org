'use client';

import type { Tier } from '@content/assessments/v2/scoring';
import { MATURITY_LADDER, TIER_TO_RUNG } from '@content/assessments/v2/personalization';

interface MaturityLadderProps {
  readonly tierId: Tier['id'];
}

/**
 * Six-rung maturity ladder with a "you are here" pin. Gives the
 * reader visible context for where they sit today and what the next
 * stages look like. Rendered between Strengths-and-Gaps and the
 * First Move on the on-screen brief.
 */
export function MaturityLadder({ tierId }: MaturityLadderProps) {
  const currentRung = TIER_TO_RUNG[tierId];

  return (
    <section className="space-y-8" aria-labelledby="maturity-ladder-heading">
      <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        Maturity ladder
      </p>
      <h2
        id="maturity-ladder-heading"
        className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]"
      >
        Where you are. Where this leads.
      </h2>
      <p className="text-[15px] leading-[1.6] text-[color:var(--color-ink)]/75 max-w-2xl">
        Six stages describe the arc from individual experimentation to
        institutional advantage. Your current rung is pinned below.
        The rungs above it are the trajectory — not a promise, but the
        shape of what compounding looks like.
      </p>

      <ol
        className="border-l-2 border-[color:var(--color-ink)]/20 space-y-6 pl-7"
        aria-label="Six-rung AI maturity ladder"
      >
        {MATURITY_LADDER.map((rung, idx) => {
          const isCurrent = idx === currentRung;
          const isBelow = idx < currentRung;
          return (
            <li
              key={rung.label}
              aria-current={isCurrent ? 'step' : undefined}
              className="relative"
            >
              <span
                aria-hidden
                className={
                  'absolute -left-[37px] top-1 inline-flex items-center justify-center h-7 w-7 rounded-full font-mono text-[11px] tabular-nums font-semibold ' +
                  (isCurrent
                    ? 'bg-[color:var(--color-terra)] text-[color:var(--color-linen)] ring-4 ring-[color:var(--color-terra)]/20'
                    : isBelow
                      ? 'bg-[color:var(--color-ink)]/70 text-[color:var(--color-linen)]'
                      : 'bg-[color:var(--color-linen)] text-[color:var(--color-ink)]/60 border border-[color:var(--color-ink)]/30')
                }
              >
                {idx + 1}
              </span>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h3
                  className={
                    'font-serif text-xl leading-tight ' +
                    (isCurrent
                      ? 'text-[color:var(--color-terra)]'
                      : 'text-[color:var(--color-ink)]')
                  }
                >
                  {rung.label}
                </h3>
                {isCurrent ? (
                  <span className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-terra)]">
                    You are here
                  </span>
                ) : null}
              </div>
              <p
                className={
                  'mt-2 text-[14.5px] leading-[1.55] ' +
                  (isBelow
                    ? 'text-[color:var(--color-ink)]/55'
                    : 'text-[color:var(--color-ink)]/80')
                }
              >
                {rung.description}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
