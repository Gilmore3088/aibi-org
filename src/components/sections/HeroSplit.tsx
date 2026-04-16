import Link from 'next/link';

// Left-aligned two-column hero variant.
// PRD: "produce both centered and left-aligned two-column versions and
// evaluate side-by-side." Default homepage renders the centered variant;
// /?hero=split renders this one.

const TIER_PREVIEW = [
  { label: 'Starting Point', range: '8–14', color: 'var(--color-error)' },
  { label: 'Early Stage', range: '15–21', color: 'var(--color-terra)' },
  { label: 'Building Momentum', range: '22–27', color: 'var(--color-terra-light)' },
  { label: 'Ready to Scale', range: '28–32', color: 'var(--color-sage)' },
] as const;

export function HeroSplit() {
  return (
    <section className="px-6 pt-16 pb-24 md:pt-24 md:pb-32">
      <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-10 md:gap-16 items-center">
        <div className="md:col-span-3 space-y-6">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            The AI Banking Institute
          </p>
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.04] text-[color:var(--color-ink)]">
            AI your people will actually use.
          </h1>
          <p className="font-serif-sc text-2xl md:text-3xl text-[color:var(--color-terra)] tracking-wide">
            Turning Bankers into Builders
          </p>
          <p className="text-lg md:text-xl text-[color:var(--color-ink)]/75 max-w-2xl leading-relaxed pt-2">
            AI proficiency built exclusively for community banks and credit
            unions. Accessible for every banker on your team. Boundary-safe
            for your examiners. Capable of moving your efficiency ratio.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-start gap-4">
            <Link
              href="/assessment"
              className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
            >
              Take the Free Assessment
            </Link>
            <Link
              href="#roi-calculator"
              className="inline-block px-8 py-4 border border-[color:var(--color-ink)]/30 text-[color:var(--color-ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] transition-colors"
            >
              Model Your ROI
            </Link>
          </div>
          <p className="font-mono text-xs text-[color:var(--color-slate)] pt-2">
            8 questions &middot; under 3 minutes &middot; community banks only
          </p>
        </div>

        <aside className="md:col-span-2 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-4">
            Assessment tiers
          </p>
          <h2 className="font-serif text-2xl text-[color:var(--color-ink)] leading-tight mb-5">
            Where does your institution stand?
          </h2>
          <p className="text-sm text-[color:var(--color-ink)]/75 mb-6 leading-relaxed">
            Every bank answering the same eight questions gets placed in one
            of four tiers. No marketing, no followup traps &mdash; just
            a score you can share with your board.
          </p>
          <ul className="space-y-3">
            {TIER_PREVIEW.map((tier) => (
              <li
                key={tier.label}
                className="flex items-baseline justify-between border-b border-[color:var(--color-ink)]/10 pb-2"
              >
                <span
                  className="font-serif text-base"
                  style={{ color: tier.color }}
                >
                  {tier.label}
                </span>
                <span className="font-mono text-xs text-[color:var(--color-ink)]/70 tabular-nums">
                  {tier.range}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/assessment"
            className="block text-center mt-6 font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] hover:text-[color:var(--color-terra-light)] transition-colors"
          >
            Begin the assessment &rarr;
          </Link>
        </aside>
      </div>
    </section>
  );
}
