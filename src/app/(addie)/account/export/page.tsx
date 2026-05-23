// /account/export — surfaces the export request CTA. Calls a stub API
// (501) until the operator runbook + real export pipeline ship.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';

export default function AccountExportPage() {
  const [state, setState] = useState<'idle' | 'pending' | 'noimpl' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function request() {
    setState('pending');
    try {
      const res = await fetch('/api/account/export', { method: 'POST' });
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
      <h1 className="mt-2 font-serif text-3xl text-[var(--ledger-ink)]">Export your data</h1>
      <p className="mt-3 text-[var(--ledger-ink-2)]">
        You can export every Toolbox artifact and a record of your activity. Email is sent within 24
        hours.
      </p>
      <div className="mt-5">
        <LedgerButton variant="primary" onClick={request} loading={state === 'pending'}>
          Request export
        </LedgerButton>
      </div>
      {message ? (
        <p className="mt-4 text-sm text-[var(--ledger-ink-2)]">{message}</p>
      ) : null}
    </main>
  );
}
