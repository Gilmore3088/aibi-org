'use client';

// /assessment — landing page.
//
// Sells one thing: take the free 3-minute snapshot. The $99 in-depth
// diagnostic sits beside it as the upgrade path, not as a competing hero.
// Show what the user gets rather than how the scoring works.
//
// Free assessment vocabulary: 12 questions.
// In-depth assessment vocabulary: 8 scored readiness dimensions.

import Image from 'next/image';
import Link from 'next/link';
import { ArrowGlyph, Button, SiteHeader, StickyMobileCta } from '@/components/mockup';
import { AxHero, AxSection, AxWindow } from '@/components/ax';
import { questions } from '@content/assessments/v3/questions';

// A real question from the free assessment, shown as the reader will see it.
const PREVIEW_QUESTION = questions.find((q) => q.id === 'dsr-01') ?? questions[0];

const PATHS = [
  {
    key: 'free',
    badge: 'Free snapshot',
    name: 'Your first 30 days',
    price: '$0',
    cadence: '12 questions · about 3 minutes',
    bullets: ['Score out of 48 and your tier', 'Your top readiness gap', 'A starter prompt and 30-day plan'],
    action: 'Take it free',
    href: '/assessment/take',
    art: {
      src: '/downloads/covers/sample-readiness-report-p2.jpg',
      alt: 'Sample readiness report: score, tier and top gap (illustrative data)',
      width: 640,
      height: 828,
    },
    featured: true,
  },
  {
    key: 'in-depth',
    badge: 'In-Depth report',
    name: 'The full 90-day plan',
    price: '$99',
    cadence: '48 questions · one-time',
    bullets: ['Eight scored readiness dimensions', 'Root causes for each gap', 'A 90-day action register'],
    action: 'See the In-Depth report',
    href: '/assessment/in-depth',
    art: {
      src: '/downloads/covers/in-depth-playbook-p5.jpg',
      alt: 'In-Depth playbook page: choose your 90-day path',
      width: 700,
      height: 906,
    },
    featured: false,
  },
] as const;

const STEPS = [
  { title: 'Answer', body: 'Twelve plain questions about how you use AI at work today.' },
  { title: 'See where you stand', body: 'A score, your tier, and the one gap to close first.' },
  { title: 'Start on Monday', body: 'Copy a starter prompt and follow a 30-day plan for your role.' },
] as const;

export default function AssessmentLandingPage() {
  return (
    <div className="mockup-scope ax-page">
      <SiteHeader activePath="/assessment" />

      <AxHero
        cmd="assessment --free --questions 12"
        title="Find your AI starting point."
        lede="Three minutes. A score, your top gap, and a prompt you can use on Monday."
        actions={
          <>
            <Button variant="gold" size="lg" href="/assessment/take">
              Start free assessment <ArrowGlyph />
            </Button>
            <Button variant="ghost-dark" size="lg" href="/results/sample">
              See a sample report
            </Button>
          </>
        }
        aside={
          <AxWindow title="readiness-assessment" meta="Sample question">
            <p className="as-land-q">{PREVIEW_QUESTION.prompt}</p>
            <ol className="as-land-opts">
              {PREVIEW_QUESTION.options.map((option, index) => (
                <li key={option.label}>
                  <span className="as-land-letter" aria-hidden="true">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option.label}
                </li>
              ))}
            </ol>
            <p className="as-land-note">
              Written for every seat: frontline tellers, branch teams, lending, operations, compliance, and marketing.
            </p>
          </AxWindow>
        }
      />

      <main>
        <section className="ax-section ax-light" id="sample" aria-labelledby="paths-title">
          <div className="mk-container">
            <div className="ax-section-head">
              <p className="ax-k">Two outputs</p>
              <h2 id="paths-title" className="ax-display">
                Start free. Upgrade when you need the plan.
              </h2>
            </div>
            <div className="ax-tiers as-land-paths">
              {PATHS.map((path) => (
                <article key={path.key} className={`ax-tier${path.featured ? ' is-featured' : ''}`}>
                  <div className="ax-tier-art">
                    <figure className="ax-tier-page">
                      <Image src={path.art.src} alt={path.art.alt} width={path.art.width} height={path.art.height} sizes="360px" />
                    </figure>
                  </div>
                  <p className="ax-k ax-gold">{path.badge}</p>
                  <h3 className="as-land-name">{path.name}</h3>
                  <p className="ax-plan-price">
                    <strong>{path.price}</strong>
                    <span>{path.cadence}</span>
                  </p>
                  <ul className="ax-checklist">
                    {path.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <Link href={path.href} className="ax-tier-cta">
                    {path.action} <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <AxSection id="how" kicker="How it works" title="Three minutes, then a plan.">
          <ol className="ax-pipeline" style={{ ['--ax-steps' as string]: 3 }} aria-label="How the free assessment works">
            {STEPS.map((step, index) => (
              <li key={step.title} className={index === 0 ? 'is-first' : undefined}>
                <span className="ax-pipeline-node" aria-hidden="true" />
                <span className="ax-k">{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="ax-actions as-land-actions">
            <Button variant="gold" size="lg" href="/assessment/take">
              Take the free assessment <ArrowGlyph />
            </Button>
          </div>
        </AxSection>
      </main>

      <StickyMobileCta
        label="Start the free assessment"
        href="/assessment/take"
        source="sticky-mobile-cta-assessment"
      />
    </div>
  );
}
