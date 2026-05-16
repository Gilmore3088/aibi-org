'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

import { signIn, signInWithMagicLink, sanitizeNext } from '@/lib/supabase/auth';
import {
  LedgerAlert,
  LedgerButton,
  LedgerCard,
  LedgerEyebrow,
  LedgerField,
  LedgerH1,
  LedgerSurface,
  LedgerToggle,
} from '@/components/ledger';

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
      className="ledger-btn ledger-btn--ghost ledger-btn--block"
      style={{ borderStyle: 'dashed' }}
    >
      Dev · Skip Login
    </button>
  );
}

// ── Password form ─────────────────────────────────────────────────────────────

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
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {error && <LedgerAlert variant="error">{error}</LedgerAlert>}
      <LedgerField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@yourbank.com"
        defaultValue={prefillEmail}
      />
      <LedgerField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
        trailing={
          <Link href="/auth/forgot-password" className="ledger-link" style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', borderBottom: 'none' }}>
            Forgot?
          </Link>
        }
      />
      <LedgerButton type="submit" variant="primary" block disabled={pending} style={{ marginTop: 4 }}>
        {pending ? 'Signing in…' : 'Sign In'}
      </LedgerButton>
    </form>
  );
}

// ── Magic link form ───────────────────────────────────────────────────────────

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
        <p style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic', color: 'var(--ink-2)' }}>
          Check your inbox. A sign-in link is on its way.
        </p>
        <p style={{ margin: '8px 0 0', fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          The link expires in 1 hour
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {error && <LedgerAlert variant="error">{error}</LedgerAlert>}
      <LedgerField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@yourbank.com"
        defaultValue={prefillEmail}
      />
      <LedgerButton type="submit" variant="ghost" block disabled={pending} style={{ marginTop: 4 }}>
        {pending ? 'Sending link…' : 'Send Magic Link'}
      </LedgerButton>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
  const prefillEmail =
    rawEmail && EMAIL_RE_LOGIN.test(rawEmail) ? rawEmail : '';

  const [mode, setMode] = useState<'password' | 'magic'>('password');

  return (
    <LedgerSurface>
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <LedgerEyebrow>Sign in</LedgerEyebrow>
          <LedgerH1>Welcome <em>back.</em></LedgerH1>
        </div>

        <LedgerCard variant="strong" className="ledger-auth-card">
          {urlError && (
            <div style={{ marginBottom: 18 }}>
              <LedgerAlert variant="error">
                {urlError === 'missing_code'
                  ? 'The sign-in link is invalid or has expired. Please try again.'
                  : urlError === 'not_configured'
                    ? 'Authentication is not yet configured.'
                    : urlError}
              </LedgerAlert>
            </div>
          )}

          <div style={{ marginBottom: 22 }}>
            <LedgerToggle
              value={mode}
              onChange={setMode}
              ariaLabel="Sign-in method"
              options={[
                { value: 'password', label: 'Password' },
                { value: 'magic', label: 'Magic Link' },
              ]}
            />
          </div>

          {mode === 'password' ? (
            <PasswordForm redirectTo={redirectTo} prefillEmail={prefillEmail} />
          ) : (
            <MagicLinkForm redirectTo={redirectTo} prefillEmail={prefillEmail} />
          )}

          <div style={{ marginTop: 16 }}>
            <DevSkipButton />
          </div>
        </LedgerCard>

        <p style={{ textAlign: 'center', fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink-2)', margin: 0 }}>
          Don&apos;t have an account?{' '}
          <Link
            href={`/auth/signup${redirectTo !== '/dashboard' ? `?next=${encodeURIComponent(redirectTo)}` : ''}`}
            className="ledger-link"
          >
            Create one
          </Link>
        </p>
      </div>
    </LedgerSurface>
  );
}
