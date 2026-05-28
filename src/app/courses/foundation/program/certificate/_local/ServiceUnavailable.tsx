// Fallback shown when Supabase isn't configured — surfaces a clear
// service-unavailable message instead of crashing the certificate flow.

import { INTER_STACK } from './certificateStyles';

export function ServiceUnavailable() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--cream)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: INTER_STACK,
      }}
    >
      <div style={{ maxWidth: 420, textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: INTER_STACK,
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--ink)',
            margin: '0 0 12px',
            letterSpacing: '-0.01em',
          }}
        >
          Service Unavailable
        </h1>
        <p style={{ color: 'var(--slate-600)', fontSize: 15, margin: 0 }}>
          The certificate service is not configured. Please contact support.
        </p>
      </div>
    </main>
  );
}
