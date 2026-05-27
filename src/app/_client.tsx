/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  ArrowGlyph,
  EyebrowChip,
  CtaBand,
} from '@/components/mockup';

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

const LockKeyholeIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="12" cy="16" r="1" />
    <rect x="3" y="10" width="18" height="12" rx="2" />
    <path d="M7 10V7a5 5 0 0 1 9.33-2.5" />
  </svg>
);
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

const VALUE_PATH: { step: string; title: string; body: string; icon: (p: IconProps) => JSX.Element }[] = [
  { step: 'Assess', title: 'Find readiness gaps', body: 'Twelve questions, three minutes. Score, tier, and a starter artifact.', icon: CheckSquareIcon },
  { step: 'Train', title: 'Learn by role', body: 'Foundation Course modules that map to compliance, retail, ops, and marketing work.', icon: LayersIcon },
  { step: 'Practice', title: 'Use safe scenarios', body: 'Realistic synthetic banking scenarios. Compare model output before you take it to real work.', icon: FlaskIcon },
  { step: 'Build', title: 'Save reviewed workflows', body: 'Prompts, SOPs, and review checklists you keep — reusable across your team.', icon: ToolboxStackIcon },
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
            <EyebrowChip icon={<LockKeyholeIcon className="mk-ic" />}>
              Built for banks, credit unions, and regulated teams
            </EyebrowChip>
            <h1>AI training that becomes real banking work.</h1>
            <p className="mk-lede">
              Assess readiness, train by role, practice safely, and build reusable prompts, skills, SOPs, and review checklists.
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
          {VALUE_PATH.map(({ step, title, body, icon: Icon }) => (
            <div key={step} className="mk-vp-card">
              <span className="mk-pic">
                <Icon className="mk-ic-lg" size={20} />
              </span>
              <div className="mk-k">{step}</div>
              <h3 className="mk-vp-title">{title}</h3>
              <p className="mk-vp-body">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section variant="std">
        <SectionHead
          kicker="Impact"
          heading={<>What could one hour saved per employee be worth?</>}
          lede={<>Adjust the inputs to see annual value. Conservative — assumes one hour saved each week, fully-loaded labor cost, 50 working weeks.</>}
        />
        <ImpactCalculator />
      </Section>

      <CtaBand
        heading={<>Start with readiness. Leave with reviewed workflows.</>}
        actions={[
          { label: 'Get my AI readiness score', href: '/assessment/take', variant: 'gold' },
          { label: 'See what learners build', href: '/courses/foundation', variant: 'ghost-dark' },
        ]}
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

function ImpactCalculator() {
  const [fte, setFte] = useState<number>(50);
  const [hourly, setHourly] = useState<number>(45);
  const annual = Math.round(fte * 1 * hourly * 50);
  const formatted = annual.toLocaleString('en-US');

  return (
    <div className="mk-impact">
      <div className="mk-impact-inputs">
        <label className="mk-impact-field">
          <span className="mk-k">Team size (FTE)</span>
          <input
            type="number"
            min={1}
            max={5000}
            value={fte}
            onChange={(e) => setFte(Math.max(1, Number(e.target.value) || 0))}
            className="mk-impact-input"
            aria-label="Team size in full-time equivalents"
          />
        </label>
        <label className="mk-impact-field">
          <span className="mk-k">Fully-loaded hourly cost ($)</span>
          <input
            type="number"
            min={1}
            max={500}
            value={hourly}
            onChange={(e) => setHourly(Math.max(1, Number(e.target.value) || 0))}
            className="mk-impact-input"
            aria-label="Fully-loaded hourly cost in dollars"
          />
        </label>
      </div>
      <div className="mk-impact-result">
        <div className="mk-k">Annual value at one hour saved per week</div>
        <div className="mk-impact-v">${formatted}</div>
        <div className="mk-impact-meta">
          {fte} FTE × 1 hour × ${hourly}/hr × 50 weeks
        </div>
      </div>
    </div>
  );
}
