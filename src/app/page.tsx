import Link from 'next/link';
import { ROICalculator } from '@/components/sections/ROICalculator';
import { ThreeFears } from '@/components/sections/ThreeFears';
import { SecurityBand } from '@/components/sections/SecurityBand';
import { WideningGap } from '@/components/sections/WideningGap';
import { HeroSplit } from '@/components/sections/HeroSplit';
import { ServiceTierCards } from '@/components/sections/ServiceTierCards';
import { CertificationCards } from '@/components/sections/CertificationCards';
import { FinalCTABand } from '@/components/sections/FinalCTABand';

interface HomePageProps {
  readonly searchParams: { readonly hero?: string };
}

interface Pillar {
  readonly letter: 'A' | 'B' | 'C';
  readonly label: string;
  readonly headline: string;
  readonly description: string;
  readonly bullets: readonly string[];
  readonly colorVar: string;
}

const PILLARS: readonly Pillar[] = [
  {
    letter: 'A',
    label: 'Accessible',
    headline: 'Built for bankers, not technologists.',
    description:
      'Your compliance officer, your tellers, your branch managers — they do not need to understand how AI works. They need to experience what it does for their Tuesday morning.',
    bullets: [
      'Personal experimentation before production deployment',
      'Role-based prompt libraries for ops, lending, finance, retail',
      'Five universal templates every banker can use on day one',
      'Confidence first. Capability second.',
    ],
    colorVar: 'var(--color-sage)',
  },
  {
    letter: 'B',
    label: 'Boundary-Safe',
    headline: 'Every recommendation assumes a regulated institution.',
    description:
      'The question your board will ask is not "can we use AI?" It is "is it safe?" We answer it before they ask — with specific frameworks, not general reassurances.',
    bullets: [
      'Aligned with SR 11-7, Interagency TPRM Guidance, ECOA/Reg B',
      'References the AIEOG AI Lexicon (US Treasury, February 2026)',
      'PII never touches a public LLM — private inference for sensitive work',
      'Vendor evaluation: a five-question scoring framework',
    ],
    colorVar: 'var(--color-cobalt)',
  },
  {
    letter: 'C',
    label: 'Capable',
    headline: 'Every banker becomes a builder and problem-solver.',
    description:
      'You never know who has the best idea in the room. A teller who has been frustrated by a manual process for three years might build the automation that saves the operations team ten hours a week.',
    bullets: [
      'Workflow mapping and automation design',
      'Power Automate and Copilot Studio for non-developers',
      '90-day ROI guarantee on every Quick Win Sprint',
      'Measured impact: hours recaptured, NIE reduced, efficiency ratio moved',
    ],
    colorVar: 'var(--color-terra)',
  },
];

const PROOF_POINTS = [
  { stat: '~65%', label: 'Community Bank Median Efficiency Ratio' },
  { stat: '66%', label: 'Discussing AI Budget in 2024' },
  { stat: '57%', label: 'Cite AI Skill Gaps as #1 Blocker' },
  { stat: '55%', label: 'Have No AI Governance Framework' },
] as const;

export const metadata = {
  title: 'AI your people will actually use.',
  description:
    'The AI Banking Institute — AI proficiency built exclusively for community banks and credit unions. Free readiness assessment, consulting engagements, and three certification tiers.',
};

export default function HomePage({ searchParams }: HomePageProps) {
  const useSplitHero = searchParams.hero === 'split';

  return (
    <main>
      {/* Hero — default centered, or split variant via /?hero=split */}
      {useSplitHero ? (
        <HeroSplit />
      ) : (
        <section className="px-6 pt-14 pb-16 md:pt-20 md:pb-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] text-[color:var(--color-ink)]">
              AI your people will actually use.
            </h1>
            <p className="font-serif-sc text-2xl md:text-3xl text-[color:var(--color-terra)] tracking-wide">
              Turning Bankers into Builders
            </p>
            <p className="text-lg md:text-xl text-[color:var(--color-ink)]/75 max-w-3xl mx-auto leading-relaxed pt-2">
              AI proficiency built exclusively for community banks and credit
              unions. Accessible for every banker on your team. Boundary-safe
              for your examiners. Capable of moving your efficiency ratio.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/assessment"
                className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra-light)] transition-colors"
              >
                Take the Free Assessment
              </Link>
              <Link
                href="#roi-calculator"
                className="inline-block px-8 py-4 border border-[color:var(--color-ink)]/30 text-[color:var(--color-ink)] font-sans font-medium tracking-wide hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] transition-colors"
              >
                Model Your ROI
              </Link>
            </div>
            <p className="font-mono text-xs text-[color:var(--color-slate)] pt-4">
              8 questions &middot; under 3 minutes &middot; community banks only
            </p>
          </div>
        </section>
      )}

      {/* Stats band */}
      <section className="border-y border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {PROOF_POINTS.map((p) => (
              <div key={p.label}>
                <p className="font-mono text-4xl md:text-5xl text-[color:var(--color-terra)] leading-none tabular-nums">
                  {p.stat}
                </p>
                <p className="font-serif-sc text-[11px] md:text-xs uppercase text-[color:var(--color-ink)]/70 mt-4 leading-snug">
                  {p.label}
                </p>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-center text-[color:var(--color-slate)] mt-8">
            Sources: FDIC Quarterly Banking Profile &middot; Bank Director 2024 Technology Survey &middot; Gartner (via Jack Henry)
          </p>
        </div>
      </section>

      {/* Three pillars — described, not branded as A-B-C */}
      <section className="px-6 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-4">
              The three pillars
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] max-w-3xl mx-auto leading-tight">
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
                  className="font-mono text-xs uppercase tracking-[0.2em]"
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
                <ul className="space-y-2 pt-2">
                  {pillar.bullets.map((b) => (
                    <li
                      key={b}
                      className="text-sm text-[color:var(--color-ink)]/75 leading-snug pl-4 relative"
                    >
                      <span
                        className="absolute left-0 top-2 w-2 h-[1px]"
                        style={{ background: pillar.colorVar }}
                      />
                      {b}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ThreeFears />
      <WideningGap />
      <SecurityBand />
      <ROICalculator />
      <ServiceTierCards showHeader />
      <CertificationCards showHeader compact />
      <FinalCTABand />
    </main>
  );
}
