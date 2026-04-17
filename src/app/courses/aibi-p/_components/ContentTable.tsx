// ContentTable — renders a ContentTable with proper styling
// Server Component: no interactivity needed
// SHELL-09: no horizontal page scroll on 390px — overflow-x-auto wrapper

import type { ContentTable as ContentTableType } from '@content/courses/aibi-p';

interface ContentTableProps {
  readonly table: ContentTableType;
}

export function ContentTable({ table }: ContentTableProps) {
  return (
    <div className="mb-12">
      {/* Caption */}
      <p className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-3">
        {table.caption}
      </p>

      {/* Horizontal scroll wrapper — prevents page-level overflow on 390px */}
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
    </div>
  );
}
