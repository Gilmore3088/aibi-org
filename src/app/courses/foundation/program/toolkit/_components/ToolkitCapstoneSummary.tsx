import type { CSSProperties } from 'react';

const kickerStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const SHARING_LABELS: Record<string, string> = {
  personal: 'Personal sandbox',
  team: 'Ready for team review',
  institution: 'Institution-wide',
  'not-sure': 'Needs one more iteration',
};

interface ToolkitCapstoneSummaryProps {
  readonly m7Title: string;
  readonly m8Response: Record<string, string>;
}

export function ToolkitCapstoneSummary({ m7Title, m8Response }: ToolkitCapstoneSummaryProps) {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <p style={{ fontSize: 16, color: 'var(--slate-500)', lineHeight: 1.6, margin: 0 }}>
        Summary of your Module 9 capstone: the workflow you automated, the quality
        standard your work product was built to meet, and the iteration path that
        got you there.
      </p>

      <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: 14 }}>
        <p style={{ ...kickerStyle, marginBottom: 4 }}>Skill used for capstone</p>
        <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
          {m7Title}{' '}
          {m8Response['sharing-ladder-level'] ? (
            <span style={{ color: 'var(--slate-500)' }}>
              — Sharing level:{' '}
              {SHARING_LABELS[m8Response['sharing-ladder-level']] ?? m8Response['sharing-ladder-level']}
            </span>
          ) : null}
        </p>
      </div>

      {m8Response['test-input-1'] && (
        <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: 14 }}>
          <p style={{ ...kickerStyle, marginBottom: 4 }}>Tested against</p>
          <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
            {m8Response['test-input-1']}
          </p>
        </div>
      )}

      {m8Response['revision-notes'] && (
        <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: 14 }}>
          <p style={{ ...kickerStyle, marginBottom: 4 }}>Iteration improvements</p>
          <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
            {m8Response['revision-notes']}
          </p>
        </div>
      )}

      <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: 14 }}>
        <p style={{ ...kickerStyle, marginBottom: 4 }}>Quality standard met</p>
        <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
          Five-dimension AiBI-Foundation rubric: Accuracy (hard gate), Completeness,
          Tone, Judgment, and Skill Quality.
        </p>
      </div>
    </div>
  );
}
