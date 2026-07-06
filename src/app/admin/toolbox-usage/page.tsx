import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { createServerClientWithCookies } from '@/lib/supabase/client';
import { isAdminEmail } from '@/lib/admin/access';
import {
  getPublicPlaygroundUsageMetrics,
  parsePlaygroundUsageRange,
  type PlaygroundUsageMetrics,
  type PlaygroundUsageRange,
} from '@/lib/playground/usage-metrics';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Toolbox Usage · Admin',
  robots: { index: false, follow: false },
};

interface PageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
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
  flexWrap: 'wrap',
};
const nav: React.CSSProperties = { display: 'flex', gap: 8, flexWrap: 'wrap' };
const navLink: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 38,
  border: '1px solid var(--slate-200)',
  borderRadius: 8,
  padding: '0 13px',
  background: '#fff',
  color: 'var(--ink)',
  fontSize: '0.8125rem',
  fontWeight: 700,
  textDecoration: 'none',
};
const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid var(--slate-200)',
  borderRadius: 12,
  padding: 18,
};
const sectionTitle: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: '34px 0 12px',
};
const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.875rem',
};
const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  borderBottom: '1px solid var(--slate-200)',
  background: 'var(--slate-50)',
};
const td: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid var(--slate-100)',
  verticalAlign: 'top',
};

function value(params: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

function fmtInt(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function fmtMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function fmtDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

function shortHash(value: string | null): string {
  return value ? `${value.slice(0, 10)}…` : 'none';
}

async function requireFunnelAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    notFound();
  }
}

function RangeNav({ range }: { range: PlaygroundUsageRange }) {
  return (
    <div style={nav}>
      {(['7d', '30d', '90d'] as const).map((option) => (
        <Link
          key={option}
          href={`/admin/toolbox-usage?range=${option}`}
          style={{
            ...navLink,
            borderColor: range === option ? 'var(--gold)' : 'var(--slate-200)',
            background: range === option ? 'var(--gold-a20)' : '#fff',
          }}
        >
          {option}
        </Link>
      ))}
    </div>
  );
}

function SummaryCards({ metrics }: { metrics: PlaygroundUsageMetrics }) {
  const items = [
    ['Calls', fmtInt(metrics.calls)],
    ['Succeeded', fmtInt(metrics.succeeded)],
    ['Rate-limited', fmtInt(metrics.rateLimited)],
    ['Errored', fmtInt(metrics.errored)],
    ['Unique IP hashes', fmtInt(metrics.uniqueIpHashes)],
    ['Cost', fmtMoney(metrics.costCents)],
    ['Input tokens', fmtInt(metrics.inputTokens)],
    ['Output tokens', fmtInt(metrics.outputTokens)],
  ] as const;

  return (
    <section
      aria-label="Public demo usage summary"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 24 }}
    >
      {items.map(([label, metric]) => (
        <div key={label} style={card}>
          <span style={{ color: 'var(--slate-500)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            {label}
          </span>
          <strong style={{ display: 'block', marginTop: 8, fontSize: '1.875rem', lineHeight: 1 }}>
            {metric}
          </strong>
        </div>
      ))}
    </section>
  );
}

export default async function ToolboxUsageAdminPage({ searchParams }: PageProps) {
  await requireFunnelAdmin();
  const params = await searchParams;
  const range = parsePlaygroundUsageRange(value(params, 'range'));
  let metrics: PlaygroundUsageMetrics | null = null;
  let error: string | null = null;

  try {
    metrics = await getPublicPlaygroundUsageMetrics(range);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load public demo usage.';
  }

  return (
    <main style={page}>
      <div style={container}>
        <header style={header}>
          <div>
            <p style={{ ...sectionTitle, margin: '0 0 8px' }}>Private admin</p>
            <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 700 }}>Toolbox Usage</h1>
            <p style={{ margin: '8px 0 0', color: 'var(--slate-600)', maxWidth: 720 }}>
              Public demo model usage from `/api/playground/run`, including spend, rate limits,
              failures, and IP-hash concentration.
            </p>
          </div>
          <div style={nav}>
            <Link href="/admin" style={navLink}>Overview</Link>
            <Link href="/admin/funnel" style={navLink}>Funnel</Link>
            <Link href="/admin/support" style={navLink}>Support</Link>
          </div>
        </header>

        <section style={{ ...card, marginTop: 24, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <strong>Range</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--slate-600)' }}>
              Data starts {metrics ? metrics.startIso.slice(0, 10) : 'after load'}.
            </p>
          </div>
          <RangeNav range={range} />
        </section>

        {error ? (
          <section style={{ ...card, marginTop: 24, borderColor: 'rgba(185,28,28,.35)' }}>
            <strong>Usage unavailable</strong>
            <p style={{ margin: '8px 0 0', color: 'var(--slate-600)' }}>{error}</p>
          </section>
        ) : metrics ? (
          <>
            <SummaryCards metrics={metrics} />

            <h2 style={sectionTitle}>Daily trend</h2>
            <div style={{ ...card, overflowX: 'auto', padding: 0 }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Day</th>
                    <th style={{ ...th, textAlign: 'right' }}>Calls</th>
                    <th style={{ ...th, textAlign: 'right' }}>Succeeded</th>
                    <th style={{ ...th, textAlign: 'right' }}>Limited</th>
                    <th style={{ ...th, textAlign: 'right' }}>Errored</th>
                    <th style={{ ...th, textAlign: 'right' }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.byDay.map((row) => (
                    <tr key={row.day}>
                      <td style={td}>{row.day}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{fmtInt(row.calls)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{fmtInt(row.succeeded)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{fmtInt(row.rateLimited)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{fmtInt(row.errored)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{fmtMoney(row.costCents)}</td>
                    </tr>
                  ))}
                  {metrics.byDay.length === 0 ? (
                    <tr><td style={td} colSpan={6}>No public demo calls in this range.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <h2 style={sectionTitle}>Top IP hashes</h2>
            <div style={{ ...card, overflowX: 'auto', padding: 0 }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>IP hash</th>
                    <th style={{ ...th, textAlign: 'right' }}>Calls</th>
                    <th style={{ ...th, textAlign: 'right' }}>Succeeded</th>
                    <th style={{ ...th, textAlign: 'right' }}>Limited</th>
                    <th style={{ ...th, textAlign: 'right' }}>Errored</th>
                    <th style={{ ...th, textAlign: 'right' }}>Cost</th>
                    <th style={th}>Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.topIps.map((row) => (
                    <tr key={row.ipHash}>
                      <td style={{ ...td, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{shortHash(row.ipHash)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{fmtInt(row.calls)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{fmtInt(row.succeeded)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{fmtInt(row.rateLimited)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{fmtInt(row.errored)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{fmtMoney(row.costCents)}</td>
                      <td style={td}>{fmtDateTime(row.lastSeenAt)}</td>
                    </tr>
                  ))}
                  {metrics.topIps.length === 0 ? (
                    <tr><td style={td} colSpan={7}>No IP-hash activity in this range.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <h2 style={sectionTitle}>Recent events</h2>
            <div style={{ ...card, overflowX: 'auto', padding: 0 }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Time</th>
                    <th style={th}>Status</th>
                    <th style={th}>Model</th>
                    <th style={th}>IP hash</th>
                    <th style={{ ...th, textAlign: 'right' }}>Tokens</th>
                    <th style={{ ...th, textAlign: 'right' }}>Cost</th>
                    <th style={th}>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recent.map((row) => (
                    <tr key={row.id}>
                      <td style={td}>{fmtDateTime(row.created_at)}</td>
                      <td style={td}>{row.status.replaceAll('-', ' ')}</td>
                      <td style={td}>{row.model}</td>
                      <td style={{ ...td, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{shortHash(row.ip_hash)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{fmtInt((row.input_tokens ?? 0) + (row.output_tokens ?? 0))}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{fmtMoney(Number(row.cost_cents ?? 0))}</td>
                      <td style={td}>{row.error_kind ?? '—'}</td>
                    </tr>
                  ))}
                  {metrics.recent.length === 0 ? (
                    <tr><td style={td} colSpan={7}>No recent public demo events.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
