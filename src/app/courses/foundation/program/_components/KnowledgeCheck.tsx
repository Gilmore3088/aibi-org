'use client';

// Inline knowledge-check micro-interaction for module bodies.
//
// Multiple-choice question with instant feedback. The right answer is
// always known client-side (the component is small, content not secret;
// the learning value is the interactive moment, not the secrecy).

import { useState } from 'react';
import { INK } from '@/lib/brand/colors';
import { GOLD_DEEP_VAR as GOLD_DEEP } from '@/lib/brand/colors';
import { GOLD } from '@/lib/brand/colors';

export interface KnowledgeCheckOption {
  readonly id: string;
  readonly label: string;
  readonly correct?: boolean;
  /** Explanation shown after selection regardless of correctness. */
  readonly explainer: string;
}

export interface KnowledgeCheckProps {
  readonly prompt: string;
  readonly options: readonly KnowledgeCheckOption[];
  /** Optional kicker label (e.g., "Check yourself"). */
  readonly kicker?: string;
  /** Short transfer cue shown after a choice so the answer connects to work. */
  readonly transferCue?: string;
  readonly nextHref?: string;
  readonly nextLabel?: string;
}

const CREAM_2 = 'var(--cream-2)'; // inherits the course soft-slate override (CourseShell)
const SLATE = '#475569';
const LINE = 'rgba(7,26,47,.12)';

export function KnowledgeCheck({
  prompt,
  options,
  kicker = 'Check yourself',
  transferCue,
  nextHref,
  nextLabel = 'Use this in the lab',
}: KnowledgeCheckProps) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const picked = pickedId ? options.find((o) => o.id === pickedId) : null;
  const correctOption = options.find((option) => option.correct);
  const isCorrect = Boolean(picked?.correct);

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${LINE}`,
        borderRadius: 18,
        overflow: 'hidden',
        margin: '24px 0',
      }}
      className="foundation-knowledge-check"
    >
      <div style={{ padding: 20, background: CREAM_2, borderBottom: `1px solid ${LINE}` }}>
        <div
          style={{
            color: GOLD_DEEP,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            fontSize: '0.75rem',
            fontWeight: 800,
          }}
        >
          {kicker}
        </div>
        <p
          style={{
            fontSize: '1.0625rem',
            fontWeight: 800,
            color: INK,
            lineHeight: 1.45,
            margin: '8px 0 0',
          }}
        >
          {prompt}
        </p>
      </div>
      <div
        className="foundation-knowledge-check__body"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.62fr) minmax(260px, 0.38fr)',
          minHeight: 260,
        }}
      >
        <div style={{ display: 'grid', gap: 8, padding: 18, alignContent: 'start' }}>
          {options.map((opt) => {
            const isPicked = opt.id === pickedId;
            const showAsCorrect = pickedId !== null && opt.correct;
            const showAsWrong = isPicked && !opt.correct;
            const bg = showAsCorrect ? '#D1FADF' : showAsWrong ? '#FEE4E2' : 'white';
            const border = showAsCorrect
              ? '#A6F4C5'
              : showAsWrong
                ? '#FDA29B'
                : isPicked
                  ? GOLD
                  : LINE;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPickedId(opt.id)}
                aria-pressed={isPicked}
                aria-describedby={isPicked ? 'foundation-knowledge-check-feedback' : undefined}
                style={{
                  textAlign: 'left',
                  background: bg,
                  border: `1px solid ${border}`,
                  borderRadius: 12,
                  padding: '13px 14px',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: INK,
                  cursor: 'pointer',
                  display: 'grid',
                  gridTemplateColumns: '24px minmax(0, 1fr)',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    flex: 'none',
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    border: `2px solid ${showAsCorrect ? '#05603A' : showAsWrong ? '#912018' : isPicked ? GOLD_DEEP : '#94A3B8'}`,
                    background: showAsCorrect
                      ? '#05603A'
                      : showAsWrong
                        ? '#912018'
                        : isPicked
                          ? GOLD
                          : 'white',
                    color: showAsCorrect || showAsWrong ? 'white' : INK,
                    display: 'inline-grid',
                    placeItems: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    marginTop: 1,
                  }}
                >
                  {showAsCorrect ? '✓' : showAsWrong ? '!' : isPicked ? '•' : ''}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
        <div
          id="foundation-knowledge-check-feedback"
          aria-live="polite"
          className="foundation-knowledge-check__feedback"
          style={{
            borderLeft: `1px solid ${LINE}`,
            background: CREAM_2,
            padding: 18,
            color: SLATE,
            display: 'grid',
            alignContent: 'start',
            gap: 12,
          }}
        >
          {picked ? (
            <>
              <div>
                <p
                  style={{
                    margin: '0 0 7px',
                    color: isCorrect ? '#05603A' : '#912018',
                    fontSize: '0.6875rem',
                    fontWeight: 850,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  {isCorrect ? 'Good call' : 'Try the reasoning again'}
                </p>
                <p style={{ margin: 0, color: INK, fontSize: '1rem', lineHeight: 1.45, fontWeight: 750 }}>
                  {picked.explainer}
                </p>
              </div>
              {!isCorrect && correctOption && (
                <div
                  style={{
                    border: `1px solid ${LINE}`,
                    borderRadius: 12,
                    background: '#fff',
                    padding: 12,
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 6px',
                      color: GOLD_DEEP,
                      fontSize: '0.625rem',
                      fontWeight: 850,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Better move
                  </p>
                  <p style={{ margin: 0, color: INK, fontSize: '0.875rem', lineHeight: 1.4, fontWeight: 750 }}>
                    {correctOption.label}
                  </p>
                </div>
              )}
              {transferCue && (
                <div>
                  <p
                    style={{
                      margin: '0 0 6px',
                      color: GOLD_DEEP,
                      fontSize: '0.625rem',
                      fontWeight: 850,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Next use
                  </p>
                  <p style={{ margin: 0, color: INK, fontSize: '0.875rem', lineHeight: 1.45, fontWeight: 700 }}>
                    {transferCue}
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                {!isCorrect && (
                  <button
                    type="button"
                    onClick={() => setPickedId(null)}
                    style={{
                      border: `1px solid ${LINE}`,
                      borderRadius: 999,
                      background: '#fff',
                      color: INK,
                      padding: '10px 13px',
                      fontSize: '0.75rem',
                      fontWeight: 850,
                      cursor: 'pointer',
                    }}
                  >
                    Try another answer
                  </button>
                )}
                {nextHref && isCorrect && (
                  <a
                    href={nextHref}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 999,
                      background: INK,
                      color: '#fff',
                      padding: '10px 13px',
                      fontSize: '0.75rem',
                      fontWeight: 850,
                      textDecoration: 'none',
                    }}
                  >
                    {nextLabel}
                  </a>
                )}
              </div>
            </>
          ) : (
            <div>
              <p
                style={{
                  margin: '0 0 8px',
                  color: GOLD_DEEP,
                  fontSize: '0.6875rem',
                  fontWeight: 850,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                Feedback appears here
              </p>
              <p style={{ margin: 0, color: SLATE, fontSize: '0.9375rem', lineHeight: 1.5, fontWeight: 650 }}>
                Make a choice to see the reasoning, then carry the move into the lab or artifact.
              </p>
            </div>
          )}
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 760px) {
              .foundation-knowledge-check {
                border-radius: 16px !important;
              }
              .foundation-knowledge-check__body {
                grid-template-columns: 1fr !important;
                min-height: 0 !important;
              }
              .foundation-knowledge-check__feedback {
                border-left: none !important;
                border-top: 1px solid ${LINE} !important;
              }
            }
          `,
        }}
      />
    </div>
  );
}
