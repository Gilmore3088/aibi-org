import type { Tier } from '@content/assessments/v2/scoring';
import { PDF_NEXT_STEPS_TRIO, PDF_RECOMMENDED_PATH_INTRO } from '@content/assessments/v2/pdf-content';

interface NextStepsTrioProps {
  readonly tierId: Tier['id'];
}

export function NextStepsTrio({ tierId }: NextStepsTrioProps) {
  const intro = PDF_RECOMMENDED_PATH_INTRO[tierId];

  return (
    <article className="pdf-page" data-pdf-page="next-steps">
      <p className="pdf-eyebrow">Recommended path</p>
      <h2 className="pdf-h2" style={{ marginTop: '0.2in' }}>
        Three moves, in order.
      </h2>
      <p className="pdf-body" style={{ marginTop: '0.2in', fontSize: '10.5pt', maxWidth: '6in' }}>
        {intro}
      </p>

      <div
        style={{
          marginTop: '0.4in',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25in',
        }}
      >
        {PDF_NEXT_STEPS_TRIO.map((step) => (
          <div
            key={step.number}
            style={{
              display: 'grid',
              gridTemplateColumns: '0.7in 1fr',
              gap: '0.25in',
              borderTop: '0.25pt solid var(--color-ink)',
              paddingTop: '0.2in',
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: '20pt',
                  color: 'var(--color-terra)',
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {step.number}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-serif-sc)',
                  fontSize: '8pt',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--color-slate)',
                  marginTop: '0.1in',
                }}
              >
                {step.category}
              </p>
            </div>
            <div>
              <h3 className="pdf-body" style={{ fontSize: '14pt', fontFamily: 'var(--font-serif)', margin: 0 }}>
                {step.title}
              </h3>
              <p className="pdf-body" style={{ marginTop: '0.1in', fontSize: '10.5pt' }}>
                {step.body}
              </p>
              <ul style={{ marginTop: '0.12in', paddingLeft: '0.25in' }}>
                {step.bullets.map((b) => (
                  <li key={b} className="pdf-body" style={{ fontSize: '10pt', marginBottom: '0.04in' }}>
                    {b}
                  </li>
                ))}
              </ul>
              <p
                className="pdf-body"
                style={{
                  marginTop: '0.15in',
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: '10pt',
                  color: 'var(--color-terra)',
                }}
              >
                {step.outcome}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pdf-page-footer">
        <span>Page 11</span>
        <span>AI Readiness Briefing</span>
      </div>
    </article>
  );
}
