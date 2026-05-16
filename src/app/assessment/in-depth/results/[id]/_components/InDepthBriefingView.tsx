// In-Depth Briefing — full personalized dossier surface.
//
// This is the rich-report surface that replaces the placeholder redirect
// from InDepthRunner.tsx to /results/[id]. Real data drives composite
// score, tier/phase, dimension breakdown, deep-dive picks, and the
// re-read date. Templated content (regulatory exhibit, action register
// scaffold, 12-week reference plan) is framed as "the framework" rather
// than fabricated user data — it is the same for every reader.
//
// Design source: docs/brand-refresh-2026-05-09/project/assessment/
//   In-Depth Briefing.html (Claude Design handoff bundle, 2026-05-11).

import './briefing.css';
import type { ReactElement } from 'react';
import type { Tier, DimensionScore } from '@content/assessments/v2/scoring';
import type { Dimension } from '@content/assessments/v2/types';
import type { Role } from '@content/assessments/v2/role';
import {
  buildDimRows,
  composeScore,
  deepDiveContent,
  filingRef,
  insightForPhase,
  lowestHook,
  postureFor,
  rereadDate,
  selectDeepDives,
  shortDate,
  type DimRow,
} from '../_lib/derive';
import { PersonalizationStripe } from './PersonalizationStripe';

interface Props {
  readonly profileId: string;
  readonly email: string;
  readonly score: number;
  readonly maxScore: number;
  readonly tier: Tier;
  readonly dimensionBreakdown: Record<Dimension, DimensionScore>;
  readonly readinessAt: string;
  readonly role?: Role | null;
}

// Eight-axis radar polygon points. Calculated once at module level to
// avoid recomputing on every render.
const RADAR_CENTER = 200;
const RADAR_RADIUS = 140;
const RADAR_AXES = 8;
// Start at top (12 o'clock), rotate clockwise.
const RADAR_ANGLES = Array.from({ length: RADAR_AXES }, (_, i) =>
  -Math.PI / 2 + (i * 2 * Math.PI) / RADAR_AXES,
);

function radarPoints(scoresPct: readonly number[]): string {
  return RADAR_ANGLES.map((angle, i) => {
    const pct = Math.max(0, Math.min(100, scoresPct[i] ?? 0));
    const r = (pct / 100) * RADAR_RADIUS;
    const x = RADAR_CENTER + r * Math.cos(angle);
    const y = RADAR_CENTER + r * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function radarAxisLines(): ReactElement[] {
  return RADAR_ANGLES.map((angle, i) => {
    const x = RADAR_CENTER + RADAR_RADIUS * Math.cos(angle);
    const y = RADAR_CENTER + RADAR_RADIUS * Math.sin(angle);
    return (
      <line
        key={i}
        x1={RADAR_CENTER}
        y1={RADAR_CENTER}
        x2={x.toFixed(1)}
        y2={y.toFixed(1)}
      />
    );
  });
}

function radarLabels(rows: readonly DimRow[]): ReactElement[] {
  return RADAR_ANGLES.map((angle, i) => {
    const r = RADAR_RADIUS + 22;
    const x = RADAR_CENTER + r * Math.cos(angle);
    const y = RADAR_CENTER + r * Math.sin(angle);
    const anchor =
      Math.abs(Math.cos(angle)) < 0.2
        ? 'middle'
        : Math.cos(angle) > 0
          ? 'start'
          : 'end';
    return (
      <text
        key={i}
        x={x.toFixed(1)}
        y={(y + 4).toFixed(1)}
        textAnchor={anchor}
      >
        {rows[i]?.code ?? ''}
      </text>
    );
  });
}

// Insight copy now lives in derive.ts (insightForPhase) and is keyed off
// the composed phase, not the stored tier — see derive.ts comments for
// the reconciliation rationale.

// Reference content — regulatory exhibit is templated, identical for
// every reader. Framed in the surrounding copy as "the supervisory
// frame your assessment maps against," not as personal findings.
const REGULATORY_ROWS = [
  {
    ref: 'SR 11-7',
    refSub: 'Model Risk Management · 2011 · FRB / OCC',
    what: 'Inventory, validation, and ongoing monitoring of any model used in business decisions.',
    statusClass: 'part',
    statusLabel: 'Map yours',
  },
  {
    ref: 'FFIEC IT Handbook',
    refSub: 'Mgmt · Architecture · Operations · 2021',
    what: 'Vendor due diligence and concentration risk for material third parties.',
    statusClass: 'part',
    statusLabel: 'Map yours',
  },
  {
    ref: 'NCUA 24-CU-XX',
    refSub: 'AI in CU operations · 2024',
    what: 'Board oversight, written policy, and disclosure expectations.',
    statusClass: 'part',
    statusLabel: 'Map yours',
  },
  {
    ref: 'FinCEN AML Guidance',
    refSub: 'Innovative approaches · 2018 · Section 314(b)',
    what: 'Innovative approaches to BSA/AML are encouraged when paired with appropriate testing.',
    statusClass: 'part',
    statusLabel: 'Map yours',
  },
  {
    ref: 'CFPB Fair Lending',
    refSub: 'UDAAP · Reg B / Reg V · 2023 guidance',
    what: 'Disparate-impact testing on any model influencing credit decisions.',
    statusClass: 'part',
    statusLabel: 'Map yours',
  },
  {
    ref: 'GLBA · Safeguards',
    refSub: '16 CFR 314 · final rule 2023',
    what: 'Encryption, access controls, and incident response for NPI processed by third parties.',
    statusClass: 'part',
    statusLabel: 'Map yours',
  },
] as const;

// Action register scaffold. Row 01 is personalized off the lowest
// dimension. The remaining rows are generic verbs every institution
// gets, sequenced into Now / Next / Later buckets.
interface RegisterRow {
  readonly num: string;
  readonly action: string;
  readonly actionEm?: string;
  readonly actionTail?: string;
  readonly sub: string;
  readonly owner: { readonly title: string; readonly role: string } | 'open-seat';
  readonly dueDate: string;
  readonly dueWeek: string;
  readonly pillar: string;
  readonly effort: number; // 1..3 (number of filled dots)
  readonly status: 'now' | 'next' | 'later';
}

function buildRegister(lowestImperative: string): readonly RegisterRow[] {
  return [
    {
      num: '01',
      action: lowestImperative,
      sub: 'Pulled from your lowest-scoring dimension. This is where the next thirty days of effort compounds fastest.',
      owner: 'open-seat',
      dueDate: 'Week 01',
      dueWeek: 'Week 01',
      pillar: 'Strategy',
      effort: 3,
      status: 'now',
    },
    {
      num: '02',
      action: 'Publish a one-page',
      actionEm: 'AI use memo',
      actionTail: 'to all staff',
      sub: 'What is allowed, what is not, who to ask. One page beats one workshop.',
      owner: { title: 'Compliance', role: 'BSA / risk' },
      dueDate: 'Week 02',
      dueWeek: 'Week 02',
      pillar: 'Risk',
      effort: 1,
      status: 'now',
    },
    {
      num: '03',
      action: 'Name a',
      actionEm: 'pilot owner',
      actionTail: 'and a workflow',
      sub: 'One person. One repeatable task. One four-week window with a written outcome.',
      owner: { title: 'COO', role: 'Operations' },
      dueDate: 'Week 03',
      dueWeek: 'Week 03',
      pillar: 'Strategy',
      effort: 2,
      status: 'now',
    },
    {
      num: '04',
      action: 'Add an',
      actionEm: 'AI line item',
      actionTail: 'to the next leadership report',
      sub: 'Zero is a number. Hours recovered · dollars defended · member-experience delta.',
      owner: { title: 'CFO', role: 'Finance' },
      dueDate: 'Week 06',
      dueWeek: 'Week 06',
      pillar: 'Strategy',
      effort: 1,
      status: 'next',
    },
    {
      num: '05',
      action: 'Audit your',
      actionEm: 'top vendor agreements',
      actionTail: 'for AI clauses',
      sub: 'Tenancy, training-data exclusion, prompt retention, audit log term.',
      owner: { title: 'CRO', role: 'Risk' },
      dueDate: 'Week 05',
      dueWeek: 'Week 05',
      pillar: 'Stack',
      effort: 2,
      status: 'next',
    },
    {
      num: '06',
      action: 'Mandate',
      actionEm: 'Charter Foundations',
      actionTail: 'for staff who handle member work',
      sub: 'Shared vocabulary. 70% completion target by week 10.',
      owner: { title: 'HR + COO', role: 'People' },
      dueDate: 'Week 10',
      dueWeek: 'Week 10',
      pillar: 'Talent',
      effort: 2,
      status: 'later',
    },
    {
      num: '07',
      action: 'Publish a public',
      actionEm: 'AI Principles page',
      actionTail: 'on your institution’s site',
      sub: 'Six sentences. Members will tolerate AI. They will not tolerate being surprised by it.',
      owner: { title: 'CEO + Marketing', role: 'Trust' },
      dueDate: 'Week 11',
      dueWeek: 'Week 11',
      pillar: 'Risk',
      effort: 1,
      status: 'later',
    },
    {
      num: '08',
      action: 'File',
      actionEm: 'Reading 02',
      actionTail: '— 90-day re-read',
      sub: 'Same instrument. Track the delta. Lock the next quarter’s ask off the movement, not the snapshot.',
      owner: { title: 'CEO', role: 'Sponsor' },
      dueDate: 'Week 12',
      dueWeek: 'Week 12',
      pillar: 'Strategy',
      effort: 1,
      status: 'later',
    },
  ];
}

function effortDots(n: number): ReactElement[] {
  return Array.from({ length: 3 }, (_, i) => (
    <span key={i} className={i < n ? 'dot' : 'dot off'} />
  ));
}

// Deep-dive narrative + recommendations now live in derive.ts
// (deepDiveContent) keyed per-dimension × terrain. Each of the 24
// possible combinations has unique authored copy so consecutive deep
// dives in the same terrain band no longer read as identical filler.

export function InDepthBriefingView({
  profileId,
  email,
  // The stored score (12–48 scale) and tier are ignored here because the
  // free-flow tier function does not reconcile with the 48-question raw
  // sum (e.g. stored 30/48 vs dimension sum 119/192 — see derive.ts).
  // We compose all display values from the dimension breakdown so the
  // composite, the radar, and the phase rubric agree.
  score: _ignoredStoredScore,
  maxScore: _ignoredStoredMax,
  tier: _ignoredStoredTier,
  dimensionBreakdown,
  readinessAt,
  role = null,
}: Props): ReactElement {
  const rows = buildDimRows(dimensionBreakdown);
  const composite = composeScore(dimensionBreakdown);
  const deepDives = selectDeepDives(rows);
  const hook = lowestHook(rows);
  const phase = composite.phase;
  const insight = insightForPhase(phase);
  const register = buildRegister(hook.imperative);

  // Radar uses the 8 dimension percentages in display order.
  const radarSeries = rows.map((r) => r.pct);

  // Timeline position: which of the four nodes is "now."
  const PHASE_INDEX: Record<typeof phase, number> = {
    Curious: 0,
    Coordinated: 1,
    Programmatic: 2,
    Native: 3,
  };
  const nowIndex = PHASE_INDEX[phase];
  const filledPct = (nowIndex / 3) * 100;

  const filing = filingRef(profileId);
  const todayStr = shortDate(readinessAt);
  const rereadStr = rereadDate(readinessAt);

  return (
    <div className="aibi-briefing">
      <div className="strip">
        <div className="container strip-row">
          <span>The AI Banking Institute</span>
          <span><span className="conf">Confidential · Filing {filing}</span></span>
        </div>
      </div>

      <header className="container mast">
        <h1>Your In-Depth AI Readiness <em>Briefing.</em></h1>
        <p className="deck">
          A diagnosis of where your institution stands on the AI maturity arc,
          dimension by dimension — with the regulatory frame, the deep dives,
          and a sequenced ninety-day plan to <em>move one phase forward.</em>
        </p>

        <div className="filing-meta">
          <div>
            <div className="lbl">Filing</div>
            <div className="val">{filing}<small>Reading 01</small></div>
          </div>
          <div>
            <div className="lbl">Prepared for</div>
            <div className="val">{email}<small>Account on file</small></div>
          </div>
          <div>
            <div className="lbl">Filed</div>
            <div className="val"><em>{todayStr}</em><small>Snapshot — re-read on schedule</small></div>
          </div>
        </div>
      </header>

      <section className="container contents">
        <div className="contents-grid">
          <div>
            <h2>The <em>briefing.</em></h2>
            <span className="h-sub">Five sections · ~ 18 min read</span>
          </div>
          <div className="toc">
            <a href="#ch01"><span className="n">01</span><span className="t">The synthesis<small>Composite score · phase · the big finding</small></span><span className="pg">p. 02</span></a>
            <a href="#ch02"><span className="n">02</span><span className="t">The eight dimensions, at a glance<small>One line per dimension · scores · pillars</small></span><span className="pg">p. 03</span></a>
            <a href="#ch03"><span className="n">03</span><span className="t">Dimension deep dives<small>Narrative · score · three recommendations each</small></span><span className="pg">p. 04</span></a>
            <a href="#ch04"><span className="n">04</span><span className="t">Regulatory frame<small>SR 11-7 · FFIEC · NCUA · FinCEN · CFPB · GLBA</small></span><span className="pg">p. 06</span></a>
            <a href="#ch05"><span className="n">05</span><span className="t">Your action register + re-read<small>Eight verbs · owners · 90-day window</small></span><span className="pg">p. 07</span></a>
          </div>
        </div>
      </section>

      {/* ── CH 01 — Synthesis ──────────────────────────────────────────── */}
      <section className="chapter" id="ch01">
        <div className="container">
          <div className="ch-head">
            <div className="left">
              <div className="num">Chapter <em>01</em><br />The synthesis</div>
            </div>
            <div>
              <h2>Where you are — and <em>what it means</em> for the next ninety days.</h2>
              <p className="body">Across forty-eight calibrated questions, your composite places you at <em>{phase}</em>. The shape of your eight dimensions is the work — strong ones to defend, weak ones to invest behind, mid-tier ones to make visible.</p>
            </div>
          </div>

          <div className="thisweek">
            <div className="tag">If you only act on one thing<em>This week · weeks 1–3</em></div>
            <div className="verb">{hook.imperative}</div>
            <div className="who">Lowest dimension<strong>{hook.row.label}</strong></div>
          </div>

          <div className="synth-grid">
            <div className="composite">
              <span className="lbl">Composite readiness · eight dimensions weighted</span>
              <div className="score-row">
                <div className="score">{composite.rawScore}<small>/{composite.rawMax}</small></div>
                <div className="phase-box">
                  <div className="phase">{phase} <em>Posture</em></div>
                  <div className="stage">{composite.normalized}/100 normalized</div>
                </div>
              </div>
              <svg
                className="radar"
                viewBox="0 0 400 400"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Eight-dimension radar chart"
              >
                <g className="rings">
                  <circle cx={RADAR_CENTER} cy={RADAR_CENTER} r={35} fill="none" stroke="rgba(14,27,45,0.10)" strokeWidth={1} />
                  <circle cx={RADAR_CENTER} cy={RADAR_CENTER} r={70} fill="none" stroke="rgba(14,27,45,0.10)" strokeWidth={1} />
                  <circle cx={RADAR_CENTER} cy={RADAR_CENTER} r={105} fill="none" stroke="rgba(14,27,45,0.10)" strokeWidth={1} />
                  <circle cx={RADAR_CENTER} cy={RADAR_CENTER} r={RADAR_RADIUS} fill="none" stroke="rgba(14,27,45,0.22)" strokeWidth={1} />
                </g>
                <g className="axes" stroke="rgba(14,27,45,0.12)" strokeWidth={1}>
                  {radarAxisLines()}
                </g>
                <polygon
                  className="you"
                  points={radarPoints(radarSeries)}
                  fill="rgba(181,134,42,0.22)"
                  stroke="#B5862A"
                  strokeWidth={1.8}
                />
                <g className="dots" fill="#B5862A">
                  {RADAR_ANGLES.map((angle, i) => {
                    const pct = Math.max(0, Math.min(100, radarSeries[i] ?? 0));
                    const r = (pct / 100) * RADAR_RADIUS;
                    const x = RADAR_CENTER + r * Math.cos(angle);
                    const y = RADAR_CENTER + r * Math.sin(angle);
                    return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={3.2} />;
                  })}
                </g>
                <g
                  className="labels"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize={10}
                  letterSpacing={1.4}
                  fill="#0E1B2D"
                  fontWeight={600}
                >
                  {radarLabels(rows)}
                </g>
              </svg>
              <div className="radar-legend">
                <span className="sw"><i className="sw-you" />Your readiness</span>
              </div>
            </div>

            <div className="insight">
              <span className="lbl">The big finding</span>
              <p className="pull">{insight.pull}</p>
              <p className="body">{insight.body}</p>
              <p className="body">The first action in this dossier is the one most likely to compound — it is named in the masthead callout above, and it appears as row 01 of the register on the final page.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CH 02 — Dimensions index ──────────────────────────────────── */}
      <section className="chapter shaded" id="ch02">
        <div className="container">
          <div className="ch-head">
            <div className="left">
              <div className="num">Chapter <em>02</em><br />Dimensions index</div>
            </div>
            <div>
              <h2>The eight dimensions, <em>at a glance.</em></h2>
              <p className="body">Each line is one of the eight dimensions the assessment calibrated. Scores are shown as the raw points awarded out of the maximum for that dimension; bars are colored by terrain — oxblood for under half, gold for half to three-quarters, forest above. The four pillars (Strategy · Risk · Stack · Talent) are noted at right.</p>
            </div>
          </div>

          <div className="rubric-timeline">
            <div className="rt-track">
              <div className="rt-line" />
              <div className="rt-fill" style={{ width: `${filledPct}%` }} />
              {(['Curious', 'Coordinated', 'Programmatic', 'Native'] as const).map((p, i) => {
                const left = (i / 3) * 100;
                const cls = i === nowIndex ? 'rt-dot now' : i < nowIndex ? 'rt-dot done' : 'rt-dot';
                return (
                  <div key={p} className="rt-node" style={{ left: `${left}%` }}>
                    {i === nowIndex && (
                      <div className="rt-here">
                        You are here<em>{composite.normalized} / 100</em>
                      </div>
                    )}
                    <span className={cls} />
                  </div>
                );
              })}
            </div>
            <div className="rt-labels">
              <div>
                <div className={phase === 'Curious' ? 'phs' : 'phs'}>{phase === 'Curious' ? <em>Curious</em> : 'Curious'}</div>
                <div className="dsc">Tools tried; no policy, no owner, no audit trail.</div>
              </div>
              <div>
                <div className="phs">{phase === 'Coordinated' ? <em>Coordinated</em> : 'Coordinated'}</div>
                <div className="dsc">Policy ratified; pilots run; wins are real but uncounted.</div>
              </div>
              <div>
                <div className="phs">{phase === 'Programmatic' ? <em>Programmatic</em> : 'Programmatic'}</div>
                <div className="dsc">Named owner, instrumented backlog, measured ROI.</div>
              </div>
              <div>
                <div className="phs">{phase === 'Native' ? <em>Native</em> : 'Native'}</div>
                <div className="dsc">AI is a default verb in operating reviews and budgets.</div>
              </div>
            </div>
          </div>

          <div className="dim-index">
            {rows.map((r) => (
              <div key={r.id} className="dim-row">
                <span className="n">{r.code}</span>
                <div className="nm">
                  {r.label}
                  <small>{r.subhead}</small>
                </div>
                <span className="pillar">{r.pillar}</span>
                <div className={`bar ${r.terrain}`}>
                  <i style={{ width: `${r.pct}%` }} />
                </div>
                <div className="sc">
                  {r.raw}<small>of {r.max}</small>
                </div>
                <span className="arrow">→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CH 03 — Deep dives ────────────────────────────────────────── */}
      <section className="chapter" id="ch03">
        <div className="container">
          <div className="ch-head">
            <div className="left">
              <div className="num">Chapter <em>03</em><br />Deep dives · selected</div>
            </div>
            <div>
              <h2>Six dimensions, <em>read closely.</em></h2>
              <p className="body">The six dimensions that most shape your next ninety days — your strongest, your weakest, and the ones in between where small movement most changes the composite.</p>
            </div>
          </div>

          {deepDives.map((row) => {
            const content = deepDiveContent(row);
            return (
              <div className="deep" key={row.id}>
                <div className="left">
                  <div className="id">
                    {row.code} · {row.label}
                    <em>{row.pillar} pillar</em>
                  </div>
                  <h3>{content.headline}</h3>
                  <p className="narr">{content.narrative[0]}</p>
                  <p className="narr">{content.narrative[1]}</p>
                </div>
                <div className="right">
                  <div className="deep-card">
                    <div className="hd">
                      <span className="k">Posture</span>
                      <span className="v">{postureFor(row.pct)}</span>
                    </div>
                    <div className="scoreblock">
                      <div className="big">{row.raw}<small>/{row.max}</small></div>
                      <div className="meta">
                        Phase posture<strong>{row.terrain === 'strong' ? 'Strong' : row.terrain === 'mid' ? 'Coordinated' : 'Curious'}</strong>
                        Normalized<strong>{row.pct} / 100</strong>
                        Pillar<strong>{row.pillar}</strong>
                      </div>
                    </div>
                    <div className="bar-detail">
                      <div className={`bar ${row.terrain}`}>
                        <i style={{ width: `${row.pct}%` }} />
                      </div>
                      <div className="ticks">
                        <span style={{ left: '0' }}>0</span>
                        <span style={{ left: '50%' }}>50</span>
                        <span className="now" style={{ left: `${row.pct}%` }}>{row.pct} · you</span>
                        <span style={{ left: '100%' }}>100</span>
                      </div>
                    </div>
                    <div className="actions">
                      <h5>Three recommendations · 90 days</h5>
                      <ol>
                        {content.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CH 04 — Regulatory frame ──────────────────────────────────── */}
      <section className="chapter shaded" id="ch04">
        <div className="container">
          <div className="ch-head">
            <div className="left">
              <div className="num">Chapter <em>04</em><br />Regulatory frame</div>
            </div>
            <div>
              <h2>The supervisory frame <em>your posture maps against.</em></h2>
              <p className="body">Each row names a reference the institute uses when calibrating AI readiness for community banks and credit unions. This is the framework — the personal mapping (which row is defensible, which is a finding) is the work of an Executive Briefing or a Charter cohort engagement. Bring this table to your CRO.</p>
            </div>
          </div>

          <div className="reg-table">
            <div className="reg-row head">
              <span className="h">Reference</span>
              <span className="h">What it asks</span>
              <span className="h">Where your dimensions map</span>
              <span className="h">Your status</span>
            </div>
            {REGULATORY_ROWS.map((r) => (
              <div className="reg-row" key={r.ref}>
                <div className="ref">{r.ref}<small>{r.refSub}</small></div>
                <div className="what">{r.what}</div>
                <div className="gap">Mapped against your dimensions in <em>security posture</em>, <em>builder bench</em>, and <em>policy</em> rows of Chapter 02.</div>
                <div className={`status ${r.statusClass}`}>{r.statusLabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CH 05 — Action register + re-read ─────────────────────────── */}
      <section className="chapter" id="ch05">
        <div className="container">
          <div className="ch-head">
            <div className="left">
              <div className="num">Chapter <em>05</em><br />Your action register</div>
            </div>
            <div>
              <h2>Eight verbs, <em>in order, with owners.</em></h2>
              <p className="body">Row 01 is the one personalized off your lowest dimension; the remaining seven are the verbs every institution at your phase carries. The page your CEO photocopies.</p>
            </div>
          </div>

          <div className="register">
            <div className="reg-head">
              <span>#</span><span>Action</span><span>Owner</span><span>Due</span><span>Pillar</span><span>Effort</span><span>Status</span>
            </div>

            {register.map((row) => (
              <div className="reg-line" key={row.num}>
                <div className="num">{row.num}</div>
                <div className="act">
                  {row.action}{' '}
                  {row.actionEm ? <em>{row.actionEm}</em> : null}
                  {row.actionTail ? ` ${row.actionTail}` : ''}
                  <small>{row.sub}</small>
                </div>
                {row.owner === 'open-seat' ? (
                  <div className="own open-seat">
                    <span className="l1">Open seat</span>
                    <span className="l2">AI program lead</span>
                  </div>
                ) : (
                  <div className="own">
                    <strong>{row.owner.title}</strong>{row.owner.role}
                  </div>
                )}
                <div className="due"><em>{row.dueDate}</em></div>
                <div className="pil">{row.pillar}</div>
                <div className="eff">{effortDots(row.effort)}</div>
                <div className={`stat ${row.status}`}>{row.status === 'now' ? 'Now' : row.status === 'next' ? 'Next' : 'Later'}</div>
              </div>
            ))}
          </div>

          <div className="slippage">
            <span className="tag">Slippage rule</span>
            <p className="copy">If row 01 slips by more than two weeks, <em>replan the dossier.</em> The lowest dimension gates everything that follows — it is the place where the next ninety days compound.</p>
          </div>

          <div className="certify" style={{ marginTop: 54 }}>
            <div className="reread">
              <h4>Re-read on <em>schedule</em>, not on instinct.</h4>
              <p>A reading is a snapshot. The value of the snapshot is the next snapshot. The institute recommends a 90-day re-read using the same instrument — the delta is what you brief leadership on, not the absolute score.</p>
              <div className="dates">
                <div>
                  <div className="k">90-day re-read</div>
                  <div className="v"><em>{rereadStr}</em><small>Window opens 14 days prior</small></div>
                </div>
                <div>
                  <div className="k">Filing reference</div>
                  <div className="v">{filing}<small>Quote this on advisory calls</small></div>
                </div>
                <div>
                  <div className="k">Account on file</div>
                  <div className="v">{email}<small>Same email · same instrument</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic personalization — profile diagnosis + Foundation course
          recommendations. Falls back gracefully when no profile detected. */}
      <PersonalizationStripe
        dimensionBreakdown={dimensionBreakdown}
        role={role}
      />

      <footer className="docfoot">
        <div className="container docfoot-row">
          <span>The AI Banking Institute</span>
          <span>© 2026 · aibankinginstitute.com</span>
        </div>
      </footer>
    </div>
  );
}
