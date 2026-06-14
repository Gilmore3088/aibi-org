// DrillReadOnlyReview — Score summary and per-scenario annotations
// shown after a ClassificationDrill is completed or already submitted.
// Ported to mockup tokens 2026-05-27.

import type React from 'react';
import { CheckIcon, XIcon, ClockIcon } from './DrillIcons';

interface DrillScenario {
  readonly scenario: string;
  readonly tier: string;
  readonly reasoning: string;
}

interface DrillAnswer {
  readonly scenarioIndex: number;
  readonly selected: string | null;
  readonly correct: string;
  readonly timeRemaining: number;
}

export function tierToValue(tier: string): string {
  if (tier.startsWith('Tier 1')) return 'tier-1';
  if (tier.startsWith('Tier 2')) return 'tier-2';
  if (tier.startsWith('Tier 3')) return 'tier-3';
  return 'tier-1';
}

export function valueToLabel(value: string | null): string {
  if (value === 'tier-1') return 'Tier 1 — Public Information';
  if (value === 'tier-2') return 'Tier 2 — Internal Only';
  if (value === 'tier-3') return 'Tier 3 — Highly Restricted';
  if (value === 'no-answer') return 'Time expired — no answer';
  return '—';
}

interface DrillReadOnlyReviewProps {
  readonly scenarios: readonly DrillScenario[];
  readonly answers: readonly DrillAnswer[];
  readonly score: number;
}

const INTER_STACK = 'Inter, ui-sans-serif, system-ui, sans-serif';

const eyebrowStyle: React.CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  margin: 0,
};

// Amber (Tailwind 400/600/50) is retained for the "time expired" neutral
// state — emerald is reserved for success, and the mockup system doesn't
// define an in-progress/warning token. This is a contained exception, not
// a new palette.
const AMBER_BORDER = 'rgba(251, 191, 36, 0.4)';
const AMBER_BG = '#FFFBEB';
const AMBER_TEXT = '#B45309';

const INCORRECT_BORDER = 'rgba(185, 28, 28, 0.3)';
const INCORRECT_BG = '#FEF2F2';
const INCORRECT_TEXT = '#B91C1C';

export function DrillReadOnlyReview({
  scenarios,
  answers,
  score,
}: DrillReadOnlyReviewProps) {
  const pct = Math.round((score / answers.length) * 100);
  const tier1 = { correct: 0, total: 0 };
  const tier2 = { correct: 0, total: 0 };
  const tier3 = { correct: 0, total: 0 };

  for (const a of answers) {
    const sc = scenarios[a.scenarioIndex];
    if (!sc) continue;
    const tier = tierToValue(sc.tier);
    if (tier === 'tier-1') {
      tier1.total++;
      if (a.selected === tier) tier1.correct++;
    } else if (tier === 'tier-2') {
      tier2.total++;
      if (a.selected === tier) tier2.correct++;
    } else {
      tier3.total++;
      if (a.selected === tier) tier3.correct++;
    }
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Score summary */}
      <div
        style={{
          textAlign: 'center',
          padding: '28px 16px',
          background: 'var(--ink)',
          color: 'var(--cream)',
          borderRadius: 24,
          boxShadow: 'var(--shadow-feature)',
        }}
      >
        <p style={{ ...eyebrowStyle, color: 'var(--gold-soft)', marginBottom: 8 }}>
          Drill score
        </p>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--cream)',
            margin: 0,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {score}/{answers.length}
        </p>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--on-dark-70)',
            margin: '8px 0 0 0',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {pct}% correct
        </p>
      </div>

      {/* Tier breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Tier 1 — Public', ...tier1 },
          { label: 'Tier 2 — Internal', ...tier2 },
          { label: 'Tier 3 — Restricted', ...tier3 },
        ].map((t) => (
          <div
            key={t.label}
            style={{
              textAlign: 'center',
              padding: '14px 8px',
              background: 'var(--cream-2)',
              borderRadius: 16,
              border: '1px solid var(--ink-a10)',
            }}
          >
            <p
              style={{
                ...eyebrowStyle,
                color: 'var(--slate-500)',
                marginBottom: 6,
                lineHeight: 1.3,
              }}
            >
              {t.label}
            </p>
            <p
              style={{
                fontFamily: INTER_STACK,
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {t.correct}/{t.total}
            </p>
          </div>
        ))}
      </div>

      {/* Per-scenario annotations */}
      <div style={{ display: 'grid', gap: 12 }}>
        {answers.map((a, i) => {
          const sc = scenarios[a.scenarioIndex];
          if (!sc) return null;
          const correctValue = tierToValue(sc.tier);
          const isCorrect = a.selected === correctValue;
          const isTimeout = a.selected === 'no-answer' || a.selected === null;

          const borderColor = isCorrect
            ? 'var(--emerald-700)'
            : isTimeout
              ? AMBER_BORDER
              : INCORRECT_BORDER;
          const background = isCorrect
            ? 'var(--emerald-50)'
            : isTimeout
              ? AMBER_BG
              : INCORRECT_BG;
          const accentText = isCorrect
            ? 'var(--emerald-800)'
            : isTimeout
              ? AMBER_TEXT
              : INCORRECT_TEXT;

          return (
            <div
              key={i}
              style={{
                padding: 16,
                borderRadius: 16,
                border: '1px solid',
                borderColor,
                background,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div
                  style={{
                    marginTop: 2,
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: INTER_STACK,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: accentText,
                  }}
                >
                  {isCorrect ? (
                    <>
                      <CheckIcon />
                      Correct
                    </>
                  ) : isTimeout ? (
                    <>
                      <ClockIcon />
                      Time expired
                    </>
                  ) : (
                    <>
                      <XIcon />
                      Incorrect
                    </>
                  )}
                </div>
                <p
                  style={{
                    ...eyebrowStyle,
                    color: 'var(--slate-500)',
                    lineHeight: 1.3,
                  }}
                >
                  Scenario {a.scenarioIndex + 1} of {answers.length}
                </p>
              </div>

              <p
                style={{
                  marginTop: 10,
                  fontFamily: INTER_STACK,
                  fontSize: 16,
                  color: 'var(--ink)',
                  lineHeight: 1.6,
                  marginBottom: 0,
                }}
              >
                {sc.scenario}
              </p>

              {!isCorrect && (
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: '1px solid var(--ink-a10)',
                    display: 'grid',
                    gap: 4,
                  }}
                >
                  <p
                    style={{
                      fontFamily: INTER_STACK,
                      fontSize: 13,
                      color: 'var(--slate-600)',
                      margin: 0,
                    }}
                  >
                    Your answer:{' '}
                    <span style={{ color: 'var(--ink)', fontWeight: 600 }}>
                      {valueToLabel(a.selected)}
                    </span>
                  </p>
                  <p
                    style={{
                      fontFamily: INTER_STACK,
                      fontSize: 13,
                      color: 'var(--slate-600)',
                      margin: 0,
                    }}
                  >
                    Correct answer:{' '}
                    <span style={{ color: 'var(--ink)', fontWeight: 700 }}>
                      {valueToLabel(correctValue)}
                    </span>
                  </p>
                  <p
                    style={{
                      marginTop: 6,
                      fontFamily: INTER_STACK,
                      fontSize: 14,
                      color: 'var(--slate-600)',
                      lineHeight: 1.6,
                      margin: '6px 0 0 0',
                    }}
                  >
                    {sc.reasoning}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
