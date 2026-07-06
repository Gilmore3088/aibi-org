import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowGlyph, Button, SiteHeader } from '@/components/mockup';
import { foundationDurationLabel } from '@content/courses/foundation-program';

export const metadata: Metadata = {
  alternates: { canonical: '/pricing' },
  title: 'Pricing | The AI Banking Institute',
  description:
    'Choose between the free AI Readiness Snapshot, In-Depth Assessment, AiBI Foundation, and institution rollout paths.',
};

const TIERS = [
  {
    name: 'AI Readiness Snapshot',
    price: '$0',
    cadence: 'Free start',
    badge: 'Start here',
    bestFor: 'A banker who wants a quick starting point before buying anything.',
    bullets: ['12-question snapshot', 'Maturity tier and top gap', 'Starter prompt and recommended path'],
    action: 'Start free',
    href: '/assessment/take',
  },
  {
    name: 'In-Depth Assessment',
    price: '$99',
    cadence: 'One-time',
    badge: 'Best first paid step',
    bestFor: 'A manager or executive who needs a written readiness plan.',
    bullets: ['48-question diagnostic', 'Eight readiness scores and peer-band context', '90-day action register'],
    action: 'Get the report',
    href: '/assessment/in-depth',
  },
  {
    name: 'AiBI Foundation',
    price: '$295',
    cadence: 'One-time',
    badge: 'Best for individual capability',
    bestFor: 'An individual learner who wants reusable AI work products, not just a score.',
    bullets: [
      '18 modules and saved prompts',
      foundationDurationLabel(),
      'Workflow templates and reviewed artifacts',
      'Certificate with public authenticity URL',
    ],
    action: 'Enroll in Foundation',
    href: '/courses/foundation/program/purchase',
  },
  {
    name: 'Institution Rollout',
    price: 'From $199/seat',
    cadence: '10+ seats · scoped before rollout',
    badge: 'For teams',
    bestFor: 'Departments, cohorts, institutions, associations, or partner channels.',
    bullets: [
      'Foundation seats at $199 each for 10+ seats',
      'Rollout planning and cohort setup',
      'Reporting scope and support path',
    ],
    action: 'Request a rollout plan',
    href: '/for-institutions',
  },
] as const;

const PATH_STEPS = [
  ['Snapshot', 'Free start'],
  ['Report', 'Written plan'],
  ['Foundation', 'Individual capability'],
  ['Rollout', 'Team implementation'],
] as const;

const COMPARISON_ROWS = [
  {
    need: 'Where should I start?',
    option: 'Snapshot',
    outcome: 'Fast score and recommended path',
  },
  {
    need: 'What is our readiness profile?',
    option: 'In-Depth Assessment',
    outcome: 'Written diagnostic and 90-day action register',
  },
  {
    need: 'How do I build practical AI skill?',
    option: 'Foundation',
    outcome: 'Course, templates, work products, certificate',
  },
  {
    need: 'How do we roll this out with a team?',
    option: 'Institution Rollout',
    outcome: 'Scoped cohort plan, reporting, support',
  },
] as const;

const PURCHASE_RULES = [
  'Individual products are one-time purchases.',
  'No subscription is required for Snapshot, In-Depth Assessment, or Foundation.',
  'Paid self-service products have a 7-day refund window if unused.',
  'Team, institution, association, and partner rollouts are scoped before checkout.',
  'SSO, invoicing, reporting, and support are discussed before quote.',
] as const;

const EMPHASIZED_CARD_TERMS = [
  {
    label: 'free snapshot',
    href: '/assessment/take',
  },
  {
    label: 'written report',
    href: '/assessment/in-depth',
  },
  {
    label: 'Foundation course',
    href: '/courses/foundation/program/purchase',
  },
  {
    label: 'team rollout',
    href: '/for-institutions',
  },
] as const;

export default function PricingPage() {
  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/pricing" cta={{ label: 'Start free', href: '/assessment/take' }} />
      <main className="mk-pricing-page">
        <section className="mk-pricing-hero">
          <div className="mk-pricing-hero-copy">
            <p className="mk-k">Pricing</p>
            <h1>Choose your AI banking path.</h1>
            <p>
              Start with a free readiness snapshot. Upgrade when you need a
              written plan, reusable work products, or a team rollout.
            </p>
            <div className="mk-pricing-hero-actions">
              <Button variant="gold" size="lg" href="/assessment/take">
                Start free <ArrowGlyph />
              </Button>
              <Button variant="ghost-dark" size="lg" href="#compare">
                Compare plans
              </Button>
            </div>
          </div>

          <div className="mk-pricing-path" aria-label="Pricing path">
            {PATH_STEPS.map(([name, outcome], index) => (
              <div key={name} className="mk-pricing-path-step">
                <span>{index + 1}</span>
                <strong>{name}</strong>
                <em>{outcome}</em>
              </div>
            ))}
          </div>
        </section>

        <section className="mk-pricing-tier-grid" aria-label="Pricing options">
          {TIERS.map((tier) => (
            <article key={tier.name} className="mk-pricing-tier">
              <p className="mk-pricing-tier-badge">{tier.badge}</p>
              <h2>{tier.name}</h2>
              <div className="mk-pricing-tier-price">
                <strong>{tier.price}</strong>
                <span>{tier.cadence}</span>
              </div>
              <div className="mk-pricing-tier-copy">
                <span className="mk-pricing-tier-label">Best for</span>
                <p>{tier.bestFor}</p>
              </div>
              <div className="mk-pricing-tier-copy">
                <span className="mk-pricing-tier-label">You get</span>
              </div>
              <ul>
                {tier.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <Link href={tier.href} className="mk-pricing-tier-link">
                {tier.action} <ArrowGlyph size={14} />
              </Link>
            </article>
          ))}
        </section>

        <section id="compare" className="mk-pricing-compare" aria-labelledby="compare-heading">
          <div className="mk-pricing-section-head">
            <p className="mk-k">Compare</p>
            <h2 id="compare-heading">Choose by the work you need done.</h2>
          </div>
          <div className="mk-pricing-table-wrap">
            <table className="mk-pricing-table">
              <thead>
                <tr>
                  <th scope="col">Need</th>
                  <th scope="col">Best option</th>
                  <th scope="col">What you get</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.need}>
                    <th scope="row">{row.need}</th>
                    <td data-label="Best option">{row.option}</td>
                    <td data-label="What you get">{row.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mk-pricing-support" aria-labelledby="pricing-support-heading">
          <div>
            <p className="mk-k">Support and refunds</p>
            <h2 id="pricing-support-heading">Simple purchase rules</h2>
            <ul className="mk-pricing-purchase-rules">
              {PURCHASE_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
          <div className="mk-pricing-support-actions">
            <Button variant="ink" size="lg" href="/support/purchase-help">
              Purchase help
            </Button>
            <Button variant="ghost-light" size="lg" href="/for-institutions">
              Institution / partner inquiry
            </Button>
          </div>
        </section>

        <section className="mk-pricing-final" aria-labelledby="pricing-final-heading">
          <p className="mk-k">Next step</p>
          <h2 id="pricing-final-heading">Start free, then choose the path that matches the work.</h2>
          <p>
            A quick read costs nothing. A written report, Foundation course, or
            team rollout comes later.
          </p>
          <div className="mk-pricing-final-links" aria-label="Pricing story">
            {EMPHASIZED_CARD_TERMS.map((term) => (
              <Link key={term.label} href={term.href}>
                {term.label} <ArrowGlyph size={14} />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
