'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { signUp, sanitizeNext } from '@/lib/supabase/auth';
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

// Lenient email-shaped check just to avoid pre-filling random garbage from
// a crafted URL. The form's own type="email" validation is the real gate.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cap prefilled identity values so a crafted URL can't push absurd
// strings into the form. Mirrors the EmailGate maxLength caps.
function sanitizePrefill(value: string | null, max: number): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return '';
  // Reject any control chars or HTML-ish content.
  if (/[<>\r\n\t]/.test(trimmed)) return '';
  return trimmed;
}

export default function SignupPage() {
  const searchParams = useSearchParams();
  // Same open-redirect defense as /auth/login.
  const redirectTo = sanitizeNext(searchParams.get('next'));
  // Pre-fill from query params so post-Stripe buyers (and any caller
  // who completed the free EmailGate) don't re-type identity. Email
  // prefill stays the strict shape check; name + institution accept any
  // reasonable string. All three remain editable.
  const rawEmail = searchParams.get('email');
  const prefillEmail = rawEmail && EMAIL_RE.test(rawEmail) ? rawEmail : '';
  // The EmailGate captures `firstName` but the signup form's database
  // field is `fullName`. Accept either query param so older links and
  // the new identity hand-off both work; the user can edit before submit.
  const prefillFullName = sanitizePrefill(
    searchParams.get('fullName') ?? searchParams.get('firstName'),
    80,
  );
  const prefillInstitution = sanitizePrefill(
    searchParams.get('institutionName'),
    120,
  );

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const confirmPassword = data.get('confirmPassword') as string;
    const fullName = data.get('fullName') as string;
    const institutionName = data.get('institutionName') as string;
    const terms = data.get('terms');

    if (!terms) {
      setError('You must accept the terms to create an account.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setPending(true);
    // Pass the deep-link target through so the confirmation email lands
    // the user back on the page they tried to reach (e.g. /assessment/
    // in-depth/take) rather than the generic /dashboard.
    const result = await signUp(
      email,
      password,
      {
        fullName: fullName.trim(),
        institutionName: institutionName.trim() || undefined,
      },
      redirectTo,
    );
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <LedgerSurface showHeader={false}>
        <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <LedgerEyebrow>Account created</LedgerEyebrow>
            <LedgerH1>Check your <span style={{ color: 'var(--terra)' }}>inbox.</span></LedgerH1>
          </div>
          <LedgerCard variant="strong">
            <p style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.5, color: 'var(--ink-2)', textAlign: 'center' }}>
              We sent a confirmation link to your email. Click it to activate your account.
            </p>
            <p style={{ margin: '12px 0 0', fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>
              The link expires in 24 hours · check spam if you don&apos;t see it
            </p>
          </LedgerCard>
          <p style={{ textAlign: 'center', fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink-2)', margin: 0 }}>
            Already confirmed?{' '}
            <Link href="/auth/login" className="ledger-link">
              Sign in
            </Link>
          </p>
        </div>
      </LedgerSurface>
    );
  }

  return (
    <LedgerSurface showHeader={false}>
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <LedgerEyebrow>Create account</LedgerEyebrow>
          <LedgerH1>Start <span style={{ color: 'var(--terra)' }}>here.</span></LedgerH1>
        </div>

        <LedgerCard variant="strong">
          {error && (
            <div style={{ marginBottom: 18 }}>
              <LedgerAlert variant="error">{error}</LedgerAlert>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <LedgerField
              label="Full name"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              placeholder="Jane Doe"
              defaultValue={prefillFullName}
            />
            <LedgerField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@yourbank.com"
              defaultValue={prefillEmail}
            />
            <LedgerField
              label={
                <>
                  Institution{' '}
                  <span style={{ fontFamily: 'var(--serif)', textTransform: 'none', letterSpacing: 0, color: 'var(--soft)', fontWeight: 400 }}>
                    (optional)
                  </span>
                </>
              }
              name="institutionName"
              type="text"
              autoComplete="organization"
              placeholder="First Community Bank"
              defaultValue={prefillInstitution}
            />
            <LedgerField
              label="Password"
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

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingTop: 6, marginBottom: 14 }}>
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                style={{
                  marginTop: 3,
                  width: 14,
                  height: 14,
                  accentColor: 'var(--terra)',
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
              <label
                htmlFor="terms"
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 14,
                  lineHeight: 1.45,
                  color: 'var(--ink-2)',
                }}
              >
                I agree to the{' '}
                <Link href="/terms" className="ledger-link">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="ledger-link">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <LedgerButton type="submit" variant="primary" block disabled={pending}>
              {pending ? 'Creating account…' : 'Create account'}
            </LedgerButton>
          </form>
        </LedgerCard>

        <p style={{ textAlign: 'center', fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink-2)', margin: 0 }}>
          Already have an account?{' '}
          <Link
            href={`/auth/login${redirectTo !== '/dashboard' ? `?next=${encodeURIComponent(redirectTo)}` : ''}`}
            className="ledger-link"
          >
            Sign in
          </Link>
        </p>
      </div>
    </LedgerSurface>
  );
}
