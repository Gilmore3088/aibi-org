'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  ArrowGlyph,
  CtaBand,
} from '@/components/mockup';
import { ROICalculatorBody } from '@/components/sections/ROICalculatorBody';
import { AdvisorsStrip } from '@/components/sections/AdvisorsStrip';
import { TrustAnchor } from '@/components/sections/TrustAnchor';
import { HomeHelpWidget } from '@/components/sections/HomeHelpWidget';

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

const AlertIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const CheckSquareIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const ShieldCheckIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);
const CheckGlyph = (p: IconProps) => (
  <svg {...sw({ ...p, size: p.size ?? 15 })}>
    <polyline points="20 6 9 17 4 12" />
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
    title: 'Score, top gap, first working template',
    rows: [
      ['Readiness', '32 / 48'],
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

type PiiToken = {
  /** Plain text that precedes this token in the run-on prompt. */
  lead: string;
  /** The real PII, the way a careless user actually types it (the "before"). */
  value: string;
  /**
   * Template replacement for the "after". When omitted, the token AND its lead
   * text drop out of the template entirely — teaching "don't even include what
   * you don't need": a fee-reversal reply never needs a DOB, SSN, or phone.
   */
  placeholder?: string;
};
type RedlinePhase = 'risk' | 'redact' | 'safe';

// The "before" is a real, sloppy prompt — the way someone genuinely pastes into
// a public chatbot: the actual customer's name and account plus a pile of PII
// that has nothing to do with the task, all dumped inline. The animation strikes
// each PII token, then the prompt resolves into a reusable template: placeholders
// for the few things the reply needs, and the irrelevant PII (DOB, SSN, phone)
// dropped entirely.
const HOME_PROMPT_TOKENS: PiiToken[] = [
  { lead: 'write a quick reply to ', value: 'John Smith', placeholder: '[customer name]' },
  { lead: ' — he’s furious we charged him ', value: '3 overdraft fees', placeholder: '[number] overdraft fees' },
  { lead: ' in one day on account ', value: '0042871', placeholder: '[account number]' },
  { lead: '. dob ', value: '04/12/1981' },
  { lead: ', ssn ', value: '•••–••–4829' },
  { lead: ', cell ', value: '(555) 123-4567' },
  { lead: '. balance is ', value: '$83.17', placeholder: '[amount]' },
];
const HOME_PROMPT_TRAILING = '. wants them reversed';
const HOME_TOKEN_COUNT = HOME_PROMPT_TOKENS.length;

// The "safe reusable template" the demo resolves to: the same business task,
// but the risky data is gone and the three guardrails the whole product teaches
// are made concrete — an approved source, a required output format, and a named
// human reviewer. Shown as structured slots, not prose.
const HOME_SAFE_SLOTS: { label: string; value: string }[] = [
  { label: 'Source', value: 'your overdraft-fee policy' },
  { label: 'Format', value: 'a short, plain-language reply' },
  { label: 'Reviewer', value: 'a named teller-line supervisor' },
];
// The three checks under the safe template — each maps to one guardrail the
// safe version demonstrates. Text + check glyph, never colour alone.
const HOME_SAFE_CHECKS = [
  'Real data removed',
  'Approved source required',
  'Human review before use',
] as const;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// ---------- Page ----------

export default function HomePage() {
  const [activeValueStep, setActiveValueStep] = useState(VALUE_PATH[0].step);
  const activePreview = VALUE_PREVIEWS[activeValueStep];
  const activeValueId = activeValueStep.toLowerCase();

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/" />

      <section className="mk-hero mk-home-redline-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner mk-home-redline-inner">
          <div className="mk-hero-copy">
            <h1>
              Is your team ready to use AI <span className="mk-hero-accent">safely</span>?
              <br />
              Find out in three minutes.
            </h1>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/assessment/take">
                Get my readiness score <ArrowGlyph />
              </Button>
            </div>
            <p className="mk-hero-meta">Free · 12 questions · Practical next step</p>
          </div>
          <HomeRedlinePrompt />
        </div>
      </section>

      <HomeHelpWidget />

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

      <TrustAnchor />
      <AdvisorsStrip />

      <PriceStrip />

      <Section id="roi-calculator" variant="std">
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
          { label: 'Start learning', href: '/courses', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}

// Interactive hero demo. Two visitor-driven tabs — "Unsafe paste" vs "Safe
// reusable template" — showing the same business task before and after the
// three guardrails the product teaches (real data removed, approved source,
// human review). Switching to the safe tab plays a short redaction sweep so
// the sensitive values visibly become template slots. The demo carries the
// explanation the left column used to spell out.
//
// SSR / no-JS / reduced-motion: renders the "unsafe" frame as a coherent, static
// hook (real customer data about to be pasted into a public chatbot); the tabs
// still switch state, just without the sweep animation.
function HomeRedlinePrompt() {
  const [tab, setTab] = useState<'unsafe' | 'safe'>('unsafe');
  // 'risk' = plain unsafe paste, 'redact' = strike sweep in progress,
  // 'safe' = resolved template. Drives which tokens are struck/placeheld.
  const [phase, setPhase] = useState<RedlinePhase>('risk');
  const [struck, setStruck] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const unsafeTabRef = useRef<HTMLButtonElement>(null);
  const safeTabRef = useRef<HTMLButtonElement>(null);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const selectTab = (next: 'unsafe' | 'safe') => {
    clearTimers();
    setTab(next);
    if (next === 'unsafe') {
      setPhase('risk');
      setStruck(0);
      return;
    }
    // → safe. Reduced motion resolves instantly; otherwise sweep each value.
    if (prefersReducedMotion()) {
      setPhase('safe');
      setStruck(HOME_TOKEN_COUNT);
      return;
    }
    setPhase('redact');
    setStruck(0);
    for (let n = 1; n <= HOME_TOKEN_COUNT; n++) {
      timers.current.push(setTimeout(() => setStruck(n), n * 45));
    }
    timers.current.push(setTimeout(() => setPhase('safe'), HOME_TOKEN_COUNT * 45 + 150));
  };

  // Standard tablist keyboard model: arrows move between the two tabs.
  const onTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const next = e.key === 'ArrowRight' || e.key === 'End' ? 'safe' : 'unsafe';
    selectTab(next);
    (next === 'safe' ? safeTabRef : unsafeTabRef).current?.focus();
  };

  const isSafe = tab === 'safe';
  const resolved = phase === 'safe';

  return (
    <div className={`mk-redline-prompt${isSafe ? ' is-safe' : ''}`}>
      <p className="mk-demo-audience">Built for community banks &amp; credit unions</p>
      <div className="mk-demo-tabs" role="tablist" aria-label="Prompt safety demo" onKeyDown={onTabKeyDown}>
        <button
          ref={unsafeTabRef}
          type="button"
          role="tab"
          id="mk-demo-tab-unsafe"
          aria-selected={!isSafe}
          aria-controls="mk-demo-panel"
          tabIndex={isSafe ? -1 : 0}
          className={`mk-demo-tab${!isSafe ? ' is-active' : ''}`}
          onClick={() => selectTab('unsafe')}
        >
          <AlertIcon size={14} /> Unsafe paste
        </button>
        <button
          ref={safeTabRef}
          type="button"
          role="tab"
          id="mk-demo-tab-safe"
          aria-selected={isSafe}
          aria-controls="mk-demo-panel"
          tabIndex={isSafe ? 0 : -1}
          className={`mk-demo-tab${isSafe ? ' is-active' : ''}`}
          onClick={() => selectTab('safe')}
        >
          <ShieldCheckIcon size={14} /> Safe reusable template
        </button>
      </div>
      <div
        className="mk-redline-body"
        id="mk-demo-panel"
        role="tabpanel"
        aria-labelledby={isSafe ? 'mk-demo-tab-safe' : 'mk-demo-tab-unsafe'}
      >
        <p className="mk-redline-prompt-text">
          {HOME_PROMPT_TOKENS.map((token, i) => {
            const dropped = resolved && !token.placeholder;
            if (dropped) return null;
            const showPlaceholder = resolved && Boolean(token.placeholder);
            const isStruck = phase === 'redact' && i < struck;
            const tokenClass = `mk-pii${token.placeholder ? '' : ' is-droppable'}${
              isStruck ? ' is-struck' : ''
            }${showPlaceholder ? ' is-placeholder' : ''}`;
            return (
              <span key={i}>
                <span className="mk-redline-lead">{token.lead}</span>
                <span className={tokenClass}>{showPlaceholder ? token.placeholder : token.value}</span>
              </span>
            );
          })}
          <span className="mk-redline-lead">{HOME_PROMPT_TRAILING}</span>
          {phase === 'risk' && <span className="mk-redline-caret" aria-hidden="true" />}
        </p>
        {resolved && (
          <dl className="mk-demo-template">
            {HOME_SAFE_SLOTS.map(({ label, value }) => (
              <div key={label} className="mk-demo-slot">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="mk-redline-foot">
        {isSafe ? (
          <ul className="mk-demo-checks">
            {HOME_SAFE_CHECKS.map((check) => (
              <li key={check}>
                <CheckGlyph /> {check}
              </li>
            ))}
          </ul>
        ) : (
          <span className="mk-demo-warn">
            <AlertIcon size={13} /> Real customer data, about to be pasted into a public chatbot.
          </span>
        )}
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
    note: '12 questions. Score, top gap, and a first working template.',
    href: '/assessment/take',
    action: 'Start free',
    featured: true,
  },
  {
    eyebrow: 'Deep dive',
    label: 'In-Depth Report',
    price: '$99',
    note: 'Written report, peer band, eight scores, and a 90-day action register.',
    href: '/assessment/in-depth',
    action: 'View report',
  },
  {
    eyebrow: 'Capability',
    label: 'AiBI-Foundation',
    price: '$295',
    note: '18 modules with saved prompts, workflow templates, and a Foundation Packet.',
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
          <a href="/pricing" className="mk-price-compare-link">
            Compare all pricing <ArrowGlyph />
          </a>
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
