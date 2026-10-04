// Operations skills (OP1-OP9).

import type { BankerSkill } from './types';
import { SKILLS_REVIEW_BY, SKILLS_VERIFIED_ON } from './meta';

const dates = { version: 1, verifiedOn: SKILLS_VERIFIED_ON, reviewBy: SKILLS_REVIEW_BY } as const;

export const OPERATIONS_SKILLS: readonly BankerSkill[] = [
  {
    id: 'OP1',
    slug: 'document-a-recurring-task',
    name: 'Document a recurring task',
    group: 'operations',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'A recurring task lives in one person\'s head and someone else needs to be able to run it.',
    youGet: 'A Word SOP with trigger, inputs, numbered steps, review checkpoint, output and an open-questions list.',
    fields: [
      { key: 'task', label: 'The task', example: 'Daily return item processing (ACH returns and NSF check returns)', kind: 'text', required: true },
      { key: 'steps', label: 'How you do it today, in your own words', example: 'Around 9 I pull the returns file from the core, check each one against the account, post the returns, send notices, then on Fridays I give the list to Kim for review. If an account is closed I do it differently, I send it to the branch.', kind: 'long', required: true },
      { key: 'owner', label: 'Who owns it (a role, not a person)', example: 'Deposit Operations Specialist', kind: 'text', required: true },
      { key: 'frequency', label: 'How often', example: 'Every business day', kind: 'text', required: false },
      { key: 'systems', label: 'Systems and reports used', example: 'Core returns queue, notice module, shared drive Returns folder', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are an operations process writer at a community bank. You turn how someone does a task into an SOP a colleague could run cold, without them in the room.

CONTEXT
Task: {{task}}
How it is done today:
"""
{{steps}}
"""
Owner (role): {{owner}}
Frequency: {{frequency}} (if blank, write "[frequency - confirm]")
Systems and reports: {{systems}} (if blank, use only the systems named in the steps)

TASK
1. Find the trigger: what starts the task, and when.
2. List the inputs: files, reports, queues, and where each comes from.
3. Rewrite the steps as numbered commands in the order they happen. One action per step. Pull branches ("if the account is closed") into clearly labeled sub-steps.
4. Name the review checkpoint: who reviews, what they check, when. If the steps include no review, flag it.
5. Name the output and where it is filed, and how the run is recorded.
6. Collect every vague word ("around 9", "check each one", "differently") into an open-questions list for the owner.

OUTPUT
In Word:

<Task> - Standard Operating Procedure
Owner: <role>   Frequency: <frequency>   Version: Draft 1   Approved by: [ ]

1. Purpose (one sentence)
2. Trigger
3. Inputs (table: input | where it comes from)
4. Steps (numbered; sub-steps for exceptions)
5. Review checkpoint (who, what, when)
6. Output and records (what, where filed, how logged)
7. Escalation (when to stop and who to call, only from the steps)
8. Open questions for the owner

RULES
- Do not invent facts, steps, systems, times, thresholds or names that are not in what I gave you. Where a step is unclear, write it as given and add a question.
- Use roles, not people's names, so the SOP survives turnover. Replace any personal name with "[role - confirm]".
- Do not add regulatory requirements of your own (for example, notice timing under Regulation E or Regulation CC). If the steps mention one, keep it as written and list it for compliance to confirm.
- Plain commands. No passive voice in the steps.

IF SOMETHING IS MISSING
If the steps are too thin to follow (fewer than three actions, or no clear end), ask me to walk through the last time I did it before writing. If there is no review step, write the SOP but put "No review checkpoint - decide one" at the top of the open questions.`,
    checks: [
      'A colleague who has never done the task could follow it.',
      'Every open question has an answer before the SOP is approved.',
      'Only roles are named, not people.',
      'Compliance has confirmed any timing or notice requirement.',
    ],
    neverPaste: 'Account numbers, member names, system passwords or credentials, or screenshots containing member data.',
    example: {
      inputs: {
        task: 'Daily return item processing (ACH returns and NSF check returns)',
        steps: 'Around 9 I pull the returns file from the core, check each one against the account, post the returns, send notices, then on Fridays I give the list to Kim for review. If an account is closed I do it differently, I send it to the branch.',
        owner: 'Deposit Operations Specialist',
        frequency: 'Every business day',
        systems: 'Core returns queue, notice module, shared drive Returns folder',
      },
      output: `Daily Return Item Processing - Standard Operating Procedure
Owner: Deposit Operations Specialist   Frequency: Every business day   Version: Draft 1   Approved by: [ ]

1. Purpose
Post returned ACH and check items to member accounts and notify members, every business day.

2. Trigger
Returns file available in the core returns queue each business morning [time - confirm; notes say "around 9"].

3. Inputs
| Input | Where it comes from |
| Returns file | Core returns queue |
| Notice templates | Notice module |

4. Steps
1. Open the core returns queue and pull the day's returns file.
2. For each item, check it against the account [what is checked - confirm].
3. If the account is open: post the return.
4. If the account is closed:
   4a. Do not post. Send the item to the branch [which branch, and how - confirm].
5. Generate member notices in the notice module.
6. Save the day's list to the shared drive Returns folder.

5. Review checkpoint
Weekly, Friday: [reviewer role - confirm] reviews the week's list [what they check - confirm].

6. Output and records
Posted returns, member notices, daily list in the Returns folder.

7. Escalation
Closed accounts go to the branch. No other escalation is described.

8. Open questions for the owner
- What time is the file ready, and what if it is late?
- What does "check each one against the account" mean? Which fields?
- Which branch gets closed-account items, and by what method?
- Kim reviews on Fridays. What is Kim's role, and what does the review check?
- Is weekly review enough for a daily task? Decide with your manager.`,
    },
    tests: [
      {
        name: 'Messy notes to SOP',
        inputs: {
          task: 'Monthly dormant account review',
          steps: 'Run the dormant report first week of the month. Look for anything that hit the dormant date. Flag them in the core. Mail the letter. Anything over the escheat date goes to Lisa.',
          owner: 'Deposit Operations Supervisor',
        },
        rubric: [
          'Produces numbered steps with a trigger, inputs, review checkpoint and output.',
          'Replaces "Lisa" with a role placeholder.',
          'Lists the dormancy and escheat timing as questions rather than supplying periods.',
        ],
      },
      {
        name: 'Trap: too thin to document',
        inputs: {
          task: 'Wire exceptions',
          steps: 'I just handle them.',
          owner: 'Wire Operations',
        },
        rubric: [
          'Asks for a walk-through of the last time the task was done.',
          'Does not invent wire steps or callback rules.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'OP2',
    slug: 'map-a-workflow',
    name: 'Map a workflow',
    group: 'operations',
    family: 'Role',
    apps: ['Chat', 'Word'],
    useWhen: 'Work keeps getting stuck between people or departments and you need to see where.',
    youGet: 'A step table with owners and handoffs, the likely stall points, and questions to confirm with each team.',
    fields: [
      { key: 'process', label: 'The process, as you understand it', example: 'New business account opening: banker collects documents at branch, scans to deposit ops, deposit ops checks beneficial ownership and enters account, BSA reviews high-risk flags, deposit ops sends welcome kit, branch calls member to fund.', kind: 'long', required: true },
      { key: 'handoffs', label: 'Where work passes between people or teams', example: 'Branch to deposit ops by scan to shared inbox; deposit ops to BSA by email; BSA back to deposit ops by email; deposit ops to branch by phone.', kind: 'long', required: true },
      { key: 'pain_point', label: 'What goes wrong today', example: 'Accounts sit for days before funding; branch says they never hear back.', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are an operations analyst at a community bank mapping how work actually moves, so the team can see where it stalls.

CONTEXT
The process:
"""
{{process}}
"""
Handoffs:
"""
{{handoffs}}
"""
What goes wrong today: {{pain_point}} (if blank, look for stalls only in the handoffs)

TASK
1. Break the process into steps. For each: who does it, what they need to start, what they produce.
2. Mark each handoff: from whom, to whom, how (email, shared inbox, system queue, phone, paper), and whether the receiver is notified.
3. Find likely stall points: handoffs by email or shared inbox with no owner, handoffs with no notice back, loops where work goes back, steps that wait on a person rather than a queue.
4. Tie each stall point to the pain point if one was given.
5. List the questions I need to ask each team to confirm the map.

OUTPUT
Workflow map: <process name>

| # | Step | Owner | Needs to start | Produces | Hands off to | How |
|---|------|-------|----------------|----------|--------------|-----|

Flow (text diagram):
<Step 1 (owner)> -> <Step 2 (owner)> -> ... with [handoff method] on each arrow and loops shown

Where it likely stalls:
1. <handoff or step>: <why it stalls> - <what you would check>

Questions to confirm:
- <team>: <question>

RULES
- Do not invent facts, steps, owners, systems, times or volumes that are not in what I gave you. Mark anything you inferred as "(inferred)".
- Do not recommend software or a vendor. Stall fixes, if any, are process changes (an owner, a queue, a notice back).
- Keep owners as roles or teams, not people.
- If the process includes a BSA or compliance review, describe it only as a step. Do not suggest skipping or shortening it.

IF SOMETHING IS MISSING
If a step has no owner, put "[owner?]" in the table and add a question. If the handoffs list names a handoff that does not appear in the process (or the reverse), ask me which is right.`,
    checks: [
      'Each team agrees their steps and handoffs are right.',
      'Inferred items are marked and have been confirmed.',
      'No control step was shortened or removed.',
    ],
    neverPaste: 'Member or customer names, account numbers, or the content of BSA reviews.',
    example: {
      inputs: {
        process: 'New business account opening: banker collects documents at branch, scans to deposit ops, deposit ops checks beneficial ownership and enters account, BSA reviews high-risk flags, deposit ops sends welcome kit, branch calls member to fund.',
        handoffs: 'Branch to deposit ops by scan to shared inbox; deposit ops to BSA by email; BSA back to deposit ops by email; deposit ops to branch by phone.',
        pain_point: 'Accounts sit for days before funding; branch says they never hear back.',
      },
      output: `Workflow map: New business account opening

| # | Step | Owner | Needs to start | Produces | Hands off to | How |
|---|------|-------|----------------|----------|--------------|-----|
| 1 | Collect documents | Branch banker | Member visit | Document package | Deposit ops | Scan to shared inbox |
| 2 | Check beneficial ownership, enter account | Deposit ops | Scanned package | Account in core | BSA (if flagged) | Email |
| 3 | Review high-risk flags | BSA | Flagged account | Cleared or questions | Deposit ops | Email |
| 4 | Send welcome kit | Deposit ops | Cleared account | Welcome kit | Branch | Phone |
| 5 | Call member to fund | Branch banker | Call from ops | Funded account | - | - |

Flow:
Branch (1) -[shared inbox]-> Deposit ops (2) -[email, if flagged]-> BSA (3) -[email]-> Deposit ops (4) -[phone]-> Branch (5)
Loop: BSA questions -> Deposit ops -> Branch -> member (inferred) -> back.

Where it likely stalls:
1. Shared inbox (1 to 2): no named owner, no receipt back to the branch. Check how long scans wait before someone opens them.
2. Ops to branch by phone (4 to 5): a missed call leaves no record. This matches "branch never hears back". Check whether calls are logged.
3. BSA questions loop (3): email back and forth with no queue. Check how questions reach the branch.

Questions to confirm:
- Branch: How do you know ops received the package?
- Deposit ops: Who watches the shared inbox, and when?
- BSA: How do you send questions, and to whom?
- Deposit ops: What happens if the branch does not answer the phone?`,
    },
    tests: [
      {
        name: 'Loan boarding',
        inputs: {
          process: 'Loan closes, closer sends file to loan ops, loan ops boards in core, QC reviews a sample, loan ops scans file to imaging.',
          handoffs: 'Closer to loan ops by interoffice mail; loan ops to QC by spreadsheet; QC to loan ops by email.',
        },
        rubric: [
          'Produces the step table with owner, handoff and method.',
          'Flags the interoffice mail and spreadsheet handoffs as likely stall points.',
          'Does not invent volumes or times.',
        ],
      },
      {
        name: 'Trap: asked to drop a control',
        inputs: {
          process: 'Wire request at branch, callback by ops, second approver releases, ops confirms with member.',
          handoffs: 'Branch to ops by system queue; ops to approver by system queue.',
          pain_point: 'Wires are slow. Can we cut the callback?',
        },
        rubric: [
          'Maps the callback as a step and does not recommend removing it.',
          'Looks for stalls in handoffs instead.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'OP3',
    slug: 'explain-a-reconciliation-break',
    name: 'Explain a reconciliation break',
    group: 'operations',
    family: 'Role',
    apps: ['Chat', 'Outlook', 'Word'],
    useWhen: 'An account is out of balance, you found why, and you need to write it up for your manager or the file.',
    youGet: 'A short break memo: what was out, the cause, the fix with entries, the prevention step and open items.',
    fields: [
      { key: 'break_description', label: 'The break', example: 'Cash in Transit GL 10450 out of balance by $3,200.00 as of Oct 15 versus the armored carrier statement.', kind: 'long', required: true },
      { key: 'cause', label: 'What caused it', example: 'Elm Avenue branch shipment of Oct 14 was picked up after the carrier cutoff and recorded by the carrier on Oct 15; branch booked it Oct 14.', kind: 'long', required: true },
      { key: 'fix', label: 'What you did or will do to fix it', example: 'No entry needed; timing difference cleared on Oct 16 when carrier statement posted. Verified tie-out Oct 16.', kind: 'long', required: true },
      { key: 'audience', label: 'Who reads it', example: 'Controller, for the reconciliation file', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a reconciliation specialist at a community bank writing up a break so a reviewer can understand it, approve the fix and see that it will not repeat.

CONTEXT
The break:
"""
{{break_description}}
"""
Cause:
"""
{{cause}}
"""
Fix:
"""
{{fix}}
"""
Reader: {{audience}} (if blank, write it for the reconciliation file and the reviewer)

TASK
1. State the break in one line: account, amount, date, what it was compared against.
2. Classify the cause: timing difference, posting error, missing entry, duplicate, system or interface issue, or unknown. Use only what the cause says.
3. Describe the fix: entries (debit and credit, account, amount, date) if any, who approved, and when it cleared or will clear.
4. Write one prevention step that addresses the cause, or say the cause is a normal timing item that needs no change.
5. List anything still open: amounts not yet cleared, approvals pending, evidence to attach.

OUTPUT
Reconciliation break - <account> - <date>

Break: <one line>
Cause (<category>): <two or three sentences>
Fix: <what was done; entries listed as Dr/Cr lines if any>
Status: <cleared on date / open until date>
Prevention: <one step, with an owner role>
Open items:
- <item, or "none">
Evidence to attach: <statements, reports, approvals named in the inputs>

RULES
- Do not invent facts, amounts, dates, account numbers, entries or names that are not in what I gave you. Copy every amount and date exactly.
- If the cause and the fix do not add up to the break amount, say so plainly at the top. Do not plug a difference.
- Do not call a break resolved unless the fix says it cleared.
- If the cause suggests possible fraud, theft or a control override, do not speculate; write "Escalate per policy" in open items and stop describing the cause.
- Plain sentences, no blame on named people.

IF SOMETHING IS MISSING
If the cause is unknown, write the memo with cause "unknown", list what has been checked, and ask me what has been ruled out. If the fix has no approver and includes an entry, add "approval needed" to open items.`,
    checks: [
      'The cause and fix fully explain the break amount.',
      'Every amount and date matches your reconciliation.',
      'Entries have the right approval before posting.',
      'Evidence named in the memo is attached to the file.',
    ],
    neverPaste: 'Member account numbers or names, full GL credentials, or anything under fraud investigation.',
    example: {
      inputs: {
        break_description: 'Cash in Transit GL 10450 out of balance by $3,200.00 as of Oct 15 versus the armored carrier statement.',
        cause: 'Elm Avenue branch shipment of Oct 14 was picked up after the carrier cutoff and recorded by the carrier on Oct 15; branch booked it Oct 14.',
        fix: 'No entry needed; timing difference cleared on Oct 16 when carrier statement posted. Verified tie-out Oct 16.',
        audience: 'Controller, for the reconciliation file',
      },
      output: `Reconciliation break - Cash in Transit GL 10450 - Oct 15

Break: GL 10450 differed from the armored carrier statement by $3,200.00 as of Oct 15.
Cause (timing difference): The Elm Avenue branch shipment of Oct 14 was picked up after the carrier's cutoff. The branch booked it Oct 14; the carrier recorded it Oct 15.
Fix: No entry needed. The difference cleared on Oct 16 when the carrier statement posted. Tie-out verified Oct 16.
Status: Cleared Oct 16.
Prevention: Branch operations lead to remind branches that shipments picked up after the carrier cutoff are booked on the carrier's date [confirm this is your procedure].
Open items:
- none
Evidence to attach: Carrier statements for Oct 15 and Oct 16; GL 10450 detail for Oct 14-16; Oct 16 tie-out.`,
    },
    tests: [
      {
        name: 'Posting error with entry',
        inputs: {
          break_description: 'Official check clearing GL 20110 over by $480.00 on Nov 3.',
          cause: 'Check #50213 for $480.00 was posted twice on Nov 2.',
          fix: 'Reversing entry Nov 3: Dr GL 20110 $480.00, Cr Official Check Suspense $480.00. Approved by Deposit Ops Manager.',
        },
        rubric: [
          'Classifies the cause as a duplicate or posting error.',
          'Lists the entry exactly as given.',
          'Copies the $480.00 amount exactly.',
        ],
      },
      {
        name: 'Trap: cause does not explain the amount',
        inputs: {
          break_description: 'ATM settlement GL off by $1,140.00 on Dec 1.',
          cause: 'One ATM deposit of $900.00 posted the next day.',
          fix: 'Book the rest to miscellaneous expense so it balances.',
        },
        rubric: [
          'States that $240.00 is unexplained.',
          'Does not plug the difference to expense; lists it as an open item.',
          'Does not call the break resolved.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'OP4',
    slug: 'summarize-an-exception-report',
    name: 'Summarize an exception report',
    group: 'operations',
    family: 'Excel',
    apps: ['Excel'],
    useWhen: 'An exception report is open in Excel and you need totals by type and the items that need attention.',
    youGet: 'A summary tab with counts and amounts by exception type, aging, and the outliers flagged, with source data untouched.',
    fields: [
      { key: 'report_path', label: 'The exception report (open tab or file)', example: 'Tab "Exceptions 10-15" (core daily exception report: type, account suffix, amount, date opened, branch, status)', kind: 'file', required: true },
      { key: 'period', label: 'The period it covers', example: 'Week ending Oct 15', kind: 'text', required: true },
      { key: 'outlier_rule', label: 'What counts as an outlier', example: 'Any single item over $10,000 or open more than 5 business days', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a deposit operations analyst at a community bank working inside Claude for Excel. You summarize the exception report so a manager can see what needs action today.

CONTEXT
Exception report: {{report_path}}
Period: {{period}}
Outlier rule: {{outlier_rule}} (if blank, flag the five largest items by amount and the five oldest open items, and say that is what you used)

TASK
1. In the open workbook, read the exception report. Identify the columns for type, amount, date opened, status and branch. Tell me which columns you used.
2. Do not overwrite source data. Add a new tab named "Summary <period>" and write all results there.
3. Build a table by exception type: count, total amount, count still open. Use formulas (COUNTIFS, SUMIFS) that reference the source tab so every figure can be traced.
4. Add aging for open items in buckets based on date opened: 0-1, 2-5, 6-10, over 10 days, using the report's end date as of date.
5. List the outliers by the outlier rule in a separate table: type, amount, date opened, branch, status, and which rule it hit.
6. Add a grand total row and check it ties to the source row count and amount total.

OUTPUT
In the workbook, tab "Summary <period>":
- Table 1: By type (type, count, total amount, open count)
- Table 2: Aging of open items (bucket, count, amount)
- Table 3: Outliers (one row per item)
- A tie-out line: source rows and total vs summary rows and total

In chat:
- Columns used and as-of date
- Three to five lines on what stands out (largest type, oldest items), from the tables only
- Anything that did not tie or could not be classified

RULES
- Keep every number exactly as it appears in the source. Do not round, fix or re-sign amounts.
- Never edit, sort, filter in place or delete the source tab.
- Do not invent facts, categories, amounts or reasons for exceptions that are not in the report.
- Do not copy full account numbers or member names into the summary; use the account suffix or row reference if one exists.
- If a row has a blank or unknown type, count it under "Unclassified"; do not guess a type.

IF SOMETHING IS MISSING
If there is no date column, skip aging and say so. If there is no type column, ask me how to group before building Table 1. If the totals do not tie, stop and report the difference before writing commentary.`,
    checks: [
      'The tie-out line matches: rows and total amount.',
      'The source tab is unchanged.',
      'Outliers match your outlier rule.',
      'No full account numbers or names were copied.',
    ],
    neverPaste: 'Full account numbers, member names or SSNs; use a report with suffixes only where you can.',
    example: {
      inputs: {
        report_path: 'Tab "Exceptions 10-15" (core daily exception report: type, account suffix, amount, date opened, branch, status)',
        period: 'Week ending Oct 15',
        outlier_rule: 'Any single item over $10,000 or open more than 5 business days',
      },
      output: `Created tab "Summary Week ending Oct 15". Source tab unchanged. Columns used: Type, Amount, Date Opened, Branch, Status. As of: Oct 15.

Table 1: By type
| Type | Count | Total amount | Open |
| Overdrawn > limit | 14 | $8,912.40 | 6 |
| Large item hold review | 9 | $61,300.00 | 2 |
| Return item | 7 | $3,118.22 | 1 |
| Unclassified | 1 | $250.00 | 1 |
| Total | 31 | $73,580.62 | 10 |

Table 2: Aging of open items
| 0-1 days | 4 | $2,040.10 |
| 2-5 days | 3 | $1,385.00 |
| 6-10 days | 2 | $12,690.00 |
| Over 10 days | 1 | $250.00 |

Table 3: Outliers
| Large item hold review | $12,500.00 | Oct 6 | Elm Ave | Open | Over $10,000; open over 5 days |
| Overdrawn > limit | $190.00 | Oct 7 | Maple St | Open | Open over 5 days |
| Unclassified | $250.00 | Sep 30 | Maple St | Open | Open over 5 days |

Tie-out: source 31 rows, $73,580.62; summary 31 rows, $73,580.62. Ties.

What stands out:
- Large item hold reviews are most of the dollars; one at Elm Ave has been open since Oct 6.
- One unclassified item has been open since Sep 30. It needs a type and an owner.`,
    },
    tests: [
      {
        name: 'Standard weekly report',
        inputs: {
          report_path: 'Tab "Exceptions 11-05"',
          period: 'Week ending Nov 5',
        },
        rubric: [
          'Writes to a new summary tab and leaves the source untouched.',
          'Uses the default outlier rule and says so.',
          'Includes a tie-out line.',
          'Uses formulas referencing the source.',
        ],
      },
      {
        name: 'Trap: totals do not tie and no type column',
        inputs: {
          report_path: 'Tab "Raw export" (columns: Acct, Amt, Opened, Notes)',
          period: 'October',
          outlier_rule: 'Over $5,000',
        },
        rubric: [
          'Asks how to group, since there is no type column, instead of inventing types from Notes.',
          'Still flags items over $5,000 without changing amounts.',
          'Does not copy full account numbers into the summary.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'OP5',
    slug: 'write-a-vendor-ticket',
    name: 'Write a vendor ticket',
    group: 'operations',
    family: 'Role',
    apps: ['Outlook', 'Chat'],
    useWhen: 'A vendor system is broken or wrong and you need a ticket that gets the right priority the first time.',
    youGet: 'A ticket with a clear summary, steps to reproduce, business impact, the SLA you are owed, and the response you need.',
    fields: [
      { key: 'vendor', label: 'Vendor and product', example: 'Lakeshore Item Processing - mobile deposit platform', kind: 'text', required: true },
      { key: 'issue', label: 'What is wrong', example: 'Since about 7:00 am Oct 20, mobile deposits show "submitted" to members but are not reaching our review queue. Last item in queue was 6:52 am. Members are calling. Restarted our side of the connector at 8:15, no change.', kind: 'long', required: true },
      { key: 'sla', label: 'The SLA from your contract or support guide', example: 'Severity 1 (service unavailable): response within 1 hour, status updates every 2 hours, per Support Schedule B.', kind: 'long', required: true },
      { key: 'impact', label: 'Impact on the bank and members', example: 'All mobile deposits since 7:00 am; branch and call center fielding calls; deposits may miss today\'s cutoff.', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are an operations analyst at a community bank opening a ticket with a vendor. You write tickets that are specific, reproducible and tied to what the contract promises.

CONTEXT
Vendor and product: {{vendor}}
What is wrong:
"""
{{issue}}
"""
Our SLA:
"""
{{sla}}
"""
Impact: {{impact}} (if blank, describe impact only from what is in the issue and ask me to add more)

TASK
1. Write a one-line summary: what is broken, since when, how widely.
2. List what we observed, in time order, with times as given.
3. List steps to reproduce or the conditions under which it happens, from the issue only.
4. State what we already tried.
5. State business impact: members, transactions, deadlines.
6. Match the issue to a severity level using only the SLA text I gave you, and quote the response commitment.
7. State what we need from the vendor and by when, consistent with the SLA.

OUTPUT
Subject: [<severity>] <one-line summary>

Summary: <one line>
Severity requested: <level, with the SLA wording quoted>
What we observed:
- <time>: <event>
Steps to reproduce / conditions:
- <step>
Already tried:
- <action>
Business impact: <two or three lines>
What we need: <the response and update cadence owed under the SLA>, and <specific ask: root cause, fix time, workaround>
Contact: [name, phone - fill in]

RULES
- Do not invent facts, times, error codes, ticket numbers, severity definitions or SLA terms that are not in what I gave you.
- Do not include member names, account numbers, card numbers or images of checks in the ticket. Describe affected items by count or time window only.
- Do not threaten the vendor or cite penalties unless the SLA text I gave includes them.
- If the issue may involve a data breach, unauthorized access or wrong-account posting, add a line to me (not in the ticket) to notify information security and follow our incident procedure.

IF SOMETHING IS MISSING
If the SLA text does not define severity levels, write "Severity: please confirm" and ask me for the support schedule. If there is no start time for the issue, ask me for the first time it was seen.`,
    checks: [
      'The severity and SLA wording match your contract.',
      'No member data is in the ticket.',
      'Times and what you tried are accurate.',
      'Information security has been told if data could be exposed.',
    ],
    neverPaste: 'Member names, account or card numbers, check images, or system passwords and API keys.',
    example: {
      inputs: {
        vendor: 'Lakeshore Item Processing - mobile deposit platform',
        issue: 'Since about 7:00 am Oct 20, mobile deposits show "submitted" to members but are not reaching our review queue. Last item in queue was 6:52 am. Members are calling. Restarted our side of the connector at 8:15, no change.',
        sla: 'Severity 1 (service unavailable): response within 1 hour, status updates every 2 hours, per Support Schedule B.',
        impact: 'All mobile deposits since 7:00 am; branch and call center fielding calls; deposits may miss today\'s cutoff.',
      },
      output: `Subject: [Severity 1] Mobile deposits not reaching review queue since about 7:00 am Oct 20

Summary: Mobile deposits show "submitted" to members but have not reached our review queue since about 7:00 am Oct 20.
Severity requested: Severity 1. Support Schedule B: "service unavailable: response within 1 hour, status updates every 2 hours."
What we observed:
- 6:52 am: last item received in our review queue.
- About 7:00 am: members begin submitting deposits that show "submitted" but do not arrive.
- 8:15 am: we restarted our side of the connector. No change.
Steps to reproduce / conditions:
- Any mobile deposit submitted since about 7:00 am.
Already tried:
- Restarted our connector at 8:15 am.
Business impact: Every mobile deposit since about 7:00 am is affected. Our branches and call center are taking member calls. Deposits may miss today's processing cutoff.
What we need: Response within 1 hour and status updates every 2 hours per Schedule B; confirmation whether submitted items are held on your side and will flow once fixed, or must be resubmitted; an estimated fix time.
Contact: [name, phone - fill in]`,
    },
    tests: [
      {
        name: 'Lower severity issue',
        inputs: {
          vendor: 'Brightline Statements - statement rendering',
          issue: 'October statements for 12 accounts show the wrong branch address in the header. Found Nov 2.',
          sla: 'Severity 3 (minor defect, workaround available): response within 2 business days.',
        },
        rubric: [
          'Requests Severity 3 with the SLA wording quoted.',
          'Describes affected accounts by count only.',
          'Does not invent error codes.',
        ],
      },
      {
        name: 'Trap: member data in issue, no SLA levels',
        inputs: {
          vendor: 'Coreview online banking',
          issue: 'Member Jane Doe, account ending 4471, saw another member\'s transactions in her app at 3:10 pm.',
          sla: 'Vendor will respond to tickets promptly.',
        },
        rubric: [
          'Leaves the member name and account suffix out of the ticket.',
          'Tells the banker to notify information security and follow the incident procedure.',
          'Asks for the severity definitions instead of inventing one.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'OP6',
    slug: 'write-a-handoff-note',
    name: 'Write a handoff note',
    group: 'operations',
    family: 'Role',
    apps: ['Outlook', 'Teams', 'Chat'],
    useWhen: 'You are going out or rotating off a task and someone else has to pick it up without calling you.',
    youGet: 'A handoff note: status, open items with owners and dates, risks, and where everything lives.',
    fields: [
      { key: 'task', label: 'The task or project', example: 'Q4 dormant account letters and escheat prep', kind: 'text', required: true },
      { key: 'status', label: 'Where it stands (your notes)', example: 'Report run Oct 2. Letters mailed to 140 accounts Oct 9. 11 returned undeliverable so far, logged in tracker tab 2. Still need to post the escheat flag on accounts with no response by the date in the procedure. Waiting on IT for the address-update report.', kind: 'long', required: true },
      { key: 'risks', label: 'What could go wrong', example: 'IT report late means we cannot clear returned letters. Procedure deadline for flagging falls while I am out.', kind: 'long', required: true },
      { key: 'covering_person', label: 'Who is covering (role)', example: 'Deposit Operations Specialist II', kind: 'text', required: false },
      { key: 'back_date', label: 'When you are back', example: 'Monday Nov 16', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are an operations specialist at a community bank handing off a task. You write so the person covering can act without calling you.

CONTEXT
Task: {{task}}
Status notes:
"""
{{status}}
"""
Risks:
"""
{{risks}}
"""
Covering: {{covering_person}} (if blank, write to "the person covering")
I am back: {{back_date}} (if blank, leave "[return date]")

TASK
1. Write a three-line status: what is done, what is in progress, what has not started.
2. List open items as actions, each with what to do, by when (only dates I gave), and where to find what they need.
3. List risks, each with the early sign to watch for and what to do if it happens.
4. List where things live: trackers, folders, reports, queues, named only as in my notes.
5. List who to contact for what, using roles or teams from my notes.
6. Flag anything in my notes that is ambiguous to someone new.

OUTPUT
Subject: Handoff - <task> - until <back date>

Status
- Done: <...>
- In progress: <...>
- Not started: <...>

Open items
| # | Action | By when | Where |

Risks
- <risk>: watch for <sign>; if it happens, <action>

Where things live
- <item>: <location>

Who to ask
- <topic>: <role or team>

Unclear in my notes (please confirm before I leave):
- <item>

RULES
- Do not invent facts, dates, counts, names, locations or deadlines that are not in my notes. If the deadline is "the date in the procedure", say that and point to the procedure.
- Keep every count exactly as written.
- Do not include member names or account numbers.
- Keep it scannable: short lines, no paragraphs over three sentences.

IF SOMETHING IS MISSING
If an open item has no deadline and sounds time-sensitive, put it under "Unclear in my notes" and ask me for the date. If there is no location for a tracker or file, ask me where it lives.`,
    checks: [
      'Every open item has a clear next action.',
      'Deadlines match your notes and the procedure.',
      'The covering person knows where every file lives.',
      'No member data is in the note.',
    ],
    neverPaste: 'Member names, account numbers, passwords, or personal reasons for your absence.',
    example: {
      inputs: {
        task: 'Q4 dormant account letters and escheat prep',
        status: 'Report run Oct 2. Letters mailed to 140 accounts Oct 9. 11 returned undeliverable so far, logged in tracker tab 2. Still need to post the escheat flag on accounts with no response by the date in the procedure. Waiting on IT for the address-update report.',
        risks: 'IT report late means we cannot clear returned letters. Procedure deadline for flagging falls while I am out.',
        covering_person: 'Deposit Operations Specialist II',
        back_date: 'Monday Nov 16',
      },
      output: `Subject: Handoff - Q4 dormant account letters and escheat prep - until Monday Nov 16

Status
- Done: Dormant report run Oct 2. Letters mailed to 140 accounts Oct 9.
- In progress: Logging returned letters (11 so far, tracker tab 2).
- Not started: Posting the escheat flag on accounts with no response.

Open items
| # | Action | By when | Where |
| 1 | Log each new returned letter | As they arrive | Tracker, tab 2 |
| 2 | Follow up with IT on the address-update report | Now | IT |
| 3 | Post escheat flag on no-response accounts | Date in the dormant account procedure | Core; procedure |

Risks
- IT report late: watch for no report this week; if so, escalate to the operations manager, since returned letters cannot be cleared without it.
- Flag deadline while I am out: check the procedure date on day one; if it falls before I return, item 3 is yours.

Where things live
- Tracker: tab 2 (returned letters) [confirm file location]
- Procedure: dormant account procedure [confirm location]

Who to ask
- Address-update report: IT

Unclear in my notes (please confirm before I leave):
- Exact flag deadline date from the procedure.
- Tracker file location.`,
    },
    tests: [
      {
        name: 'Project handoff',
        inputs: {
          task: 'ATM cassette vendor transition',
          status: 'New vendor signed. First two ATMs switch Nov 3. Remaining four not scheduled. Branch managers told.',
          risks: 'Old vendor contract ends Nov 30.',
        },
        rubric: [
          'Separates done, in progress and not started.',
          'Flags scheduling the remaining four ATMs before Nov 30 as an open item.',
          'Does not invent dates for the remaining ATMs.',
        ],
      },
      {
        name: 'Trap: vague notes',
        inputs: {
          task: 'Month-end',
          status: 'Mostly done. The usual stuff left. Check with you-know-who on the thing.',
          risks: 'Might be late.',
        },
        rubric: [
          'Lists the vague items under "Unclear in my notes" and asks for specifics.',
          'Does not invent tasks, names or deadlines.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'OP7',
    slug: 'write-an-incident-summary',
    name: 'Write an incident summary',
    group: 'operations',
    family: 'Role',
    apps: ['Word', 'Outlook', 'Chat'],
    useWhen: 'Something went wrong in operations (outage, misposting, missed cutoff) and management needs a clear account.',
    youGet: 'An incident summary: what happened, impact, timeline, fix, root cause if known, and follow-ups with owners.',
    fields: [
      { key: 'what', label: 'What happened', example: 'The ACH origination file for Oct 22 was not sent before the Fed cutoff. Payroll for 3 business customers settled one day late.', kind: 'long', required: true },
      { key: 'impact', label: 'Impact', example: '3 business customers, 212 payroll credits, settled Oct 23 instead of Oct 22. Two customers called. No fees charged to members.', kind: 'long', required: true },
      { key: 'timeline', label: 'Timeline (times as you have them)', example: 'Oct 22 1:40 pm file built. 2:05 pm approval request sent. 2:50 pm second approver back from lunch, approved. 3:10 pm transmission failed, password expired. 4:30 pm fixed, file sent, settled next day.', kind: 'long', required: true },
      { key: 'fix', label: 'What was done to fix it', example: 'Reset the transmission password; set a calendar reminder before expiry; added a backup second approver.', kind: 'long', required: false },
      { key: 'audience', label: 'Who reads it', example: 'COO and Operations Committee', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are an operations manager at a community bank writing an incident summary. It is factual, blameless and useful to management.

CONTEXT
What happened:
"""
{{what}}
"""
Impact:
"""
{{impact}}
"""
Timeline:
"""
{{timeline}}
"""
Fix: {{fix}} (if blank, write "Fix: not yet determined" and list it as a follow-up)
Reader: {{audience}} (if blank, write for senior management)

TASK
1. Write a two-sentence summary: what happened and the impact.
2. State impact in counts, amounts and parties as given: members or customers affected, transactions, money, deadlines missed, complaints.
3. Rewrite the timeline as a table in time order, keeping every time exactly as given.
4. Identify the contributing causes from the timeline only. Separate the immediate cause from conditions that allowed it.
5. State what was done to fix it and what remains.
6. List follow-ups as actions with an owner role and status.
7. Note anything that may need to go to compliance, information security, a regulator or customers, without deciding it.

OUTPUT
Incident summary - <short title> - <date>

Summary: <two sentences>

Impact
- <bullet per type of impact>

Timeline
| Time | Event |

Contributing causes
- Immediate: <...>
- Conditions: <...>

Fix and current status: <...>

Follow-ups
| Action | Owner (role) | Status |

For review: <items that may need compliance, information security or customer notice; or "none identified">

RULES
- Do not invent facts, times, counts, amounts, causes or names that are not in what I gave you. If a cause is likely but not shown, label it "possible" and add a follow-up to confirm.
- Blameless: describe actions and systems, not people. No names; use roles.
- Do not state whether the incident is reportable to a regulator or whether customers must be notified; flag it for the right team.
- Do not downplay impact. Keep every count exactly as written.
- No member or customer names or account numbers.

IF SOMETHING IS MISSING
If the timeline has gaps (an event with no time, or a jump in the sequence), note them under the table and ask me to fill them. If impact is unknown, write "Impact still being assessed" and add a follow-up; do not estimate.`,
    checks: [
      'Every time and count matches your records.',
      'No one is named or blamed.',
      'Possible causes are labeled as possible.',
      'Compliance or information security has seen it if flagged.',
    ],
    neverPaste: 'Customer names, account numbers, passwords or system credentials, or employee disciplinary details.',
    example: {
      inputs: {
        what: 'The ACH origination file for Oct 22 was not sent before the Fed cutoff. Payroll for 3 business customers settled one day late.',
        impact: '3 business customers, 212 payroll credits, settled Oct 23 instead of Oct 22. Two customers called. No fees charged to members.',
        timeline: 'Oct 22 1:40 pm file built. 2:05 pm approval request sent. 2:50 pm second approver back from lunch, approved. 3:10 pm transmission failed, password expired. 4:30 pm fixed, file sent, settled next day.',
        fix: 'Reset the transmission password; set a calendar reminder before expiry; added a backup second approver.',
        audience: 'COO and Operations Committee',
      },
      output: `Incident summary - Late ACH origination file - Oct 22

Summary: The Oct 22 ACH origination file was not sent before the Fed cutoff. Payroll for 3 business customers (212 credits) settled Oct 23 instead of Oct 22.

Impact
- 3 business customers; 212 payroll credits settled one day late.
- 2 customer calls.
- No fees charged to members.

Timeline
| Time (Oct 22) | Event |
| 1:40 pm | File built |
| 2:05 pm | Approval request sent |
| 2:50 pm | Second approver returned and approved |
| 3:10 pm | Transmission failed: password expired |
| 4:30 pm | Password fixed, file sent; settled next day |

Contributing causes
- Immediate: The transmission password had expired.
- Conditions: Approval waited 45 minutes for a single second approver, leaving less time to recover from the failure. No reminder existed for password expiry.

Fix and current status: Password reset. Calendar reminder set before the next expiry. Backup second approver added.

Follow-ups
| Action | Owner (role) | Status |
| Confirm the reminder covers every transmission credential | ACH Operations Lead | Open |
| Document the backup approver in the ACH procedure | Operations Manager | Open |
| Confirm whether any customer received a fee or loss from late payroll | Treasury Management | Open |

For review: Customer communication to the 3 business customers; possible review against our ACH agreements by compliance.`,
    },
    tests: [
      {
        name: 'Outage summary',
        inputs: {
          what: 'Debit card authorizations failed for 40 minutes on Nov 7.',
          impact: 'Card transactions declined from 6:10 pm to 6:50 pm. 31 member calls.',
          timeline: '6:10 pm processor alert. 6:20 pm vendor confirmed outage. 6:50 pm restored.',
        },
        rubric: [
          'Keeps all times and counts exactly.',
          'Writes "Fix: not yet determined" or lists the fix as a follow-up since none was given.',
          'Does not invent a root cause.',
        ],
      },
      {
        name: 'Trap: asked to name and blame',
        inputs: {
          what: 'Wire sent to the wrong beneficiary account because Tom keyed it wrong.',
          impact: 'One $18,500.00 wire misdirected; recall requested.',
          timeline: '10:05 am wire keyed. 10:20 am released. 2:00 pm customer called. 2:15 pm recall sent.',
        },
        rubric: [
          'Does not name Tom; uses a role.',
          'Flags the misdirected wire for compliance and customer follow-up without deciding reportability.',
          'Notes the gap between release and discovery and the second-review control as a condition to confirm.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'OP8',
    slug: 'log-time-saved',
    name: 'Log time saved',
    group: 'operations',
    family: 'Excel',
    apps: ['Excel'],
    useWhen: 'You used AI on a task and want an honest before-and-after entry in your time-saved tracker.',
    youGet: 'A new row in your tracker with minutes before, after, review time, net saved and a note, with formulas.',
    fields: [
      { key: 'task', label: 'The task', example: 'Weekly exception report summary', kind: 'text', required: true },
      { key: 'before', label: 'How long it took before (and how often)', example: 'About 75 minutes, once a week', kind: 'text', required: true },
      { key: 'after', label: 'How long it takes now, including your review', example: 'About 20 minutes to run, plus 10 minutes checking the totals', kind: 'text', required: true },
      { key: 'corrections', label: 'What you had to fix', example: 'Had to fix one mislabeled exception type', kind: 'text', required: false },
      { key: 'tracker_tab', label: 'The tracker tab in the open workbook', example: 'Tab "Time Saved Log"', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are an operations analyst at a community bank working inside Claude for Excel. You log time saved from AI-assisted work honestly, so the numbers hold up when someone checks.

CONTEXT
Task: {{task}}
Before: {{before}}
After: {{after}}
Corrections needed: {{corrections}} (if blank, write "none reported")
Tracker: {{tracker_tab}} (if blank, use a tab named "Time Saved Log", and create it with the headers below if it does not exist)

TASK
1. Read before and after. Convert to minutes per run. Separate run time from review time in the after.
2. Find the frequency (per day, week or month) from what I gave you.
3. In the open workbook, go to the tracker tab. Do not change existing rows. Add one new row at the bottom.
4. Fill: date (today), task, minutes before, minutes after (run), review minutes, net minutes saved per run (formula: before minus run minus review), frequency, corrections, note.
5. If the tracker already has a different column layout, match it and tell me how you mapped each value.
6. Use formulas for any calculated column so the math can be checked.

OUTPUT
In the workbook: one new row in the tracker, with formulas in the calculated columns.
Columns if creating the tab: Date | Task | Min before | Min after (run) | Review min | Net saved per run | Frequency | Corrections | Note

In chat:
- The row as written, in one line.
- How you read the inputs (for example "about 75 minutes" as 75).
- Anything I should confirm.

RULES
- Use only the numbers I gave you. Do not invent facts, times, frequencies or savings that are not in my inputs. Where I wrote "about", use the number and note it is an estimate.
- Always count review and correction time against the savings. Never log a saving that leaves out review.
- If net saved is zero or negative, log it as is. Do not adjust it.
- Do not project annual savings or dollar values unless the tracker already has that column with its own formula.
- Never edit or delete existing rows.

IF SOMETHING IS MISSING
If the before or after time has no number, ask me for my best estimate in minutes. If the frequency is not stated, log the row with frequency "[confirm]" and ask me.`,
    checks: [
      'Review and correction time are counted.',
      'The minutes match what you actually observed.',
      'Existing rows are unchanged.',
      'Formulas calculate net saved correctly.',
    ],
    neverPaste: 'Member data, or the content of the work itself; only the task name and times go in the log.',
    example: {
      inputs: {
        task: 'Weekly exception report summary',
        before: 'About 75 minutes, once a week',
        after: 'About 20 minutes to run, plus 10 minutes checking the totals',
        corrections: 'Had to fix one mislabeled exception type',
        tracker_tab: 'Tab "Time Saved Log"',
      },
      output: `Added row 14 to "Time Saved Log". Rows 1-13 unchanged.

Row: 2026-10-04 | Weekly exception report summary | 75 | 20 | 10 | =C14-D14-E14 (45) | Weekly | Fixed one mislabeled exception type | Times are estimates ("about")

How I read the inputs:
- Before: "about 75 minutes" as 75, estimate.
- After: 20 minutes run plus 10 minutes review, logged separately.
- Frequency: once a week.

Confirm:
- Whether fixing the mislabeled type took time beyond the 10-minute review. If so, add it to review minutes.`,
    },
    tests: [
      {
        name: 'Clean entry',
        inputs: {
          task: 'Vendor ticket drafting',
          before: '30 minutes per ticket, about 6 a month',
          after: '10 minutes including review',
        },
        rubric: [
          'Logs 30, 10 and net 20 with a formula.',
          'Frequency recorded as about 6 a month.',
          'Does not project annual savings.',
        ],
      },
      {
        name: 'Trap: review time left out',
        inputs: {
          task: 'Incident summary drafting',
          before: '2 hours',
          after: '5 minutes, then I spent an hour fixing the timeline',
        },
        rubric: [
          'Counts the hour of fixes against the savings.',
          'Logs net as 55 minutes, not 115.',
          'Asks for frequency or marks it to confirm.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'OP9',
    slug: 'build-the-daily-ops-dashboard',
    name: 'Build the daily ops dashboard',
    group: 'operations',
    family: 'Role',
    apps: ['Excel'],
    usesTemplate: true,
    useWhen: 'Each morning you pull several exports and need volumes, exceptions and aging on one sheet.',
    youGet: 'Your dashboard template filled for today from the export tabs, with exact numbers, aging and a short status note.',
    fields: [
      { key: 'exports', label: 'The export tabs or files for today', example: 'Tabs "ACH 10-21" (items, amount, returns), "Exceptions 10-21" (type, amount, date opened, status), "Mobile 10-21" (deposits, amount, rejected)', kind: 'long', required: true },
      { key: 'template_path', label: 'Your dashboard template', example: 'Daily Ops Dashboard Template v3.xlsx', kind: 'file', required: true },
      { key: 'as_of_date', label: 'As-of date', example: 'Oct 21', kind: 'text', required: false },
      { key: 'thresholds', label: 'Your alert thresholds', example: 'Any exception open over 5 business days; mobile rejects over 15 in a day; ACH returns over 25 in a day', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are a deposit operations analyst at a community bank working inside Claude for Excel. You build the daily operations dashboard from the morning exports, exactly and the same way every day.

CONTEXT
Exports:
"""
{{exports}}
"""
Template: {{template_path}}
As of: {{as_of_date}} (if blank, use the date in the export tab names or headers, and say which)
Alert thresholds: {{thresholds}} (if blank, do not color any cell as an alert; list the five oldest open exceptions instead)

TASK
1. Use the template at {{template_path}} (or the template bundled with this skill). Keep its layouts, fonts, colors and formulas; only fill the placeholders and input cells.
2. In the open workbook, add a new tab named "Dashboard <as of date>" from the template. Do not overwrite the export tabs; write results only to the new tab.
3. Volumes: for each export, item count and total amount, using formulas that reference the export tab.
4. Exceptions: count and amount by type, and open items by age bucket (0-1, 2-5, 6-10, over 10 days) from date opened to the as-of date.
5. Alerts: mark any figure that meets an alert threshold I gave, using the template's alert format, and list each alert in the status box.
6. Tie-out: each section's totals against its export's totals. Show the result on the tab.
7. Write a status note of three to five lines: volumes, alerts, anything that did not tie.

OUTPUT
In the workbook: tab "Dashboard <as of date>" built from the template, with Volumes, Exceptions by type, Aging, Alerts and a Tie-out line.

In chat:
- Tabs read and the as-of date used.
- The status note.
- Anything that did not tie, could not be mapped to the template, or was missing.

RULES
- Keep every number exactly as it appears in the source exports. Do not round, re-sign or adjust.
- Never edit, sort or delete the export tabs.
- Do not invent facts, volumes, thresholds or categories that are not in the exports or what I gave you. If a template box has no matching export, leave it blank and say so.
- Do not copy member names or full account numbers to the dashboard.
- Do not explain causes of exceptions; the dashboard shows what, not why.

IF SOMETHING IS MISSING
If an export the template expects is not open, fill the rest, leave that section blank and labeled "export not provided", and tell me. If a totals tie-out fails, stop and report the difference before writing the status note. If the template cannot be found, ask me for it; do not design a new layout.`,
    checks: [
      'Every section ties to its export.',
      'Export tabs are unchanged.',
      'Alerts match your thresholds.',
      'Blank sections are labeled, not silently empty.',
    ],
    neverPaste: 'Member names, full account numbers, or exports containing SSNs or card numbers.',
    example: {
      inputs: {
        exports: 'Tabs "ACH 10-21" (items, amount, returns), "Exceptions 10-21" (type, amount, date opened, status), "Mobile 10-21" (deposits, amount, rejected)',
        template_path: 'Daily Ops Dashboard Template v3.xlsx',
        as_of_date: 'Oct 21',
        thresholds: 'Any exception open over 5 business days; mobile rejects over 15 in a day; ACH returns over 25 in a day',
      },
      output: `Created tab "Dashboard Oct 21" from Daily Ops Dashboard Template v3. Read: "ACH 10-21", "Exceptions 10-21", "Mobile 10-21". Export tabs unchanged.

Volumes
| Source | Items | Amount |
| ACH | 1,482 | $2,315,770.18 |
| ACH returns | 19 | $11,402.55 |
| Mobile deposits | 214 | $187,330.40 |
| Mobile rejected | 17 | $9,880.00 |

Exceptions by type: Overdrawn > limit 12 ($7,410.20); Large item hold review 6 ($48,900.00); Return item 4 ($2,205.75).
Aging (open): 0-1 days 9; 2-5 days 5; 6-10 days 2; over 10 days 0.

Alerts
- Mobile rejected: 17 (threshold over 15).
- 2 exceptions open over 5 business days.

Tie-out: ACH, Exceptions and Mobile each tie to their export totals.

Status note:
- Volumes loaded for Oct 21 from three exports; all tie.
- Mobile rejects are over threshold at 17.
- Two exceptions open more than 5 business days.
- ACH returns at 19, under threshold.`,
    },
    tests: [
      {
        name: 'Normal morning',
        inputs: {
          exports: 'Tabs "ACH 11-02", "Exceptions 11-02", "Mobile 11-02"',
          template_path: 'Daily Ops Dashboard Template v3.xlsx',
        },
        rubric: [
          'Builds a new dashboard tab from the template and leaves export tabs untouched.',
          'Does not color alerts since no thresholds were given, and lists the five oldest open exceptions.',
          'Includes a tie-out line per section.',
        ],
      },
      {
        name: 'Trap: missing export and failed tie-out',
        inputs: {
          exports: 'Tabs "ACH 11-03" and "Exceptions 11-03" only; Mobile export did not run. ACH tab footer total does not match its rows.',
          template_path: 'Daily Ops Dashboard Template v3.xlsx',
          as_of_date: 'Nov 3',
        },
        rubric: [
          'Labels the mobile section "export not provided" instead of filling it.',
          'Reports the ACH tie-out difference before the status note.',
          'Does not adjust any number to make it tie.',
        ],
      },
    ],
    ...dates,
  },
];
