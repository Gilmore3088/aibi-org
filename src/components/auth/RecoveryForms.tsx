'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';

// Sessionless account-recovery forms, shared by /auth/login and the
// device-trust holding page /auth/confirm-device-pending.
//
//   - EmailLinkForm        → POST /api/auth/send-sign-in-link { email, next }
//   - PurchaseRecoveryForm → POST /api/auth/resend-purchase-link { email }
//
// Both endpoints ensureAuthUser idempotently, re-mint a magic link,
// rate-limit per IP+email, and return generic anti-enumeration copy.
// Neither requires a live Supabase session, so these forms double as the
// escape hatch for buyers stranded on the device-confirmation holding page.

// ── Shared inline styles (mockup tokens) ─────────────────────────────────────

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.02em',
  color: 'var(--slate-600)',
  display: 'block',
  marginBottom: 6,
};

const inputStyle: CSSProperties = {
  width: '100%',
  height: 44,
  padding: '0 14px',
  borderRadius: 12,
  border: '1px solid var(--slate-200)',
  background: '#fff',
  color: 'var(--ink)',
  fontSize: 15,
  fontFamily: 'inherit',
  outline: 'none',
};

const primaryBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  width: '100%',
  height: 48,
  borderRadius: 12,
  background: 'var(--gold)',
  color: 'var(--ink)',
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  marginTop: 4,
};

const ghostBtnStyle: CSSProperties = {
  ...primaryBtnStyle,
  background: '#fff',
  color: 'var(--ink)',
  border: '1px solid var(--slate-200)',
};

const alertStyle: CSSProperties = {
  borderRadius: 12,
  border: '1px solid rgba(180, 60, 50, 0.35)',
  background: 'rgba(180, 60, 50, 0.06)',
  color: '#7A1F18',
  padding: '10px 14px',
  fontSize: 14,
  lineHeight: 1.45,
};

const successStyle: CSSProperties = {
  borderRadius: 12,
  border: '1px solid rgba(4, 120, 87, 0.25)',
  background: 'rgba(4, 120, 87, 0.06)',
  color: '#047857',
  padding: '10px 14px',
  fontSize: 14,
  lineHeight: 1.45,
};

function Field({
  label,
  trailing,
  id,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; trailing?: ReactNode }) {
  // The id is decoupled from name so these recovery forms can share
  // /auth/login with the password sign-in form (all using name="email")
  // without colliding on a shared id (WCAG 4.1.1). Falls back to name when
  // an explicit id is not supplied.
  const fieldId = id ?? rest.name;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <label htmlFor={fieldId} style={labelStyle}>
          {label}
        </label>
        {trailing}
      </div>
      <input id={fieldId} style={inputStyle} {...rest} />
    </div>
  );
}

export function EmailLinkForm({
  redirectTo,
  prefillEmail,
}: {
  readonly redirectTo: string;
  readonly prefillEmail: string;
}) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setMessage(null);
    const data = new FormData(e.currentTarget);

    const response = await fetch('/api/auth/send-sign-in-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.get('email'),
        next: redirectTo,
      }),
    });

    const body = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
    if (response.ok) {
      setStatus('success');
      setMessage(body.message ?? 'Check your inbox for a one-time sign-in link.');
      return;
    }

    setStatus('error');
    setMessage(body.error ?? 'Could not send the sign-in link.');
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field
        id="signin-link-email"
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@yourbank.com"
        defaultValue={prefillEmail}
      />
      <button type="submit" style={primaryBtnStyle} disabled={status === 'submitting'}>
        {status === 'submitting' ? 'SENDING…' : 'EMAIL ME A SIGN-IN LINK'}
      </button>
      {message ? (
        <div
          role={status === 'error' ? 'alert' : 'status'}
          style={{
            ...(status === 'error' ? alertStyle : successStyle),
            marginTop: 12,
          }}
        >
          {message}
        </div>
      ) : null}
    </form>
  );
}

export function PurchaseRecoveryForm({ prefillEmail }: { readonly prefillEmail: string }) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setMessage(null);
    const data = new FormData(e.currentTarget);

    const response = await fetch('/api/auth/resend-purchase-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.get('email') }),
    });

    const body = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
    if (response.ok) {
      setStatus('success');
      setMessage(body.message ?? 'If that email has a purchase, a fresh access link is on its way.');
      return;
    }

    setStatus('error');
    setMessage(body.error ?? 'Could not request a fresh access link.');
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ marginTop: 18 }}>
      <p style={{ margin: '0 0 10px', color: 'var(--ink)', fontSize: 14, fontWeight: 700 }}>
        Bought something but cannot get in?
      </p>
      <p style={{ margin: '0 0 12px', color: 'var(--slate-600)', fontSize: 13, lineHeight: 1.45 }}>
        Send a fresh purchase access link to the email used at checkout.
      </p>
      <Field
        id="purchase-recovery-email"
        label="Purchase email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@yourbank.com"
        defaultValue={prefillEmail}
      />
      <button type="submit" style={ghostBtnStyle} disabled={status === 'submitting'}>
        {status === 'submitting' ? 'SENDING…' : 'RESEND PURCHASE LINK'}
      </button>
      {message ? (
        <div
          role={status === 'error' ? 'alert' : 'status'}
          style={{
            ...(status === 'error' ? alertStyle : successStyle),
            marginTop: 12,
          }}
        >
          {message}
        </div>
      ) : null}
    </form>
  );
}
