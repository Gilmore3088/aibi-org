// /account/delete — initiate the 30-day soft-delete flow. Stub backend.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';

export default function AccountDeletePage() {
  const [confirmed, setConfirmed] = useState(false);
  const [state, setState] = useState<'idle' | 'pending' | 'noimpl' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setState('pending');
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (res.status === 501) {
        setMessage(body.message ?? 'Not implemented yet.');
        setState('noimpl');
        return;
      }
      setMessage(body.message ?? `HTTP ${res.status}`);
      setState('error');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'unknown');
      setState('error');
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <Link
        href="/account"
        className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
      >
        ← Account
      </Link>
      <KickerLabel tone="muted">Your data</KickerLabel>
      <h1 className="mt-2 font-serif text-3xl text-[var(--ledger-ink)]">Delete your account</h1>
      <p className="mt-3 text-[var(--ledger-ink-2)]">
        Your account is anonymized immediately. Toolbox artifacts, learner profile, and event
        history are purged after 30 days. Paid course access ends on confirmation.
      </p>
      <label className="mt-5 flex items-start gap-2 text-sm text-[var(--ledger-ink-2)]">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1"
        />
        <span>I understand this cannot be undone after 30 days.</span>
      </label>
      <div className="mt-5">
        <LedgerButton
          variant="destructive"
          onClick={submit}
          disabled={!confirmed || state === 'pending'}
          loading={state === 'pending'}
        >
          Begin deletion
        </LedgerButton>
      </div>
      {message ? (
        <p className="mt-4 text-sm text-[var(--ledger-ink-2)]">{message}</p>
      ) : null}
    </main>
  );
}
