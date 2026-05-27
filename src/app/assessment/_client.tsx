/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect, useState } from 'react';
import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  EyebrowChip,
  CtaBand,
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
const ZapIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const CheckIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Dimension icons (8)
const ShieldIcon = (p: IconProps) => <svg {...sw(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const ScreenIcon = (p: IconProps) => <svg {...sw(p)}><rect x="2" y="6" width="20" height="12" rx="2" /></svg>;
const AlertIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
  </svg>
);
const CheckSquareIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const DatabaseIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" />
  </svg>
);
const FileIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const UsersIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);
const ChatIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

// ---------- Hero report data ----------

const HERO_DIMS = [
  { name: 'Governance', level: 'High', pct: 72 },
  { name: 'Tool fluency', level: 'Med', pct: 58 },
  { name: 'Risk awareness', level: 'High', pct: 75 },
  { name: 'Workflow fit', level: 'Med', pct: 55 },
  { name: 'Data judgment', level: 'Low', pct: 42 },
  { name: 'Documentation', level: 'Med', pct: 60 },
  { name: 'Role readiness', level: 'Med', pct: 65 },
  { name: 'Leadership', level: 'High', pct: 80 },
];

// ---------- Mini quiz data ----------

type Answer = readonly [string, number];

const QUIZ: { dim: string; q: string; answers: readonly Answer[] }[] = [
  {
    dim: 'Governance',
    q: 'Does your institution have a written AI use policy?',
    answers: [
      ['No policy', 1],
      ['Draft circulating', 2],
      ['Approved, not adopted', 3],
      ['Approved + actively followed', 4],
    ],
  },
  {
    dim: 'Tool fluency',
    q: 'How often do you use an AI tool in your weekly work?',
    answers: [
      ['Never', 1],
      ['Once a month or less', 2],
      ['A few times a week', 3],
      ['Daily', 4],
    ],
  },
  {
    dim: 'Risk awareness',
    q: 'What goes into a model when you use one for work?',
    answers: [
      ["Whatever I'm working on", 1],
      ['I avoid obvious PII', 2],
      ['I follow our data rule list', 3],
      ['I check + log every input', 4],
    ],
  },
  {
    dim: 'Documentation',
    q: 'Could you show an examiner how an AI-assisted task was done?',
    answers: [
      ['No', 1],
      ['Maybe, if I dug', 2],
      ['Yes — I keep notes', 3],
      ['Yes — full audit trail', 4],
    ],
  },
];

const ALL_DIMS = [
  'Governance',
  'Tool fluency',
  'Risk awareness',
  'Workflow fit',
  'Data judgment',
  'Documentation',
  'Role readiness',
  'Leadership',
] as const;
type Dim = (typeof ALL_DIMS)[number];

const BASELINE: Partial<Record<Dim, number>> = {
  'Workflow fit': 2,
  'Data judgment': 2,
  'Role readiness': 2,
  Leadership: 3,
};

function tierFor(score: number) {
  if (score >= 80) return { label: 'Ready to Scale', cls: 'mk-t4' };
  if (score >= 60) return { label: 'Building Momentum', cls: 'mk-t3' };
  if (score >= 40) return { label: 'Early Stage', cls: 'mk-t2' };
  return { label: 'Starting Point', cls: 'mk-t1' };
}

// ---------- Page ----------

// Pre-selected answers for the auto-demo. With all 3s plus baseline,
// produces ~66 / Building Momentum — believable mid-range demo.
const DEMO_ANSWERS = [3, 3, 3, 3] as const;

type DemoPhase = 'question' | 'highlight' | 'score';

const PHASE_MS: Record<DemoPhase, number> = {
  question: 1800,
  highlight: 1500,
  score: 1700,
};

export default function AssessmentLandingPage() {
  const [qIdx, setQIdx] = useState(0);
  const [phase, setPhase] = useState<DemoPhase>('question');
  const [dimScores, setDimScores] = useState<Partial<Record<Dim, number>>>({});
  const [paused, setPaused] = useState(false);

  // Auto-cycle through the demo. Hover pauses; mouse-leave resumes.
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => {
      if (phase === 'question') {
        setPhase('highlight');
        return;
      }
      if (phase === 'highlight') {
        const q = QUIZ[qIdx];
        setDimScores((prev) => ({ ...prev, [q.dim as Dim]: DEMO_ANSWERS[qIdx] }));
        setPhase('score');
        return;
      }
      // phase === 'score': advance or loop
      const next = (qIdx + 1) % QUIZ.length;
      if (next === 0) setDimScores({});
      setQIdx(next);
      setPhase('question');
    }, PHASE_MS[phase]);
    return () => clearTimeout(t);
  }, [phase, qIdx, paused]);

  function computeScore() {
    const all = ALL_DIMS.map((d) => dimScores[d] ?? BASELINE[d] ?? 0);
    const filled = all.filter((v) => v > 0);
    if (!filled.length) return null;
    const avg = filled.reduce((a, b) => a + b, 0) / filled.length;
    return Math.round((avg / 4) * 100);
  }

  const score = computeScore();
  const tier = score === null ? null : tierFor(score);
  const autoVal = DEMO_ANSWERS[qIdx];
  const showHighlight = phase === 'highlight' || phase === 'score';

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/assessment" />

      {/* HERO */}
      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip icon={<GaugeIcon className="mk-ic" />}>
              In-Depth AI Maturity Assessment · $99
            </EyebrowChip>
            <h1>Measure your AI maturity across 8 dimensions.</h1>
            <p className="mk-lede">
              Forty-eight questions, twenty minutes. Score, role-specific action plan, and a
              reviewer-ready PDF report. Anonymized team rollup included.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/assessment/in-depth">
                Start maturity assessment <ArrowR className="mk-ic" />
              </Button>
              <Button variant="ghost-dark" size="lg" href="#mini-quiz">
                See sample report
              </Button>
            </div>
            <p className="mk-hero-foot">
              Not ready?{' '}
              <a href="/assessment/take" className="mk-hero-foot-link">
                Take the free readiness assessment here
              </a>
              .
            </p>
          </div>

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
              <div className="mk-k">8 Dimensions</div>
              <div className="mk-hdims">
                {HERO_DIMS.map((d) => (
                  <div key={d.name} className="mk-hdim">
                    <div className="mk-row">
                      <span className="mk-nm">{d.name}</span>
                      <span className="mk-lv">{d.level}</span>
                    </div>
                    <div className="mk-bar">
                      <div className="mk-fill" style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AUTO-DEMO */}
      <Section variant="std" surface="white" id="mini-quiz">
        <SectionHead
          kicker="See it in action"
          heading={<>Watch how the assessment scores you.</>}
          lede={
            <>
              A 20-second tour: four questions reveal, answers auto-select, your score builds
              live. Hover the card to pause.
            </>
          }
        />

        <div className="mk-quiz">
          <div
            className="mk-quiz-card"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <div className="mk-quiz-progress">
              <div className="mk-qp-dots">
                {QUIZ.map((_, i) => (
                  <div
                    key={i}
                    className={`mk-d${i < qIdx ? ' is-done' : i === qIdx ? ' is-active' : ''}`}
                  />
                ))}
              </div>
              <div className="mk-qp-meta">
                Question {qIdx + 1} of {QUIZ.length} · {paused ? 'Paused' : 'Auto-playing'}
              </div>
            </div>

            <div key={`${qIdx}-${phase}`} className="mk-quiz-q is-animated">
              <div className="mk-k">Dimension · {QUIZ[qIdx].dim}</div>
              <h3>{QUIZ[qIdx].q}</h3>
              <div className="mk-quiz-answers">
                {QUIZ[qIdx].answers.map(([txt, val]) => {
                  const isAuto = showHighlight && val === autoVal;
                  return (
                    <div
                      key={String(val)}
                      className={`mk-quiz-answer${isAuto ? ' is-auto' : ''}`}
                      aria-current={isAuto ? 'true' : undefined}
                    >
                      <span className="mk-dot" />
                      {txt}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mk-quiz-foot mk-quiz-foot-end">
              <Button variant="gold" size="lg" href="/assessment/take">
                Take the real assessment <ArrowR className="mk-ic" />
              </Button>
            </div>
          </div>

          <div className="mk-quiz-side">
            <div className="mk-qs-head">
              <div className="mk-k">Live score</div>
              <div className="mk-qs-num">
                <span className="mk-score">{score ?? '—'}</span>
                <span className="mk-qs-of">/ 100</span>
              </div>
              <div className={`mk-qs-tier${tier ? ` ${tier.cls}` : ''}`}>
                {tier ? tier.label : 'Answer to start'}
              </div>
            </div>
            <div className="mk-qs-dims">
              {ALL_DIMS.map((d) => {
                const raw = dimScores[d] ?? BASELINE[d];
                const pct = raw ? Math.round((raw / 4) * 100) : 0;
                const lvl = pct >= 75 ? 'High' : pct >= 50 ? 'Med' : pct >= 25 ? 'Low' : '—';
                return (
                  <div key={d} className="mk-qd">
                    <div className="mk-top">
                      <span className="mk-nm">{d}</span>
                      <span className="mk-vv">{lvl}</span>
                    </div>
                    <div className="mk-bar">
                      <div className="mk-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mk-qs-foot">
              <p>
                The full free assessment scores all <strong>8 dimensions</strong> across{' '}
                <strong>12 questions</strong> in about three minutes.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* CHOOSE YOUR ASSESSMENT */}
      <Section variant="std">
        <SectionHead
          kicker="Choose your assessment"
          heading={<>Free, in-depth, or team view.</>}
        />
        <div className="mk-tier-grid">
          <div className="mk-tier">
            <div className="mk-tier-bar" />
            <div className="mk-body">
              <div className="mk-lab">Free</div>
              <h3>Readiness Baseline</h3>
              <div className="mk-price">
                <div className="mk-v">$0</div>
                <div className="mk-u">3 min · 12 questions</div>
              </div>
              <ul>
                <li><CheckIcon className="mk-ic" />Score</li>
                <li><CheckIcon className="mk-ic" />Tier</li>
                <li><CheckIcon className="mk-ic" />Top gap</li>
                <li><CheckIcon className="mk-ic" />Starter artifact</li>
              </ul>
              <Button variant="ink" size="lg" href="/assessment/take">
                Start free
              </Button>
            </div>
          </div>

          <div className="mk-tier is-featured">
            <div className="mk-tier-bar" />
            <div className="mk-body">
              <div className="mk-lab">$99 · Most popular</div>
              <h3>In-Depth Report</h3>
              <div className="mk-price">
                <div className="mk-v">$99</div>
                <div className="mk-u">20 min · 48 questions</div>
              </div>
              <ul>
                <li><CheckIcon className="mk-ic" />All 8 dimensions scored</li>
                <li><CheckIcon className="mk-ic" />Role-specific plan</li>
                <li><CheckIcon className="mk-ic" />Reviewer-ready PDF report</li>
                <li><CheckIcon className="mk-ic" />30-day refund</li>
              </ul>
              <Button variant="gold" size="lg" href="/assessment/in-depth">
                Get in-depth report
              </Button>
            </div>
          </div>

          <div className="mk-tier">
            <div className="mk-tier-bar" />
            <div className="mk-body">
              <div className="mk-lab">Institutional</div>
              <h3>Team View</h3>
              <div className="mk-price">
                <div className="mk-v">Custom</div>
                <div className="mk-u">Contact for pricing</div>
              </div>
              <ul>
                <li><CheckIcon className="mk-ic" />Department rollups</li>
                <li><CheckIcon className="mk-ic" />Leadership dashboard</li>
                <li><CheckIcon className="mk-ic" />Executive briefing</li>
              </ul>
              <Button variant="ink" size="lg" href="/for-institutions">
                Book briefing
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* 8 DIMENSIONS */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="What we measure"
          heading={<>Eight readiness dimensions.</>}
        />
        <div className="mk-dims-grid mk-dims-compact">
          {[
            { icon: ShieldIcon, title: 'Governance', desc: 'Policy and oversight' },
            { icon: ScreenIcon, title: 'Tool fluency', desc: 'Practical AI use' },
            { icon: AlertIcon, title: 'Risk awareness', desc: 'What can go wrong' },
            { icon: CheckSquareIcon, title: 'Workflow fit', desc: 'Where AI belongs' },
            { icon: DatabaseIcon, title: 'Data judgment', desc: 'What not to enter' },
            { icon: FileIcon, title: 'Documentation', desc: 'What gets recorded' },
            { icon: UsersIcon, title: 'Role readiness', desc: 'Job-specific use' },
            { icon: ChatIcon, title: 'Leadership', desc: 'Sponsorship and budget' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="mk-dcard">
              <span className="mk-pic">
                <Icon className="mk-ic-xl" size={22} />
              </span>
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <CtaBand
        heading={<>You can't fix what you can't see.</>}
        body={<>Start with the free baseline. Upgrade only when you need the deeper report.</>}
        actions={[
          { label: 'Start free assessment', href: '/assessment/take', variant: 'gold' },
          { label: 'See in-depth report', href: '/assessment/in-depth', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}
