'use client';

// /auth/recovery — backup-code sign-in for users who lost their passkey
// device. POSTs to /api/webauthn/recovery/verify; on success the server
// issues a session and we route to /auth/passkey/enroll so the user
// adds a new passkey before leaving the recovery flow.

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { sanitizeNext } from '@/lib/supabase/auth';
import {
  LedgerAlert,
  LedgerButton,
  LedgerCard,
  LedgerEyebrow,
  LedgerField,
  LedgerH1,
  LedgerSurface,
} from '@/components/ledger';

export default function RecoveryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = sanitizeNext(searchParams.get('next'));

  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch('/api/webauthn/recovery/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? 'Recovery failed.');
      }
      // Recovery codes are single-use AND the user has no passkey on
      // this device. Force them to enroll a new one before reaching
      // any gated surface — that's the whole point of the recovery flow.
      router.push(`/auth/passkey/enroll?next=${encodeURIComponent(next)}`);
      router.refresh();
    } catch (err) {
      setPending(false);
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    }
  }

  return (
    <LedgerSurface showHeader={false}>
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <LedgerEyebrow>Account recovery</LedgerEyebrow>
          <LedgerH1>
            Lost your <span style={{ color: 'var(--terra)' }}>passkey?</span>
          </LedgerH1>
        </div>

        <LedgerCard variant="strong">
          <p
            style={{
              margin: '0 0 18px',
              fontFamily: 'var(--serif)',
              fontSize: 15,
              lineHeight: 1.55,
              color: 'var(--ink-2)',
            }}
          >
            Enter one of the 8 backup codes you saved when you registered your
            passkey. The code works once, then expires.
          </p>

          {error && (
            <div style={{ marginBottom: 14 }}>
              <LedgerAlert variant="error">{error}</LedgerAlert>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <LedgerField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@yourbank.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <LedgerField
              label="Recovery code"
              name="code"
              type="text"
              autoComplete="off"
              required
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <LedgerButton
              type="submit"
              variant="primary"
              block
              disabled={pending}
              style={{ marginTop: 4 }}
            >
              {pending ? 'Verifying…' : 'Sign in with code'}
            </LedgerButton>
          </form>
        </LedgerCard>

        <p
          style={{
            textAlign: 'center',
            fontFamily: 'var(--serif)',
            fontSize: 14,
            color: 'var(--muted)',
            margin: 0,
          }}
        >
          Have your passkey?{' '}
          <Link href="/auth/login" className="ledger-link">
            Sign in normally
          </Link>
        </p>

        <p
          style={{
            textAlign: 'center',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            margin: 0,
          }}
        >
          No codes left? Email{' '}
          <a
            href="mailto:hello@aibankinginstitute.com"
            className="ledger-link"
          >
            hello@aibankinginstitute.com
          </a>
        </p>
      </div>
    </LedgerSurface>
  );
}
