'use client';

import { questions } from '@content/assessments/v1/questions';
import type { Tier } from '@content/assessments/v1/scoring';
import { ScoreRing } from './ScoreRing';

interface ResultsViewProps {
  readonly score: number;
  readonly tier: Tier;
  readonly answers: readonly number[];
}

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ??
  'https://calendly.com/aibi/executive-briefing';

export function ResultsView({ score, tier, answers }: ResultsViewProps) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-16">
      <div className="flex flex-col items-center">
        <ScoreRing
          score={score}
          minScore={8}
          maxScore={32}
          colorVar={tier.colorVar}
          label={tier.label}
        />
        <h2 className="font-serif text-3xl md:text-4xl text-center mt-8 max-w-xl text-[color:var(--color-ink)]">
          {tier.headline}
        </h2>
        <p className="text-lg text-[color:var(--color-ink)]/75 text-center mt-4 max-w-2xl leading-relaxed">
          {tier.summary}
        </p>
      </div>

      <section>
        <h3 className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/60 mb-6">
          Your 8-dimension breakdown
        </h3>
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const points = answers[idx] ?? 0;
            return (
              <div key={q.id} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-lg text-[color:var(--color-ink)]">
                    {q.dimension}
                  </span>
                  <span className="font-mono text-xs text-[color:var(--color-ink)]/50">
                    {points} / 4
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={
                        'h-2 flex-1 ' +
                        (bar <= points
                          ? 'bg-[color:var(--color-terra)]'
                          : 'bg-[color:var(--color-ink)]/10')
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 p-8 md:p-12 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-terra)] mb-3">
          Next step
        </p>
        <h3 className="font-serif text-3xl md:text-4xl mb-4 text-[color:var(--color-ink)]">
          Book a free 45-minute Executive Briefing
        </h3>
        <p className="text-[color:var(--color-ink)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
          We will walk through what your score means for your institution, share
          peer benchmarks from FDIC call report data, and outline a 90-day path
          forward. No pitch, no obligation.
        </p>
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra-light)] transition-colors"
        >
          Schedule my briefing
        </a>
      </section>
    </div>
  );
}
