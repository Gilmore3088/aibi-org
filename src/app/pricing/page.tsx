import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowGlyph, Button, SiteHeader } from '@/components/mockup';
import { AxHero, AxSection } from '@/components/ax';
import { INVENTORY_ROWS } from '@/components/ax/InventoryPreview';
import { FOUNDATION_MICRO_MODULES, foundationDurationLabel } from '@content/courses/foundation-program';

export const metadata: Metadata = {
  alternates: { canonical: '/pricing' },
  title: 'Pricing: AI Readiness Assessment and Training',
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

const COMPARISON_ROWS = [
  {
    need: 'Where should I start?',
    option: 'Snapshot',
    href: '/assessment/take',
    price: 'Free',
    outcome: 'Fast score and recommended path',
  },
  {
    need: 'What is our readiness profile?',
    option: 'In-Depth Assessment',
    href: '/assessment/in-depth',
    price: '$99',
    outcome: 'Written diagnostic and 90-day action register',
  },
  {
    need: 'How do I build practical AI skill?',
    option: 'Foundation',
    href: '/courses/foundation/program/purchase',
    price: '$295',
    outcome: 'Course, templates, work products, certificate',
  },
  {
    need: 'How do we roll this out with a team?',
    option: 'Institution Rollout',
    href: '/for-institutions',
    price: 'From $199/seat',
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

// What each plan actually hands you, shown rather than described: a page of
// the sample report, a page of the real playbook, the opening modules, and
// the inventory the rollout fills in.
const TIER_ART = [
  <figure key="snapshot" className="ax-tier-page">
    <Image src="/downloads/covers/sample-readiness-report-p2.jpg" alt="Sample readiness report: score, tier and top gap (illustrative data)" width={640} height={828} sizes="320px" />
  </figure>,
  <figure key="report" className="ax-tier-page">
    <Image src="/downloads/covers/in-depth-playbook-p5.jpg" alt="In-Depth playbook page: choose your 90-day path" width={700} height={906} sizes="320px" />
  </figure>,
  <div key="foundation" className="ax-tier-log" aria-label="First Foundation modules">
    {FOUNDATION_MICRO_MODULES.slice(0, 4).map((m) => (
      <p key={m.id}>
        <span>{String(m.number).padStart(2, '0')}</span>
        {m.title}
      </p>
    ))}
    <p className="ax-tier-more">+ {FOUNDATION_MICRO_MODULES.length - 4} more modules</p>
  </div>,
  <div key="rollout" className="ax-tier-sheet" aria-label="AI use-case inventory rows">
    <p className="ax-tier-sheet-bar">AI-Use-Case-Inventory.xlsx</p>
    {INVENTORY_ROWS.map((row) => (
      <p key={row[2]}>
        <span>{row[2]}</span>
        <em>{row[4]}</em>
      </p>
    ))}
    <p className="ax-tier-more">one row per workflow, per team</p>
  </div>,
];

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

        <section className="ax-section ax-light" aria-label="Pricing options">
          <div className="mk-container">
            <div className="ax-tiers">
              {TIERS.map((tier, index) => (
                <article key={tier.name} className={`ax-tier${tier.name === 'AiBI Foundation' ? ' is-featured' : ''}`}>
                  <div className="ax-tier-art">{TIER_ART[index]}</div>
                  <p className="ax-k ax-gold">{tier.badge}</p>
                  <h2>{tier.name}</h2>
                  <p className="ax-plan-price">
                    <strong className={tier.price.length > 6 ? 'is-long' : undefined}>{tier.price}</strong>
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
                  <Link href={tier.href} className="ax-tier-cta">
                    {tier.action} <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <AxSection id="compare" kicker="Compare" title="Choose by the work you need done.">
          <div className="ax-table-wrap" tabIndex={0} role="region" aria-label="Plan comparison, scrollable">
            <table className="ax-table ax-guide">
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
                    <th scope="row" className="ax-guide-need">
                      {row.need}
                    </th>
                    <td>
                      <Link href={row.href} className="ax-guide-option">
                        <span>{row.option}</span>
                        <em>{row.price}</em>
                      </Link>
                    </td>
                    <td className="ax-guide-outcome">{row.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AxSection>

        <AxSection light id="purchase-rules" kicker="Support and refunds" title="Simple purchase rules">
          <div className="ax-rules">
            <ul className="ax-checklist">
              {PURCHASE_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <aside className="ax-help" aria-label="Purchase help">
              <p className="ax-k">Questions before you buy?</p>
              <p className="ax-help-title">Talk to a person, not a form.</p>
              <p className="ax-help-body">Access issues are handled first; refund requests are reviewed within one business day.</p>
              <Link href="/support/purchase-help" className="ax-help-btn">
                Purchase help
              </Link>
              <Link href="/for-institutions" className="ax-help-link">
                Institution / partner inquiry →
              </Link>
            </aside>
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
