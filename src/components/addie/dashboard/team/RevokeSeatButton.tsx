'use client';

// RevokeSeatButton — destructive action with inline confirm. PRD §6.7.
// Client component. Calls /api/addie/team/seats/revoke.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';

interface RevokeSeatButtonProps {
  readonly seatId: string;
  readonly inviteeEmail: string;
}

export function RevokeSeatButton({ seatId, inviteeEmail }: RevokeSeatButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function handleRevoke() {
    setError(null);
    try {
      const res = await fetch('/api/addie/team/seats/revoke', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ seat_id: seatId }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { detail?: string; error?: string };
        throw new Error(body.detail ?? body.error ?? `HTTP ${res.status}`);
      }
      setConfirming(false);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revoke failed');
    }
  }

  if (!confirming) {
    return (
      <LedgerButton
        variant="tertiary"
        size="sm"
        onClick={() => setConfirming(true)}
        aria-label={`Revoke seat for ${inviteeEmail}`}
      >
        REVOKE
      </LedgerButton>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--ledger-weak)]">
        SURE?
      </span>
      <LedgerButton
        variant="destructive"
        size="sm"
        loading={pending}
        onClick={handleRevoke}
      >
        CONFIRM
      </LedgerButton>
      <LedgerButton
        variant="tertiary"
        size="sm"
        onClick={() => {
          setConfirming(false);
          setError(null);
        }}
      >
        CANCEL
      </LedgerButton>
      {error ? (
        <span role="alert" className="text-xs text-[var(--ledger-weak)]">
          {error}
        </span>
      ) : null}
    </span>
  );
}
