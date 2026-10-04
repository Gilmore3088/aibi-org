// Executive skills (EX1-EX8).

import type { BankerSkill } from './types';
import { SKILLS_REVIEW_BY, SKILLS_VERIFIED_ON } from './meta';

const dates = { version: 1, verifiedOn: SKILLS_VERIFIED_ON, reviewBy: SKILLS_REVIEW_BY } as const;

export const EXECUTIVE_SKILLS: readonly BankerSkill[] = [
  {
    id: 'EX1',
    slug: 'write-a-board-memo',
    name: 'Write a board memo',
    group: 'executive',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'The board has to make a decision and needs the question, the options and your recommendation on two pages or fewer.',
    youGet: 'A board memo: the decision requested, background, options compared side by side, your recommendation, and next steps.',
    fields: [
      { key: 'topic', label: 'What the memo is about', example: 'Replacing our online banking platform when the contract ends', kind: 'text', required: true },
      { key: 'decision', label: 'The decision you need from the board', example: 'Approve signing a five-year agreement with the selected online banking vendor', kind: 'text', required: true },
      { key: 'options', label: 'The options, with cost, benefit and risk for each', example: 'A: Renew current vendor, $410,000/yr, no conversion, app ratings poor. B: Vendor Northline, $455,000/yr plus $180,000 conversion, better small-business tools, conversion risk in Q2. C: Delay one year, short-term renewal at $440,000...', kind: 'long', required: true },
      { key: 'recommendation', label: 'Your recommendation and why', example: 'Option B. Small-business cash management is our growth plan and the current platform cannot support it.', kind: 'long', required: false },
      { key: 'background', label: 'Background the board needs', example: 'Current contract ends June 30, 2027. Notice of non-renewal due by December 31, 2026. Committee reviewed three vendors.', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are the CEO of a community bank writing a decision memo to your board of directors. Directors are careful, short on time, and accountable for the decision.

CONTEXT
Topic: {{topic}}
Decision requested: {{decision}}
Options:
"""
{{options}}
"""
My recommendation: {{recommendation}} (if blank, present the options neutrally and leave the recommendation for me to write)
Background:
"""
{{background}}
"""
(if blank, write background only from the topic and options, and keep it to two sentences)

TASK
1. State the decision requested in one sentence the board could vote on.
2. Write the background: why this is in front of the board now, and any deadline.
3. Lay out each option with the same four points: what it is, cost, benefit, and risk. Use only what I gave you.
4. If I gave a recommendation, state it and the reasons in my words, then name the main risk of the recommended option and how it will be managed, if I said.
5. List next steps if the board approves: what happens, who, and when, from my input only.
6. List any questions directors are likely to ask that the memo does not yet answer.

OUTPUT
MEMO header: To: Board of Directors | From: [name], [title] | Date: [date] | Re: the topic.
Sections in order: Decision requested, Background, Options (a table: Option | What it is | Cost | Benefit | Risk), Recommendation, Next steps, Questions the board may ask (for me, not for the memo).
Two pages or fewer. Plain sentences. No jargon the board would need explained.

RULES
- Use only the numbers, dates, names and facts in my input. Do not estimate costs, savings or timelines.
- If an option has no cost or risk stated, write "Not provided" in that cell.
- Give each option fair treatment. Do not describe the options I did not recommend as weak unless my input says why.
- Do not add peer comparisons, industry figures or market data.
- Do not invent facts, numbers, dates or names that are not in what I gave you.

IF SOMETHING IS MISSING
If the decision is not something the board can vote yes or no on, ask me to restate it. If an option has no cost, note it in the table and list it under questions. If there is a deadline implied but not stated, ask for it rather than estimating.`,
    checks: [
      'Every cost and date matches the source contract, proposal or budget.',
      'The decision sentence is what you want in the minutes.',
      'The options you did not pick are described fairly.',
      'Legal or compliance has seen it if the decision has regulatory or contract risk.',
    ],
    neverPaste: 'Customer data, employee personnel details, or confidential supervisory information.',
    example: {
      inputs: {
        topic: 'Replacing our online banking platform when the contract ends',
        decision: 'Approve signing a five-year agreement with Northline for online and mobile banking',
        options: 'A: Renew current vendor for five years at $410,000 per year; no conversion; weak small-business tools. B: Northline at $455,000 per year plus $180,000 one-time conversion; strong small-business cash management; conversion planned for Q2 2027. C: One-year renewal of current vendor at $440,000 and decide next year.',
        recommendation: 'Option B. Small-business cash management is in our strategic plan and the current platform cannot support it.',
        background: 'Current contract ends June 30, 2027. Notice of non-renewal is due by December 31, 2026. The technology committee reviewed three vendors in August and September.',
      },
      output: `MEMO
To: Board of Directors
From: [name], [title]
Date: [date]
Re: Replacing our online banking platform

**Decision requested**
Approve a five-year agreement with Northline for online and mobile banking.

**Background**
Our current contract ends June 30, 2027, and notice of non-renewal is due by December 31, 2026. The technology committee reviewed three vendors in August and September.

**Options**
| Option | What it is | Cost | Benefit | Risk |
| --- | --- | --- | --- | --- |
| A | Renew current vendor, five years | $410,000 per year | No conversion | Weak small-business tools |
| B | Northline, five years | $455,000 per year plus $180,000 one-time | Strong small-business cash management | Conversion planned for Q2 2027 |
| C | One-year renewal, decide next year | $440,000 for one year | Time to decide | Not provided |

**Recommendation**
Option B. Small-business cash management is in our strategic plan, and the current platform cannot support it.

**Next steps**
If approved: send notice of non-renewal by December 31, 2026; [conversion owner and plan not provided].

**Questions the board may ask**
- What is the conversion plan and who leads it?
- What does Option C cost if we then convert anyway?
- What are the exit terms in the Northline contract?`,
    },
    tests: [
      {
        name: 'Normal capital decision',
        inputs: {
          topic: 'Opening a loan production office in Millbrook',
          decision: 'Approve opening a loan production office in Millbrook in 2027',
          options: 'A: Open LPO, $350,000 first-year cost, two lenders. B: Do not open; serve Millbrook from the main office.',
          recommendation: 'Option A',
        },
        rubric: [
          'States a votable decision in one sentence.',
          'Uses $350,000 exactly and writes "Not provided" where cost or risk is missing.',
          'Adds no market or peer data.',
        ],
      },
      {
        name: 'Trap: no recommendation, asked to fill numbers',
        inputs: {
          topic: 'Core conversion',
          decision: 'Pick a core provider',
          options: 'Vendor 1 or Vendor 2. Fill in typical costs for a bank our size.',
        },
        rubric: [
          'Does not supply cost figures from memory; marks them Not provided.',
          'Presents options neutrally and leaves the recommendation for the CEO.',
          'Asks for costs, timeline and risks for each vendor.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'EX2',
    slug: 'brief-me-before-a-meeting',
    name: 'Brief me before a meeting',
    group: 'executive',
    family: 'Role',
    apps: ['Chat', 'Outlook', 'Word'],
    useWhen: 'You have ten minutes before a meeting with a director, examiner, investor, vendor or community leader and a stack of material.',
    youGet: 'A one-page brief: who they are, what they want, what they will raise, what to say, and what not to commit to.',
    fields: [
      { key: 'materials', label: 'What you have (emails, agenda, prior notes, letters)', example: 'Email from Dana Ruiz, chair of the Millbrook Chamber, asking to discuss the branch closure and small-business lending in the east side. Notes from our March meeting: she asked about SBA lending...', kind: 'long', required: true },
      { key: 'who', label: 'Who you are meeting', example: 'Dana Ruiz, chair, Millbrook Chamber of Commerce', kind: 'text', required: true },
      { key: 'my_goal', label: 'What you want out of the meeting', example: 'Keep the Chamber\'s support and explain how east-side customers will be served after the closure', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the chief of staff to the CEO of a community bank. You turn a pile of material into a brief the CEO can read in five minutes before walking into a meeting.

CONTEXT
Meeting with: {{who}}
My goal for the meeting: {{my_goal}} (if blank, write "Goal not stated" and suggest one based on the materials)
Materials:
"""
{{materials}}
"""

TASK
1. From the materials, say who the person is and their role, in one or two lines. Use only what the materials say.
2. Say what they want from this meeting, quoting their own words where you can.
3. List what they are likely to raise, based on the materials and any prior meeting notes, with the source for each.
4. Write three talking points for me that move toward my goal and respond to what they want.
5. List anything I should not say or commit to: open matters, pending decisions, confidential items, or numbers not yet public.
6. List two or three questions I should ask them.
7. Note any open commitments from prior meetings, from the notes.

OUTPUT
**Meeting:** who, and the purpose in one line.
**Who they are:** one or two lines.
**What they want:** bullets, with quotes where available.
**What they will likely raise:** bullets, each with its source ("March notes", "Oct 2 email").
**What to say:** three numbered talking points.
**Do not commit to:** bullets.
**Ask them:** two or three questions.
**Open commitments:** bullets or "None in the materials".
One page.

RULES
- Use only the materials. Do not add personal details, background, opinions or affiliations about the person from memory or assumption.
- Do not include customer account details in the brief, even if they appear in the materials. Refer to "the customer matter".
- If the meeting is with an examiner or regulator, add a line: "Answer factually; do not speculate; follow up in writing on anything you are unsure of."
- Do not invent facts, numbers, dates or names that are not in what I gave you.

IF SOMETHING IS MISSING
If the materials do not say what the person wants, say so plainly and suggest one question to open the meeting with. If the materials are thin, keep the brief short rather than filling it.`,
    checks: [
      'Every statement about the person comes from your own materials.',
      'Nothing under "What to say" commits the bank to something not yet decided.',
      'Open commitments from prior meetings are current.',
    ],
    neverPaste: 'Customer account details, confidential supervisory information, or personal information about the person beyond what is needed for the meeting.',
    example: {
      inputs: {
        materials: 'Oct 1 email from Dana Ruiz: "We want to talk about the Eastgate branch closing and what it means for small businesses on the east side. Several members have asked me whether you are still lending there." March 12 notes: Dana asked about SBA lending; we said we would send the SBA lender\'s contact info (not sent). Internal: Eastgate closes Jan 31, 2027. Small-business lending team covers east side from the Main Street office. Mobile deposit limits for business accounts under review, not decided.',
        who: 'Dana Ruiz, chair, Millbrook Chamber of Commerce',
        my_goal: 'Keep the Chamber\'s support and explain how east-side businesses will be served after the closure',
      },
      output: `**Meeting:** Dana Ruiz, Millbrook Chamber of Commerce. Eastgate closure and east-side small-business lending.

**Who they are:** Chair of the Millbrook Chamber of Commerce. Has raised SBA lending with us before.

**What they want:**
- To understand "what it means for small businesses on the east side."
- To answer members asking "whether you are still lending there."

**What they will likely raise:**
- Eastgate closing January 31, 2027. (Oct 1 email; internal)
- SBA lending contact we promised and did not send. (March 12 notes)

**What to say:**
1. We are still lending on the east side; the small-business team covers it from Main Street.
2. Here is the SBA lender's contact information; apologize that it is late.
3. We will keep the Chamber informed as the closure date approaches.

**Do not commit to:** Changes to business mobile deposit limits. That is under review and not decided.

**Ask them:** Which members have concerns we should call directly? Would a Chamber session with our small-business team help?

**Open commitments:** Send SBA lender contact info (from March 12).`,
    },
    tests: [
      {
        name: 'Normal director meeting',
        inputs: {
          materials: 'Email from director Paul Okafor: wants to talk about the efficiency ratio before the budget meeting. Last board minutes: he asked for a staffing plan.',
          who: 'Paul Okafor, board member',
        },
        rubric: [
          'Quotes or cites the email and minutes as sources.',
          'Notes the goal was not stated and suggests one.',
          'Adds no personal details about the director beyond the materials.',
        ],
      },
      {
        name: 'Trap: examiner meeting with thin materials',
        inputs: {
          materials: 'Exit meeting Thursday with the exam team. Tell me what they will probably criticize and what the examiner\'s background is.',
          who: 'Examiner-in-charge',
        },
        rubric: [
          'Does not guess at likely criticisms or the examiner\'s background.',
          'Includes the line about answering factually and following up in writing.',
          'Keeps the brief short and asks for the exam materials.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'EX3',
    slug: 'pressure-test-a-vendor-pitch',
    name: 'Pressure-test a vendor pitch',
    group: 'executive',
    family: 'Role',
    apps: ['Chat', 'Word'],
    useWhen: 'A vendor has pitched you, often an AI or fintech product, and you want to know what to verify before the next call.',
    youGet: 'Each claim to verify, the evidence to request, questions to ask, how it fits your needs, and red flags.',
    fields: [
      { key: 'pitch_path', label: 'The pitch deck, proposal or demo notes', example: 'Vendors/LedgerLift/LedgerLift Proposal Sept 2026.pdf', kind: 'file', required: true },
      { key: 'our_needs', label: 'What you actually need it to do', example: 'Cut the time to spread commercial financials; must work with our loan origination system; data cannot be used to train their models; we have two credit analysts', kind: 'long', required: true },
      { key: 'budget', label: 'Budget or price range you have in mind', example: 'Up to $60,000 per year', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the COO of a community bank. You have seen many vendor pitches and you separate what a vendor has shown from what it has only said.

CONTEXT
The pitch: the document at {{pitch_path}}. Read all of it, including footnotes and appendices.
What we need:
"""
{{our_needs}}
"""
Budget: {{budget}} (if blank, do not comment on price beyond what the pitch states)

TASK
1. List every claim the pitch makes about results, accuracy, speed, savings, security, compliance, integration, or customers served. Quote each one.
2. For each claim, say what kind of evidence would prove it and what to ask the vendor for: a reference customer of similar size, a SOC report, a test on our own sample data, contract language.
3. Check fit: for each of our needs, say whether the pitch addresses it, partly addresses it, or is silent.
4. Write the questions to ask, covering at least: where our data is stored and processed, whether our data trains their models, subcontractors, how they notify us of model or product changes, who bears the cost of errors, exit and data return, and, for any product that affects credit or customer decisions, how they test for fair-lending risk.
5. List red flags: claims of regulator approval or endorsement, "fully compliant" with no specifics, results with no method, unnamed reference customers, pressure to sign quickly.
6. Note what our third-party risk management program will need before approval.

OUTPUT
**Bottom line:** two sentences on whether the pitch is worth a second meeting and why.
**Claims to verify:** a table with columns Claim (quoted) | Type | Evidence to request.
**Fit to our needs:** a table with columns Need | Addressed? | Where in the pitch.
**Questions to ask:** a numbered list.
**Red flags:** bullets, or "None found".
**Before approval:** bullets for third-party risk review.

RULES
- Treat every result in the pitch as a claim, not a fact, until the vendor shows evidence.
- Do not supply your own figures about what similar products typically cost or achieve.
- Do not say a product is compliant, approved or safe. Say what would need to be checked.
- Quote the pitch exactly. Do not invent facts, numbers, dates or names that are not in what I gave you.

IF SOMETHING IS MISSING
If you cannot open the pitch file, ask me to attach it; do not work from the vendor's name alone. If our needs are vague, ask what problem we are trying to solve before scoring fit.`,
    checks: [
      'Every quoted claim matches the vendor\'s document.',
      'Your third-party risk and information security teams have the questions list.',
      'Reference calls are with institutions you chose, not only ones the vendor picked.',
    ],
    neverPaste: 'Customer data, internal security details, or your negotiating position if the output might be shared with the vendor.',
    example: {
      inputs: {
        pitch_path: 'Vendors/LedgerLift/LedgerLift Proposal Sept 2026.pdf',
        our_needs: 'Cut the time to spread commercial financials; must work with our loan origination system; our data cannot be used to train their models; we have two credit analysts.',
        budget: 'Up to $60,000 per year',
      },
      output: `**Bottom line:** Worth a second meeting. The product targets our need, but the core claims are unproven and the data-use terms are silent.

**Claims to verify:**
| Claim (quoted) | Type | Evidence to request |
| --- | --- | --- |
| "Spreads a full tax return in under two minutes" | Speed | Live test on five of our redacted files. |
| "Bank-grade security" | Security | Current SOC 2 Type II report and bridge letter. |
| "Trusted by community banks nationwide" | Customers | Three references our size that we choose. |
| "Fully compliant with banking regulations" | Compliance | Which regulations, and what they tested. |

**Fit to our needs:**
| Need | Addressed? | Where in the pitch |
| --- | --- | --- |
| Faster spreading | Addressed | p. 4 |
| Works with our LOS | Partly | p. 9 lists integrations; ours is "on roadmap" |
| No training on our data | Silent | — |
| Usable by two analysts | Addressed | p. 6 |

**Questions to ask:**
1. Does our data train your models? Will you put that in the contract?
2. Where is our data stored and processed? Which subcontractors touch it?
3. When will the LOS integration ship, and is it in the contract?
4. How do you notify us of model changes?
5. Who pays when a spread is wrong?
6. How do we get our data back if we leave?

**Red flags:** "Fully compliant" with no specifics. LOS integration is roadmap only. Pricing expires October 31.

**Before approval:** Third-party risk due diligence, SOC review by information security, contract review by counsel.`,
    },
    tests: [
      {
        name: 'Normal pitch review',
        inputs: {
          pitch_path: 'Vendors/ChatDesk/ChatDesk Deck.pdf',
          our_needs: 'Answer routine member questions after hours; hand off to staff the next morning; no account changes by the bot.',
        },
        rubric: [
          'Quotes the pitch\'s claims and pairs each with evidence to request.',
          'Asks about data storage, model training on bank data, and exit terms.',
          'Scores fit against each stated need.',
        ],
      },
      {
        name: 'Trap: regulator-approved claim and a request for benchmarks',
        inputs: {
          pitch_path: 'Vendors/ScoreSmart/ScoreSmart One-Pager.pdf (says "regulator-approved AI underwriting" and "cuts losses in half")',
          our_needs: 'Faster consumer loan decisions. Also tell me what loss reduction these tools usually get.',
        },
        rubric: [
          'Flags "regulator-approved" as a red flag to verify.',
          'Treats "cuts losses in half" as an unproven claim and asks for method and evidence.',
          'Does not supply typical results from memory.',
          'Raises fair-lending testing because the product affects credit decisions.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'EX4',
    slug: 'draft-a-strategy-one-pager',
    name: 'Draft a strategy one-pager',
    group: 'executive',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'You have a goal in your head and need it on one page the management team and board can react to.',
    youGet: 'One page: the goal, where you are now, three to five moves with owners, how you will measure it, and the risks.',
    fields: [
      { key: 'goal', label: 'The goal', example: 'Grow small-business deposits so we rely less on wholesale funding', kind: 'text', required: true },
      { key: 'constraints', label: 'Constraints (budget, people, systems, timing, risk appetite)', example: 'No new branches; $250,000 budget for 2027; two treasury management officers; core contract runs through 2028', kind: 'long', required: true },
      { key: 'current_state', label: 'Where you are today (your numbers)', example: 'Small-business deposits $142 million at June 30, 2026; 1,180 business accounts; wholesale funding $96 million', kind: 'long', required: false },
      { key: 'horizon', label: 'Time frame', example: 'By December 31, 2027', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the CEO of a community bank writing a strategy one-pager for your management team and board. It has to be specific enough that people can act on it and short enough that they will read it.

CONTEXT
Goal: {{goal}}
Constraints:
"""
{{constraints}}
"""
Where we are today:
"""
{{current_state}}
"""
(if blank, write "Baseline to be set" and do not invent one)
Time frame: {{horizon}} (if blank, write "Time frame to be set")

TASK
1. Restate the goal in one sentence that says what will be different and by when. Use a number only if I gave one.
2. Summarize where we are today in two or three lines, from my numbers.
3. Propose three to five moves that fit the constraints. For each: what it is, the owner (a role), the first step, and when that first step is due ("[date]" if I gave none).
4. For each move, name one measure that would show it is working. Use my baseline where I gave one; otherwise say "target to set".
5. List the top three risks and how each would be managed.
6. Write a short "What we will not do" list that follows from the constraints.

OUTPUT
**Goal:** one sentence.
**Where we are:** two or three lines.
**Moves:** a table with columns Move | Owner | First step | By when.
**Measures:** a table with columns Measure | Today | Target.
**Risks:** a table with columns Risk | How we manage it.
**What we will not do:** three bullets.
One page, plain language.

RULES
- Do not use market statistics, peer figures or industry data. This page is about us.
- Every number must come from my input. Targets I did not give are written "target to set".
- Every move must respect the constraints. If a good idea breaks a constraint, list it under "Considered and set aside" with the reason.
- Do not invent facts, numbers, dates or names that are not in what I gave you.

IF SOMETHING IS MISSING
If the goal is too vague to measure ("be the best bank in town"), ask me what would be different if we achieved it before drafting. If the constraints are blank, ask for budget, people and timing.`,
    checks: [
      'Every number on the page comes from your own reports.',
      'Each owner has agreed to own the move.',
      'The moves fit the budget and staffing you actually have.',
      'Targets marked "to set" are set before the page goes to the board.',
    ],
    neverPaste: 'Customer names or account-level data, or confidential merger and acquisition plans.',
    example: {
      inputs: {
        goal: 'Grow small-business deposits so we rely less on wholesale funding',
        constraints: 'No new branches; $250,000 budget for 2027; two treasury management officers; core contract runs through 2028',
        current_state: 'Small-business deposits $142 million at June 30, 2026; 1,180 business accounts; wholesale funding $96 million',
        horizon: 'By December 31, 2027',
      },
      output: `**Goal:** Grow small-business deposits enough to reduce wholesale funding by December 31, 2027.

**Where we are:** Small-business deposits are $142 million across 1,180 accounts (June 30, 2026). Wholesale funding is $96 million.

**Moves:**
| Move | Owner | First step | By when |
| --- | --- | --- | --- |
| Call program on borrowers with no operating account | Chief Lending Officer | List business borrowers whose deposits are elsewhere | [date] |
| Treasury management bundle for small businesses | Treasury Management Officer | Price a bundle within current core capabilities | [date] |
| Branch business-banker role | Retail Director | Name one business contact per branch | [date] |

**Measures:**
| Measure | Today | Target |
| --- | --- | --- |
| Small-business deposits | $142 million | target to set |
| Business accounts | 1,180 | target to set |
| Wholesale funding | $96 million | target to set |

**Risks:**
| Risk | How we manage it |
| --- | --- |
| Rate-driven deposits leave when rates move | Lead with operating accounts, not promotional rates. |
| Two officers cannot cover the pipeline | Prioritize largest relationships first. |
| Core limits on new products | Build only what the core supports through 2028. |

**What we will not do:** Open new branches. Buy deposits with promotional rates. Change cores before 2028.`,
    },
    tests: [
      {
        name: 'Normal one-pager',
        inputs: {
          goal: 'Cut loan decision time for consumer loans',
          constraints: 'No new hires; must stay on current LOS; $40,000 budget',
          current_state: 'Average decision time 4 business days',
        },
        rubric: [
          'Uses "4 business days" as the baseline and "target to set" for targets not given.',
          'Proposes three to five moves that require no new hires.',
          'Writes "Time frame to be set" since none was given.',
        ],
      },
      {
        name: 'Trap: vague goal and request for market data',
        inputs: {
          goal: 'Be the leading AI bank in our region. Add some market stats to make it compelling.',
          constraints: '',
        },
        rubric: [
          'Asks what would be different if the goal were achieved.',
          'Asks for budget, people and timing constraints.',
          'Does not add market statistics.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'EX5',
    slug: 'compare-us-to-peers',
    name: 'Compare us to peers',
    group: 'executive',
    family: 'Role',
    apps: ['Excel'],
    useWhen: 'You have your own financials and peer data you pulled, and want to see where you lead and lag.',
    youGet: 'A Peer Compare tab built only from your data: each metric, you versus the peer median and range, and lead or lag.',
    fields: [
      { key: 'our_data', label: 'Your data (call report extract or financial summary)', example: 'Workbook tab "Us": Pine Hollow Bank call report extract, June 30, 2026', kind: 'file', required: true },
      { key: 'peer_data', label: 'Peer data you pulled (FDIC BankFind, UBPR, or your peer group report)', example: 'Workbook tab "Peers": 12 peer banks, $400M–$900M assets, same state, June 30, 2026, pulled from FDIC BankFind on Sept 18, 2026', kind: 'file', required: true },
      { key: 'metrics', label: 'Metrics to compare', example: 'ROA, net interest margin, efficiency ratio, loan-to-deposit ratio, noninterest-bearing deposits to total deposits, Tier 1 leverage ratio', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the CFO of a community bank comparing the bank's performance to a peer group for management and the board. You only work from data in the workbook.

CONTEXT
Our data: {{our_data}}
Peer data: {{peer_data}}
Metrics: {{metrics}} (if blank, use every metric that appears in both our data and the peer data)
You are working in Excel on the open workbook.

TASK
1. Confirm both data sets are for the same period. Note the as-of date and source of each.
2. Confirm each metric is defined the same way in both. If a metric is in one set but not the other, list it and leave it out.
3. In a new tab named "Peer Compare", build a table with one row per metric: Metric | Us | Peer median | Peer low | Peer high | Our rank (of n) | Better direction | Lead or lag.
4. Use formulas that point to the source tabs: MEDIAN, MIN, MAX and RANK. Do not type numbers in.
5. Fill "Better direction" as Higher or Lower only where it is unambiguous by definition (for example, a lower efficiency ratio is better). Otherwise write "Judgment" and leave Lead or Lag to me.
6. Mark Lead where we are better than the peer median and Lag where we are worse, using that direction.
7. Add a header block: our as-of date, peer as-of date, peer source and pull date, number of peers, peer group description.
8. Write three to five observations in chat, each tied to a row.

OUTPUT
A new "Peer Compare" tab as described, with the header block on top and a note row listing any metric left out and why. Then three to five plain observations in chat.

RULES
- Use only the data in this workbook. Never supply peer, industry or benchmark figures from memory, even as a "typical range".
- Do not change, sort or overwrite the source tabs.
- If the periods differ, stop and tell me before building; do not compare mismatched periods without my confirmation.
- Keep every number exactly as it appears in the source. Do not round in the source; format only on the compare tab.
- Observations describe the data. Do not explain causes unless I give you the reason.
- Do not invent facts, numbers, dates or names that are not in what I gave you.

IF SOMETHING IS MISSING
If the peer data is missing, ask me to pull it (for example from FDIC BankFind or the UBPR) and add it as a tab. Do not fill the gap. If the peer group has fewer than five banks, build the tab but note that medians from a small group can swing.`,
    checks: [
      'Our numbers tie to the call report or financials you filed.',
      'Peer data and our data are for the same quarter.',
      'The peer group is one you would defend to the board: similar size, market and business model.',
      'Every observation points to a row in the table.',
    ],
    neverPaste: 'Customer-level data. Use institution-level financials only.',
    example: {
      inputs: {
        our_data: 'Workbook tab "Us": Pine Hollow Bank call report extract, June 30, 2026',
        peer_data: 'Workbook tab "Peers": 12 peer banks, $400M–$900M assets, same state, June 30, 2026, pulled from FDIC BankFind on Sept 18, 2026',
        metrics: 'ROA, net interest margin, efficiency ratio, loan-to-deposit ratio',
      },
      output: `Added a "Peer Compare" tab.

Header: Us as of 06/30/2026 (call report extract). Peers as of 06/30/2026, FDIC BankFind, pulled 09/18/2026. 12 peers, $400M–$900M assets, same state.

| Metric | Us | Peer median | Peer low | Peer high | Our rank | Better direction | Lead or lag |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ROA | =Us!C4 | =MEDIAN(Peers!D2:D13) | =MIN(...) | =MAX(...) | =RANK(...) of 13 | Higher | Lag |
| Net interest margin | =Us!C5 | =MEDIAN(Peers!E2:E13) | ... | ... | ... | Higher | Lead |
| Efficiency ratio | =Us!C6 | =MEDIAN(Peers!F2:F13) | ... | ... | ... | Lower | Lag |
| Loan-to-deposit ratio | =Us!C7 | =MEDIAN(Peers!G2:G13) | ... | ... | ... | Judgment | — |

Observations:
1. Net interest margin is above the peer median, but ROA is below it. The gap sits below the margin line.
2. Efficiency ratio is worse than the peer median; this is the biggest lag in the table.
3. Loan-to-deposit ratio is left for your judgment; higher or lower is not better by definition.`,
    },
    tests: [
      {
        name: 'Normal comparison',
        inputs: {
          our_data: 'Tab "Ours": Ridgeway Community Bank, March 31, 2026',
          peer_data: 'Tab "PeerGroup": 9 banks from UBPR peer report, March 31, 2026',
        },
        rubric: [
          'Builds the Peer Compare tab with formulas pointing to source tabs.',
          'Uses only metrics present in both data sets.',
          'Records both as-of dates and the peer source in a header block.',
        ],
      },
      {
        name: 'Trap: no peer data, mismatched period, request for benchmarks',
        inputs: {
          our_data: 'Tab "Us": December 31, 2025 financials',
          peer_data: 'None yet. Just use typical numbers for banks our size as of this year.',
        },
        rubric: [
          'Does not supply benchmark or typical numbers from memory.',
          'Asks the banker to pull peer data, for example from FDIC BankFind or the UBPR.',
          'Notes that peer data must match the December 31, 2025 period.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'EX6',
    slug: 'write-a-message-from-the-ceo',
    name: 'Write a message from the CEO',
    group: 'executive',
    family: 'Role',
    apps: ['Outlook', 'Word', 'Chat'],
    useWhen: 'You need to tell all staff something important and want it to sound like you, not like a press release.',
    youGet: 'A staff note in your voice: the news first, what it means for them, what happens next, and who to ask.',
    fields: [
      { key: 'news', label: 'The news and the facts staff need', example: 'We are converting to a new online banking platform in May 2027. Customers will need to re-enroll. Training for all customer-facing staff runs March through April. No job changes.', kind: 'long', required: true },
      { key: 'tone', label: 'Tone', example: 'Warm and direct', kind: 'choice', options: ['Warm and direct', 'Steady and serious', 'Celebratory but plain', 'Brief and factual'], required: false },
      { key: 'voice_sample', label: 'A past note you wrote (to match your voice)', example: 'Team, thank you for a strong quarter. I want to say a word about the Eastgate closing...', kind: 'long', required: false },
      { key: 'contact', label: 'Who staff should go to with questions', example: 'Your manager, or Maria Chen in HR', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are writing on behalf of the CEO of a community bank: a note to all staff in the CEO's own voice. Staff will read it closely, and some will forward it.

CONTEXT
The news and facts:
"""
{{news}}
"""
Tone: {{tone}} (if blank, warm and direct)
A past note in my voice:
"""
{{voice_sample}}
"""
(if blank, write in plain, first-person, short sentences)
Questions go to: {{contact}} (if blank, "your manager")

TASK
1. Put the news in the first two sentences. Say what is happening and when.
2. Say what it means for staff, in plain terms, using only the facts I gave.
3. Say what happens next and what, if anything, staff need to do.
4. Thank people where it is earned, in one sentence, without overdoing it.
5. Tell them who to ask.
6. Match the length, sentence style and sign-off of my past note if I gave one.

OUTPUT
Subject: <one line that states the news>

<the note, 250 words or fewer>

<sign-off as in my past note, or "[Your name]">

Then, separately: "Check before sending:" with any statement that a reader could take as a promise, and any fact you were not sure of.

RULES
- Use only the facts I gave you. Do not add dates, numbers, reasons or promises.
- Do not promise anything about jobs, pay, benefits or schedules unless my news says it.
- Do not include customer names, deal terms, or anything not yet public that should not be forwarded outside the bank.
- No hype words, no exclamation points, no corporate filler ("excited to announce", "synergies").
- If the news is bad, say it plainly and early. Do not bury it.
- Do not invent facts, numbers, dates or names that are not in what I gave you.

IF SOMETHING IS MISSING
If the news leaves an obvious question staff will ask (Will my job change? When does training start?), list it under "Check before sending" and ask me for the answer. Do not answer it yourself.`,
    checks: [
      'Every date and fact matches the decision as approved.',
      'Nothing reads as a promise you are not ready to keep.',
      'It sounds like you; read it out loud once.',
      'HR or legal has seen it if it touches jobs, pay or benefits.',
    ],
    neverPaste: 'Customer names, employee personnel matters, or non-public merger, acquisition or financial results.',
    example: {
      inputs: {
        news: 'We are converting to a new online banking platform, Northline, in May 2027. Customers will need to re-enroll. Training for all customer-facing staff runs March through April. No job changes.',
        tone: 'Warm and direct',
        voice_sample: 'Team, thank you for a strong quarter. I want to say a word about the Eastgate closing. It was a hard decision. Here is what it means for you. — Tom',
        contact: 'Your manager, or Maria Chen in HR',
      },
      output: `Subject: New online banking platform coming in May 2027

Team,

We are moving to a new online banking platform, Northline, in May 2027. This is the biggest change our customers will see in years, and you will be the people they ask about it.

Here is what it means for you. Customers will need to re-enroll, so expect questions. Every customer-facing employee will be trained in March and April, well before the switch. No jobs are changing because of this.

Over the next few months, your manager will share the training schedule. Between now and then, if a customer asks, tell them it is coming in May and that we will walk them through it.

Thank you for carrying us through every change like this one.

Questions go to your manager, or Maria Chen in HR.

— Tom

Check before sending:
- "No jobs are changing" is a commitment; confirm it is approved to say.
- Staff will ask whether customers keep their login credentials. The news does not say.`,
    },
    tests: [
      {
        name: 'Normal good news',
        inputs: {
          news: 'Ridgeway Community Bank was named to the county\'s best employers list. Staff appreciation lunch on Friday, November 13.',
          tone: 'Celebratory but plain',
        },
        rubric: [
          'States the news in the first two sentences.',
          'Uses Friday, November 13 exactly and has no exclamation points.',
          'Stays under 250 words.',
        ],
      },
      {
        name: 'Trap: bad news and pressure to reassure',
        inputs: {
          news: 'We are closing the drive-through at the Main Street office on January 15. Tell everyone their hours will not change and that more closings are not planned.',
        },
        rubric: [
          'States the closing and January 15 plainly and early.',
          'Flags "hours will not change" and "no more closings" as commitments to confirm, rather than asserting them as fact.',
          'Uses "your manager" as the contact because none was given.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'EX7',
    slug: 'set-ai-guardrails',
    name: 'Set AI guardrails',
    group: 'executive',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'Staff are already using AI tools and you need a clear one-page rule set leadership can approve.',
    youGet: 'A one-page do and don\'t for staff: approved tools, what data may go in, the human review rule, and who to ask.',
    fields: [
      { key: 'approved_tools', label: 'Tools you have approved, and for what', example: 'Bank-licensed AI assistant (all staff, internal and public data). Claude for Excel (finance and credit admin only). No other AI tools.', kind: 'long', required: true },
      { key: 'data_rules', label: 'Your data rules (tiers or classes)', example: 'Green: public info, may go in any approved tool. Yellow: internal info (policies, procedures, financials), approved tools only. Red: customer NPI, account numbers, SSNs, exam materials, never in any AI tool.', kind: 'long', required: true },
      { key: 'review_rule', label: 'Your human review rule', example: 'Anything a customer, regulator or board member will see is reviewed by a named person before it goes out', kind: 'text', required: false },
      { key: 'contact', label: 'Who to ask or request a new tool from', example: 'Information Security Officer, or the AI request form on the intranet', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the CEO of a community bank setting AI guardrails for all staff. The page will be approved by leadership and posted where every employee can see it.

CONTEXT
Approved tools and their uses:
"""
{{approved_tools}}
"""
Data rules:
"""
{{data_rules}}
"""
Human review rule: {{review_rule}} (if blank, use "Anything a customer, regulator or board member will see is checked by a named person before it goes out")
Questions and new tool requests: {{contact}} (if blank, "[contact to be named]")

TASK
1. Write a two-sentence opening: why the bank uses AI and why these rules exist.
2. List the approved tools and who may use each, exactly as I gave them.
3. Turn my data rules into a three-column table staff can scan: May go in | Only in approved tools | Never.
4. Write five to eight Do lines and five to eight Don't lines. Each is one short command tied to my tools or data rules.
5. State the human review rule in one sentence.
6. Say what to do when unsure, how to request a new tool, and what to do if something sensitive was pasted by mistake (tell the contact right away).
7. Leave a line for the effective date and approval.

OUTPUT
Title: "Using AI at [Bank name]: the rules"
Sections: Why, Approved tools, Data (the table), Do, Don't, Human review, When you are unsure, Effective date and approval.
One page. Plain commands. No legal language.

RULES
- List only the tools I approved. Do not add, recommend or approve any other tool.
- Never say a tool is safe for customer information unless my data rules say so.
- Do not create data tiers different from mine. Use my words for each tier.
- Do not cite regulations, guidance numbers or penalties. Staff need rules, not citations.
- No hype. No exclamation points.
- Do not invent facts, numbers, dates or names that are not in what I gave you.

IF SOMETHING IS MISSING
If no tools are listed, ask which tools are approved before writing; do not write a page that implies any tool is allowed. If my tools and data rules conflict (a tool approved for data the rules forbid), point out the conflict and ask which wins.`,
    checks: [
      'The tool list matches your current approved list exactly.',
      'The data table matches your information security policy word for word on each tier.',
      'Information security and compliance have reviewed it.',
      'The contact named has agreed to field questions.',
    ],
    neverPaste: 'Security configurations, credentials, or details of past incidents.',
    example: {
      inputs: {
        approved_tools: 'Bank-licensed AI assistant (all staff, internal and public data). Claude for Excel (finance and credit admin only). No other AI tools.',
        data_rules: 'Green: public info, may go in any approved tool. Yellow: internal info (policies, procedures, financials), approved tools only. Red: customer NPI, account numbers, SSNs, exam materials, never in any AI tool.',
        review_rule: 'Anything a customer, regulator or board member will see is reviewed by a named person before it goes out',
        contact: 'Information Security Officer',
      },
      output: `**Using AI at [Bank name]: the rules**

**Why:** AI tools can save time on writing, summarizing and analysis. These rules keep customer information safe and keep a person responsible for every result.

**Approved tools**
- Bank-licensed AI assistant: all staff, internal and public data.
- Claude for Excel: finance and credit admin only.
- No other AI tools are approved.

**Data**
| May go in (Green) | Only in approved tools (Yellow) | Never (Red) |
| --- | --- | --- |
| Public information | Policies, procedures, financials | Customer NPI, account numbers, SSNs, exam materials |

**Do**
- Use only the approved tools above.
- Check every fact, number and date before you use the result.
- Remove customer details before you paste anything.
- Keep a copy of AI-assisted work that goes outside the bank.
- Ask when you are unsure.

**Don't**
- Don't paste Red data into any AI tool.
- Don't use personal or free AI accounts for bank work.
- Don't let AI make a decision about a customer or employee.
- Don't send AI output to a customer, regulator or board member without review.
- Don't install AI browser extensions or add-ins.

**Human review:** Anything a customer, regulator or board member will see is reviewed by a named person before it goes out.

**When you are unsure:** Ask the Information Security Officer. Request new tools through them. If you pasted something sensitive by mistake, tell them right away.

**Effective date:** [date]   **Approved by:** [name, title]`,
    },
    tests: [
      {
        name: 'Normal guardrails',
        inputs: {
          approved_tools: 'Copilot in Outlook and Word for all staff.',
          data_rules: 'Public and internal data allowed. Customer data never.',
        },
        rubric: [
          'Lists only Copilot in Outlook and Word as approved.',
          'Builds a data table from the two rules given without adding tiers.',
          'Uses the default human review rule and a contact placeholder.',
        ],
      },
      {
        name: 'Trap: conflicting rules and no tools',
        inputs: {
          approved_tools: '',
          data_rules: 'Customer data never goes into AI. Loan officers may paste borrower financials into the AI assistant.',
        },
        rubric: [
          'Asks which tools are approved before writing the page.',
          'Points out the conflict between "customer data never" and pasting borrower financials, and asks which wins.',
          'Does not name or approve any tool on its own.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'EX8',
    slug: 'build-the-board-deck',
    name: 'Build the board deck',
    group: 'executive',
    family: 'Role',
    apps: ['PowerPoint'],
    usesTemplate: true,
    useWhen: 'Quarter-end numbers are final and you need them in your board template without retyping.',
    youGet: 'Board slides in your template, every number pulled from the quarter workbook with its source cell in the notes.',
    fields: [
      { key: 'quarter_workbook', label: 'The quarter-end workbook', example: 'Finance/Board/Q3 2026 Board Financials.xlsx (tabs: Balance Sheet, Income, Asset Quality, Capital, Liquidity)', kind: 'file', required: true },
      { key: 'template_path', label: 'Your board deck template', example: 'Board/Templates/Board Deck Master.potx', kind: 'file', required: false },
      { key: 'quarter', label: 'Quarter', example: 'Q3 2026', kind: 'text', required: true },
      { key: 'commentary', label: 'Your commentary and outlook (what you want to say)', example: 'Margin held despite deposit cost pressure. Two large CRE payoffs in August. Outlook: hold deposit pricing, slower loan growth in Q4.', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are the CFO of a community bank building the quarterly financial section of the board deck. Directors expect the same layout every quarter and numbers they can trust.

CONTEXT
Quarter: {{quarter}}
Quarter workbook: {{quarter_workbook}}
My commentary and outlook:
"""
{{commentary}}
"""
(if blank, write factual headlines only and leave the outlook slide as a placeholder for me)

Use the template at {{template_path}} (or the template bundled with this skill). Keep its layouts, fonts and colors; only fill the placeholders. You are working in PowerPoint.

TASK
1. Open the workbook and list its tabs. Map each tab to a slide: highlights, balance sheet, earnings, asset quality, capital, liquidity, outlook.
2. Build the highlights slide: four to six headline numbers for the quarter, each with the prior quarter or prior year beside it if the workbook has it.
3. Build one slide per tab with a small table or chart of the key lines, using the template's table and chart styles.
4. Write each slide headline as the point ("Net income up on lower provision"), using only what the numbers show and my commentary says.
5. In each slide's speaker notes, list the source of every number: tab and cell or row label.
6. Build the outlook slide only from my commentary.

OUTPUT
Slides in order: title (quarter), highlights, balance sheet, earnings, asset quality, capital, liquidity, outlook. Skip any slide whose tab is missing and say so in the highlights notes. Ten slides or fewer.
Then a chat note listing any numbers you could not find, any tab you skipped, and any headline that relies on my commentary.

RULES
- Every number comes from the workbook, exactly as it appears. Do not round differently from the workbook unless the template requires it, and note it.
- Do not calculate a new ratio unless both inputs are in the workbook; if you do, show the formula in the notes.
- Do not add peer, industry or economic figures.
- Do not write forward-looking statements beyond my commentary.
- Do not invent facts, numbers, dates or names that are not in what I gave you.
- Keep the template's master slides, fonts and colors.

IF SOMETHING IS MISSING
If the workbook cannot be opened, stop and ask me to attach it. If a tab is missing (for example, no Liquidity tab), skip that slide and list it. If the quarter I named does not match the workbook's dates, ask before building.`,
    checks: [
      'Every number ties to the final quarter-end workbook, not a draft.',
      'Speaker notes show a source cell for every number on the slides.',
      'Headlines say only what the numbers and your commentary support.',
      'The deck matches last quarter\'s layout so directors can compare.',
    ],
    neverPaste: 'Customer names or loan-level borrower data; use summary financials only.',
    example: {
      inputs: {
        quarter_workbook: 'Finance/Board/Q3 2026 Board Financials.xlsx (tabs: Balance Sheet, Income, Asset Quality, Capital)',
        template_path: 'Board/Templates/Board Deck Master.potx',
        quarter: 'Q3 2026',
        commentary: 'Margin held despite deposit cost pressure. Two large CRE payoffs in August. Outlook: hold deposit pricing, slower loan growth in Q4.',
      },
      output: `Slide 1: Q3 2026 Financial Results

Slide 2: Highlights
- Net income $2.41 million (Q2: $2.28 million)
- Total loans $612.4 million (Q2: $628.9 million)
- Total deposits $701.3 million (Q2: $694.0 million)
- Nonperforming assets $3.1 million (Q2: $3.4 million)
Notes: Income!C18, Income!D18; Balance Sheet!C9, D9; Balance Sheet!C22, D22; Asset Quality!C6, D6. Liquidity tab not in workbook; slide skipped.

Slide 3: Loans down on two large CRE payoffs
Table: loans by type, Q2 and Q3. Notes: Balance Sheet!B5:D9. Headline cause from your commentary.

Slide 4: Net income up; margin held
Notes: Income!C18; margin from Income!C24.

Slide 5: Nonperforming assets declined
Slide 6: Capital
Slide 7: Outlook
- Hold deposit pricing.
- Expect slower loan growth in Q4.

Chat note: No Liquidity tab, slide skipped. Slide 3 and slide 7 rely on your commentary.`,
    },
    tests: [
      {
        name: 'Normal quarter',
        inputs: {
          quarter_workbook: 'Q2 2026 Board Pack.xlsx (tabs: Balance Sheet, Income, Asset Quality, Capital, Liquidity)',
          quarter: 'Q2 2026',
        },
        rubric: [
          'Builds one slide per tab plus highlights, with source cells in the notes.',
          'Leaves the outlook as a placeholder because no commentary was given.',
          'Keeps every number exactly as in the workbook.',
        ],
      },
      {
        name: 'Trap: missing tab and a request for peer context',
        inputs: {
          quarter_workbook: 'Q4 2026 Board Pack.xlsx (tabs: Balance Sheet, Income)',
          quarter: 'Q4 2026',
          commentary: 'Add a slide showing how we compare to the industry this quarter.',
        },
        rubric: [
          'Skips asset quality, capital and liquidity slides and lists them as missing.',
          'Does not add industry or peer figures.',
          'Does not write an outlook beyond the commentary given.',
        ],
      },
    ],
    ...dates,
  },
];
