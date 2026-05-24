// Branded 404 inside the (addie) route group. Wraps the not-found
// state in the same chrome as the rest of the course surface so the
// learner doesn't bounce to the marketing site's 404.

import Link from 'next/link';

export default function AddieNotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16 lg:py-24 text-center">
      <div className="font-mono uppercase tracking-[0.2em] text-[0.65rem] text-[var(--ledger-accent)] mb-4">
        404 · Not in the course
      </div>
      <h1 className="font-serif text-4xl sm:text-5xl text-[var(--ledger-ink)] leading-[1.05]">
        That page isn&apos;t part of the Foundation.
      </h1>
      <p className="mt-5 text-[var(--ledger-ink-2)] text-lg leading-relaxed">
        The lesson, module, or dashboard view you were after either moved or
        never existed. Below are the obvious places to land.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 max-w-xl mx-auto text-left">
        {[
          { href: '/foundation', label: 'Foundation course home' },
          { href: '/foundation/pricing', label: 'Pricing' },
          { href: '/foundation/dashboard', label: 'Your dashboard' },
          { href: '/foundation/gate', label: 'Choose your path' },
          { href: '/foundation/assessment', label: 'Readiness Assessment' },
          { href: '/foundation/security', label: 'Security & vendor due diligence' },
        ].map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group block rounded-[4px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] hover:border-[var(--ledger-ink)] transition-colors duration-[160ms] px-4 py-3 text-sm text-[var(--ledger-ink)]"
            >
              <span className="font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)] block mb-1">
                Go to
              </span>
              <span className="inline-flex items-center gap-2">
                {l.label}
                <span aria-hidden className="text-[var(--ledger-muted)] group-hover:text-[var(--ledger-ink)] group-hover:translate-x-0.5 transition-all duration-[160ms]">
                  →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
