// /account/billing — individual learner billing surface.
//
// Server component. Renders:
//   • Plan summary (Foundation entitlement + purchase date)
//   • Invoice + payment history (Stripe Invoices + Charges)
//   • "Manage payment method" — opens Stripe Customer Portal via client island
//   • Empty state for learners on the free tier
//
// Auth-required. Falls back to a preview-bypass placeholder when the
// PREVIEW_AUTH_BYPASS helper is active so design QA works without
// Supabase.

import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  createServerClientWithCookies,
  isSupabaseConfigured,
} from '@/lib/supabase/client';
import { isPreviewAuthBypassEnabled, PREVIEW_BYPASS_USER } from '@/lib/auth/previewBypass';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { formatAmount, type InvoiceListItem } from '@/lib/addie/billing/types';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { PortalLinkButton } from '@/components/addie/billing/PortalLinkButton';

export const dynamic = 'force-dynamic';

interface EntitlementRow {
  product: string;
  status: string;
  stripe_session_id: string | null;
  created_at: string;
  seat_id: string | null;
}

interface BillingViewModel {
  signedIn: boolean;
  email: string | null;
  entitlements: EntitlementRow[];
  invoices: InvoiceListItem[];
  invoicesError: string | null;
  bypass: boolean;
}

async function load(): Promise<BillingViewModel> {
  const empty: BillingViewModel = {
    signedIn: false,
    email: null,
    entitlements: [],
    invoices: [],
    invoicesError: null,
    bypass: false,
  };
  if (!isSupabaseConfigured()) {
    if (isPreviewAuthBypassEnabled()) {
      return {
        ...empty,
        signedIn: true,
        email: PREVIEW_BYPASS_USER.email,
        bypass: true,
        entitlements: [
          {
            product: 'foundation_individual',
            status: 'active',
            stripe_session_id: null,
            created_at: new Date().toISOString(),
            seat_id: null,
          },
        ],
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
    console.warn('[account/billing] auth read failed:', err);
  }
  if (!user_id) {
    if (isPreviewAuthBypassEnabled()) {
      return {
        ...empty,
        signedIn: true,
        email: PREVIEW_BYPASS_USER.email,
        bypass: true,
        entitlements: [
          {
            product: 'foundation_individual',
            status: 'active',
            stripe_session_id: null,
            created_at: new Date().toISOString(),
            seat_id: null,
          },
        ],
      };
    }
    return empty;
  }

  const svc = getAddieServiceClient();
  const { data: ents } = await svc
    .from('entitlements')
    .select('product, status, stripe_session_id, created_at, seat_id')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  let invoices: InvoiceListItem[] = [];
  let invoicesError: string | null = null;
  if (process.env.SKIP_STRIPE !== 'true' && process.env.STRIPE_SECRET_KEY && email) {
    try {
      const { resolveStripeCustomerId } = await import('@/lib/addie/billing/portal');
      const { listCustomerInvoices } = await import('@/lib/addie/billing/invoices');
      const customer = await resolveStripeCustomerId({ user_id, email });
      if (customer) {
        invoices = await listCustomerInvoices(customer);
      }
    } catch (err) {
      invoicesError = err instanceof Error ? err.message : 'unknown';
      console.warn('[account/billing] invoice list failed:', invoicesError);
    }
  }

  return {
    signedIn: true,
    email,
    entitlements: (ents ?? []) as EntitlementRow[],
    invoices,
    invoicesError,
    bypass: false,
  };
}

const PRODUCT_LABELS: Record<string, string> = {
  foundation_individual: 'Foundation Course — Individual',
  foundation_team_seat: 'Foundation Course — Team seat',
  assessment_in_depth: 'In-Depth Readiness Assessment',
};

function formatDate(iso: string | number): string {
  const d = typeof iso === 'number' ? new Date(iso * 1000) : new Date(iso);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function BillingPage() {
  const v = await load();

  if (!v.signedIn) {
    return (
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <h1 className="font-serif text-3xl text-[var(--ledger-ink)]">Billing</h1>
        <p className="mt-3 text-[var(--ledger-ink-2)]">
          Sign in to view your billing.{' '}
          <Link href="/auth/login" className="underline underline-offset-4">
            Go to sign in
          </Link>
          .
        </p>
      </main>
    );
  }

  const active = v.entitlements.filter((e) => e.status === 'active');
  const foundation = active.find(
    (e) => e.product === 'foundation_individual' || e.product === 'foundation_team_seat',
  );

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <header className="border-b border-[var(--ledger-rule)] pb-5 mb-6">
        <KickerLabel tone="muted">Account · Billing</KickerLabel>
        <h1 className="mt-2 font-serif text-3xl text-[var(--ledger-ink)]">Billing</h1>
        <p className="mt-2 text-sm text-[var(--ledger-muted)]">
          {v.email ?? '—'}
          {v.bypass ? (
            <span className="ml-2 font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-accent)]">
              Preview bypass
            </span>
          ) : null}
        </p>
      </header>

      <section className="mb-10">
        <KickerLabel tone="muted">Plan</KickerLabel>
        <div className="mt-3">
          {foundation ? (
            <LedgerCard className="p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-serif text-xl text-[var(--ledger-ink)]">
                  {PRODUCT_LABELS[foundation.product] ?? foundation.product}
                </h2>
                <span className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-accent)]">
                  Active
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
                <dt className="text-[var(--ledger-muted)]">Purchased</dt>
                <dd className="text-[var(--ledger-ink)] tabular-nums">
                  {formatDate(foundation.created_at)}
                </dd>
                <dt className="text-[var(--ledger-muted)]">Access</dt>
                <dd className="text-[var(--ledger-ink)]">12 months from purchase</dd>
              </dl>
              {active.some((e) => e.product === 'assessment_in_depth') ? (
                <p className="mt-4 text-sm text-[var(--ledger-muted)]">
                  Also active: In-Depth Readiness Assessment.
                </p>
              ) : null}
            </LedgerCard>
          ) : (
            <LedgerCard variant="recessed" className="p-5">
              <h2 className="font-serif text-xl text-[var(--ledger-ink)]">
                You&apos;re on the free tier
              </h2>
              <p className="mt-2 text-sm text-[var(--ledger-ink-2)]">
                Three doors to keep going: the full Foundation Course, the In-Depth
                Readiness Assessment, or stay on the free side with up to four
                saved Toolbox artifacts.
              </p>
              <Link
                href="/foundation/pricing"
                className="mt-4 inline-block font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-accent)] hover:underline"
              >
                See pricing →
              </Link>
            </LedgerCard>
          )}
        </div>
      </section>

      <section className="mb-10">
        <KickerLabel tone="muted">Payment method</KickerLabel>
        <LedgerCard className="mt-3 p-5">
          <p className="text-sm text-[var(--ledger-ink-2)]">
            Update your card, download invoices, or request a refund through Stripe&apos;s
            secure customer portal.
          </p>
          <div className="mt-4">
            <PortalLinkButton />
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
                  <th className="text-left font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] px-4 py-2">
                    Description
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
                  <tr
                    key={inv.id}
                    className="border-t border-[var(--ledger-rule)] first:border-t-0"
                  >
                    <td className="px-4 py-2 tabular-nums text-[var(--ledger-ink)]">
                      {formatDate(inv.created)}
                    </td>
                    <td className="px-4 py-2 text-[var(--ledger-ink-2)]">
                      {inv.description ?? (inv.source === 'invoice' ? 'Invoice' : 'Charge')}
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
      </section>

      <section className="mb-12">
        <KickerLabel tone="muted">Cancel or delete</KickerLabel>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <LedgerCard className="p-4">
            <h3 className="font-serif text-lg text-[var(--ledger-ink)]">
              Cancel or request a refund
            </h3>
            <p className="mt-1 text-sm text-[var(--ledger-muted)]">
              Use the Stripe customer portal to cancel any active recurring plan
              and to request a refund within the policy window.
            </p>
            <div className="mt-3">
              <PortalLinkButton variant="tertiary" label="Open Stripe portal →" />
            </div>
          </LedgerCard>
          <LedgerCard className="p-4">
            <h3 className="font-serif text-lg text-[var(--ledger-ink)]">Delete account</h3>
            <p className="mt-1 text-sm text-[var(--ledger-muted)]">
              30-day soft-delete. Your account is anonymized immediately; data is
              purged after 30 days.
            </p>
            <Link
              href="/account/delete"
              className="mt-3 inline-block font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-weak)] hover:underline"
            >
              Begin deletion →
            </Link>
          </LedgerCard>
        </div>
      </section>

      <p className="text-sm text-[var(--ledger-muted)]">
        Managing a team purchase?{' '}
        <Link
          href="/account/billing/team"
          className="text-[var(--ledger-accent)] underline-offset-4 hover:underline"
        >
          Open team billing →
        </Link>
      </p>
    </main>
  );
}
