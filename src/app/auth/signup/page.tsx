'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { signUp, sanitizeNext } from '@/lib/supabase/auth';

const MIN_PASSWORD_LENGTH = 8;

// Lenient email-shaped check just to avoid pre-filling random garbage from
// a crafted URL. The form's own type="email" validation is the real gate.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Shared inline styles (mockup tokens) ─────────────────────────────────────

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

export default function SignupPage() {
  const searchParams = useSearchParams();
  // Same open-redirect defense as /auth/login.
  const redirectTo = sanitizeNext(searchParams.get('next'));
  // Pre-fill from ?email= so post-Stripe buyers don't re-type the email
  // they just used at checkout. Keeps the field editable in case Stripe had
  // a stale address.
  const rawEmail = searchParams.get('email');
  const prefillEmail = rawEmail && EMAIL_RE.test(rawEmail) ? rawEmail : '';

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const confirmPassword = data.get('confirmPassword') as string;
    const fullName = data.get('fullName') as string;
    const institutionName = data.get('institutionName') as string;
    const terms = data.get('terms');

    if (!terms) {
      setError('You must accept the terms to create an account.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setPending(true);
    // Pass the deep-link target through so the confirmation email lands
    // the user back on the page they tried to reach (e.g. /assessment/
    // in-depth/take) rather than the generic /dashboard.
    const result = await signUp(
      email,
      password,
      {
        fullName: fullName.trim(),
        institutionName: institutionName.trim() || undefined,
      },
      redirectTo,
    );
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={eyebrowStyle}>Account created</p>
          <h1 style={h1Style}>Check your inbox.</h1>
        </div>
        <div style={cardStyle}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: 'var(--ink)', textAlign: 'center' }}>
            We sent a confirmation link to your email. Click it to activate your account.
          </p>
          <p
            style={{
              margin: '12px 0 0',
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            The link expires in 24 hours · check spam if you don&apos;t see it
          </p>
        </div>
        <p style={footerStyle}>
          Already confirmed?{' '}
          <Link href="/auth/login" style={linkStyle}>
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={eyebrowStyle}>Create account</p>
        <h1 style={h1Style}>Start here.</h1>
      </div>

      <div style={cardStyle}>
        {error && (
          <div role="alert" style={{ ...alertStyle, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Field
            label="Full name"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="Jane Doe"
          />
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@yourbank.com"
            defaultValue={prefillEmail}
          />
          <Field
            label={
              <>
                Institution{' '}
                <span style={{ fontWeight: 400, color: 'var(--slate-500)', textTransform: 'none', letterSpacing: 0 }}>
                  (optional)
                </span>
              </>
            }
            name="institutionName"
            type="text"
            autoComplete="organization"
            placeholder="First Community Bank"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            placeholder={`${MIN_PASSWORD_LENGTH}+ characters`}
          />
          <Field
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
          />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingTop: 4, marginBottom: 16 }}>
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              style={{
                marginTop: 3,
                width: 14,
                height: 14,
                accentColor: 'var(--gold)',
                flexShrink: 0,
              }}
            />
            <label htmlFor="terms" style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--slate-600)' }}>
              I agree to the{' '}
              <Link href="/terms" style={linkStyle}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" style={linkStyle}>
                Privacy Policy
              </Link>
            </label>
          </div>

          <button type="submit" style={primaryBtnStyle} disabled={pending}>
            {pending ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>

      <p style={footerStyle}>
        Already have an account?{' '}
        <Link
          href={`/auth/login${redirectTo !== '/dashboard' ? `?next=${encodeURIComponent(redirectTo)}` : ''}`}
          style={linkStyle}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
