// AddieNav — sticky course chrome with backdrop-blur and active-state.
// Lives inside the (addie) route group, sits above the global SiteNav.
//
// Bug fix included: the prior toolbox href was /foundation/foundation/...
// (double `/foundation`), reachable via the dashboard fallback but
// broken from this nav. Now /foundation/dashboard/toolbox.

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ToolboxLauncher } from '@/components/addie/toolbox/ToolboxLauncher';

interface AddieNavProps {
  readonly courseName?: string;
  readonly signedIn?: boolean;
}

const LINKS: ReadonlyArray<{ href: string; label: string; match: (p: string) => boolean }> = [
  {
    href: '/foundation',
    label: 'Course',
    match: (p) =>
      p === '/foundation' ||
      /^\/foundation\/m[0-5](\/|$)/.test(p) ||
      p === '/foundation/gate',
  },
  {
    href: '/foundation/dashboard',
    label: 'Dashboard',
    match: (p) => p === '/foundation/dashboard',
  },
  {
    href: '/foundation/assessment',
    label: 'Briefings',
    match: (p) => p.startsWith('/foundation/assessment'),
  },
];

export function AddieNav({ courseName = 'Foundation Course', signedIn = false }: AddieNavProps) {
  const pathname = usePathname() ?? '';
  return (
    <nav
      aria-label="Foundation Course"
      className="addie-sticky-chrome"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <Link
          href="/foundation"
          className="font-mono font-semibold uppercase tracking-[0.18em] text-xs text-[var(--ledger-ink)] inline-flex items-baseline gap-2 whitespace-nowrap"
        >
          <span>The AI Banking Institute</span>
          <span aria-hidden className="text-[var(--ledger-muted)]">·</span>
          <span className="text-[var(--ledger-muted)]">{courseName}</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => {
            const active = l.match(pathname);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className={
                  'font-mono uppercase tracking-[0.16em] text-[0.7rem] px-2.5 py-1.5 rounded-[2px] transition-colors duration-[120ms] ' +
                  (active
                    ? 'text-[var(--ledger-ink)] bg-[var(--ledger-tape)]'
                    : 'text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)] hover:bg-[var(--ledger-paper)]')
                }
              >
                {l.label}
              </Link>
            );
          })}
          <span className="ml-2">
            <ToolboxLauncher />
          </span>
          <Link
            href={signedIn ? '/account' : '/auth/login'}
            className="ml-1 font-mono uppercase tracking-[0.16em] text-[0.7rem] px-3 py-1.5 rounded-[2px] border border-[var(--ledger-ink)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-ink)] hover:text-[var(--ledger-paper)] transition-colors duration-[120ms]"
          >
            {signedIn ? 'Account' : 'Sign in'}
          </Link>
        </div>
        {/* Mobile: Toolbox + Account */}
        <div className="md:hidden flex items-center gap-2">
          <ToolboxLauncher />
          <Link
            href={signedIn ? '/account' : '/auth/login'}
            className="font-mono uppercase tracking-[0.16em] text-[0.7rem] px-3 py-1.5 rounded-[2px] border border-[var(--ledger-ink)] text-[var(--ledger-ink)]"
          >
            {signedIn ? 'Account' : 'Sign in'}
          </Link>
        </div>
      </div>
    </nav>
  );
}
