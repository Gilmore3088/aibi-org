'use client';

import { type CSSProperties, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { sanitizeNext } from '@/lib/supabase/auth';
import { EmailLinkForm, PurchaseRecoveryForm } from '@/components/auth/RecoveryForms';
import { EMAIL_RE } from '@/lib/email/validate';

// Holding state for the new-device sign-in confirmation flow (#187 PR 2).
// /auth/login routes here after a successful password sign-in from a
// device whose aibi-trusted-device cookie is missing or expired.
// The email is fired by /api/auth/check-device; this page only renders
// the wait state. The user finishes the flow by clicking the link in
// the email, which lands on /auth/confirm-device. If they open that link
// on another browser, the route now hands them into a fresh one-time
// sign-in link instead of looping.
//
// Buyers also land here from the /dashboard and /assessment/in-depth/access
// layouts when they arrive with a valid session but no trusted-device cookie
// — and sometimes with no live session at all (a bank email gateway filtered
// or expired the single magic link). /api/auth/check-device returns 401 in
// that sessionless case, so the resend button alone would dead-end them.
// The two sessionless recovery forms below (re-minting a fresh link without
// needing a session) are the escape hatch for exactly that buyer.

// Lenient email-shaped check so we don't prefill garbage from a crafted URL.

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: 480,
  background: '#fff',
  borderRadius: 24,
  border: '1px solid var(--slate-200)',
  boxShadow: 'var(--shadow-feature)',
  padding: 36,
  textAlign: 'center',
};

const eyebrowStyle: CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const recoveryCardStyle: CSSProperties = {
  width: '100%',
  maxWidth: 480,
  background: '#fff',
  borderRadius: 24,
  border: '1px solid var(--slate-200)',
  boxShadow: 'var(--shadow-feature)',
  padding: 32,
  textAlign: 'left',
};

const recoveryEyebrowStyle: CSSProperties = {
  ...eyebrowStyle,
  marginBottom: 8,
};

const recoveryBodyStyle: CSSProperties = {
  fontSize: '0.875rem',
  lineHeight: 1.5,
  color: 'var(--slate-600)',
  margin: '0 0 16px',
};

const h1Style: CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 700,
  lineHeight: 1.15,
  letterSpacing: '-0.02em',
  color: 'var(--ink)',
  margin: '8px 0 16px',
};

const bodyStyle: CSSProperties = {
  fontSize: '0.9375rem',
  lineHeight: 1.55,
  color: 'var(--slate-600)',
  margin: '0 0 16px',
};

const linkStyle: CSSProperties = {
  color: 'var(--gold-deep)',
  fontWeight: 600,
  textDecoration: 'underline',
  textUnderlineOffset: 3,
};

const stampStyle: CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  margin: '24px 0 0',
};

const resendBtnStyle: CSSProperties = {
  display: 'inline-block',
  marginTop: 20,
  padding: '10px 22px',
  borderRadius: 10,
  background: 'var(--gold)',
  color: '#fff',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  border: 'none',
  cursor: 'pointer',
};

export default function ConfirmDevicePendingPage() {
  const searchParams = useSearchParams();
  const rawEmail = searchParams.get('email');
  const prefillEmail = rawEmail && EMAIL_RE.test(rawEmail) ? rawEmail : '';
  const emailDisplay = prefillEmail || 'your inbox';
  // The post-confirmation destination — forwarded by the redirecting layouts
  // as ?next= (e.g. /assessment/in-depth/take) or by the password-reset flow
  // as ?redirectTo=. check-device honors it via sanitizeNext, and the
  // sessionless recovery form re-mints a link to it.
  const next = sanitizeNext(searchParams.get('next') ?? searchParams.get('redirectTo'));
  const [resendStatus, setResendStatus] = useState<
    'idle' | 'sending' | 'sent' | 'error' | 'no-session'
  >('idle');

  async function handleResend() {
    setResendStatus('sending');
    try {
      const res = await fetch('/api/auth/check-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirectTo: next }),
      });
      if (res.ok) {
        setResendStatus('sent');
        return;
      }
      // 401 = no live session. The resend path needs a session it does not
      // have, so point the buyer at the sessionless sign-in-link form below
      // instead of looping them back to /auth/login.
      setResendStatus(res.status === 401 ? 'no-session' : 'error');
    } catch {
      setResendStatus('error');
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={cardStyle}>
        <p style={eyebrowStyle}>Confirm sign-in</p>
        <h1 style={h1Style}>Check your email.</h1>
        <p style={bodyStyle}>
          We sent a one-time confirmation link to{' '}
          <strong style={{ color: 'var(--ink)' }}>{emailDisplay}</strong>. Open it to finish signing
          in. If it opens on another device, we will send that browser through a fresh sign-in step.
        </p>
        <p style={bodyStyle}>
          We only ask for this on devices we have not seen before. After this confirmation, this
          browser will recognize you for the next 90 days.
        </p>

        {/* Resend action */}
        {resendStatus === 'sent' ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--gold-deep)', fontWeight: 600, margin: '20px 0 0' }}>
            New link sent — check your inbox.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => { void handleResend(); }}
            disabled={resendStatus === 'sending'}
            style={{ ...resendBtnStyle, opacity: resendStatus === 'sending' ? 0.6 : 1 }}
          >
            {resendStatus === 'sending' ? 'Sending…' : 'Resend confirmation email'}
          </button>
        )}
        {resendStatus === 'error' && (
          <p style={{ fontSize: '0.8125rem', color: '#9b2226', margin: '8px 0 0' }}>
            Could not resend.{' '}
            <Link href="/auth/login" style={linkStyle}>Sign in again</Link> to start a new session.
          </p>
        )}
        {resendStatus === 'no-session' && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', margin: '8px 0 0', lineHeight: 1.45 }}>
            We could not confirm a live session in this browser. Use{' '}
            <strong style={{ color: 'var(--ink)' }}>Email me a sign-in link</strong> below — it sends
            a fresh link without needing one.
          </p>
        )}

        <p style={stampStyle}>Link expires in 10 minutes · check spam if it does not arrive</p>
      </div>

      {/* Sessionless escape hatch. Works even when no Supabase session is
          present (the resend button cannot), and re-mints a link to the
          real destination via the forwarded next. */}
      <div style={recoveryCardStyle}>
        <p style={recoveryEyebrowStyle}>Cannot get the link?</p>
        <p style={recoveryBodyStyle}>
          If the confirmation email never arrives, send yourself a fresh one-time sign-in link. No
          session required.
        </p>
        <EmailLinkForm redirectTo={next} prefillEmail={prefillEmail} />
        <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--slate-200)' }}>
          <PurchaseRecoveryForm prefillEmail={prefillEmail} />
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--slate-600)', margin: 0 }}>
        <p style={{ margin: '0 0 8px' }}>
          Wrong email?{' '}
          <Link href="/auth/login" style={linkStyle}>
            Sign in again
          </Link>
        </p>
        <p style={{ margin: 0, fontSize: '0.8125rem' }}>
          Opened the link on a different device?{' '}
          <Link href="/auth/login" style={linkStyle}>
            Sign in here
          </Link>{' '}
          to confirm in this browser.
        </p>
      </div>
    </div>
  );
}
