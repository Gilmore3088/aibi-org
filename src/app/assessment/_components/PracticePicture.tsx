'use client';

import type { Tier } from '@content/assessments/v2/scoring';
import { PRACTICE_PICTURE } from '@content/assessments/v2/personalization';

interface PracticePictureProps {
  readonly tierId: Tier['id'];
}

/**
 * Recognition copy by internal role — operations, compliance/risk,
 * managers, executives — laid out as a 2×2 quadrant. Reads as a panel
 * of cards instead of a dense list. Goal: a reader scanning the page
 * meets their own role first, then their boss's, in under five
 * seconds.
 */
export function PracticePicture({ tierId }: PracticePictureProps) {
  const rows = PRACTICE_PICTURE[tierId];
  return (
    <section className="space-y-6" aria-labelledby="practice-picture-heading">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--gold)]">
        What this looks like in practice
      </p>
      <h2
        id="practice-picture-heading"
        className="text-3xl md:text-4xl leading-tight text-[color:var(--ink)]"
      >
        How this shows up inside the bank.
      </h2>
      <p className="text-[0.9375rem] leading-[1.6] text-[color:var(--ink)]/75 max-w-2xl">
        Most institutions at your stage share a few patterns by role.
        Find yours first — the rest of the briefing is keyed to the
        operating reality of that work.
      </p>

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        {rows.map((row, idx) => (
          <article
            key={row.role}
            className="border border-[color:var(--ink)]/25 rounded-2xl bg-[color:var(--cream)] p-6 md:p-7 flex flex-col gap-4"
          >
            <header className="flex items-baseline justify-between gap-4 pb-4 border-b border-[color:var(--ink)]/20">
              <p className="text-[0.8125rem] uppercase tracking-[0.2em] text-[color:var(--gold)]">
                {row.role}
              </p>
              <p className="text-[0.6875rem] tabular-nums text-[color:var(--ink)]/50 tracking-[0.16em]">
                {String(idx + 1).padStart(2, '0')} / {String(rows.length).padStart(2, '0')}
              </p>
            </header>
            <p className="text-[1rem] md:text-[1.0625rem] leading-[1.6] text-[color:var(--ink)]/85">
              {row.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
