// OutcomesPanel — side-by-side "What you will be able to do" + "Required outputs"
// pair. Reads FOUNDATION_ARTIFACTS for the right-hand artifact list.

import { FOUNDATION_ARTIFACTS } from '@content/courses/foundation-program';

const FONT_INTER =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const KICKER_STYLE: React.CSSProperties = {
  fontFamily: FONT_INTER,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  marginBottom: 14,
};

const ARTIFACT_TITLE_STYLE: React.CSSProperties = {
  fontFamily: FONT_INTER,
  fontSize: 16,
  fontWeight: 700,
  color: 'var(--ink)',
};

const ARTIFACT_BODY_STYLE: React.CSSProperties = {
  fontFamily: FONT_INTER,
  fontSize: 13,
  color: 'var(--slate-600)',
  lineHeight: 1.55,
  marginTop: 2,
};

const LEARNER_OUTCOMES = [
  'Choose the right prompt strategy for the job',
  'Write safer, clearer prompts for daily banking work',
  'Summarize banking documents responsibly',
  'Review AI outputs for errors and unsupported claims',
  'Avoid entering sensitive data into public tools',
  'Use AI for communication, meetings, policy review, and productivity',
] as const;

export function OutcomesPanel() {
  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 0.85fr',
        gap: 28,
        marginBottom: 64,
        fontFamily: FONT_INTER,
      }}
    >
      <div
        style={{
          border: '1px solid var(--ink-a10)',
          padding: 28,
          background: '#FFFFFF',
          borderRadius: 24,
          boxShadow: 'var(--shadow-soft)',
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
                gap: 12,
                fontFamily: FONT_INTER,
                fontSize: 14,
                color: 'var(--ink)',
                lineHeight: 1.5,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  marginTop: 8,
                  width: 6,
                  height: 6,
                  background: 'var(--gold)',
                  borderRadius: 999,
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
          border: '1px solid var(--ink-a10)',
          padding: 28,
          background: 'var(--cream-2)',
          borderRadius: 24,
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div style={KICKER_STYLE}>Required outputs</div>
        <div style={{ display: 'grid', gap: 16 }}>
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
