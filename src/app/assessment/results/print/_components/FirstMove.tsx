import { RECOMMENDATIONS } from '@content/assessments/v2/personalization';
import { DIMENSION_LABELS } from '@content/assessments/v2/types';
import type { Dimension } from '@content/assessments/v2/types';

interface FirstMoveProps {
  readonly focusGapId: Dimension;
}

export function FirstMove({ focusGapId }: FirstMoveProps) {
  const rec = RECOMMENDATIONS[focusGapId];
  const focusLabel = DIMENSION_LABELS[focusGapId];

  return (
    <article className="pdf-page" data-pdf-page="first-move">
      <p className="pdf-eyebrow">Your first AI move</p>
      <h2 className="pdf-h2" style={{ marginTop: '0.2in' }}>
        Start with {rec.title.toLowerCase()}.
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9pt',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--color-slate)',
          marginTop: '0.15in',
        }}
      >
        Surfaced by your weakest dimension: {focusLabel}
      </p>

      <div
        style={{
          marginTop: '0.4in',
          background: 'var(--color-parch)',
          border: '0.5pt solid var(--color-ink)',
          padding: '0.3in',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-serif-sc)',
            fontSize: '9pt',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--color-ink)',
            opacity: 0.6,
            margin: 0,
          }}
        >
          Why this is the right starting point
        </p>
        <ul style={{ marginTop: '0.15in', paddingLeft: '0.25in' }}>
          {rec.whyRightNow.map((reason) => (
            <li key={reason} className="pdf-body" style={{ fontSize: '10.5pt', marginBottom: '0.08in' }}>
              {reason}
            </li>
          ))}
        </ul>

        <div
          style={{
            marginTop: '0.3in',
            borderLeft: '2pt solid var(--color-ink)',
            paddingLeft: '0.25in',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-serif-sc)',
              fontSize: '9pt',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-ink)',
              opacity: 0.6,
              margin: 0,
            }}
          >
            What this looks like in practice
          </p>
          <p className="pdf-body" style={{ marginTop: '0.1in', fontSize: '10.5pt' }}>
            {rec.inPractice}
          </p>
        </div>

        <div style={{ marginTop: '0.3in' }}>
          <p
            style={{
              fontFamily: 'var(--font-serif-sc)',
              fontSize: '9pt',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-ink)',
              opacity: 0.6,
              margin: 0,
            }}
          >
            Where this works best
          </p>
          <ul style={{ marginTop: '0.15in', paddingLeft: '0.25in', columnCount: 3, columnGap: '0.3in' }}>
            {rec.worksBestFor.map((useCase) => (
              <li key={useCase} className="pdf-body" style={{ fontSize: '10pt', marginBottom: '0.06in' }}>
                {useCase}
              </li>
            ))}
          </ul>
        </div>

        <dl
          style={{
            marginTop: '0.4in',
            paddingTop: '0.2in',
            borderTop: '0.25pt solid var(--color-ink)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.2in',
            margin: 0,
          }}
        >
          {[
            { label: 'Risk', value: rec.riskLevel },
            { label: 'Time saved', value: rec.timeSaved },
            { label: 'Owner', value: rec.owner },
          ].map((item) => (
            <div key={item.label}>
              <dt
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8pt',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--color-slate)',
                  margin: 0,
                }}
              >
                {item.label}
              </dt>
              <dd className="pdf-body" style={{ marginTop: '0.05in', fontSize: '10pt', margin: 0 }}>
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="pdf-page-footer">
        <span>Page 7</span>
        <span>AI Readiness Briefing</span>
      </div>
    </article>
  );
}
