// OutcomesPanel — side-by-side "What you will be able to do" + "Required outputs"
// pair. Reads FOUNDATION_ARTIFACTS for the right-hand artifact list.

import { FOUNDATION_ARTIFACTS } from '@content/courses/foundation-program';

const LEARNER_OUTCOMES = [
  'Choose the right prompt strategy for the job',
  'Write safer, clearer prompts for daily banking work',
  'Summarize banking documents responsibly',
  'Review AI outputs for errors and unsupported claims',
  'Avoid entering sensitive data into public tools',
  'Use AI for communication, meetings, policy review, and productivity',
] as const;

const KICKER_STYLE: React.CSSProperties = {
  fontFamily: 'var(--ledger-mono)',
  fontSize: 10.5,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--ledger-accent)',
  marginBottom: 14,
};

const ARTIFACT_TITLE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--ledger-serif)',
  fontSize: 16,
  fontWeight: 500,
  color: 'var(--ledger-ink)',
};

const ARTIFACT_BODY_STYLE: React.CSSProperties = {
  fontSize: 12.5,
  color: 'var(--ledger-slate)',
  lineHeight: 1.5,
};

export function OutcomesPanel() {
  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 0.85fr',
        gap: 28,
        marginBottom: 64,
      }}
    >
      <div
        style={{
          border: '1px solid var(--ledger-rule)',
          padding: 26,
          background: 'var(--ledger-paper)',
          borderRadius: 3,
        }}
      >
        <div style={KICKER_STYLE}>What you will be able to do</div>
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'grid',
            gap: 10,
          }}
        >
          {LEARNER_OUTCOMES.map((outcome) => (
            <li
              key={outcome}
              style={{
                display: 'flex',
                gap: 10,
                fontSize: 14,
                color: 'var(--ledger-ink-2)',
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  marginTop: 7,
                  width: 6,
                  height: 6,
                  background: 'var(--ledger-accent)',
                  flex: 'none',
                }}
              />
              {outcome}
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          border: '1px solid var(--ledger-rule)',
          padding: 26,
          background: 'var(--ledger-parch)',
          borderRadius: 3,
        }}
      >
        <div style={KICKER_STYLE}>Required outputs</div>
        <div style={{ display: 'grid', gap: 14 }}>
          {FOUNDATION_ARTIFACTS.map((artifact) => (
            <div key={artifact.id}>
              <div style={ARTIFACT_TITLE_STYLE}>{artifact.title}</div>
              <div style={ARTIFACT_BODY_STYLE}>{artifact.description}</div>
            </div>
          ))}
          <div>
            <div style={ARTIFACT_TITLE_STYLE}>Final practical assessment</div>
            <div style={ARTIFACT_BODY_STYLE}>
              Submit a reviewed work product package that demonstrates safe,
              practical AI use.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
