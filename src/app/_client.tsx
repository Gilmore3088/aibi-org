'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  SiteHeader,
  Button,
  ArrowGlyph,
  CtaBand,
} from '@/components/mockup';
import { AdvisorsStrip } from '@/components/sections/AdvisorsStrip';
import { HomeHelpWidget } from '@/components/sections/HomeHelpWidget';
import { ProductProgression } from '@/components/sections/ProductProgression';
import { HomeOrigin } from '@/components/sections/HomeOrigin';

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
// ---------- Static data ----------

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
  'Sensitive details removed',
  'Approved source required',
  'Human review retained',
] as const;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// ---------- Page ----------

export default function HomePage() {
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
              Are you ready to use AI <span className="mk-hero-accent">safely at work?</span>
              <br />
              Find out in three minutes.
            </h1>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/assessment/take">
                Get my readiness score <ArrowGlyph />
              </Button>
            </div>
            <p className="mk-hero-meta">Free · 12 questions · Practical next step</p>
            <p className="mk-hero-team">
              Assessing a team?{' '}
              <Link className="mk-hero-team-link" href="/for-institutions">Explore team readiness</Link> &rarr;
            </p>
          </div>
          <HomeRedlinePrompt />
        </div>
      </section>

      <HomeHelpWidget />

      <ProductProgression />

      <HomeOrigin />
      <AdvisorsStrip />

      <CtaBand
        hiddenOnMobile
        heading={<>Find your starting point in three minutes.</>}
        actions={[
          { label: 'Get my readiness score', href: '/assessment/take', variant: 'gold' },
          { label: 'See team options', href: '/for-institutions', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}

// Hero demo — an auto-playing redline animation. On scroll-in it types the
// unsafe paste, strikes each piece of customer data in turn, then resolves into
// a reusable template: placeholders for what the task needs, the irrelevant PII
// dropped, and the three guardrails (approved source, required format, named
// reviewer) made concrete. Rests in the resolved "safe" frame for SSR / no-JS /
// reduced motion, so the message lands even if the animation never runs.
function HomeRedlinePrompt() {
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
        await wait(1400);
        if (cancelled) return;
        setPhase('redact');
        for (let n = 1; n <= HOME_TOKEN_COUNT; n++) {
          if (cancelled) return;
          setStruck(n);
          await wait(360);
        }
        await wait(700);
        if (cancelled) return;
        setPhase('safe');
        await wait(4800);
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
      aria-label="A customer-service prompt typed into a public chatbot, with the customer's name, account number, DOB, SSN, phone, and balance pasted inline. Each piece of personal data is struck through; the prompt then resolves into a reusable template with placeholders, the unnecessary personal data removed, and an approved source, required format, and named reviewer added — marked safe for AI."
    >
      <p className="mk-demo-audience">Built for community banks &amp; credit unions</p>
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

        {isSafe && (
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
          'Real customer data, about to be pasted into a public chatbot.'
        )}
      </div>
    </div>
  );
}
