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
  const [struck, setStruck] = useState(HOME_TOKEN_COUNT);
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
        for (let n = 1; n <= HOME_TOKEN_COUNT; n++) {
          if (cancelled) return;
          setStruck(n);
          await wait(380);
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

  return (
    <div
      ref={rootRef}
      className={`mk-redline-prompt${isSafe ? ' is-safe' : ''}`}
      aria-label="A real customer-service prompt typed into a public chatbot, with the customer’s name, account number, DOB, SSN, phone, and balance pasted inline. Each piece of personal data is struck through; the prompt then resolves into a reusable template with placeholders and the unnecessary personal data removed, marked safe for AI."
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
        <p className="mk-redline-prompt-text">
          {HOME_PROMPT_TOKENS.map((token, i) => {
            const dropped = isSafe && !token.placeholder;
            if (dropped) return null;
            const showPlaceholder = isSafe && Boolean(token.placeholder);
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
          {!isSafe && <span className="mk-redline-caret" aria-hidden="true" />}
        </p>
      </div>
      <div className="mk-redline-foot">
        {isSafe
          ? 'One reusable template, any customer — real data stays in your systems.'
          : 'Real customer data, about to be pasted into a public chatbot.'}
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
