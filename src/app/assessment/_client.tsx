'use client';

// /assessment — landing page.
//
// Sells one thing: take the free 3-minute snapshot. The $99 in-depth
// diagnostic lives below the fold as the upgrade path, not as a competing
// hero. See the 2026-05-28 product feedback: stop explaining how the
// scoring works, show what the user gets.
//
// Free assessment vocabulary: 12 questions.
// In-depth assessment vocabulary: 8 scored readiness dimensions.

import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  StickyMobileCta,
} from '@/components/mockup';

// ---------- Icons ----------

type IconProps = { className?: string; size?: number };
const sw = (p: IconProps) => ({
  className: p.className,
  width: p.size,
  height: p.size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

const ArrowR = (p: IconProps) => (
  <svg {...sw(p)}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const CheckIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// 8 in-depth dimensions — distinct from signals; lives below the fold.
const IN_DEPTH_DIMENSIONS = [
  { title: 'Governance', desc: 'Policy, ownership, review, and evidence.', pct: 64 },
  { title: 'Tool fluency', desc: 'Ability to select and use AI tools safely.', pct: 58 },
  { title: 'Risk awareness', desc: 'Customer, compliance, and data risk.', pct: 72 },
  { title: 'Workflow fit', desc: 'Ability to map AI into real work.', pct: 48 },
  { title: 'Data judgment', desc: 'Safe inputs, redaction, and data boundaries.', pct: 66 },
  { title: 'Documentation', desc: 'Tool, input, output, reviewer, retention.', pct: 54 },
  { title: 'Role readiness', desc: 'Function-specific use cases and artifacts.', pct: 60 },
  { title: 'Leadership', desc: 'Sponsor clarity, training path, rollout posture.', pct: 70 },
];

// Sample free outcome — illustrative numbers so the buyer sees the shape.
// Illustrative numbers so the buyer sees the shape. Kept consistent with the
// home page's result preview, and internally correct: 36/48 lands in the 33–40
// "Building Momentum" band (the previous 32 was actually the Early Stage band).
const SAMPLE = {
  score: 36,
  max: 48,
  tier: 'Building Momentum',
  topGap: 'Documentation',
  artifact: 'AI Recordkeeping Template',
};

// ---------- Page ----------

export default function AssessmentLandingPage() {
  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/assessment" />

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner mk-assessment-hero-inner">
          <div>
            <p className="mk-kicker-gold-soft">Assessment</p>
            <h1>Find your AI starting point.</h1>
            <p className="mk-lede">
              12 questions in three minutes give you a score, top gap, and a
              starter artifact. The paid assessment adds deeper diagnostic
              detail across eight scored readiness dimensions.
            </p>
            <p className="mk-hero-role-note">
              Role examples include frontline tellers, branch teams, lending,
              operations, compliance, and marketing.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/assessment/take">
                Start free assessment <ArrowR className="mk-ic" />
              </Button>
              <Button variant="ghost-light" size="lg" href="/assessment/in-depth">
                See paid assessment
              </Button>
            </div>
          </div>
          <HeroReportPreview />
        </div>
      </section>

      {/* ── OUTPUT CHOICE ───────────────────────────────────────── */}
      <Section variant="std" surface="white" id="sample">
        <SectionHead
          kicker="Two outputs"
          heading={<>Start free. Upgrade for the 90-day report.</>}
          lede={
            <>
              The free path gives the first month. The paid path gives the
              full diagnostic.
            </>
          }
        />
        <AssessmentPathPreview />
      </Section>

      <StickyMobileCta
        label="Start the free assessment"
        href="/assessment/take"
        source="sticky-mobile-cta-assessment"
      />
    </div>
  );
}

// ---------- Sub-components ----------

function HeroReportPreview() {
  return (
    <aside className="mk-assessment-report" aria-label="Assessment result preview">
      <div className="mk-assessment-report-top">
        <span>Sample result</span>
        <strong>{SAMPLE.score}/{SAMPLE.max}</strong>
      </div>
      <div className="mk-assessment-score-row">
        <div>
          <p>Top gap</p>
          <strong>{SAMPLE.topGap}</strong>
        </div>
        <div>
          <p>Tier</p>
          <strong>{SAMPLE.tier}</strong>
        </div>
      </div>
      <div className="mk-assessment-artifact">
        <span>Your starter artifact</span>
        <strong>{SAMPLE.artifact}</strong>
      </div>
    </aside>
  );
}

function AssessmentPathPreview() {
  return (
    <div className="mk-assessment-path">
      <article className="mk-assessment-path-card">
        <div className="mk-path-eyebrow">Free snapshot</div>
        <h3>Get your first 30-day AI action brief.</h3>
        <p>
          Twelve readiness signals produce a score, maturity tier, top gap,
          and one starter artifact in about three minutes.
        </p>
        <ul>
          <li><CheckIcon className="mk-ic" /> Score out of 48</li>
          <li><CheckIcon className="mk-ic" /> Top readiness gap</li>
          <li><CheckIcon className="mk-ic" /> Your starter artifact</li>
        </ul>
        <Button variant="ink" size="lg" href="/assessment/take">
          Start free
        </Button>
      </article>

      <article className="mk-assessment-path-card is-paid">
        <div className="mk-path-eyebrow">$99 In-Depth</div>
        <h3>Get the full 90-day plan.</h3>
        <p>
          Forty-eight questions convert the snapshot into a personal report,
          eight scored dimensions, peer bands, and a 90-day action register.
        </p>
        <div className="mk-paid-meter" aria-label="In-Depth report preview">
          {IN_DEPTH_DIMENSIONS.slice(0, 4).map((dimension) => (
            <div key={dimension.title}>
              <span>{dimension.title}</span>
              <i><b style={{ width: `${dimension.pct}%` }} /></i>
            </div>
          ))}
        </div>
        <Button variant="gold" size="lg" href="/assessment/in-depth">
          Get In-Depth report
        </Button>
      </article>
    </div>
  );
}
