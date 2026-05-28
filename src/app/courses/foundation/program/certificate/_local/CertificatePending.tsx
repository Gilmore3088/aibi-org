// "Your credential is being generated" empty state shown when the
// submission is approved but the certificate row has not appeared yet.

import { INTER_STACK } from './certificateStyles';

export function CertificatePending() {
  return (
    <div
      style={{
        textAlign: 'center',
        background: 'var(--cream)',
        border: '1px solid var(--ink-a10)',
        borderRadius: 'var(--r-xl)',
        padding: '56px 32px',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          background: 'var(--gold-a20)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}
        aria-hidden
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ width: 32, height: 32, color: 'var(--gold-deep)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2
        style={{
          fontFamily: INTER_STACK,
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--ink)',
          letterSpacing: '-0.01em',
          margin: '0 0 12px',
        }}
      >
        Your credential is being generated
      </h2>
      <p
        style={{
          fontFamily: INTER_STACK,
          fontSize: 14,
          lineHeight: 1.6,
          color: 'var(--slate-600)',
          maxWidth: 460,
          margin: '0 auto 28px',
        }}
      >
        Your submission has been reviewed and approved. The credential will appear here
        shortly. Refresh this page in a moment.
      </p>
      <a
        href="/courses/foundation/program/certificate"
        style={{
          display: 'inline-block',
          background: 'var(--ink)',
          color: '#FFFFFF',
          fontFamily: INTER_STACK,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '12px 24px',
          borderRadius: 'var(--r-md)',
          textDecoration: 'none',
        }}
      >
        Refresh Page
      </a>
    </div>
  );
}
