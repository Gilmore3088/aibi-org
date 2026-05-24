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
//   - No nav chrome; CTA is the only commit surface
//   - Subtle gold rule line beneath the statement
//   - Enter, Space, or "I'm ready" button advances (commit gestures only)
//
// Audit A5 (2026-05-24) — WCAG 2.1.2: Escape no longer advances the
// dialog. The previous keymap bound Esc to handleContinue(), meaning a
// keyboard user pressing the standard cancel key would unintentionally
// acknowledge the sacred rule. Now Escape just refocuses the CTA
// button (a safe no-op); the user must press Enter, Space, or click to
// acknowledge. Tab continues to focus the single CTA (single-focus
// modal, not a keyboard trap).
//
// This is the only currently-existing screen that takes over the full
// viewport. Use sparingly — a maximum of 1-2 sacred moments across the
// whole Foundation Course.

import { useCallback, useEffect, useRef, useState } from 'react';

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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Capture the previously-focused element so we can restore on close.
    previouslyFocused.current = (document.activeElement as HTMLElement | null) ?? null;

    // Lock background scroll while the sacred moment is displayed.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Tiny delay then reveal — gives the dark background a moment to land
    // before the rule appears. Reading order: blackout → kicker → rule.
    const t = setTimeout(() => {
      setRevealed(true);
      // Move focus into the dialog once the rule is on-screen, so screen-
      // reader users land on the actionable element and keyboard users can
      // dismiss without hunting.
      buttonRef.current?.focus();
    }, 250);

    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, []);

  const handleContinue = useCallback(() => {
    onContinue();
  }, [onContinue]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Commit gestures — only explicit acknowledgement advances. Escape
      // is intentionally NOT a commit; see A5 audit note above.
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleContinue();
        return;
      }
      // Escape — safe no-op. Refocus the CTA so the user can re-engage
      // without hunting. This is the WCAG 2.1.2 fix: the cancel key
      // can't accidentally commit the user past a sacred rule.
      if (e.key === 'Escape') {
        e.preventDefault();
        buttonRef.current?.focus();
        return;
      }
      // Trivial focus-trap: only the Continue button is focusable, so Tab
      // always loops back to it. This keeps focus inside the dialog without
      // a full trap library.
      if (e.key === 'Tab') {
        e.preventDefault();
        buttonRef.current?.focus();
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
      aria-labelledby="sacred-rule-kicker"
      aria-describedby="sacred-rule-text"
    >
      <div
        className={
          'max-w-[40ch] text-center transition-opacity duration-[600ms] ' +
          (revealed ? 'opacity-100' : 'opacity-0')
        }
      >
        <div
          id="sacred-rule-kicker"
          className="font-mono uppercase tracking-[0.28em] text-[0.7rem] text-[var(--ledger-accent)] mb-8"
        >
          {kicker}
        </div>
        <p
          id="sacred-rule-text"
          className="font-serif text-[2rem] sm:text-[3rem] leading-[1.15] text-[var(--ledger-paper)]"
        >
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
        ref={buttonRef}
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
