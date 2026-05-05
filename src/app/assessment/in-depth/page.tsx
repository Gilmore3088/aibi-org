// /assessment/in-depth — marketing/sales page for the In-Depth AI Readiness Assessment.
// Server component. Two CTAs (individual $99, institution $79/seat × 10+) live in
// client components; the rest is pure render.

import type { Metadata } from 'next';
import BuyForMyselfCard from './_components/BuyForMyselfCard';
import BuyForMyTeamCard from './_components/BuyForMyTeamCard';

export const metadata: Metadata = {
  title: 'In-Depth AI Readiness Assessment | The AI Banking Institute',
  description:
    'The full 48-question diagnostic across all eight readiness dimensions. ' +
    'For institutions ready to map their AI capability with the precision their boards expect.',
};

interface ValueProp {
  readonly label: string;
  readonly title: string;
  readonly body: string;
}

const VALUE_PROPS: readonly ValueProp[] = [
  {
    label: 'Diagnostic',
    title: 'Full 48-question diagnostic',
    body:
      'Six questions per dimension across all eight readiness dimensions — six times the depth of the free assessment.',
  },
  {
    label: 'Breakdown',
    title: '8-dimension breakdown',
    body:
      'Each dimension scored independently, so you see exactly where you are strong and where the gaps are.',
  },
  {
    label: 'Action plan',
    title: '30-day action plan',
    body:
      'Concrete next steps keyed to your lowest-scoring dimensions — not generic advice, the work that fits your readiness.',
  },
];

export default function InDepthAssessmentPage() {
  return (
    <main>
      {/* Hero */}
      <section className="px-6 pt-14 pb-10 md:pt-20 md:pb-14">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            In-Depth Assessment
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            In-Depth AI Readiness{' '}
            <span className="text-[color:var(--color-terra)] italic">Assessment</span>
          </h1>
          <p className="text-lg md:text-xl text-[color:var(--color-ink)]/75 max-w-2xl mx-auto leading-relaxed">
            The full 48-question diagnostic across all eight readiness dimensions.
            For institutions ready to map their AI capability with the precision
            their boards expect.
          </p>
          <p className="font-mono text-[11px] tabular-nums text-[color:var(--color-slate)]">
            48 questions &middot; 8 dimensions &middot; $99 individual &middot; $79 / seat for 10+
          </p>
        </div>
      </section>

      {/* What you get */}
      <section
        aria-labelledby="value-heading"
        className="px-6 py-14 md:py-20 border-t border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 max-w-2xl">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
              What you get
            </p>
            <h2
              id="value-heading"
              className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight"
            >
              The same instrument we use to scope a cohort.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {VALUE_PROPS.map((prop) => (
              <article
                key={prop.title}
                className="bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 flex flex-col"
              >
                <p className="font-serif-sc text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] mb-3">
                  {prop.label}
                </p>
                <h3 className="font-serif text-xl text-[color:var(--color-ink)] leading-tight mb-3">
                  {prop.title}
                </h3>
                <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
                  {prop.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing pair */}
      <section
        id="pricing"
        aria-labelledby="pricing-heading"
        className="px-6 py-14 md:py-20 border-t border-[color:var(--color-ink)]/10"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 max-w-2xl">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
              Pricing &middot; Pick your scale
            </p>
            <h2
              id="pricing-heading"
              className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight"
            >
              One seat or your whole team.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            <BuyForMyselfCard />
            <BuyForMyTeamCard />
          </div>
        </div>
      </section>

      {/* Privacy callout */}
      <section
        aria-labelledby="privacy-heading"
        className="px-6 pb-20"
      >
        <div className="max-w-3xl mx-auto">
          <div className="rounded-[3px] border border-[color:var(--color-terra-pale)] bg-[color:var(--color-parch)] p-6 md:p-8">
            <p
              id="privacy-heading"
              className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3"
            >
              Privacy
            </p>
            <p className="text-sm md:text-base text-[color:var(--color-ink)]/80 leading-relaxed">
              If you buy for your team, individual responses stay private. Aggregate
              reports surface patterns and anonymized distributions; no individual
              scores are exposed to the leader.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
