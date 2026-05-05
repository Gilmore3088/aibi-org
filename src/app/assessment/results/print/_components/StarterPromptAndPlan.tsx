import { STARTER_PROMPTS, SEVEN_DAY_PLAN } from '@content/assessments/v2/personalization';
import type { Dimension } from '@content/assessments/v2/types';

interface StarterPromptAndPlanProps {
  readonly focusGapId: Dimension;
}

export function StarterPromptAndPlan({ focusGapId }: StarterPromptAndPlanProps) {
  const prompt = STARTER_PROMPTS[focusGapId];

  return (
    <>
      {/* Page 8 — Starter Prompt */}
      <article className="pdf-page" data-pdf-page="starter-prompt">
        <p className="pdf-eyebrow">Starter prompt</p>
        <h2 className="pdf-h2" style={{ marginTop: '0.2in' }}>
          Copy it. Run it. Refine it.
        </h2>
        <p className="pdf-body" style={{ marginTop: '0.2in', fontSize: '10.5pt', maxWidth: '6in' }}>
          Take this prompt to the AI tool your institution already trusts. Run it on a real workflow this week. Bring back what worked and what did not.
        </p>

        <pre
          style={{
            marginTop: '0.4in',
            background: 'var(--color-parch)',
            border: '0.5pt solid var(--color-ink)',
            padding: '0.3in',
            fontFamily: 'var(--font-mono)',
            fontSize: '9.5pt',
            lineHeight: 1.5,
            color: 'var(--color-ink)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {prompt.prompt}
        </pre>

        <div className="pdf-page-footer">
          <span>Page 8</span>
          <span>AI Readiness Briefing</span>
        </div>
      </article>

      {/* Page 9 — 7-Day Plan */}
      <article className="pdf-page" data-pdf-page="seven-day-plan">
        <p className="pdf-eyebrow">Your 7-day AI activation plan</p>
        <h2 className="pdf-h2" style={{ marginTop: '0.2in' }}>
          What to do this week.
        </h2>

        <ol
          style={{
            marginTop: '0.4in',
            borderLeft: '2pt solid var(--color-terra)',
            paddingLeft: '0.4in',
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25in',
          }}
        >
          {SEVEN_DAY_PLAN.map(({ day, action }) => (
            <li key={day} style={{ position: 'relative' }}>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9pt',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--color-terra)',
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                Day {day}
              </p>
              <p className="pdf-body" style={{ marginTop: '0.05in', fontSize: '11pt' }}>
                {action}
              </p>
            </li>
          ))}
        </ol>

        <div className="pdf-page-footer">
          <span>Page 9</span>
          <span>AI Readiness Briefing</span>
        </div>
      </article>
    </>
  );
}
