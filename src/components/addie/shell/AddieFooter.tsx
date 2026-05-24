// AddieFooter — section footer for the (addie) routes. Four columns of
// related links + wordmark + legal strip + last-updated.

import Link from 'next/link';

const COLUMNS: ReadonlyArray<{ kicker: string; links: ReadonlyArray<{ href: string; label: string }> }> = [
  {
    kicker: 'Course',
    links: [
      { href: '/foundation', label: 'Foundation home' },
      { href: '/foundation/pricing', label: 'Pricing' },
      { href: '/foundation/assessment', label: 'Readiness Assessment' },
      { href: '/foundation/dashboard', label: 'Dashboard' },
      { href: '/foundation/dashboard/toolbox', label: 'Toolbox' },
    ],
  },
  {
    kicker: 'For institutions',
    links: [
      { href: '/foundation/for-community-banks', label: 'For community banks' },
      { href: '/foundation/contact-sales', label: 'Talk to us' },
      { href: '/foundation/dashboard/team', label: 'Team dashboard' },
    ],
  },
  {
    kicker: 'Trust',
    links: [
      { href: '/foundation/security', label: 'Security & vendor due diligence' },
      { href: '/foundation/privacy', label: 'Privacy' },
      { href: '/foundation/terms', label: 'Terms' },
      { href: '/foundation/cookies', label: 'Cookies' },
    ],
  },
  {
    kicker: 'Account',
    links: [
      { href: '/account', label: 'Profile' },
      { href: '/account/billing', label: 'Billing' },
      { href: '/account/billing/team', label: 'Team billing' },
      { href: '/account/export', label: 'Export your data' },
      { href: '/account/delete', label: 'Delete account' },
    ],
  },
];

export function AddieFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--ledger-rule)] bg-[var(--ledger-bg)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Top — wordmark + columns */}
        <div className="grid gap-10 lg:grid-cols-[1fr_4fr]">
          <div>
            <div className="font-serif text-xl text-[var(--ledger-ink)] leading-tight">
              The AI Banking Institute
            </div>
            <p className="mt-3 text-sm text-[var(--ledger-muted)] max-w-xs">
              A short, banker-grade AI course for the ~8,400 US community banks
              and credit unions.
            </p>
          </div>
          <nav aria-label="Footer" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.kicker}>
                <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)] mb-3">
                  {col.kicker}
                </div>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-[var(--ledger-ink-2)] hover:text-[var(--ledger-ink)] hover:underline underline-offset-4"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom — legal strip */}
        <div className="mt-12 pt-6 border-t border-[var(--ledger-rule)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)]">
            © 2026 The AI Banking Institute · Foundation Course
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--ledger-muted)]">
            <Link href="/foundation/privacy" className="hover:text-[var(--ledger-ink)]">Privacy</Link>
            <Link href="/foundation/terms" className="hover:text-[var(--ledger-ink)]">Terms</Link>
            <Link href="/foundation/cookies" className="hover:text-[var(--ledger-ink)]">Cookies</Link>
            <Link href="/foundation/security" className="hover:text-[var(--ledger-ink)]">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
