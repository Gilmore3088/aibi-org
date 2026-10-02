// A faithful preview of the first rows of the real
// public/downloads/kit-assets/governance-starter-kit/AI-Use-Case-Inventory.xlsx
// — same columns (a subset, with their real column letters) and the two
// example rows the workbook ships with. Rendered as a spreadsheet because
// that is what the buyer actually receives.

const COLUMNS: ReadonlyArray<readonly [letter: string, header: string]> = [
  ['A', 'Status'],
  ['B', 'Department'],
  ['D', 'Workflow / AI use case'],
  ['G', 'Data class'],
  ['H', 'Risk tier'],
  ['K', 'Human reviewer'],
  ['L', 'Evidence retained'],
  ['P', 'Re-review trigger'],
];

export const INVENTORY_ROWS: ReadonlyArray<readonly string[]> = [
  [
    'Proposed',
    'Operations',
    'AI-assisted internal meeting summary',
    'Internal',
    'Yellow',
    'Operations manager',
    'Prompt, source notes, AI output, final summary',
    'Tool change; policy change; failed QA',
  ],
  [
    'Under Review',
    'Compliance',
    'AI-assisted use-case intake summary',
    'Confidential internal',
    'Yellow',
    'Compliance officer',
    'Intake form, output, reviewer edits, approval',
    'New data class; expanded audience; incident',
  ],
];

const TIER_CLASS: Record<string, string> = { Green: 'is-green', Yellow: 'is-yellow', Red: 'is-red' };

export function InventoryPreview() {
  return (
    <figure className="ax-sheet" aria-label="AI Use-Case Inventory spreadsheet, first rows">
      <figcaption className="ax-sheet-bar">
        <strong>AI-Use-Case-Inventory.xlsx</strong>
        <span>Governance Starter Kit · 17 columns</span>
      </figcaption>
      <div className="ax-sheet-scroll">
        <table>
          <thead>
            <tr className="ax-sheet-letters" aria-hidden="true">
              <th />
              {COLUMNS.map(([l]) => (
                <th key={l}>{l}</th>
              ))}
            </tr>
            <tr>
              <th className="ax-sheet-rownum">1</th>
              {COLUMNS.map(([l, h]) => (
                <th key={l} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INVENTORY_ROWS.map((row, r) => (
              <tr key={row[2]}>
                <th scope="row" className="ax-sheet-rownum">
                  {r + 2}
                </th>
                {row.map((cell, c) => (
                  <td key={COLUMNS[c][0]} className={c === 4 ? TIER_CLASS[cell] : undefined}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row" className="ax-sheet-rownum">
                {INVENTORY_ROWS.length + 2}
              </th>
              <td className="ax-sheet-empty">Not Started</td>
              {COLUMNS.slice(1).map(([l]) => (
                <td key={l} />
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="ax-sheet-tabs" aria-hidden="true">
        <span className="is-active">AI Use-Case Inventory</span>
        <span>Guidance</span>
      </div>
    </figure>
  );
}
