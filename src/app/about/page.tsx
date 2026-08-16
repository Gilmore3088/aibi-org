import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowGlyph, Button, CtaBand, SiteHeader } from '@/components/mockup';
import { BRAND, PRINCIPLES } from '@content/copy';
import { REGULATIONS } from '@content/regulations';

export const metadata: Metadata = {
  title: 'About',
  description:
    'How The AI Banking Institute helps community banks and credit unions turn AI interest into safe, reviewable work.',
  alternates: { canonical: '/about' },
};

const PRESS_MAILTO =
  `mailto:${BRAND.emails.contact}?subject=Press%20%2F%20media%20inquiry%20%E2%80%94%20The%20AI%20Banking%20Institute`;

const READINESS_PATH = [
  {
    title: 'Pick one workflow',
    body: 'Start with a real banking task instead of a generic AI demo.',
  },
  {
    title: 'Set the boundaries',
    body: 'Classify the use, remove sensitive data, and name the human owner.',
  },
  {
    title: 'Leave a usable artifact',
    body: 'Produce something a manager, compliance partner, risk officer, or IT reviewer can inspect.',
  },
] as const;

const OPERATING_STANDARDS = [
  {
    title: 'Public source map',
    body: 'Curriculum references point to named public guidance. They are not presented as regulator approval.',
  },
  {
    title: 'Synthetic practice data',
    body: 'Labs and examples do not require customer PII or confidential records.',
  },
  {
    title: 'Reviewable work',
    body: 'Learners produce use cards, SOPs, briefs, and checklists that can move through a bank review.',
  },
  {
    title: 'Plain attribution',
    body: 'No advisor, customer, learner, or institution appears as proof without explicit public approval.',
  },
] as const;

const TRUST_BOUNDARIES = [
  'No regulator issues, approves, recognizes, or endorses AiBI credentials.',
  'No ROI estimate is presented as guaranteed savings or a projected efficiency-ratio change.',
  'No learner needs to paste customer PII or confidential records into course practice prompts.',
  'No named person, quote, or logo appears without explicit public-attribution approval.',
] as const;

export default function AboutPage() {
  return (
    <div className="mockup-scope aibi-about">
      <SiteHeader activePath="/about" />

      <header className="aibi-about-hero">
        <div className="mk-container aibi-about-hero-inner">
          <div className="aibi-about-hero-copy">
            <p className="aibi-about-kicker">About the Institute</p>
            <h1>Practical AI training for banks that need more than a demo.</h1>
            <p>
              {BRAND.name} helps community banks and credit unions turn AI
              interest into safe, reviewable work: clear use cases, clean data
              boundaries, checked sources, and human ownership.
            </p>
            <div className="aibi-about-actions">
              <Button href="/assessment/take" variant="gold" size="lg">
                Start the assessment <ArrowGlyph />
              </Button>
              <Button href="/security" variant="ghost-dark" size="lg">
                View security standards
              </Button>
            </div>
          </div>

          <div className="aibi-about-origin" aria-label="Why this exists">
            <p className="aibi-about-kicker">Why this exists</p>
            <h2>AI showed up before many smaller institutions had a plan.</h2>
            <p>
              The idea started at a banking conference where AI was everywhere,
              but many community bank and credit union teams still did not have
              a practical strategy for use cases, controls, or ownership.
            </p>
            <p>
              AiBI exists to make that next step approachable: help the people
              who know the workflow turn one useful idea into something their
              institution can review, run, and improve.
            </p>
          </div>
        </div>
      </header>

      <main>
        <section className="aibi-about-section">
          <div className="mk-container aibi-about-split">
            <div>
              <p className="aibi-about-kicker">What we are building</p>
              <h2>Turn bankers into builders, safely.</h2>
              <p>
                The goal is not to make every banker a software engineer. The
                goal is to give ideas people a safe, practical way to define a
                problem, shape a solution, and hand off work that can survive
                review.
              </p>
            </div>
            <div className="aibi-about-path" aria-label="Readiness path">
              {READINESS_PATH.map((step, index) => (
                <div key={step.title} className="aibi-about-path-step">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="aibi-about-section aibi-about-section-white">
          <div className="mk-container">
            <div className="aibi-about-section-head">
              <p className="aibi-about-kicker">Operating principles</p>
              <h2>Clear standards, short enough to remember.</h2>
              <p>
                These principles keep the curriculum focused on useful bank work,
                not generic AI talking points.
              </p>
            </div>
            <div className="aibi-about-principles">
              {PRINCIPLES.map((principle) => (
                <article key={principle.number} className="aibi-about-principle">
                  <span>{principle.number}</span>
                  <h3>{principle.title}</h3>
                  <p>{principle.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="aibi-about-section">
          <div className="mk-container aibi-about-standards">
            <div className="aibi-about-section-head">
              <p className="aibi-about-kicker">How the work stays grounded</p>
              <h2>Designed for review, not just completion.</h2>
            </div>
            <div className="aibi-about-standard-grid">
              {OPERATING_STANDARDS.map((standard) => (
                <article key={standard.title} className="aibi-about-standard">
                  <h3>{standard.title}</h3>
                  <p>{standard.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="aibi-about-section aibi-about-section-white">
          <div className="mk-container aibi-about-reference-row">
            <div>
              <p className="aibi-about-kicker">Public reference map</p>
              <h2>Sources are named. Endorsement is not implied.</h2>
              <p>
                The curriculum uses public references as source material for
                disciplined AI work in banking. Those references do not approve
                the Institute, the curriculum, or the credential.
              </p>
              <Link className="aibi-about-text-link" href="/references">
                See every source we cite
              </Link>
            </div>
            <div className="aibi-about-reference-list">
              {REGULATIONS.map((reference) => (
                <Link key={reference.slug} href={`/references#${reference.slug}`}>
                  <strong>{reference.short}</strong>
                  <span>{reference.issuer}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="aibi-about-section aibi-about-guardrails">
          <div className="mk-container">
            <div className="aibi-about-section-head">
              <p className="aibi-about-kicker">Trust boundaries</p>
              <h2>What we will not overclaim.</h2>
            </div>
            <div className="aibi-about-boundaries">
              {TRUST_BOUNDARIES.map((boundary) => (
                <p key={boundary}>{boundary}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="aibi-about-section aibi-about-section-white">
          <div className="mk-container aibi-about-contact">
            <div>
              <p className="aibi-about-kicker">Press and research</p>
              <h2>Need a source, quote, or background?</h2>
              <p>
                Journalists, analysts, podcasters, and researchers can send
                questions to {BRAND.emails.contact}. Include your deadline,
                outlet, topic, and whether you need source background or
                artifact context.
              </p>
            </div>
            <div className="aibi-about-contact-panel">
              <h3>Attribution boundary</h3>
              <p>
                The Institute will not imply regulator, customer, advisor,
                learner, or institution endorsement without explicit
                public-attribution approval.
              </p>
              <Button href={PRESS_MAILTO} variant="ink">
                Email press inquiry
              </Button>
            </div>
          </div>
        </section>
      </main>

      <CtaBand
        heading={<>Start with a readiness score. Then inspect the work.</>}
        body={
          <>The fastest way to understand the Institute is to see the artifacts it asks a learner to produce.</>
        }
        actions={[
          { label: 'Get readiness score', href: '/assessment/take', variant: 'gold' },
          { label: 'View the course', href: '/courses', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}
