import type { Tier } from '@content/assessments/v2/scoring';
import { FINANCIAL_IMPLICATIONS } from '@content/assessments/v2/personalization';

interface LensedImplicationsProps {
  readonly tierId: Tier['id'];
}

export function LensedImplications({ tierId }: LensedImplicationsProps) {
  const impl = FINANCIAL_IMPLICATIONS[tierId];

  const lenses: ReadonlyArray<{ readonly label: string; readonly body: string }> = [
    { label: 'Operational efficiency', body: impl.operational },
    { label: 'Risk management', body: impl.risk },
    { label: 'Cost & dependency', body: impl.cost },
  ];

  return (
    <article className="pdf-page" data-pdf-page="implications">
      <p className="pdf-eyebrow">Implications for financial professionals</p>
      <h2 className="pdf-h2" style={{ marginTop: '0.2in' }}>
        In operating terms.
      </h2>

      <div style={{ marginTop: '0.4in', display: 'flex', flexDirection: 'column', gap: '0.4in' }}>
        {lenses.map((lens) => (
          <div
            key={lens.label}
            style={{
              borderLeft: '2pt solid var(--color-terra)',
              paddingLeft: '0.3in',
              paddingTop: '0.1in',
              paddingBottom: '0.1in',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-serif-sc)',
                fontSize: '10pt',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--color-terra)',
                margin: 0,
              }}
            >
              {lens.label}
            </p>
            <p
              className="pdf-body"
              style={{ marginTop: '0.1in', fontSize: '11pt', maxWidth: '6in' }}
            >
              {lens.body}
            </p>
          </div>
        ))}
      </div>

      <div className="pdf-page-footer">
        <span>Page 3</span>
        <span>AI Readiness Briefing</span>
      </div>
    </article>
  );
}
