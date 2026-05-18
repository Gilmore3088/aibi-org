// MiniTutorialList — renders a list of step-by-step platform tutorials.
//
// Server Component, pure presentation. Used in the Practice tab of
// modules 3 (first AI tries) and 7 (skill anatomy) to surface the
// curated M3_TUTORIALS and M7_TUTORIALS arrays from prompt-library.ts.
//
// Renders each tutorial as an accordion-style <details> block with
// numbered steps, the recommended prompt, and a "what went well /
// what to watch for" reflection.

import type { MiniTutorial } from '@content/courses/foundation-program/prompt-library';

interface MiniTutorialListProps {
  readonly tutorials: readonly MiniTutorial[];
  /** Optional heading override — defaults to "Platform tutorials". */
  readonly heading?: string;
  /** Optional intro paragraph. */
  readonly intro?: string;
}

const PLATFORM_LABEL: Record<string, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  copilot: 'Microsoft Copilot',
  gemini: 'Gemini',
  notebooklm: 'NotebookLM',
  perplexity: 'Perplexity',
};

export function MiniTutorialList({
  tutorials,
  heading = 'Platform tutorials',
  intro,
}: MiniTutorialListProps) {
  if (tutorials.length === 0) return null;

  return (
    <section style={{ marginTop: 32 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--ledger-mono)',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ledger-muted)',
          }}
        >
          Step-by-step
        </span>
        <span style={{ flex: 1, height: 1, background: 'var(--ledger-rule)' }} />
      </div>

      <h3
        style={{
          fontFamily: 'var(--ledger-serif)',
          fontWeight: 500,
          fontSize: 24,
          letterSpacing: '-0.02em',
          margin: '0 0 8px',
          color: 'var(--ledger-ink)',
        }}
      >
        {heading}
      </h3>

      {intro && (
        <p
          style={{
            color: 'var(--ledger-slate)',
            fontSize: 14,
            lineHeight: 1.6,
            margin: '0 0 20px',
            maxWidth: '64ch',
          }}
        >
          {intro}
        </p>
      )}

      <div style={{ display: 'grid', gap: 14 }}>
        {tutorials.map((tutorial) => (
          <details
            key={tutorial.id}
            style={{
              border: '1px solid var(--ledger-rule)',
              borderRadius: 3,
              background: 'var(--ledger-paper)',
              padding: 0,
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                padding: '14px 18px',
                fontFamily: 'var(--ledger-sans)',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--ledger-ink)',
                listStyle: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--ledger-mono)',
                  fontSize: 9.5,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--ledger-muted)',
                  padding: '2px 6px',
                  background: 'var(--ledger-parch)',
                  borderRadius: 2,
                }}
              >
                {PLATFORM_LABEL[tutorial.platform] ?? tutorial.platform}
              </span>
              <span style={{ flex: 1 }}>{tutorial.title}</span>
              <span
                style={{
                  fontFamily: 'var(--ledger-mono)',
                  fontSize: 10,
                  color: 'var(--ledger-muted)',
                }}
              >
                {tutorial.timeEstimate}
              </span>
            </summary>

            <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--ledger-rule)' }}>
              <p
                style={{
                  color: 'var(--ledger-ink-2)',
                  fontSize: 14,
                  lineHeight: 1.65,
                  margin: '16px 0 20px',
                }}
              >
                {tutorial.introduction}
              </p>

              <ol style={{ paddingLeft: 20, margin: '0 0 20px' }}>
                {tutorial.steps.map((step) => (
                  <li
                    key={step.stepNumber}
                    style={{
                      marginBottom: 14,
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: 'var(--ledger-ink-2)',
                    }}
                  >
                    <div style={{ fontWeight: 500, color: 'var(--ledger-ink)' }}>
                      {step.instruction}
                    </div>
                    {step.detail && (
                      <div style={{ marginTop: 4, color: 'var(--ledger-slate)' }}>
                        {step.detail}
                      </div>
                    )}
                  </li>
                ))}
              </ol>

              <div
                style={{
                  background: 'var(--ledger-parch)',
                  border: '1px solid var(--ledger-rule)',
                  borderRadius: 3,
                  padding: 14,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--ledger-mono)',
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--ledger-muted)',
                    marginBottom: 8,
                  }}
                >
                  Prompt to use
                </div>
                <pre
                  style={{
                    fontFamily: 'var(--ledger-mono)',
                    fontSize: 12,
                    lineHeight: 1.55,
                    color: 'var(--ledger-ink)',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                  }}
                >
                  {tutorial.prompt.promptText}
                </pre>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 14,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--ledger-mono)',
                      fontSize: 10,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'var(--ledger-muted)',
                      marginBottom: 6,
                    }}
                  >
                    What went well
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.55,
                      color: 'var(--ledger-ink-2)',
                      margin: 0,
                    }}
                  >
                    {tutorial.whatWentWell}
                  </p>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--ledger-mono)',
                      fontSize: 10,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'var(--ledger-muted)',
                      marginBottom: 6,
                    }}
                  >
                    What to watch for
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.55,
                      color: 'var(--ledger-ink-2)',
                      margin: 0,
                    }}
                  >
                    {tutorial.whatToWatchFor}
                  </p>
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
