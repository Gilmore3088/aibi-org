'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { resetPassword } from '@/lib/supabase/auth';

// Lenient email-shaped check so a crafted ?email= can't pre-fill garbage.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: 440,
  background: '#fff',
  borderRadius: 24,
  border: '1px solid var(--slate-200)',
  boxShadow: 'var(--shadow-feature)',
  padding: 32,
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
  fontSize: 32,
  fontWeight: 700,
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  color: 'var(--ink)',
  margin: '6px 0 0',
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.02em',
  color: 'var(--slate-600)',
  display: 'block',
  marginBottom: 6,
};

const inputStyle: CSSProperties = {
  width: '100%',
  height: 44,
  padding: '0 14px',
  borderRadius: 12,
  border: '1px solid var(--slate-200)',
  background: '#fff',
  color: 'var(--ink)',
  fontSize: 15,
  fontFamily: 'inherit',
  outline: 'none',
};

const primaryBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  width: '100%',
  height: 48,
  borderRadius: 12,
  background: 'var(--gold)',
  color: 'var(--ink)',
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  marginTop: 4,
};

const alertStyle: CSSProperties = {
  borderRadius: 12,
  border: '1px solid rgba(180, 60, 50, 0.35)',
  background: 'rgba(180, 60, 50, 0.06)',
  color: '#7A1F18',
  padding: '10px 14px',
  fontSize: 14,
  lineHeight: 1.45,
};

const linkStyle: CSSProperties = {
  color: 'var(--gold-deep)',
  fontWeight: 600,
  textDecoration: 'underline',
  textUnderlineOffset: 3,
};

const footerStyle: CSSProperties = {
  textAlign: 'center',
  fontSize: 14,
  color: 'var(--slate-600)',
  margin: 0,
};

function Field({
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label htmlFor={rest.name} style={labelStyle}>
        {label}
      </label>
      <input id={rest.name} style={inputStyle} {...rest} />
    </div>
  );
}

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const rawEmail = searchParams.get('email');
  const prefillEmail = rawEmail && EMAIL_SHAPE.test(rawEmail) ? rawEmail : '';
  const [state, setState] = useState<'idle' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;

    const result = await resetPassword(email);
    setPending(false);

    if (result.error) {
      setError(result.error);
      setState('error');
      return;
    }
    setState('sent');
  }

  return (
    <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={eyebrowStyle}>Reset password</p>
        <h1 style={h1Style}>Forgot your password?</h1>
      </div>

      <div style={cardStyle}>
        {state === 'sent' ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: 'var(--ink)' }}>
              If that address is in our system, a reset link is on its way.
            </p>
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 11,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--slate-500)',
                fontWeight: 600,
              }}
            >
              Check spam if you don&apos;t see it within a few minutes
            </p>
          </div>
        ) : (
          <>
            <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.5, color: 'var(--slate-600)' }}>
              Enter the email address linked to your account and we&apos;ll send a reset link.
            </p>

            {error && (
              <div role="alert" style={{ ...alertStyle, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <Field
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@yourbank.com"
                defaultValue={prefillEmail}
              />
              <button type="submit" style={primaryBtnStyle} disabled={pending}>
                {pending ? 'SENDING…' : 'SEND RESET LINK'}
              </button>
            </form>
          </>
        )}
      </div>

      <p style={footerStyle}>
        Remembered it?{' '}
        <Link href="/auth/login" style={linkStyle}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
