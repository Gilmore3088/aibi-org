'use client';

// "Email me a sign-in link" CTA on the In-Depth purchase success page.
//
// #324 wanted a passwordless path for "I bought with this email but don't
// have / don't remember a password". The original CTA linked to
// /auth/login?mode=magic — but magic-link sign-in was retired 2026-05-28
// (#187) and the login page silently ignores the param, stranding a
// passwordless buyer on a password form (journey audit 2026-06-10, F3).
// This sends the password-setup email (a Supabase recovery link framed as
// "set your password") directly from the success page instead: one click,
// one email, and the buyer lands back on the assessment with a session.

import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordSetupAction } from '@/app/auth/actions';

interface EmailSignInLinkProps {
  readonly email: string | null;
  readonly next: string;
}

const buttonStyle: React.CSSProperties = {
  border: '1px solid var(--ink-a15)',
  color: 'var(--ink)',
  padding: '14px 28px',
  borderRadius: 12,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.16em',
};

export function EmailSignInLink({ email, next }: EmailSignInLinkProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  // Without a known buyer email there is nothing to send to one-click;
  // forgot-password is the same flow with an email field.
  if (!email) {
    return (
      <Link
        href="/auth/forgot-password"
        className="inline-block uppercase transition-colors"
        style={buttonStyle}
      >
        EMAIL ME A SIGN-IN LINK
      </Link>
    );
  }

  const handleSend = async () => {
    setStatus('sending');
    setMessage(null);
    try {
      const result = await sendPasswordSetupAction(email, next);
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
      <p style={{ fontSize: 13, color: 'var(--slate-600)', alignSelf: 'center' }}>
        <span style={{ fontWeight: 700, color: 'var(--gold-deep)', letterSpacing: '0.08em' }}>
          CHECK YOUR INBOX
        </span>{' '}
        — we emailed <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{email}</span> a
        link. Open it, choose a password, and you&rsquo;ll land in the assessment.
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
        {status === 'sending' ? 'SENDING…' : 'EMAIL ME A SIGN-IN LINK'}
      </button>
      {status === 'error' && (
        <span style={{ fontSize: 12, color: '#9b2226' }}>
          {message ?? 'Could not send the email.'} Try again or use{' '}
          <Link href="/auth/forgot-password" style={{ textDecoration: 'underline' }}>
            forgot password
          </Link>
          .
        </span>
      )}
    </span>
  );
}
