'use client';

// HeroRotating — cycles through four headline messages that each hit
// a different emotional register: competition, empowerment, outcomes,
// practical clarity. Smooth crossfade transition, 6-second interval.

import { useState, useEffect } from 'react';
import Link from 'next/link';

const HEADLINES = [
  {
    line: 'The big banks are spending billions on AI.',
    emphasis: 'Your advantage is your people.',
  },
  {
    line: 'Your tellers, your loan officers, your compliance team —',
    emphasis: 'they just need someone to show them how.',
  },
  {
    line: 'Every community bank has someone who could save the team ten hours a week',
    emphasis: 'if someone showed them how.',
  },
  {
    line: 'We train community bankers to use AI —',
    emphasis: 'safely, professionally, and without a six-figure budget.',
  },
] as const;

const CYCLE_MS = 6000;

export function HeroRotating() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % HEADLINES.length);
        setVisible(true);
      }, 400);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, []);

  const headline = HEADLINES[index];

  return (
    <section className="px-6 pt-16 pb-16 md:pt-24 md:pb-20">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        {/* Rotating headline */}
        <div className="min-h-[140px] md:min-h-[180px] flex items-center justify-center">
          <h1
            className="font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.08] text-[color:var(--color-ink)] transition-opacity duration-400 ease-out"
            style={{ opacity: visible ? 1 : 0 }}
          >
            {headline.line}
            <br />
            <span className="text-[color:var(--color-terra)] italic">
              {headline.emphasis}
            </span>
          </h1>
        </div>

        {/* Stable tagline + CTAs — these never rotate */}
        <p className="font-serif-sc text-xl md:text-2xl text-[color:var(--color-terra)] tracking-wide">
          Turning Bankers into Builders
        </p>

        <p className="text-base md:text-lg text-[color:var(--color-ink)]/75 max-w-2xl mx-auto leading-relaxed">
          AI proficiency and transformation built exclusively for community
          banks and credit unions.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/assessment/start"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
          >
            Take the Free Assessment
          </Link>
          <Link
            href="#roi-calculator"
            className="inline-block px-8 py-4 border border-[color:var(--color-ink)]/30 text-[color:var(--color-ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] transition-colors"
          >
            Model Your ROI
          </Link>
        </div>

        <p className="font-mono text-xs text-[color:var(--color-slate)] pt-4">
          8 questions &middot; under 3 minutes &middot; community banks only
        </p>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 pt-2" aria-hidden="true">
          {HEADLINES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setVisible(false); setTimeout(() => { setIndex(i); setVisible(true); }, 400); }}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i === index ? 'var(--color-terra)' : 'var(--color-ink)',
                opacity: i === index ? 1 : 0.15,
              }}
              aria-label={`Show headline ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
