'use client';

// ArtifactsClient — interactive filter/sort strip + card grid for the toolkit.
// Server Component (page.tsx) builds the full artifact list with all data already
// resolved (download payloads, hrefs, last-edited timestamps) and passes it in.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { DownloadSkillButton } from '../DownloadSkillButton';
import { DownloadReportButton } from '../DownloadReportButton';

export type ArtifactType =
  | 'prompt'
  | 'skill'
  | 'workflow'
  | 'evidence'
  | 'work-product'
  | 'card'
  | 'report'
  | 'inventory';

export interface ToolkitArtifact {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: ArtifactType;
  readonly typeLabel: string;
  readonly module: number;
  readonly moduleHref: string;
  readonly lastEditedISO: string | null;
  readonly available: boolean;
  readonly qualitySignals?: readonly string[];
  readonly readinessLabel?: string;
  readonly transferMove?: string;
  readonly action:
    | { readonly kind: 'download-md'; readonly md: string; readonly filename: string }
    | { readonly kind: 'download-report'; readonly enrollmentId: string }
    | { readonly kind: 'link'; readonly href: string; readonly label: string }
    | { readonly kind: 'pending'; readonly href: string };
}

type SortKey = 'recent' | 'module' | 'type';
type FilterKey = 'all' | 'module' | 'type';

const kickerStyle: CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const itemCardStyle: CSSProperties = {
  border: '1px solid var(--ink-a10)',
  borderRadius: 16,
  padding: 18,
  background: 'var(--cream)',
};

const ghostLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  border: '1px solid var(--ink-a10)',
  color: 'var(--slate-500)',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  borderRadius: 12,
  textDecoration: 'none',
};

const accentLinkStyle: CSSProperties = {
  ...ghostLinkStyle,
  border: '1px solid var(--gold)',
  color: 'var(--gold-deep)',
};

const selectStyle: CSSProperties = {
  appearance: 'none',
  padding: '8px 32px 8px 12px',
  border: '1px solid var(--ink-a10)',
  borderRadius: 12,
  background:
    'var(--cream) url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\' viewBox=\'0 0 10 6\'><path fill=\'%2364748B\' d=\'M0 0l5 6 5-6z\'/></svg>") no-repeat right 12px center',
  color: 'var(--ink)',
  fontSize: '0.8125rem',
  fontWeight: 500,
  cursor: 'pointer',
};

const TYPE_LABELS: Record<ArtifactType, string> = {
  prompt: 'Saved prompt',
  skill: 'Reusable skill',
  workflow: 'Workflow map',
  evidence: 'Evidence note',
  'work-product': 'Review-ready work product',
  card: 'Acceptable Use card',
  report: 'Foundation packet',
  inventory: 'Subscription inventory',
};

function formatRelative(iso: string | null): string {
  if (!iso) return 'Not yet saved';
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days <= 0) return 'Edited today';
  if (days === 1) return 'Edited yesterday';
  if (days < 7) return `Edited ${days} days ago`;
  if (days < 30) return `Edited ${Math.floor(days / 7)} weeks ago`;
  return `Edited ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function ArtifactCard({ artifact }: { readonly artifact: ToolkitArtifact }) {
  const opacity = artifact.available ? 1 : 0.55;

  let actionEl: React.ReactNode = null;
  if (artifact.action.kind === 'download-md') {
    actionEl = (
      <DownloadSkillButton
        mdContent={artifact.action.md}
        filename={artifact.action.filename}
        label="Download .md"
      />
    );
  } else if (artifact.action.kind === 'download-report') {
    actionEl = <DownloadReportButton enrollmentId={artifact.action.enrollmentId} />;
  } else if (artifact.action.kind === 'link') {
    actionEl = (
      <Link href={artifact.action.href} style={accentLinkStyle}>
        {artifact.action.label}
      </Link>
    );
  } else {
    actionEl = (
      <Link
        href={artifact.action.href}
        style={ghostLinkStyle}
        aria-label={`Go to Module ${artifact.module} to access this artifact`}
      >
        Pending
      </Link>
    );
  }

  return (
    <article style={{ ...itemCardStyle, opacity }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 6,
            }}
          >
            <Link
              href={artifact.moduleHref}
              style={{
                ...kickerStyle,
                textDecoration: 'none',
              }}
            >
              Module {artifact.module}
            </Link>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: 999,
                border: '1px solid var(--gold)',
                color: 'var(--gold-deep)',
              }}
            >
              {artifact.typeLabel}
            </span>
          </div>
          <p
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: '0 0 4px',
              lineHeight: 1.3,
            }}
          >
            {artifact.title}
          </p>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--slate-500)',
              lineHeight: 1.6,
              margin: '0 0 8px',
            }}
          >
            {artifact.description}
          </p>
          {artifact.qualitySignals && artifact.qualitySignals.length > 0 && (
            <div
              aria-label="Artifact quality signals"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                margin: '0 0 10px',
              }}
            >
              {artifact.qualitySignals.slice(0, 3).map((signal) => (
                <span
                  key={signal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '1px solid var(--ink-a10)',
                    borderRadius: 999,
                    padding: '4px 9px',
                    background: artifact.available ? 'var(--cream-2)' : 'var(--slate-100)',
                    color: 'var(--slate-600)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  {signal}
                </span>
              ))}
            </div>
          )}
          {artifact.transferMove && (
            <p
              aria-label="Use this artifact at work"
              style={{
                margin: '0 0 10px',
                padding: '10px 12px',
                border: '1px solid var(--ink-a10)',
                borderRadius: 12,
                background: artifact.available ? '#fff' : 'var(--cream-2)',
                color: 'var(--ink)',
                fontSize: '0.8125rem',
                lineHeight: 1.42,
                fontWeight: 650,
              }}
            >
              <span
                style={{
                  color: 'var(--gold-deep)',
                  fontSize: '0.625rem',
                  fontWeight: 850,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginRight: 8,
                }}
              >
                Use at work
              </span>
              {artifact.transferMove}
            </p>
          )}
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--slate-400)',
              margin: 0,
              fontWeight: 500,
            }}
          >
            {artifact.readinessLabel ? `${artifact.readinessLabel} · ` : ''}
            {formatRelative(artifact.lastEditedISO)}
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>{actionEl}</div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        ...itemCardStyle,
        padding: 40,
        textAlign: 'center',
        background: 'var(--cream-2)',
        borderStyle: 'dashed',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: 'var(--cream)',
          border: '1px dashed var(--ink-a10)',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--slate-400)',
          fontSize: '1.5rem',
          fontWeight: 300,
        }}
      >
        +
      </div>
      <p
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--ink)',
          margin: '0 0 6px',
        }}
      >
        Nothing saved yet
      </p>
      <p style={{ fontSize: '1rem', color: 'var(--slate-500)', margin: 0, lineHeight: 1.6 }}>
        Your first saved prompt lands here once you finish Module 3.
      </p>
    </div>
  );
}

export function ArtifactsClient({
  artifacts,
}: {
  readonly artifacts: readonly ToolkitArtifact[];
}) {
  const [sort, setSort] = useState<SortKey>('recent');
  const [filter, setFilter] = useState<string>('all');

  const filterKey: FilterKey = filter.startsWith('m:')
    ? 'module'
    : filter.startsWith('t:')
      ? 'type'
      : 'all';

  const visible = useMemo(() => {
    let list = artifacts.slice();
    if (filterKey === 'module') {
      const mod = Number(filter.slice(2));
      list = list.filter((a) => a.module === mod);
    } else if (filterKey === 'type') {
      const t = filter.slice(2) as ArtifactType;
      list = list.filter((a) => a.type === t);
    }
    if (sort === 'recent') {
      list.sort((a, b) => {
        const aT = a.lastEditedISO ? new Date(a.lastEditedISO).getTime() : -Infinity;
        const bT = b.lastEditedISO ? new Date(b.lastEditedISO).getTime() : -Infinity;
        return bT - aT;
      });
    } else if (sort === 'module') {
      list.sort((a, b) => a.module - b.module);
    } else if (sort === 'type') {
      list.sort((a, b) => a.typeLabel.localeCompare(b.typeLabel));
    }
    return list;
  }, [artifacts, sort, filter, filterKey]);

  const availableArtifacts = artifacts.filter((a) => a.available);
  const hasAny = availableArtifacts.length > 0;

  const moduleOptions = Array.from(new Set(artifacts.map((a) => a.module))).sort(
    (a, b) => a - b,
  );
  const typeOptions = Array.from(new Set(artifacts.map((a) => a.type)));

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: '1px solid var(--ink-a10)',
        }}
      >
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--slate-500)',
            margin: 0,
          }}
        >
          Showing <strong style={{ color: 'var(--ink)' }}>{visible.length}</strong> of{' '}
          {artifacts.length}
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
            }}
          >
            Filter
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={selectStyle}
              aria-label="Filter artifacts"
            >
              <option value="all">All artifacts</option>
              <optgroup label="By type">
                {typeOptions.map((t) => (
                  <option key={t} value={`t:${t}`}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </optgroup>
              <optgroup label="By module">
                {moduleOptions.map((m) => (
                  <option key={m} value={`m:${m}`}>
                    Module {m}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
            }}
          >
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              style={selectStyle}
              aria-label="Sort artifacts"
            >
              <option value="recent">Most recent</option>
              <option value="module">Module order</option>
              <option value="type">Type</option>
            </select>
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {!hasAny ? (
          <EmptyState />
        ) : visible.length === 0 ? (
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--slate-500)',
              margin: 0,
              padding: '20px 0',
            }}
          >
            No artifacts match this filter.
          </p>
        ) : (
          visible.map((artifact) => <ArtifactCard key={artifact.id} artifact={artifact} />)
        )}
      </div>
    </div>
  );
}
