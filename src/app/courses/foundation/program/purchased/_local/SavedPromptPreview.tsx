// SavedPromptPreview — a concrete saved-prompt card so the buyer sees the
// artifact they're about to fill their Toolbox with. Lives next to the
// action ladder on /purchased.
//
// Static (presentational only). Reads as the kind of card the learner will
// save in Module 3 — title, prompt body, metadata strip. Mirrors the shape
// the real Toolbox renders so the preview reads as a continuation, not
// marketing.

import type { CSSProperties } from 'react';
import { INTER_STACK } from '@/lib/ui/fonts';


const MONO_STACK =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

const cardStyle: CSSProperties = {
  border: '1px solid var(--ink-a10)',
  background: '#FFFFFF',
  borderRadius: 16,
  padding: '20px 22px',
  boxShadow: 'var(--shadow-soft)',
};

const eyebrowStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: '0.625rem',
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

export function SavedPromptPreview() {
  return (
    <aside aria-label="Sample saved prompt" style={cardStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <span style={eyebrowStyle}>Saved prompt · sample</span>
        <span
          style={{
            fontFamily: INTER_STACK,
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--slate-500)',
          }}
        >
          Module 3
        </span>
      </div>
      <h3
        style={{
          fontFamily: INTER_STACK,
          fontSize: '1rem',
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
          color: 'var(--ink)',
          margin: '0 0 10px',
        }}
      >
        Rewrite a rushed internal note as a clear staff bulletin
      </h3>
      <pre
        style={{
          fontFamily: MONO_STACK,
          fontSize: '0.75rem',
          color: 'var(--slate-600)',
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
          margin: '0 0 14px',
          background: 'var(--cream)',
          border: '1px solid var(--ink-a10)',
          borderRadius: 12,
          padding: '12px 14px',
        }}
      >
        {`Rewrite the internal note below as a clear, professional
bank-internal bulletin. Keep it under 100 words. Do not add
new information. Reply with the rewritten message only.`}
      </pre>
      <div
        style={{
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          fontFamily: INTER_STACK,
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--slate-500)',
          letterSpacing: '0.04em',
        }}
      >
        <span>Reviewed</span>
        <span aria-hidden="true">·</span>
        <span>Reused 4 times</span>
        <span aria-hidden="true">·</span>
        <span>Tagged: ops, comms</span>
      </div>
    </aside>
  );
}
