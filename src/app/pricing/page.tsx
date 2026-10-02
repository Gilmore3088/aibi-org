import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowGlyph, Button, SiteHeader } from '@/components/mockup';
import { AxHero, AxSection } from '@/components/ax';
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
    bullets: ['48-question diagnostic', 'Eight readiness scores with per-dimension root causes', '90-day action register'],
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
    <div className="mockup-scope ax-page">
      <SiteHeader activePath="/pricing" cta={{ label: 'Start free', href: '/assessment/take' }} />
      <main>
        <AxHero
          cmd="pricing --paths snapshot,report,foundation,rollout"
          title="Choose your AI banking path."
          lede="Start with a free readiness snapshot. Upgrade when you need a written plan, reusable work products, or a team rollout."
          actions={
            <>
              <Button variant="gold" size="lg" href="/assessment/take">
                Start free <ArrowGlyph />
              </Button>
              <Button variant="ghost-dark" size="lg" href="#compare">
                Compare plans
              </Button>
            </>
          }
        />

        <section className="ax-section" aria-label="Pricing options">
          <div className="mk-container">
            <ol className="ax-path" aria-label="Pricing path">
              {PATH_STEPS.map(([name, outcome], index) => (
                <li key={name}>
                  <span className="ax-k ax-gold">{String(index + 1).padStart(2, '0')}</span>
                  <strong>{name}</strong>
                  <em>{outcome}</em>
                </li>
              ))}
            </ol>
            <div className="ax-plans">
              {TIERS.map((tier) => (
                <article key={tier.name} className={`ax-plan${tier.name === 'AiBI Foundation' ? ' is-featured' : ''}`}>
                  <p className="ax-k ax-gold">{tier.badge}</p>
                  <h2>{tier.name}</h2>
                  <p className="ax-plan-price">
                    <strong>{tier.price}</strong>
                    <span>{tier.cadence}</span>
                  </p>
                  <p className="ax-k">Best for</p>
                  <p className="ax-plan-best">{tier.bestFor}</p>
                  <p className="ax-k">You get</p>
                  <ul className="ax-checklist">
                    {tier.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <Link href={tier.href} className="ax-link-mono ax-plan-link">
                    {tier.action} →
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <AxSection id="compare" kicker="Compare" title="Choose by the work you need done.">
          <div className="ax-table-wrap">
            <table className="ax-table">
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
                    <th scope="row" className="ax-cell-title" style={{ fontSize: '1.125rem' }}>
                      {row.need}
                    </th>
                    <td className="ax-cell-mono">{row.option}</td>
                    <td>{row.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AxSection>

        <AxSection id="purchase-rules" kicker="Support and refunds" title="Simple purchase rules">
          <div className="ax-rules">
            <ul className="ax-checklist">
              {PURCHASE_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <div className="ax-actions" style={{ marginTop: 0 }}>
              <Button variant="ghost-dark" size="lg" href="/support/purchase-help">
                Purchase help
              </Button>
              <Link href="/for-institutions" className="ax-link-mono">
                Institution / partner inquiry →
              </Link>
            </div>
          </div>
        </AxSection>

        <section className="ax-section ax-close" aria-labelledby="pricing-final-heading">
          <div className="mk-container">
            <h2 id="pricing-final-heading" className="ax-display">
              Start free, then choose the path that <span className="ax-gold">matches the work</span>.
            </h2>
            <p className="ax-muted">
              A quick read costs nothing. A written report, Foundation course, or team rollout comes later.
            </p>
            <div className="ax-actions" aria-label="Pricing story">
              {EMPHASIZED_CARD_TERMS.map((term) => (
                <Link key={term.label} href={term.href} className="ax-link-mono">
                  {term.label} →
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
