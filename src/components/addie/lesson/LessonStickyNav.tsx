'use client';

// LessonStickyNav — floating prev/next pill bar fixed to the bottom
// of the lesson viewport. Always visible so the learner never has to
// scroll back to find the next-lesson button or detour through the
// dashboard between modules. Keyboard shortcuts: ← / → / J / K.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LessonStickyNavProps {
  readonly prevHref: string | null;
  readonly prevLabel: string | null;
  readonly nextHref: string | null;
  readonly nextLabel: string | null;
  readonly gateNext: boolean;
}

export function LessonStickyNav({
  prevHref,
  prevLabel,
  nextHref,
  nextLabel,
  gateNext,
}: LessonStickyNavProps) {
  const router = useRouter();
  const effectiveNextHref = gateNext ? '/foundation/gate' : nextHref;
  const effectiveNextLabel = gateNext ? 'Choose your path' : nextLabel;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if ((e.key === 'ArrowRight' || e.key === 'j') && effectiveNextHref) {
        e.preventDefault();
        router.push(effectiveNextHref);
      }
      if ((e.key === 'ArrowLeft' || e.key === 'k') && prevHref) {
        e.preventDefault();
        router.push(prevHref);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [effectiveNextHref, prevHref, router]);

  if (!prevHref && !effectiveNextHref) return null;

  return (
    <div
      role="navigation"
      aria-label="Lesson navigation"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[min(640px,calc(100vw-2rem))] w-full"
    >
      <div className="rounded-full border border-[var(--ledger-rule-strong)] bg-[color-mix(in_srgb,var(--ledger-paper)_94%,transparent)] backdrop-blur-md shadow-[0_12px_30px_-12px_rgba(14,27,45,0.45),0_4px_8px_-3px_rgba(14,27,45,0.18)] flex items-center justify-between gap-2 px-2 py-2">
        {prevHref ? (
          <Link
            href={prevHref}
            className="group flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[var(--ledger-bg)] transition-colors duration-[120ms] min-w-0"
          >
            <span aria-hidden className="text-[var(--ledger-ink)] transition-transform duration-[160ms] group-hover:-translate-x-0.5">
              ←
            </span>
            <span className="hidden sm:flex flex-col min-w-0 text-left">
              <span className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)]">Previous</span>
              <span className="text-sm text-[var(--ledger-ink)] truncate max-w-[180px]">
                {prevLabel ?? 'Back'}
              </span>
            </span>
            <span className="sm:hidden font-mono uppercase tracking-[0.14em] text-[0.7rem] text-[var(--ledger-ink)]">
              Prev
            </span>
          </Link>
        ) : (
          <span className="px-3 py-2 font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)]">
            Start
          </span>
        )}

        <span className="hidden md:inline font-mono text-[0.55rem] uppercase tracking-[0.2em] text-[var(--ledger-muted)] px-2 border-x border-[var(--ledger-rule)]">
          ← / →
        </span>

        {effectiveNextHref ? (
          <Link
            href={effectiveNextHref}
            className="group flex items-center gap-3 pl-4 pr-3 py-2 rounded-full bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)] transition-colors duration-[120ms] min-w-0"
          >
            <span className="hidden sm:flex flex-col text-right min-w-0">
              <span className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[color-mix(in_srgb,var(--ledger-paper)_60%,transparent)]">
                {gateNext ? 'Gate' : 'Next'}
              </span>
              <span className="text-sm text-[var(--ledger-paper)] truncate max-w-[200px]">
                {effectiveNextLabel ?? 'Continue'}
              </span>
            </span>
            <span className="sm:hidden font-mono uppercase tracking-[0.14em] text-[0.7rem] text-[var(--ledger-paper)]">
              {gateNext ? 'Gate' : 'Next'}
            </span>
            <span aria-hidden className="text-[var(--ledger-paper)] transition-transform duration-[160ms] group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        ) : (
          <span className="px-4 py-2 font-mono uppercase tracking-[0.14em] text-[0.7rem] text-[var(--ledger-muted)]">
            End
          </span>
        )}
      </div>
    </div>
  );
}
