'use client';

import Link from 'next/link';
import { useState } from 'react';

// The archive as a log: one hairline row per piece, newest first, with a
// mono filter for tier. Legacy essays have no tier and file under "essay".

export interface ArchiveEntry {
  readonly slug: string;
  readonly href: string;
  readonly title: string;
  readonly dek?: string;
  readonly date: string;
  readonly category: string;
  readonly readMinutes: number;
  readonly tier?: 'pulse' | 'deep-dive';
}

type Filter = 'all' | 'pulse' | 'deep-dive' | 'essay';
const FILTERS: readonly Filter[] = ['all', 'pulse', 'deep-dive', 'essay'];

const kindOf = (e: ArchiveEntry): Exclude<Filter, 'all'> => e.tier ?? 'essay';

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function BriefingsArchive({ entries }: { readonly entries: readonly ArchiveEntry[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const present = new Set(entries.map(kindOf));
  const shown = filter === 'all' ? entries : entries.filter((e) => kindOf(e) === filter);

  return (
    <>
      <div className="ax-archive-head">
        <h2 id="archive-title" className="ax-display">
          Archive
        </h2>
        <div className="ax-toggles" role="group" aria-label="Filter briefings">
          {FILTERS.filter((f) => f === 'all' || present.has(f)).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="ax-log">
        {shown.map((e) => (
          <Link key={e.slug} href={e.href} className="ax-log-row">
            <span className="ax-log-meta">
              <span className="ax-gold">{kindOf(e)}</span> · {e.readMinutes} min
              <br />
              {e.category}
              <br />
              {formatDate(e.date)}
            </span>
            <span>
              <span className="ax-log-title">{e.title}</span>
              {e.dek && <p className="ax-log-dek">{e.dek}</p>}
            </span>
            <span className="ax-log-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
