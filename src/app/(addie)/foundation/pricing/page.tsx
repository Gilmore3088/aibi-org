// /foundation/pricing — top-of-funnel pricing page for people who already
// know they want to buy and don't want to walk M0–M3 first. Three doors:
// $295 Foundation Course (individual), $199/seat team (10-seat min), and
// the $99 Readiness Assessment. Mirrors the post-M3 gate's treatment but
// drops Email-to-keep (the visitor hasn't built anything yet).
//
// PRD §6 — offerings + pricing. Spec §3.2 — course-level pages.

import type { Metadata } from 'next';
import Link from 'next/link';
import { PayOptionCard } from '@/components/addie/gate/PayOptionCard';

export const metadata: Metadata = {
  title: 'Pricing · Foundation Course',
  description:
    'Three ways into the Foundation Course: $295 individual, $199 per seat for teams of ten or more, or the $99 Readiness Assessment.',
};

interface AssessmentCardCopy {
  readonly kicker: string;
  readonly title: string;
  readonly price: string;
  readonly body: string;
  readonly cta: string;
  readonly href: string;
}

const ASSESSMENT_CARD: AssessmentCardCopy = {
  kicker: 'Start with a map',
  title: 'Readiness Assessment',
  price: '$99',
  body: '48 questions across ten readiness dimensions. One learner. Four deliverables: scorecard, ninety-day plan, an ideas + prompts pack, and your next CTAs.',
  cta: 'Take it now',
  href: '/foundation/assessment',
};

interface ComparisonRow {
  readonly label: string;
  readonly course: string;
  readonly team: string;
  readonly assessment: string;
}

const COMPARISON: readonly ComparisonRow[] = [
  { label: 'Course access', course: 'All six modules', team: 'All six modules', assessment: '—' },
  { label: 'Toolbox saves', course: 'Unlimited', team: 'Unlimited per seat', assessment: '—' },
  { label: 'Sandbox usage', course: 'Unlimited', team: 'Unlimited per seat', assessment: '—' },
  { label: 'Team dashboard', course: '—', team: 'Per-seat progress + aggregate', assessment: '—' },
  { label: 'Lifetime access', course: '✓', team: '✓', assessment: '—' },
  { label: 'Readiness scorecard', course: '—', team: '—', assessment: '✓' },
  { label: 'Ninety-day plan', course: '—', team: '—', assessment: '✓' },
  { label: 'L&D receipt', course: '✓', team: '✓ (per seat)', assessment: '✓' },
];

interface FaqItem {
  readonly q: string;
  readonly a: string;
}

const FAQ: readonly FaqItem[] = [
  {
    q: 'How much course content is there?',
    a: 'Six modules, twenty-four lessons. Most lessons run under fifteen minutes; the deeper practice drills in Module 3 (the A/B sandbox, the violation drill, the Starter Prompt Pack build) honestly take 20–45 minutes — the timing card on each lesson shows the banded estimate. The work between lessons — saving artifacts to your Toolbox, practicing in the sandbox — is what makes it stick.',
  },
  {
    q: 'Can I expense this to my L&D budget?',
    a: 'Yes. Stripe issues a paid receipt after checkout with the institution name on the line item. The team SKU itemizes per seat for institutions that need it that way. If your AP team needs an invoice instead of a receipt, the team-checkout flow handles that.',
  },
  {
    q: 'What if I am an examiner — do you have anything for me?',
    a: 'Examiners and other regulators sit closer to the Risk & Compliance track. The course covers the same governance frame (SR 11-7, Interagency TPRM Guidance, ECOA/Reg B, the AIEOG AI Lexicon) that you would apply on an exam. There is not a separate examiner SKU; the individual course is the right entry point.',
  },
  {
    q: 'Do I need to be technical?',
    a: 'No. Four of the five role tracks (Risk & Compliance, Customer-Facing, Back-Office, Leadership) assume no coding background. The Technical track exists for IT staff who want the architecture lens; the rest of the course does not require it.',
  },
  {
    q: 'Does the course use my bank’s data?',
    a: 'No, and it cannot. The sandbox is bounded by design — no member data, no internal documents, no real PII. Every example is a synthetic banking scenario. The point is to build confidence before you touch live data, not to practice on it.',
  },
  {
    q: 'What is the difference between the course and the $99 Readiness Assessment?',
    a: 'The course teaches the work — six modules, the sandbox, the artifacts. The Readiness Assessment is a diagnostic: forty-eight questions across ten dimensions, four written deliverables, no lessons. Many institutions buy the assessment first to scope where the gaps are, then bring the team into the course against that plan.',
  },
  {
    q: 'How does the ten-seat team minimum work — what if we only have seven people?',
    a: 'Below ten, the individual SKU is the right answer — buy seven copies at $295. The team SKU exists because the per-seat dashboard, invitations, and aggregate reporting only earn their keep at scale. If you are close to ten and plan to grow, talk to us; we will not gatekeep on a head count of nine.',
  },
  {
    q: 'Can I get a sample lesson before I buy?',
    a: 'Yes. The first four modules of the course (M0 Orientation, M1 Awareness, M2 Access & Workflow, M3 Prompting) are free. You walk roughly the first half of the course before any payment is asked for. The pricing page exists for people who already know they want to buy and want to skip ahead.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'Fourteen-day refund on the individual SKU, no questions asked — email hello@aibankinginstitute.com. Team purchases are refundable per unused seat in the first thirty days; seats that have been activated are non-refundable after the first lesson is completed.',
  },
  {
    q: 'Who is behind The AI Banking Institute?',
    a: 'A small team focused on community banks and credit unions — about eight thousand four hundred US institutions that need a serious AI proficiency program built for their reality, not a generic enterprise program retrofitted. The about page has the longer answer; the short one is: bankers, not platform vendors.',
  },
];

function CourseCard() {
  return (
    <div className="addie-module-card" data-tier="paid">
      <PayOptionCard kind="individual" />
    </div>
  );
}

function TeamCard() {
  return (
    <div className="addie-module-card" data-tier="paid">
      <PayOptionCard kind="team" />
    </div>
  );
}

function AssessmentCard() {
  return (
    <div className="addie-module-card">
      <div className="p-6 flex flex-col h-full">
        <span className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-muted)]">
          {ASSESSMENT_CARD.kicker}
        </span>
        <h2 className="mt-2 font-serif text-2xl text-[var(--ledger-ink)]">
          {ASSESSMENT_CARD.title}
        </h2>
        <p className="mt-2 font-mono text-base text-[var(--ledger-ink)]">{ASSESSMENT_CARD.price}</p>
        <p className="mt-3 text-sm text-[var(--ledger-ink-2)] flex-1 leading-relaxed">
          {ASSESSMENT_CARD.body}
        </p>
        <div className="mt-4">
          <Link
            href={ASSESSMENT_CARD.href}
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-[2px] border border-[var(--ledger-ink)] text-[var(--ledger-ink)] font-mono font-semibold uppercase tracking-[0.16em] text-xs hover:bg-[var(--ledger-ink)] hover:text-[var(--ledger-paper)] transition-colors duration-[160ms]"
          >
            {ASSESSMENT_CARD.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ComparisonCell({ value }: { readonly value: string }) {
  const isCheck = value === '✓';
  const isDash = value === '—';
  return (
    <td
      className="px-4 py-4 text-sm align-top border-t border-[var(--ledger-rule)] text-[var(--ledger-ink-2)]"
      data-state={isCheck ? 'yes' : isDash ? 'no' : 'detail'}
    >
      {isCheck ? (
        <span aria-label="Included" className="text-[var(--ledger-accent)] font-mono font-semibold">
          ✓
        </span>
      ) : isDash ? (
        <span aria-label="Not included" className="text-[var(--ledger-muted)]">
          —
        </span>
      ) : (
        value
      )}
    </td>
  );
}

export default function FoundationPricingPage() {
  return (
    <main>
      {/* Hero — ink */}
      <section className="addie-hero-ink">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20 text-center">
          <span className="font-mono uppercase tracking-[0.2em] text-[0.7rem] text-[var(--ledger-accent)]">
            Pricing
          </span>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
            Three ways in.
            <br />
            <span className="text-[var(--ledger-accent)]">Pick the one that fits.</span>
          </h1>
          <p className="mt-5 text-lg text-[var(--ledger-paper)] opacity-80 max-w-2xl mx-auto leading-relaxed">
            One course at $295 for a single learner, $199 per seat for teams of ten or more,
            or the $99 Readiness Assessment if you want the diagnostic first.
            No countdowns. No early-bird. Lifetime access on the course.
          </p>
        </div>
      </section>

      {/* Three doors */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 -mt-10 sm:-mt-12 pb-14 relative">
        <div className="grid gap-5 md:grid-cols-3">
          <CourseCard />
          <TeamCard />
          <AssessmentCard />
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-y border-[var(--ledger-rule)] bg-[var(--ledger-paper)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-16">
          <div className="grid gap-4 sm:flex sm:items-end sm:justify-between mb-8">
            <div>
              <span className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)]">
                What is included
              </span>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-[var(--ledger-ink)] leading-tight">
                Side by side.
              </h2>
            </div>
            <p className="text-sm text-[var(--ledger-muted)] max-w-sm">
              The course and the assessment are different products. Most institutions
              eventually buy both; the order depends on where you are in the work.
            </p>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[640px] text-left tabular-nums border-collapse">
              <thead>
                <tr className="text-[var(--ledger-ink)]">
                  <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">
                    Feature
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <div className="font-serif text-lg text-[var(--ledger-ink)] leading-tight">Course</div>
                    <div className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)]">$295 · one learner</div>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <div className="font-serif text-lg text-[var(--ledger-ink)] leading-tight">Team</div>
                    <div className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)]">$199 · per seat · min 10</div>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <div className="font-serif text-lg text-[var(--ledger-ink)] leading-tight">Assessment</div>
                    <div className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)]">$99 · one learner</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.label}>
                    <th
                      scope="row"
                      className="px-4 py-4 align-top border-t border-[var(--ledger-rule)] font-mono uppercase tracking-[0.14em] text-[0.7rem] text-[var(--ledger-ink-2)] whitespace-nowrap"
                    >
                      {row.label}
                    </th>
                    <ComparisonCell value={row.course} />
                    <ComparisonCell value={row.team} />
                    <ComparisonCell value={row.assessment} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mb-10">
          <span className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)]">
            Questions
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-[var(--ledger-ink)] leading-tight">
            Before you buy.
          </h2>
        </div>

        <ul className="divide-y divide-[var(--ledger-rule)] border-y border-[var(--ledger-rule)]">
          {FAQ.map((item) => (
            <li key={item.q}>
              <details className="group">
                <summary className="cursor-pointer list-none flex items-start justify-between gap-6 py-5 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ledger-accent)]">
                  <span className="font-serif text-lg sm:text-xl text-[var(--ledger-ink)] leading-snug">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className="mt-1 shrink-0 font-mono text-lg text-[var(--ledger-muted)] transition-transform duration-[160ms] group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="pb-6 pr-10 text-[var(--ledger-ink-2)] leading-relaxed">
                  {item.a}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing — test-drive nudge */}
      <section className="border-t border-[var(--ledger-rule)] bg-[var(--ledger-paper)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 sm:py-16 text-center">
          <span className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)]">
            Not ready
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-[var(--ledger-ink)] leading-tight">
            Walk the first four modules first.
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-[var(--ledger-ink-2)] leading-relaxed">
            The course opens free through Module 3. That is roughly the first half of
            the work — enough to know whether the way the Institute teaches matches
            the way your team learns.
          </p>
          <div className="mt-8">
            <Link
              href="/foundation"
              className="inline-flex items-center justify-center min-h-[44px] gap-3 font-mono font-semibold uppercase tracking-[0.14em] text-xs px-6 py-4 rounded-[4px] bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)] transition-colors duration-[160ms]"
            >
              Start free at Module 0
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
