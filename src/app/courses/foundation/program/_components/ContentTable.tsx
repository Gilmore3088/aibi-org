// ContentTable — renders a ContentTable with proper styling
// Server Component: no interactivity needed
// SHELL-09: no horizontal page scroll on 390px — overflow-x-auto wrapper
// Large tables (8+ rows) render as a card grid for visual appeal

import type { ContentTable as ContentTableType } from '@content/courses/foundation-program';

interface ContentTableProps {
  readonly table: ContentTableType;
}

const CARD_GRID_THRESHOLD = 8;

function TableView({ table }: ContentTableProps) {
  return (
    <div
      className="overflow-x-auto -webkit-overflow-scrolling-touch rounded-sm border border-[color:var(--color-parch-dark)]"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <table className="w-full text-sm border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-[color:var(--color-parch-dark)]">
            {table.columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-t border-[color:var(--color-parch-dark)] hover:bg-[color:var(--color-parch)] transition-colors"
            >
              {table.columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 text-[color:var(--color-ink)] align-top text-sm leading-relaxed"
                >
                  {row[col.key] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardGrid({ table }: ContentTableProps) {
  // First column becomes the card title; remaining columns become metadata
  const titleColumn = table.columns[0];
  const metaColumns = table.columns.slice(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {table.rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="border border-[color:var(--color-ink)]/10 rounded-[3px] bg-[color:var(--color-parch)] border-t-2 border-t-[color:var(--color-terra)]"
        >
          {/* Card title — platform name */}
          <div className="px-4 pt-4 pb-2">
            <h3 className="font-serif text-lg text-[color:var(--color-ink)] leading-snug">
              {row[titleColumn.key] ?? ''}
            </h3>
          </div>

          {/* Metadata pairs */}
          <div className="px-4 pb-4 space-y-2">
            {metaColumns.map((col) => (
              <div key={col.key}>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--color-slate)] block mb-0.5">
                  {col.header}
                </span>
                <span className="text-sm text-[color:var(--color-ink)] leading-relaxed block">
                  {row[col.key] ?? ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ContentTable({ table }: ContentTableProps) {
  const isLargeTable = table.rows.length >= CARD_GRID_THRESHOLD;

  return (
    <div className="mb-12">
      {/* Caption */}
      <p className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-3">
        {table.caption}
      </p>

      {isLargeTable ? (
        <CardGrid table={{ ...table }} />
      ) : (
        <TableView table={{ ...table }} />
      )}
    </div>
  );
}
