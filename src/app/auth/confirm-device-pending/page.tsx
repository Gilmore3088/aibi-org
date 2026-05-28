'use client';

import { type CSSProperties } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Holding state for the new-device sign-in confirmation flow (#187 PR 2).
// /auth/login routes here after a successful password sign-in from a
// device whose aibi-trusted-device cookie is missing or expired.
// The email is fired by /api/auth/check-device; this page only renders
// the wait state. The user finishes the flow by clicking the link in
// the email, which lands on /auth/confirm-device.

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: 480,
  background: '#fff',
  borderRadius: 24,
  border: '1px solid var(--slate-200)',
  boxShadow: 'var(--shadow-feature)',
  padding: 36,
  textAlign: 'center',
};

const eyebrowStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const h1Style: CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  lineHeight: 1.15,
  letterSpacing: '-0.02em',
  color: 'var(--ink)',
  margin: '8px 0 16px',
};

const bodyStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.55,
  color: 'var(--slate-600)',
  margin: '0 0 16px',
};

const linkStyle: CSSProperties = {
  color: 'var(--gold-deep)',
  fontWeight: 600,
  textDecoration: 'underline',
  textUnderlineOffset: 3,
};

const stampStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  margin: '24px 0 0',
};

export default function ConfirmDevicePendingPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? 'your inbox';

  return (
    <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={cardStyle}>
        <p style={eyebrowStyle}>Confirm sign-in</p>
        <h1 style={h1Style}>Check your email.</h1>
        <p style={bodyStyle}>
          We sent a one-time confirmation link to{' '}
          <strong style={{ color: 'var(--ink)' }}>{email}</strong>. Open it from this same browser
          to finish signing in.
        </p>
        <p style={bodyStyle}>
          We only ask for this on devices we have not seen before. After this confirmation, this
          browser will recognize you for the next 90 days.
        </p>
        <p style={stampStyle}>Link expires in 10 minutes · check spam if it does not arrive</p>
      </div>

      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--slate-600)', margin: 0 }}>
        Wrong email?{' '}
        <Link href="/auth/login" style={linkStyle}>
          Sign in again
        </Link>
      </p>
    </div>
  );
}
