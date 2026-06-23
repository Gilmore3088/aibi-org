import type { PrintPack } from '../_content/print-pack';

interface GapDetailProps {
  readonly pack: PrintPack;
  readonly dimensionId: string;
  readonly score: number;
  readonly maxScore: number;
  readonly pageNumber: number;
}

export function GapDetail({ pack, dimensionId, score, maxScore, pageNumber }: GapDetailProps) {
  const content = pack.GAP_CONTENT[dimensionId];
  const label = pack.DIMENSION_LABELS[dimensionId];

  return (
    <article className="pdf-page" data-pdf-page={`gap-${dimensionId}`}>
      <p className="pdf-eyebrow" style={{ color: '#9b2226' }}>
        Critical gap
      </p>

      <div style={{ marginTop: '0.2in', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 className="pdf-h2" style={{ margin: 0 }}>
          {label}
        </h2>
        <span
          style={{
            fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
            fontVariantNumeric: 'tabular-nums',
            fontSize: '11pt',
            color: 'var(--slate-600)',
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
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '9pt',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
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
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '9pt',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
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
