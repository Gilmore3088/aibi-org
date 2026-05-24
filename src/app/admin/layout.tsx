// /admin/* layout. Reference surface, not marketing.
// Operator-only via OPERATOR_EMAILS env var. Anyone else gets 404,
// not 403, so the route never advertises its existence.

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getOperatorContext } from '@/lib/addie/auth/isOperator';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

export const dynamic = 'force-dynamic';

const SUBNAV: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/leads', label: 'Leads' },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const ctx = await getOperatorContext();
  if (!ctx.isOperator) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--ledger-bg)] text-[var(--ledger-ink)]">
      <header className="border-b border-[var(--ledger-rule)] bg-[var(--ledger-paper)] print:border-black">
        <div className="mx-auto max-w-6xl px-6 py-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <div className="flex flex-col">
            <KickerLabel tone="accent">Admin</KickerLabel>
            <span className="font-serif text-xl leading-none mt-1">The AI Banking Institute</span>
          </div>
          <nav className="ml-auto flex items-baseline gap-5 text-sm" aria-label="Admin sections">
            {SUBNAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[var(--ledger-ink-2)] hover:text-[var(--ledger-ink)] hover:underline underline-offset-4 decoration-[var(--ledger-rule-strong)]"
              >
                {item.label}
              </Link>
            ))}
            <span aria-hidden="true" className="h-4 w-px bg-[var(--ledger-rule)]" />
            <Link
              href="/foundation"
              className="text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
            >
              Back to course
            </Link>
            <Link
              href="/auth/signout"
              className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
            >
              Sign out
            </Link>
          </nav>
        </div>
        {ctx.email ? (
          <div className="mx-auto max-w-6xl px-6 pb-3">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ledger-muted)]">
              Signed in as {ctx.email}
            </span>
          </div>
        ) : null}
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
