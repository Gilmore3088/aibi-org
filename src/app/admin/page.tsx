import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { isAdminEmail } from '@/lib/admin/access';
import { getFunnelContacts, getFunnelScorecard, getFunnelStageDistribution } from '@/lib/funnel/queries';
import type { FunnelContactRow, FunnelScorecardRow, FunnelStageRow } from '@/lib/funnel/queries';
import { getSupportAdminSession } from '@/lib/support/auth';
import { listSupportCases } from '@/lib/support/cases';
import {
  getSupportMetrics,
  parseSupportMetricsRange,
  type SupportMetrics,
  type SupportMetricsRange,
} from '@/lib/support/metrics';
import type { SupportCase } from '@/lib/support/types';
import styles from './admin-overview.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Overview',
  robots: { index: false, follow: false },
};

interface PageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

interface FunnelOverview {
  readonly enabled: boolean;
  readonly error: string | null;
  readonly scorecard: FunnelScorecardRow[];
  readonly stages: FunnelStageRow[];
  readonly contacts: FunnelContactRow[];
}

interface PriorityItem {
  readonly tone: 'bad' | 'warn' | 'good';
  readonly title: string;
  readonly detail: string;
  readonly href: string;
  readonly action: string;
}

const numberFormatter = new Intl.NumberFormat('en-US');

const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  free_assessed: 'Free assessed',
  in_depth_buyer: 'In-Depth buyer',
  in_depth_completed: 'In-Depth completed',
  foundation_buyer: 'Foundation buyer',
  active_learner: 'Active learner',
  certified: 'Certified',
};

function value(params: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

function formatNumber(value: number | null): string {
  if (value === null) return 'n/a';
  return numberFormatter.format(value);
}

function formatHours(value: number | null): string {
  if (value === null) return 'n/a';
  return `${Number.isInteger(value) ? value : value.toFixed(1)}h`;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return 'n/a';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

function label(value: string): string {
  return value.replaceAll('_', ' ');
}

function stageLabel(stage: string): string {
  return STAGE_LABELS[stage] ?? label(stage);
}

async function requireSupportOperator() {
  const session = await getSupportAdminSession();
  if (session.ok) return session;

  if (session.reason === 'unauthenticated' || session.reason === 'supabase_not_configured') {
    redirect('/auth/login?next=%2Fadmin');
  }
  if (session.reason === 'untrusted_device') {
    redirect(`/auth/confirm-device-pending?email=${encodeURIComponent(session.email ?? '')}`);
  }
  notFound();
}

async function loadFunnelOverview(enabled: boolean): Promise<FunnelOverview> {
  if (!enabled) {
    return { enabled: false, error: null, scorecard: [], stages: [], contacts: [] };
  }

  try {
    const [scorecard, stages, contacts] = await Promise.all([
      getFunnelScorecard(),
      getFunnelStageDistribution(),
      getFunnelContacts(8),
    ]);
    return { enabled: true, error: null, scorecard, stages, contacts };
  } catch (err) {
    return {
      enabled: true,
      error: err instanceof Error ? err.message : 'Failed to load funnel data',
      scorecard: [],
      stages: [],
      contacts: [],
    };
  }
}

function buildPriorities(metrics: SupportMetrics, funnel: FunnelOverview): PriorityItem[] {
  const items: PriorityItem[] = [];
  const failureCount =
    metrics.opsHealth.provisioningFailures + metrics.opsHealth.emailFailures + metrics.opsHealth.webhookFailures;

  if (metrics.queue.slaBreaches > 0) {
    items.push({
      tone: 'bad',
      title: 'SLA breach queue',
      detail: `${metrics.queue.slaBreaches} open case${metrics.queue.slaBreaches === 1 ? '' : 's'} are older than 24 hours.`,
      href: '/admin/support?status=all',
      action: 'Triage cases',
    });
  }

  if (failureCount > 0) {
    const category =
      metrics.opsHealth.provisioningFailures > 0
        ? 'provisioning_failure'
        : metrics.opsHealth.emailFailures > 0
          ? 'email_failure'
          : 'webhook_error';
    items.push({
      tone: 'bad',
      title: 'Delivery failure cases',
      detail: `${failureCount} provisioning, email, or webhook failure${failureCount === 1 ? '' : 's'} in this range.`,
      href: `/admin/support?category=${category}`,
      action: 'Open failures',
    });
  }

  if (metrics.refundRequests.pending > 0) {
    items.push({
      tone: 'warn',
      title: 'Refund decisions pending',
      detail: `${metrics.refundRequests.pending} refund request${metrics.refundRequests.pending === 1 ? '' : 's'} need a manual Stripe decision.`,
      href: '/admin/support?category=refund_request',
      action: 'Review refunds',
    });
  }

  if (metrics.queue.newCases > 0) {
    items.push({
      tone: 'warn',
      title: 'New support intake',
      detail: `${metrics.queue.newCases} new case${metrics.queue.newCases === 1 ? '' : 's'} need first response or assignment.`,
      href: '/admin/support?status=new',
      action: 'Open new cases',
    });
  }

  if (metrics.launchHealth.paidEnrollmentsInRange === 0) {
    items.push({
      tone: 'warn',
      title: 'No paid enrollments in range',
      detail: 'The selected range has no paid course enrollments recorded in the app database.',
      href: '/admin/funnel',
      action: 'Review funnel',
    });
  }

  if (funnel.error) {
    items.push({
      tone: 'warn',
      title: 'Funnel reporting unavailable',
      detail: funnel.error,
      href: '/admin/funnel',
      action: 'Open funnel',
    });
  }

  if (items.length === 0) {
    items.push({
      tone: 'good',
      title: 'No priority exceptions',
      detail: 'No SLA breaches, pending refunds, or delivery failures were found for this range.',
      href: '/admin/support',
      action: 'Open queue',
    });
  }

  return items.slice(0, 6);
}

function MetricCard({
  label,
  value,
  detail,
}: {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
}) {
  return (
    <div className={styles.metricCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  );
}

function Kpi({ label: labelText, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <span className={styles.label}>{labelText}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PriorityList({ items }: { readonly items: PriorityItem[] }) {
  return (
    <ul className={styles.priorityList}>
      {items.map((item) => (
        <li
          key={`${item.title}-${item.href}`}
          className={`${styles.priorityItem} ${
            item.tone === 'bad' ? styles.bad : item.tone === 'warn' ? styles.warn : styles.good
          }`}
        >
          <strong>{item.title}</strong>
          <p>{item.detail}</p>
          <Link href={item.href}>{item.action}</Link>
        </li>
      ))}
    </ul>
  );
}

function SupportQueuePreview({ cases }: { readonly cases: SupportCase[] }) {
  if (cases.length === 0) {
    return <p className={styles.empty}>No support cases have been created yet.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Status</th>
            <th>Buyer</th>
            <th>Subject</th>
            <th>Priority</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((supportCase) => (
            <tr key={supportCase.id}>
              <td><span className={styles.pill}>{label(supportCase.status)}</span></td>
              <td>{supportCase.buyerEmail}</td>
              <td>
                <Link href={`/admin/support/cases/${supportCase.id}`}>{supportCase.subject}</Link>
              </td>
              <td>{supportCase.priority}</td>
              <td>{formatDateTime(supportCase.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScorecardTable({ rows }: { readonly rows: FunnelScorecardRow[] }) {
  if (rows.length === 0) {
    return <p className={styles.empty}>No funnel scorecard rows are available.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Metric</th>
            <th>All-time</th>
            <th>7d</th>
            <th>24h</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 8).map((row) => (
            <tr key={row.metric_key}>
              <td>{row.metric_label}</td>
              <td>{formatNumber(row.all_time)}</td>
              <td>{formatNumber(row.last_7d)}</td>
              <td>{formatNumber(row.last_24h)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StageBars({ rows }: { readonly rows: FunnelStageRow[] }) {
  if (rows.length === 0) return null;
  const max = Math.max(1, ...rows.map((row) => row.contacts));
  return (
    <div className={styles.stageList}>
      {rows.map((row) => (
        <div key={row.lifecycle_stage} className={styles.stageRow}>
          <div className={styles.stageMeta}>
            <strong>{stageLabel(row.lifecycle_stage)}</strong>
            <span>
              {formatNumber(row.contacts)} · {row.pct_of_contacts ?? 0}%
            </span>
          </div>
          <div className={styles.bar} aria-hidden="true">
            <span style={{ width: `${Math.max(2, (row.contacts / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentContacts({ contacts }: { readonly contacts: FunnelContactRow[] }) {
  if (contacts.length === 0) return <p className={styles.empty}>No known contacts yet.</p>;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Stage</th>
            <th>Last seen</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.email}>
              <td>{contact.display_email}</td>
              <td>{stageLabel(contact.lifecycle_stage)}</td>
              <td>{formatDateTime(contact.last_seen)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminOverviewPage({ searchParams }: PageProps) {
  const session = await requireSupportOperator();
  const params = await searchParams;
  const range: SupportMetricsRange = parseSupportMetricsRange(value(params, 'range'));
  const funnelEnabled = isAdminEmail(session.user.email);

  const [metrics, cases, funnel] = await Promise.all([
    getSupportMetrics(range),
    listSupportCases({ status: 'all', limit: 8 }),
    loadFunnelOverview(funnelEnabled),
  ]);
  const priorities = buildPriorities(metrics, funnel);
  const failureCount =
    metrics.opsHealth.provisioningFailures + metrics.opsHealth.emailFailures + metrics.opsHealth.webhookFailures;

  return (
    <main className={styles.overview}>
      <div className={styles.container}>
        <section className={styles.top}>
          <div>
            <p className={styles.eyebrow}>Private admin</p>
            <h1 className={styles.title}>Operator Dashboard</h1>
            <p className={styles.subhead}>
              Launch health, support workload, buyer lookup, refund decisions, delivery failures, and funnel movement.
            </p>
          </div>
          <div className={styles.stack}>
            <div className={styles.identity}>{session.user.email}</div>
            <nav className={styles.nav} aria-label="Admin">
              <Link href="/admin/support">Support queue</Link>
              <Link href="/admin/support/search">Buyer search</Link>
              <Link href="/admin/funnel">Funnel</Link>
              <Link href="/admin/toolbox-usage">Toolbox usage</Link>
              <a href={`/api/admin/support/export.csv?range=${range}`}>Export CSV</a>
            </nav>
          </div>
        </section>

        <section className={styles.toolbar}>
          <div>
            <span className={styles.label}>Reporting range</span>
            <p className={styles.empty}>Generated {formatDateTime(metrics.generatedAt)}</p>
          </div>
          <div className={styles.range} aria-label="Range">
            {(['7d', '30d', '90d'] as const).map((option) => (
              <Link
                key={option}
                className={`${styles.buttonSecondary} ${range === option ? styles.activeRange : ''}`}
                href={`/admin?range=${option}`}
                aria-current={range === option ? 'page' : undefined}
              >
                {option}
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.metricGrid} aria-label="Launch metrics">
          <MetricCard
            label="Cases needing action"
            value={formatNumber(metrics.queue.openCases)}
            detail={`${formatNumber(metrics.queue.newCases)} new · ${formatNumber(metrics.queue.slaBreaches)} SLA breach${metrics.queue.slaBreaches === 1 ? '' : 'es'}`}
          />
          <MetricCard
            label="Paid enrollments"
            value={formatNumber(metrics.launchHealth.paidEnrollments)}
            detail={`${formatNumber(metrics.launchHealth.paidEnrollmentsInRange)} in range · ${formatNumber(metrics.launchHealth.activeEntitlements)} active entitlements`}
          />
          <MetricCard
            label="Refund workflow"
            value={formatNumber(metrics.refundRequests.pending)}
            detail={`${formatNumber(metrics.refundRequests.approved)} approved · ${formatNumber(metrics.refundRequests.denied)} denied · ${formatNumber(metrics.refundRequests.manuallyIssued)} issued`}
          />
          <MetricCard
            label="Delivery reliability"
            value={formatNumber(failureCount)}
            detail={`${formatNumber(metrics.opsHealth.provisioningFailures)} provisioning · ${formatNumber(metrics.opsHealth.emailFailures)} email · ${formatNumber(metrics.opsHealth.webhookFailures)} webhook`}
          />
        </section>

        <section className={styles.split}>
          <div className={styles.stack}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>Priorities</p>
                  <h2>Operating exceptions</h2>
                  <p>Items here are derived from live support, delivery, refund, and funnel state.</p>
                </div>
              </div>
              <PriorityList items={priorities} />
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>Queue preview</p>
                  <h2>Latest support cases</h2>
                  <p>Use the queue for full filters, status changes, macros, refund notes, and access rescue.</p>
                </div>
                <Link className={styles.buttonSecondary} href="/admin/support">Open queue</Link>
              </div>
              <SupportQueuePreview cases={cases} />
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>Funnel</p>
                  <h2>Scorecard</h2>
                  <p>Known-contact movement from assessment, purchase, learning, and certificate data.</p>
                </div>
                <Link className={styles.buttonSecondary} href="/admin/funnel">Open funnel</Link>
              </div>
              {!funnel.enabled ? (
                <p className={styles.empty}>Funnel reporting is not enabled for this admin account.</p>
              ) : funnel.error ? (
                <p className={styles.empty}>Could not load funnel reporting: {funnel.error}</p>
              ) : (
                <ScorecardTable rows={funnel.scorecard} />
              )}
            </section>
          </div>

          <aside className={styles.stack}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>SLA</p>
                  <h2>Response timing</h2>
                </div>
              </div>
              <div className={styles.kpiGrid}>
                <Kpi label="First response" value={formatHours(metrics.queue.medianFirstResponseHours)} />
                <Kpi label="Resolution" value={formatHours(metrics.queue.medianResolutionHours)} />
                <Kpi label="Access rescues" value={formatNumber(metrics.opsHealth.accessRescuesSent)} />
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>Launch counters</p>
                  <h2>Product state</h2>
                </div>
              </div>
              <div className={styles.kpiGrid}>
                <Kpi label="Paid in range" value={formatNumber(metrics.launchHealth.paidEnrollmentsInRange)} />
                <Kpi label="Team cohorts in range" value={formatNumber(metrics.launchHealth.teamCohortsCreated)} />
                <Kpi label="Cases/10 paid" value={formatNumber(metrics.launchHealth.supportCasesPer10PaidPurchases)} />
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>Data quality</p>
                  <h2>Excluded test rows</h2>
                </div>
              </div>
              <div className={styles.kpiGrid}>
                <Kpi label="Enrollments" value={formatNumber(metrics.dataQuality.excludedPaidEnrollments)} />
                <Kpi label="Support cases" value={formatNumber(metrics.dataQuality.excludedSupportCases)} />
                <Kpi label="Team cohorts" value={formatNumber(metrics.dataQuality.excludedTeamCohorts)} />
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>Buyer lookup</p>
                  <h2>Find account state</h2>
                </div>
              </div>
              <form className={styles.lookupForm} action="/admin/support/search">
                <input name="email" type="email" placeholder="buyer@example.com" />
                <input name="stripeSessionId" placeholder="cs_live_..." />
                <button type="submit">Search buyer</button>
              </form>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>Stage mix</p>
                  <h2>Funnel distribution</h2>
                </div>
              </div>
              {funnel.enabled && !funnel.error ? <StageBars rows={funnel.stages} /> : <p className={styles.empty}>No stage data loaded.</p>}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>Recent contacts</p>
                  <h2>Last activity</h2>
                </div>
              </div>
              {funnel.enabled && !funnel.error ? (
                <RecentContacts contacts={funnel.contacts} />
              ) : (
                <p className={styles.empty}>No contact data loaded.</p>
              )}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>Workbenches</p>
                  <h2>Direct paths</h2>
                </div>
              </div>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/support/purchase-help">Purchase help form</Link>
                  <p>Public intake form for buyer access, email, payment, and refund issues.</p>
                </li>
                <li>
                  <a href={`/api/admin/support/export.csv?range=${range}`}>Export support CSV</a>
                  <p>Case and event export for the selected reporting range.</p>
                </li>
                <li>
                  <Link href="/admin/support?category=refund_request">Refund queue</Link>
                  <p>Eligibility context and manual Stripe decision logging.</p>
                </li>
                <li>
                  <Link href="/admin/toolbox-usage">Toolbox usage</Link>
                  <p>Public demo spend, rate limits, failures, and IP-hash concentration.</p>
                </li>
              </ul>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
