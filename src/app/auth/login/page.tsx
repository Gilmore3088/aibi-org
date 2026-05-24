'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { startAuthentication } from '@simplewebauthn/browser';

import { signIn, sanitizeNext } from '@/lib/supabase/auth';
import {
  LedgerAlert,
  LedgerButton,
  LedgerCard,
  LedgerEyebrow,
  LedgerField,
  LedgerH1,
  LedgerSurface,
} from '@/components/ledger';

// Sign-in page. Passkey is the primary path; password remains available
// during the migration window for users who haven't enrolled a passkey
// yet. Magic-link auth was removed 2026-05-23 — the
// signInWithMagicLink helper stays in @/lib/supabase/auth for emergency
// account-recovery flows only, not surfaced in the UI.
// See docs/2fa-migration-plan-2026-05-23.md.

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

// ── Passkey sign-in ──────────────────────────────────────────────────────────

function PasskeyForm({
  redirectTo,
  prefillEmail,
}: {
  readonly redirectTo: string;
  readonly prefillEmail: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(prefillEmail);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const beginRes = await fetch('/api/webauthn/signin/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email ? { email } : {}),
      });
      if (!beginRes.ok) {
        const data = (await beginRes.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? 'Could not start sign-in.');
      }
      const options = await beginRes.json();
      const assertion = await startAuthentication({ optionsJSON: options });
      const completeRes = await fetch('/api/webauthn/signin/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: assertion }),
      });
      if (!completeRes.ok) {
        const data = (await completeRes.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? 'Sign-in failed.');
      }
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setPending(false);
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      {error && <LedgerAlert variant="error">{error}</LedgerAlert>}
      <LedgerField
        label="Email (optional)"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@yourbank.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <LedgerButton
        type="submit"
        variant="primary"
        block
        disabled={pending}
        style={{ marginTop: 4 }}
      >
        {pending ? 'Waiting for your device…' : 'Sign in with passkey'}
      </LedgerButton>
      <p
        style={{
          margin: '10px 0 0',
          fontFamily: 'var(--mono)',
          fontSize: 10.5,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          textAlign: 'center',
        }}
      >
        Touch&nbsp;ID · Face&nbsp;ID · Windows&nbsp;Hello · security key
      </p>
    </form>
  );
}

// ── Password fallback (migration window only) ────────────────────────────────

function PasswordForm({
  redirectTo,
  prefillEmail,
}: {
  redirectTo: string;
  prefillEmail: string;
}) {
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
    // After password sign-in, push to passkey enrollment so they don't
    // have to come back. Passkey-enrolled users won't see this branch
    // — they signed in via PasskeyForm above.
    router.push(`/auth/passkey/enroll?next=${encodeURIComponent(redirectTo)}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
    >
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
          <Link
            href="/auth/forgot-password"
            className="ledger-link"
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 9.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              borderBottom: 'none',
            }}
          >
            Forgot password
          </Link>
        }
      />
      <LedgerButton
        type="submit"
        variant="ghost"
        block
        disabled={pending}
        style={{ marginTop: 4 }}
      >
        {pending ? 'Signing in…' : 'Sign in with password'}
      </LedgerButton>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const EMAIL_RE_LOGIN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = sanitizeNext(searchParams.get('next'));
  const urlError = searchParams.get('error');
  const rawEmail = searchParams.get('email');
  const prefillEmail =
    rawEmail && EMAIL_RE_LOGIN.test(rawEmail) ? rawEmail : '';

  const [showPasswordFallback, setShowPasswordFallback] = useState(false);

  return (
    <LedgerSurface showHeader={false}>
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <LedgerEyebrow>Sign in</LedgerEyebrow>
          <LedgerH1>
            Welcome <span style={{ color: 'var(--terra)' }}>back.</span>
          </LedgerH1>
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

          {showPasswordFallback ? (
            <PasswordForm redirectTo={redirectTo} prefillEmail={prefillEmail} />
          ) : (
            <PasskeyForm redirectTo={redirectTo} prefillEmail={prefillEmail} />
          )}

          <div
            style={{
              marginTop: 16,
              textAlign: 'center',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            <button
              type="button"
              onClick={() => setShowPasswordFallback((v) => !v)}
              className="ledger-link"
              style={{ background: 'none', border: 0, cursor: 'pointer' }}
            >
              {showPasswordFallback ? '← Back to passkey' : 'Use password instead'}
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            <DevSkipButton />
          </div>
        </LedgerCard>

        <p
          style={{
            textAlign: 'center',
            fontFamily: 'var(--serif)',
            fontSize: 15,
            color: 'var(--ink-2)',
            margin: 0,
          }}
        >
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
