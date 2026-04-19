'use client';

// PreviewMobileDrawer — Hamburger-triggered slide-out drawer for mobile (below lg)
// Client Component: requires useState for open/close state
// Mirrors MobileSidebarDrawer exactly — cobalt substituted for terra throughout

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const PHASES = [
  { label: 'Phase I — Foundation' },
  { label: 'Phase II — First Build' },
  { label: 'Phase III — Scale' },
] as const;

export function PreviewMobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);

  // Close drawer on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, close]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger trigger — visible only below lg */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-[color:var(--color-ink)] hover:text-[color:var(--color-cobalt)] transition-colors"
        aria-label="Open course navigation"
        aria-expanded={isOpen}
        aria-controls="mobile-preview-nav"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[color:var(--color-ink)]/40 z-50 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Slide-out drawer */}
      <div
        id="mobile-preview-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Course navigation"
        className={`fixed left-0 top-0 h-full w-72 bg-[color:var(--color-linen)] z-50 flex flex-col lg:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
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
            aria-label="Close course navigation"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Unit navigation */}
        <nav className="flex-1 overflow-y-auto py-2" aria-label="Course units">
          {/* Track: /Ops */}
          <div className="mb-1">
            <div
              className="px-6 py-2 text-[10px] uppercase font-mono tracking-[0.2em] font-bold"
              style={{ color: 'var(--color-cobalt)' }}
            >
              /Ops Track
            </div>

            {/* Unit 1.1 — current */}
            <Link
              href="/aibi-s-preview/ops/unit/1.1"
              onClick={close}
              className="flex items-center gap-3 px-6 py-2.5 bg-[color:var(--color-parch-dark)] font-bold transition-colors"
              aria-current="page"
            >
              <span
                className="font-mono text-[10px] w-5 font-bold"
                style={{ color: 'var(--color-cobalt)' }}
                aria-hidden="true"
              >
                1.1
              </span>
              <span className="font-serif text-xs text-[color:var(--color-cobalt)] flex-1 leading-tight">
                From Personal Skills to Institutional Assets
              </span>
            </Link>
          </div>

          {/* Phase Progression */}
          <div className="mb-1">
            <div
              className="px-6 py-2 text-[10px] uppercase font-mono tracking-[0.2em] font-bold"
              style={{ color: 'var(--color-cobalt)' }}
            >
              Phase Progression
            </div>

            {PHASES.map((phase) => (
              <div
                key={phase.label}
                className="flex items-center gap-3 px-6 py-2.5 opacity-40 cursor-not-allowed"
              >
                <span
                  className="font-mono text-[10px] w-5 text-[color:var(--color-slate)]"
                  aria-hidden="true"
                >
                  —
                </span>
                <span className="font-serif text-xs text-[color:var(--color-ink)] flex-1 leading-tight">
                  {phase.label}
                </span>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer: cross-course nav */}
        <div className="p-6 border-t border-[color:var(--color-cobalt)]/10 space-y-3">
          <Link
            href="/courses/aibi-p"
            onClick={close}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-sm border border-[color:var(--color-cobalt)]/30 hover:bg-[color:var(--color-parch)] transition-colors text-[10px] uppercase tracking-widest font-mono text-[color:var(--color-cobalt)]"
          >
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            AiBI-P
          </Link>
          <Link
            href="/courses/aibi-s"
            onClick={close}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-sm transition-colors text-[10px] uppercase tracking-widest font-mono hover:bg-[color:var(--color-parch)]"
            style={{ color: 'var(--color-ink)', opacity: 0.6 }}
          >
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Cohort Landing
          </Link>
        </div>
      </div>
    </>
  );
}
