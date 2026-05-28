'use client';

import { useState } from 'react';
import { sendPasswordSetupAction } from '@/app/auth/actions';

interface SignupModalProps {
  readonly email: string;
  readonly profileId: string | null;
  readonly onClose: () => void;
}

// Triggered from the assessment results surface after capture-email has
// already created an auth.users row for the visitor (see ensureAuthUser
// in /api/capture-email). This modal sends a recovery email framed as
// "set your password", which both verifies the address and lets the
// banker pick a password for future B2B-appropriate sign-ins (#187).
// The same Supabase resetPasswordForEmail call serves both legacy
// magic-link users and brand-new accounts — the recovery flow does not
// care whether a password was set previously.
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
      const result = await sendPasswordSetupAction(email, next);
      if (result.error === null) {
        setStatus('sent');
      } else {
        setStatus('error');
        setErrorMessage(result.error ?? 'Could not send the email.');
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
        className="bg-[color:var(--cream)] border border-[color:var(--ink)]/15 rounded-2xl p-8 max-w-md w-[90%]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="signup-modal-title"
          className="text-2xl text-[color:var(--ink)] mb-3"
        >
          Set a password to download
        </h2>
        <p className="text-[15px] leading-[1.6] text-[color:var(--ink)]/75 mb-6">
          We&rsquo;ll email a one-time link to <strong>{email}</strong>. Click it, choose a password,
          and you&rsquo;ll land back here to download your brief and sign in to your dashboard.
        </p>

        {status === 'idle' && (
          <button
            onClick={handleSend}
            className="w-full px-6 py-3 bg-[color:var(--gold)] text-[color:var(--cream)] font-sans text-[12px] font-semibold uppercase tracking-[1.2px] rounded-xl hover:bg-[color:var(--gold-2)] transition-colors"
          >
            Email me the link
          </button>
        )}

        {status === 'sending' && (
          <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink)]/55 text-center">
            Sending&hellip;
          </p>
        )}

        {status === 'sent' && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--gold)] mb-3">
              Check your inbox
            </p>
            <p className="text-[14px] text-[color:var(--ink)]/75 leading-[1.55]">
              Open the email and click the &ldquo;Set your password&rdquo; link. Once you choose a
              password you&rsquo;ll be returned here automatically.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[color:#9b2226] mb-2">
              Something went wrong
            </p>
            <p className="text-[14px] text-[color:var(--ink)]/75 mb-4">
              {errorMessage ?? 'Try again, or refresh the page.'}
            </p>
            <button
              onClick={handleSend}
              className="w-full px-6 py-3 border border-[color:var(--ink)]/30 text-[color:var(--ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-xl hover:border-[color:var(--gold)] transition-colors"
            >
              Resend email
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
