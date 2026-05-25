'use client';

// LessonCoachDrawer — PRD §11 "Ask the AI Coach" drawer for m0.2.
//
// Static-chip version (Wave B). Six suggested questions render canned
// answers from src/content/addie/m0-coach.ts. No model call. The hybrid
// free-text route (bounded sandbox-gateway AI with PII pre-scan) is a
// follow-up commit — see foundation-e2e-and-gap-report-2026-05-24.md
// for the next-up tickets.
//
// Layout:
//   - Desktop ≥ md: fixed right-side drawer, toggled by a tab on the
//     right edge of the viewport. Drawer is 360px wide.
//   - Mobile: floating round button bottom-right; opens as full-height
//     bottom sheet.
//   - Focus-trapped on open. ESC closes. Reduced-motion respected.
//   - Never blocks lesson progress (the drawer overlays content; the
//     stepper stays usable underneath via the close affordance).

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { M0_COACH_CHIPS, type CoachChip } from '@/content/addie/m0-coach';

export function LessonCoachDrawer() {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setOpen(false);
    // Return focus to the trigger button.
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  // ESC + simple focus trap.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab' || !drawerRef.current) return;
      const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
        'a, button, textarea, input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    // Focus the close button on open so screen-reader users land in the drawer.
    window.setTimeout(() => {
      const closeBtn = drawerRef.current?.querySelector<HTMLElement>(
        'button[data-coach-close]',
      );
      closeBtn?.focus();
    }, 0);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  const selected = selectedId
    ? M0_COACH_CHIPS.find((c) => c.id === selectedId) ?? null
    : null;

  return (
    <>
      {/* Trigger — fixed bottom-right on mobile, right-edge tab on desktop */}
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open the AI Coach"
        aria-expanded={open}
        aria-controls={titleId}
        onClick={() => setOpen(true)}
        className={
          'no-print fixed z-30 transition-colors duration-[120ms] focus:outline-none focus:ring-2 focus:ring-[var(--ledger-accent)] focus:ring-offset-2 ' +
          // Mobile: bottom-right pill
          'bottom-24 right-4 px-4 py-2.5 rounded-[2px] bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)] font-mono uppercase tracking-[0.16em] text-[0.65rem] shadow-[var(--ledger-shadow)] ' +
          // Desktop: vertical tab on right edge, anchored mid-screen
          'md:bottom-auto md:right-0 md:top-1/2 md:-translate-y-1/2 md:rounded-l-[3px] md:rounded-r-none md:px-3 md:py-5 md:text-[0.6rem] md:tracking-[0.2em] md:writing-mode-vertical'
        }
        style={{
          // Tailwind doesn't ship writing-mode utilities by default.
          writingMode: 'vertical-rl' as const,
        }}
      >
        Ask the Coach
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="no-print fixed inset-0 z-40 flex items-stretch justify-end"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close coach drawer"
            onClick={close}
            className="absolute inset-0 bg-[color-mix(in_srgb,var(--ledger-ink)_40%,transparent)] motion-reduce:bg-[var(--ledger-ink)]/40"
          />
          {/* Panel */}
          <aside
            ref={drawerRef}
            className={
              'relative w-full md:w-[360px] bg-[var(--ledger-paper)] border-l border-[var(--ledger-rule-strong)] shadow-[var(--ledger-shadow)] flex flex-col ' +
              'h-full overflow-y-auto'
            }
          >
            <header className="sticky top-0 bg-[var(--ledger-paper)] border-b border-[var(--ledger-rule)] px-5 py-4 flex items-baseline justify-between gap-3">
              <div>
                <div className="font-mono uppercase tracking-[0.18em] text-[0.6rem] text-[var(--ledger-accent)]">
                  Module 0 · data discipline
                </div>
                <h2
                  id={titleId}
                  className="font-serif text-[1.25rem] text-[var(--ledger-ink)] leading-tight"
                >
                  Ask the AI Coach
                </h2>
              </div>
              <button
                type="button"
                data-coach-close
                onClick={close}
                className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ledger-accent)] focus:ring-offset-2 px-2 py-1 rounded-[2px]"
                aria-label="Close coach drawer"
              >
                Close ×
              </button>
            </header>

            <div className="px-5 py-4 flex-1">
              {selected ? (
                <CoachAnswer chip={selected} onBack={() => setSelectedId(null)} />
              ) : (
                <CoachChipList onSelect={setSelectedId} />
              )}
            </div>

            <footer className="border-t border-[var(--ledger-rule)] px-5 py-3 text-[0.7rem] text-[var(--ledger-muted)]">
              The Coach reinforces the rule. It cannot approve real data sharing
              or speak for your institution&apos;s policy. When in doubt, ask
              your manager or compliance team.
            </footer>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function CoachChipList({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)]">
        Common questions
      </p>
      <ul className="space-y-2">
        {M0_COACH_CHIPS.map((chip) => (
          <li key={chip.id}>
            <button
              type="button"
              onClick={() => onSelect(chip.id)}
              className="w-full text-left rounded-[3px] border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] hover:border-[var(--ledger-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ledger-accent)] focus:ring-offset-2 transition-colors duration-[120ms] px-3 py-2.5"
            >
              <span className="font-serif text-[0.95rem] text-[var(--ledger-ink)] leading-snug">
                {chip.question}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="font-mono uppercase tracking-[0.14em] text-[0.55rem] text-[var(--ledger-muted)] pt-2">
        Free-text coach coming next release.
      </p>
    </div>
  );
}

function CoachAnswer({ chip, onBack }: { chip: CoachChip; onBack: () => void }) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onBack}
        className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ledger-accent)] focus:ring-offset-2 px-1 py-0.5 rounded-[2px]"
      >
        ← All questions
      </button>
      <h3 className="font-serif text-[1.0625rem] text-[var(--ledger-ink)] leading-snug">
        {chip.question}
      </h3>
      <p className="font-serif text-[0.95rem] leading-[1.6] text-[var(--ledger-ink-2)]">
        {chip.answer}
      </p>
    </div>
  );
}
