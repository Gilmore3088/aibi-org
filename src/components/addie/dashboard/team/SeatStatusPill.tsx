// SeatStatusPill — invited / assigned / revoked indicator. Oxblood for revoked.

import type { SeatStatus } from '@/lib/addie/team/dashboard';

interface SeatStatusPillProps {
  readonly status: SeatStatus;
}

const STYLES: Record<SeatStatus, string> = {
  invited:
    'bg-[var(--ledger-parch)] text-[var(--ledger-ink-2)] border-[var(--ledger-rule-strong)]',
  assigned:
    'bg-[var(--ledger-tape)] text-[var(--ledger-ink)] border-[var(--ledger-accent)]',
  revoked:
    'bg-[var(--ledger-paper)] text-[var(--ledger-weak)] border-[var(--ledger-weak)]',
};

const LABELS: Record<SeatStatus, string> = {
  invited: 'INVITED',
  assigned: 'ASSIGNED',
  revoked: 'REVOKED',
};

export function SeatStatusPill({ status }: SeatStatusPillProps) {
  return (
    <span
      data-status={status}
      className={
        'inline-flex items-center font-mono font-semibold text-[0.65rem] uppercase ' +
        'tracking-[0.16em] border rounded-[2px] px-2 py-0.5 ' +
        STYLES[status]
      }
    >
      {LABELS[status]}
    </span>
  );
}
