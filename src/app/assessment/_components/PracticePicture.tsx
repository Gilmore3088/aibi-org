'use client';

import type { Tier } from '@content/assessments/v2/scoring';
import { PRACTICE_PICTURE } from '@content/assessments/v2/personalization';

interface PracticePictureProps {
  readonly tierId: Tier['id'];
}

/**
 * "What this looks like in practice" — recognition copy by internal
 * role (operations / compliance / managers / executives). Sits between
 * the Diagnosis and the Big Insight on the on-screen brief. Job is to
 * earn "they understand us" in under thirty seconds of reading.
 */
export function PracticePicture({ tierId }: PracticePictureProps) {
  const rows = PRACTICE_PICTURE[tierId];
  return (
    <section className="space-y-8" aria-labelledby="practice-picture-heading">
      <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        What this looks like in practice
      </p>
      <h2
        id="practice-picture-heading"
        className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]"
      >
        How this shows up inside the bank.
      </h2>
      <dl className="border-t border-[color:var(--color-ink)]/15">
        {rows.map((row) => (
          <div
            key={row.role}
            className="grid gap-3 md:grid-cols-[200px_1fr] md:gap-8 py-5 border-b border-[color:var(--color-ink)]/15"
          >
            <dt className="font-serif-sc text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-terra)] md:pt-1">
              {row.role}
            </dt>
            <dd className="text-[15px] leading-[1.6] text-[color:var(--color-ink)]/85">
              {row.body}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
