'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

import { signIn, signInWithMagicLink, sanitizeNext } from '@/lib/supabase/auth';

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

const ghostBtnStyle: CSSProperties = {
  ...primaryBtnStyle,
  background: '#fff',
  color: 'var(--ink)',
  border: '1px solid var(--slate-200)',
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
  trailing,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; trailing?: ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <label htmlFor={rest.name} style={labelStyle}>
          {label}
        </label>
        {trailing}
      </div>
      <input id={rest.name} style={inputStyle} {...rest} />
    </div>
  );
}

// ── Dev bypass ───────────────────────────────────────────────────────────────

function DevSkipButton() {
  if (process.env.NODE_ENV !== 'development') return null;
  return (
    <button
      type="button"
      onClick={() => {
        sessionStorage.setItem('aibi-dev-auth', 'true');
        window.location.href = '/dashboard';
      }}
      style={{ ...ghostBtnStyle, borderStyle: 'dashed', marginTop: 12 }}
    >
      Dev · Skip Login
    </button>
  );
}

// ── Password form ────────────────────────────────────────────────────────────

function PasswordForm({ redirectTo, prefillEmail }: { redirectTo: string; prefillEmail: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    const result = await signIn(email, password);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div role="alert" style={{ ...alertStyle, marginBottom: 14 }}>
          {error}
        </div>
      )}
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
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
        trailing={
          <Link href="/auth/forgot-password" style={{ ...linkStyle, fontSize: 12 }}>
            Forgot password
          </Link>
        }
      />
      <button type="submit" style={primaryBtnStyle} disabled={pending}>
        {pending ? 'SIGNING IN…' : 'SIGN IN'}
      </button>
    </form>
  );
}

// ── Magic link form ──────────────────────────────────────────────────────────

function MagicLinkForm({ redirectTo, prefillEmail }: { redirectTo: string; prefillEmail: string }) {
  const [state, setState] = useState<'idle' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;

    const result = await signInWithMagicLink(email, redirectTo);
    setPending(false);

    if (result.error) {
      setError(result.error);
      setState('error');
      return;
    }
    setState('sent');
  }

  if (state === 'sent') {
    return (
      <div style={{ padding: '12px 0', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 16, color: 'var(--ink)', fontWeight: 500 }}>
          Check your inbox. A sign-in link is on its way.
        </p>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--slate-500)',
            fontWeight: 600,
          }}
        >
          The link expires in 1 hour
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div role="alert" style={{ ...alertStyle, marginBottom: 14 }}>
          {error}
        </div>
      )}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@yourbank.com"
        defaultValue={prefillEmail}
      />
      <button type="submit" style={ghostBtnStyle} disabled={pending}>
        {pending ? 'SENDING LINK…' : 'SEND MAGIC LINK'}
      </button>
    </form>
  );
}

// ── Mode toggle ──────────────────────────────────────────────────────────────

function ModeToggle({
  value,
  onChange,
}: {
  value: 'password' | 'magic';
  onChange: (v: 'password' | 'magic') => void;
}) {
  const base: CSSProperties = {
    flex: 1,
    height: 36,
    border: 'none',
    background: 'transparent',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--slate-600)',
    cursor: 'pointer',
    borderRadius: 10,
    fontFamily: 'inherit',
  };
  const active: CSSProperties = { ...base, background: 'var(--ink)', color: '#fff' };
  return (
    <div
      role="tablist"
      aria-label="Sign-in method"
      style={{
        display: 'flex',
        gap: 4,
        padding: 4,
        background: 'var(--cream-2)',
        borderRadius: 12,
        marginBottom: 20,
      }}
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === 'password'}
        style={value === 'password' ? active : base}
        onClick={() => onChange('password')}
      >
        Password
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === 'magic'}
        style={value === 'magic' ? active : base}
        onClick={() => onChange('magic')}
      >
        Magic Link
      </button>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

// Lenient email-shaped check just to avoid pre-filling random garbage from
// a crafted URL. The form's own type="email" validation is the real gate.
const EMAIL_RE_LOGIN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const searchParams = useSearchParams();
  // Normalize ?next= to a same-origin relative path. Open-redirect defense:
  // rejects protocol-relative URLs ("//evil.com"), absolute URLs, and any
  // value with embedded control characters.
  const redirectTo = sanitizeNext(searchParams.get('next'));
  const urlError = searchParams.get('error');
  // Pre-fill from ?email= so post-Stripe buyers don't re-type the email
  // they used at checkout. Keeps the field editable.
  const rawEmail = searchParams.get('email');
  const prefillEmail = rawEmail && EMAIL_RE_LOGIN.test(rawEmail) ? rawEmail : '';

  const [mode, setMode] = useState<'password' | 'magic'>('password');

  return (
    <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={eyebrowStyle}>Sign in</p>
        <h1 style={h1Style}>Welcome back.</h1>
      </div>

      <div style={cardStyle}>
        {urlError && (
          <div role="alert" style={{ ...alertStyle, marginBottom: 16 }}>
            {urlError === 'missing_code'
              ? 'The sign-in link is invalid or has expired. Please try again.'
              : urlError === 'not_configured'
                ? 'Authentication is not yet configured.'
                : urlError}
          </div>
        )}

        <ModeToggle value={mode} onChange={setMode} />

        {mode === 'password' ? (
          <PasswordForm redirectTo={redirectTo} prefillEmail={prefillEmail} />
        ) : (
          <MagicLinkForm redirectTo={redirectTo} prefillEmail={prefillEmail} />
        )}

        <DevSkipButton />
      </div>

      <p style={footerStyle}>
        Don&apos;t have an account?{' '}
        <Link
          href={`/auth/signup${redirectTo !== '/dashboard' ? `?next=${encodeURIComponent(redirectTo)}` : ''}`}
          style={linkStyle}
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
