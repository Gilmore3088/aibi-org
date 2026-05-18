import type { Tier } from '@content/assessments/v2/scoring';
import {
  PDF_NEXT_STEPS_TRIO,
  PDF_RECOMMENDED_PATH_INTRO,
  type PdfNextStep,
} from '@content/assessments/v2/pdf-content';

interface NextStepsTrioProps {
  readonly tierId: Tier['id'];
}

const RANK_STYLES: Record<
  PdfNextStep['rank'],
  { readonly border: string; readonly numberColor: string; readonly accent: string }
> = {
  primary: {
    border: '1.25pt solid var(--color-terra)',
    numberColor: 'var(--color-terra)',
    accent: 'var(--color-terra)',
  },
  secondary: {
    border: '0.5pt solid var(--color-ink)',
    numberColor: 'var(--color-ink)',
    accent: 'var(--color-ink)',
  },
  tertiary: {
    border: '0.25pt solid var(--color-slate)',
    numberColor: 'var(--color-slate)',
    accent: 'var(--color-slate)',
  },
};

export function NextStepsTrio({ tierId }: NextStepsTrioProps) {
  const intro = PDF_RECOMMENDED_PATH_INTRO[tierId];
  const steps = PDF_NEXT_STEPS_TRIO[tierId];

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
        {steps.map((step) => {
          const rankStyle = RANK_STYLES[step.rank];
          const isPrimary = step.rank === 'primary';
          return (
            <div
              key={step.number}
              style={{
                display: 'grid',
                gridTemplateColumns: '0.7in 1fr',
                gap: '0.25in',
                borderTop: rankStyle.border,
                paddingTop: '0.2in',
                paddingLeft: isPrimary ? '0.1in' : 0,
                paddingRight: isPrimary ? '0.1in' : 0,
                paddingBottom: isPrimary ? '0.15in' : 0,
                background: isPrimary ? 'var(--color-parch)' : 'transparent',
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: '20pt',
                    color: rankStyle.numberColor,
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
                {isPrimary ? (
                  <p
                    style={{
                      fontFamily: 'var(--font-serif-sc)',
                      fontSize: '7.5pt',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'var(--color-terra)',
                      marginTop: '0.08in',
                    }}
                  >
                    Recommended
                  </p>
                ) : null}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.18in', flexWrap: 'wrap' }}>
                  <h3
                    className="pdf-body"
                    style={{
                      fontSize: isPrimary ? '15pt' : '13pt',
                      fontFamily: 'var(--font-serif)',
                      margin: 0,
                    }}
                  >
                    {step.title}
                  </h3>
                  {step.price ? (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontVariantNumeric: 'tabular-nums',
                        fontSize: '9pt',
                        color: 'var(--color-slate)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {step.price}
                    </span>
                  ) : null}
                </div>
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
                    color: rankStyle.accent,
                  }}
                >
                  {step.outcome}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pdf-page-footer">
        <span>Page 12</span>
        <span>AI Readiness Briefing</span>
      </div>
    </article>
  );
}
