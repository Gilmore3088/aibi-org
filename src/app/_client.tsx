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
import { HomeResultPreview } from '@/components/sections/HomeResultPreview';
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

// The optional decision exercise shown before the comparison is revealed.
type QuizAnswer = 'allow' | 'review' | 'block';
const HOME_QUIZ_CHOICES: { id: QuizAnswer; label: string }[] = [
  { id: 'allow', label: 'Allow' },
  { id: 'review', label: 'Review first' },
  { id: 'block', label: 'Block' },
];
// What each pasted value exposes, annotated on the revealed unsafe prompt.
const HOME_RISK_ANNOTATIONS = [
  'Customer identity exposed',
  'Account information exposed',
  'Financial information exposed',
  'Public tool boundary crossed',
] as const;
// Calm, professional feedback — no game-show verdict. "Block" is the
// recommended answer; the other two are acknowledged without a "wrong" buzzer.
const HOME_QUIZ_FEEDBACK: Record<QuizAnswer, string> = {
  allow:
    'This still leaves customer information inside a public AI tool. Review after pasting does not remove the exposure.',
  review:
    'This still leaves customer information inside a public AI tool. Review after pasting does not remove the exposure.',
  block:
    'Correct. The task may still be appropriate, but the customer information must be removed and the approved-tool boundary confirmed first.',
};

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

      <HomeResultPreview />

      <ProductProgression />

      <HomeOrigin />
      <AdvisorsStrip />

      <p className="mk-home-resource-link">
        Not ready to assess?{' '}
        <Link href="/resources">Get a free guide for your role</Link> &rarr;
      </p>

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

// Interactive hero demo — an OPTIONAL decision exercise that opens into the
// unsafe-vs-safer comparison.
//
//   Stage "quiz": one synthetic prompt + "Would you allow this in a public AI
//     tool?" with Allow / Review first / Block. Entirely optional — a "Skip to
//     comparison" link bypasses it, and the hero CTA is never gated by it.
//   Stage "revealed": a calm recommendation (Block) with feedback tailored to
//     the visitor's choice, the risky data annotated, then two switchable tabs
//     — Unsafe prompt / Safer template — so visitors can compare repeatedly.
//
// Feedback tone is professional, not a game-show buzzer: "Block" is the
// recommended answer; the other choices are acknowledged, never scolded.
//
// Reduced motion / no-JS: choosing an answer (or Skip) reveals the comparison;
// the safer tab resolves instantly without the redaction sweep.
function HomeRedlinePrompt() {
  const [stage, setStage] = useState<'quiz' | 'revealed'>('quiz');
  const [answer, setAnswer] = useState<QuizAnswer | null>(null);
  const [tab, setTab] = useState<'unsafe' | 'safe'>('unsafe');
  // 'risk' = unsafe paste, 'redact' = strike sweep, 'safe' = resolved template.
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

  // Reveal the comparison. `choice` is null when the visitor skips the quiz.
  const reveal = (choice: QuizAnswer | null) => {
    clearTimers();
    setAnswer(choice);
    setStage('revealed');
    setTab('unsafe');
    setPhase('risk');
    setStruck(0);
  };

  const selectTab = (next: 'unsafe' | 'safe') => {
    clearTimers();
    setTab(next);
    if (next === 'unsafe') {
      setPhase('risk');
      setStruck(0);
      return;
    }
    // → safer. Reduced motion resolves instantly; otherwise sweep each value.
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

  const onTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const next = e.key === 'ArrowRight' || e.key === 'End' ? 'safe' : 'unsafe';
    selectTab(next);
    (next === 'safe' ? safeTabRef : unsafeTabRef).current?.focus();
  };

  // ── Stage 1: the optional decision exercise ──────────────────────────────
  if (stage === 'quiz') {
    return (
      <div className="mk-redline-prompt mk-demo-quiz">
        <p className="mk-demo-audience">Built for community banks &amp; credit unions</p>
        <div className="mk-demo-quiz-head">
          <span className="mk-demo-eyebrow">Quick check</span>
          <span className="mk-demo-synthetic">Illustrative example · Synthetic customer data</span>
        </div>
        <div className="mk-redline-body">
          <p className="mk-redline-prompt-text mk-demo-plain">
            {HOME_PROMPT_TOKENS.map((token, i) => (
              <span key={i}>
                <span className="mk-redline-lead">{token.lead}</span>
                <span className="mk-redline-lead">{token.value}</span>
              </span>
            ))}
            <span className="mk-redline-lead">{HOME_PROMPT_TRAILING}</span>
          </p>
        </div>
        <div className="mk-demo-quiz-foot">
          <p className="mk-demo-question" id="mk-demo-question">
            Would you allow this prompt in a public AI tool?
          </p>
          <div className="mk-demo-choices" role="group" aria-labelledby="mk-demo-question">
            {HOME_QUIZ_CHOICES.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className="mk-demo-choice"
                onClick={() => reveal(choice.id)}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <button type="button" className="mk-demo-skip" onClick={() => reveal(null)}>
            Skip to comparison
          </button>
        </div>
      </div>
    );
  }

  // ── Stage 2: recommendation + annotated comparison ───────────────────────
  const isSafe = tab === 'safe';
  const resolved = phase === 'safe';
  const chosen = answer ? HOME_QUIZ_CHOICES.find((c) => c.id === answer) : null;
  const answeredWrong = answer !== null && answer !== 'block';

  return (
    <div className={`mk-redline-prompt${isSafe ? ' is-safe' : ''}`}>
      <p className="mk-demo-audience">Built for community banks &amp; credit unions</p>
      <div className={`mk-demo-verdict${answeredWrong ? ' is-warn' : ''}`} role="status">
        {chosen && (
          <p className="mk-demo-your-answer">
            You chose <strong>{chosen.label}</strong>
          </p>
        )}
        <p className="mk-demo-reco">
          {answeredWrong ? <AlertIcon size={15} /> : <ShieldCheckIcon size={15} />}
          <span>
            Recommended: <strong>Block</strong>
          </span>
        </p>
        <p className="mk-demo-reco-why">
          {answer
            ? HOME_QUIZ_FEEDBACK[answer]
            : 'This prompt includes customer identity, account, and financial details that should not enter a public AI tool.'}
        </p>
      </div>

      <div className="mk-demo-tabs" role="tablist" aria-label="Prompt safety comparison" onKeyDown={onTabKeyDown}>
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
          <AlertIcon size={14} /> Unsafe prompt
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
          <ShieldCheckIcon size={14} /> Safer template
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
        </p>

        {isSafe && resolved && (
          <dl className="mk-demo-template">
            {HOME_SAFE_SLOTS.map(({ label, value }) => (
              <div key={label} className="mk-demo-slot">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {!isSafe && (
          <ul className="mk-demo-annotations" aria-label="What this prompt exposes">
            {HOME_RISK_ANNOTATIONS.map((note) => (
              <li key={note}>
                <AlertIcon size={13} /> {note}
              </li>
            ))}
          </ul>
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
            <AlertIcon size={13} /> Synthetic data shown — real customer data must never enter a public tool.
          </span>
        )}
      </div>
    </div>
  );
}
