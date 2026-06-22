'use client';

import { useState } from 'react';

const ISSUE_OPTIONS = [
  ['access', 'I cannot access my purchase'],
  ['missing_email', 'I did not receive the purchase email'],
  ['refund_request', 'I want to request a refund'],
  ['team_seats', 'I need help with team seats'],
  ['other', 'Something else'],
] as const;

export function PurchaseHelpForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus('submitting');
    setMessage(null);

    const response = await fetch('/api/support/purchase-help', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.get('email'),
        category: data.get('issueType'),
        stripeSessionId: data.get('stripeSessionId'),
        message: data.get('message'),
      }),
    });

    if (response.ok) {
      form.reset();
      setStatus('success');
      setMessage('Received. We will review the details and reply from hello@aibankinginstitute.com.');
      return;
    }

    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setStatus('error');
    setMessage(body.error ?? 'Could not submit the request. Email hello@aibankinginstitute.com directly.');
  }

  return (
    <form className="purchase-help__form" onSubmit={onSubmit}>
      <label>
        <span>Purchase email</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        <span>Issue</span>
        <select name="issueType" defaultValue="access">
          {ISSUE_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Checkout/session reference</span>
        <input name="stripeSessionId" placeholder="Optional: cs_live_..." />
      </label>
      <label>
        <span>What happened?</span>
        <textarea name="message" minLength={8} maxLength={3000} rows={6} required />
      </label>
      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Submitting...' : 'Send support request'}
      </button>
      {message ? <p className={`purchase-help__message is-${status}`}>{message}</p> : null}
    </form>
  );
}
