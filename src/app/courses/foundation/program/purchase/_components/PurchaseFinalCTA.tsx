import type { ReactNode } from 'react';

const INTER_STACK =
  'var(--font-inter, Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif)';

interface PurchaseFinalCTAProps {
  /** The real checkout button — starts Stripe in one click instead of
   *  scrolling back up to the pricing block. */
  enrollButton: ReactNode;
}

export function PurchaseFinalCTA({ enrollButton }: PurchaseFinalCTAProps) {
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
            fontSize: 'clamp(1.5rem, 2.6vw, 2rem)',
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
            fontSize: '0.9375rem',
            color: 'rgba(247, 243, 234, 0.82)',
            lineHeight: 1.55,
            margin: 0,
            maxWidth: '52ch',
          }}
        >
          $295 one-time. Eighteen bite-sized modules, eighteen saved artifacts,
          one reviewed final assessment.
        </p>
      </div>
      <div style={{ minWidth: 220 }}>{enrollButton}</div>
    </section>
  );
}
