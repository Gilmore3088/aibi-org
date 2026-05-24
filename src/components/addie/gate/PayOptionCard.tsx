'use client';

// PayOptionCard — the "Pay" door of the gate fork. Two paths: $295 individual
// or $199/seat team (10-seat minimum). Calls existing checkout routes.

import { useState } from 'react';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

type PayKind = 'individual' | 'team';

interface PayOptionCardProps {
  readonly kind: PayKind;
}

const COPY: Record<PayKind, { kicker: string; title: string; price: string; body: string; cta: string; path: string }> = {
  individual: {
    kicker: 'Continue',
    title: 'Foundation Course',
    price: '$295',
    body: 'M4 + M5 access. Unlimited Toolbox. Lifetime access. One learner.',
    cta: 'Pay $295',
    path: '/api/addie/checkout/individual',
  },
  team: {
    kicker: 'Continue · Team',
    title: 'Foundation for your team',
    price: '$199 / seat',
    body: 'Same course, billed by seat (10-seat minimum). You invite the team after checkout.',
    cta: 'Buy seats',
    path: '/api/addie/checkout/team',
  },
};

export function PayOptionCard({ kind }: PayOptionCardProps) {
  const c = COPY[kind];
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(c.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kind === 'team' ? { seats: 10 } : {}),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
          detail?: string;
        };
        // Surface the most specific message available. `detail` carries the
        // underlying reason (e.g. "STRIPE_SECRET_KEY is not set") so the
        // operator/learner sees an actionable cause instead of "HTTP 500".
        setError(
          body.detail ?? body.message ?? body.error ?? `Checkout failed (HTTP ${res.status}).`,
        );
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
    <LedgerCard variant="feature" className="p-6 flex flex-col h-full">
      <KickerLabel tone="accent">{c.kicker}</KickerLabel>
      <h2 className="mt-2 font-serif text-2xl text-[var(--ledger-ink)]">{c.title}</h2>
      <p className="mt-2 font-mono text-base text-[var(--ledger-ink)]">{c.price}</p>
      <p className="mt-3 text-sm text-[var(--ledger-ink-2)] flex-1">{c.body}</p>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-[var(--ledger-weak)]">{error}</p>
      ) : null}
      <div className="mt-4">
        <LedgerButton variant="primary" onClick={checkout} loading={pending} disabled={pending}>
          {c.cta}
        </LedgerButton>
      </div>
    </LedgerCard>
  );
}
