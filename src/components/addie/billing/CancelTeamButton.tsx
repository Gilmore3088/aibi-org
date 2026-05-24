'use client';

// CancelTeamButton — destructive. Two-step confirm (button → modal →
// type team name) before posting to /api/addie/billing/team/cancel.

import { useState } from 'react';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';

interface CancelTeamButtonProps {
  readonly teamId: string;
  readonly teamName: string;
}

export function CancelTeamButton({ teamId, teamName }: CancelTeamButtonProps) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/addie/billing/team/cancel', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ team_id: teamId, confirm: true }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        cancelled?: boolean;
        seats_revoked?: number;
        refund?: { refunded?: boolean; amount_cents?: number; reason?: string };
        notified_emails?: string[];
        error?: string;
      };
      if (!res.ok || !json.cancelled) {
        setError(json.error ?? `HTTP ${res.status}`);
        return;
      }
      const refunded = json.refund?.amount_cents ?? 0;
      const refundNote =
        json.refund?.refunded && refunded > 0
          ? `Refunded $${(refunded / 100).toFixed(2)} to the original payment method.`
          : 'No refund issued (access window expired or already used).';
      setResult(
        `Team cancelled. ${json.seats_revoked ?? 0} seat(s) revoked. ${refundNote}`,
      );
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return <p className="text-sm text-[var(--ledger-ink)]">{result}</p>;
  }

  if (!open) {
    return (
      <LedgerButton variant="destructive" size="md" onClick={() => setOpen(true)}>
        Cancel team →
      </LedgerButton>
    );
  }

  return (
    <div className="border border-[var(--ledger-weak)] rounded-[3px] p-4 bg-[var(--ledger-paper)]">
      <p className="text-sm text-[var(--ledger-ink)]">
        Type <span className="font-mono">{teamName}</span> to confirm cancellation.
      </p>
      <input
        type="text"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        className="mt-2 w-full px-3 py-2 text-sm border border-[var(--ledger-rule)] rounded-[2px] bg-[var(--ledger-paper)] text-[var(--ledger-ink)] focus:outline focus:outline-2 focus:outline-[var(--ledger-weak)]"
        placeholder={teamName}
      />
      <div className="mt-3 flex gap-2">
        <LedgerButton
          variant="destructive"
          size="md"
          onClick={cancel}
          disabled={busy || typed.trim() !== teamName.trim()}
        >
          {busy ? 'Cancelling…' : 'Confirm cancellation'}
        </LedgerButton>
        <LedgerButton
          variant="tertiary"
          size="md"
          onClick={() => {
            setOpen(false);
            setTyped('');
            setError(null);
          }}
          disabled={busy}
        >
          Keep team
        </LedgerButton>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-[var(--ledger-weak)]">{error}</p>
      ) : null}
    </div>
  );
}
