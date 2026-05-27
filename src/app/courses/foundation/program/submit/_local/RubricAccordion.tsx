// RubricAccordion — quiet, native-<details> accordion that surfaces the
// five-dimension rubric the reviewer will use. Lives below the form on
// /submit so the learner can audit themselves before they hit submit.
//
// Server component. Pure presentation.

import type { CSSProperties } from 'react';

const kicker: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
};

interface RubricRow {
  readonly check: string;
  readonly detail: string;
}

const RUBRIC: readonly RubricRow[] = [
  {
    check: 'Does the prompt strip identifiers before sending?',
    detail:
      'Names, account numbers, addresses, dates of birth, and case ids should ' +
      'be removed or generalized before the prompt leaves the bank.',
  },
  {
    check: 'Does the edited output get reviewed before use?',
    detail:
      'The annotation should show evidence that you compared the raw output ' +
      'against source-of-truth data, not that you copy-pasted the model output.',
  },
  {
    check: 'Is the workflow repeatable?',
    detail:
      'A colleague reading the prompt should be able to run it next week and ' +
      'get a similar shape of output without re-inventing the structure.',
  },
  {
    check: 'Is the editing reasoning explicit?',
    detail:
      'The annotation should name what you removed, what you sharpened, and why — ' +
      'not just say "I edited it."',
  },
  {
    check: 'Is the artifact something your manager could actually use?',
    detail:
      'The edited output should read as a deliverable, not a draft. ' +
      'If it would not survive a Monday morning email, it is not ready.',
  },
];

export function RubricAccordion() {
  return (
    <details
      style={{
        marginTop: 32,
        border: '1px solid var(--ink-a10)',
        borderRadius: 16,
        background: 'var(--cream-2)',
        padding: '18px 20px',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          listStyle: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <span style={kicker}>What the reviewer checks</span>
        <span
          aria-hidden="true"
          style={{
            fontSize: 13,
            color: 'var(--slate-500)',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Open
        </span>
      </summary>

      <p
        style={{
          fontSize: 14,
          color: 'var(--slate-600)',
          lineHeight: 1.55,
          margin: '14px 0 18px',
        }}
      >
        Five questions. A reviewer answers each before a score is issued.
      </p>

      <ol
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {RUBRIC.map((row, i) => (
          <li
            key={row.check}
            style={{
              display: 'grid',
              gridTemplateColumns: '32px 1fr',
              gap: 14,
              alignItems: 'flex-start',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--gold-deep)',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: '20px',
              }}
            >
              ({i + 1})
            </span>
            <div>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  margin: '0 0 4px',
                  lineHeight: 1.45,
                }}
              >
                {row.check}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--slate-600)',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {row.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </details>
  );
}
