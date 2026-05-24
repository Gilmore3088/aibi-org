// /account/billing/team — team admin billing surface.
//
// Server component. Renders:
//   • Team summary (name, seats purchased, used, available, spend)
//   • Seat roster with revoke-with-refund action
//   • Add seats CTA (redirects through existing checkout flow)
//   • Invoice history
//   • Cancel team with confirmation

import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  createServerClientWithCookies,
  isSupabaseConfigured,
} from '@/lib/supabase/client';
import {
  isPreviewAuthBypassEnabled,
  PREVIEW_BYPASS_USER,
} from '@/lib/auth/previewBypass';
import { loadTeamDashboard, type TeamDashboardSnapshot } from '@/lib/addie/team/dashboard';
import { formatAmount, type InvoiceListItem } from '@/lib/addie/billing/types';
import { SEAT_UNIT_PRICE_CENTS } from '@/lib/addie/billing/proration';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { TeamSeatRow } from '@/components/addie/billing/TeamSeatRow';
import { CancelTeamButton } from '@/components/addie/billing/CancelTeamButton';
import { AddSeatsForm } from '@/components/addie/billing/AddSeatsForm';
import { PortalLinkButton } from '@/components/addie/billing/PortalLinkButton';

export const dynamic = 'force-dynamic';

interface TeamBillingView {
  signedIn: boolean;
  hasTeam: boolean;
  email: string | null;
  snapshot: TeamDashboardSnapshot | null;
  invoices: InvoiceListItem[];
  invoicesError: string | null;
  bypass: boolean;
}

function fakeSnapshot(): TeamDashboardSnapshot {
  return {
    team: {
      id: 'preview-team',
      name: 'Preview Community Bank',
      seats_purchased: 12,
      admin_user_id: PREVIEW_BYPASS_USER.id,
      stripe_subscription_id: null,
    },
    seats: [
      {
        seat_id: 'seat-1',
        invited_email: 'admin@previewbank.com',
        seat_status: 'assigned',
        user_id: PREVIEW_BYPASS_USER.id,
        track: 'leadership',
        lessons_completed: 6,
        sandbox_runs: 4,
        artifacts_saved: 2,
        artifacts_reused: 1,
        last_activity_at: new Date().toISOString(),
      },
      {
        seat_id: 'seat-2',
        invited_email: 'a.banker@previewbank.com',
        seat_status: 'invited',
        user_id: null,
        track: null,
        lessons_completed: 0,
        sandbox_runs: 0,
        artifacts_saved: 0,
        artifacts_reused: 0,
        last_activity_at: null,
      },
    ],
    budget: { purchased: 12, used: 2, remaining: 10 },
  };
}

async function load(): Promise<TeamBillingView> {
  const empty: TeamBillingView = {
    signedIn: false,
    hasTeam: false,
    email: null,
    snapshot: null,
    invoices: [],
    invoicesError: null,
    bypass: false,
  };
  if (!isSupabaseConfigured()) {
    if (isPreviewAuthBypassEnabled()) {
      return {
        ...empty,
        signedIn: true,
        hasTeam: true,
        email: PREVIEW_BYPASS_USER.email,
        snapshot: fakeSnapshot(),
        bypass: true,
      };
    }
    return empty;
  }
  let user_id: string | null = null;
  let email: string | null = null;
  try {
    const cookieStore = await cookies();
    const supa = createServerClientWithCookies(cookieStore);
    const { data } = await supa.auth.getUser();
    if (data.user) {
      user_id = data.user.id;
      email = data.user.email ?? null;
    }
  } catch (err) {
    console.warn('[account/billing/team] auth read failed:', err);
  }
  if (!user_id) {
    if (isPreviewAuthBypassEnabled()) {
      return {
        ...empty,
        signedIn: true,
        hasTeam: true,
        email: PREVIEW_BYPASS_USER.email,
        snapshot: fakeSnapshot(),
        bypass: true,
      };
    }
    return empty;
  }

  let snapshot: TeamDashboardSnapshot | null = null;
  try {
    snapshot = await loadTeamDashboard(user_id);
  } catch (err) {
    console.warn('[account/billing/team] dashboard load failed:', err);
  }

  let invoices: InvoiceListItem[] = [];
  let invoicesError: string | null = null;
  if (
    snapshot &&
    process.env.SKIP_STRIPE !== 'true' &&
    process.env.STRIPE_SECRET_KEY &&
    email
  ) {
    try {
      const { resolveStripeCustomerId } = await import('@/lib/addie/billing/portal');
      const { listCustomerInvoices } = await import('@/lib/addie/billing/invoices');
      const customer = await resolveStripeCustomerId({ user_id, email });
      if (customer) invoices = await listCustomerInvoices(customer);
    } catch (err) {
      invoicesError = err instanceof Error ? err.message : 'unknown';
    }
  }

  return {
    signedIn: true,
    hasTeam: Boolean(snapshot),
    email,
    snapshot,
    invoices,
    invoicesError,
    bypass: false,
  };
}

function formatDollars(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}

function formatDate(iso: string | number): string {
  const d = typeof iso === 'number' ? new Date(iso * 1000) : new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function TeamBillingPage() {
  const v = await load();

  if (!v.signedIn) {
    return (
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <h1 className="font-serif text-3xl text-[var(--ledger-ink)]">Team billing</h1>
        <p className="mt-3 text-[var(--ledger-ink-2)]">
          Sign in to view your team&apos;s billing.{' '}
          <Link href="/auth/login" className="underline underline-offset-4">
            Go to sign in
          </Link>
          .
        </p>
      </main>
    );
  }

  if (!v.hasTeam || !v.snapshot) {
    return (
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <h1 className="font-serif text-3xl text-[var(--ledger-ink)]">Team billing</h1>
        <p className="mt-3 text-[var(--ledger-ink-2)]">
          You don&apos;t administer a team yet. Team purchases start at 10 seats.{' '}
          <Link href="/foundation/pricing" className="underline underline-offset-4">
            See team pricing →
          </Link>
        </p>
      </main>
    );
  }

  const { team, seats, budget } = v.snapshot;
  const spendCents = budget.purchased * SEAT_UNIT_PRICE_CENTS;

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <header className="border-b border-[var(--ledger-rule)] pb-5 mb-6">
        <KickerLabel tone="muted">Account · Team billing</KickerLabel>
        <h1 className="mt-2 font-serif text-3xl text-[var(--ledger-ink)]">{team.name}</h1>
        <p className="mt-2 text-sm text-[var(--ledger-muted)]">
          Admin: {v.email ?? '—'}
          {v.bypass ? (
            <span className="ml-2 font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-accent)]">
              Preview bypass
            </span>
          ) : null}
        </p>
      </header>

      <section className="mb-10 grid gap-3 sm:grid-cols-3">
        <LedgerCard className="p-4">
          <KickerLabel tone="muted">Seats purchased</KickerLabel>
          <p className="mt-1 font-serif text-3xl text-[var(--ledger-ink)] tabular-nums">
            {budget.purchased}
          </p>
        </LedgerCard>
        <LedgerCard className="p-4">
          <KickerLabel tone="muted">In use</KickerLabel>
          <p className="mt-1 font-serif text-3xl text-[var(--ledger-ink)] tabular-nums">
            {budget.used}
          </p>
          <p className="mt-1 text-sm text-[var(--ledger-muted)]">
            {budget.remaining} available
          </p>
        </LedgerCard>
        <LedgerCard className="p-4">
          <KickerLabel tone="muted">Annual spend</KickerLabel>
          <p className="mt-1 font-serif text-3xl text-[var(--ledger-ink)] tabular-nums">
            {formatDollars(spendCents)}
          </p>
          <p className="mt-1 text-sm text-[var(--ledger-muted)]">
            {budget.purchased} × ${SEAT_UNIT_PRICE_CENTS / 100}/seat
          </p>
        </LedgerCard>
      </section>

      <section className="mb-10">
        <div className="flex items-baseline justify-between">
          <KickerLabel tone="muted">Seats</KickerLabel>
          <Link
            href="/foundation/dashboard/team"
            className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-accent)] hover:underline"
          >
            Invite seats →
          </Link>
        </div>
        <div className="mt-3 border border-[var(--ledger-rule)] rounded-[3px] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--ledger-parch)] border-b border-[var(--ledger-rule)]">
              <tr>
                <th className="text-left font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] px-4 py-2">
                  Email
                </th>
                <th className="text-left font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] px-4 py-2">
                  Status
                </th>
                <th className="text-left font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] px-4 py-2">
                  Last activity
                </th>
                <th className="text-right font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] px-4 py-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {seats.map((s) => (
                <TeamSeatRow key={s.seat_id} seat={s} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <KickerLabel tone="muted">Add seats</KickerLabel>
        <LedgerCard className="mt-3 p-5">
          <p className="text-sm text-[var(--ledger-ink-2)]">
            Buy additional seats at ${SEAT_UNIT_PRICE_CENTS / 100} each. Stripe will
            handle the checkout; new seats post to this team on successful payment.
          </p>
          <div className="mt-4">
            <AddSeatsForm teamId={team.id} unitPriceCents={SEAT_UNIT_PRICE_CENTS} />
          </div>
        </LedgerCard>
      </section>

      <section className="mb-10">
        <KickerLabel tone="muted">Invoice history</KickerLabel>
        {v.invoicesError ? (
          <p className="mt-3 text-sm text-[var(--ledger-weak)]">
            Could not load invoices: {v.invoicesError}
          </p>
        ) : v.invoices.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--ledger-muted)]">
            No invoices on file yet.
          </p>
        ) : (
          <div className="mt-3 border border-[var(--ledger-rule)] rounded-[3px] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--ledger-parch)] border-b border-[var(--ledger-rule)]">
                <tr>
                  <th className="text-left font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] px-4 py-2">
                    Date
                  </th>
                  <th className="text-right font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] px-4 py-2">
                    Amount
                  </th>
                  <th className="text-left font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] px-4 py-2">
                    Status
                  </th>
                  <th className="text-right font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] px-4 py-2">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody>
                {v.invoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-[var(--ledger-rule)] first:border-t-0">
                    <td className="px-4 py-2 tabular-nums text-[var(--ledger-ink)]">
                      {formatDate(inv.created)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-[var(--ledger-ink)]">
                      {formatAmount(inv.amount_cents, inv.currency)}
                    </td>
                    <td className="px-4 py-2 text-[var(--ledger-muted)]">{inv.status}</td>
                    <td className="px-4 py-2 text-right">
                      {inv.pdf_url ? (
                        <a
                          href={inv.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-accent)] hover:underline"
                        >
                          Open →
                        </a>
                      ) : (
                        <span className="text-[var(--ledger-muted)]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-3">
          <PortalLinkButton variant="tertiary" label="Manage in Stripe portal →" />
        </div>
      </section>

      <section className="mb-12">
        <KickerLabel tone="muted">Danger zone</KickerLabel>
        <LedgerCard variant="recessed" className="mt-3 p-5">
          <h3 className="font-serif text-lg text-[var(--ledger-ink)]">Cancel team</h3>
          <p className="mt-2 text-sm text-[var(--ledger-ink-2)]">
            Revokes every active seat and refunds the unused portion of the seat
            block (capped at 12 months). All seated learners are notified by email.
          </p>
          <div className="mt-4">
            <CancelTeamButton teamId={team.id} teamName={team.name} />
          </div>
        </LedgerCard>
      </section>

      <p className="text-sm text-[var(--ledger-muted)]">
        Looking for your personal billing?{' '}
        <Link
          href="/account/billing"
          className="text-[var(--ledger-accent)] underline-offset-4 hover:underline"
        >
          Open personal billing →
        </Link>
      </p>
    </main>
  );
}
