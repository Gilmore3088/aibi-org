'use client';

// /auth/passkey/enroll — register a passkey for the currently-signed-in
// user. Reached after first email confirmation (new users) or after a
// password-based sign-in during the migration window (existing users).
//
// Flow:
//   1. POST /api/webauthn/register/begin → options
//   2. navigator.credentials.create with options → attestation
//   3. POST /api/webauthn/register/complete with attestation → ok
//   4. Redirect to next= or /dashboard

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { startRegistration } from '@simplewebauthn/browser';
import {
  LedgerAlert,
  LedgerButton,
  LedgerCard,
  LedgerEyebrow,
  LedgerField,
  LedgerH1,
  LedgerSurface,
} from '@/components/ledger';
import { sanitizeNext } from '@/lib/supabase/auth';

export default function PasskeyEnrollPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = sanitizeNext(searchParams.get('next'));

  const [deviceLabel, setDeviceLabel] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'done' | 'error'>(
    'idle',
  );
  const [error, setError] = useState<string | null>(null);

  async function handleEnroll() {
    setStatus('pending');
    setError(null);
    try {
      const beginRes = await fetch('/api/webauthn/register/begin', {
        method: 'POST',
      });
      if (!beginRes.ok) {
        const data = (await beginRes.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? 'Could not start enrollment.');
      }
      const options = await beginRes.json();

      const attestation = await startRegistration({ optionsJSON: options });

      const completeRes = await fetch('/api/webauthn/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: attestation,
          deviceLabel: deviceLabel.trim() || undefined,
        }),
      });
      if (!completeRes.ok) {
        const data = (await completeRes.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? 'Could not finish enrollment.');
      }
      setStatus('done');
      // Short pause so the user sees the success state, then route on.
      setTimeout(() => router.push(next), 800);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    }
  }

  return (
    <LedgerSurface showHeader={false}>
      <div
        style={{
          width: '100%',
          maxWidth: 480,
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
          <LedgerEyebrow>Set up a passkey</LedgerEyebrow>
          <LedgerH1>
            Sign in with <span style={{ color: 'var(--terra)' }}>your device.</span>
          </LedgerH1>
        </div>

        <LedgerCard variant="strong">
          <p
            style={{
              margin: '0 0 18px',
              fontFamily: 'var(--serif)',
              fontSize: 16,
              lineHeight: 1.55,
              color: 'var(--ink-2)',
            }}
          >
            Replace passwords with Touch&nbsp;ID, Face&nbsp;ID, Windows&nbsp;Hello,
            or a security key. The next time you sign in, your device will
            handle authentication — no password to remember, nothing to
            forget.
          </p>

          {status === 'done' ? (
            <LedgerAlert variant="info">
              Passkey registered. Redirecting…
            </LedgerAlert>
          ) : (
            <>
              {error && (
                <div style={{ marginBottom: 14 }}>
                  <LedgerAlert variant="error">{error}</LedgerAlert>
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <LedgerField
                  label="Device label (optional)"
                  type="text"
                  placeholder="MacBook Pro · Office"
                  maxLength={80}
                  value={deviceLabel}
                  onChange={(e) => setDeviceLabel(e.target.value)}
                />
              </div>

              <LedgerButton
                type="button"
                variant="primary"
                block
                disabled={status === 'pending'}
                onClick={handleEnroll}
              >
                {status === 'pending' ? 'Waiting for your device…' : 'Add passkey'}
              </LedgerButton>

              <p
                style={{
                  margin: '14px 0 0',
                  fontFamily: 'var(--mono)',
                  fontSize: 10.5,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  textAlign: 'center',
                }}
              >
                Your device will ask you to confirm
              </p>
            </>
          )}
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
          Want to do this later?{' '}
          <Link href={next} className="ledger-link">
            Skip for now
          </Link>
        </p>
      </div>
    </LedgerSurface>
  );
}
