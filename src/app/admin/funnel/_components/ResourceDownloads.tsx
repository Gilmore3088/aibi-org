// Resource-download KPI section for /admin/funnel: headline tiles + a
// per-resource table grouped by category. Pure/presentational — the page
// fetches the data (resource_download_metrics / resource_download_totals views)
// and the slug -> label/category mapping lives in resourceMeta. Server component
// (no client hooks), so it renders inside the admin page and is unit-testable.

import { Fragment } from 'react';
import type {
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
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 14 };
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
const tileRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 12,
  marginBottom: 16,
};
const tile: React.CSSProperties = { ...card, padding: '14px 16px' };
const tileLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  margin: 0,
};
const tileValue: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
  marginTop: 4,
  color: 'var(--ink)',
};
const catHeader: React.CSSProperties = {
  ...td,
  background: 'var(--cream)',
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
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
}

export function ResourceDownloads({ totals, rows }: ResourceDownloadsProps) {
  if (rows.length === 0) {
    return (
      <div style={{ ...card, padding: 16, fontSize: 14, color: 'var(--slate-600)' }}>
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

      <p style={{ fontSize: 12, color: 'var(--slate-500)', margin: '0 0 12px', maxWidth: 760 }}>
        Raw download events — includes anonymous and repeat downloads. The
        scorecard&rsquo;s &ldquo;Resource downloaders (known email)&rdquo; counts
        unique known-email people instead, so it is much lower.
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
                  <th scope="colgroup" colSpan={6} style={catHeader}>
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
    </>
  );
}
