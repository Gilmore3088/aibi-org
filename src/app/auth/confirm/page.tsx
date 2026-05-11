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
    <main
      style={{
        minHeight: '70vh',
        padding: '64px 24px',
        background: 'var(--ledger-bg, #ECE9DF)',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 18,
          }}
        >
          <span
            style={{
              fontFamily: "var(--ledger-mono, 'JetBrains Mono', monospace)",
              fontSize: 10.5,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--ledger-accent, #B5862A)',
              fontWeight: 600,
            }}
          >
            Email confirmation
          </span>
          <span style={{ flex: 1, height: 1, background: 'var(--ledger-rule, #D5D1C2)' }} />
        </div>

        <h1
          style={{
            fontFamily: "var(--ledger-serif, 'Newsreader', Georgia, serif)",
            fontWeight: 500,
            fontSize: 'clamp(34px, 4.4vw, 48px)',
            lineHeight: 1.06,
            letterSpacing: '-0.025em',
            margin: '0 0 18px',
            color: 'var(--ledger-ink, #0E1B2D)',
          }}
        >
          {headline}
        </h1>

        <p
          style={{
            fontFamily: "var(--ledger-serif, 'Newsreader', Georgia, serif)",
            fontStyle: 'italic',
            fontSize: 17,
            lineHeight: 1.5,
            color: 'var(--ledger-ink-2, #1F2A3F)',
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
              background: 'rgba(142, 59, 42, 0.08)',
              border: '1px solid rgba(142, 59, 42, 0.45)',
              padding: '12px 16px',
              marginBottom: 20,
              fontFamily: "var(--ledger-sans, system-ui, sans-serif)",
              fontSize: 14,
              color: 'var(--ledger-weak, #8E3B2A)',
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
                appearance: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '14px 28px',
                background: 'var(--ledger-ink, #0E1B2D)',
                color: 'var(--ledger-paper, #F4F1E7)',
                fontFamily: "var(--ledger-sans, system-ui, sans-serif)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                borderRadius: 2,
              }}
            >
              {cta}
            </button>
          </form>
        ) : (
          <div
            style={{
              padding: '16px 18px',
              background: 'var(--ledger-paper, #F4F1E7)',
              border: '1px solid var(--ledger-rule-strong, #A8AEBE)',
            }}
          >
            <p
              style={{
                fontFamily: "var(--ledger-serif, 'Newsreader', Georgia, serif)",
                fontSize: 15,
                lineHeight: 1.5,
                color: 'var(--ledger-ink-2, #1F2A3F)',
                margin: '0 0 12px',
              }}
            >
              This confirmation link is missing required information. Please request a fresh link from the sign-in page.
            </p>
            <Link
              href="/auth/login"
              style={{
                fontFamily: "var(--ledger-mono, 'JetBrains Mono', monospace)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ledger-accent, #B5862A)',
                textDecoration: 'underline',
              }}
            >
              Return to sign in
            </Link>
          </div>
        )}

        <p
          style={{
            marginTop: 36,
            fontFamily: "var(--ledger-mono, 'JetBrains Mono', monospace)",
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ledger-muted, #5C6B82)',
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          Trouble?{' '}
          <a
            href="mailto:hello@aibankinginstitute.com"
            style={{ color: 'var(--ledger-accent, #B5862A)', textDecoration: 'underline' }}
          >
            hello@aibankinginstitute.com
          </a>
        </p>
      </div>
    </main>
  );
}
