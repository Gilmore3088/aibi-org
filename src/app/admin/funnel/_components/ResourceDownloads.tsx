// Resource-download KPI section for /admin/funnel: headline tiles + a
// per-resource table grouped by category. Pure/presentational — the page
// fetches the data (resource_download_metrics / resource_download_totals views)
// and the slug -> label/category mapping lives in resourceMeta. Server component
// (no client hooks), so it renders inside the admin page and is unit-testable.

import { Fragment } from 'react';
import type {
  ResourceDownloadAttributionRow,
  ResourceDownloadAttributionSegment,
  ResourceDownloadMetricRow,
  ResourceDownloadTotalsRow,
} from '@/lib/funnel/queries';
import {
  resourceMeta,
  RESOURCE_CATEGORY_ORDER,
  type ResourceCategory,
} from '@/lib/resources/resourceMeta';

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid var(--slate-200)',
  borderRadius: 16,
  overflow: 'hidden',
};
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' };
const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 14px',
  fontSize: '0.75rem',
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
const tileRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 12,
  marginBottom: 16,
};
const tile: React.CSSProperties = { ...card, padding: '14px 16px' };
const tileLabel: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  margin: 0,
};
const tileValue: React.CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
  marginTop: 4,
  color: 'var(--ink)',
};
const catHeader: React.CSSProperties = {
  ...td,
  background: 'var(--cream)',
  fontWeight: 600,
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
};
const segmentGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 16,
  marginTop: 16,
};
const segmentTitle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: '0 0 8px',
};

const SEGMENT_LABELS: Record<ResourceDownloadAttributionSegment, string> = {
  source_surface: 'Source surfaces',
  assessment_role: 'Assessment roles',
  assessment_tier: 'Assessment tiers',
  assessment_top_gap: 'Assessment top gaps',
};

function fmtDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '—';
}

function Tile({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <div style={tile}>
      <p style={tileLabel}>{label}</p>
      <div style={tileValue}>{value.toLocaleString('en-US')}</div>
    </div>
  );
}

interface ResourceDownloadsProps {
  readonly totals: ResourceDownloadTotalsRow | null;
  readonly rows: ResourceDownloadMetricRow[];
  readonly attributionRows?: ResourceDownloadAttributionRow[];
}

function AttributionTable({
  segment,
  rows,
}: {
  readonly segment: ResourceDownloadAttributionSegment;
  readonly rows: ResourceDownloadAttributionRow[];
}) {
  if (rows.length === 0) return null;

  return (
    <section aria-label={SEGMENT_LABELS[segment]}>
      <h3 style={segmentTitle}>{SEGMENT_LABELS[segment]}</h3>
      <div style={{ ...card, overflowX: 'auto' }}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th} scope="col">Segment</th>
              <th style={{ ...th, textAlign: 'right' }} scope="col">Downloads</th>
              <th style={{ ...th, textAlign: 'right' }} scope="col">Known</th>
              <th style={{ ...th, textAlign: 'right' }} scope="col">7d</th>
              <th style={{ ...th, textAlign: 'right' }} scope="col">Last</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.segment_type}:${r.segment_value}`}>
                <td style={td}>{r.segment_label || r.segment_value}</td>
                <td style={{ ...num, fontWeight: 600 }}>{r.downloads}</td>
                <td style={num}>{r.known_downloaders}</td>
                <td style={num}>{r.last_7d}</td>
                <td style={{ ...num, whiteSpace: 'nowrap', color: 'var(--slate-500)' }}>
                  {fmtDate(r.last_download)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ResourceDownloads({ totals, rows, attributionRows = [] }: ResourceDownloadsProps) {
  if (rows.length === 0) {
    return (
      <div style={{ ...card, padding: 16, fontSize: '0.875rem', color: 'var(--slate-600)' }}>
        No resource downloads recorded yet.
      </div>
    );
  }

  // Rows arrive sorted by downloads desc; regroup by category while preserving
  // that order within each group.
  const byCategory = new Map<ResourceCategory, Array<ResourceDownloadMetricRow & { label: string }>>();
  for (const r of rows) {
    const meta = resourceMeta(r.resource_slug);
    const list = byCategory.get(meta.category) ?? [];
    list.push({ ...r, label: meta.label });
    byCategory.set(meta.category, list);
  }
  const categories = RESOURCE_CATEGORY_ORDER.filter((c) => byCategory.has(c));
  const attributionBySegment = new Map<ResourceDownloadAttributionSegment, ResourceDownloadAttributionRow[]>();
  for (const row of attributionRows) {
    const list = attributionBySegment.get(row.segment_type) ?? [];
    list.push(row);
    attributionBySegment.set(row.segment_type, list);
  }
  const segmentOrder: ResourceDownloadAttributionSegment[] = [
    'source_surface',
    'assessment_role',
    'assessment_tier',
    'assessment_top_gap',
  ];

  return (
    <>
      {totals ? (
        <div style={tileRow}>
          <Tile label="Total downloads" value={totals.downloads} />
          <Tile label="Last 7 days" value={totals.last_7d} />
          <Tile label="Last 24 hours" value={totals.last_24h} />
          <Tile label="Unique visitors (by IP)" value={totals.unique_visitors} />
          <Tile label="Resources tracked" value={totals.resources_tracked} />
        </div>
      ) : null}

      <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', margin: '0 0 12px', maxWidth: 760 }}>
        Raw download events — includes anonymous, repeat, and test/seed traffic
        (not de-duplicated, not test-filtered). The scorecard&rsquo;s
        &ldquo;Resource downloaders (known email)&rdquo; counts unique
        known-email people with test emails excluded, so it is much lower. Treat
        these as relative popularity, not absolute demand. Attribution segments
        are populated only for downloads that passed through the shared resource gate.
      </p>

      <div style={{ ...card, overflowX: 'auto' }}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th} scope="col">Resource</th>
              <th style={{ ...th, textAlign: 'right' }} scope="col">Downloads</th>
              <th style={{ ...th, textAlign: 'right' }} scope="col">7d</th>
              <th style={{ ...th, textAlign: 'right' }} scope="col">24h</th>
              <th style={{ ...th, textAlign: 'right' }} scope="col">Unique (by IP)</th>
              <th style={{ ...th, textAlign: 'right' }} scope="col">Last</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <Fragment key={cat}>
                <tr>
                  <th scope="rowgroup" colSpan={6} style={catHeader}>
                    {cat}
                  </th>
                </tr>
                {byCategory.get(cat)!.map((r) => (
                  <tr key={r.resource_slug}>
                    <td style={td}>{r.label}</td>
                    <td style={{ ...num, fontWeight: 600 }}>{r.downloads}</td>
                    <td style={num}>{r.last_7d}</td>
                    <td style={num}>{r.last_24h}</td>
                    <td style={num}>{r.unique_visitors}</td>
                    <td style={{ ...num, whiteSpace: 'nowrap', color: 'var(--slate-500)' }}>
                      {fmtDate(r.last_download)}
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {attributionRows.length > 0 ? (
        <div style={segmentGrid}>
          {segmentOrder.map((segment) => (
            <AttributionTable
              key={segment}
              segment={segment}
              rows={attributionBySegment.get(segment) ?? []}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
