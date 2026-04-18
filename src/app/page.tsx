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
      {/* Hero */}
      {useSplitHero ? (
        <HeroSplit />
      ) : (
        <section className="px-6 pt-16 pb-16 md:pt-24 md:pb-20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1] text-[color:var(--color-ink)]">
              The big banks are spending billions on AI.{' '}
              <span className="text-[color:var(--color-terra)] italic">
                Your advantage is your people.
              </span>
            </h1>
            <p className="text-base md:text-lg text-[color:var(--color-ink)]/75 max-w-2xl mx-auto leading-relaxed pt-2">
              We train community bankers to use AI — safely, professionally,
              and without a six-figure budget. Every loan officer, teller, and
              compliance analyst who learns these tools becomes a builder who
              makes your institution faster, sharper, and harder to outcompete.
            </p>
            <p className="font-serif-sc text-lg md:text-xl text-[color:var(--color-terra)] tracking-wide">
              Turning Bankers into Builders
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/assessment"
                className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
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
        </section>
      )}

      {/* ── ACT 1: THE PROBLEM ── */}
      {/* Stats band — the industry is moving */}
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

      {/* The gap is widening — competitive urgency */}
      <WideningGap />

      {/* Every CEO is thinking these three things — validate their anxiety */}
      <ThreeFears />

      {/* ── ACT 2: THE FRAMEWORK ── */}
      {/* Three pillars — how we attack it */}
      <section className="px-6 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] max-w-3xl mx-auto leading-tight">
              The Three Pillars
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {PILLARS.map((pillar, idx) => (
              <article key={pillar.letter} className="space-y-5">
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="font-mono text-lg tabular-nums"
                    style={{ color: pillar.colorVar }}
                  >
                    {idx + 1}
                  </span>
                  <div className="h-px w-6" style={{ backgroundColor: pillar.colorVar, opacity: 0.3 }} aria-hidden="true" />
                  <span
                    className="font-serif-sc text-base uppercase tracking-[0.15em]"
                    style={{ color: pillar.colorVar }}
                  >
                    {pillar.label}
                  </span>
                </div>
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

      {/* Regulatory credibility — we've read the guidance */}
      <SecurityBand />

      {/* ── ACT 3: THE PROOF ── */}
      {/* ROI calculator — model your own savings */}
      <ROICalculator />

      {/* Certification tracks — three levels of engagement */}
      <CertificationCards showHeader compact />

      {/* Consulting tiers — or we come to you */}
      <ServiceTierCards showHeader />

      {/* ── ACT 4: THE ASK ── */}
      <FinalCTABand />
    </main>
  );
}
