'use client';

// DeclineOption — the "Maybe later" door. Routes to the $99 In-Depth
// Readiness Assessment via /api/addie/checkout/assessment.

import { useState } from 'react';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

export function DeclineOption() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decline() {
    setPending(true);
    setError(null);
    try {
      // 1. Log the decline so the funnel attributes the fork correctly.
      await fetch('/api/addie/gate/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }).catch(() => {
        /* best-effort */
      });
      // 2. Send the learner into the $99 In-Depth assessment checkout.
      const res = await fetch('/api/addie/checkout/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        setError(body.message ?? body.error ?? `HTTP ${res.status}`);
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError('Checkout returned no redirect URL.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown');
    } finally {
      setPending(false);
    }
  }

  return (
    <LedgerCard className="p-6 flex flex-col h-full">
      <KickerLabel tone="muted">Maybe later</KickerLabel>
      <h2 className="mt-2 font-serif text-2xl text-[var(--ledger-ink)]">
        Find out where you stand
      </h2>
      <p className="mt-3 text-sm text-[var(--ledger-ink-2)] flex-1">
        The $99 Readiness Assessment scores 48 questions across 8 dimensions and returns four
        deliverables: scorecard, plan, ideas + prompts, and next-step CTAs.
      </p>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-[var(--ledger-weak)]">{error}</p>
      ) : null}
      <div className="mt-4">
        <LedgerButton variant="secondary" onClick={decline} loading={pending} disabled={pending}>
          Take the assessment · $99
        </LedgerButton>
      </div>
    </LedgerCard>
  );
}
