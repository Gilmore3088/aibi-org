import { GAP_CONTENT } from '@content/assessments/v2/personalization';
import { DIMENSION_LABELS } from '@content/assessments/v2/types';
import type { Dimension } from '@content/assessments/v2/types';

interface GapDetailProps {
  readonly dimensionId: Dimension;
  readonly score: number;
  readonly maxScore: number;
  readonly pageNumber: number;
}

export function GapDetail({ dimensionId, score, maxScore, pageNumber }: GapDetailProps) {
  const content = GAP_CONTENT[dimensionId];
  const label = DIMENSION_LABELS[dimensionId];

  return (
    <article className="pdf-page" data-pdf-page={`gap-${dimensionId}`}>
      <p className="pdf-eyebrow" style={{ color: 'var(--color-error)' }}>
        Critical gap
      </p>

      <div style={{ marginTop: '0.2in', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 className="pdf-h2" style={{ margin: 0 }}>
          {label}
        </h2>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontVariantNumeric: 'tabular-nums',
            fontSize: '11pt',
            color: 'var(--color-slate)',
          }}
        >
          {score} / {maxScore}
        </span>
      </div>

      <p className="pdf-body" style={{ marginTop: '0.3in', fontSize: '11pt', maxWidth: '6in' }}>
        {content.explanation}
      </p>

      <div style={{ marginTop: '0.4in' }}>
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
          What this leads to
        </p>
        <ul style={{ marginTop: '0.15in', paddingLeft: '0.25in' }}>
          {content.impacts.map((impact) => (
            <li
              key={impact}
              className="pdf-body"
              style={{ fontSize: '10.5pt', marginBottom: '0.08in' }}
            >
              {impact}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '0.3in' }}>
        <p
          style={{
            fontFamily: 'var(--font-serif-sc)',
            fontSize: '9pt',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--color-terra)',
            margin: 0,
          }}
        >
          What good looks like
        </p>
        <ul style={{ marginTop: '0.15in', paddingLeft: '0.25in' }}>
          {content.whatGoodLooksLike.map((item) => (
            <li
              key={item}
              className="pdf-body"
              style={{ fontSize: '10.5pt', marginBottom: '0.08in' }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="pdf-page-footer">
        <span>Page {pageNumber}</span>
        <span>AI Readiness Briefing</span>
      </div>
    </article>
  );
}
