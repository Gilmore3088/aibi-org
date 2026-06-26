// GrowthPreview — shown above the question runner during the 'questions'
// phase. Renders a faded pre/post score comparison so the learner sees
// what they're about to produce before they answer the first question.
// Real pre-score loaded from localStorage if present; otherwise placeholder.

import type { CSSProperties } from 'react';

const kicker: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const block: CSSProperties = {
  background: 'var(--cream)',
  border: '1px solid var(--ink-a10)',
  borderRadius: 20,
  padding: '20px 22px',
  flex: 1,
  minWidth: 220,
};

const scoreNumber: CSSProperties = {
  fontSize: 44,
  fontWeight: 700,
  letterSpacing: '-0.02em',
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1,
  margin: '8px 0 6px',
  color: 'var(--ink)',
};

interface GrowthPreviewProps {
  readonly preScore: number | null;
  readonly preTierLabel: string | null;
}

export function GrowthPreview({ preScore, preTierLabel }: GrowthPreviewProps) {
  // Fallback score and tier must agree with the v3 readiness bands
  // (12-22 = Starting Point, 23-32 = Early Stage). 22 is Starting Point.
  const displayedPreScore = preScore ?? 22;
  const displayedPreTier = preTierLabel ?? 'Starting Point';

  return (
    <section
      aria-label="What this assessment will show you"
      style={{
        border: '1px solid var(--ink-a10)',
        borderRadius: 24,
        background: 'var(--cream-2)',
        padding: '24px clamp(20px, 3vw, 28px)',
        marginBottom: 28,
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <p style={{ ...kicker, marginBottom: 14 }}>
        Here is what you will see at the end
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'stretch',
          opacity: 0.78,
        }}
      >
        <div style={block}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
              margin: 0,
            }}
          >
            Before the course
          </p>
          <div style={scoreNumber}>{displayedPreScore}</div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--slate-600)',
              margin: 0,
            }}
          >
            {displayedPreTier}
          </p>
        </div>

        <div
          aria-hidden="true"
          style={{
            alignSelf: 'center',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--gold-deep)',
            padding: '0 4px',
          }}
        >
          →
        </div>

        <div style={{ ...block, borderColor: 'var(--gold)' }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--gold-deep)',
              margin: 0,
            }}
          >
            After the course
          </p>
          <div style={{ ...scoreNumber, color: 'var(--ink)' }}>—</div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--slate-500)',
              margin: 0,
            }}
          >
            Answer 12 questions to fill this in
          </p>
        </div>
      </div>

      <p
        style={{
          fontSize: 16,
          color: 'var(--slate-600)',
          lineHeight: 1.6,
          margin: '18px 0 0',
        }}
      >
        {preScore
          ? `Your score before the course was ${preScore} (${displayedPreTier}). The same 12 questions, answered honestly today, produce a side-by-side comparison plus a per-dimension breakdown.`
          : 'The 12 questions ahead are scored the same way as the assessment you took before the course. The result is a side-by-side comparison plus a per-dimension breakdown.'}
      </p>
    </section>
  );
}
