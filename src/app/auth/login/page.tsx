'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

import { signIn, sanitizeNext } from '@/lib/supabase/auth';
import { EmailLinkForm, PurchaseRecoveryForm } from '@/components/auth/RecoveryForms';

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
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const h1Style: CSSProperties = {
  fontSize: '2rem',
  fontWeight: 700,
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  color: 'var(--ink)',
  margin: '6px 0 0',
};

const labelStyle: CSSProperties = {
  fontSize: '0.75rem',
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
  fontSize: '0.9375rem',
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
  fontSize: '0.8125rem',
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
  fontSize: '0.875rem',
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
  fontSize: '0.875rem',
  color: 'var(--slate-600)',
  margin: 0,
};

function Field({
  label,
  trailing,
  id,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; trailing?: ReactNode }) {
  // The id is decoupled from name so multiple forms on one page (sign-in
  // link, password sign-in, purchase recovery) can each carry name="email"
  // without colliding on a shared id (WCAG 4.1.1). Falls back to name when
  // an explicit id is not supplied.
  const fieldId = id ?? rest.name;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <label htmlFor={fieldId} style={labelStyle}>
          {label}
        </label>
        {trailing}
      </div>
      <input id={fieldId} style={inputStyle} {...rest} />
    </div>
  );
}

// Dev convenience: a one-click bypass that works only when NODE_ENV !==
// 'production'. The dashboard's preview-auth-bypass handles the same case
// in deployed previews; this just saves a click during local development.
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

function Divider({ label }: { readonly label: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: 12,
        alignItems: 'center',
        margin: '18px 0',
        color: 'var(--slate-500)',
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
      }}
    >
      <span style={{ height: 1, background: 'var(--slate-200)' }} />
      <span>{label}</span>
      <span style={{ height: 1, background: 'var(--slate-200)' }} />
    </div>
  );
}

// ── Password form ───────────────────────────────────────────────────────────

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
    if (result.error) {
      setPending(false);
      setError(result.error);
      return;
    }

    // Password verified — now route based on whether this browser is a
    // trusted device for this user. /api/auth/check-device returns
    // { trusted, dest } where dest is either the requested redirectTo
    // or /auth/confirm-device-pending (and a confirmation email has
    // already been fired). See #187 PR 2.
    try {
      const res = await fetch('/api/auth/check-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirectTo }),
      });
      const json = (await res.json().catch(() => ({}))) as { dest?: string };
      const dest = typeof json.dest === 'string' ? json.dest : redirectTo;
      router.push(dest);
      router.refresh();
    } catch {
      // If the trust check itself fails, fall back to the requested
      // destination — better UX than locking the user out on a
      // transient API error. Trust will be enforced at the layout level
      // for protected surfaces in a follow-up, so failing-open here is
      // not a security regression.
      router.push(redirectTo);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div role="alert" style={{ ...alertStyle, marginBottom: 14 }}>
          {error}
        </div>
      )}
      <Field
        id="login-email"
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@yourbank.com"
        defaultValue={prefillEmail}
      />
      <Field
        id="login-password"
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
        trailing={
          <Link href="/auth/forgot-password" style={{ ...linkStyle, fontSize: '0.75rem' }}>
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
              ? 'The link is invalid or has expired. Request a new sign-in link below, or use your password.'
              : urlError === 'not_configured'
                ? 'Authentication is not yet configured.'
                : urlError}
          </div>
        )}

        <EmailLinkForm redirectTo={redirectTo} prefillEmail={prefillEmail} />

        <Divider label="or use password" />

        <PasswordForm redirectTo={redirectTo} prefillEmail={prefillEmail} />

        <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--slate-200)' }}>
          <PurchaseRecoveryForm prefillEmail={prefillEmail} />
        </div>

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
