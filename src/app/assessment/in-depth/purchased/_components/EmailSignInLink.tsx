'use client';

// "Email my one-click link" — the primary recovery path on the In-Depth
// purchase success page.
//
// The Stripe webhook already created the buyer's account + entitlement and
// emailed them a one-click magic link. This button RE-SENDS that exact link
// (sendInDepthAccessLinkAction → generateMagicLink), so a buyer who didn't
// get / lost the email gets back in with ONE click and NO password step.
//
// History: the original CTA linked to /auth/login?mode=magic (dead after the
// 2026-05-28 magic-link retirement, #187 / journey audit F3). The interim fix
// sent a password-SETUP email — correct, but it forced a password. This sends
// the same passwordless magic link the webhook uses, which is the lowest-
// friction path for someone who just paid.

import { useState } from 'react';
import Link from 'next/link';
import { sendInDepthAccessLinkAction } from '@/app/auth/actions';

interface EmailSignInLinkProps {
  readonly email: string | null;
}

const buttonStyle: React.CSSProperties = {
  background: 'var(--gold)',
  color: '#fff',
  padding: '14px 28px',
  borderRadius: 12,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.16em',
};

export function EmailSignInLink({ email }: EmailSignInLinkProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  // Without a known buyer email there is nothing to send — forgot-password is
  // the same one-click flow with an email field.
  if (!email) {
    return (
      <Link
        href="/auth/forgot-password"
        className="inline-block uppercase transition-colors"
        style={buttonStyle}
      >
        EMAIL MY ONE-CLICK LINK
      </Link>
    );
  }

  const handleSend = async () => {
    setStatus('sending');
    setMessage(null);
    try {
      const result = await sendInDepthAccessLinkAction(email);
      if (result.error === null) {
        setStatus('sent');
      } else {
        setStatus('error');
        setMessage(result.error);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Could not send the email.');
    }
  };

  if (status === 'sent') {
    return (
      <p style={{ fontSize: 14, color: 'var(--slate-600)', lineHeight: 1.5 }}>
        <span style={{ fontWeight: 700, color: 'var(--gold-deep)', letterSpacing: '0.08em' }}>
          CHECK YOUR INBOX
        </span>{' '}
        — we emailed <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{email}</span> a
        one-click link. Open it and you&rsquo;ll land straight in your assessment — no password
        needed.
      </p>
    );
  }

  return (
    <span className="inline-flex flex-col gap-2">
      <button
        type="button"
        onClick={handleSend}
        disabled={status === 'sending'}
        className="inline-block uppercase transition-colors"
        style={{ ...buttonStyle, cursor: status === 'sending' ? 'wait' : 'pointer' }}
      >
        {status === 'sending' ? 'SENDING…' : 'EMAIL MY ONE-CLICK LINK'}
      </button>
      {status === 'error' && (
        <span style={{ fontSize: 12, color: '#9b2226' }}>
          {message ?? 'Could not send the email.'} Try again or{' '}
          <Link href="/auth/forgot-password" style={{ textDecoration: 'underline' }}>
            use forgot password
          </Link>
          .
        </span>
      )}
    </span>
  );
}
