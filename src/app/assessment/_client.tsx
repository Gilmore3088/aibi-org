/* eslint-disable react/no-unescaped-entities */
'use client';

// /assessment — landing page.
//
// Sells one thing: take the free 3-minute snapshot. The $99 in-depth
// diagnostic lives below the fold as the upgrade path, not as a competing
// hero. See the 2026-05-28 product feedback: stop explaining how the
// scoring works, show what the user gets.
//
// Free assessment vocabulary: 12 "readiness signals" (one question each).
// In-depth assessment vocabulary: 8 "scored dimensions". Don't conflate.

import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  EyebrowChip,
  CtaBand,
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

const GaugeIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M12 14l4-4" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </svg>
);
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
const BarChartIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);
const BadgeIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);
const TargetIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const FileIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
// 12 readiness signals — labels match content/assessments/v3 dimension labels
// so they read consistently with the runner and the breakdown page.
// "Signal" is the user-facing word; the data layer still uses "dimension".
const SIGNALS = [
  { title: 'Strategic Value', desc: 'Where AI fits the business.' },
  { title: 'Infrastructure Readiness', desc: 'Systems that can host AI.' },
  { title: 'Data Quality', desc: 'What the model is fed.' },
  { title: 'Security & Approved Tools', desc: 'Which tools are sanctioned.' },
  { title: 'Runtime Safeguards', desc: 'Guardrails in production.' },
  { title: 'Regulatory Compliance', desc: 'SR 11-7, ECOA, BSA fit.' },
  { title: 'Fair Lending Testing', desc: 'Disparate-impact checks.' },
  { title: 'Human-in-the-Loop', desc: 'Where people stay in control.' },
  { title: 'Talent & Culture', desc: 'Who knows how to use AI.' },
  { title: 'Data Safety Reflexes', desc: 'What not to enter.' },
  { title: 'Continuous Validation', desc: 'Re-testing over time.' },
  { title: 'Vendor Risk', desc: 'Third-party AI controls.' },
];

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
const SAMPLE = {
  score: 32,
  max: 48,
  tier: 'Building Momentum',
  topGap: 'Workflow documentation',
  artifact: 'AI Workflow SOP Template',
  nextStep: 'Foundation Course or In-Depth Report',
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
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip icon={<GaugeIcon className="mk-ic" />}>
              Free readiness snapshot · 3 minutes
            </EyebrowChip>
            <h1>Get your AI readiness snapshot in 3 minutes.</h1>
            <p className="mk-lede">
              Answer 12 questions and receive your score, maturity tier, top gap, and a
              starter artifact your team can use immediately. Upgrade later for the full
              8-dimension diagnostic.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/assessment/take">
                Start free assessment <ArrowR className="mk-ic" />
              </Button>
              <Button variant="ghost-dark" size="lg" href="#sample">
                See sample result
              </Button>
            </div>
            <p className="mk-hero-foot">
              No credit card. Score visible after you submit your work email.
            </p>
          </div>

          {/* Hero result card — free outcome only. The $99 sample lives below. */}
          <div className="mk-hreport">
            <div className="mk-hreport-left">
              <div className="mk-k">Sample free result</div>
              <div className="mk-v">{SAMPLE.score}</div>
              <div className="mk-u">/ {SAMPLE.max}</div>
              <div className="mk-tier">
                <BadgeIcon size={16} />
                {SAMPLE.tier}
              </div>
            </div>
            <div className="mk-hreport-right">
              <div className="mk-k">Your first move</div>
              <div className="mk-hresult">
                <div className="mk-hresult-row">
                  <div className="mk-rk">Top gap</div>
                  <div className="mk-rv">{SAMPLE.topGap}</div>
                </div>
                <div className="mk-hresult-row">
                  <div className="mk-rk">Starter artifact</div>
                  <div className="mk-rv">{SAMPLE.artifact}</div>
                </div>
                <div className="mk-hresult-row">
                  <div className="mk-rk">Recommended next step</div>
                  <div className="mk-rv">{SAMPLE.nextStep}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ─────────────────────────────────────────── */}
      <Section variant="std" surface="white" id="sample">
        <SectionHead
          kicker="What you get"
          heading={<>Your result gives you the first move.</>}
          lede={
            <>
              The free assessment is a snapshot. It screens 12 readiness signals and
              recommends the first artifact to build.
            </>
          }
        />
        <div className="mk-result-grid">
          <ResultCard
            icon={<BarChartIcon className="mk-ic-xl" size={22} />}
            label="Score"
            value={`${SAMPLE.score} / ${SAMPLE.max}`}
          />
          <ResultCard
            icon={<BadgeIcon className="mk-ic-xl" size={22} />}
            label="Tier"
            value={SAMPLE.tier}
          />
          <ResultCard
            icon={<TargetIcon className="mk-ic-xl" size={22} />}
            label="Top gap"
            value={SAMPLE.topGap}
          />
          <ResultCard
            icon={<FileIcon className="mk-ic-xl" size={22} />}
            label="Starter artifact"
            value={SAMPLE.artifact}
          />
        </div>
      </Section>

      {/* ── FREE VS IN-DEPTH ─────────────────────────────────────── */}
      <Section variant="std">
        <SectionHead
          kicker="Free vs In-Depth"
          heading={<>Start with a snapshot. Upgrade when you need the full diagnostic.</>}
          lede={
            <>
              The free assessment screens 12 readiness signals. The $99 report goes
              deeper across 8 scored dimensions and produces a role-specific action plan.
            </>
          }
        />
        <div className="mk-tier-grid">
          <ComparisonCard
            label="Free"
            title="Readiness Snapshot"
            price="$0"
            time="3 min · 12 questions"
            desc="A quick screening result that tells you where to start."
            items={['Score out of 48', 'Maturity tier', 'Top gap', 'Starter artifact']}
            cta="Start free"
            href="/assessment/take"
            variant="ink"
          />
          <ComparisonCard
            featured
            label="$99 · Most popular"
            title="In-Depth Diagnostic"
            price="$99"
            time="20 min · 48 questions"
            desc="A reviewer-ready report for leaders who need a real plan."
            items={[
              'Score out of 100',
              '8 scored dimensions',
              'Role-specific roadmap',
              'Reviewer-ready PDF',
            ]}
            cta="Get in-depth report"
            href="/assessment/in-depth"
            variant="gold"
          />
          <ComparisonCard
            label="Institutional"
            title="Team View"
            price="Custom"
            time="Contact for pricing"
            desc="Department rollups, leadership dashboard, briefing support."
            items={['Department rollups', 'Leadership dashboard', 'Executive briefing']}
            cta="Book briefing"
            href="/for-institutions"
            variant="ink"
          />
        </div>
      </Section>

      {/* ── 12 SIGNALS (FREE) ───────────────────────────────────── */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="Free snapshot"
          heading={<>The 12 signals we screen in the free assessment.</>}
          lede={
            <>
              Each question gives us a quick read on one readiness signal. The free
              result is a snapshot, not a full diagnostic.
            </>
          }
        />
        <div className="mk-dims-grid mk-dims-compact">
          {SIGNALS.map((s) => (
            <div key={s.title} className="mk-dcard">
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 8 DIMENSIONS (IN-DEPTH) ─────────────────────────────── */}
      <Section variant="std">
        <div className="mk-indepth-grid">
          <div>
            <p className="mk-kicker mk-kicker-gold">$99 diagnostic</p>
            <h2 className="mk-section-h">
              The in-depth report scores 8 full dimensions.
            </h2>
            <p className="mk-lede mk-lede-light">
              Use the paid report when you need a reviewer-ready PDF, a role-specific
              roadmap, and a clearer action plan for leadership.
            </p>
            <div className="mk-ctas">
              <Button variant="ink" size="lg" href="/assessment/in-depth">
                Get in-depth report
              </Button>
              <Button variant="ghost-light" size="lg" href="/assessment/take">
                Start free first
              </Button>
            </div>
          </div>

          <div className="mk-indepth-sample">
            <div className="mk-indepth-head">
              <div className="mk-k">In-Depth sample</div>
              <div className="mk-indepth-num">
                <span className="mk-v">62</span>
                <span className="mk-u">/ 100 readiness</span>
              </div>
            </div>
            <div className="mk-indepth-dims">
              {IN_DEPTH_DIMENSIONS.map((d) => (
                <div key={d.title} className="mk-indepth-dim">
                  <div className="mk-row">
                    <span className="mk-nm">{d.title}</span>
                    <span className="mk-lv">
                      {d.pct >= 70 ? 'High' : d.pct >= 50 ? 'Med' : 'Low'}
                    </span>
                  </div>
                  <div className="mk-bar">
                    <div className="mk-fill" style={{ width: `${d.pct}%` }} />
                  </div>
                  <p className="mk-indepth-desc">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── FINAL CTA ───────────────────────────────────────────── */}
      <CtaBand
        heading={<>Take the free snapshot first.</>}
        body={
          <>
            Three minutes. A tier, a top gap, and the first artifact to build. Upgrade
            only when you need the full diagnostic.
          </>
        }
        actions={[
          { label: 'Start free assessment', href: '/assessment/take', variant: 'gold' },
          { label: 'Get in-depth report', href: '/assessment/in-depth', variant: 'ghost-dark' },
        ]}
      />

      <StickyMobileCta
        label="Start the free assessment"
        href="/assessment/take"
        source="sticky-mobile-cta-assessment"
      />
    </div>
  );
}

// ---------- Sub-components ----------

function ResultCard({
  icon,
  label,
  value,
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="mk-rescard">
      <div className="mk-rescard-icon">{icon}</div>
      <div className="mk-rescard-label">{label}</div>
      <div className="mk-rescard-value">{value}</div>
    </div>
  );
}

function ComparisonCard({
  featured = false,
  label,
  title,
  price,
  time,
  desc,
  items,
  cta,
  href,
  variant,
}: {
  readonly featured?: boolean;
  readonly label: string;
  readonly title: string;
  readonly price: string;
  readonly time: string;
  readonly desc: string;
  readonly items: readonly string[];
  readonly cta: string;
  readonly href: string;
  readonly variant: 'gold' | 'ink';
}) {
  return (
    <div className={`mk-tier${featured ? ' is-featured' : ''}`}>
      <div className="mk-tier-bar" />
      <div className="mk-body">
        <div className="mk-lab">{label}</div>
        <h3>{title}</h3>
        <div className="mk-price">
          <div className="mk-v">{price}</div>
          <div className="mk-u">{time}</div>
        </div>
        <p className="mk-desc">{desc}</p>
        <ul>
          {items.map((item) => (
            <li key={item}>
              <CheckIcon className="mk-ic" />
              {item}
            </li>
          ))}
        </ul>
        <Button variant={variant} size="lg" href={href}>
          {cta}
        </Button>
      </div>
    </div>
  );
}
