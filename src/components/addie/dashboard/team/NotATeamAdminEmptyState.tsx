// NotATeamAdminEmptyState — shown to signed-in users who don't own a team.

import Link from 'next/link';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

export function NotATeamAdminEmptyState() {
  return (
    <LedgerCard variant="feature" className="p-8 max-w-2xl mx-auto">
      <KickerLabel tone="accent">TEAM ADMIN</KickerLabel>
      <h1 className="font-serif text-3xl text-[var(--ledger-ink)] mt-2">
        No team on this account
      </h1>
      <p className="mt-3 text-[var(--ledger-ink-2)]">
        This dashboard is for institutions that purchased Foundation seats
        for their staff. If you signed in with the wrong account, sign out
        and try again. Otherwise, you can purchase seats below.
      </p>
      <div className="mt-6">
        <Link href="/foundation/gate">
          <LedgerButton variant="primary" size="md">
            BUY TEAM SEATS
          </LedgerButton>
        </Link>
      </div>
      <p className="mt-4 text-xs text-[var(--ledger-muted)]">
        $199 per seat · 10-seat minimum
      </p>
    </LedgerCard>
  );
}
