import { SCORE_AUTHORITY } from '@content/assessments/v2/scoring-authority';

export function MethodologyPage() {
  return (
    <article className="pdf-page" data-pdf-page="methodology">
      <p className="pdf-eyebrow">Notes on methodology</p>

      <h2 className="pdf-h2" style={{ marginTop: '0.25in' }}>
        About this readiness score.
      </h2>

      <p className="pdf-body" style={{ marginTop: '0.3in', fontSize: '11pt', maxWidth: '5.5in' }}>
        {SCORE_AUTHORITY.scaleMeaning}
      </p>

      <p className="pdf-body" style={{ marginTop: '0.25in', fontSize: '11pt', maxWidth: '5.5in' }}>
        {SCORE_AUTHORITY.thresholdLogic}
      </p>

      <p
        style={{
          marginTop: '0.4in',
          fontFamily: 'var(--font-serif-sc)',
          fontSize: '9pt',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--color-ink)',
          opacity: 0.65,
        }}
      >
        What this score does not claim
      </p>

      <ul style={{ margin: '0.2in 0 0 0', paddingLeft: '0.2in', listStyle: 'disc', maxWidth: '5.5in' }}>
        {SCORE_AUTHORITY.whatItDoesNotClaim.map((claim, i) => (
          <li
            key={i}
            className="pdf-body"
            style={{ fontSize: '10.5pt', marginTop: i === 0 ? 0 : '0.12in' }}
          >
            {claim}
          </li>
        ))}
      </ul>

      <div className="pdf-page-footer">
        <span>Notes</span>
        <span>AI Readiness Briefing</span>
      </div>
    </article>
  );
}
