// /auth/confirm — interstitial confirmation page.
//
// Stands between an emailed auth link and the actual token consumption.
// Email scanners (Outlook Defender, Apple Mail Privacy Protection, Gmail
// link prefetcher) GET URLs in emails before the recipient clicks them.
// If we verified the token on GET, scanners burned every link a second
// after delivery and users got "expired" errors.
//
// This page renders a click-through button. Only the button's POST to
// /auth/callback consumes the token. GET on this page does no work
// against Supabase, so scanner pre-fetches are harmless.
//
// Reachable via two paths:
//   1. Direct: email templates link straight to /auth/confirm?token_hash=...
//   2. Back-compat: /auth/callback GET redirects here with the same query
//
// Both routes preserve token_hash + type + next (or code + next for PKCE)
// across the redirect so the form can submit them back to /auth/callback.

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Confirm — The AI Banking Institute',
  description: 'Confirm the email link to sign in.',
  robots: { index: false, follow: false },
};

interface PageProps {
  readonly searchParams: Promise<Record<string, string | undefined>>;
}

const VALID_TYPES = new Set([
  'signup',
  'magiclink',
  'recovery',
  'invite',
  'email_change',
  'email',
]);

export default async function ConfirmPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const code = typeof sp.code === 'string' ? sp.code : null;
  const tokenHash = typeof sp.token_hash === 'string' ? sp.token_hash : null;
  const type = typeof sp.type === 'string' ? sp.type : null;
  const next = typeof sp.next === 'string' && sp.next.startsWith('/') ? sp.next : '/dashboard';
  const error = typeof sp.error === 'string' ? sp.error : null;

  const hasValidToken =
    Boolean(code) || (Boolean(tokenHash) && Boolean(type) && VALID_TYPES.has(type ?? ''));

  // Friendly headline per flow type. Falls back to the generic
  // "Confirm to sign in" wording.
  const headline =
    type === 'signup'
      ? 'Confirm your email to finish creating your account.'
      : type === 'recovery'
        ? 'Confirm to set a new password.'
        : type === 'email_change' || type === 'email'
          ? 'Confirm your email address change.'
          : type === 'invite'
            ? 'Accept your invitation.'
            : type === 'magiclink' || code
              ? 'Confirm to sign in.'
              : 'Confirm the link from your email.';

  const cta =
    type === 'signup'
      ? 'Confirm and sign in'
      : type === 'recovery'
        ? 'Continue to password reset'
        : type === 'invite'
          ? 'Accept and continue'
          : 'Sign in';

  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--gold-deep)',
          margin: '0 0 14px',
        }}
      >
        Email confirmation
      </p>

      <h1
        style={{
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: '0 0 16px',
          color: 'var(--ink)',
        }}
      >
        {headline}
      </h1>

      <p
        style={{
          fontSize: 16,
          lineHeight: 1.55,
          color: 'var(--slate-600)',
          margin: '0 0 28px',
          maxWidth: '52ch',
        }}
      >
        Click the button below to finish. We use a confirmation step
        because email scanners often pre-open links, which can invalidate
        them before you arrive.
      </p>

      {error && (
        <div
          role="alert"
          style={{
            borderRadius: 12,
            border: '1px solid rgba(180, 60, 50, 0.35)',
            background: 'rgba(180, 60, 50, 0.06)',
            color: '#7A1F18',
            padding: '12px 16px',
            marginBottom: 20,
            fontSize: 14,
            lineHeight: 1.45,
          }}
        >
          {decodeURIComponent(error)}
        </div>
      )}

      {hasValidToken ? (
        <form method="POST" action="/auth/callback">
          {code && <input type="hidden" name="code" value={code} />}
          {tokenHash && <input type="hidden" name="token_hash" value={tokenHash} />}
          {type && <input type="hidden" name="type" value={type} />}
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: 'none',
              cursor: 'pointer',
              padding: '0 28px',
              height: 48,
              background: 'var(--gold)',
              color: 'var(--ink)',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderRadius: 12,
              fontFamily: 'inherit',
            }}
          >
            {cta}
          </button>
        </form>
      ) : (
        <div
          style={{
            padding: '20px 22px',
            background: '#fff',
            border: '1px solid var(--slate-200)',
            borderRadius: 16,
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--ink)', margin: '0 0 12px' }}>
            This confirmation link is missing required information. Please request a fresh link from the sign-in page.
          </p>
          <Link
            href="/auth/login"
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--gold-deep)',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Return to sign in
          </Link>
        </div>
      )}

      <p
        style={{
          marginTop: 36,
          fontSize: 12,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--slate-500)',
          fontWeight: 600,
          lineHeight: 1.5,
        }}
      >
        Trouble?{' '}
        <a
          href="mailto:hello@aibankinginstitute.com"
          style={{ color: 'var(--gold-deep)', textDecoration: 'underline', textUnderlineOffset: 3 }}
        >
          hello@aibankinginstitute.com
        </a>
      </p>
    </div>
  );
}
