'use client';

// Inline knowledge-check micro-interaction for module bodies.
//
// Multiple-choice question with instant feedback. The right answer is
// always known client-side (the component is small, content not secret;
// the learning value is the interactive moment, not the secrecy).

import { useState } from 'react';

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
}

const INK = '#071A2F';
const CREAM_2 = 'var(--cream-2)'; // inherits the course soft-slate override (CourseShell)
const GOLD = '#C8A24A';
const GOLD_DEEP = '#9A7A2F';
const SLATE = '#475569';
const LINE = 'rgba(7,26,47,.12)';

export function KnowledgeCheck({ prompt, options, kicker = 'Check yourself' }: KnowledgeCheckProps) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const picked = pickedId ? options.find((o) => o.id === pickedId) : null;

  return (
    <div
      style={{
        background: CREAM_2,
        border: `1px solid ${LINE}`,
        borderLeft: `4px solid ${GOLD}`,
        borderRadius: 16,
        padding: 20,
        margin: '24px 0',
      }}
    >
      <div
        style={{
          color: GOLD_DEEP,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        {kicker}
      </div>
      <p
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: INK,
          lineHeight: 1.45,
          margin: '8px 0 14px',
        }}
      >
        {prompt}
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        {options.map((opt) => {
          const isPicked = opt.id === pickedId;
          const showAsCorrect = pickedId !== null && opt.correct;
          const showAsWrong = isPicked && !opt.correct;
          const bg = showAsCorrect ? '#D1FADF' : showAsWrong ? '#FEE4E2' : 'white';
          const border = showAsCorrect
            ? '#A6F4C5'
            : showAsWrong
              ? '#FDA29B'
              : LINE;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPickedId(opt.id)}
              disabled={pickedId !== null && !isPicked && !opt.correct}
              style={{
                textAlign: 'left',
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 12,
                padding: '12px 14px',
                fontSize: 16,
                fontWeight: 600,
                color: INK,
                cursor: pickedId === null ? 'pointer' : 'default',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flex: 'none',
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  border: `2px solid ${showAsCorrect ? '#05603A' : showAsWrong ? '#912018' : '#94A3B8'}`,
                  background: showAsCorrect
                    ? '#05603A'
                    : showAsWrong
                      ? '#912018'
                      : 'white',
                  color: 'white',
                  display: 'inline-grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 900,
                  marginTop: 2,
                }}
              >
                {showAsCorrect ? '✓' : showAsWrong ? '✕' : ''}
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
      {picked && (
        <div
          style={{
            marginTop: 14,
            background: 'white',
            border: `1px solid ${LINE}`,
            borderRadius: 12,
            padding: 14,
            color: SLATE,
            fontSize: 16,
            lineHeight: 1.6,
          }}
          aria-live="polite"
        >
          <b style={{ color: picked.correct ? '#05603A' : '#912018' }}>
            {picked.correct ? 'Correct.' : 'Not quite.'}
          </b>{' '}
          {picked.explainer}
        </div>
      )}
    </div>
  );
}
