import Link from 'next/link';

interface Pillar {
  readonly letter: 'A' | 'B' | 'C';
  readonly label: string;
  readonly headline: string;
  readonly description: string;
  readonly colorVar: string;
}

const PILLARS: readonly Pillar[] = [
  {
    letter: 'A',
    label: 'Accessible',
    headline: 'Built for bankers, not technologists.',
    description:
      "Your compliance officer, your tellers, your branch managers — they don't need to understand how AI works. They need to experience what it does for their Tuesday morning. 57% of financial institutions report AI skill gaps as their primary adoption barrier (Gartner, via Jack Henry). The tools are available. The confidence is not.",
    colorVar: 'var(--color-sage)',
  },
  {
    letter: 'B',
    label: 'Boundary-Safe',
    headline: 'Every recommendation assumes a regulated institution.',
    description:
      'The question your board will ask is not "can we use AI?" It is "is it safe?" We answer it before they ask — with specific frameworks aligned to SR 11-7, Interagency TPRM Guidance, and the AIEOG AI Lexicon. Not general reassurances.',
    colorVar: 'var(--color-cobalt)',
  },
  {
    letter: 'C',
    label: 'Capable',
    headline: 'Every banker becomes a builder and problem-solver.',
    description:
      "You never know who has the best idea in the room. A teller who has been frustrated by a manual process for three years might build the automation that saves the operations team 10 hours a week. We teach your people to find those moments and turn them into working tools.",
    colorVar: 'var(--color-terra)',
  },
];

const PROOF_POINTS = [
  { stat: '~8,400', label: 'community banks in the US' },
  { stat: '66%', label: 'discussing AI budget in 2024' },
  { stat: '57%', label: 'cite AI skill gaps as #1 blocker' },
  { stat: '55%', label: 'have no AI governance framework' },
] as const;

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] text-[color:var(--color-ink)]">
            AI your people will actually use.
          </h1>
          <p className="text-xl md:text-2xl text-[color:var(--color-ink)]/75 max-w-3xl mx-auto leading-relaxed">
            AI proficiency and transformation built exclusively for community
            banks and credit unions &mdash; structured around the three things
            that determine whether AI actually sticks inside a regulated
            institution.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/assessment"
              className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra-light)] transition-colors"
            >
              Take the Free Assessment
            </Link>
            <Link
              href="/services"
              className="inline-block px-8 py-4 border border-[color:var(--color-ink)]/30 text-[color:var(--color-ink)] font-sans font-medium tracking-wide hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] transition-colors"
            >
              See how we work
            </Link>
          </div>
          <p className="font-mono text-xs text-[color:var(--color-ink)]/50 pt-4">
            8 questions &middot; under 3 minutes &middot; community banks only
          </p>
        </div>
      </section>

      {/* Proof strip */}
      <section className="border-y border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {PROOF_POINTS.map((p) => (
              <div key={p.label}>
                <p className="font-serif text-4xl md:text-5xl text-[color:var(--color-terra)] leading-none">
                  {p.stat}
                </p>
                <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/60 mt-3">
                  {p.label}
                </p>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-center text-[color:var(--color-ink)]/40 mt-6">
            Sources: FDIC BankFind &middot; Bank Director 2024 Technology Survey &middot; Gartner (via Jack Henry)
          </p>
        </div>
      </section>

      {/* Three pillars */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/60 mb-4">
              The three pillars
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] max-w-2xl mx-auto leading-tight">
              Accessible. Boundary-Safe. Capable.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {PILLARS.map((pillar) => (
              <article key={pillar.letter} className="space-y-5">
                <div
                  className="w-14 h-14 rounded-full border-2 flex items-center justify-center font-serif text-2xl"
                  style={{
                    borderColor: pillar.colorVar,
                    color: pillar.colorVar,
                  }}
                  aria-hidden
                >
                  {pillar.letter}
                </div>
                <p
                  className="font-mono text-xs uppercase tracking-widest"
                  style={{ color: pillar.colorVar }}
                >
                  {pillar.label}
                </p>
                <h3 className="font-serif text-2xl text-[color:var(--color-ink)] leading-snug">
                  {pillar.headline}
                </h3>
                <p className="text-[color:var(--color-ink)]/75 leading-relaxed">
                  {pillar.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 p-10 md:p-14 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-terra)] mb-3">
            Start here
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] mb-4">
            See where your institution stands in under three minutes.
          </h2>
          <p className="text-[color:var(--color-ink)]/70 max-w-xl mx-auto mb-6 leading-relaxed">
            The free AI readiness assessment scores you on eight dimensions,
            places you in one of four tiers, and shows you the highest-leverage
            next move for the next 90 days.
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
