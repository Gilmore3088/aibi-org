'use client';

// EmailOptionForm — the "Email-to-keep" door of the gate fork.
// Posts to /api/addie/gate/capture-email; on success surfaces a confirmation.

import { useState } from 'react';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { LedgerInput } from '@/components/addie/shared/LedgerInput';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

export function EmailOptionForm() {
  const [email, setEmail] = useState('');
  const [optIn, setOptIn] = useState(false);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<'idle' | 'captured' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/addie/gate/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, marketing_opt_in: optIn }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? `HTTP ${res.status}`);
        setState('error');
        return;
      }
      setState('captured');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown');
      setState('error');
    } finally {
      setPending(false);
    }
  }

  return (
    <LedgerCard className="p-6 flex flex-col h-full">
      <KickerLabel tone="muted">Not yet</KickerLabel>
      <h2 className="mt-2 font-serif text-2xl text-[var(--ledger-ink)]">Keep what you built</h2>
      <p className="mt-3 text-sm text-[var(--ledger-ink-2)] flex-1">
        Add your work email and we&apos;ll save your Toolbox artifacts and email you a recap. No
        promo blasts — opt in below if you want the Brief.
      </p>
      {state === 'captured' ? (
        <p className="mt-4 text-sm text-[var(--ledger-ink)]">
          Saved. Check your inbox for the recap.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <LedgerInput
            label="Work email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            error={state === 'error' ? error : null}
          />
          <label className="flex items-start gap-2 text-sm text-[var(--ledger-ink-2)]">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => setOptIn(e.target.checked)}
              className="mt-1"
            />
            <span>Send me the AI Banking Brief (monthly, unsubscribe any time).</span>
          </label>
          <LedgerButton type="submit" variant="primary" loading={pending} disabled={pending}>
            Save my work
          </LedgerButton>
        </form>
      )}
    </LedgerCard>
  );
}
