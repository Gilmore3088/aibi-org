import Link from 'next/link';

const INTER_STACK =
  'var(--font-inter, Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif)';

export function PurchaseFinalCTA() {
  return (
    <section
      className="aibi-grid aibi-grid--cta aibi-pad-section"
      style={{
        marginTop: 56,
        background: 'var(--ink)',
        color: 'var(--cream-2)',
        padding: '40px 44px',
        borderRadius: 28,
        boxShadow: 'var(--shadow-hero)',
        gap: 28,
        alignItems: 'center',
      }}
    >
      <div>
        <h2
          style={{
            fontFamily: INTER_STACK,
            fontWeight: 700,
            fontSize: 'clamp(24px, 2.6vw, 32px)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            margin: '0 0 10px',
            color: '#fff',
          }}
        >
          Earn the AiBI-Foundation credential.
        </h2>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 15,
            color: 'rgba(247, 243, 234, 0.82)',
            lineHeight: 1.55,
            margin: 0,
            maxWidth: '52ch',
          }}
        >
          $295 one-time. Lifetime access. Twelve modules, four required
          artifacts, one reviewed final assessment.
        </p>
      </div>
      <Link
        href="#enroll"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--gold)',
          color: 'var(--ink)',
          padding: '14px 26px',
          borderRadius: 12,
          fontFamily: INTER_STACK,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Enroll now →
      </Link>
    </section>
  );
}
