// /foundation/dashboard/team — team admin dashboard. PRD §6.7.
//
// Auth-gated server component. Admin must own a team in addie.teams.
// Reads counts only — no artifact bodies or sandbox transcripts (FR-D4).

import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';
import { loadTeamDashboard } from '@/lib/addie/team/dashboard';
import { TeamHeader } from '@/components/addie/dashboard/team/TeamHeader';
import { SeatsTable } from '@/components/addie/dashboard/team/SeatsTable';
import { InviteSeatsForm } from '@/components/addie/dashboard/team/InviteSeatsForm';
import { NotATeamAdminEmptyState } from '@/components/addie/dashboard/team/NotATeamAdminEmptyState';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function TeamDashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-10">
        <LedgerCard variant="standard" className="p-6">
          <KickerLabel tone="accent">TEAM ADMIN</KickerLabel>
          <p className="mt-2 text-[var(--ledger-ink-2)]">
            Authentication is not configured in this environment.
          </p>
        </LedgerCard>
      </main>
    );
  }

  const supabase = createServerClientWithCookies(cookies());
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user ?? null;

  if (!user) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-10">
        <LedgerCard variant="feature" className="p-8 max-w-2xl mx-auto">
          <KickerLabel tone="accent">TEAM ADMIN</KickerLabel>
          <h1 className="font-serif text-3xl text-[var(--ledger-ink)] mt-2">
            Sign in to manage your team
          </h1>
          <p className="mt-3 text-[var(--ledger-ink-2)]">
            Use the admin email tied to your team purchase.
          </p>
          <div className="mt-6">
            <Link href="/auth/login?next=/foundation/dashboard/team">
              <LedgerButton variant="primary">SIGN IN</LedgerButton>
            </Link>
          </div>
        </LedgerCard>
      </main>
    );
  }

  const snapshot = await loadTeamDashboard(user.id);
  if (!snapshot) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-10">
        <NotATeamAdminEmptyState />
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <TeamHeader snapshot={snapshot} />

      <section aria-labelledby="seats-heading" className="mt-4">
        <h2
          id="seats-heading"
          className="font-serif text-xl text-[var(--ledger-ink)] mb-3"
        >
          Seats
        </h2>
        <SeatsTable seats={snapshot.seats} />
      </section>

      <section aria-labelledby="invite-heading" className="mt-10">
        <h2
          id="invite-heading"
          className="font-serif text-xl text-[var(--ledger-ink)] mb-3"
        >
          Invite team members
        </h2>
        <LedgerCard variant="standard" className="p-5">
          <InviteSeatsForm
            teamId={snapshot.team.id}
            remainingSeats={snapshot.budget.remaining}
          />
        </LedgerCard>
      </section>

      <footer className="mt-10 pt-6 border-t border-[var(--ledger-rule)]">
        <p className="text-xs text-[var(--ledger-muted)]">
          Aggregate metrics only. The Institute does not expose what your
          team members write or save.
        </p>
      </footer>
    </main>
  );
}
