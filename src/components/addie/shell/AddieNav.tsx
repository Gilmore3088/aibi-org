// AddieNav — sticky course chrome with backdrop-blur, active-state,
// and proper responsive behavior:
//   - xl+ (≥1024px): full link row + Toolbox + Account
//   - md  (≥768px):  compact link row (truncated labels) + Toolbox + Account
//   - sm- (<768px):  brand only + hamburger drawer (all links inside)

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ToolboxLauncher } from '@/components/addie/toolbox/ToolboxLauncher';

interface AddieNavProps {
  readonly courseName?: string;
  readonly signedIn?: boolean;
}

interface NavLink {
  href: string;
  label: string;
  short?: string;
  match: (p: string) => boolean;
}

const LINKS: ReadonlyArray<NavLink> = [
  {
    href: '/foundation',
    label: 'Course',
    match: (p) =>
      p === '/foundation' ||
      /^\/foundation\/m[0-5](\/|$)/.test(p) ||
      p === '/foundation/gate',
  },
  {
    href: '/foundation/pricing',
    label: 'Pricing',
    match: (p) => p === '/foundation/pricing',
  },
  {
    href: '/foundation/for-community-banks',
    label: 'For banks',
    short: 'Banks',
    match: (p) =>
      p === '/foundation/for-community-banks' || p === '/foundation/contact-sales',
  },
  {
    href: '/foundation/dashboard',
    label: 'Dashboard',
    short: 'Home',
    match: (p) => p === '/foundation/dashboard',
  },
  {
    href: '/foundation/assessment',
    label: 'Briefings',
    short: 'Briefs',
    match: (p) => p.startsWith('/foundation/assessment'),
  },
];

export function AddieNav({ courseName = 'Foundation Course', signedIn = false }: AddieNavProps) {
  const pathname = usePathname() ?? '';
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    if (mobileOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <nav aria-label="Foundation Course" className="addie-sticky-chrome">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link
          href="/foundation"
          className="font-mono font-semibold uppercase tracking-[0.16em] text-[0.7rem] sm:text-xs text-[var(--ledger-ink)] inline-flex items-baseline gap-2 whitespace-nowrap min-w-0"
        >
          <span className="truncate">The AI Banking Institute</span>
          <span aria-hidden className="hidden lg:inline text-[var(--ledger-muted)]">·</span>
          <span className="hidden lg:inline text-[var(--ledger-muted)] truncate">{courseName}</span>
        </Link>

        {/* md+ : inline link row */}
        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => {
            const active = l.match(pathname);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className={
                  'font-mono uppercase tracking-[0.14em] text-[0.65rem] lg:text-[0.7rem] px-2 lg:px-2.5 py-1.5 rounded-[2px] transition-colors duration-[120ms] whitespace-nowrap ' +
                  (active
                    ? 'text-[var(--ledger-ink)] bg-[var(--ledger-tape)]'
                    : 'text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)] hover:bg-[var(--ledger-paper)]')
                }
              >
                {/* Use short label on md, full label on lg+ */}
                <span className="lg:hidden">{l.short ?? l.label}</span>
                <span className="hidden lg:inline">{l.label}</span>
              </Link>
            );
          })}
          <span className="ml-2">
            <ToolboxLauncher />
          </span>
          <Link
            href={signedIn ? '/account' : '/auth/login'}
            className="ml-1 font-mono uppercase tracking-[0.14em] text-[0.65rem] lg:text-[0.7rem] px-3 py-1.5 rounded-[2px] border border-[var(--ledger-ink)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-ink)] hover:text-[var(--ledger-paper)] transition-colors duration-[120ms] whitespace-nowrap"
          >
            {signedIn ? 'Account' : 'Sign in'}
          </Link>
        </div>

        {/* sm- : Toolbox + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ToolboxLauncher />
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="addie-mobile-menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-[3px] border border-[var(--ledger-ink)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-ink)] hover:text-[var(--ledger-paper)] transition-colors duration-[120ms]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              {mobileOpen ? (
                <>
                  <line x1="3" y1="3" x2="13" y2="13" />
                  <line x1="13" y1="3" x2="3" y2="13" />
                </>
              ) : (
                <>
                  <line x1="2" y1="4" x2="14" y2="4" />
                  <line x1="2" y1="8" x2="14" y2="8" />
                  <line x1="2" y1="12" x2="14" y2="12" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div
          id="addie-mobile-menu"
          className="md:hidden absolute left-0 right-0 top-full bg-[var(--ledger-paper)] border-b border-[var(--ledger-rule-strong)] shadow-[0_12px_24px_-12px_rgba(14,27,45,0.25)]"
        >
          <ul className="mx-auto max-w-7xl px-4 sm:px-6 py-3 space-y-1">
            {LINKS.map((l) => {
              const active = l.match(pathname);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? 'page' : undefined}
                    className={
                      'block px-3 py-3 rounded-[3px] font-mono uppercase tracking-[0.14em] text-[0.75rem] transition-colors duration-[120ms] ' +
                      (active
                        ? 'text-[var(--ledger-ink)] bg-[var(--ledger-tape)]'
                        : 'text-[var(--ledger-ink-2)] hover:bg-[var(--ledger-bg)]')
                    }
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2 mt-2 border-t border-[var(--ledger-rule)]">
              <Link
                href={signedIn ? '/account' : '/auth/login'}
                className="block px-3 py-3 rounded-[3px] font-mono uppercase tracking-[0.14em] text-[0.75rem] border border-[var(--ledger-ink)] text-center text-[var(--ledger-ink)] hover:bg-[var(--ledger-ink)] hover:text-[var(--ledger-paper)] transition-colors duration-[120ms]"
              >
                {signedIn ? 'Account' : 'Sign in'}
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
