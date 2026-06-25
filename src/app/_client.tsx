'use client';

import React, { useEffect, useRef, useState } from 'react';
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
import { TrustAnchor } from '@/components/sections/TrustAnchor';

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

type PiiField = { label: string; value: string; sensitive: boolean; placeholder?: string };
type RedlinePhase = 'risk' | 'redact' | 'safe';

// The risky paste vs. the reusable template. The animation strikes every
// sensitive field one by one, then swaps each real value for a bracketed
// placeholder and the task line for the templated phrasing — flipping the card
// to "Safe for AI". The lesson: write the prompt as a reusable template with
// placeholders; the real customer data stays in your systems and never gets
// pasted into a public tool.
const HOME_TASK_RISKY = 'Summarize this customer complaint and draft a response.';
const HOME_TASK_SAFE =
  'Draft a professional response to this customer complaint. Fill the placeholders from your core system — never paste real customer data here.';
const HOME_PII_FIELDS: PiiField[] = [
  { label: 'Customer', value: 'John Smith', sensitive: true, placeholder: '[customer name]' },
  { label: 'DOB', value: '04/12/1981', sensitive: true, placeholder: '[date of birth]' },
  { label: 'Account #', value: '0042871', sensitive: true, placeholder: '[account number]' },
  { label: 'SSN', value: '•••–••–4829', sensitive: true, placeholder: '[not needed]' },
  { label: 'Phone', value: '(555) 123-4567', sensitive: true, placeholder: '[phone]' },
  { label: 'Available balance', value: '$83.17', sensitive: true, placeholder: '[amount]' },
  { label: 'Complaint notes', value: 'Charged 3 overdraft fees in one day; wants them reversed.', sensitive: false },
];
const HOME_SENSITIVE_COUNT = HOME_PII_FIELDS.filter((field) => field.sensitive).length;

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
          <div>
            <p className="mk-kicker mk-kicker-gold-soft">For community banks and credit unions</p>
            <h1>
              AI adoption is accelerating. <span className="mk-hero-accent">Judgment isn&apos;t.</span>
            </h1>
            <p className="mk-lede">
              Most employees know how to ask AI a question. Few know what should never be pasted into it.
              Find your institution&apos;s AI readiness gap in three minutes.
            </p>
            <p className="mk-hero-role-note">
              Built for frontline tellers, branch teams, lenders, operations, compliance, and marketing roles.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/assessment/take">
                Get my AI readiness score <ArrowGlyph />
              </Button>
              <Button variant="ghost-dark" size="lg" href="/courses">
                Start learning
              </Button>
            </div>
            <p className="mk-hero-meta">Free · 12 questions · 3 minutes · first artifact</p>
          </div>
          <HomeRedlinePrompt />
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

      <StickyMobileCta
        label="Get my AI readiness score"
        href="/assessment/take"
        source="home-sticky"
      />
    </div>
  );
}

function HomeRedlinePrompt() {
  // Resting state (SSR / no-JS / reduced-motion) is the resolved "safe" frame:
  // sensitive fields struck, safe prompt shown, green badge — the message lands
  // even if the animation never runs.
  const [phase, setPhase] = useState<RedlinePhase>('safe');
  const [struck, setStruck] = useState(HOME_SENSITIVE_COUNT);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    async function play() {
      while (!cancelled) {
        setPhase('risk');
        setStruck(0);
        await wait(1300);
        if (cancelled) return;
        setPhase('redact');
        for (let n = 1; n <= HOME_SENSITIVE_COUNT; n++) {
          if (cancelled) return;
          setStruck(n);
          await wait(460);
        }
        await wait(750);
        if (cancelled) return;
        setPhase('safe');
        await wait(4200);
      }
    }

    const el = rootRef.current;
    let started = false;
    const begin = () => {
      if (started) return;
      started = true;
      setPhase('risk');
      setStruck(0);
      void play();
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          begin();
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    if (el) io.observe(el);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      io.disconnect();
    };
  }, []);

  const isSafe = phase === 'safe';
  let sensitiveSeen = 0;

  return (
    <div
      ref={rootRef}
      className={`mk-redline-prompt${isSafe ? ' is-safe' : ''}`}
      aria-label="A banking task pasted into a public chatbot with customer name, DOB, account number, SSN, phone, and balance. Each sensitive field is struck through and replaced with a bracketed placeholder, leaving a reusable prompt template marked safe for AI."
    >
      <div className="mk-redline-head">
        <span className="mk-redline-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>{isSafe ? 'Reusable template' : 'Public chatbot'}</span>
        <span className={`mk-redline-badge${isSafe ? ' is-safe' : ''}`}>
          {isSafe ? (
            <>
              <ShieldCheckIcon size={13} /> Safe for AI
            </>
          ) : (
            <>
              <AlertIcon size={13} /> Unsafe paste
            </>
          )}
        </span>
      </div>
      <div className="mk-redline-body">
        <p className="mk-redline-task">{isSafe ? HOME_TASK_SAFE : HOME_TASK_RISKY}</p>
        <dl className="mk-redline-fields">
          {HOME_PII_FIELDS.map((field) => {
            let isStruck = false;
            let showPlaceholder = false;
            if (field.sensitive) {
              sensitiveSeen += 1;
              if (isSafe) {
                showPlaceholder = Boolean(field.placeholder);
              } else if (phase === 'redact') {
                isStruck = sensitiveSeen <= struck;
              }
            }
            return (
              <div
                key={field.label}
                className={`mk-redline-field${field.sensitive ? ' is-sensitive' : ''}${isStruck ? ' is-struck' : ''}${showPlaceholder ? ' is-placeholder' : ''}`}
              >
                <dt>{field.label}</dt>
                <dd>{showPlaceholder ? field.placeholder : field.value}</dd>
              </div>
            );
          })}
        </dl>
      </div>
      <div className="mk-redline-foot">
        {isSafe
          ? 'One reusable template, any customer — real data stays in your systems.'
          : 'A real banking task, about to be pasted into a public tool.'}
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
