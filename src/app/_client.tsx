/* eslint-disable react/no-unescaped-entities */
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

// ---------- Page ----------

export default function HomePage() {
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
            <h1>AI training that becomes real banking work.</h1>
            <p className="mk-lede">
              Score your readiness. Train by role. Build workflows your team reuses.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/assessment/take">
                Get my AI readiness score <ArrowGlyph />
              </Button>
              <Button variant="ghost-dark" size="lg" href="/courses">
                See what learners build
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
        <div className="mk-value-path">
          {VALUE_PATH.map(({ step, title, body, icon: Icon, tier }) => (
            <div key={step} className="mk-vp-card">
              <span className="mk-pic">
                <Icon className="mk-ic-lg" size={20} />
              </span>
              <div className="mk-k">{step}</div>
              <h3 className="mk-vp-title">{title}</h3>
              <p className="mk-vp-body">{body}</p>
              <span className={`mk-vp-tier mk-vp-tier-${tier}`}>
                {tier === 'free' ? 'Free' : 'In Foundation course'}
              </span>
            </div>
          ))}
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
        <ROIAccordion>
          <ROICalculatorBody
            ctaLabel="Take the Assessment"
            ctaHref="/assessment/take"
            briefingSource="home"
          />
        </ROIAccordion>
      </Section>

      <CtaBand
        hiddenOnMobile
        heading={<>Start with readiness. Leave with reviewed workflows.</>}
        actions={[
          { label: 'Get my AI readiness score', href: '/assessment/take', variant: 'gold' },
          { label: 'See what learners build', href: '/courses/foundation', variant: 'ghost-dark' },
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

// Mobile: collapses the ROI calculator behind a "See what an hour saved is
// worth →" trigger so the 4 sliders + result block don't eat ~600px of
// vertical scroll. Desktop: trigger hidden, body always visible.
// 2026-05-28 mobile audit punch-list item.
function ROIAccordion({ children }: { readonly children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`mk-roi-wrap mk-roi-accordion${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="mk-roi-accordion-trigger"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide the calculator' : 'See what an hour saved is worth →'}
      </button>
      <div className="mk-roi-accordion-body">{children}</div>
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

const PRICE_TIERS: { label: string; price: string; note: string }[] = [
  { label: 'Readiness baseline', price: 'Free', note: '12 questions, 3 minutes' },
  { label: 'In-Depth Report', price: '$99', note: '48-question deep dive' },
  { label: 'AiBI-Foundation Course', price: '$295', note: 'Full curriculum + certificate' },
  { label: 'Institutional pricing', price: 'Custom', note: 'Team seats, on request' },
];

function PriceStrip() {
  return (
    <div className="mk-price-strip">
      <div className="mk-container">
        {PRICE_TIERS.map(({ label, price, note }) => (
          <div key={label} className="mk-price-tile">
            <span className="mk-price-amount">{price}</span>
            <span className="mk-price-label">{label}</span>
            <span className="mk-price-note">{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
