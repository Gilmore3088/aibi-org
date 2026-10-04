'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'sending' | 'done' | 'error';

export function BriefingSubscribe() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/briefings/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return <p className="ax-masthead-lede">You are on the list. The next digest arrives Monday.</p>;
  }

  return (
    <form onSubmit={onSubmit} aria-label="Get the weekly briefings digest" className="ax-actions">
      <label htmlFor="briefing-email" className="ax-k">
        Weekly digest: the week&apos;s briefings in one email
      </label>
      <input
        id="briefing-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@yourbank.com"
      />
      <button type="submit" className="ax-tier-cta" disabled={status === 'sending'}>
        {status === 'sending' ? 'Subscribing…' : 'Send me the digest'}
      </button>
      <p className="ax-card-meta">One email a week. Unsubscribe any time.</p>
      {status === 'error' && <p role="alert">Something went wrong. Please try again.</p>}
    </form>
  );
}
