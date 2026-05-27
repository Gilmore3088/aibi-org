'use client';

import { useState } from 'react';
import { sendMagicLinkAction } from '@/app/auth/actions';

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
      const result = await sendMagicLinkAction(email, next);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--ink)]/40"
      onClick={onClose}
    >
      <div
        className="bg-[color:var(--cream)] border border-[color:var(--ink)]/15 rounded-[3px] p-8 max-w-md w-[90%]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="signup-modal-title"
          className="font-serif text-2xl text-[color:var(--ink)] mb-3"
        >
          Create an account to download
        </h2>
        <p className="text-[15px] leading-[1.6] text-[color:var(--ink)]/75 mb-6">
          We&rsquo;ll email a sign-in link to <strong>{email}</strong>. Click it to confirm your
          account, then you&rsquo;ll be redirected back here to download your brief.
        </p>

        {status === 'idle' && (
          <button
            onClick={handleSend}
            className="w-full px-6 py-3 bg-[color:var(--gold)] text-[color:var(--cream)] font-sans text-[12px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--gold-2)] transition-colors"
          >
            Send my sign-in link
          </button>
        )}

        {status === 'sending' && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink)]/55 text-center">
            Sending&hellip;
          </p>
        )}

        {status === 'sent' && (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--gold)] mb-3">
              Check your inbox
            </p>
            <p className="text-[14px] text-[color:var(--ink)]/75 leading-[1.55]">
              Open the email and click the sign-in link. This page will refresh automatically once
              you confirm.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:#9b2226] mb-2">
              Something went wrong
            </p>
            <p className="text-[14px] text-[color:var(--ink)]/75 mb-4">
              {errorMessage ?? 'Try again, or refresh the page.'}
            </p>
            <button
              onClick={handleSend}
              className="w-full px-6 py-3 border border-[color:var(--ink)]/30 text-[color:var(--ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:border-[color:var(--gold)] transition-colors"
            >
              Resend link
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 block w-full text-[12px] text-[color:var(--ink)]/55 hover:text-[color:var(--gold)] transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
