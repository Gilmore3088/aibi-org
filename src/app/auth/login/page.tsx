'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

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
            Forgot password
          </Link>
        }
      />
      <LedgerButton type="submit" variant="primary" block disabled={pending} style={{ marginTop: 4 }}>
        {pending ? 'Signing in…' : 'Sign In'}
      </LedgerButton>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
// Magic-link sign-in was removed 2026-05-23 — a mailbox-only credential
// is no longer accepted now that we're moving to 2FA. The
// signInWithMagicLink helper stays in @/lib/supabase/auth for emergency
// recovery use cases (account recovery flow) but is not surfaced in the
// UI. See docs/2fa-migration-plan-2026-05-23.md.

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

  return (
    <LedgerSurface showHeader={false}>
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <LedgerEyebrow>Sign in</LedgerEyebrow>
          <LedgerH1>Welcome <span style={{ color: 'var(--terra)' }}>back.</span></LedgerH1>
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

          <PasswordForm redirectTo={redirectTo} prefillEmail={prefillEmail} />

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
