'use client';

import { useState } from 'react';
import Link from 'next/link';

import { resetPassword } from '@/lib/supabase/auth';
import {
  LedgerAlert,
  LedgerButton,
  LedgerCard,
  LedgerEyebrow,
  LedgerField,
  LedgerH1,
  LedgerSurface,
} from '@/components/ledger';

export default function ForgotPasswordPage() {
  const [state, setState] = useState<'idle' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;

    const result = await resetPassword(email);
    setPending(false);

    if (result.error) {
      setError(result.error);
      setState('error');
      return;
    }
    setState('sent');
  }

  return (
    <LedgerSurface>
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <LedgerEyebrow>Reset password</LedgerEyebrow>
          <LedgerH1>
            Forgot your <em>password?</em>
          </LedgerH1>
        </div>

        <LedgerCard variant="strong">
          {state === 'sent' ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.5, color: 'var(--ink-2)' }}>
                If that address is in our system, a reset link is on its way.
              </p>
              <p style={{ margin: '12px 0 0', fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Check spam if you don&apos;t see it within a few minutes
              </p>
            </div>
          ) : (
            <>
              <p style={{ margin: '0 0 18px', fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.5, color: 'var(--ink-2)', fontStyle: 'italic' }}>
                Enter the email address linked to your account and we&apos;ll send a reset link.
              </p>

              {error && (
                <div style={{ marginBottom: 14 }}>
                  <LedgerAlert variant="error">{error}</LedgerAlert>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <LedgerField
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@yourbank.com"
                />
                <LedgerButton type="submit" variant="primary" block disabled={pending}>
                  {pending ? 'Sending…' : 'Send reset link'}
                </LedgerButton>
              </form>
            </>
          )}
        </LedgerCard>

        <p style={{ textAlign: 'center', fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink-2)', margin: 0 }}>
          Remembered it?{' '}
          <Link href="/auth/login" className="ledger-link">
            Sign in
          </Link>
        </p>
      </div>
    </LedgerSurface>
  );
}
