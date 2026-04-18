'use client';

// ThreeFears — rotating CEO questions with answers.
// Shows one fear at a time with a crossfade, auto-advances every 8s.
// Compact single-column layout instead of a 3-card grid.

import { useState, useEffect, useCallback } from 'react';

interface Fear {
  readonly fear: string;
  readonly answer: string;
  readonly accent: string;
}

const FEARS: readonly Fear[] = [
  {
    fear: 'My people can\u2019t do this.',
    answer:
      'Start with personal experimentation. Every banker on your team uses AI for their own workflow before anything goes to production. Once the teller who saves 90 minutes on Tuesdays tells the one next to her, adoption stops being a change-management problem.',
    accent: 'var(--color-sage)',
  },
  {
    fear: 'It is not safe for a regulated institution.',
    answer:
      'Every recommendation maps to a specific framework: SR 11-7 for model risk, Interagency TPRM Guidance for vendors, ECOA/Reg B for fair lending, and the AIEOG AI Lexicon for shared vocabulary. We bring the governance posture to the first meeting, not the last.',
    accent: 'var(--color-cobalt)',
  },
  {
    fear: 'I cannot justify the cost.',
    answer:
      'Every engagement leads with the math. The Quick Win Sprint carries a 90-day ROI guarantee \u2014 if three implemented automations do not deliver measured time savings within a quarter, we refund the engagement fee.',
    accent: 'var(--color-terra)',
  },
];

const CYCLE_MS = 8000;

export function ThreeFears() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const advance = useCallback((to: number) => {
    setVisible(false);
    setTimeout(() => {
      setIndex(to);
      setVisible(true);
    }, 300);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      advance((index + 1) % FEARS.length);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, [index, advance]);

  const fear = FEARS[index];

  return (
    <section className="px-6 py-14 md:py-20">
      <div className="max-w-3xl mx-auto text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-6">
          Every bank CEO has the same three questions
        </p>

        {/* Rotating fear + answer */}
        <div
          className="min-h-[200px] flex flex-col items-center justify-center transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <h2
            className="font-serif italic text-3xl md:text-4xl leading-tight mb-6"
            style={{ color: fear.accent }}
          >
            &ldquo;{fear.fear}&rdquo;
          </h2>
          <p className="text-base md:text-lg text-[color:var(--color-ink)]/80 leading-relaxed max-w-2xl">
            {fear.answer}
          </p>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {FEARS.map((f, i) => (
            <button
              key={i}
              type="button"
              onClick={() => advance(i)}
              className="group flex items-center gap-2 py-2 px-1 transition-all"
              aria-label={`Question ${i + 1}: ${f.fear}`}
            >
              <span
                className="block w-8 h-[2px] rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i === index ? f.accent : 'var(--color-ink)',
                  opacity: i === index ? 1 : 0.15,
                  width: i === index ? '2rem' : '1rem',
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
