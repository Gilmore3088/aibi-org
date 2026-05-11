'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { updatePassword } from '@/lib/supabase/auth';
import {
  LedgerAlert,
  LedgerButton,
  LedgerCard,
  LedgerEyebrow,
  LedgerField,
  LedgerH1,
  LedgerSurface,
} from '@/components/ledger';

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const data = new FormData(e.currentTarget);
    const password = data.get('password') as string;
    const confirmPassword = data.get('confirmPassword') as string;

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setPending(true);
    const result = await updatePassword(password);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <LedgerSurface>
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <LedgerEyebrow>New password</LedgerEyebrow>
          <LedgerH1>
            Pick a strong <em>one.</em>
          </LedgerH1>
        </div>

        <LedgerCard variant="strong">
          <p style={{ margin: '0 0 18px', fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.5, color: 'var(--ink-2)', fontStyle: 'italic' }}>
            Choose a password you don&apos;t use anywhere else. Eight characters minimum.
          </p>

          {error && (
            <div style={{ marginBottom: 14 }}>
              <LedgerAlert variant="error">{error}</LedgerAlert>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <LedgerField
              label="New password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              placeholder={`${MIN_PASSWORD_LENGTH}+ characters`}
            />
            <LedgerField
              label="Confirm password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
            />
            <LedgerButton type="submit" variant="primary" block disabled={pending}>
              {pending ? 'Updating…' : 'Update password'}
            </LedgerButton>
          </form>
        </LedgerCard>

        <p style={{ textAlign: 'center', fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink-2)', margin: 0 }}>
          <Link href="/auth/login" className="ledger-link">
            Back to sign in
          </Link>
        </p>
      </div>
    </LedgerSurface>
  );
}
