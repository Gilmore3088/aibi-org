// ArtifactBody — renders the artifact content itself as the page hero.
// Pulls the source practice rep so the page can show the prompt/output that
// the artifact represents — not just a download link to it.

import type { Artifact, PracticeRep } from '@/types/lms';

interface ArtifactBodyProps {
  readonly artifact: Artifact;
  readonly source?: PracticeRep;
}

const MONO_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

export function ArtifactBody({ artifact, source }: ArtifactBodyProps) {
  return (
    <article
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--ink-a10)',
        borderRadius: 28,
        boxShadow: 'var(--shadow-feature)',
        padding: 'clamp(28px, 4vw, 56px)',
      }}
    >
      <ContentLabel>The artifact</ContentLabel>

      {source ? (
        <>
          <FieldGroup label="Scenario">
            <p style={paragraphStyle}>{source.scenario}</p>
          </FieldGroup>

          <FieldGroup label="Prompt">
            <pre style={monoBlockStyle}>{source.starterPrompt}</pre>
          </FieldGroup>

          <FieldGroup label="Model output">
            <p style={paragraphStyle}>{source.modelAnswer}</p>
          </FieldGroup>

          {source.constraints.length > 0 ? (
            <FieldGroup label="Constraints">
              <ul style={listStyle}>
                {source.constraints.map((item) => (
                  <li key={item} style={listItemStyle}>
                    {item}
                  </li>
                ))}
              </ul>
            </FieldGroup>
          ) : null}

          {source.feedback.length > 0 ? (
            <FieldGroup label="Reviewer feedback">
              <ul style={listStyle}>
                {source.feedback.map((item) => (
                  <li key={item} style={listItemStyle}>
                    <span style={feedbackMarkStyle}>·</span> {item}
                  </li>
                ))}
              </ul>
            </FieldGroup>
          ) : null}
        </>
      ) : (
        <FieldGroup label="Summary">
          <p style={paragraphStyle}>{artifact.description}</p>
        </FieldGroup>
      )}
    </article>
  );
}

function FieldGroup({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: 28 }}>
      <p
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--gold-deep)',
          margin: '0 0 10px',
        }}
      >
        {label}
      </p>
      {children}
    </section>
  );
}

function ContentLabel({ children }: { readonly children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'var(--slate-500)',
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

const paragraphStyle: React.CSSProperties = {
  fontSize: '1rem',
  lineHeight: 1.65,
  color: 'var(--ink)',
  margin: 0,
};

const monoBlockStyle: React.CSSProperties = {
  fontFamily: MONO_STACK,
  fontSize: '1rem',
  lineHeight: 1.6,
  color: 'var(--ink)',
  background: 'var(--cream)',
  border: '1px solid var(--ink-a10)',
  borderRadius: 12,
  padding: 18,
  margin: 0,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
};

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const listItemStyle: React.CSSProperties = {
  fontSize: '1rem',
  lineHeight: 1.6,
  color: 'var(--slate-600)',
};

const feedbackMarkStyle: React.CSSProperties = {
  color: 'var(--gold-deep)',
  fontWeight: 700,
  marginRight: 4,
};
