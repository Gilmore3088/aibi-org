'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { sanitizeNext, updatePassword } from '@/lib/supabase/auth';
import { MIN_PASSWORD_LENGTH, PASSWORD_HINT, validatePassword } from '@/lib/auth/password-policy';

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

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = sanitizeNext(searchParams.get('next'));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const data = new FormData(e.currentTarget);
    const password = data.get('password') as string;
    const confirmPassword = data.get('confirmPassword') as string;

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.ok) {
      setError(passwordCheck.error);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setPending(true);
    try {
      const result = await updatePassword(password);

      if (result.error) {
        setError(result.error);
        return;
      }

      const res = await fetch('/api/auth/check-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirectTo }),
      });
      const json = (await res.json().catch(() => ({}))) as { dest?: string };
      router.push(typeof json.dest === 'string' ? json.dest : redirectTo);
      router.refresh();
    } catch {
      router.push(redirectTo);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={eyebrowStyle}>New password</p>
        <h1 style={h1Style}>Pick a strong one.</h1>
      </div>

      <div style={cardStyle}>
        <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.5, color: 'var(--slate-600)' }}>
          Choose a password you don&apos;t use anywhere else. {PASSWORD_HINT}
        </p>

        {error && (
          <div role="alert" style={{ ...alertStyle, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Field
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            placeholder={`${MIN_PASSWORD_LENGTH}+ characters, one number or symbol`}
          />
          <Field
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
          />
          <button type="submit" style={primaryBtnStyle} disabled={pending}>
            {pending ? 'UPDATING…' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>

      <p style={footerStyle}>
        <Link href="/auth/login" style={linkStyle}>
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
