import { PDF_FUTURE_VISION } from '@content/assessments/v2/pdf-content';

export function FutureVisionPage() {
  return (
    <article className="pdf-page" data-pdf-page="future-vision">
      <p className="pdf-eyebrow">What good looks like in 90 days</p>
      <h2 className="pdf-h2" style={{ marginTop: '0.2in' }}>
        A working program, not a pilot.
      </h2>
      <p className="pdf-body" style={{ marginTop: '0.2in', fontSize: '10.5pt', maxWidth: '6in' }}>
        These are the conditions an institution-wide AI capability looks like in
        practice — not aspirations, but observable behaviors a regulator or
        auditor could verify.
      </p>

      <ul
        style={{
          marginTop: '0.5in',
          listStyle: 'none',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25in',
        }}
      >
        {PDF_FUTURE_VISION.map((item, idx) => (
          <li
            key={item}
            style={{
              display: 'grid',
              gridTemplateColumns: '0.5in 1fr',
              alignItems: 'baseline',
              borderTop: idx === 0 ? '0.25pt solid var(--color-ink)' : 'none',
              borderBottom: '0.25pt solid var(--color-ink)',
              paddingTop: '0.18in',
              paddingBottom: '0.18in',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '10pt',
                color: 'var(--color-terra)',
                letterSpacing: '0.1em',
              }}
            >
              {String(idx + 1).padStart(2, '0')}
            </span>
            <span className="pdf-body" style={{ fontSize: '12pt' }}>
              {item}
            </span>
          </li>
        ))}
      </ul>

      <div className="pdf-page-footer">
        <span>Page 10</span>
        <span>AI Readiness Briefing</span>
      </div>
    </article>
  );
}
