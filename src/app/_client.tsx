'use client';

import React, { useState } from 'react';
import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  ArrowGlyph,
  CtaBand,
  StickyMobileCta,
} from '@/components/mockup';
import { ROICalculatorBody } from '@/components/sections/ROICalculatorBody';
import { AdvisorsStrip } from '@/components/sections/AdvisorsStrip';

// ---------- Stroke icons (inline SVGs to keep the bundle lean) ----------

type IconProps = { className?: string; size?: number };

const sw = (props: IconProps) => ({
  className: props.className,
  width: props.size,
  height: props.size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

const ZapIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const CheckSquareIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const LayersIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const FlaskIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M10 2v7.31" />
    <path d="M14 9.3V2" />
    <path d="M8.5 2h7" />
    <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
  </svg>
);
const ToolboxStackIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <polyline points="22 19 12 24 2 19" />
    <polyline points="22 12 12 17 2 12" />
    <polygon points="12 2 22 7 12 12 2 7" />
  </svg>
);

// ---------- Static data ----------

const VALUE_PATH: { step: string; title: string; body: string; icon: (p: IconProps) => JSX.Element; tier: 'free' | 'paid' }[] = [
  { step: 'Assess', title: 'Find readiness gaps', body: 'Twelve questions, three minutes. Score, tier, and a starter artifact.', icon: CheckSquareIcon, tier: 'free' },
  { step: 'Train', title: 'Learn by role', body: 'Foundation Course modules that map to compliance, retail, ops, and marketing work.', icon: LayersIcon, tier: 'paid' },
  { step: 'Practice', title: 'Use safe scenarios', body: 'Realistic synthetic banking scenarios. Compare model output before you take it to real work.', icon: FlaskIcon, tier: 'paid' },
  { step: 'Build', title: 'Save reviewed workflows', body: 'Prompts, SOPs, and review checklists you keep — reusable across your team.', icon: ToolboxStackIcon, tier: 'paid' },
];

const VALUE_PREVIEWS: Record<string, { label: string; title: string; rows: [string, string][] }> = {
  Assess: {
    label: 'Sample readiness output',
    title: 'Score, top gap, first artifact',
    rows: [
      ['Readiness', '62 / 100'],
      ['Top gap', 'Workflow documentation'],
      ['Starter', 'AI Workflow SOP'],
    ],
  },
  Train: {
    label: 'Foundation course output',
    title: 'Module work becomes a packet',
    rows: [
      ['Module', 'Data boundary'],
      ['Practice', 'Sanitized prompt run'],
      ['Artifact', 'Acceptable Use card'],
    ],
  },
  Practice: {
    label: 'Sandbox run',
    title: 'Scenario before real work',
    rows: [
      ['Data', 'Synthetic only'],
      ['Output', 'Draft job aid'],
      ['Review', 'Manager checklist'],
    ],
  },
  Build: {
    label: 'Saved workflow',
    title: 'Prompt becomes reusable',
    rows: [
      ['Asset', 'Campaign review skill'],
      ['Owner', 'Marketing + compliance'],
      ['Status', 'Reviewed v1.1'],
    ],
  },
};

// ---------- Page ----------

export default function HomePage() {
  const [activeValueStep, setActiveValueStep] = useState(VALUE_PATH[0].step);
  const activePreview = VALUE_PREVIEWS[activeValueStep];
  const activeValueId = activeValueStep.toLowerCase();

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/" />

      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <p
              style={{
                margin: '0 0 14px',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--gold-soft)',
              }}
            >
              For community banks &amp; credit unions
            </p>
            <h1>AI training that becomes real banking work.</h1>
            <p className="mk-lede">
              Score your readiness. Train by role. Build workflows your team reuses.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/assessment/take">
                Get my AI readiness score <ArrowGlyph />
              </Button>
              <Button variant="ghost-dark" size="lg" href="/courses">
                Start learning
              </Button>
            </div>
          </div>
          <HeroReportCard />
        </div>
      </section>

      <Section variant="std" surface="white">
        <SectionHead
          kicker="The value path"
          heading={<>Start with readiness. Leave with reviewed workflows.</>}
        />
        <div className="mk-value-proof">
          <div className="mk-value-proof-steps" role="tablist" aria-label="Value path preview">
            {VALUE_PATH.map(({ step, title, body, icon: Icon, tier }) => (
              <button
                key={step}
                id={`value-${step.toLowerCase()}-tab`}
                type="button"
                role="tab"
                aria-selected={activeValueStep === step}
                aria-controls={`value-${step.toLowerCase()}-panel`}
                className={activeValueStep === step ? 'is-active' : undefined}
                onClick={() => setActiveValueStep(step)}
              >
                <span className="mk-pic">
                  <Icon className="mk-ic-lg" size={20} />
                </span>
                <span className="mk-k">{step}</span>
                <strong>{title}</strong>
                <span>{body}</span>
                <em>{tier === 'free' ? 'Free' : 'In Foundation course'}</em>
              </button>
            ))}
          </div>
          <div
            id={`value-${activeValueId}-panel`}
            className="mk-value-proof-panel"
            role="tabpanel"
            aria-labelledby={`value-${activeValueId}-tab`}
          >
            <p className="mk-k">{activePreview.label}</p>
            <h3>{activePreview.title}</h3>
            <div className="mk-value-proof-rows">
              {activePreview.rows.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <p className="mk-value-proof-note">
              Each step produces a concrete artifact your team can review, save, and reuse.
            </p>
          </div>
        </div>
      </Section>

      <AdvisorsStrip />

      <PriceStrip />

      <Section variant="std">
        <SectionHead
          kicker="Impact"
          heading={<>What could one hour saved per employee be worth?</>}
          lede={<>Adjust team size, cost, and the low/high range of hours automatable per week. See annual value, hours recaptured, and payroll percentage.</>}
        />
        <div className="mk-roi-wrap">
          <ROICalculatorBody
            ctaLabel="Take the Assessment"
            ctaHref="/assessment/take"
            briefingSource="home"
          />
        </div>
      </Section>

      <CtaBand
        hiddenOnMobile
        heading={<>Start with readiness. Leave with reviewed workflows.</>}
        actions={[
          { label: 'Get my AI readiness score', href: '/assessment/take', variant: 'gold' },
          { label: 'Start learning', href: '/courses/foundation', variant: 'ghost-dark' },
        ]}
      />

      <StickyMobileCta
        label="Get my AI readiness score"
        href="/assessment/take"
        source="home-sticky"
      />
    </div>
  );
}

function HeroReportCard() {
  return (
    <div className="mk-hreport">
      <div className="mk-hreport-left">
        <div className="mk-k">Sample report</div>
        <div className="mk-v">62</div>
        <div className="mk-u">/ 100 readiness</div>
        <div className="mk-tier">
          <ZapIcon size={16} />
          Building Momentum
        </div>
      </div>
      <div className="mk-hreport-right">
        <div className="mk-hr-row">
          <div className="mk-k">Top gap</div>
          <div className="mk-hr-v">Workflow documentation</div>
        </div>
        <div className="mk-hr-row">
          <div className="mk-k">Recommended next step</div>
          <div className="mk-hr-v">Foundation Course</div>
        </div>
        <div className="mk-hr-row">
          <div className="mk-k">Starter artifact</div>
          <div className="mk-hr-v">Workflow SOP template</div>
        </div>
      </div>
    </div>
  );
}

const PRICE_TIERS: {
  eyebrow: string;
  label: string;
  price: string;
  note: string;
  href: string;
  action: string;
  featured?: boolean;
}[] = [
  {
    eyebrow: 'Start here',
    label: 'Readiness baseline',
    price: 'Free',
    note: '12 questions. Score, top gap, and first artifact.',
    href: '/assessment/take',
    action: 'Start free',
    featured: true,
  },
  {
    eyebrow: 'Deep dive',
    label: 'In-Depth Report',
    price: '$99',
    note: '48-question diagnostic with a 90-day playbook.',
    href: '/assessment/in-depth',
    action: 'View report',
  },
  {
    eyebrow: 'Capability',
    label: 'AiBI-Foundation',
    price: '$295',
    note: 'Course, practice reps, artifacts, and certificate.',
    href: '/courses',
    action: 'Explore course',
  },
  {
    eyebrow: 'Teams',
    label: 'Institutional rollout',
    price: 'Custom',
    note: 'Cohorts, seats, reporting, and advisory support.',
    href: '/for-institutions',
    action: 'Talk to us',
  },
];

function PriceStrip() {
  return (
    <section className="mk-price-strip" aria-labelledby="home-price-strip-heading">
      <div className="mk-container mk-price-strip-inner">
        <div className="mk-price-strip-copy">
          <p className="mk-k">Choose a path</p>
          <h2 id="home-price-strip-heading">Start small or build the full capability.</h2>
          <p>Each path leads to a concrete output, not another generic AI webinar.</p>
        </div>
        <div className="mk-price-options">
          {PRICE_TIERS.map(({ eyebrow, label, price, note, href, action, featured }) => (
            <a
              key={label}
              href={href}
              className={`mk-price-option${featured ? ' is-featured' : ''}`}
            >
              <span className="mk-price-eyebrow">{eyebrow}</span>
              <span className="mk-price-amount">{price}</span>
              <span className="mk-price-label">{label}</span>
              <span className="mk-price-note">{note}</span>
              <span className="mk-price-action">
                {action} <ArrowGlyph />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
