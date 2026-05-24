'use client';

// Audit A10 (2026-05-24): the Stripe webhook ALREADY mints a Supabase
// auth user and emails a one-click magic link on payment.success — so
// post-Stripe identity binding is complete server-side. The audit's
// remaining gap was UX: the /purchased pages told buyers to "create or
// sign into your account" even though the account had been provisioned
// behind the scenes, asking them to do work that was already done.
//
// This panel is the per-page identity-binding surface. It tells the
// buyer the link was sent, offers a one-click resend (in case Stripe-
// webhook latency or email delivery delays the first attempt), and
// leaves password sign-in as a tertiary fallback link.

import { useState } from 'react';
import { signInWithMagicLink } from '@/lib/supabase/auth';

interface MagicLinkPanelProps {
  readonly email: string;          // Stripe-recovered email
  readonly nextPath: string;       // where to land after auth (/courses/..., /assessment/...)
  readonly passwordFallbackHref: string; // existing signup/login link for users who prefer it
  readonly variant?: 'ledger' | 'terra'; // visual style — Ledger for foundation page, Terra for in-depth
}

export function MagicLinkPanel({
  email,
  nextPath,
  passwordFallbackHref,
  variant = 'ledger',
}: MagicLinkPanelProps) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    setError(null);
    setResending(true);
    try {
      const result = await signInWithMagicLink(email, nextPath);
      if (result.error) {
        setError(result.error);
      } else {
        setResent(true);
        setTimeout(() => setResent(false), 6000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend.');
    } finally {
      setResending(false);
    }
  }

  const isLedger = variant === 'ledger';
  const accent = isLedger ? 'var(--ledger-accent)' : 'var(--color-terra)';
  const bg = isLedger ? 'var(--ledger-paper)' : 'var(--color-parch)';
  const ink = isLedger ? 'var(--ledger-ink)' : 'var(--color-ink)';
  const inkSecondary = isLedger ? 'var(--ledger-ink-2)' : 'rgba(0,0,0,0.75)';

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${isLedger ? 'var(--ledger-rule)' : 'rgba(0,0,0,0.1)'}`,
        borderLeft: `3px solid ${accent}`,
        padding: '22px 24px',
        borderRadius: 3,
      }}
    >
      <p
        style={{
          fontFamily: isLedger ? 'var(--ledger-mono)' : 'var(--font-mono, monospace)',
          fontSize: 10.5,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: accent,
          margin: '0 0 10px',
          fontWeight: 600,
        }}
      >
        One-click sign-in
      </p>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.55,
          color: ink,
          margin: '0 0 6px',
        }}
      >
        We&rsquo;ve sent a sign-in link to{' '}
        <span
          style={{
            fontFamily: isLedger ? 'var(--ledger-mono)' : 'var(--font-mono, monospace)',
            color: ink,
          }}
        >
          {email}
        </span>
        . Click it and you&rsquo;re in — no password needed.
      </p>
      <p
        style={{
          fontSize: 12.5,
          color: inkSecondary,
          margin: '0 0 16px',
          lineHeight: 1.5,
        }}
      >
        The link may take up to a minute to arrive. Check spam if you don&rsquo;t see it.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || resent}
          style={{
            background: resent ? 'transparent' : accent,
            color: resent ? accent : (isLedger ? 'var(--ledger-bg)' : 'var(--color-linen)'),
            border: resent ? `1px solid ${accent}` : 'none',
            padding: '10px 18px',
            borderRadius: 2,
            fontFamily: isLedger ? 'var(--ledger-mono)' : 'var(--font-mono, monospace)',
            fontSize: 10.5,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 600,
            cursor: resending || resent ? 'default' : 'pointer',
            opacity: resending ? 0.55 : 1,
            transition: 'background 120ms, color 120ms, opacity 120ms',
          }}
          aria-live="polite"
        >
          {resent ? 'Link sent · check your inbox' : resending ? 'Sending…' : 'Resend the link'}
        </button>
        <a
          href={passwordFallbackHref}
          style={{
            fontSize: 12,
            color: inkSecondary,
            textDecoration: 'underline',
            fontFamily: 'inherit',
          }}
        >
          Use a password instead
        </a>
      </div>

      {error ? (
        <p
          role="alert"
          style={{
            marginTop: 12,
            fontSize: 12,
            color: 'var(--ledger-weak, #8E3B2A)',
            fontFamily: 'inherit',
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
