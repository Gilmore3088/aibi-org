'use client';

// ResendInviteButton — re-fires invite email for an outstanding seat.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';

interface ResendInviteButtonProps {
  readonly seatId: string;
  readonly inviteeEmail: string;
}

export function ResendInviteButton({ seatId, inviteeEmail }: ResendInviteButtonProps) {
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function handleResend() {
    setError(null);
    try {
      const res = await fetch(
        `/api/addie/team/seats/${encodeURIComponent(seatId)}/resend`,
        { method: 'POST' },
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { detail?: string; error?: string };
        throw new Error(body.detail ?? body.error ?? `HTTP ${res.status}`);
      }
      setStatus('sent');
      startTransition(() => router.refresh());
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Resend failed');
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <LedgerButton
        variant="tertiary"
        size="sm"
        loading={pending}
        onClick={handleResend}
        aria-label={`Resend invite to ${inviteeEmail}`}
      >
        {status === 'sent' ? 'SENT' : 'RESEND'}
      </LedgerButton>
      {status === 'error' && error ? (
        <span role="alert" className="text-xs text-[var(--ledger-weak)]">
          {error}
        </span>
      ) : null}
    </span>
  );
}
