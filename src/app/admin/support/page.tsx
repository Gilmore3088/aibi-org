import Link from 'next/link';
import { listSupportCases } from '@/lib/support/cases';
import { getSupportMetrics } from '@/lib/support/metrics';

interface PageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function value(params: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

function metricValue(value: number | null): string {
  if (value === null) return 'n/a';
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default async function SupportAdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = value(params, 'range') === '7d' ? '7d' : value(params, 'range') === '90d' ? '90d' : '30d';
  const status = value(params, 'status') ?? 'all';
  const q = value(params, 'q') ?? '';
  const [metrics, cases] = await Promise.all([
    getSupportMetrics(range),
    listSupportCases({ status, q, limit: 100 }),
  ]);

  return (
    <main className="support-admin__main">
      <section className="support-toolbar">
        <form className="support-search" action="/admin/support">
          <input type="search" name="q" placeholder="Search email, session, subject" defaultValue={q} />
          <select name="status" defaultValue={status}>
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="open">Open</option>
            <option value="waiting_customer">Waiting customer</option>
            <option value="waiting_internal">Waiting internal</option>
            <option value="resolved">Resolved</option>
            <option value="refunded">Refunded</option>
            <option value="closed_no_action">Closed no action</option>
          </select>
          <button type="submit">Filter</button>
        </form>
        <div className="support-range">
          <Link href="/admin/support?range=7d">7d</Link>
          <Link href="/admin/support?range=30d">30d</Link>
          <Link href="/admin/support?range=90d">90d</Link>
        </div>
      </section>

      <section className="support-metrics" aria-label="Support metrics">
        <div>
          <span>Open cases</span>
          <strong>{metrics.queue.openCases}</strong>
        </div>
        <div>
          <span>SLA breaches</span>
          <strong>{metrics.queue.slaBreaches}</strong>
        </div>
        <div>
          <span>First response</span>
          <strong>{metricValue(metrics.queue.medianFirstResponseHours)}h</strong>
        </div>
        <div>
          <span>Resolution</span>
          <strong>{metricValue(metrics.queue.medianResolutionHours)}h</strong>
        </div>
        <div>
          <span>Paid enrollments</span>
          <strong>{metrics.launchHealth.paidEnrollments}</strong>
        </div>
        <div>
          <span>Cases / 10 purchases</span>
          <strong>{metricValue(metrics.launchHealth.supportCasesPer10PaidPurchases)}</strong>
        </div>
        <div>
          <span>Refunds pending</span>
          <strong>{metrics.refundRequests.pending}</strong>
        </div>
        <div>
          <span>Access rescues</span>
          <strong>{metrics.opsHealth.accessRescuesSent}</strong>
        </div>
      </section>

      <section className="support-split">
        <div className="support-panel">
          <div className="support-section-head">
            <div>
              <p className="support-kicker">Case queue</p>
              <h2>{cases.length} cases</h2>
            </div>
          </div>
          <div className="support-table-wrap">
            <table className="support-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Buyer</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((supportCase) => (
                  <tr key={supportCase.id}>
                    <td><span className="support-pill">{supportCase.status.replaceAll('_', ' ')}</span></td>
                    <td>{supportCase.buyerEmail}</td>
                    <td>
                      <Link href={`/admin/support/cases/${supportCase.id}`}>{supportCase.subject}</Link>
                    </td>
                    <td>{supportCase.category.replaceAll('_', ' ')}</td>
                    <td>{supportCase.priority}</td>
                    <td>{new Date(supportCase.createdAt).toLocaleDateString('en-US')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="support-panel">
          <div className="support-section-head">
            <div>
              <p className="support-kicker">Launch health</p>
              <h2>{range}</h2>
            </div>
          </div>
          <dl className="support-health-list">
            <div><dt>Provisioning failures</dt><dd>{metrics.opsHealth.provisioningFailures}</dd></div>
            <div><dt>Email failures</dt><dd>{metrics.opsHealth.emailFailures}</dd></div>
            <div><dt>Webhook failures</dt><dd>{metrics.opsHealth.webhookFailures}</dd></div>
            <div><dt>Active entitlements</dt><dd>{metrics.launchHealth.activeEntitlements}</dd></div>
            <div><dt>Certificates issued</dt><dd>{metrics.launchHealth.certificatesIssued}</dd></div>
            <div><dt>Team cohorts</dt><dd>{metrics.launchHealth.teamCohortsCreated}</dd></div>
          </dl>
        </aside>
      </section>
    </main>
  );
}
