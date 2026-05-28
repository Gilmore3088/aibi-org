// Closing CTA for the purchase page — single paragraph + anchor back
// to #enroll. (Distinct from the legacy FinalCTA.tsx in this folder,
// which is no longer wired up but kept on disk per the 2026-05-27 audit.)

import Link from 'next/link';
import { INTER_STACK } from './purchaseConstants';

export function PurchaseFinalCTA() {
  return (
    <section
      style={{
        marginTop: 56,
        background: 'var(--ink)',
        color: 'var(--cream-2)',
        padding: '40px 44px',
        borderRadius: 28,
        boxShadow: 'var(--shadow-hero)',
        display: 'grid',
        gridTemplateColumns: '1.4fr auto',
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
          $295 one-time. Lifetime access. Twelve modules, four required artifacts,
          one reviewed final assessment.
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
