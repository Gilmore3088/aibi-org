// MiniTutorialList — renders a list of step-by-step platform tutorials.
//
// Server Component, pure presentation. Used in the Practice tab of
// modules 3 (first AI tries) and 7 (skill anatomy) to surface the
// curated M3_TUTORIALS and M7_TUTORIALS arrays from prompt-library.ts.
//
// Mockup chrome: cream surface, ink type, gold-deep eyebrows, slate
// metadata. Each tutorial leads with its artifact — the prompt the
// learner will run.

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

const fontStack = 'Inter, ui-sans-serif, system-ui, sans-serif';

const eyebrow: React.CSSProperties = {
  fontFamily: fontStack,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.20em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
};

const metaLabel: React.CSSProperties = {
  fontFamily: fontStack,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
};

export function MiniTutorialList({
  tutorials,
  heading = 'Platform tutorials',
  intro,
}: MiniTutorialListProps) {
  if (tutorials.length === 0) return null;

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <span style={{ ...eyebrow, color: 'var(--slate-500)' }}>Step-by-step</span>
        <span style={{ flex: 1, height: 1, background: 'var(--ink-a10)' }} />
      </div>

      <h3
        style={{
          fontFamily: fontStack,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
          margin: '0 0 10px',
        }}
      >
        {heading}
      </h3>

      {intro && (
        <p
          style={{
            fontFamily: fontStack,
            color: 'var(--slate-600)',
            fontSize: 17,
            lineHeight: 1.6,
            margin: '0 0 24px',
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
              border: '1px solid var(--ink-a10)',
              borderRadius: 16,
              background: 'var(--cream)',
              boxShadow: 'var(--shadow-soft)',
              padding: 0,
              overflow: 'hidden',
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                padding: '16px 20px',
                fontFamily: fontStack,
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--ink)',
                listStyle: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  ...metaLabel,
                  padding: '4px 10px',
                  background: 'var(--cream-2)',
                  border: '1px solid var(--ink-a10)',
                  borderRadius: 999,
                  color: 'var(--slate-600)',
                }}
              >
                {PLATFORM_LABEL[tutorial.platform] ?? tutorial.platform}
              </span>
              <span style={{ flex: 1 }}>{tutorial.title}</span>
              <span style={metaLabel}>{tutorial.timeEstimate}</span>
            </summary>

            <div
              style={{
                padding: '0 22px 22px',
                borderTop: '1px solid var(--ink-a10)',
              }}
            >
              <p
                style={{
                  fontFamily: fontStack,
                  color: 'var(--ink)',
                  fontSize: 16,
                  lineHeight: 1.65,
                  margin: '18px 0 22px',
                }}
              >
                {tutorial.introduction}
              </p>

              <ol style={{ paddingLeft: 20, margin: '0 0 22px' }}>
                {tutorial.steps.map((step) => (
                  <li
                    key={step.stepNumber}
                    style={{
                      marginBottom: 14,
                      fontFamily: fontStack,
                      fontSize: 16,
                      lineHeight: 1.6,
                      color: 'var(--ink)',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{step.instruction}</div>
                    {step.detail && (
                      <div style={{ marginTop: 4, color: 'var(--slate-600)' }}>
                        {step.detail}
                      </div>
                    )}
                  </li>
                ))}
              </ol>

              <div
                style={{
                  background: 'var(--ink)',
                  border: '1px solid var(--ink)',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    ...eyebrow,
                    color: 'var(--gold-soft)',
                    marginBottom: 10,
                  }}
                >
                  Prompt to use
                </div>
                <pre
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: 'var(--cream)',
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ ...metaLabel, marginBottom: 6 }}>What went well</div>
                  <p
                    style={{
                      fontFamily: fontStack,
                      fontSize: 16,
                      lineHeight: 1.6,
                      color: 'var(--ink)',
                      margin: 0,
                    }}
                  >
                    {tutorial.whatWentWell}
                  </p>
                </div>
                <div>
                  <div style={{ ...metaLabel, marginBottom: 6 }}>What to watch for</div>
                  <p
                    style={{
                      fontFamily: fontStack,
                      fontSize: 16,
                      lineHeight: 1.6,
                      color: 'var(--ink)',
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
