import { PDF_FOOTER_CLOSE } from '@content/assessments/v2/pdf-content';

export function BackCover() {
  return (
    <article
      className="pdf-page"
      data-pdf-page="back-cover"
      style={{
        background: 'var(--color-ink)',
        color: 'var(--color-linen)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <p
          className="pdf-eyebrow"
          style={{ color: 'var(--color-terra-light)' }}
        >
          The AI Banking Institute
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9pt',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--color-linen)',
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
            color: 'var(--color-linen)',
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
            color: 'var(--color-linen)',
            opacity: 0.85,
          }}
        >
          {PDF_FOOTER_CLOSE.body}
        </p>
      </div>

      <div
        style={{
          borderTop: '0.5pt solid var(--color-linen)',
          paddingTop: '0.2in',
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: '8.5pt',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--color-linen)',
          opacity: 0.7,
        }}
      >
        <span>aibankinginstitute.com</span>
        <span>© The AI Banking Institute</span>
      </div>
    </article>
  );
}
