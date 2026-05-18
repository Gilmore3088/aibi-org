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
      <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        What this looks like in practice
      </p>
      <h2
        id="practice-picture-heading"
        className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]"
      >
        How this shows up inside the bank.
      </h2>
      <p className="text-[15px] leading-[1.6] text-[color:var(--color-ink)]/75 max-w-2xl">
        Most institutions at your stage share a few patterns by role.
        Find yours first — the rest of the briefing is keyed to the
        operating reality of that work.
      </p>

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        {rows.map((row, idx) => (
          <article
            key={row.role}
            className="border border-[color:var(--color-ink)]/25 rounded-[3px] bg-[color:var(--color-linen)] p-6 md:p-7 flex flex-col gap-4"
          >
            <header className="flex items-baseline justify-between gap-4 pb-4 border-b border-[color:var(--color-ink)]/20">
              <p className="font-serif-sc text-[13px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
                {row.role}
              </p>
              <p className="font-mono text-[11px] tabular-nums text-[color:var(--color-ink)]/50 tracking-[0.16em]">
                {String(idx + 1).padStart(2, '0')} / {String(rows.length).padStart(2, '0')}
              </p>
            </header>
            <p className="text-[16px] md:text-[17px] leading-[1.6] text-[color:var(--color-ink)]/85">
              {row.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
