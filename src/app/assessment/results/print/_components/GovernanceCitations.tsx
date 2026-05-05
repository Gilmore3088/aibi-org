import { PDF_REGULATORY_CITATIONS } from '@content/assessments/v2/pdf-content';

export function GovernanceCitations() {
  return (
    <article className="pdf-page" data-pdf-page="governance">
      <p className="pdf-eyebrow">Governance &amp; citations</p>
      <h2 className="pdf-h2" style={{ marginTop: '0.2in' }}>
        The regulatory ground beneath this work.
      </h2>
      <p className="pdf-body" style={{ marginTop: '0.2in', fontSize: '10.5pt', maxWidth: '6in' }}>
        Every recommendation in this briefing is aligned with the named guidance below. No claims
        are made beyond what these documents support.
      </p>

      <dl
        style={{
          marginTop: '0.4in',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3in',
          margin: 0,
        }}
      >
        {PDF_REGULATORY_CITATIONS.map((cite) => (
          <div
            key={cite.source}
            style={{
              borderTop: '0.25pt solid var(--color-ink)',
              paddingTop: '0.18in',
            }}
          >
            <dt
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11.5pt',
                color: 'var(--color-ink)',
                margin: 0,
              }}
            >
              {cite.source}
            </dt>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '8.5pt',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-slate)',
                marginTop: '0.05in',
              }}
            >
              {cite.year}
            </p>
            <dd className="pdf-body" style={{ marginTop: '0.1in', fontSize: '10pt', margin: 0 }}>
              {cite.relevance}
            </dd>
          </div>
        ))}
      </dl>

      <div className="pdf-page-footer">
        <span>Page 12</span>
        <span>AI Readiness Briefing</span>
      </div>
    </article>
  );
}
