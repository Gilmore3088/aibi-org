import Link from 'next/link';

interface Tier {
  readonly name: string;
  readonly tagline: string;
  readonly priceRange: string;
  readonly duration: string;
  readonly summary: string;
  readonly included: readonly string[];
  readonly accent: string;
}

const TIERS: readonly Tier[] = [
  {
    name: 'Operational Quick Win Sprint',
    tagline: 'The fastest path to proof.',
    priceRange: '$5,000 – $15,000',
    duration: '4–6 weeks',
    summary:
      'We identify your three highest-value automation opportunities, implement them, and deliver a documented before/after impact report — hours recaptured, NIE reduced, efficiency ratio impact quantified.',
    included: [
      '3 implemented automations',
      'Documented ROI report plus a "What We Didn\'t Do" page',
      '90-day ROI guarantee',
    ],
    accent: 'var(--color-terra)',
  },
  {
    name: 'Efficiency & Process Audit',
    tagline: 'The full picture. Board-ready.',
    priceRange: '$25,000 – $60,000',
    duration: '6–10 weeks',
    summary:
      'Full cross-departmental assessment. Every manual workflow quantified by dollar value. Prioritized automation roadmap with NIE reduction attached to each line item.',
    included: [
      'All departments assessed',
      'Efficiency ratio model built for your institution',
      'Board presentation included',
    ],
    accent: 'var(--color-cobalt)',
  },
  {
    name: 'AI Transformation + AiBI fCAIO',
    tagline: 'A monthly operating system for AI.',
    priceRange: '$75,000 – $150,000+',
    duration: 'Monthly engagements, typically 6–12 months',
    summary:
      'A structured monthly operating system installed inside your institution. Dedicated team. 90-day rolling roadmap. Capability transfer built in — your team drives AI transformation independently when the engagement ends.',
    included: [
      'Week 1: Executive Alignment',
      'Week 2: Department Activation',
      'Week 3: Implementation Sprint',
      'Week 4: Training and Impact Report',
    ],
    accent: 'var(--color-sage)',
  },
];

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ??
  'https://calendly.com/aibi/executive-briefing';

export default function ServicesPage() {
  return (
    <main>
      <section className="px-6 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-terra)]">
            Consulting engagements
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            Three ways we work with community banks.
          </h1>
          <p className="text-lg md:text-xl text-[color:var(--color-ink)]/75 max-w-2xl mx-auto leading-relaxed">
            Every engagement starts with a free 45-minute Executive Briefing.
            We walk through your institution&apos;s position and show you what the
            first 90 days would look like. No pitch, no obligation.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {TIERS.map((tier) => (
            <article
              key={tier.name}
              className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 p-8 flex flex-col"
            >
              <p
                className="font-mono text-xs uppercase tracking-widest mb-4"
                style={{ color: tier.accent }}
              >
                {tier.tagline}
              </p>
              <h2 className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight mb-4">
                {tier.name}
              </h2>
              <div className="space-y-1 mb-5 font-mono text-xs text-[color:var(--color-ink)]/60">
                <p>{tier.priceRange}</p>
                <p>{tier.duration}</p>
              </div>
              <p className="text-[color:var(--color-ink)]/75 leading-relaxed mb-6 flex-1">
                {tier.summary}
              </p>
              <ul className="space-y-2 mb-6">
                {tier.included.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-[color:var(--color-ink)]/80 leading-snug pl-4 relative"
                  >
                    <span
                      className="absolute left-0 top-2 w-2 h-[1px]"
                      style={{ background: tier.accent }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center px-6 py-3 border text-sm font-sans font-medium tracking-wide transition-colors"
                style={{
                  borderColor: tier.accent,
                  color: tier.accent,
                }}
              >
                Request Executive Briefing
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto bg-[color:var(--color-ink)] text-[color:var(--color-linen)] p-10 md:p-14 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-terra-pale)] mb-3">
            Not sure which tier fits?
          </p>
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Start with the free assessment.
          </h2>
          <p className="text-[color:var(--color-linen)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
            Eight questions, under three minutes. Your score and tier tell us
            where to start — and tell you whether AI transformation is ready
            for a conversation or still needs foundation work.
          </p>
          <Link
            href="/assessment"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            Take the Free Assessment
          </Link>
        </div>
      </section>
    </main>
  );
}
