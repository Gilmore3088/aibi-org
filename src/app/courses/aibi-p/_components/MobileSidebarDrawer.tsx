'use client';

// MobileSidebarDrawer — Hamburger-triggered slide-out drawer for mobile (below lg)
// Client Component: requires useState for open/close state

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { modules, PILLAR_META } from '@content/courses/aibi-p';
import type { Pillar } from '@content/courses/aibi-p';

interface MobileSidebarDrawerProps {
  readonly completedModules: readonly number[];
  readonly currentModule: number;
}

const PILLAR_ORDER: Pillar[] = ['awareness', 'understanding', 'creation', 'application'];

function getModuleStatus(
  moduleNumber: number,
  completedModules: readonly number[],
  currentModule: number,
): 'completed' | 'current' | 'locked' {
  if (completedModules.includes(moduleNumber)) return 'completed';
  if (moduleNumber === currentModule) return 'current';
  return 'locked';
}

export function MobileSidebarDrawer({ completedModules, currentModule }: MobileSidebarDrawerProps) {
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

  const modulesByPillar = PILLAR_ORDER.map((pillar) => ({
    pillar,
    meta: PILLAR_META[pillar],
    items: modules.filter((m) => m.pillar === pillar),
  }));

  return (
    <>
      {/* Hamburger trigger — visible only below lg */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 text-[color:var(--color-ink)] hover:text-[color:var(--color-terra)] transition-colors"
        aria-label="Open course navigation"
        aria-expanded={isOpen}
        aria-controls="mobile-course-nav"
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
        id="mobile-course-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Course navigation"
        className={`fixed left-0 top-0 h-full w-72 bg-[color:var(--color-linen)] z-50 flex flex-col lg:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--color-terra)]/10 h-16">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold text-[color:var(--color-terra)]"
              style={{ border: '1.5px solid var(--color-terra)' }}
            >
              Ai
            </div>
            <div className="text-[color:var(--color-ink)] font-bold text-sm font-serif leading-tight">
              AiBI-P
            </div>
          </div>
          <button
            onClick={close}
            className="p-1 text-[color:var(--color-slate)] hover:text-[color:var(--color-terra)] transition-colors"
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

        {/* Module navigation */}
        <nav className="flex-1 overflow-y-auto py-2" aria-label="Course modules">
          {modulesByPillar.map(({ pillar, meta, items }) => (
            <div key={pillar} className="mb-1">
              <div
                className="px-6 py-2 text-[9px] uppercase font-mono tracking-[0.2em] font-bold"
                style={{ color: meta.colorVar }}
              >
                {meta.label}
              </div>

              {items.map((mod) => {
                const status = getModuleStatus(mod.number, completedModules, currentModule);
                const formattedNumber = String(mod.number).padStart(2, '0');

                if (status === 'locked') {
                  return (
                    <div
                      key={mod.id}
                      className="flex items-center gap-3 px-6 py-2.5 opacity-40 cursor-not-allowed"
                      aria-label={`Module ${mod.number}: ${mod.title} — locked`}
                    >
                      <span className="font-mono text-[10px] w-5 text-[color:var(--color-dust)]">
                        {formattedNumber}
                      </span>
                      <span className="font-serif text-xs text-[color:var(--color-ink)] flex-1 leading-tight">
                        {mod.title}
                      </span>
                      <svg
                        className="w-3 h-3 text-[color:var(--color-dust)] shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  );
                }

                if (status === 'current') {
                  return (
                    <Link
                      key={mod.id}
                      href={`/courses/aibi-p/${mod.number}`}
                      onClick={close}
                      className="flex items-center gap-3 px-6 py-2.5 bg-[color:var(--color-parch-dark)] font-bold transition-colors"
                      aria-current="page"
                    >
                      <span
                        className="font-mono text-[10px] w-5 font-bold"
                        style={{ color: meta.colorVar }}
                      >
                        {formattedNumber}
                      </span>
                      <span className="font-serif text-xs text-[color:var(--color-terra)] flex-1 leading-tight">
                        {mod.title}
                      </span>
                    </Link>
                  );
                }

                // completed
                return (
                  <Link
                    key={mod.id}
                    href={`/courses/aibi-p/${mod.number}`}
                    onClick={close}
                    className="flex items-center gap-3 px-6 py-2.5 hover:bg-[color:var(--color-parch)] transition-colors"
                  >
                    <span className="font-mono text-[10px] w-5 text-[color:var(--color-dust)]">
                      {formattedNumber}
                    </span>
                    <span className="font-serif text-xs text-[color:var(--color-ink)] flex-1 leading-tight">
                      {mod.title}
                    </span>
                    <svg
                      className="w-3 h-3 shrink-0"
                      style={{ color: meta.colorVar }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Completed"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer: Resume + Settings */}
        <div className="p-6 border-t border-[color:var(--color-terra)]/10 space-y-3">
          <Link
            href={`/courses/aibi-p/${currentModule}`}
            onClick={close}
            className="w-full bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] py-3 px-4 rounded-sm font-bold transition-colors flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-mono"
          >
            Resume
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
          </Link>
          <Link
            href="/courses/aibi-p/settings"
            onClick={close}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-sm transition-colors text-[10px] uppercase tracking-widest font-mono hover:bg-[color:var(--color-parch)]"
            style={{ color: 'var(--color-ink)', opacity: 0.5 }}
          >
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            Settings
          </Link>
        </div>
      </div>
    </>
  );
}
