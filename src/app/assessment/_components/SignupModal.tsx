'use client';

import { useState } from 'react';
import { signInWithMagicLink } from '@/lib/supabase/auth';

interface SignupModalProps {
  readonly email: string;
  readonly profileId: string | null;
  readonly onClose: () => void;
}

export function SignupModal({ email, profileId, onClose }: SignupModalProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSend = async () => {
    setStatus('sending');
    setErrorMessage(null);
    try {
      const next = profileId
        ? `/results/${profileId}`
        : typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '/assessment';
      const result = await signInWithMagicLink(email, next);
      if (result.error === null) {
        setStatus('sent');
      } else {
        setStatus('error');
        setErrorMessage(result.error ?? 'Could not send the link.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--color-ink)]/40"
      onClick={onClose}
    >
      <div
        className="bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/15 rounded-[3px] p-8 max-w-md w-[90%] shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="signup-modal-title"
          className="font-serif text-2xl text-[color:var(--color-ink)] mb-3"
        >
          Create an account to download
        </h2>
        <p className="text-[15px] leading-[1.6] text-[color:var(--color-ink)]/75 mb-6">
          We&rsquo;ll email a sign-in link to <strong>{email}</strong>. Click it to confirm your
          account, then you&rsquo;ll be redirected back here to download your brief.
        </p>

        {status === 'idle' && (
          <button
            onClick={handleSend}
            className="w-full px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[12px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            Send my sign-in link
          </button>
        )}

        {status === 'sending' && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/55 text-center">
            Sending&hellip;
          </p>
        )}

        {status === 'sent' && (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] mb-3">
              Check your inbox
            </p>
            <p className="text-[14px] text-[color:var(--color-ink)]/75 leading-[1.55]">
              Open the email and click the sign-in link. This page will refresh automatically once
              you confirm.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-error)] mb-2">
              Something went wrong
            </p>
            <p className="text-[14px] text-[color:var(--color-ink)]/75 mb-4">
              {errorMessage ?? 'Try again, or refresh the page.'}
            </p>
            <button
              onClick={handleSend}
              className="w-full px-6 py-3 border border-[color:var(--color-ink)]/30 text-[color:var(--color-ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:border-[color:var(--color-terra)] transition-colors"
            >
              Resend link
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 block w-full text-[12px] text-[color:var(--color-ink)]/55 hover:text-[color:var(--color-terra)] transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
