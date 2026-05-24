// LegalShell — shared layout chrome for /foundation/{privacy,terms,cookies}.
// Editorial contract aesthetic: hairline rules, mono caps kicker, serif
// headings, generous whitespace, no hero gradients. Print-friendly.
//
// Pages compose this with their own sectioned children. The "last updated"
// + governing-law footer line is rendered here for consistency.

import type { ReactNode } from 'react';

interface LegalShellProps {
  readonly kicker: string;
  readonly title: string;
  readonly lede: string;
  readonly lastUpdated: string;
  readonly children: ReactNode;
}

export function LegalShell({ kicker, title, lede, lastUpdated, children }: LegalShellProps) {
  return (
    <main className="legal-page bg-[var(--ledger-bg)]">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <header className="border-b border-[var(--ledger-rule-strong)] pb-8 mb-10">
          <p className="font-mono uppercase tracking-[0.2em] text-[0.7rem] text-[var(--ledger-accent)]">
            {kicker}
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-[var(--ledger-ink)]">
            {title}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[var(--ledger-ink-2)] leading-relaxed">
            {lede}
          </p>
          <p className="mt-6 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ledger-muted)]">
            Last updated: {lastUpdated}
          </p>
        </header>
        <div className="legal-prose">{children}</div>
      </article>
    </main>
  );
}

interface LegalSectionProps {
  readonly id: string;
  readonly heading: string;
  readonly children: ReactNode;
}

export function LegalSection({ id, heading, children }: LegalSectionProps) {
  return (
    <section id={id} className="legal-section mt-10 first:mt-0 scroll-mt-24">
      <h2 className="font-serif text-2xl sm:text-[1.625rem] leading-tight text-[var(--ledger-ink)] border-b border-[var(--ledger-rule)] pb-2">
        {heading}
      </h2>
      <div className="mt-4 space-y-4 text-[0.95rem] leading-relaxed text-[var(--ledger-ink-2)]">
        {children}
      </div>
    </section>
  );
}

interface LegalClauseProps {
  readonly number: number;
  readonly heading: string;
  readonly children: ReactNode;
}

export function LegalClause({ number, heading, children }: LegalClauseProps) {
  return (
    <section
      id={`clause-${number}`}
      className="legal-clause mt-8 first:mt-0 scroll-mt-24"
    >
      <h2 className="font-serif text-xl sm:text-2xl leading-tight text-[var(--ledger-ink)]">
        <span className="font-mono text-[0.85em] text-[var(--ledger-accent)] mr-3">
          {String(number).padStart(2, '0')}.
        </span>
        {heading}
      </h2>
      <div className="mt-3 space-y-3 text-[0.95rem] leading-relaxed text-[var(--ledger-ink-2)] pl-0 sm:pl-10">
        {children}
      </div>
    </section>
  );
}

interface LegalTocProps {
  readonly items: ReadonlyArray<{ readonly id: string; readonly label: string }>;
}

export function LegalToc({ items }: LegalTocProps) {
  return (
    <nav
      aria-label="On this page"
      className="legal-toc mt-8 border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] rounded-[3px] p-5 print:hidden"
    >
      <p className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-muted)]">
        On this page
      </p>
      <ol className="mt-3 grid gap-1.5 sm:grid-cols-2 list-none">
        {items.map((item, i) => (
          <li key={item.id} className="text-sm">
            <a
              href={`#${item.id}`}
              className="text-[var(--ledger-ink-2)] hover:text-[var(--ledger-accent)] underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--ledger-accent)] rounded-sm"
            >
              <span className="font-mono text-[0.75rem] text-[var(--ledger-muted)] mr-2">
                {String(i + 1).padStart(2, '0')}
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
