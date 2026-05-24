// TeamHeader — title + seat-budget summary + buy-more CTA. PRD §6.7.

import Link from 'next/link';
import type { TeamDashboardSnapshot } from '@/lib/addie/team/dashboard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';

interface TeamHeaderProps {
  readonly snapshot: TeamDashboardSnapshot;
}

export function TeamHeader({ snapshot }: TeamHeaderProps) {
  const { team, seats, budget } = snapshot;
  const invitedCount = seats.filter((s) => s.seat_status === 'invited').length;
  const assignedCount = seats.filter((s) => s.seat_status === 'assigned').length;
  const revokedCount = seats.filter((s) => s.seat_status === 'revoked').length;

  return (
    <header className="border-b border-[var(--ledger-rule)] pb-6 mb-8">
      <KickerLabel tone="accent">TEAM ADMIN</KickerLabel>
      <h1 className="font-newsreader text-3xl text-[var(--ledger-ink)] mt-2">
        {team.name}
      </h1>
      <p className="mt-2 text-sm text-[var(--ledger-muted)]">
        Aggregate metrics only. The Institute does not expose what your
        team members write or save.
      </p>

      <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="SEATS PURCHASED" value={budget.purchased} />
        <Stat label="INVITED" value={invitedCount} />
        <Stat label="ASSIGNED" value={assignedCount} />
        <Stat label="REVOKED" value={revokedCount} muted />
      </dl>

      <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
        <p className="font-mono text-xs text-[var(--ledger-ink-2)] tabular-nums">
          {budget.remaining} OF {budget.purchased} SEATS REMAINING
        </p>
        <Link href="/foundation/gate?addseats=1">
          <LedgerButton variant="secondary" size="sm">
            BUY MORE SEATS
          </LedgerButton>
        </Link>
      </div>
    </header>
  );
}

interface StatProps {
  readonly label: string;
  readonly value: number;
  readonly muted?: boolean;
}

function Stat({ label, value, muted = false }: StatProps) {
  return (
    <div>
      <dt className="font-mono font-semibold text-[0.65rem] uppercase tracking-[0.18em] text-[var(--ledger-muted)]">
        {label}
      </dt>
      <dd
        className={
          'mt-1 font-mono text-2xl tabular-nums ' +
          (muted ? 'text-[var(--ledger-muted)]' : 'text-[var(--ledger-ink)]')
        }
      >
        {value}
      </dd>
    </div>
  );
}
