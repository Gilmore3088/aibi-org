'use client';

// AddSeatsForm — admin requests N additional seats; we POST to the
// existing /api/addie/checkout/team endpoint (quantity = N) and redirect
// to the returned Stripe Checkout URL. The webhook will provision the
// new seats onto the existing team_id via metadata.addie_team_id.

import { useState } from 'react';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';

interface AddSeatsFormProps {
  readonly teamId: string;
  readonly unitPriceCents: number;
}

export function AddSeatsForm({ unitPriceCents }: AddSeatsFormProps) {
  const [seats, setSeats] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCents = seats * unitPriceCents;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (seats < 1) {
      setError('At least one seat.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      // The /api/addie/checkout/team route enforces a 10-seat minimum
      // for new teams. For add-on purchases on an existing team we ask
      // for at least one. Until a dedicated add-on endpoint exists, we
      // route the buyer to /foundation/contact-sales for sub-10 add-ons
      // and through the team checkout endpoint for 10+.
      if (seats < 10) {
        window.location.href = `/foundation/contact-sales?topic=add_seats&seats=${seats}`;
        return;
      }
      const res = await fetch('/api/addie/checkout/team', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ seats, email: '', team_name: '' }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !json.url) {
        setError(json.error ?? `HTTP ${res.status}`);
        return;
      }
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1">
        <span className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)]">
          Additional seats
        </span>
        <input
          type="number"
          min={1}
          max={1000}
          value={seats}
          onChange={(e) => setSeats(Math.max(1, Number(e.target.value) || 1))}
          className="w-28 px-3 py-2 text-sm border border-[var(--ledger-rule)] rounded-[2px] bg-[var(--ledger-paper)] text-[var(--ledger-ink)] tabular-nums focus:outline focus:outline-2 focus:outline-[var(--ledger-ink)]"
        />
      </label>
      <div className="flex flex-col">
        <span className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)]">
          Total
        </span>
        <span className="font-serif text-lg text-[var(--ledger-ink)] tabular-nums">
          ${(totalCents / 100).toLocaleString('en-US')}
        </span>
      </div>
      <LedgerButton type="submit" variant="primary" size="md" disabled={busy}>
        {busy ? 'Loading…' : 'Continue to checkout →'}
      </LedgerButton>
      {error ? (
        <p className="w-full text-sm text-[var(--ledger-weak)]">{error}</p>
      ) : null}
    </form>
  );
}
