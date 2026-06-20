'use client';

import React, { useState } from 'react';
import { SiteHeader, Button, ArrowGlyph } from '@/components/mockup';

/* ---------- Inline stroke icons ---------- */

type IconProps = { className?: string; size?: number };

const sw = (p: IconProps) => ({
  className: p.className,
  width: p.size ?? 24,
  height: p.size ?? 24,
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
const ToolboxIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <polyline points="22 19 12 24 2 19" />
    <polyline points="22 12 12 17 2 12" />
    <polygon points="12 2 22 7 12 12 2 7" />
  </svg>
);
const ShieldIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const AwardIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" />
  </svg>
);
const SparkleIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
);

/* ---------- Shared CTA: one dominant action + microcopy + quiet link ---------- */

function HeroCta({ secondary = true }: { secondary?: boolean }) {
  return (
    <div className="hopt-cta">
      <Button variant="gold" size="lg" href="/assessment/take">
        Score my bank <ArrowGlyph />
      </Button>
      {secondary && (
        <a className="hopt-cta-link" href="/courses">
          or start learning
        </a>
      )}
      <p className="hopt-cta-micro">Free · 12 questions · 3 minutes</p>
    </div>
  );
}

/* ====================================================================
   OPTION A — Split hero: redlined "all-wrong" prompt + need/value/CTA
   ==================================================================== */

function OptionA() {
  return (
    <section className="hopt hopt-a mk-hero">
      <div className="mk-deco">
        <div className="mk-deco-ring" />
        <div className="mk-deco-blur" />
      </div>
      <div className="mk-container hopt-a-inner">
        <PromptCard />
        <div>
          <p className="mk-kicker hopt-need">At your bank, today</p>
          <h1>
            Your team uses AI. <span className="hopt-need">Most of it is wrong.</span>
          </h1>
          <p className="mk-lede">Train it into workflows they can actually reuse.</p>
          <HeroCta />
        </div>
      </div>
    </section>
  );
}

function PromptCard() {
  return (
    <div className="hopt-prompt" aria-label="Example of unsafe AI use, redlined">
      <div className="hopt-prompt-head">
        <span className="hopt-prompt-dots">
          <i />
          <i />
          <i />
        </span>
        <span>Public chatbot</span>
        <span className="hopt-prompt-badge">Untrained use</span>
      </div>
      <div className="hopt-prompt-body">
        <p className="hopt-prompt-line">
          Write an overdraft letter for{' '}
          <mark className="hopt-redline">John Smith, SSN 123-45-6789, acct #0042871</mark>{' '}
          and email it to him today.<span className="hopt-caret" />
        </p>
      </div>
      <div className="hopt-flags">
        <span className="hopt-flag">
          <AlertIcon size={13} /> Customer PII pasted
        </span>
        <span className="hopt-flag">
          <AlertIcon size={13} /> No data boundary
        </span>
        <span className="hopt-flag">
          <AlertIcon size={13} /> Output never reviewed
        </span>
      </div>
      <div className="hopt-prompt-foot">Typed into a tool no one trained them to use.</div>
    </div>
  );
}

/* ====================================================================
   OPTION B — Simplified two-column, sample report demoted to a strip
   ==================================================================== */

function OptionB() {
  return (
    <>
      <section className="hopt hopt-b mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container hopt-b-inner">
          <div>
            <p className="mk-kicker">For community banks &amp; credit unions</p>
            <h1>AI that becomes real banking work.</h1>
          </div>
          <div className="hopt-b-right">
            <p className="mk-lede">Score readiness. Train by role. Ship reusable workflows.</p>
            <HeroCta />
          </div>
        </div>
      </section>

      <section className="hopt-b-sample" aria-label="Sample readiness report">
        <div className="hopt-b-sample-inner">
          <div className="hopt-b-sample-tag">
            <span className="hopt-score">
              62<small> / 100</small>
            </span>
            <span className="hopt-k">
              Sample
              <br />
              report
            </span>
          </div>
          <div className="hopt-b-sample-rows">
            <div>
              <span>Top gap</span>
              <strong>Workflow documentation</strong>
            </div>
            <div>
              <span>Next step</span>
              <strong>Foundation Course</strong>
            </div>
            <div>
              <span>Starter artifact</span>
              <strong>Workflow SOP template</strong>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ====================================================================
   OPTION C — Interactive product dial
   ==================================================================== */

const DIAL_FEATURES: {
  key: string;
  label: string;
  title: string;
  body: string;
  stat: string;
  icon: (p: IconProps) => JSX.Element;
}[] = [
  { key: 'assess', label: 'Assess', title: 'Readiness score', body: 'Twelve questions, three minutes. A score, your top gap, and a starter artifact.', stat: '62 / 100 sample', icon: CheckSquareIcon },
  { key: 'train', label: 'Train', title: 'Learn by role', body: 'Foundation modules mapped to compliance, retail, ops, and marketing work.', stat: '4 role tracks', icon: LayersIcon },
  { key: 'practice', label: 'Practice', title: 'Safe sandbox', body: 'Synthetic banking scenarios. Compare model output before it touches real work.', stat: 'Synthetic data only', icon: FlaskIcon },
  { key: 'build', label: 'Build', title: 'Workflow library', body: 'Prompts, SOPs, and review checklists your team keeps and reuses.', stat: 'Reviewed v1.1', icon: ToolboxIcon },
  { key: 'guard', label: 'Guardrails', title: 'Compliance guardrails', body: 'Data-boundary rules and acceptable-use cards baked into every workflow.', stat: 'Examiner-ready', icon: ShieldIcon },
  { key: 'certify', label: 'Certify', title: 'Certificate', body: 'Prove capability across the team with a completion certificate per role.', stat: 'Per-seat proof', icon: AwardIcon },
];

function OptionC() {
  const [active, setActive] = useState(0);
  const n = DIAL_FEATURES.length;
  const step = 360 / n;
  // Rotate the orbit so the active node snaps to 12 o'clock.
  const ringRotation = -active * step;
  const current = DIAL_FEATURES[active];

  return (
    <section className="hopt hopt-c mk-hero">
      <div className="mk-deco">
        <div className="mk-deco-ring" />
        <div className="mk-deco-blur" />
      </div>
      <div className="mk-container hopt-c-inner">
        <div>
          <p className="mk-kicker">One assessment, six ways to work</p>
          <h1>AI that becomes real banking work.</h1>
          <p className="mk-lede">Spin the dial. See what each step produces.</p>
          <HeroCta />
          <span className="hopt-c-hint">
            <SparkleIcon size={15} /> Tap a product to explore
          </span>
        </div>

        <div
          className="hopt-dial"
          role="tablist"
          aria-label="Explore platform features"
        >
          <div className="hopt-dial-aura" aria-hidden />
          <div
            className="hopt-dial-ring"
            style={{ transform: `rotate(${ringRotation}deg)` }}
            aria-hidden
          />
          <div
            className="hopt-dial-orbit"
            style={{ transform: `rotate(${ringRotation}deg)` }}
          >
            {DIAL_FEATURES.map(({ key }, i) => {
              const baseAngle = i * step;
              // Spoke points outward toward its node (node sits at -160 on Y).
              return (
                <span
                  key={`spoke-${key}`}
                  className={`hopt-spoke${active === i ? ' is-active' : ''}`}
                  style={{ transform: `rotate(${baseAngle + 180}deg)` }}
                  aria-hidden
                />
              );
            })}
            {DIAL_FEATURES.map(({ key, label, icon: Icon }, i) => {
              const baseAngle = i * step;
              // Place on the circle, keep upright, then counter the ring spin.
              const transform = `rotate(${baseAngle}deg) translateY(-160px) rotate(${-baseAngle - ringRotation}deg)`;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active === i}
                  aria-label={label}
                  className={`hopt-node${active === i ? ' is-active' : ''}`}
                  style={{ transform }}
                  onClick={() => setActive(i)}
                >
                  <Icon size={26} />
                </button>
              );
            })}
          </div>

          <div className="hopt-hub" role="tabpanel" aria-live="polite">
            <div>
              <p className="hopt-k">{current.label}</p>
              <h3>{current.title}</h3>
              <p>{current.body}</p>
              <span className="hopt-hub-stat">{current.stat}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */

export default function HeroOptionsClient() {
  return (
    <div className="mockup-scope hopt-page">
      <SiteHeader activePath="/" />

      <nav className="hopt-toc" aria-label="Hero options">
        <strong>Hero options</strong>
        <a href="#opt-a">A · Redlined split</a>
        <a href="#opt-b">B · Simplified</a>
        <a href="#opt-c">C · Interactive dial</a>
      </nav>

      <div id="opt-a" className="hopt-label">
        <span className="hopt-tag">Option A</span>
        <h2>Split hero — the wrong way, redlined</h2>
        <p>
          Left shows what a banker types into a public chatbot today, marked up with the problems.
          Right is need → value → CTA. Leads with the pain so the assessment is the obvious fix.
        </p>
      </div>
      <div className="hopt-frame">
        <OptionA />
      </div>

      <div id="opt-b" className="hopt-label">
        <span className="hopt-tag">Option B</span>
        <h2>Simplified two-column</h2>
        <p>
          Oversized headline left, lean lede + CTA right, no hero image. The sample report moves to a
          quiet strip directly below, where its &ldquo;sample&rdquo; framing belongs.
        </p>
      </div>
      <div className="hopt-frame">
        <OptionB />
      </div>

      <div id="opt-c" className="hopt-label">
        <span className="hopt-tag">Option C</span>
        <h2>Interactive product dial</h2>
        <p>
          Need → value → CTA on the left. On the right, an orbit of our products the visitor can click;
          the center panel updates with what each step produces. The active item snaps to the top.
        </p>
      </div>
      <div className="hopt-frame">
        <OptionC />
      </div>

      <div style={{ height: 64 }} />
    </div>
  );
}
