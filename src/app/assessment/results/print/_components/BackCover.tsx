import { PDF_FOOTER_CLOSE } from '@content/assessments/v2/pdf-content';

export function BackCover() {
  return (
    <article
      className="pdf-page"
      data-pdf-page="back-cover"
      style={{
        background: 'var(--ink)',
        color: 'var(--cream)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <p
          className="pdf-eyebrow"
          style={{ color: 'var(--gold-2)' }}
        >
          The AI Banking Institute
        </p>
        <p
          style={{
            fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
            fontSize: '9pt',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--cream)',
            opacity: 0.5,
            marginTop: '0.1in',
          }}
        >
          Turning Bankers into Builders
        </p>
      </div>

      <div style={{ maxWidth: '6in' }}>
        <h2
          className="pdf-h2"
          style={{
            color: 'var(--cream)',
            fontSize: '28pt',
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          {PDF_FOOTER_CLOSE.headline}
        </h2>
        <p
          className="pdf-body"
          style={{
            marginTop: '0.3in',
            fontSize: '12pt',
            color: 'var(--cream)',
            opacity: 0.85,
          }}
        >
          {PDF_FOOTER_CLOSE.body}
        </p>
      </div>

      <div
        style={{
          borderTop: '0.5pt solid var(--cream)',
          paddingTop: '0.2in',
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
          fontSize: '8.5pt',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--cream)',
          opacity: 0.7,
        }}
      >
        <span>aibankinginstitute.com</span>
        <span>© The AI Banking Institute</span>
      </div>
    </article>
  );
}
