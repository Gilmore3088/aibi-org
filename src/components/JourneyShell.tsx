// JourneyShell — chrome wrapper for authenticated journey routes.
//
// Renders a left rail with the 4-verb spine (Assess / Learn / Apply /
// Lead) highlighted by `activeVerb`, plus the page's children as the
// main content area. Used to give /dashboard/* a consistent feel — one
// continuous journey instead of disparate dashboard tabs.
//
// Public marketing pages do NOT use this shell; they wear only the
// global Header + Footer. The course tree (/courses/aibi-p/*) has its
// own CourseSidebar and does NOT use this shell either.
//
// Plan ref: Plans/refactor-momentum-first-ux-restructure.md §3.3.

import Link from 'next/link';
import type { ReactNode } from 'react';

export type JourneyVerb = 'assess' | 'learn' | 'apply' | 'lead';

interface JourneyVerbDef {
  readonly id: JourneyVerb;
  readonly label: string;
  readonly href: string;
  readonly description: string;
}

const VERBS: readonly JourneyVerbDef[] = [
  {
    id: 'assess',
    label: 'Assess',
    href: '/dashboard/assessments',
    description: 'See where you stand',
  },
  {
    id: 'learn',
    label: 'Learn',
    href: '/courses/aibi-p',
    description: 'Build the skill',
  },
  {
    id: 'apply',
    label: 'Apply',
    href: '/dashboard/toolbox',
    description: 'Use AI safely at work',
  },
  {
    id: 'lead',
    label: 'Lead',
    href: '/for-institutions',
    description: 'Bring it to your team',
  },
];

export interface JourneyShellProps {
  readonly children: ReactNode;
  readonly activeVerb: JourneyVerb;
  /** Optional eyebrow / page label rendered above main on mobile. */
  readonly eyebrow?: string;
}

export function JourneyShell({
  children,
  activeVerb,
  eyebrow,
}: JourneyShellProps) {
  return (
    <div className="min-h-screen bg-[color:var(--color-linen)] lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      {/* Left rail — verb spine. Hidden below lg; mobile relies on the
          global MobileNav. */}
      <aside
        aria-label="Your journey"
        className="hidden lg:block border-r border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]"
      >
        <div className="sticky top-[81px] py-8 px-6">
          <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55 mb-5">
            Your Journey
          </p>
          <nav aria-label="Journey sections" className="space-y-1">
            {VERBS.map((verb) => {
              const isActive = verb.id === activeVerb;
              return (
                <Link
                  key={verb.id}
                  href={verb.href}
                  className={`block py-3 px-3 rounded-[2px] transition-colors ${
                    isActive
                      ? 'bg-[color:var(--color-terra)]/10 border-l-2 border-[color:var(--color-terra)] -ml-3 pl-[calc(0.75rem-2px)]'
                      : 'border-l-2 border-transparent hover:bg-[color:var(--color-linen)] -ml-3 pl-[calc(0.75rem-2px)]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <p
                    className={`font-serif-sc text-[11px] uppercase tracking-[0.22em] ${
                      isActive
                        ? 'text-[color:var(--color-terra)]'
                        : 'text-[color:var(--color-ink)]/75'
                    }`}
                  >
                    {verb.label}
                  </p>
                  <p
                    className={`mt-0.5 text-xs leading-snug ${
                      isActive
                        ? 'text-[color:var(--color-ink)]/75'
                        : 'text-[color:var(--color-ink)]/55'
                    }`}
                  >
                    {verb.description}
                  </p>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Content slot — pages render their own <main>; the shell only
          provides chrome. Avoids nested <main> elements. */}
      <div>
        {eyebrow && (
          <div className="lg:hidden border-b border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] px-6 py-4">
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-terra)]">
              {eyebrow}
            </p>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
