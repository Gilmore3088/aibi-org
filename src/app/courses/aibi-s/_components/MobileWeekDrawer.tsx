'use client';

// MobileWeekDrawer — Hamburger-triggered slide-out drawer for mobile (below lg)
// Client Component: requires useState for open/close state
// Cobalt accent color throughout (AiBI-S uses --color-cobalt)

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { weeks, PHASE_META } from '@content/courses/aibi-s';
import type { Phase } from '@content/courses/aibi-s';

interface MobileWeekDrawerProps {
  readonly completedWeeks: readonly number[];
  readonly currentWeek: number;
}

const PHASE_ORDER: Phase[] = ['foundation', 'first-build', 'scale-and-orchestrate'];

function getWeekStatus(
  weekNumber: number,
  completedWeeks: readonly number[],
  currentWeek: number,
): 'completed' | 'current' | 'locked' {
  if (completedWeeks.includes(weekNumber)) return 'completed';
  if (weekNumber === currentWeek) return 'current';
  return 'locked';
}

export function MobileWeekDrawer({ completedWeeks, currentWeek }: MobileWeekDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, close]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const weeksByPhase = PHASE_ORDER.map((phase) => ({
    phase,
    meta: PHASE_META[phase],
    items: weeks.filter((w) => w.phase === phase),
  }));

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-[color:var(--color-ink)] hover:text-[color:var(--color-cobalt)] transition-colors"
        aria-label="Open week navigation"
        aria-expanded={isOpen}
        aria-controls="mobile-week-nav"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[color:var(--color-ink)]/40 z-50 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        id="mobile-week-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Week navigation"
        className={`fixed left-0 top-0 h-full w-72 bg-[color:var(--color-linen)] z-50 flex flex-col lg:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--color-cobalt)]/10 h-16">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold text-[color:var(--color-cobalt)]"
              style={{ border: '1.5px solid var(--color-cobalt)' }}
            >
              Ai
            </div>
            <div className="text-[color:var(--color-ink)] font-bold text-sm font-serif leading-tight">
              AiBI-S
            </div>
          </div>
          <button
            onClick={close}
            className="p-1 text-[color:var(--color-slate)] hover:text-[color:var(--color-cobalt)] transition-colors"
            aria-label="Close week navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Week nav */}
        <nav className="flex-1 overflow-y-auto py-2" aria-label="Course weeks">
          {weeksByPhase.map(({ phase, meta, items }) => (
            <div key={phase} className="mb-1">
              <div
                className="px-6 py-2 text-[10px] uppercase font-mono tracking-[0.2em] font-bold"
                style={{ color: meta.colorVar }}
              >
                {meta.label}
              </div>

              {items.map((week) => {
                const status = getWeekStatus(week.number, completedWeeks, currentWeek);
                const formattedNumber = `W${week.number}`;

                if (status === 'locked') {
                  return (
                    <div
                      key={week.number}
                      className="flex items-center gap-3 px-6 py-2.5 opacity-40 cursor-not-allowed"
                    >
                      <span className="font-mono text-[10px] w-6 text-[color:var(--color-dust)] shrink-0">
                        {formattedNumber}
                      </span>
                      <span className="font-serif text-xs text-[color:var(--color-ink)] flex-1 leading-tight">
                        {week.title}
                      </span>
                      <svg className="w-3 h-3 text-[color:var(--color-dust)] shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  );
                }

                if (status === 'current') {
                  return (
                    <Link
                      key={week.number}
                      href={`/courses/aibi-s/${week.number}`}
                      onClick={close}
                      className="flex items-center gap-3 px-6 py-2.5 bg-[color:var(--color-parch-dark)] font-bold transition-colors"
                      aria-current="page"
                    >
                      <span className="font-mono text-[10px] w-6 font-bold text-[color:var(--color-cobalt)] shrink-0">
                        {formattedNumber}
                      </span>
                      <span className="font-serif text-xs text-[color:var(--color-cobalt)] flex-1 leading-tight">
                        {week.title}
                      </span>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={week.number}
                    href={`/courses/aibi-s/${week.number}`}
                    onClick={close}
                    className="flex items-center gap-3 px-6 py-2.5 hover:bg-[color:var(--color-parch)] transition-colors"
                  >
                    <span className="font-mono text-[10px] w-6 text-[color:var(--color-dust)] shrink-0">
                      {formattedNumber}
                    </span>
                    <span className="font-serif text-xs text-[color:var(--color-ink)] flex-1 leading-tight">
                      {week.title}
                    </span>
                    <svg className="w-3 h-3 shrink-0 text-[color:var(--color-cobalt)]" fill="currentColor" viewBox="0 0 20 20" aria-label="Completed">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-[color:var(--color-cobalt)]/10 space-y-3">
          <Link
            href={`/courses/aibi-s/${currentWeek}`}
            onClick={close}
            className="w-full bg-[color:var(--color-cobalt)] hover:opacity-90 text-[color:var(--color-linen)] py-3 px-4 rounded-sm font-bold transition-opacity flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-mono"
          >
            Continue Week {currentWeek}
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}
