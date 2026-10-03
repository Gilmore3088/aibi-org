import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowGlyph, Button, SiteHeader } from '@/components/mockup';
import { AxHero, AxSection, AxWindow } from '@/components/ax';
import { BRAND, PRINCIPLES } from '@content/copy';
import { REGULATIONS } from '@content/regulations';

export const metadata: Metadata = {
  title: 'About — The AI Banking Institute',
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
    <div className="mockup-scope ax-page">
      <SiteHeader activePath="/about" />

      <AxHero
        cmd="about --institute aibi --audience community-banks,credit-unions"
        title="Practical AI training for banks that need more than a demo."
        lede={
          <>
            {BRAND.name} helps community banks and credit unions turn AI interest into safe, reviewable
            work: clear use cases, clean data boundaries, checked sources, and human ownership.
          </>
        }
        actions={
          <>
            <Button href="/assessment/take" variant="gold" size="lg">
              Start the assessment <ArrowGlyph />
            </Button>
            <Button href="/security" variant="ghost-dark" size="lg">
              View security standards
            </Button>
          </>
        }
        aside={
          <AxWindow title="why-this-exists.md" meta="origin">
            <h2 className="ax-window-h">AI showed up before many smaller institutions had a plan.</h2>
            <p className="ax-muted ax-para">
              The idea started at a banking conference where AI was everywhere, but many community bank and
              credit union teams still did not have a practical strategy for use cases, controls, or ownership.
            </p>
            <p className="ax-muted ax-para">
              AiBI exists to make that next step approachable: help the people who know the workflow turn one
              useful idea into something their institution can review, run, and improve.
            </p>
          </AxWindow>
        }
      />

      <main>
        <AxSection
          light
          id="building"
          kicker="What we are building"
          title="What we do."
          lede="The goal is not to make every banker a software engineer. The goal is to give ideas people a safe, practical way to define a problem, shape a solution, and hand off work that can survive review."
        >
          <ol className="ax-pipeline" style={{ ['--ax-steps' as string]: 3 }} aria-label="Readiness path">
            {READINESS_PATH.map((step, index) => (
              <li key={step.title} className={index === 0 ? 'is-first' : undefined}>
                <span className="ax-pipeline-node" aria-hidden="true" />
                <span className="ax-k">{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </AxSection>

        <AxSection
          id="principles"
          kicker="Operating principles"
          title="How we work."
          lede="These principles keep the curriculum focused on useful bank work, not generic AI talking points."
        >
          <dl className="ax-defs">
            {PRINCIPLES.map((principle) => (
              <div key={principle.number}>
                <dt>
                  <span className="ax-k ax-gold">{principle.number}</span> {principle.title}
                </dt>
                <dd>{principle.body}</dd>
              </div>
            ))}
          </dl>
        </AxSection>

        <AxSection light id="grounded" kicker="How the work stays grounded" title="Every exercise ends in reviewable work.">
          <dl className="ax-defs">
            {OPERATING_STANDARDS.map((standard) => (
              <div key={standard.title}>
                <dt>{standard.title}</dt>
                <dd>{standard.body}</dd>
              </div>
            ))}
          </dl>
        </AxSection>

        <AxSection
          id="references"
          kicker="Public reference map"
          title="Sources we cite."
          lede="The curriculum uses public references as source material for disciplined AI work in banking. Those references do not approve the Institute, the curriculum, or the credential."
        >
          <ol className="ax-sources ax-sources-grid">
            {REGULATIONS.map((reference, i) => (
              <li key={reference.slug}>
                <span className="ax-gold">[{i + 1}]</span>
                <span>
                  <Link href={`/references#${reference.slug}`}>{reference.short}</Link>
                  <small>{reference.issuer}</small>
                </span>
              </li>
            ))}
          </ol>
          <p style={{ marginTop: 28 }}>
            <Link className="ax-link-mono" href="/references">
              See every source we cite
            </Link>
          </p>
        </AxSection>

        <AxSection light id="boundaries" kicker="Trust boundaries" title="What we don't claim.">
          <ul className="ax-checklist ax-checklist-no">
            {TRUST_BOUNDARIES.map((boundary) => (
              <li key={boundary}>{boundary}</li>
            ))}
          </ul>
        </AxSection>

        <AxSection id="press" kicker="Press and research" title="Need a source, quote, or background?">
          <div className="ax-rules">
            <p className="ax-muted ax-para">
              Journalists, analysts, podcasters, and researchers can send questions to {BRAND.emails.contact}.
              Include your deadline, outlet, topic, and whether you need source background or artifact context.
            </p>
            <AxWindow title="attribution-boundary" meta="policy">
              <p className="ax-para" style={{ marginTop: 0 }}>
                The Institute will not imply regulator, customer, advisor, learner, or institution endorsement
                without explicit public-attribution approval.
              </p>
              <Button href={PRESS_MAILTO} variant="ghost-dark">
                Email press inquiry
              </Button>
            </AxWindow>
          </div>
        </AxSection>
      </main>

      <section className="ax-section ax-close">
        <div className="mk-container">
          <h2 className="ax-display">
            Start with a readiness score. <span className="ax-gold">Then inspect the work.</span>
          </h2>
          <p className="ax-muted">
            The fastest way to understand the Institute is to see the artifacts it asks a learner to produce.
          </p>
          <div className="ax-actions">
            <Button variant="gold" size="lg" href="/assessment/take">
              Take the free assessment <ArrowGlyph />
            </Button>
            <Button variant="ghost-dark" size="lg" href="/courses">
              View the course
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
