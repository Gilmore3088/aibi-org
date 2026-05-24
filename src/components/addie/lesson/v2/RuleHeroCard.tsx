// RuleHeroCard — Screen 1 of the m0.2 redesign. ONE big rule, calm
// and confident, no scrolling necessary. The card is the page; the
// "Show me the safe move" CTA is the step's Next button (owned by the
// shell).

interface RuleHeroCardProps {
  readonly kicker: string;          // "The rule" / "The move"
  readonly rule: string;             // the big sentence
  readonly subtext?: string;         // optional one-line clarifier
  readonly elevator: string;         // the elevator-test framing
}

export function RuleHeroCard({ kicker, rule, subtext, elevator }: RuleHeroCardProps) {
  return (
    <article className="rounded-[6px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] shadow-[var(--ledger-shadow)] overflow-hidden">
      <div className="px-8 sm:px-12 py-12 sm:py-16">
        <div className="font-mono uppercase tracking-[0.22em] text-[0.7rem] text-[var(--ledger-accent)] mb-6">
          {kicker}
        </div>
        <p className="font-serif text-[2rem] sm:text-[2.5rem] leading-[1.15] text-[var(--ledger-ink)] max-w-[28ch]">
          {rule}
        </p>
        {subtext ? (
          <p className="mt-5 font-serif text-[1.0625rem] leading-[1.6] text-[var(--ledger-ink-2)] max-w-[55ch]">
            {subtext}
          </p>
        ) : null}
      </div>
      <footer className="px-8 sm:px-12 py-5 border-t border-[var(--ledger-rule)] bg-[var(--ledger-parch)]">
        <div className="font-mono uppercase tracking-[0.18em] text-[0.6rem] text-[var(--ledger-muted)] mb-1">
          The elevator test
        </div>
        <p className="font-serif text-[0.95rem] leading-snug text-[var(--ledger-ink-2)]">
          {elevator}
        </p>
      </footer>
    </article>
  );
}
