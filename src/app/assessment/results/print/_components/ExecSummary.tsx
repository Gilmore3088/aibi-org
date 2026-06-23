import type { Tier } from '@content/assessments/v2/scoring';
import type { PrintPack } from '../_content/print-pack';

interface ExecSummaryProps {
  readonly pack: PrintPack;
  readonly tier: Tier;
  readonly tierId: Tier['id'];
  readonly score: number;
  readonly maxScore: number;
}

export function ExecSummary({ pack, tier, tierId, score, maxScore }: ExecSummaryProps) {
  const persona = pack.PERSONAS[tierId];
  const impl = pack.FINANCIAL_IMPLICATIONS[tierId];

  return (
    <article className="pdf-page" data-pdf-page="exec-summary">
      <p className="pdf-eyebrow">Executive summary</p>

      <div style={{ marginTop: '0.4in', display: 'flex', alignItems: 'baseline', gap: '0.5in' }}>
        <span
          style={{
            fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
            fontVariantNumeric: 'tabular-nums',
            fontSize: '48pt',
            color: tier.colorVar,
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span style={{ fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: '14pt', color: 'var(--slate-600)' }}>
          / {maxScore}
        </span>
        <span
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '12pt',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: tier.colorVar,
          }}
        >
          {tier.label}
        </span>
      </div>

      <h2 className="pdf-h2" style={{ marginTop: '0.4in' }}>
        {persona.label}.
      </h2>
      <p className="pdf-body" style={{ marginTop: '0.2in', maxWidth: '5in' }}>
        {persona.oneLine}
      </p>

      <div style={{ marginTop: '0.5in', borderTop: '0.5pt solid var(--ink)', paddingTop: '0.3in' }}>
        <p
          className="pdf-eyebrow"
          style={{ color: 'var(--ink)', opacity: 0.6, fontSize: '9pt', marginBottom: '0.2in' }}
        >
          What this means in operating terms
        </p>
        <dl style={{ margin: 0 }}>
          {[
            { label: 'Operations', body: impl.operational.split('.')[0] + '.' },
            { label: 'Risk', body: impl.risk.split('.')[0] + '.' },
            { label: 'Cost', body: impl.cost.split('.')[0] + '.' },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2in 1fr',
                gap: '0.3in',
                padding: '0.15in 0',
                borderBottom: '0.25pt solid var(--ink)',
              }}
            >
              <dt
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: '9pt',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  margin: 0,
                }}
              >
                {row.label}
              </dt>
              <dd className="pdf-body" style={{ margin: 0, fontSize: '10.5pt' }}>
                {row.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="pdf-page-footer">
        <span>Page 2</span>
        <span>AI Readiness Briefing</span>
      </div>
    </article>
  );
}
