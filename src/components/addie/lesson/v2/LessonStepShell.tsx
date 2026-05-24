'use client';

// LessonStepShell — the v2 lesson container. Presents one focused screen
// at a time instead of a dense scroll. Inspired by banking operations
// pages (one decision per screen) rather than LMS course pages.
//
// Pattern:
//   - Top: kicker · step progress dots · step name
//   - Middle: ONE focused panel — the step content
//   - Bottom: single persistent nav (Back · n of N · Next)
//   - Keyboard: ←/→ to step, J/K alternates
//
// The shell does no content rendering itself — children supply the per-step
// panels. The shell owns step state, progress UI, navigation, and the
// keyboard model.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface Step {
  readonly id: string;
  readonly label: string;       // mono-caps step name e.g. "Learn"
  readonly title: string;       // h1 for this step
  readonly node: React.ReactNode;
  /** Disable Next until the learner does something. Step-owned. */
  readonly nextDisabled?: boolean;
  /** Override the Next button label per-step (default "Next"). */
  readonly nextLabel?: string;
}

interface LessonStepShellProps {
  readonly steps: readonly Step[];
  readonly moduleLabel: string;     // "MODULE 0 · ORIENTATION"
  readonly lessonOrdinalOfTotal: string; // "Lesson 2 of 2"
  readonly lessonTitle: string;
  readonly onComplete?: () => void; // called when the learner clicks Next on the last step
}

export function LessonStepShell({
  steps,
  moduleLabel,
  lessonOrdinalOfTotal,
  lessonTitle,
  onComplete,
}: LessonStepShellProps) {
  const [idx, setIdx] = useState(0);
  const step = steps[idx];
  const isLast = idx === steps.length - 1;
  const stepHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const lastIdxRef = useRef(idx);

  const goTo = useCallback(
    (n: number) => {
      const clamped = Math.max(0, Math.min(steps.length - 1, n));
      setIdx(clamped);
      // Scroll to top of the panel on step change for predictable focus.
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [steps.length],
  );

  // Audit A11 (2026-05-24): scroll-to-top alone leaves keyboard / screen-
  // reader users unannounced of the new step. Move focus to the step
  // heading on idx change so the assistive-tech reading order restarts
  // at the new step's title. tabIndex={-1} keeps the heading out of the
  // normal tab order while still focusable programmatically.
  useEffect(() => {
    if (idx !== lastIdxRef.current) {
      lastIdxRef.current = idx;
      // Defer to next paint so the new heading text is in the DOM before
      // focus() — without the rAF, screen readers can read the old text.
      requestAnimationFrame(() => {
        stepHeadingRef.current?.focus();
      });
    }
  }, [idx]);

  const next = useCallback(() => {
    if (step.nextDisabled) return;
    if (isLast) {
      onComplete?.();
      return;
    }
    goTo(idx + 1);
  }, [step.nextDisabled, isLast, idx, goTo, onComplete]);

  const prev = useCallback(() => goTo(idx - 1), [idx, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      }
      if (e.key === 'ArrowRight' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  // Progress dots — show completed (filled), current (gold), upcoming (rule).
  const dots = useMemo(
    () =>
      steps.map((s, i) => ({
        id: s.id,
        label: s.label,
        state: i < idx ? 'done' : i === idx ? 'current' : 'upcoming',
      })),
    [steps, idx],
  );

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-muted)] mb-1">
          {moduleLabel} · {lessonOrdinalOfTotal}
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl leading-tight text-[var(--ledger-ink)]">
          {lessonTitle}
        </h1>

        {/* Step progress strip */}
        <ol className="mt-5 grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {dots.map((d, i) => (
            <li key={d.id} className="flex flex-col items-start gap-1.5">
              <button
                type="button"
                onClick={() => goTo(i)}
                className={
                  'h-1 w-full transition-colors duration-[120ms] ' +
                  (d.state === 'done'
                    ? 'bg-[var(--ledger-ink)]'
                    : d.state === 'current'
                      ? 'bg-[var(--ledger-accent)]'
                      : 'bg-[var(--ledger-rule)] hover:bg-[var(--ledger-rule-strong)]')
                }
                aria-label={`Jump to step ${i + 1}: ${d.label}`}
              />
              <span
                className={
                  'font-mono uppercase tracking-[0.16em] text-[0.6rem] tabular-nums ' +
                  (d.state === 'done'
                    ? 'text-[var(--ledger-ink-2)]'
                    : d.state === 'current'
                      ? 'text-[var(--ledger-accent)]'
                      : 'text-[var(--ledger-muted)]')
                }
              >
                {String(i + 1).padStart(2, '0')} · {d.label}
              </span>
            </li>
          ))}
        </ol>
      </header>

      {/* Step title strip */}
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)]">
          {step.label}
        </span>
        <span aria-hidden="true" className="flex-1 h-px bg-[var(--ledger-rule)]" />
      </div>

      {/* The focused step panel */}
      <section
        key={step.id}
        className="min-h-[60vh]"
        aria-labelledby={`step-heading-${step.id}`}
      >
        <h2
          id={`step-heading-${step.id}`}
          ref={stepHeadingRef}
          tabIndex={-1}
          className="font-serif text-[1.75rem] sm:text-[2.25rem] leading-tight text-[var(--ledger-ink)] mb-6 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ledger-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--ledger-bg)]"
        >
          {step.title}
        </h2>
        <div>{step.node}</div>
      </section>

      {/* Single persistent bottom nav */}
      <nav className="mt-12 pt-5 border-t border-[var(--ledger-rule)] flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={prev}
          disabled={idx === 0}
          className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Back
        </button>
        <span className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)] tabular-nums">
          {idx + 1} / {steps.length}
        </span>
        <button
          type="button"
          onClick={next}
          disabled={step.nextDisabled}
          className="px-4 py-2 bg-[var(--ledger-ink)] text-[var(--ledger-paper)] font-mono uppercase tracking-[0.16em] text-[0.65rem] rounded-[2px] hover:bg-[var(--ledger-ink-2)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-[120ms]"
        >
          {step.nextLabel ?? (isLast ? 'Finish lesson' : 'Next')} →
        </button>
      </nav>
    </div>
  );
}
