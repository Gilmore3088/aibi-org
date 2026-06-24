// Read-only funnel dashboard for internal operators.
//
// Renders the three derived views from migration 00049. Auth + allowlist are
// enforced by src/app/admin/layout.tsx; this page assumes an admin caller and
// reads via the service-role client. force-dynamic so it always shows live
// data and PII is never cached at the edge.

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getFunnelScorecard,
  getFunnelStageDistribution,
  getFunnelContacts,
  getResourceDownloadMetrics,
  getResourceDownloadTotals,
  getResourceDownloadAttributionMetrics,
  type FunnelScorecardRow,
  type FunnelStageRow,
  type FunnelContactRow,
  type ResourceDownloadAttributionRow,
  type ResourceDownloadMetricRow,
  type ResourceDownloadTotalsRow,
} from '@/lib/funnel/queries';
import { ResourceDownloads } from './_components/ResourceDownloads';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Funnel · Admin',
  robots: { index: false, follow: false },
};

const CONTACTS_LIMIT = 500;

const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  free_assessed: 'Free assessed',
  in_depth_buyer: 'In-Depth buyer',
  in_depth_completed: 'In-Depth completed',
  foundation_buyer: 'Foundation buyer',
  active_learner: 'Active learner',
  certified: 'Certified',
};

function fmtDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '—';
}

function stageLabel(stage: string): string {
  return STAGE_LABELS[stage] ?? stage;
}

const page: React.CSSProperties = {
  background: 'var(--cream)',
  minHeight: '100vh',
  padding: '32px 24px 80px',
  color: 'var(--ink)',
  fontFamily: 'var(--font-sans)',
};
const container: React.CSSProperties = { maxWidth: 1120, margin: '0 auto' };
const header: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 20,
};
const nav: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};
const navLink: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 38,
  border: '1px solid var(--slate-200)',
  borderRadius: 8,
  padding: '0 13px',
  background: '#fff',
  color: 'var(--ink)',
  fontSize: 13,
  fontWeight: 700,
  textDecoration: 'none',
};
const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: '40px 0 12px',
};
const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid var(--slate-200)',
  borderRadius: 16,
  overflow: 'hidden',
};
const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 14,
};
const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 14px',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  borderBottom: '1px solid var(--slate-200)',
  background: 'var(--slate-50)',
};
const td: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--slate-100)',
  color: 'var(--ink)',
};
const num: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' };

function Scorecard({ rows }: { rows: FunnelScorecardRow[] }) {
  return (
    <div style={card}>
      <table style={table}>
        <thead>
          <tr>
            <th style={th} scope="col">Metric</th>
            <th style={{ ...th, textAlign: 'right' }} scope="col">All-time</th>
            <th style={{ ...th, textAlign: 'right' }} scope="col">Last 7d</th>
            <th style={{ ...th, textAlign: 'right' }} scope="col">Last 24h</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.metric_key}>
              <td style={td}>{r.metric_label}</td>
              <td style={{ ...num, fontWeight: 600 }}>{r.all_time}</td>
              <td style={num}>{r.last_7d}</td>
              <td style={num}>{r.last_24h}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StageBars({ rows }: { rows: FunnelStageRow[] }) {
  const max = Math.max(1, ...rows.map((r) => r.contacts));
  return (
    <div style={{ ...card, padding: '16px 18px' }}>
      {rows.map((r) => (
        <div key={r.lifecycle_stage} style={{ margin: '10px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
            <span style={{ fontWeight: 500 }}>{stageLabel(r.lifecycle_stage)}</span>
            <span style={{ color: 'var(--slate-500)', fontVariantNumeric: 'tabular-nums' }}>
              {r.contacts} · {r.pct_of_contacts ?? 0}%
            </span>
          </div>
          <div style={{ background: 'var(--cream-2)', borderRadius: 999, height: 8 }}>
            <div
              style={{
                width: `${(r.contacts / max) * 100}%`,
                background: 'var(--gold)',
                height: 8,
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactsTable({ rows }: { rows: FunnelContactRow[] }) {
  return (
    <div style={{ ...card, overflowX: 'auto' }}>
      <table style={table}>
        <thead>
          <tr>
            <th style={th} scope="col">Email</th>
            <th style={th} scope="col">Stage</th>
            <th style={th} scope="col">Tier</th>
            <th style={th} scope="col">Role</th>
            <th style={th} scope="col">Institution</th>
            <th style={th} scope="col">Products</th>
            <th style={th} scope="col">First seen</th>
            <th style={th} scope="col">Last seen</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.email}>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>{c.display_email}</td>
              <td style={td}>{stageLabel(c.lifecycle_stage)}</td>
              <td style={td}>{c.readiness_tier_label ?? '—'}</td>
              <td style={td}>{c.role ?? '—'}</td>
              <td style={td}>{c.institution ?? '—'}</td>
              <td style={{ ...td, color: 'var(--slate-500)', fontSize: 13 }}>
                {c.products.length ? c.products.join(', ') : '—'}
              </td>
              <td style={{ ...td, whiteSpace: 'nowrap', color: 'var(--slate-500)' }}>{fmtDate(c.first_seen)}</td>
              <td style={{ ...td, whiteSpace: 'nowrap', color: 'var(--slate-500)' }}>{fmtDate(c.last_seen)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminFunnelPage() {
  let scorecard: FunnelScorecardRow[] = [];
  let stages: FunnelStageRow[] = [];
  let contacts: FunnelContactRow[] = [];
  let loadError: string | null = null;

  let resourceMetrics: ResourceDownloadMetricRow[] = [];
  let resourceTotals: ResourceDownloadTotalsRow | null = null;
  let resourceAttribution: ResourceDownloadAttributionRow[] = [];
  let resourceError: string | null = null;

  try {
    [scorecard, stages, contacts] = await Promise.all([
      getFunnelScorecard(),
      getFunnelStageDistribution(),
      getFunnelContacts(CONTACTS_LIMIT),
    ]);
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Failed to load funnel data';
  }

  // Resource KPIs read separate views — keep their failure independent so a
  // funnel-view error doesn't blank the resource section (and vice versa).
  try {
    [resourceMetrics, resourceTotals, resourceAttribution] = await Promise.all([
      getResourceDownloadMetrics(),
      getResourceDownloadTotals(),
      getResourceDownloadAttributionMetrics(),
    ]);
  } catch (err) {
    resourceError = err instanceof Error ? err.message : 'Failed to load resource downloads';
  }

  return (
    <main style={page}>
      <div style={container}>
        <div style={header}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Funnel</h1>
            <p style={{ color: 'var(--slate-600)', fontSize: 14, marginTop: 6, maxWidth: 720 }}>
              Live known-contact funnel from Supabase. Revenue and refund dollars live in Stripe;
              anonymous traffic lives in Vercel/Plausible. Known-contact counts exclude configured
              test/internal identities; raw resource-download tiles remain popularity signals only.
            </p>
          </div>
          <nav style={nav} aria-label="Admin">
            <Link href="/admin" style={navLink}>Overview</Link>
            <Link href="/admin/support" style={navLink}>Support</Link>
            <Link href="/admin/toolbox-usage" style={navLink}>Toolbox usage</Link>
          </nav>
        </div>

        {loadError ? (
          <div
            style={{
              ...card,
              borderColor: 'var(--gold)',
              background: 'var(--gold-a10)',
              padding: 16,
              marginTop: 24,
              fontSize: 14,
            }}
          >
            Could not load funnel data: {loadError}
          </div>
        ) : (
          <>
            <h2 style={sectionTitle}>Scorecard</h2>
            <Scorecard rows={scorecard} />

            <h2 style={sectionTitle}>Stage distribution</h2>
            <StageBars rows={stages} />

            <h2 style={sectionTitle}>
              Contacts{' '}
              <span style={{ color: 'var(--slate-400)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                — most recent {contacts.length}
                {contacts.length === CONTACTS_LIMIT ? ' (capped; export from Supabase for the full list)' : ''}
              </span>
            </h2>
            <ContactsTable rows={contacts} />
          </>
        )}

        <h2 style={sectionTitle}>
          Resource downloads{' '}
          <span style={{ color: 'var(--slate-400)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
            — per-resource, incl. anonymous (unique counts are by hashed IP)
          </span>
        </h2>
        {resourceError ? (
          <div
            style={{
              ...card,
              borderColor: 'var(--gold)',
              background: 'var(--gold-a10)',
              padding: 16,
              fontSize: 14,
            }}
          >
            Could not load resource downloads: {resourceError}
          </div>
        ) : (
          <ResourceDownloads
            totals={resourceTotals}
            rows={resourceMetrics}
            attributionRows={resourceAttribution}
          />
        )}
      </div>
    </main>
  );
}
