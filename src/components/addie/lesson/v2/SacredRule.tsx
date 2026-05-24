'use client';

// SacredRule — full-bleed dark-mode immersive moment.
// Per the Transformation Vision: "The 'One Rule That Matters' lesson
// should not look like another content page. That lesson is your
// philosophy. It should feel sacred."
//
// Render mode:
//   - Black ink background (--ledger-ink), covers the entire viewport
//   - Centered single statement at display scale
//   - "BANK-SAFE AI BEGINS HERE" mono-caps kicker above
//   - No nav chrome until tap-anywhere to advance
//   - Subtle gold rule line beneath the statement
//   - Esc or "I'm ready" button advances
//
// This is the only currently-existing screen that takes over the full
// viewport. Use sparingly — a maximum of 1-2 sacred moments across the
// whole Foundation Course.

import { useCallback, useEffect, useState } from 'react';

interface SacredRuleProps {
  readonly kicker: string;          // "BANK-SAFE AI BEGINS HERE"
  readonly rule: string;             // the single load-bearing sentence
  readonly attribution?: string;     // optional small attribution line
  readonly continueLabel?: string;   // override default "I'm ready" CTA
  readonly onContinue: () => void;
}

export function SacredRule({
  kicker,
  rule,
  attribution,
  continueLabel = "I'm ready",
  onContinue,
}: SacredRuleProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Tiny delay then reveal — gives the dark background a moment to land
    // before the rule appears. Reading order: blackout → kicker → rule.
    const t = setTimeout(() => setRevealed(true), 250);
    return () => clearTimeout(t);
  }, []);

  const handleContinue = useCallback(() => {
    onContinue();
  }, [onContinue]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        handleContinue();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleContinue]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-[var(--ledger-ink)] flex flex-col items-center justify-center px-6 sm:px-12"
      role="dialog"
      aria-modal="true"
      aria-label="Foundation rule"
    >
      <div
        className={
          'max-w-[40ch] text-center transition-opacity duration-[600ms] ' +
          (revealed ? 'opacity-100' : 'opacity-0')
        }
      >
        <div className="font-mono uppercase tracking-[0.28em] text-[0.7rem] text-[var(--ledger-accent)] mb-8">
          {kicker}
        </div>
        <p className="font-serif text-[2rem] sm:text-[3rem] leading-[1.15] text-[var(--ledger-paper)]">
          {rule}
        </p>
        <div className="mt-10 mx-auto w-24 h-px bg-[var(--ledger-accent)]" aria-hidden="true" />
        {attribution ? (
          <p className="mt-6 font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-soft)]">
            {attribution}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleContinue}
        className={
          'fixed bottom-12 px-6 py-3 font-mono uppercase tracking-[0.2em] text-[0.7rem] text-[var(--ledger-accent)] hover:text-[var(--ledger-paper)] transition-all duration-[300ms] ' +
          (revealed ? 'opacity-100' : 'opacity-0')
        }
        aria-label="Acknowledge and continue"
      >
        {continueLabel} →
      </button>

      <span
        className={
          'fixed bottom-3 font-mono uppercase tracking-[0.18em] text-[0.55rem] text-[var(--ledger-soft)] ' +
          (revealed ? 'opacity-60' : 'opacity-0')
        }
      >
        Press Enter or tap to continue
      </span>
    </div>
  );
}
