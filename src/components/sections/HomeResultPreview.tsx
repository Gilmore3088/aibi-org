'use client';

import { useState } from 'react';
import Link from 'next/link';

// A live, responsive preview of what the free assessment returns — the same
// pieces the sample report shows (score ring, maturity band, top gap, starter
// artifact, and the twelve readiness signals), built as real components rather
// than a flat PDF image. Illustrative synthetic result so a visitor sees the
// SHAPE of the output before starting.
//
// Numbers are internally consistent: each of the twelve signals scores out of
// 4, so the twelve sum to the score out of 48 (here 36 → the 33–40 "Building
// Momentum" band), and "Documentation" is the lowest, i.e. the top gap.
const RESULT = {
  score: 36,
  max: 48,
  band: 'Building Momentum',
  topGap: 'Documentation',
  artifact: 'AI Recordkeeping Template',
};

const SIGNAL_MAX = 4;
const SIGNALS: { label: string; value: number }[] = [
  { label: 'Strategic Value', value: 4 },
  { label: 'Human Review', value: 4 },
  { label: 'Approved Tool Path', value: 3 },
  { label: 'Data Safety Reflexes', value: 3 },
  { label: 'Prompting Skill', value: 3 },
  { label: 'Role Fit', value: 3 },
  { label: 'Vendor Awareness', value: 3 },
  { label: 'Customer Impact Awareness', value: 3 },
  { label: 'Workflow Readiness', value: 3 },
  { label: 'Training Culture', value: 3 },
  { label: 'Leadership Visibility', value: 3 },
  { label: 'Documentation', value: 1 },
];

const PREVIEW_COUNT = 5;

// Compact score ring (SVG). Static — no mount animation — so it is robust and
// respects reduced-motion by default.
function ScoreRingCompact({ score, max }: { score: number; max: number }) {
  const size = 132;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max === 0 ? 0 : Math.min(Math.max(score / max, 0), 1);
  return (
    <div className="mk-result-ring" role="img" aria-label={`Readiness score ${score} out of ${max}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ink)" strokeOpacity={0.1} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--gold-deep, #7A5F1E)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="mk-result-ring-label">
        <strong>{score}</strong>
        <span>/ {max}</span>
      </div>
    </div>
  );
}

export function HomeResultPreview() {
  const [signalsOpen, setSignalsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const shown = showAll ? SIGNALS : SIGNALS.slice(0, PREVIEW_COUNT);

  return (
    <section className="mk-result-section" aria-labelledby="mk-result-heading">
      <div className="mk-container mk-result-inner">
        <p className="mk-k">What you get in three minutes</p>
        <h2 id="mk-result-heading" className="mk-result-caption">
          A score, your biggest gap, and one action you can use this week.
        </h2>

        <div className="mk-result-card">
          <div className="mk-result-summary">
            <div className="mk-result-ring-wrap">
              <ScoreRingCompact score={RESULT.score} max={RESULT.max} />
              <p className="mk-result-band">{RESULT.band}</p>
            </div>
            <dl className="mk-result-facts">
              <div>
                <dt>Maturity band</dt>
                <dd>{RESULT.band}</dd>
              </div>
              <div>
                <dt>Top gap</dt>
                <dd>{RESULT.topGap}</dd>
              </div>
              <div>
                <dt>Your starter artifact</dt>
                <dd>{RESULT.artifact}</dd>
              </div>
            </dl>
          </div>

          {!signalsOpen ? (
            <button
              type="button"
              className="mk-result-expand"
              aria-expanded={false}
              aria-controls="mk-result-signals"
              onClick={() => setSignalsOpen(true)}
            >
              View the 12 signals
            </button>
          ) : (
            <div id="mk-result-signals" className="mk-result-signals">
              <ul className="mk-signals" aria-label="Readiness signals">
                {shown.map((signal) => {
                  const isGap = signal.label === RESULT.topGap;
                  return (
                    <li key={signal.label} className={`mk-signal${isGap ? ' is-gap' : ''}`}>
                      <span className="mk-signal-label">
                        {signal.label}
                        {isGap && <span className="mk-signal-tag">Top gap</span>}
                      </span>
                      <span className="mk-signal-track" aria-hidden="true">
                        <span
                          className="mk-signal-fill"
                          style={{ width: `${(signal.value / SIGNAL_MAX) * 100}%` }}
                        />
                      </span>
                      <span className="mk-signal-value">
                        {signal.value}/{SIGNAL_MAX}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="mk-result-signals-actions">
                {!showAll ? (
                  <button type="button" className="mk-result-link-btn" onClick={() => setShowAll(true)}>
                    View all {SIGNALS.length}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="mk-result-link-btn"
                    onClick={() => {
                      setShowAll(false);
                      setSignalsOpen(false);
                    }}
                  >
                    Hide signals
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mk-result-cta">
            <Link href="/assessment/take" className="mk-btn mk-btn-gold mk-btn-lg">
              Get my readiness score
            </Link>
            <span className="mk-result-cta-note">Free · 12 questions · Practical next step</span>
          </div>
        </div>
      </div>
    </section>
  );
}
