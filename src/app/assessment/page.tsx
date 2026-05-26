/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
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
const ResetIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);
const PlayCircleIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
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

export default function AssessmentLandingPage() {
  const [qIdx, setQIdx] = useState(0);
  const [dimScores, setDimScores] = useState<Partial<Record<Dim, number>>>({});

  function computeScore() {
    const all = ALL_DIMS.map((d) => dimScores[d] ?? BASELINE[d] ?? 0);
    const filled = all.filter((v) => v > 0);
    if (!filled.length) return null;
    const avg = filled.reduce((a, b) => a + b, 0) / filled.length;
    return Math.round((avg / 4) * 100);
  }

  function choose(val: number) {
    const q = QUIZ[qIdx];
    setDimScores((prev) => ({ ...prev, [q.dim as Dim]: val }));
    setTimeout(() => setQIdx((i) => i + 1), 380);
  }

  function reset() {
    setQIdx(0);
    setDimScores({});
  }

  const score = computeScore();
  const tier = score === null ? null : tierFor(score);
  const isDone = qIdx >= QUIZ.length;

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
              Assessments · Free baseline + $99 in-depth
            </EyebrowChip>
            <h1>See where you stand. Find the dimension dragging you down.</h1>
            <p className="mk-lede">
              Twelve questions, three minutes. You leave with your readiness score, your tier, and
              a starter artifact you can take to your team this week. When you're ready to act,
              the 48-question In-Depth shows you exactly where the gaps are and what to do next.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/assessment/take">
                Take the assessment <ArrowR className="mk-ic" />
              </Button>
              <Button variant="ghost-dark" size="lg" href="#mini-quiz">
                See a sample report
              </Button>
            </div>
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

      {/* LIVE MINI-QUIZ */}
      <Section variant="std" surface="white" id="mini-quiz">
        <SectionHead
          kicker="Try it · 4 sample questions · No email needed"
          heading={<>Feel the assessment before you start it.</>}
          lede={
            <>
              Answer a few questions to see how scoring works. Your score builds live; tier and
              dimension bars update as you click. Nothing saved, nothing emailed.
            </>
          }
        />

        <div className="mk-quiz">
          <div className="mk-quiz-card">
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
                {isDone ? 'Complete' : `Question ${qIdx + 1}`} of {QUIZ.length}
              </div>
            </div>

            <div>
              {!isDone ? (
                <div className="mk-quiz-q">
                  <div className="mk-k">Dimension · {QUIZ[qIdx].dim}</div>
                  <h3>{QUIZ[qIdx].q}</h3>
                  <div className="mk-quiz-answers">
                    {QUIZ[qIdx].answers.map(([txt, val]) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => choose(val)}
                        className={dimScores[QUIZ[qIdx].dim as Dim] === val ? 'is-chosen' : ''}
                      >
                        <span className="mk-dot" />
                        {txt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mk-quiz-q">
                  <div className="mk-k">Sample complete · 4 of 8 dimensions touched</div>
                  <h3>
                    You're at <span style={{ color: 'var(--gold-deep)' }}>{score}</span> on this
                    sample. Tier: <strong>{tier?.label}</strong>.
                  </h3>
                  <p style={{ color: 'var(--slate-600)', fontSize: 15, margin: '0 0 16px', maxWidth: '50ch' }}>
                    The full free assessment asks 12 questions covering all 8 dimensions and
                    includes your weakest area + a starter artifact.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                    <Button variant="ink" size="lg" href="/assessment/take">
                      See Your Full Results <ArrowR className="mk-ic" />
                    </Button>
                    <Button variant="ghost-light" size="lg" href="/assessment/in-depth">
                      Or jump to In-Depth · $99
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="mk-quiz-foot">
              <Button variant="ghost-light" onClick={reset}>
                <ResetIcon className="mk-ic" />
                Reset
              </Button>
              {isDone && (
                <Button variant="gold" size="lg" href="/assessment/take">
                  Take the full 12-question Free Assessment <ArrowR className="mk-ic" />
                </Button>
              )}
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

      {/* TIER GRID */}
      <Section variant="std">
        <SectionHead
          kicker="Pick your starting point"
          heading={<>Three assessments. One readiness signal.</>}
          lede={<>Start free, upgrade when you want detail, expand when you want institution-wide.</>}
        />
        <div className="mk-tier-grid">
          <div className="mk-tier">
            <div className="mk-tier-bar" />
            <div className="mk-body">
              <div className="mk-lab">Free</div>
              <h3>Readiness Baseline</h3>
              <div className="mk-price">
                <div className="mk-v">$0</div>
                <div className="mk-u">/ 3 min</div>
              </div>
              <p className="mk-desc">
                Twelve questions, three minutes — see where you stand.
              </p>
              <ul>
                <li><CheckIcon className="mk-ic" />Your readiness score and tier</li>
                <li><CheckIcon className="mk-ic" />The dimension dragging you down</li>
                <li><CheckIcon className="mk-ic" />A starter artifact you can take to your team this week</li>
              </ul>
              <Button variant="ink" size="lg" href="/assessment/take" className="mk-cta">
                Start Free
              </Button>
            </div>
          </div>

          <div className="mk-tier is-featured">
            <div className="mk-tier-bar" />
            <div className="mk-body">
              <div className="mk-lab">$99 · Most Popular</div>
              <h3>In-Depth Report</h3>
              <div className="mk-price">
                <div className="mk-v">$99</div>
                <div className="mk-u">/ one-time</div>
              </div>
              <p className="mk-desc">
                The 48-question maturity assessment. Role-specific recommendations + the training
                path that closes your gaps.
              </p>
              <ul>
                <li><CheckIcon className="mk-ic" />All 8 dimensions scored</li>
                <li><CheckIcon className="mk-ic" />Role-specific action plan</li>
                <li><CheckIcon className="mk-ic" />Examiner-ready PDF</li>
                <li><CheckIcon className="mk-ic" />30-day refund</li>
              </ul>
              <Button variant="gold" size="lg" href="/assessment/in-depth" className="mk-cta">
                Get In-Depth · $99
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
                <div className="mk-u">/ contact</div>
              </div>
              <p className="mk-desc">
                Aggregated readiness for your whole institution. Department breakdowns + assigned
                training paths.
              </p>
              <ul>
                <li><CheckIcon className="mk-ic" />Department dashboards</li>
                <li><CheckIcon className="mk-ic" />SSO + admin roles</li>
                <li><CheckIcon className="mk-ic" />Briefing for leadership</li>
              </ul>
              <Button variant="ink" size="lg" href="/for-institutions" className="mk-cta">
                Book Briefing
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
          lede={
            <>
              Each dimension scores 1–4. The In-Depth report shows your level on each and the
              exact gap to close.
            </>
          }
        />
        <div className="mk-dims-grid">
          {[
            { icon: ShieldIcon, title: 'Governance', desc: 'Policy, approvals, and oversight rituals.', on: 3 },
            { icon: ScreenIcon, title: 'Tool fluency', desc: 'Comfort using AI tools day-to-day.', on: 2 },
            { icon: AlertIcon, title: 'Risk awareness', desc: 'What can go wrong, and what you watch for.', on: 4 },
            { icon: CheckSquareIcon, title: 'Workflow fit', desc: 'Where AI belongs in the actual work.', on: 2 },
            { icon: DatabaseIcon, title: 'Data judgment', desc: "What goes to a model and what doesn't.", on: 1 },
            { icon: FileIcon, title: 'Documentation', desc: 'What you write down for the examiner.', on: 3 },
            { icon: UsersIcon, title: 'Role readiness', desc: 'People prepared for their specific job.', on: 3 },
            { icon: ChatIcon, title: 'Leadership support', desc: 'Sponsorship and budget alignment.', on: 4 },
          ].map(({ icon: Icon, title, desc, on }) => (
            <div key={title} className="mk-dcard">
              <span className="mk-pic">
                <Icon className="mk-ic-xl" size={24} />
              </span>
              <h4>{title}</h4>
              <p>{desc}</p>
              <div className="mk-scale">
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className={i <= on ? 'is-on' : ''} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* FLOW */}
      <Section variant="std">
        <SectionHead
          kicker="How it works"
          heading={<>Four steps. Three minutes for the free one.</>}
        />
        <div className="mk-flow">
          <div className="mk-head">
            <div>
              <div className="mk-k">Assessment</div>
              <div className="mk-t">Readiness flow</div>
            </div>
            <PlayCircleIcon size={32} />
          </div>
          <div className="mk-steps">
            {[
              { n: 'Step 1', t: 'Answer 12 questions', d: 'Multiple choice, one screen each on mobile.' },
              { n: 'Step 2', t: 'See your score', d: '62/100. Tier. Top gap. Inline, no email gate.' },
              { n: 'Step 3', t: 'Get your report', d: '8 dimensions + starter artifact emailed.' },
              { n: 'Step 4', t: '(Optional) Upgrade', d: '$99 In-Depth · 48 questions · full plan.' },
            ].map((s) => (
              <div key={s.n}>
                <div className="mk-n">{s.n}</div>
                <div className="mk-t">{s.t}</div>
                <div className="mk-d">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <CtaBand
        kicker="Assessments"
        heading={<>You can't fix what you can't see.</>}
        body={
          <>
            The free baseline takes three minutes and shows you the dimension to fix first. No
            commitment, no sales call.
          </>
        }
        actions={[
          { label: 'Start Free', href: '/assessment/take', variant: 'gold' },
          { label: 'Get In-Depth · $99', href: '/assessment/in-depth', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}
