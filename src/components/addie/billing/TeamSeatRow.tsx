'use client';

// One row in the team-billing seat roster. Lets the admin revoke a seat
// with prorated refund (POST /api/addie/billing/team/seats/revoke).

import { useState } from 'react';
import type { SeatProgressRow } from '@/lib/addie/team/dashboard';

interface TeamSeatRowProps {
  readonly seat: SeatProgressRow;
}

function statusTone(status: SeatProgressRow['seat_status']): string {
  switch (status) {
    case 'assigned':
      return 'text-[var(--ledger-ink)]';
    case 'invited':
      return 'text-[var(--ledger-muted)]';
    case 'revoked':
      return 'text-[var(--ledger-weak)]';
    default:
      return 'text-[var(--ledger-muted)]';
  }
}

function formatActivity(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function TeamSeatRow({ seat }: TeamSeatRowProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [revoked, setRevoked] = useState(seat.seat_status === 'revoked');

  async function revoke() {
    const ok = window.confirm(
      `Revoke seat for ${seat.invited_email}? If a refund is owed, it will be issued to the original payment method.`,
    );
    if (!ok) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/addie/billing/team/seats/revoke', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ seat_id: seat.seat_id }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        revoked?: boolean;
        refund?: { refunded?: boolean; amount_cents?: number; reason?: string };
        error?: string;
      };
      if (!res.ok || !json.revoked) {
        setMessage(`Could not revoke (${json.error ?? `HTTP ${res.status}`}).`);
        return;
      }
      setRevoked(true);
      const refundedCents = json.refund?.amount_cents ?? 0;
      if (json.refund?.refunded && refundedCents > 0) {
        setMessage(`Revoked. Refunded $${(refundedCents / 100).toFixed(2)}.`);
      } else if (json.refund?.reason === 'access_window_expired') {
        setMessage('Revoked. Access window expired — no refund issued.');
      } else {
        setMessage('Revoked. No refund issued.');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }

  const status = revoked ? 'revoked' : seat.seat_status;

  return (
    <tr className="border-t border-[var(--ledger-rule)] first:border-t-0">
      <td className="px-4 py-2 text-[var(--ledger-ink)]">{seat.invited_email}</td>
      <td className={`px-4 py-2 font-mono uppercase tracking-[0.16em] text-[0.65rem] ${statusTone(status)}`}>
        {status}
      </td>
      <td className="px-4 py-2 tabular-nums text-[var(--ledger-muted)]">
        {formatActivity(seat.last_activity_at)}
      </td>
      <td className="px-4 py-2 text-right">
        {status === 'revoked' ? (
          <span className="text-[var(--ledger-muted)] text-sm">{message ?? '—'}</span>
        ) : (
          <>
            <button
              type="button"
              onClick={revoke}
              disabled={busy}
              className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-weak)] hover:underline disabled:opacity-50"
            >
              {busy ? 'Revoking…' : 'Revoke →'}
            </button>
            {message ? (
              <p className="mt-1 text-[0.7rem] text-[var(--ledger-muted)]">{message}</p>
            ) : null}
          </>
        )}
      </td>
    </tr>
  );
}
