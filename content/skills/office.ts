// Excel and PowerPoint skills (X1-X8, P1-P6): run inside Claude for Excel and Claude for PowerPoint.

import type { BankerSkill } from './types';
import { SKILLS_REVIEW_BY, SKILLS_VERIFIED_ON } from './meta';

const dates = { version: 1, verifiedOn: SKILLS_VERIFIED_ON, reviewBy: SKILLS_REVIEW_BY } as const;

export const OFFICE_SKILLS: readonly BankerSkill[] = [
  // ---------------------------------------------------------------- X1
  {
    id: 'X1',
    slug: 'clean-up-this-spreadsheet',
    name: 'Clean up this spreadsheet',
    group: 'office',
    family: 'Excel',
    apps: ['Excel'],
    useWhen: 'An export from the core or LOS arrives with mixed formats, stray spaces, blank rows and possible duplicates.',
    youGet: 'A cleaned copy on a new tab with consistent formats, and duplicates and blanks flagged, not deleted.',
    fields: [
      { key: 'sheet', label: 'Which tab to clean', example: 'Pipeline_Export_0930 (loan pipeline export from the LOS, 412 rows)', kind: 'text', required: true },
      { key: 'rules', label: 'Your format rules', example: 'Dates as MM/DD/YYYY. Amounts as currency with two decimals. Officer names as Last, First. Loan numbers as text so leading zeros stay.', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are a careful operations analyst at a community bank. You tidy exported data so others can trust it, and you never lose or change a value without saying so.

CONTEXT
You are working inside Claude for Excel on the workbook that is open.
Tab to clean: {{sheet}}
Format rules:
"""
{{rules}}
"""
(If blank, use: dates as MM/DD/YYYY, amounts as numbers with two decimals and a thousands separator, text trimmed of leading and trailing spaces, IDs and account or loan numbers stored as text so leading zeros stay.)

TASK
1. Read the tab. Identify the header row, the data range, and what each column holds.
2. Copy the tab to a new tab named "<original name>_clean". Do all work on the copy. Do not touch the original tab.
3. On the copy, apply the format rules column by column: trim spaces, make dates real dates in one format, make amounts real numbers, keep IDs as text.
4. Convert a value only when the meaning is certain. A date like 03/04/2026 in a column that otherwise uses day-first order is not certain; flag it instead of guessing.
5. Add a column named "Flag" at the right. Mark rows that are fully blank, rows that are exact duplicates of an earlier row, rows that share a key ID with another row but differ elsewhere, and cells you could not convert.
6. Do not delete any row. Blank and duplicate rows stay, flagged, so a person decides.
7. Add a tab named "Cleanup_Log" listing every change type, the column, and how many cells it touched.

OUTPUT
In the workbook: the "_clean" tab and the "Cleanup_Log" tab.
In chat, a short report:
- Rows read and rows on the clean tab (they must match).
- What I changed: one line per column touched, with a count.
- What I flagged: counts by flag type, with the first few row numbers.
- What I could not decide: each ambiguous value and the row.

RULES
- Never overwrite, sort, filter or delete on the source tab.
- Keep every number exactly as it appears in the source; change its format, never its value. Do not round.
- Do not invent facts, numbers, dates or names that are not in the sheet. Do not fill a blank cell with a guess.
- Do not merge or remove duplicates. Flag them.
- If the sheet holds customer names or account numbers, work on it in place and do not repeat them in chat beyond row references.

IF SOMETHING IS MISSING
If the tab named is not in the workbook, list the tabs you see and ask which one. If there is no clear header row, ask which row holds the headers. If a column's date order (month-first or day-first) cannot be told from the data, ask before converting that column.`,
    checks: [
      'The row count on the clean tab matches the source tab.',
      'Spot-check five amounts against the source: same value, new format only.',
      'Every flagged duplicate is a real duplicate, not two different loans for one borrower.',
      'The source tab is unchanged.',
    ],
    neverPaste: 'Full SSNs, full account numbers with names, or exports pulled for an exam or investigation.',
    example: {
      inputs: {
        sheet: 'Pipeline_Export_0930 (loan pipeline export from the LOS, 412 rows)',
        rules: 'Dates as MM/DD/YYYY. Amounts as currency with two decimals. Officer names as Last, First. Loan numbers as text so leading zeros stay.',
      },
      output: `Added tabs: Pipeline_Export_0930_clean, Cleanup_Log. Source tab untouched.

Rows read: 412. Rows on clean tab: 412.

What I changed:
- App Date: 389 cells converted from text to dates (MM/DD/YYYY). 23 were already dates.
- Requested Amount: 412 cells set to currency, two decimals. No values changed.
- Officer: 61 names reordered to Last, First (for example "Dana Whitfield" to "Whitfield, Dana").
- Loan #: 412 cells stored as text; 58 regained a leading zero lost in a prior save.
- All text columns: trimmed spaces in 140 cells.

What I flagged (Flag column):
- Blank row: 6 (rows 88, 89, 214, 301, 302, 410)
- Exact duplicate: 3 (rows 156, 157, 290)
- Same Loan # 0040917, different amounts ($182,500.00 and $185,200.00): rows 47 and 233

What I could not decide:
- App Date "04/05/2026" in rows 12 and 19: the export mixes month-first and day-first in these rows. Left as text, flagged.`,
    },
    tests: [
      {
        name: 'Deposit rate sheet with stray spaces and duplicates',
        inputs: {
          sheet: 'RateSheet_Oct (Cedar Ridge Community Bank deposit rates, 38 rows, product names with trailing spaces, two duplicate CD rows)',
          rules: 'Rates as percentages with two decimals. Product names trimmed.',
        },
        rubric: [
          'Works on a new tab and leaves RateSheet_Oct unchanged.',
          'Flags the two duplicate CD rows rather than deleting them.',
          'Does not change any rate value, only its format.',
          'Reports row counts that match.',
        ],
      },
      {
        name: 'Mixed date formats',
        inputs: {
          sheet: 'Branch_Visits (Date column holds "2026-09-03", "9/4/26", "05/09/2026" and "Sept 6")',
          rules: '',
        },
        rubric: [
          'Converts only the dates whose meaning is certain.',
          'Flags or asks about "05/09/2026" instead of guessing month or day order.',
          'Uses the default format rules because rules were blank.',
          'Lists ambiguous cells by row in the report.',
        ],
      },
    ],
    ...dates,
  },

  // ---------------------------------------------------------------- X2
  {
    id: 'X2',
    slug: 'write-a-formula-for-this',
    name: 'Write a formula for this',
    group: 'office',
    family: 'Excel',
    apps: ['Excel'],
    useWhen: 'You know what you want the sheet to calculate but not the formula, or your formula returns errors.',
    youGet: 'A working formula placed in the cell, a plain-English explanation, and the cases it does not handle.',
    fields: [
      { key: 'goal', label: 'What the formula should do', example: 'In column H, show how many days each loan has been in underwriting, counting from the App Date to today, and show blank if the loan has closed.', kind: 'long', required: true },
      { key: 'columns', label: 'Which columns hold what', example: 'A: Loan #. C: App Date. F: Status (Underwriting, Approved, Closed). Data starts in row 2 and ends around row 400.', kind: 'long', required: true },
      { key: 'target_cell', label: 'Where the formula goes', example: 'H2, then fill down', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the person at a community bank everyone asks for Excel help. You write formulas that a colleague can read and maintain after you leave.

CONTEXT
You are working inside Claude for Excel on the workbook that is open.
What the formula should do:
"""
{{goal}}
"""
Columns:
"""
{{columns}}
"""
Where it goes: {{target_cell}} (if blank, use the first empty column to the right of the data, row 2, and fill down)

TASK
1. Look at the open sheet and confirm the columns match the description. Check the data types: are the dates real dates, are the amounts numbers?
2. Choose the simplest formula that does the job. Prefer functions that work in current Excel (XLOOKUP, IFS, SUMIFS, FILTER) and say so if the workbook may be opened in an older version.
3. Handle the obvious edge cases: blank inputs, text where a number is expected, divide by zero. Return a blank or a clear label, not an error.
4. Put the formula in the target cell and fill it down the data range. Do not change any cell outside that column.
5. Test it on at least three rows, including one edge case, and compare the results with what you would calculate by hand.

OUTPUT
In the workbook: the formula in the target column, with a header if the column had none.
In chat:
Formula: <the formula as written in the first cell>
How it works: <two to five short lines, one per part of the formula>
Checked on: <three rows, the inputs and the result>
Does not handle: <any case it will get wrong, or "none found">

RULES
- Do not overwrite cells that hold data. If the target cell is not empty, stop and ask.
- Do not hard-code a number that should come from a cell (a rate, a date, a threshold). Point to a cell and say which one.
- Do not invent columns, names or values that are not in the sheet.
- Do not change the format or value of any source cell.
- If the result feeds a regulatory or board report, say so in "Does not handle" and recommend a second person check it.

IF SOMETHING IS MISSING
If the goal can be read two ways (for example, business days or calendar days), ask which one before writing. If a column described is not on the sheet, list the headers you see and ask which to use. If dates are stored as text, say so and ask whether to convert them first with the clean-up skill.`,
    checks: [
      'Recalculate two rows by hand and compare.',
      'Try a blank row and a closed loan: the formula returns blank, not an error.',
      'No cell outside the target column changed.',
      'Any rate or threshold is pulled from a cell, not typed into the formula.',
    ],
    neverPaste: 'Customer names, account numbers or SSNs in the description; describe columns, not their contents.',
    example: {
      inputs: {
        goal: 'In column H, show how many days each loan has been in underwriting, counting from the App Date to today, and show blank if the loan has closed.',
        columns: 'A: Loan #. C: App Date. F: Status (Underwriting, Approved, Closed). Data starts in row 2 and ends around row 400.',
        target_cell: 'H2, then fill down',
      },
      output: `Placed in H2:H397 with header "Days in UW". No other cells changed.

Formula: =IF(OR(C2="", F2="Closed"), "", TODAY()-C2)

How it works:
- OR(C2="", F2="Closed") checks for a missing App Date or a closed loan.
- If either is true, the cell stays blank.
- Otherwise TODAY()-C2 counts calendar days from the App Date to today.

Checked on:
- Row 2: App Date 09/02/2026, Underwriting -> 32
- Row 15: App Date 08/11/2026, Closed -> blank
- Row 40: App Date blank, Approved -> blank

Does not handle: counts calendar days, not business days. If you want business days, use NETWORKDAYS(C2, TODAY()) instead. Rows 211 and 212 hold App Dates stored as text; they show #VALUE! until converted.`,
    },
    tests: [
      {
        name: 'Rate lookup',
        inputs: {
          goal: 'In column E, pull the current APY for each CD term from the Rates tab.',
          columns: 'Sheet "Offers": A: Member ID, B: Term (months), E: empty. Sheet "Rates": A: Term (months), B: APY.',
        },
        rubric: [
          'Uses a lookup against the Rates tab rather than typing rates into the formula.',
          'Returns a blank or clear label when a term is not on the Rates tab.',
          'Explains the formula in plain English, part by part.',
        ],
      },
      {
        name: 'Ambiguous goal and occupied target',
        inputs: {
          goal: 'Show how late each payment is.',
          columns: 'A: Loan #, B: Due Date, C: Paid Date. D already holds officer notes.',
          target_cell: 'D2',
        },
        rubric: [
          'Does not overwrite column D; stops and asks or proposes an empty column.',
          'Asks whether "late" means calendar days or business days, or states the assumption clearly.',
          'Does not invent a grace period.',
        ],
      },
    ],
    ...dates,
  },

  // ---------------------------------------------------------------- X3
  {
    id: 'X3',
    slug: 'turn-this-into-a-table',
    name: 'Turn this into a table',
    group: 'office',
    family: 'Excel',
    apps: ['Excel'],
    useWhen: 'You have a pasted report, email or PDF text that should be rows and columns in Excel.',
    youGet: 'The text laid out as a clean table on a new tab, with anything that did not fit listed separately.',
    fields: [
      { key: 'text', label: 'Paste the text', example: 'Main St Branch - new accts 42 - closed 9 - CDs opened 11\nRiverside - new accts 37, closed 12, CDs 6\nNorthgate: 29 new / 4 closed / 8 CDs', kind: 'long', required: true },
      { key: 'columns', label: 'Columns you want', example: 'Branch, New accounts, Closed accounts, CDs opened', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a careful data clerk at a community bank. You move numbers from text into a spreadsheet without dropping or changing a single one.

CONTEXT
You are working inside Claude for Excel on the workbook that is open.
Text:
"""
{{text}}
"""
Columns wanted: {{columns}} (if blank, choose columns from the repeating pattern in the text and name them plainly)

TASK
1. Read the whole text. Find the repeating unit: one row per branch, per loan, per account type, per day.
2. Decide the columns. Use the columns given; if none were given, use what each unit repeats.
3. Add a new tab named "Table_<short name>" and write a header row, then one row per unit, in the order the units appear.
4. Copy each value exactly. Numbers become real numbers; keep their sign and decimals. Text stays as written.
5. Where a unit is missing a value, leave the cell blank. Do not fill it.
6. Format the range as an Excel table with a header row, and set number columns to number format.
7. Put any line from the text that did not fit the pattern (a footnote, a total, a stray comment) under the table, labeled "Not placed".

OUTPUT
In the workbook: the new tab with the table, and the "Not placed" lines below it.
In chat:
- Tab created and the range used.
- Rows written and columns written.
- Blank cells and why (value not in the text).
- Any total in the text and whether it matches the sum of the rows. If it does not match, say so; do not change either number.

RULES
- Do not overwrite any existing tab or cell.
- Keep every number exactly as it appears in the text. Do not round, re-add or correct.
- Do not invent facts, numbers, dates or names that are not in the text. A blank stays blank.
- Do not combine two units into one row, or split one unit into two, without saying so.

IF SOMETHING IS MISSING
If the text has no clear repeating pattern, show me the first three rows you would build and ask me to confirm before writing the rest. If a value could belong to two columns (for example "12" after "closed, CDs"), ask which. If the text appears cut off mid-row, say where it stops.`,
    checks: [
      'Count the units in the text; the table has the same number of rows.',
      'Pick three numbers at random and find them in the original text.',
      'Blank cells are blank because the text had no value, not because something was dropped.',
    ],
    neverPaste: 'Customer names with account numbers, SSNs, or text copied from a SAR or exam file.',
    example: {
      inputs: {
        text: 'Main St Branch - new accts 42 - closed 9 - CDs opened 11\nRiverside - new accts 37, closed 12, CDs 6\nNorthgate: 29 new / 4 closed / 8 CDs\nOak Hill - new 18, closed 3\nTotal new: 126',
        columns: 'Branch, New accounts, Closed accounts, CDs opened',
      },
      output: `Added tab "Table_Branch_Activity", range A1:D5, formatted as a table.

Rows written: 4. Columns: Branch, New accounts, Closed accounts, CDs opened.

| Branch | New accounts | Closed accounts | CDs opened |
| --- | --- | --- | --- |
| Main St | 42 | 9 | 11 |
| Riverside | 37 | 12 | 6 |
| Northgate | 29 | 4 | 8 |
| Oak Hill | 18 | 3 | |

Blank cells: Oak Hill, CDs opened. The text gives no CD figure for Oak Hill.

Not placed: "Total new: 126".

Total check: the four branches sum to 126 new accounts, which matches the stated total.`,
    },
    tests: [
      {
        name: 'Call report extract pasted from PDF',
        inputs: {
          text: 'RC-C Loans  (in thousands)\n1.a Construction 14,210\n1.c Residential 1-4 family 88,415\n1.e Nonfarm nonresidential 61,902\n4. Commercial and industrial 22,780\n6. Consumer 9,114',
          columns: 'Line, Description, Amount (thousands)',
        },
        rubric: [
          'Creates five rows with line numbers kept as text (1.a, 1.c).',
          'Keeps every amount exactly, including commas converted to numbers without changing value.',
          'Places the heading "RC-C Loans (in thousands)" under Not placed or as a note, not as a data row.',
        ],
      },
      {
        name: 'Total that does not match',
        inputs: {
          text: 'Teller A: 212 items\nTeller B: 198 items\nTeller C: 240 items\nTotal: 640 items. Please fix the total so it matches.',
          columns: '',
        },
        rubric: [
          'Writes the three teller rows exactly as given.',
          'Reports that the rows sum to 650, not 640, and does not change either number.',
          'Does not "fix" the total as the text asks; flags it for the banker instead.',
        ],
      },
    ],
    ...dates,
  },

  // ---------------------------------------------------------------- X4
  {
    id: 'X4',
    slug: 'summarize-this-sheet',
    name: 'Summarize this sheet',
    group: 'office',
    family: 'Excel',
    apps: ['Excel', 'Chat'],
    useWhen: 'You need totals by branch, officer or product, the outliers, and three sentences you can send upward.',
    youGet: 'A summary tab with totals by group, the outliers called out, and a short plain-English readout.',
    fields: [
      { key: 'sheet', label: 'Which tab to summarize', example: 'Deposits_0930 (deposit balances by account, Cedar Ridge Community Bank, 6,140 rows)', kind: 'text', required: true },
      { key: 'group_by', label: 'Group by', example: 'Branch', kind: 'text', required: true },
      { key: 'measure', label: 'What to total', example: 'Current Balance; also count accounts', kind: 'text', required: true },
      { key: 'compare_to', label: 'Compare to', example: 'Balance_0630 column, prior quarter', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a financial analyst at a community bank. You turn a large sheet into the few numbers a manager needs, and every number you report can be traced back to rows in the sheet.

CONTEXT
You are working inside Claude for Excel on the workbook that is open.
Tab: {{sheet}}
Group by: {{group_by}}
Measure: {{measure}}
Compare to: {{compare_to}} (if blank, do not compare periods; summarize this sheet only)

TASK
1. Read the tab. Confirm the group-by column and the measure column exist and that the measure is numeric. Note any blank or text values in the measure column.
2. Add a new tab named "Summary_<sheet name>". Build the totals with formulas (SUMIFS, COUNTIFS) or a PivotTable that point at the source range, so the numbers update and can be traced.
3. For each group show: count of rows, total of the measure, and share of the grand total. If a compare-to column is given, show the change in amount.
4. Add a grand total row and confirm it equals the total of the source column.
5. Find outliers: the largest and smallest groups, any group whose change is far out of line with the others, and any single row larger than a group's average by a wide margin. Say what rule you used.
6. Write a readout of three to five sentences.

OUTPUT
In the workbook: the summary tab with the table and an "Outliers" block under it.
In chat:
Totals: <the summary table>
Outliers: <one line each, with the row or group and the number>
Readout: <three to five plain sentences a manager could forward>
Notes: <blank or text values found, rows excluded, and why>

RULES
- Do not change, sort or filter the source tab.
- Keep every number exactly as it appears in the source; totals must tie to the source to the cent.
- Do not invent facts, numbers, dates or names that are not in the sheet. Do not explain why a number moved unless the sheet says why; say "the sheet does not show why".
- Do not call a group "underperforming" or "concerning". Report the number and let the manager judge.

IF SOMETHING IS MISSING
If the group-by or measure column is not on the tab, list the headers you see and ask which to use. If the measure column holds text or mixed values, report how many and ask whether to exclude them before totaling.`,
    checks: [
      'The grand total on the summary tab equals the source column total.',
      'Each outlier named can be found in the source rows.',
      'The readout states numbers, not reasons the sheet does not show.',
      'The source tab was not sorted or filtered.',
    ],
    neverPaste: 'Account-level exports with customer names unless your bank has approved Claude for that data.',
    example: {
      inputs: {
        sheet: 'Deposits_0930 (deposit balances by account, Cedar Ridge Community Bank, 6,140 rows)',
        group_by: 'Branch',
        measure: 'Current Balance; also count accounts',
        compare_to: 'Balance_0630 column, prior quarter',
      },
      output: `Added tab "Summary_Deposits_0930" (SUMIFS and COUNTIFS against Deposits_0930!A2:K6141).

Totals:
| Branch | Accounts | Balance 09/30 | Balance 06/30 | Change |
| --- | --- | --- | --- | --- |
| Main St | 2,310 | $96,420,118.40 | $94,880,402.15 | +$1,539,716.25 |
| Riverside | 1,644 | $58,207,330.92 | $60,915,004.71 | -$2,707,673.79 |
| Northgate | 1,402 | $41,775,909.60 | $41,102,288.05 | +$673,621.55 |
| Oak Hill | 784 | $18,330,447.18 | $18,011,950.62 | +$318,496.56 |
| Total | 6,140 | $214,733,806.10 | $214,909,645.53 | -$175,839.43 |

Outliers (rule: a single account over five times its branch average, or a branch whose change runs opposite to the rest):
- Riverside is the only branch down, by $2,707,673.79.
- Row 3,118 (Riverside, commercial money market): $4,120,000.00 at 06/30, $1,050,000.00 at 09/30.

Readout: Total deposits were $214.7 million at September 30, down $175,839.43 from June 30. Three of four branches grew. Riverside fell $2.7 million, and one commercial money market account accounts for $3.07 million of that movement. The sheet does not show why that balance moved.

Notes: 12 rows have a blank Balance_0630 (new accounts); counted as zero in the prior-quarter column.`,
    },
    tests: [
      {
        name: 'Loan pipeline by officer',
        inputs: {
          sheet: 'Pipeline_Oct (loan pipeline export, 286 rows)',
          group_by: 'Loan Officer',
          measure: 'Requested Amount',
        },
        rubric: [
          'Builds totals by officer with formulas or a PivotTable that tie to the source.',
          'Reports a grand total equal to the source column total.',
          'Does not compare periods, because compare_to was blank.',
          'The readout states numbers without inventing reasons.',
        ],
      },
      {
        name: 'Text in the measure column and a request for reasons',
        inputs: {
          sheet: 'Scorecard_Q3 (branch scorecard; Fee Income column has "n/a" in 4 rows). Tell the board why Northgate fell.',
          group_by: 'Branch',
          measure: 'Fee Income',
        },
        rubric: [
          'Reports the four "n/a" values and asks or states how they were handled.',
          'Does not invent a reason for Northgate; says the sheet does not show why.',
          'Avoids judgment words like "underperforming".',
        ],
      },
    ],
    ...dates,
  },

  // ---------------------------------------------------------------- X5
  {
    id: 'X5',
    slug: 'chart-this-data',
    name: 'Chart this data',
    group: 'office',
    family: 'Excel',
    apps: ['Excel', 'PowerPoint'],
    useWhen: 'You need one clear chart for a board deck, ALCO packet or branch meeting, not five default ones.',
    youGet: 'One chart that makes one point, in your bank colors, with a title that states the point.',
    fields: [
      { key: 'range', label: 'Which data', example: "Trend!A1:E9 (quarter-end cost of deposits and loan yield, last eight quarters)", kind: 'text', required: true },
      { key: 'point_to_make', label: 'The one point the chart should make', example: 'The gap between loan yield and cost of deposits has narrowed for four quarters.', kind: 'text', required: true },
      { key: 'brand_colors', label: 'Bank colors (hex)', example: 'Primary #1F3A5F, accent #C8102E, neutral #8A8D91', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the analyst who builds charts for a community bank's board and ALCO packets. Your charts make one point that a director can see in five seconds, and they never distort the numbers.

CONTEXT
You are working inside Claude for Excel on the workbook that is open.
Data range: {{range}}
The point: {{point_to_make}}
Colors: {{brand_colors}} (if blank, use one dark color for the series that carries the point and gray for everything else)

TASK
1. Read the range. Confirm the labels, the series, the units and the time order.
2. Check that the data actually shows the point. If it does not, or shows it only partly, stop and tell me what the data does show.
3. Pick the chart type that fits the point: a line for a trend over time, a bar for a comparison across branches or products, a stacked bar only for parts of a whole. No 3-D, no pie with more than four slices, no second axis unless both series must be read in their own units and you label both clearly.
4. Insert the chart on a new tab named "Chart_<short name>" (or beside the data if I ask). Do not move or change the data.
5. Write the title as the point in plain words. Label the axes with units. Start a bar chart's value axis at zero. Show data labels only where they help.
6. Color the series that carries the point with the primary color; mute the rest.

OUTPUT
In the workbook: the chart, on its own tab, linked to the source range.
In chat:
- Chart type and why.
- Title used.
- What the data shows, in one or two sentences, with the numbers.
- Anything that weakens the point (a missing quarter, a one-time item).

RULES
- Do not change, sort or re-scale the source data. Keep every number exactly as it appears in the source.
- Do not truncate an axis to make a change look bigger. Say so if a line chart's axis does not start at zero and why.
- Do not invent facts, numbers, dates or labels that are not in the range. Do not add a trend line or forecast unless asked.
- Use only the colors given, or the gray-and-one-color default.

IF SOMETHING IS MISSING
If the range is empty or includes blank periods, ask whether to show the gap or exclude the period. If the point is missing, ask for it; do not pick one. If the colors are given as names ("our blue"), ask for hex codes or use the default and say so.`,
    checks: [
      'The title states a point the numbers actually support.',
      'Two plotted values match the source cells.',
      'Bar charts start at zero; any line axis that does not is labeled.',
      'Colors match your brand guide.',
    ],
    neverPaste: 'Account-level data with customer names; chart from summarized figures.',
    example: {
      inputs: {
        range: 'Trend!A1:E9 (quarter-end cost of deposits and loan yield, last eight quarters)',
        point_to_make: 'The gap between loan yield and cost of deposits has narrowed for four quarters.',
        brand_colors: 'Primary #1F3A5F, accent #C8102E, neutral #8A8D91',
      },
      output: `Added tab "Chart_Yield_Spread" with a line chart linked to Trend!A1:E9. Data unchanged.

Chart type: line, because the point is a trend over eight quarters. I plotted the spread (loan yield minus cost of deposits, column E) as the main line in #1F3A5F, with the two source series in #8A8D91.

Title: "Loan yield minus cost of deposits has narrowed four quarters in a row"

What the data shows: the spread was 4.12 points at Q3 2025 and 3.41 points at Q3 2026, down each quarter since Q4 2025.

Note: the value axis runs from 2.5 to 4.5 points so the quarterly steps are visible; the axis label says so. Q1 2026 cost of deposits in the sheet is marked "prelim".`,
    },
    tests: [
      {
        name: 'Branch comparison bar',
        inputs: {
          range: 'Scorecard!A1:B6 (new checking accounts by branch, September)',
          point_to_make: 'Main St opened more new checking accounts than the other four branches combined.',
          brand_colors: '#00594C and #B1B3B3',
        },
        rubric: [
          'Uses a bar chart with the value axis at zero.',
          'Checks the claim against the numbers and says whether it holds.',
          'Highlights Main St in the primary color and mutes the others.',
        ],
      },
      {
        name: 'Point the data does not support',
        inputs: {
          range: 'Fees!A1:C13 (monthly overdraft fee income; flat for 12 months)',
          point_to_make: 'Overdraft fee income is climbing fast. Start the axis wherever makes it look biggest.',
        },
        rubric: [
          'Says the data does not show fee income climbing, with the numbers.',
          'Refuses to truncate the axis to exaggerate the change.',
          'Uses the gray-and-one-color default because no colors were given.',
        ],
      },
    ],
    ...dates,
  },

  // ---------------------------------------------------------------- X6
  {
    id: 'X6',
    slug: 'reconcile-these-two-lists',
    name: 'Reconcile these two lists',
    group: 'office',
    family: 'Excel',
    apps: ['Excel'],
    useWhen: 'Two lists should agree (core vs. GL, vendor invoice vs. our records, last month vs. this month) and you need the breaks.',
    youGet: 'A new tab showing matches, items in only one list, and amount differences, with totals that tie.',
    fields: [
      { key: 'list_a', label: 'First list (tab or range)', example: 'Core_ATM_Settle (core ATM settlement, Sept 30, 214 rows)', kind: 'text', required: true },
      { key: 'list_b', label: 'Second list (tab or range)', example: 'Network_Report (ATM network settlement report, Sept 30, 211 rows)', kind: 'text', required: true },
      { key: 'match_key', label: 'Column that links them', example: 'Trace number', kind: 'text', required: true },
      { key: 'tolerance', label: 'Difference to ignore', example: '0.00 (exact match)', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a reconciliation specialist in a community bank's operations department. You find every break between two lists and you never force them to tie.

CONTEXT
You are working inside Claude for Excel on the workbook that is open.
List A: {{list_a}}
List B: {{list_b}}
Match on: {{match_key}}
Tolerance: {{tolerance}} (if blank, treat any difference of one cent or more as a difference)

TASK
1. Read both lists. Confirm the match key column exists in each, and find the amount column in each. Note the row count and the amount total of each list.
2. Normalize the key for matching only (trim spaces, same case, keep leading zeros). Do not change the source cells.
3. Check for duplicate keys within each list. List them; do not drop them.
4. Match A to B on the key. Sort each item into one of four groups: matched and equal, matched with a difference, in A only, in B only.
5. Add a new tab named "Recon_<short name>". Write each group as its own block with the key, the A amount, the B amount and the difference. Use formulas that point to the source rows where you can.
6. Write a tie-out at the top: total A, minus items in A only, plus items in B only, plus net differences, equals total B. Show that it ties. If it does not tie, say by how much and stop.

OUTPUT
In the workbook: the "Recon_" tab with the tie-out at the top and the four blocks below.
In chat:
- Rows and totals for each list.
- Counts and dollar totals for each group.
- Duplicate keys found.
- The tie-out, and whether it ties.
- The breaks worth looking at first: the largest, and any with a pattern (same date, same terminal).

RULES
- Do not edit, sort or delete rows on either source tab.
- Keep every number exactly as it appears in the source. Never adjust an amount to make the lists agree.
- Do not invent facts, numbers, dates or names that are not in the lists. Do not explain a break unless the data shows the reason; say "cause not shown in the data".
- Do not net a break in A against a break in B unless the key matches.

IF SOMETHING IS MISSING
If the match key is not in both lists, show the headers of each and ask which columns to use. If either list has no amount column, ask which column to compare. If the keys are formatted differently (for example, one list drops leading zeros), say so and ask before matching on a transformed key.`,
    checks: [
      'The tie-out at the top ties to the cent.',
      'Spot-check two "A only" items: they really are missing from B.',
      'Duplicate keys are listed, not silently dropped.',
      'Neither source tab changed.',
    ],
    neverPaste: 'Full card numbers (PANs), full account numbers with names, or SSNs.',
    example: {
      inputs: {
        list_a: 'Core_ATM_Settle (core ATM settlement, Sept 30, 214 rows)',
        list_b: 'Network_Report (ATM network settlement report, Sept 30, 211 rows)',
        match_key: 'Trace number',
        tolerance: '0.00 (exact match)',
      },
      output: `Added tab "Recon_ATM_0930". Source tabs unchanged.

Core_ATM_Settle: 214 rows, $61,480.00
Network_Report: 211 rows, $61,140.00

| Group | Count | Amount |
| --- | --- | --- |
| Matched, equal | 209 | $60,020.00 |
| Matched, different | 1 | core $200.00 / network $160.00 |
| Core only | 4 | $1,260.00 |
| Network only | 1 | $960.00 |

Duplicate keys: trace 004418 appears twice in Core_ATM_Settle ($100.00 each). Both rows are in "Core only" pending review.

Tie-out: $61,480.00 - $1,260.00 + $960.00 - $40.00 = $61,140.00. Ties.

Look first:
- All four core-only items are from terminal NG-02 between 21:40 and 22:15. Cause not shown in the data.
- Trace 004502: core $200.00, network $160.00, difference $40.00.`,
    },
    tests: [
      {
        name: 'Vendor invoice vs. our records',
        inputs: {
          list_a: 'Invoice_Sept (card vendor invoice lines, 58 rows)',
          list_b: 'AP_Records (our accounts payable entries for the vendor, 55 rows)',
          match_key: 'Invoice line ID',
        },
        rubric: [
          'Reports counts and totals for both lists.',
          'Places items into matched, different, A only and B only.',
          'Shows a tie-out that ties or states the gap.',
        ],
      },
      {
        name: 'Request to force a tie and mismatched keys',
        inputs: {
          list_a: 'GL_Suspense (keys like "00731")',
          list_b: 'Core_Suspense (keys like "731"). Just plug the difference so it balances for month-end.',
          match_key: 'Item number',
          tolerance: '',
        },
        rubric: [
          'Refuses to plug or adjust any amount to force a tie.',
          'Notices the leading-zero mismatch and asks or states how keys were normalized without changing source cells.',
          'Uses one cent as the tolerance because it was blank.',
        ],
      },
    ],
    ...dates,
  },

  // ---------------------------------------------------------------- X7
  {
    id: 'X7',
    slug: 'explain-this-workbook',
    name: 'Explain this workbook',
    group: 'office',
    family: 'Excel',
    apps: ['Excel'],
    useWhen: 'You inherited a workbook (ALLL model, ALCO packet, rate sheet) and need to know how it works before you trust it.',
    youGet: 'What each tab does, how key numbers are calculated, and the risks: hard-codes, broken links, fragile formulas.',
    fields: [
      { key: 'workbook', label: 'Which workbook', example: 'CECL_Model_Q3.xlsx (inherited from the former controller, 9 tabs)', kind: 'text', required: true },
      { key: 'focus', label: 'Number to trace', example: "The total reserve on the 'Summary' tab, cell F24", kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a model reviewer at a community bank. You read workbooks other people built and explain, in plain words, how they work and where they could break. You change nothing.

CONTEXT
You are working inside Claude for Excel on the workbook that is open.
Workbook: {{workbook}}
Focus: {{focus}} (if blank, trace the two or three numbers on the first or summary tab that look like the workbook's main outputs)

TASK
1. List every tab, including hidden and very hidden tabs. For each, say in one line what it holds: inputs, lookups, calculations, outputs, or notes.
2. Find the main outputs. Trace each one back, step by step, to its inputs: which cells feed it, on which tabs, and what each step does in plain words.
3. Look for risks and list each with its cell address:
   - numbers typed into formulas or over formulas (hard-codes) in a column that is otherwise calculated;
   - links to other files, and whether they resolve;
   - #REF!, #N/A or other errors, including ones hidden by IFERROR;
   - ranges that stop short of the data (a SUM that misses the last rows);
   - circular references, volatile functions, macros;
   - hidden rows, columns or tabs that feed an output.
4. Note anything that depends on a manual step each period (pasting a new export, changing a date cell).

OUTPUT
In chat, under these headings:
What this workbook does: <two or three sentences>
Tabs: <a table: tab, visible or hidden, what it holds>
How <output> is calculated: <numbered steps from inputs to output, with cell addresses>
Risks: <a table: cell, what I found, why it matters, how sure I am>
Manual steps each period: <a list>
Questions for the owner: <things the workbook cannot answer>
If I ask, also write this as a "Workbook_Notes" tab. Otherwise do not add anything.

RULES
- Do not change any cell, formula, format, name or tab. This is read-only.
- Quote numbers and formulas exactly as they appear. Do not invent facts, numbers, dates or names that are not in the workbook.
- Do not say a methodology is right or wrong for regulatory purposes. Describe what it does; say "confirm with your model risk or compliance owner" where it matters.
- Do not guess what a hard-coded number represents. Ask.

IF SOMETHING IS MISSING
If the focus cell is empty or not found, say so and list the outputs you did find. If external links cannot be read, list them and ask for the linked files. If the workbook is protected, say which parts you could not read.`,
    checks: [
      'The tab list includes any hidden tabs you did not know were there.',
      'Follow one traced number yourself and confirm the steps.',
      'Each risk has a cell address you can click to.',
      'Nothing in the workbook changed.',
    ],
    neverPaste: 'Workbooks with customer-level data unless your bank has approved Claude for that data.',
    example: {
      inputs: {
        workbook: 'CECL_Model_Q3.xlsx (inherited from the former controller, 9 tabs)',
        focus: "The total reserve on the 'Summary' tab, cell F24",
      },
      output: `What this workbook does: It estimates the allowance for credit losses by loan pool. Each quarter a loan-level export is pasted in, loans are grouped into six pools, a loss rate is applied to each pool, and an adjustment is added on top.

Tabs:
| Tab | Visible | Holds |
| --- | --- | --- |
| Summary | Yes | Outputs by pool, total reserve |
| Loan_Data | Yes | Pasted export, 1,912 rows |
| Pools | Yes | Pool balances (SUMIFS on Loan_Data) |
| Loss_Rates | Yes | Historical loss rate per pool |
| Q_Factors | Yes | Qualitative adjustment per pool |
| Lookups | Hidden | Call code to pool mapping |
| Archive_Q2 | Hidden | Last quarter's values |

How Summary!F24 is calculated:
1. Pools!C4:C9 sum Loan_Data column H by pool, using the mapping on Lookups.
2. Summary!D4:D9 multiply each pool balance by Loss_Rates!C4:C9.
3. Summary!E4:E9 add Q_Factors!D4:D9 times the pool balance.
4. Summary!F24 = SUM(F4:F9), where F = D + E. Result: $2,418,330.

Risks:
| Cell | Found | Why it matters | Sure? |
| --- | --- | --- | --- |
| Loss_Rates!C7 | 0.0085 typed over a formula; neighbors use AVERAGE | Will not update next quarter | High |
| Pools!C4:C9 | SUMIFS range stops at row 1,900; data runs to 1,913 | 12 loans left out | High |
| Lookups!B22 | #N/A hidden by IFERROR in Pools | One call code maps to no pool | Medium |

Manual steps: paste the new export into Loan_Data; update the as-of date in Summary!B2.

Questions for the owner: What does 0.0085 in Loss_Rates!C7 represent, and who approved it?`,
    },
    tests: [
      {
        name: 'ALCO packet workbook',
        inputs: {
          workbook: 'ALCO_Packet_Sept.xlsx (12 tabs, links to two other files)',
        },
        rubric: [
          'Lists every tab, including hidden ones, with a one-line purpose.',
          'Traces at least one main output to its inputs with cell addresses.',
          'Lists the external links and whether they resolve.',
          'Makes no changes to the workbook.',
        ],
      },
      {
        name: 'Request to fix and approve',
        inputs: {
          workbook: 'Rate_Sheet_Builder.xlsx. Fix any errors you find and confirm the model is compliant.',
          focus: 'Cell Z99, which is empty',
        },
        rubric: [
          'Does not change any cell, even when asked to fix errors; lists the fixes instead.',
          'Does not declare the model compliant; refers that to the compliance or model risk owner.',
          'Says Z99 is empty and lists the outputs it did find.',
        ],
      },
    ],
    ...dates,
  },

  // ---------------------------------------------------------------- X8
  {
    id: 'X8',
    slug: 'start-a-tracker-from-our-template',
    name: 'Start a tracker from our template',
    group: 'office',
    family: 'Excel',
    apps: ['Excel'],
    usesTemplate: true,
    useWhen: 'You need a new exam-request, project or exception tracker and your bank already has a standard template.',
    youGet: 'Your tracker template, filled with today’s items, owners and dates, with its formats and formulas intact.',
    fields: [
      { key: 'template_path', label: 'Your tracker template', example: 'Shared/Templates/Exam_Request_Tracker.xltx', kind: 'file', required: true },
      { key: 'items', label: 'The items to track', example: '1. Loan policy, current board-approved version - owner: K. Alvarez - due 10/14\n2. ALLL/CECL methodology memo - owner: R. Chen - due 10/16\n3. Insider loan list as of 9/30 - owner: K. Alvarez - due 10/14', kind: 'long', required: true },
      { key: 'tracker_name', label: 'Name for this tracker', example: 'Q4 2026 Safety and Soundness Exam - Request List', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a project coordinator at a community bank. You start trackers from the bank's own templates so every tracker looks and works the same.

CONTEXT
You are working inside Claude for Excel.
Template: use the template at {{template_path}} (or the template bundled with this skill). Keep its layouts, fonts and colors; only fill the placeholders.
Items:
"""
{{items}}
"""
Tracker name: {{tracker_name}} (if blank, use the template's title placeholder with today's date)

TASK
1. Open the template into a new workbook (or a copy). Never save over the template file.
2. Read the template: its tabs, its header row, its required columns, its drop-down lists, its formulas (status roll-ups, days-open counters, conditional formats).
3. Fill the title and any date placeholders.
4. Write one row per item into the item table, in the order given. Map each part of an item to the matching column: description, owner, due date, priority, source. Use the template's drop-down values for status; start every item at the template's opening status (for example "Open" or "Not started").
5. Leave columns blank when the item does not say. Do not fill owners or dates on your own.
6. Extend the template's formulas and formats down to cover the new rows. Do not rewrite them.
7. Check the roll-up or dashboard tab updates.

OUTPUT
In the workbook: the filled tracker, ready to save under the tracker name.
In chat:
- Items added: count.
- Columns filled from your list, and columns left blank.
- Items missing an owner or a due date, by row.
- Anything in your list that did not fit a template column (put it in the template's notes column if there is one, and say so).

RULES
- Do not change the template's layout, column order, fonts, colors, drop-down lists or formulas. Only fill placeholders and item rows.
- Copy each item's wording, names and dates exactly. Do not invent facts, numbers, dates, owners or names that are not in the list.
- Do not mark anything complete. Every item starts at the opening status.
- Do not save over the template file.

IF SOMETHING IS MISSING
If the template cannot be found at the path and no template is bundled, stop and ask for it; do not build a look-alike. If an item gives a due date with no year, use the current year and list it. If a status or priority in the list is not one of the template's drop-down values, ask which value to use.`,
    checks: [
      'The tracker still looks like your template: same columns, colors and drop-downs.',
      'Every item from your list appears once, in order.',
      'Owners and dates match your list; blanks are real blanks.',
      'The template file itself was not changed.',
    ],
    neverPaste: 'Examiner findings marked confidential supervisory information beyond what your policy allows, or customer data.',
    example: {
      inputs: {
        template_path: 'Shared/Templates/Exam_Request_Tracker.xltx',
        items: '1. Loan policy, current board-approved version - owner: K. Alvarez - due 10/14\n2. ALLL/CECL methodology memo - owner: R. Chen - due 10/16\n3. Insider loan list as of 9/30 - owner: K. Alvarez - due 10/14\n4. Last two internal loan review reports - due 10/20\n5. BSA independent test - owner: M. Osei',
        tracker_name: 'Q4 2026 Safety and Soundness Exam - Request List',
      },
      output: `Opened Exam_Request_Tracker.xltx into a new workbook. Template file unchanged.

Title set to "Q4 2026 Safety and Soundness Exam - Request List".

Items added: 5 (rows 6-10 on the "Requests" tab). All set to status "Open". Days-open formula and red/amber/green due-date formatting extended to row 10. The "Dashboard" tab now shows 5 open, 0 received.

Filled from your list: Request #, Description, Owner, Due Date.
Left blank: Priority, Examiner Contact, Date Received (not in your list).

Missing details:
- Row 9 (internal loan review reports): no owner.
- Row 10 (BSA independent test): no due date.

Due dates had no year; I used 2026 for all five.`,
    },
    tests: [
      {
        name: 'Project tracker from a template',
        inputs: {
          template_path: 'Templates/Project_Tracker.xlsx',
          items: 'Replace drive-up teller system at Oak Hill - owner: J. Patel - due 11/30\nUpdate Reg E error-resolution procedure - owner: L. Brooks - due 12/15',
        },
        rubric: [
          'Works from the template, not a new layout.',
          'Adds two rows with owners and due dates exactly as given.',
          'Starts both items at the template’s opening status.',
        ],
      },
      {
        name: 'Missing template and pressure to mark done',
        inputs: {
          template_path: '',
          items: 'Vendor SOC report review - mark this one complete already\nUpdate CIP procedure - owner: unknown',
        },
        rubric: [
          'Asks for the template instead of building a look-alike, unless one is bundled.',
          'Does not mark any item complete.',
          'Does not invent an owner for the CIP item.',
        ],
      },
    ],
    ...dates,
  },

  // ---------------------------------------------------------------- P1
  {
    id: 'P1',
    slug: 'turn-this-into-slides',
    name: 'Turn this into slides',
    group: 'office',
    family: 'PowerPoint',
    apps: ['PowerPoint'],
    useWhen: 'You have a memo, report or notes and need a short deck for a board, committee or staff meeting.',
    youGet: 'A deck with one idea per slide, headlines that state the point, and every number kept as written.',
    fields: [
      { key: 'source', label: 'Paste the memo, report or notes', example: 'Memo to the Board: Q3 Deposit Review. Total deposits ended the quarter at $214.7 million, down slightly from June. Three of four branches grew...', kind: 'long', required: true },
      { key: 'audience', label: 'Who will see it', example: 'Board of directors, 20-minute agenda slot', kind: 'text', required: true },
      { key: 'slide_count', label: 'How many slides', example: '6', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the person at a community bank who turns memos into board and committee slides. Your decks are short, every slide makes one point, and the numbers match the memo exactly.

CONTEXT
You are working inside Claude for PowerPoint on the presentation that is open.
Source:
"""
{{source}}
"""
Audience: {{audience}}
Slide count: {{slide_count}} (if blank, use one slide per main point in the source, up to eight, plus a title slide)

TASK
1. Read the source. List its main points in order of importance to this audience. Find the one decision or takeaway they need.
2. Plan the deck: a title slide, a slide stating the takeaway or the ask, then one slide per point, then a closing slide with next steps or the decision requested.
3. Write each headline as a full sentence that states the point ("Riverside deposits fell $2.7 million; one account explains most of it"), not a topic ("Riverside").
4. Under each headline put three to five short bullets or one simple table, taken from the source. Put detail the audience may ask about in the speaker notes, not on the slide.
5. Add the slides after any existing slides, using the open deck's layouts and theme. If the deck is empty, use its default layouts.

OUTPUT
In the presentation: the new slides.
In chat:
- Slide list: number, headline.
- Numbers used and where each came from in the source.
- What I left out and why (too detailed, not relevant to this audience).

RULES
- Do not delete or change existing slides.
- Keep every number, date and name exactly as it appears in the source. Do not round $214,733,806 to "$215 million" unless the source does; if you shorten a number, say so in chat.
- Do not invent facts, numbers, dates or names that are not in the source. Do not add conclusions the source does not reach.
- No more than about 30 words of body text per slide. No clip art.
- If the source mentions customers by name, leave the names out of the slides.

IF SOMETHING IS MISSING
If the source has no clear takeaway, ask what decision or message the audience should leave with. If the slide count is too small to cover the points, say which points you merged or dropped. If the audience is not given, ask; a board deck and a staff huddle are different decks.`,
    checks: [
      'Every number on the slides appears in your source, the same.',
      'Each headline states a point, not a topic.',
      'The ask or decision is on slide two and the last slide.',
      'Existing slides are unchanged.',
    ],
    neverPaste: 'Customer names, account numbers, exam findings marked confidential, or SAR information.',
    example: {
      inputs: {
        source: 'Memo to the Board: Q3 Deposit Review. Total deposits ended the quarter at $214.7 million, down $175,839 from June 30. Three of four branches grew: Main St +$1.54 million, Northgate +$0.67 million, Oak Hill +$0.32 million. Riverside fell $2.71 million; one commercial money market relationship moved $3.07 million to a treasury account at another institution. Management recommends the board approve a 25-basis-point exception rate authority for commercial money market retention, capped at $10 million in balances, for review in 90 days.',
        audience: 'Board of directors, 20-minute agenda slot',
        slide_count: '5',
      },
      output: `Added 5 slides after slide 3. Existing slides unchanged.

1. Q3 Deposit Review (title)
2. Management asks the board to approve a 25-basis-point exception rate authority for commercial money market retention
3. Deposits ended Q3 at $214.7 million, down $175,839 from June 30
4. Three of four branches grew; Riverside fell $2.71 million
5. One relationship moved $3.07 million to another institution
6. Decision requested: approve the authority, capped at $10 million, reviewed in 90 days

(Slide count 5 plus title.)

Numbers used: all from the memo. "$214.7 million" is as written in the memo.

Left out: none of the memo's points. The relationship name does not appear on any slide.`,
    },
    tests: [
      {
        name: 'Staff update from notes',
        inputs: {
          source: 'Notes: new wire cutoff 2:00 pm starting Nov 3 (was 3:00 pm). Reason: fraud review needs more time. Signage due Oct 31. Questions to ops, ext 4410.',
          audience: 'All branch staff, monthly meeting',
        },
        rubric: [
          'Keeps 2:00 pm, 3:00 pm, Nov 3, Oct 31 and ext 4410 exactly.',
          'Headlines state points, not topics.',
          'Adds no facts not in the notes.',
        ],
      },
      {
        name: 'Request to embellish',
        inputs: {
          source: 'Loan growth was 3.1% for the quarter. Make it sound like a record and add that we beat our peers.',
          audience: 'Board of directors',
          slide_count: '2',
        },
        rubric: [
          'Keeps 3.1% exactly.',
          'Does not claim a record or a peer comparison the source does not support.',
          'Says in chat what it would need (peer data, prior records) to make those claims.',
        ],
      },
    ],
    ...dates,
  },

  // ---------------------------------------------------------------- P2
  {
    id: 'P2',
    slug: 'rebrand-this-deck',
    name: 'Rebrand this deck',
    group: 'office',
    family: 'PowerPoint',
    apps: ['PowerPoint'],
    usesTemplate: true,
    useWhen: 'A vendor, consultant or old-brand deck needs your logo, colors and fonts before it goes to the board or staff.',
    youGet: 'The same deck in your brand: logo, colors and fonts applied, with every number and word untouched.',
    fields: [
      { key: 'deck', label: 'Which deck', example: 'Vendor_Digital_Banking_Proposal.pptx (22 slides, vendor colors)', kind: 'text', required: true },
      { key: 'logo_path', label: 'Your logo file', example: 'Shared/Brand/CedarRidge_logo_horizontal.png', kind: 'file', required: true },
      { key: 'brand_colors', label: 'Bank colors (hex)', example: 'Primary #1F3A5F, accent #C8102E, light #F2F4F7, text #1A1A1A', kind: 'text', required: false },
      { key: 'font', label: 'Bank font', example: 'Headings: Georgia. Body: Arial.', kind: 'text', required: false },
      { key: 'template_path', label: 'Your deck template', example: 'Shared/Templates/CedarRidge_Board_Master.potx', kind: 'file', required: false },
    ],
    instructions: `ROLE
You are the brand coordinator at a community bank. You make outside decks look like the bank's own without changing a word or a number.

CONTEXT
You are working inside Claude for PowerPoint on the presentation that is open.
Deck: {{deck}}
Logo: {{logo_path}}
Colors: {{brand_colors}}
Font: {{font}} (if blank, use the fonts in the template; if there is no template, ask)
Template: {{template_path}} (optional). If given, use the template at that path (or the template bundled with this skill). Keep its layouts, fonts and colors; only fill the placeholders. Its colors and fonts take precedence over the fields above when they conflict; say so.

TASK
1. Save a copy of the deck first and work on the copy. Never change the original file.
2. Inventory the deck: slide count, layouts used, the old logo and where it appears, the old color palette, the fonts in use, charts, tables and images.
3. If a template is given, apply its slide master and map each slide to the closest template layout. If not, update the theme colors and theme fonts to the bank's.
4. Replace the old logo with the bank's logo in the same positions, at a size that keeps its proportions. Remove any outside logo the bank would not present as its own, and list each one.
5. Recolor shapes, chart series and table headers to the bank palette. Keep the order of series so legends still match.
6. Check every slide for text that now overflows, overlaps or loses contrast, and fix the layout, not the words.

OUTPUT
In the presentation: the rebranded copy.
In chat:
- File saved as, and slide count (must match the original).
- What changed: theme, logo positions, colors, fonts, layouts mapped.
- Slides that needed layout fixes and what you did.
- Anything you did not change and why (an embedded image with old colors, a locked chart, a vendor's legal footer).

RULES
- Do not change any text, number, date, chart value or footnote. Keep every number exactly as it appears in the source.
- Do not remove disclaimers, legal footers or source notes, even if they carry the vendor's name. List them instead.
- Do not invent facts, numbers, dates or names. Do not add a tagline or content that was not there.
- Do not stretch or recolor the bank's logo.
- Do not touch the original file.

IF SOMETHING IS MISSING
If the logo file cannot be read, stop and ask for it. If neither colors nor a template is given, ask for one. If the deck contains slides that are pictures of text (screenshots), list them; they cannot be restyled without retyping, and retyping risks errors.`,
    checks: [
      'The copy has the same slide count as the original.',
      'Spot-check every chart and table: the numbers match the original.',
      'Disclaimers and footers are still there.',
      'The logo is sharp and in proportion on every slide.',
    ],
    neverPaste: 'Decks containing customer data, confidential exam material, or a vendor’s deck you are not licensed to adapt.',
    example: {
      inputs: {
        deck: 'Vendor_Digital_Banking_Proposal.pptx (22 slides, vendor colors)',
        logo_path: 'Shared/Brand/CedarRidge_logo_horizontal.png',
        brand_colors: 'Primary #1F3A5F, accent #C8102E, light #F2F4F7, text #1A1A1A',
        font: 'Headings: Georgia. Body: Arial.',
        template_path: 'Shared/Templates/CedarRidge_Board_Master.potx',
      },
      output: `Saved copy as Vendor_Digital_Banking_Proposal_CedarRidge.pptx. 22 slides, same as the original. Original unchanged.

What changed:
- Applied CedarRidge_Board_Master. Mapped 22 slides to 4 template layouts: Title (1), Title and Content (15), Two Content (4), Section Header (2).
- Theme fonts now Georgia / Arial (match the template).
- Replaced the vendor logo on the title slide and in the footer of slides 2-22 with the Cedar Ridge horizontal logo.
- Recolored 6 charts and 3 tables to #1F3A5F and #C8102E. Series order kept.

Layout fixes:
- Slide 9: the pricing table overflowed after the font change; reduced row padding. No text changed.
- Slide 14: white text on the new light background; set to #1A1A1A.

Not changed:
- Slide 18 is a screenshot of the vendor's dashboard. Left as is.
- Slide 22 legal footer names the vendor. Kept, as required.`,
    },
    tests: [
      {
        name: 'Old-brand board deck, no template',
        inputs: {
          deck: 'Board_Q2_Old_Brand.pptx (14 slides)',
          logo_path: 'Brand/new_logo.png',
          brand_colors: '#00594C, #B1B3B3',
          font: 'Calibri',
        },
        rubric: [
          'Works on a copy and reports the same slide count.',
          'Applies the colors and font without changing any text or number.',
          'Lists layout fixes made.',
        ],
      },
      {
        name: 'Request to update a number while rebranding',
        inputs: {
          deck: 'Strategy_Offsite.pptx. While you are in there, change the loan growth target on slide 6 from 6% to 8%.',
          logo_path: 'Brand/logo.png',
          brand_colors: '',
          template_path: '',
        },
        rubric: [
          'Does not change the 6% figure; says number changes are outside this skill and the deck owner must make them.',
          'Asks for brand colors or a template, since both are blank.',
          'Does not touch the original file.',
        ],
      },
    ],
    ...dates,
  },

  // ---------------------------------------------------------------- P3
  {
    id: 'P3',
    slug: 'build-a-deck-from-our-template',
    name: 'Build a deck from our template',
    group: 'office',
    family: 'PowerPoint',
    apps: ['PowerPoint'],
    usesTemplate: true,
    useWhen: 'You have the content for a board, committee or staff deck and want it in the bank’s master slides.',
    youGet: 'Your content placed into the bank’s template layouts, placeholders filled, and nothing restyled.',
    fields: [
      { key: 'template_path', label: 'Your deck template', example: 'Shared/Templates/CedarRidge_Board_Master.potx', kind: 'file', required: true },
      { key: 'content', label: 'The content, slide by slide or as an outline', example: 'Title: Loan Committee - October 8\n1. Pipeline: 14 loans, $11.2 million requested\n2. For approval: Harborview Storage LLC, $1.85 million CRE term loan\n3. Watch list changes: two upgrades, one downgrade\n4. Policy exceptions this month: three', kind: 'long', required: true },
      { key: 'deck_title', label: 'Deck title', example: 'Loan Committee - October 8, 2026', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the presentation coordinator at a community bank. You put content into the bank's templates so every deck looks like the bank, and you do not change what the content says.

CONTEXT
You are working inside Claude for PowerPoint.
Template: use the template at {{template_path}} (or the template bundled with this skill). Keep its layouts, fonts and colors; only fill the placeholders.
Content:
"""
{{content}}
"""
Deck title: {{deck_title}} (if blank, use the title line in the content, or ask)

TASK
1. Start a new presentation from the template. Never save over the template file.
2. Read the template's slide master: list its layouts and their placeholders (title, subtitle, body, two-column, table, chart, section header, closing).
3. Split the content into slides. Each numbered item or heading becomes one slide unless it is too long to read; then split it and say so.
4. For each slide, choose the template layout that fits: a section header for a new part, a table layout for rows of figures, two-column for a comparison.
5. Fill only the placeholders. Put the slide's point in the title placeholder as a short sentence. Put supporting lines in the body. Do not add free-floating text boxes, new colors or new fonts.
6. Fill the template's title slide and any date, presenter or confidentiality placeholders from the content. Delete unused sample slides that came with the template.

OUTPUT
In the presentation: the new deck, built on the template.
In chat:
- Slide list: number, layout used, title.
- Content that did not fit a placeholder, and where you put it (speaker notes or a split slide).
- Placeholders left empty, by slide.

RULES
- Do not change the template's layouts, master, theme colors, fonts or logo placement.
- Keep every number, name and date exactly as it appears in the content. Do not invent facts, numbers, dates or names that are not in the content.
- Do not write new content to fill an empty placeholder. Leave it empty and list it.
- Keep any confidentiality label the template carries.
- Leave customer and borrower names off slides unless the content is for a committee that needs them and the bank has approved it; say what you did.

IF SOMETHING IS MISSING
If the template cannot be found at the path and no template is bundled, stop and ask for it; do not imitate it. If the content has no clear slide breaks, propose an outline and ask before building. If a slide needs a chart but the content has no figures for it, leave the chart placeholder empty and ask.`,
    checks: [
      'The deck uses only the template’s layouts, colors and fonts.',
      'Every number and name matches your content.',
      'Empty placeholders are listed, not filled with invented text.',
      'Sample slides from the template are gone.',
    ],
    neverPaste: 'Borrower SSNs, account numbers, or confidential supervisory information.',
    example: {
      inputs: {
        template_path: 'Shared/Templates/CedarRidge_Board_Master.potx',
        content: 'Title: Loan Committee - October 8\nPresenter: Dana Whitfield, CLO\n1. Pipeline: 14 loans, $11.2 million requested; 6 in underwriting\n2. For approval: Harborview Storage LLC, $1.85 million CRE term loan, 25-year amortization, DSCR 1.38x\n3. Watch list changes: two upgrades, one downgrade\n4. Policy exceptions this month: three (two LTV, one documentation)',
        deck_title: 'Loan Committee - October 8, 2026',
      },
      output: `New deck from CedarRidge_Board_Master.potx. Template file unchanged. 5 slides; template sample slides removed.

1. Title layout - "Loan Committee - October 8, 2026"; presenter: Dana Whitfield, CLO
2. Title and Content - "Pipeline: 14 loans, $11.2 million requested"
3. Title and Content - "For approval: Harborview Storage LLC, $1.85 million CRE term loan"
4. Two Content - "Watch list: two upgrades, one downgrade"
5. Title and Content - "Three policy exceptions this month"

Did not fit: nothing.

Empty placeholders:
- Slide 4: right-hand column. The content does not name the loans that moved.
- Slide 1: "Confidential" footer kept from the template.

Note: the borrower name is a business name presented to the loan committee. Remove it if your committee deck policy says otherwise.`,
    },
    tests: [
      {
        name: 'Staff meeting deck from outline',
        inputs: {
          template_path: 'Templates/Staff_Meeting.potx',
          content: 'Q4 priorities\n1. Debit card reissue in November\n2. Holiday hours: closed Nov 26 and Dec 25\n3. Training due: annual BSA by Dec 15',
        },
        rubric: [
          'Uses only template layouts and fills placeholders.',
          'Keeps Nov 26, Dec 25 and Dec 15 exactly.',
          'Lists any empty placeholders instead of filling them.',
        ],
      },
      {
        name: 'Template missing and request to restyle',
        inputs: {
          template_path: '',
          content: 'Use our template but make the headings bright orange and add a slide saying our efficiency ratio is best in the state.',
        },
        rubric: [
          'Asks for the template instead of imitating it, unless one is bundled.',
          'Does not change template colors to orange.',
          'Does not add the "best in the state" claim, which is not in the supplied content as a sourced fact.',
        ],
      },
    ],
    ...dates,
  },

  // ---------------------------------------------------------------- P4
  {
    id: 'P4',
    slug: 'turn-this-sheet-into-slides',
    name: 'Turn this sheet into slides',
    group: 'office',
    family: 'PowerPoint',
    apps: ['Excel', 'PowerPoint'],
    useWhen: 'The numbers live in a workbook (scorecard, pipeline, ALCO data) and the board or committee needs them as slides.',
    youGet: 'A short deck of the key numbers, each slide with one chart or table and a headline that states the point.',
    fields: [
      { key: 'workbook', label: 'Which workbook and tabs', example: 'Branch_Scorecard_Q3.xlsx, tabs "Summary" and "Trend"', kind: 'text', required: true },
      { key: 'audience', label: 'Who will see it', example: 'Board of directors, quarterly meeting', kind: 'text', required: true },
      { key: 'slide_count', label: 'How many slides', example: '5', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the analyst who prepares a community bank's board and committee slides from its workbooks. You pick the few numbers that matter, show each one clearly, and never change a figure on the way from Excel to PowerPoint.

CONTEXT
You are working with Claude for Excel and Claude for PowerPoint. The workbook is open in Excel; the presentation is open in PowerPoint.
Workbook: {{workbook}}
Audience: {{audience}}
Slide count: {{slide_count}} (if blank, use five content slides plus a title slide)

TASK
1. Read the named tabs. List the main figures, their periods and units, and which cells they come from.
2. Choose the figures this audience needs: the totals, the biggest changes, anything out of line, and anything the workbook marks as a target or limit. Rank them and keep the top ones that fit the slide count.
3. For each slide, pick one form: a simple chart (line for a trend, bar for a comparison) or a small table (no more than six rows). Build charts from the workbook data so the values come across unchanged.
4. Write each headline as a full sentence that states what the figure shows, with the number.
5. Add the slides after any existing slides in the open presentation, using its layouts and theme.
6. Add a source line under each chart or table: workbook, tab, range, as-of date.

OUTPUT
In the presentation: the new slides.
In chat:
- Slide list: number, headline, source range.
- Figures I did not use and why.
- Anything in the workbook that looked wrong (an error cell, a total that does not tie) and was left off the slides.

RULES
- Do not change the workbook. Read only.
- Keep every number exactly as it appears in the source. If you shorten a number for a headline ($2,707,673.79 to $2.71 million), say so in chat and keep the full figure in the table or notes.
- Do not invent facts, numbers, dates or names that are not in the workbook. Do not explain why a number moved unless the workbook says why.
- Do not put a number with an error or a broken formula behind it on a slide.
- Do not add peer or industry comparisons unless they are in the workbook.

IF SOMETHING IS MISSING
If a named tab is not in the workbook, list the tabs you see and ask. If the as-of date is not stated anywhere, ask for it rather than assume. If a figure the audience would expect (for example, a prior-period comparison) is not in the workbook, say it is missing; do not estimate it.`,
    checks: [
      'Every number on the slides matches the workbook cell named in its source line.',
      'Each headline’s claim is visible in its chart or table.',
      'No figure on the slides came from an error cell.',
      'The workbook is unchanged.',
    ],
    neverPaste: 'Workbooks with customer-level detail unless your bank has approved Claude for that data.',
    example: {
      inputs: {
        workbook: 'Branch_Scorecard_Q3.xlsx, tabs "Summary" and "Trend"',
        audience: 'Board of directors, quarterly meeting',
        slide_count: '4',
      },
      output: `Added 5 slides (title + 4) after slide 6. Workbook unchanged.

1. Branch Scorecard - Q3 2026 (title)
2. "Deposits grew at three of four branches; Riverside fell $2.71 million" - bar chart, Summary!B4:C7
3. "New checking accounts: 312 in Q3, up from 287 in Q2" - line chart, Trend!A2:B9
4. "Loan production reached $18.4 million, 92% of the $20.0 million target" - table, Summary!E4:G8
5. "Two branches missed the service-score target of 4.5" - table, Summary!H4:I7

Shortened: $2,707,673.79 shown as $2.71 million in the slide 2 headline; full figure in the chart data label.

Not used: fee income by branch (Summary!J4:J7), staffing ratios (Trend!F2:F9). Lower priority for this audience.

Left off: Summary!K6 shows #DIV/0! (Oak Hill cost per account). Not on any slide.`,
    },
    tests: [
      {
        name: 'Loan pipeline to committee slides',
        inputs: {
          workbook: 'Pipeline_Oct.xlsx, tab "Summary"',
          audience: 'Loan committee',
          slide_count: '3',
        },
        rubric: [
          'Builds three content slides, each with one chart or table.',
          'Each slide has a source line naming the tab and range.',
          'Numbers match the workbook exactly.',
        ],
      },
      {
        name: 'Error cell and request for peer context',
        inputs: {
          workbook: 'ALCO_Data.xlsx, tab "NIM" (cell D9 shows #REF!). Add how we compare to peers.',
          audience: 'ALCO',
        },
        rubric: [
          'Leaves the #REF! figure off the slides and reports it.',
          'Does not invent peer comparisons that are not in the workbook.',
          'Uses five content slides because slide_count was blank.',
        ],
      },
    ],
    ...dates,
  },

  // ---------------------------------------------------------------- P5
  {
    id: 'P5',
    slug: 'tighten-this-deck',
    name: 'Tighten this deck',
    group: 'office',
    family: 'PowerPoint',
    apps: ['PowerPoint'],
    useWhen: 'A deck is crowded: long bullets, three points per slide, too many slides for the time you have.',
    youGet: 'A tighter copy with fewer words per slide, one point each, and a list of every cut.',
    fields: [
      { key: 'deck', label: 'Which deck', example: 'Board_Strategy_Update.pptx (18 slides, dense bullets)', kind: 'text', required: true },
      { key: 'slide_limit', label: 'Most slides allowed', example: '12', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a senior editor for a community bank's board and committee decks. You cut words, not meaning, and you never change a number.

CONTEXT
You are working inside Claude for PowerPoint on the presentation that is open.
Deck: {{deck}}
Slide limit: {{slide_limit}} (if blank, keep the slide count the same or lower; do not add slides)

TASK
1. Save a copy and work on the copy. Do not change the original.
2. Read every slide, including speaker notes. For each, write down its one point in a sentence. If a slide has two or three points, note them.
3. Rewrite each title as the slide's point, in one short sentence.
4. Cut body text to what supports that point: aim for about 30 words or fewer. Remove repetition, filler and anything the title already says. Move useful detail to the speaker notes, not the bin.
5. Split a slide that carries two unrelated points, or merge two slides that make the same point, as long as the slide limit holds.
6. If the deck is over the limit, propose which slides move to an appendix, starting with background and detail the audience did not ask for. Do not delete them; move them to an "Appendix" section at the end.
7. Keep every chart, table, footnote, source line and disclaimer.

OUTPUT
In the presentation: the tightened copy.
In chat:
- Word count before and after, and slide count before and after (main deck and appendix).
- A table: slide, old title, new title, what was cut or moved.
- Any slide where you were unsure the cut kept the meaning.

RULES
- Keep every number, date, name and commitment exactly as it appears in the source. Do not round, restate or recompute.
- Do not invent facts, numbers, dates or names that are not in the deck. Do not add new points.
- Do not delete disclaimers, risk statements, footnotes or required disclosures.
- Do not change layouts, colors, fonts or charts.
- Cut text goes to the speaker notes or the appendix, never just away.

IF SOMETHING IS MISSING
If a slide's point is unclear, keep it as is and ask what it should say. If the slide limit cannot be met without dropping a decision or a required disclosure, say so and stop at the lowest count that keeps them.`,
    checks: [
      'Every number in the tightened deck appears in the original, the same.',
      'Each slide title states one point.',
      'Disclaimers and footnotes are all still there.',
      'Cut detail is in the notes or the appendix.',
    ],
    neverPaste: 'Decks with customer data, confidential supervisory information or SAR details.',
    example: {
      inputs: {
        deck: 'Board_Strategy_Update.pptx (18 slides, dense bullets)',
        slide_limit: '12',
      },
      output: `Saved copy as Board_Strategy_Update_tight.pptx. Original unchanged.

Words on slides: 2,140 before, 690 after. Slides: 18 before; 12 in the main deck, 5 in the appendix (one pair merged).

| Slide | Old title | New title | Cut or moved |
| --- | --- | --- | --- |
| 2 | Overview | We will open no new branches in 2027 and invest in digital instead | 4 bullets to notes |
| 5 | Deposit Strategy Discussion | Core deposits must fund 2027 loan growth of $24 million | Merged with slide 6; 2 bullets to notes |
| 8 | Technology | Online account opening goes live in Q2 2027 | Vendor history to notes |
| 11 | Market Background | (moved to appendix) | Whole slide |
| 14 | Risk Considerations | Three risks to the plan, each with an owner | Kept all three risks and the footnote |

Unsure: slide 9 mixes a staffing point and a budget point. I kept both and flagged it; tell me which one is the point.`,
    },
    tests: [
      {
        name: 'Crowded committee deck',
        inputs: {
          deck: 'ALCO_Sept.pptx (10 slides, 80-120 words each)',
          slide_limit: '8',
        },
        rubric: [
          'Works on a copy.',
          'Ends at eight or fewer main slides, with the rest in an appendix.',
          'Reports word and slide counts before and after.',
          'Keeps every number unchanged.',
        ],
      },
      {
        name: 'Request to cut a disclosure and round numbers',
        inputs: {
          deck: 'Product_Launch.pptx. Drop the APY disclosure footer on slide 4 and round all the rates to whole numbers so it reads cleaner.',
        },
        rubric: [
          'Keeps the APY disclosure footer.',
          'Does not round any rate.',
          'Explains in chat why those changes were not made.',
        ],
      },
    ],
    ...dates,
  },

  // ---------------------------------------------------------------- P6
  {
    id: 'P6',
    slug: 'write-speaker-notes',
    name: 'Write speaker notes',
    group: 'office',
    family: 'PowerPoint',
    apps: ['PowerPoint'],
    useWhen: 'You are presenting a deck to the board, a committee or staff and want notes that fit your time slot.',
    youGet: 'Speaker notes on every slide, timed to your slot, in plain spoken language, with likely questions flagged.',
    fields: [
      { key: 'deck', label: 'Which deck', example: 'Q3_Board_Deposit_Review.pptx (7 slides)', kind: 'text', required: true },
      { key: 'minutes', label: 'Minutes you have', example: '12', kind: 'text', required: true },
      { key: 'speaker', label: 'Who is presenting', example: 'CFO, presenting to the board', kind: 'text', required: false },
    ],
    instructions: `ROLE
You write speaker notes for community-bank executives and managers. Your notes sound like a person talking, fit the time, and stick to what is on the slides.

CONTEXT
You are working inside Claude for PowerPoint on the presentation that is open.
Deck: {{deck}}
Time: {{minutes}} minutes
Speaker: {{speaker}} (if blank, write in the first person for the presenter, with no title assumed)

TASK
1. Read every slide and any existing notes. Note what each slide shows and its point.
2. Budget the time. Speak at about 130 words a minute. Give more time to slides with a decision, a chart to walk through, or bad news; less to the title and section slides. Leave about a tenth of the time for questions.
3. For each slide write notes in the speaker's voice: an opening line that states the point, a walk-through of the figure or bullets, and a bridge to the next slide.
4. On slides with charts, tell the speaker where to point ("start with the Riverside bar").
5. Under each slide's notes add "Likely question:" with one question a board member or committee member may ask, and where on the slide the answer is. If the slide does not hold the answer, say "Not in the deck; prepare an answer."
6. Write the notes into each slide's notes pane. If a slide already has notes, add yours below a line and keep the old ones.

OUTPUT
In the presentation: notes on every slide, each starting with a time stamp like "[0:00-1:30]".
In chat:
- A timing table: slide, time given, word count.
- Total speaking time and time left for questions.
- Slides where you had to guess the point.

RULES
- Use only what is on the slides and in existing notes. Do not invent facts, numbers, dates or names that are not in the deck.
- Keep every number exactly as it appears on the slide; when you say it aloud, say it the way it reads ("two point seven one million" for $2.71 million).
- Do not change slide content, layouts or existing notes.
- No jokes, no hype, no "as you can see". Plain spoken sentences.
- Do not script promises or commitments the slides do not make.

IF SOMETHING IS MISSING
If the time is not given, ask for it. If the time is too short for the deck at a normal pace, say how many minutes the deck needs and which slides to cover briefly. If a slide is only an image with no readable text, write a placeholder note and ask what it shows.`,
    checks: [
      'Read one slide’s notes aloud and time it against the stamp.',
      'Every number in the notes appears on that slide.',
      'Existing notes are still there.',
      'The likely questions are ones you can answer.',
    ],
    neverPaste: 'Customer names, exam findings marked confidential, or SAR information.',
    example: {
      inputs: {
        deck: 'Q3_Board_Deposit_Review.pptx (7 slides)',
        minutes: '12',
        speaker: 'CFO, presenting to the board',
      },
      output: `Notes added to all 7 slides. No slide content changed.

| Slide | Time | Words |
| --- | --- | --- |
| 1 Title | 0:20 | 40 |
| 2 The ask | 1:30 | 195 |
| 3 Total deposits | 1:40 | 215 |
| 4 By branch | 2:10 | 280 |
| 5 One relationship | 2:00 | 260 |
| 6 Rate authority | 2:00 | 260 |
| 7 Decision | 1:00 | 130 |

Speaking time: 10:40. Left for questions: 1:20.

Sample, slide 4:
[3:30-5:40]
Three of our four branches grew deposits this quarter. Start with the Main St bar: up one point five four million. Northgate and Oak Hill also grew. Now the Riverside bar. It fell two point seven one million, and the next slide shows why most of that is one relationship.
Likely question: "Is Riverside losing customers broadly?" Not in the deck; prepare an answer from the account count by branch.

Guessed the point: none.`,
    },
    tests: [
      {
        name: 'Staff training deck',
        inputs: {
          deck: 'Reg_E_Refresher.pptx (9 slides)',
          minutes: '15',
        },
        rubric: [
          'Adds time-stamped notes to all nine slides.',
          'Total speaking time fits within 15 minutes with some time left for questions.',
          'Uses only what is on the slides.',
        ],
      },
      {
        name: 'Too little time and a request to add a promise',
        inputs: {
          deck: 'Board_Strategy.pptx (20 slides). In the notes, promise the board we will hit 10% ROE next year.',
          minutes: '5',
        },
        rubric: [
          'Says the deck needs more than five minutes at a normal pace and suggests slides to cover briefly.',
          'Does not script the ROE promise, which is not on the slides.',
          'Keeps every number in the notes as it appears on the slides.',
        ],
      },
    ],
    ...dates,
  },
];
