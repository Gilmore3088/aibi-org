'use client';

import Link from 'next/link';
import { useState } from 'react';
import { COVER_FIGURES, formatDate } from './covers';

// The archive as a publication grid: one card per piece, newest first, each
// led by a cover quoting the piece's key figure (or its primary source), with
// a mono filter for tier. Legacy essays have no tier and file under "essay".

export interface ArchiveEntry {
  readonly slug: string;
  readonly href: string;
  readonly title: string;
  readonly dek?: string;
  readonly date: string;
  readonly category: string;
  readonly readMinutes: number;
  readonly tier?: 'pulse' | 'deep-dive';
  /** Host of the first primary source, for the source-stamp cover. */
  readonly sourceHost?: string;
}

type Filter = 'all' | 'pulse' | 'deep-dive' | 'essay';
const FILTERS: readonly Filter[] = ['all', 'pulse', 'deep-dive', 'essay'];

const kindOf = (e: ArchiveEntry): Exclude<Filter, 'all'> => e.tier ?? 'essay';

function Cover({ entry }: { readonly entry: ArchiveEntry }) {
  const fig = COVER_FIGURES[entry.slug];
  return (
    <span className="ax-card-cover" aria-hidden="true">
      <span className="ax-card-cover-k">{entry.category}</span>
      {fig ? (
        <>
          <span className="ax-card-figure">{fig.figure}</span>
          <span className="ax-card-caption">{fig.caption}</span>
        </>
      ) : (
        <>
          <span className="ax-card-figure is-source">{entry.sourceHost ?? 'primary source'}</span>
          <span className="ax-card-caption">read against the primary source</span>
        </>
      )}
    </span>
  );
}

export function BriefingsArchive({ entries }: { readonly entries: readonly ArchiveEntry[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const present = new Set(entries.map(kindOf));
  const shown = filter === 'all' ? entries : entries.filter((e) => kindOf(e) === filter);

  return (
    <>
      <div className="ax-archive-head">
        <h2 id="archive-title" className="ax-display">
          More briefings
        </h2>
        <div className="ax-toggles" role="group" aria-label="Filter briefings">
          {FILTERS.filter((f) => f === 'all' || present.has(f)).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="ax-cards">
        {shown.map((e) => (
          <Link key={e.slug} href={e.href} className="ax-card">
            <Cover entry={e} />
            <span className="ax-card-body">
              <span className="ax-card-meta">
                <span className="ax-gold">{kindOf(e)}</span> · {formatDate(e.date)} · {e.readMinutes} min
              </span>
              <span className="ax-card-title">{e.title}</span>
              {e.dek && <span className="ax-card-dek">{e.dek}</span>}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
