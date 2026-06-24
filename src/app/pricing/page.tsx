import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowGlyph, Button, SiteHeader } from '@/components/mockup';

export const metadata: Metadata = {
  alternates: { canonical: '/pricing' },
  title: 'Pricing | The AI Banking Institute',
  description:
    'Compare the free assessment, $99 In-Depth Assessment, $295 AiBI-Foundation course, and institution rollout options.',
};

const TIERS = [
  {
    eyebrow: 'Free',
    name: 'AI Readiness Snapshot',
    price: '$0',
    cadence: '12 questions · about 3 minutes',
    bestFor: 'A banker who wants a fast starting point before buying anything.',
    output: 'Score, maturity tier, top gap, starter prompt, and role playbook path.',
    action: 'Take free assessment',
    href: '/assessment/take',
    featured: false,
    notes: ['No credit card', 'Email optional for summary view', 'Good first step for teams'],
  },
  {
    eyebrow: 'Individual report',
    name: 'In-Depth Assessment',
    price: '$99',
    cadence: 'One-time payment',
    bestFor: 'A manager, executive, or specialist who needs a written readiness plan.',
    output: '48-question diagnostic, eight scores, peer-band comparison, and 90-day action register.',
    action: 'Get the full report',
    href: '/assessment/in-depth',
    featured: true,
    notes: ['Report in about 20 minutes', 'Retake by request within 12 months', '7-day refund if unused'],
  },
  {
    eyebrow: 'Capability build',
    name: 'AiBI-Foundation',
    price: '$295',
    cadence: 'One-time enrollment',
    bestFor: 'An individual learner who needs reusable work products, not just a score.',
    output: '18 modules, saved prompts, workflow templates, reviewed artifacts, and Foundation Packet.',
    action: 'Explore course',
    href: '/courses/foundation/program/purchase',
    featured: false,
    notes: ['Self-paced course', 'Public authenticity URL after completion', '7-day refund if unused'],
  },
  {
    eyebrow: 'Teams',
    name: 'Institution Rollout',
    price: 'Custom',
    cadence: 'Scoped before rollout',
    bestFor: 'A department, cohort, institution, or partner channel that needs seats, reporting, and support.',
    output: 'Assisted rollout planning, partner/channel scope, cohort setup, reporting scope, support path, and optional briefing.',
    action: 'Request institution or partner plan',
    href: '/for-institutions',
    featured: false,
    notes: ['Team Assessment stays assisted', 'Partner/association rollout by request', 'SSO/invoicing discussed before quote'],
  },
] as const;

const COMPARISON_ROWS = [
  {
    label: 'Primary question',
    values: [
      'Where should I start?',
      'What is my full readiness profile?',
      'How do I build repeatable AI skill?',
      'How do we roll this out with a team?',
    ],
  },
  {
    label: 'Core deliverable',
    values: [
      'Snapshot and starter artifact',
      'Written diagnostic report',
      'Reusable work products and certificate',
      'Scoped cohort plan and reporting path',
    ],
  },
  {
    label: 'Credential / proof',
    values: [
      'No credential',
      'Diagnostic report only',
      'AiBI-Foundation certificate with public authenticity URL',
      'Cohort reporting scope agreed before rollout',
    ],
  },
  {
    label: 'Payment',
    values: ['Free', '$99 one-time', '$295 one-time', 'Quote by cohort'],
  },
  {
    label: 'Best next step',
    values: [
      'Complete the 12-question assessment',
      'Buy the In-Depth Assessment',
      'Enroll in Foundation',
      'Submit an institution inquiry',
    ],
  },
] as const;

const DECISION_RULES = [
  {
    title: 'Start free when risk is low.',
    body: 'Use the snapshot when you need a fast read before choosing a paid product.',
  },
  {
    title: 'Buy the $99 report when a decision is waiting.',
    body: 'Use In-Depth when leadership needs eight-dimension evidence and a 90-day register.',
  },
  {
    title: 'Choose Foundation when staff need capability.',
    body: 'Use the course when the outcome needs saved prompts, templates, and reviewed artifacts.',
  },
  {
    title: 'Talk to us before buying for a team.',
    body: 'Team rollout, reporting, SSO, invoicing, and volume pricing are scoped before checkout.',
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
            <h1>Four paths. One clear buyer map.</h1>
            <p>
              Compare the free snapshot, individual report, Foundation course,
              and assisted institution rollout before you reach checkout.
            </p>
            <div className="mk-pricing-hero-actions">
              <Button variant="gold" size="lg" href="/assessment/take">
                Start free <ArrowGlyph />
              </Button>
              <Button variant="ghost-dark" size="lg" href="#compare">
                Compare options
              </Button>
              <Button variant="ghost-dark" size="lg" href="/#roi-calculator">
                Run ROI calculator
              </Button>
            </div>
          </div>

          <div className="mk-pricing-visual" aria-label="Pricing ladder">
            {TIERS.map((tier, index) => (
              <div
                key={tier.name}
                className={`mk-pricing-visual-row${tier.featured ? ' is-featured' : ''}`}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{tier.name}</strong>
                <em>{tier.price}</em>
              </div>
            ))}
          </div>
        </section>

        <section className="mk-pricing-tier-grid" aria-label="Pricing options">
          {TIERS.map((tier) => (
            <article
              key={tier.name}
              className={`mk-pricing-tier${tier.featured ? ' is-featured' : ''}`}
            >
              <p className="mk-k">{tier.eyebrow}</p>
              <h2>{tier.name}</h2>
              <div className="mk-pricing-tier-price">
                <strong>{tier.price}</strong>
                <span>{tier.cadence}</span>
              </div>
              <p className="mk-pricing-tier-best">{tier.bestFor}</p>
              <p className="mk-pricing-tier-output">{tier.output}</p>
              <ul>
                {tier.notes.map((note) => (
                  <li key={note}>{note}</li>
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
            <h2 id="compare-heading">What each option is for.</h2>
          </div>
          <div className="mk-pricing-table-wrap">
            <table className="mk-pricing-table">
              <thead>
                <tr>
                  <th scope="col">Decision point</th>
                  {TIERS.map((tier) => (
                    <th key={tier.name} scope="col">{tier.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {row.values.map((value) => (
                      <td key={value}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mk-pricing-rules" aria-labelledby="pricing-rules-heading">
          <div className="mk-pricing-section-head">
            <p className="mk-k">Decision rules</p>
            <h2 id="pricing-rules-heading">Choose by the work you need done.</h2>
          </div>
          <div className="mk-pricing-rule-list">
            {DECISION_RULES.map((rule) => (
              <article key={rule.title}>
                <h3>{rule.title}</h3>
                <p>{rule.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mk-pricing-support" aria-labelledby="pricing-support-heading">
          <div>
            <p className="mk-k">Support and refunds</p>
            <h2 id="pricing-support-heading">No hidden self-serve team checkout.</h2>
            <p>
              Individual products use one-time checkout. Team buying stays
              assisted until scope, reporting, support, and rollout risk are
              clear. Partner or association rollout requests use the same
              inquiry path. Refund eligibility and purchase help are handled
              through the support path.
            </p>
          </div>
          <div className="mk-pricing-support-actions">
            <Button variant="ink" size="lg" href="/support/purchase-help">
              Purchase help
            </Button>
            <Button variant="ghost-dark" size="lg" href="/for-institutions">
              Institution / partner inquiry
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
