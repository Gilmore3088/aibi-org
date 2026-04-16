'use client';

import { useState } from 'react';
import Link from 'next/link';
import { questions } from '@content/assessments/v1/questions';

// Show Q6 (Security Posture) as the sample — it differentiates us from
// generic AI assessments by being specific to regulated institutions.
const SAMPLE = questions[5];

export function SampleQuestion() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className="px-6 py-14 md:py-20 bg-[color:var(--color-parch)]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-4">
            Interactive preview
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight">
            Experience a sample question.
          </h2>
          <p className="text-[color:var(--color-ink)]/75 mt-4 max-w-xl mx-auto leading-relaxed">
            This is one of eight questions from the free AI readiness
            assessment. Each question maps to a specific dimension of
            institutional AI maturity.
          </p>
        </div>

        <div className="bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 md:p-10">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            {SAMPLE.dimension}
          </p>
          <h3 className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight mb-8">
            {SAMPLE.prompt}
          </h3>

          <div className="space-y-3">
            {SAMPLE.options.map((option, idx) => {
              const isSelected = selected === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelected(idx)}
                  className={
                    'w-full text-left px-5 py-4 border transition-colors flex gap-4 items-start ' +
                    (isSelected
                      ? 'border-[color:var(--color-terra)] bg-[color:var(--color-terra-pale)]/30'
                      : 'border-[color:var(--color-ink)]/15 hover:border-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-pale)]/10')
                  }
                >
                  <span
                    className={
                      'flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs mt-0.5 transition-colors ' +
                      (isSelected
                        ? 'border-[color:var(--color-terra)] bg-[color:var(--color-terra)] text-[color:var(--color-linen)]'
                        : 'border-[color:var(--color-ink)]/30 text-[color:var(--color-ink)]/70')
                    }
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-sans text-base text-[color:var(--color-ink)] leading-snug pt-1">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="mt-8 pt-6 border-t border-[color:var(--color-ink)]/10 text-center">
              <p className="text-[color:var(--color-ink)]/75 mb-4 leading-relaxed">
                That is one of eight dimensions. The full assessment takes
                under three minutes and gives you an institutional tier
                placement, a dimension breakdown, and personalized next
                steps.
              </p>
              <Link
                href="/assessment"
                className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
              >
                Take the Full Assessment
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
