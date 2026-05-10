// AiBI-P Output Gallery — Exemplary AI outputs for each banking role
// These show learners what EXCELLENCE looks like in their department.
// Each example is realistic, banking-specific, and drawn from real skill workflows.

import type { PromptRole, PromptPlatform } from './prompt-library';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OutputQualityMarker {
  readonly heading: string;
  readonly detail: string;
}

export interface OutputExample {
  readonly id: string;
  readonly role: PromptRole;
  readonly title: string;
  readonly platform: PromptPlatform;
  readonly skillUsed?: string;        // skill template name or description
  readonly outputText: string;        // the actual AI output (realistic, full text)
  readonly whatMakesItEffective: readonly OutputQualityMarker[];
  readonly qualityMarkers: readonly string[];  // what the learner should notice
}

// ---------------------------------------------------------------------------
// Platform metadata (reuse color tokens)
// ---------------------------------------------------------------------------

export const OUTPUT_PLATFORM_META: Record<
  PromptPlatform,
  { readonly label: string; readonly colorVar: string }
> = {
  chatgpt:    { label: 'ChatGPT',      colorVar: 'var(--color-sage)' },
  claude:     { label: 'Claude',        colorVar: 'var(--color-cobalt)' },
  copilot:    { label: 'M365 Copilot',  colorVar: 'var(--color-cobalt)' },
  gemini:     { label: 'Gemini',        colorVar: 'var(--color-sage)' },
  notebooklm: { label: 'NotebookLM',   colorVar: 'var(--color-terra)' },
  perplexity: { label: 'Perplexity',    colorVar: 'var(--color-terra)' },
} as const;

export const OUTPUT_ROLE_META: Record<
  PromptRole,
  { readonly label: string; readonly colorVar: string }
> = {
  lending:    { label: 'Lending',    colorVar: 'var(--color-cobalt)' },
  operations: { label: 'Operations', colorVar: 'var(--color-sage)' },
  compliance: { label: 'Compliance', colorVar: 'var(--color-error)' },
  finance:    { label: 'Finance',    colorVar: 'var(--color-amber)' },
  marketing:  { label: 'Marketing',  colorVar: 'var(--color-terra)' },
  it:         { label: 'IT / Executive', colorVar: 'var(--color-ink)' },
  retail:     { label: 'Retail',     colorVar: 'var(--color-sage)' },
  executive:  { label: 'Executive',  colorVar: 'var(--color-ink)' },
} as const;

// ---------------------------------------------------------------------------
// Role filter labels (for gallery UI)
// ---------------------------------------------------------------------------

export const GALLERY_ROLE_OPTIONS: readonly PromptRole[] = [
  'lending',
  'operations',
  'compliance',
  'finance',
  'marketing',
  'it',
];

// ---------------------------------------------------------------------------
// Output Examples — 12 total, 2 per role
// ---------------------------------------------------------------------------

export const OUTPUT_EXAMPLES: readonly OutputExample[] = [

  // -------------------------------------------------------------------------
  // LENDING — Example 1: Loan file completeness checklist
  // -------------------------------------------------------------------------
  {
    id: 'lending-loan-completeness',
    role: 'lending',
    title: 'Loan File Completeness Checklist',
    platform: 'claude',
    skillUsed: 'Loan Pipeline Report Skill (skill-templates/loan-pipeline.md)',
    outputText: `LOAN FILE COMPLETENESS REVIEW
Report Date: [PROVIDE]
Loan Reference: CRE-2026-0441
Assigned Officer: M. Harrington

## Summary

Review of the uploaded application package for CRE-2026-0441 identified 14 of 18 required
documents present. Four items require resolution before the file advances to underwriting.
Total flagged dollar exposure: $2,150,000 (pending appraisal).

---

## Required Documents — Status by Category

### Entity & Ownership (4 of 4 complete)
- [x] Articles of Incorporation / Organization
- [x] Operating Agreement or Bylaws
- [x] Certificate of Good Standing (dated within 90 days)
- [x] EIN Documentation

### Financial Statements (3 of 4 — 1 missing)
- [x] 2024 CPA-Prepared Business Tax Return
- [x] 2023 CPA-Prepared Business Tax Return
- [ ] 2022 Business Tax Return  [MISSING DOCS — REQUEST FROM BORROWER]
- [x] Year-to-date Profit & Loss (prepared within 60 days)

### Personal Financials — Guarantors (2 of 3 — 1 missing)
- [x] Personal Financial Statement — Guarantor 1 (J. Whitfield)
- [x] Personal Tax Returns 2023–2024 — Guarantor 1
- [ ] Personal Financial Statement — Guarantor 2 (R. Whitfield)  [MISSING DOCS — REQUEST FROM BORROWER]

### Property & Collateral (2 of 4 — 2 missing)
- [x] Purchase Agreement / Letter of Intent
- [ ] Appraisal (FIRREA-compliant, ordered)  [PENDING — APPRAISAL ORDER CONFIRMED 04/12/2026]
- [ ] Phase I Environmental Report  [MISSING DOCS — ORDER STATUS UNKNOWN]
- [x] Property Insurance Commitment Letter

### Compliance & Regulatory (3 of 3 complete)
- [x] Flood Zone Determination
- [x] HMDA / LAR Data Collected
- [x] Adverse Action Disclosure (N/A — application in process)

---

## Priority Resolution Items

1. **Phase I Environmental Report** — Status unknown. Confirm whether ordered.
   Contact: Assign to Officer Harrington. Deadline: 04/18/2026.  [MISSING DOCS]

2. **Personal Financial Statement — R. Whitfield (Guarantor 2)** — Not in uploaded package.
   Request from borrower directly. Standard 5-business-day turnaround.  [MISSING DOCS]

3. **2022 Business Tax Return** — Three-year return set required per policy.
   Request from borrower's CPA or directly. Note: extension transcripts accepted.  [MISSING DOCS]

4. **Appraisal** — Order confirmed per email 04/12/2026. Expected completion: 04/25/2026.
   File cannot advance to credit committee without FIRREA-compliant report.  [PENDING]

---

## Recommended Next Step

File is 78% complete. Recommend holding in Processing stage until Items 1–3 are resolved.
Appraisal timeline (Item 4) is on track and does not require borrower action.
Estimated ready-for-underwriting date: 04/22/2026 (dependent on Item 3 turnaround).

[DATA DISCREPANCY — VERIFY SOURCE]: Upload contained two versions of the Purchase Agreement
(dated 03/15/2026 and 04/02/2026). Confirm which version is the executed document.`,
    whatMakesItEffective: [
      {
        heading: 'Actionable, not just informational',
        detail: 'Each missing item includes a named owner, deadline, and next step. The output drives resolution rather than simply listing problems.',
      },
      {
        heading: 'Constraint flags preserved',
        detail: 'The skill\'s [MISSING DOCS] and [DATA DISCREPANCY] flags appear exactly as defined, so the review workflow triggers correctly. No flags were silently omitted.',
      },
      {
        heading: 'No credit determination made',
        detail: 'The output reports completeness only. It does not speculate on approvability, risk rating, or likelihood of approval — exactly as the skill\'s constraints require.',
      },
    ],
    qualityMarkers: [
      'Completion percentage (78%) gives the officer an instant status read without reading every line',
      'Contradictory document versions are flagged rather than silently resolved — the AI noticed an inconsistency in the uploaded data',
      'Regulatory items (FIRREA appraisal, HMDA) are named by their actual regulatory label, not generic terms',
      'Recommended next step is specific and dated, not a generic "follow up"',
    ],
  },

  // -------------------------------------------------------------------------
  // LENDING — Example 2: CRE market research brief
  // -------------------------------------------------------------------------
  {
    id: 'lending-cre-research-brief',
    role: 'lending',
    title: 'CRE Market Research Brief — Retail Strip Centers',
    platform: 'perplexity',
    skillUsed: 'Deep Research (Perplexity — CRE market trends)',
    outputText: `COMMERCIAL REAL ESTATE MARKET BRIEF
Sector: Retail Strip Centers — Midwest Secondary Markets
Prepared: April 2026 | Research tool: Perplexity Deep Research
Intended use: Internal lending decision support — not for distribution

---

## Situation

Community bank lenders evaluating retail strip center loans in Midwest secondary markets
(populations 25,000–150,000) are navigating a two-speed market. Nationally anchored and
grocery-anchored centers are performing; unanchored, apparel-dependent, or single-tenant
strips are under sustained vacancy pressure. This brief summarizes current conditions,
vacancy trends, and cap rate movement relevant to loan underwriting in this segment.

---

## Key Market Indicators (Q1 2026)

| Metric | National Average | Midwest Secondary |
|--------|-----------------|-------------------|
| Vacancy Rate — Grocery-Anchored | 4.2% | 5.1% |
| Vacancy Rate — Unanchored Strip | 11.8% | 14.3% |
| Average Cap Rate — Stabilized | 6.75% | 7.40% |
| Avg. Asking Rent (NNN) — Inline | $18.40/sf | $14.20/sf |
| New Construction Deliveries (12mo) | -38% YoY | -52% YoY |

Sources: CoStar Q1 2026 Retail Report; CBRE Midwest Retail Outlook Q1 2026.
[VERIFY: Confirm figures against most recent CoStar subscriber data before credit committee use.]

---

## Trend Analysis

**Vacancy:** National retail vacancy for neighborhood and community centers stabilized at
6.9% in Q4 2025 (CoStar) following the post-pandemic correction. Midwest secondary markets
lag the coastal recovery by 6–8 quarters, with inline vacancies 200–300 bps higher than
comparable coastal metro submarkets. Grocery-anchored centers are the exception — anchor
retention remains strong, and food/beverage tenants continue absorbing available inline space.

**Cap Rates:** Cap rate expansion appears to be plateauing. Q1 2026 transactions in Midwest
secondary markets cleared at 7.25–7.60% for stabilized product. Value-add and distressed
assets are transacting at 8.50%+ where financed at all. Rising insurance costs (particularly
in flood and hail corridors) are compressing NOI and creating underwriting friction even
for stabilized assets. [RISK FLAG: Insurance cost increases may not be fully reflected in
trailing 12-month income statements provided by borrowers — verify current premium quotes.]

**Tenant Mix Shifts:** National apparel chain closures (2024–2026) have left 18–22% of
inline space in secondary markets with short-term (12 months or less) leases or MTM
occupancy. Medical, dental, and service retail (nail/beauty, alterations) are backfilling
at lower rents. Net effective rent for new leases is 8–12% below expiring leases in
this category.

---

## Underwriting Considerations for This Segment

1. **Lease rollover risk is elevated.** Request full rent roll with expiration schedule.
   Model vacancy stress at 15–20% for unanchored product, 8–10% for grocery-anchored.

2. **Verify anchor lease term.** If the anchor has fewer than 7 years remaining on its
   lease, the risk profile changes substantially and should be flagged at credit committee.

3. **Insurance cost normalization.** Apply current-year premium (not trailing) to NOI
   calculation. Midwest hail corridor properties: add 15–20% haircut to insurance line.

4. **Appraisal lag.** Cap rates in secondary markets have moved 40–60 bps in 18 months.
   Appraisals ordered before Q3 2025 may not reflect current market. Request updated
   appraisal or desk review for files where the original appraisal is older than 9 months.

---

## Sources

- CoStar Retail Market Report Q1 2026 (subscriber required)
- CBRE U.S. Retail Outlook Q1 2026 (public)
- JLL Retail Market Statistics Q4 2025 (public)
- Cushman & Wakefield Midwest Retail MarketBeat Q1 2026 (public)

[All market data requires verification against current institutional data sources before
use in credit decisions. This brief is a research starting point, not a credit opinion.]`,
    whatMakesItEffective: [
      {
        heading: 'Structured for credit committee use',
        detail: 'The brief leads with a Situation section, moves to quantified indicators with a source table, then closes with explicit underwriting action items. It mirrors the format a CLO would expect from a credit analyst.',
      },
      {
        heading: 'Every statistic is sourced',
        detail: 'Each data point references a named publication and quarter. VERIFY flags appear on items that require confirmation before institutional use — the output is honest about its own limitations.',
      },
      {
        heading: 'Risk flags are decision-grade',
        detail: 'The [RISK FLAG] on insurance cost normalization is specific enough to act on: it tells the underwriter what to verify, not just that risk exists.',
      },
    ],
    qualityMarkers: [
      'Midwest secondary markets are distinguished from national averages — the output did not conflate the two',
      'The output avoids a credit determination while still surfacing the data that informs one',
      'VERIFY and RISK FLAG markers are calibrated (not applied to every sentence) — only genuinely uncertain or consequential items are flagged',
      'Tenant mix shift section is granular enough to affect lease rollover stress testing',
    ],
  },

  // -------------------------------------------------------------------------
  // OPERATIONS — Example 1: Meeting summary with action items
  // -------------------------------------------------------------------------
  {
    id: 'operations-meeting-summary',
    role: 'operations',
    title: 'Operations Committee Meeting Summary',
    platform: 'copilot',
    skillUsed: 'M365 Copilot Teams Meeting Recap',
    outputText: `OPERATIONS COMMITTEE — MEETING SUMMARY
Date: April 10, 2026 | Duration: 47 minutes
Attendees: D. Okafor (COO), R. Singh (VP Operations), T. Bellamy (Branch Ops Manager),
           C. Watts (IT), M. Nkrumah (Compliance Liaison), P. Harrington (Treasury Ops)
Quorum: Present | Next meeting: April 24, 2026

---

## Decisions Made

1. **ACH same-day processing window extended to 4:00 PM ET effective May 1, 2026.**
   Motion by: R. Singh. Seconded: T. Bellamy. Approved unanimously.
   IT to update cutoff time in core system configuration and notify branch network by April 21.

2. **Approve vendor contract renewal — Fiserv CheckFree for remote deposit capture.**
   Three-year renewal at current pricing plus 2.8% annual escalator. Legal review complete.
   Motion by: D. Okafor. Approved 4–1. P. Harrington abstained (conflict of interest disclosed).

3. **Defer wire transfer fee schedule review to Q3 2026.**
   Insufficient market data for competitive pricing analysis. Tabled pending fee survey from
   Cornerstone Advisors (expected June 2026).

---

## Action Items

| # | Action | Owner | Due Date | Status |
|---|--------|-------|----------|--------|
| 1 | Update ACH cutoff in core system (FIS Horizon) and test in UAT | C. Watts | Apr 18, 2026 | Open |
| 2 | Communicate ACH window change to commercial deposit customers | T. Bellamy | Apr 21, 2026 | Open |
| 3 | Execute Fiserv CheckFree renewal contract and route to CFO for signature | R. Singh | Apr 14, 2026 | Open |
| 4 | Circulate updated check exception resolution SOP for member review | M. Nkrumah | Apr 17, 2026 | Open |
| 5 | Request wire fee survey from Cornerstone Advisors | D. Okafor | Apr 12, 2026 | Open |

---

## Discussion Summaries

**Item 1 — ACH Same-Day Window:** R. Singh presented data showing 34% of commercial client
ACH submissions arrive between 3:00–4:30 PM. Current 3:00 PM cutoff generates approximately
140 same-day exceptions per month. Extending to 4:00 PM aligns with Fed cutoff and is
operationally feasible per IT. C. Watts confirmed FIS Horizon configuration change requires
4 business days and UAT validation. No additional licensing costs.

**Item 2 — Fiserv Contract Renewal:** P. Harrington disclosed a family member's employment
at Fiserv and recused from the vote. Legal confirmed the 2.8% escalator is within market
range (peer benchmark: 2.5–3.5%). D. Okafor noted that RDC volume increased 22% YoY and
the unit economics remain favorable at current pricing.

**Item 3 — Wire Fee Deferral:** M. Nkrumah noted that three competitors in the market
reduced wire fees in Q4 2025. D. Okafor agreed a fee survey is the right next step before
any pricing decision. Tabled without prejudice.

---

## Parking Lot (Items for Future Agenda)

- Fraud detection threshold review (raised by M. Nkrumah — refer to July agenda)
- Branch cash ordering optimization study (T. Bellamy — Q2 project proposal due May 15)

---

*This summary was generated from meeting transcript. Decisions and action items are accurate
to the transcript record. Confirm with D. Okafor before distributing externally.*`,
    whatMakesItEffective: [
      {
        heading: 'Decisions separated from discussion',
        detail: 'The three decisions are clearly numbered and distinguished from the discussion summaries below. A reader who only has 2 minutes can read the decisions table and action items and have everything they need.',
      },
      {
        heading: 'Conflict of interest documented',
        detail: 'P. Harrington\'s recusal is noted in the decision record and the discussion summary. Copilot surfaced this from the meeting transcript rather than glossing over it. This matters for governance.',
      },
      {
        heading: 'Action items are unambiguous',
        detail: 'Every action item has a named owner, a specific due date, and a clear deliverable. There are no vague entries like "follow up on Fiserv." The owner column makes accountability explicit.',
      },
    ],
    qualityMarkers: [
      'Vote counts are recorded (4-1, not just "approved") — important for governance documentation',
      'The parking lot section captures items raised but not acted on, preventing them from being lost',
      'Quantified context in discussion summaries (34% submission rate, 140 exceptions/month) makes the rationale reviewable',
      'The closing disclaimer is honest: generated from transcript, confirm before external distribution',
    ],
  },

  // -------------------------------------------------------------------------
  // OPERATIONS — Example 2: Exception report analysis
  // -------------------------------------------------------------------------
  {
    id: 'operations-exception-report',
    role: 'operations',
    title: 'Daily Exception Report — April 10, 2026',
    platform: 'claude',
    skillUsed: 'Exception Report Skill (skill-templates/exception-report.md)',
    outputText: `DAILY EXCEPTION REPORT
Institution: First Community Bank & Trust
Processing Date: April 10, 2026 | Report Generated: 4:47 PM ET
Report Owner: R. Singh, VP Operations

---

## Exception Summary

| Category | Count | Dollar Volume | Change vs. Prior Day |
|----------|-------|---------------|---------------------|
| ACH Returns | 12 | $18,340 | +3 |
| Check Exceptions | 7 | $4,210 | -2 |
| NSF / Overdraft | 31 | $41,870 | +8 |
| Wire Exceptions | 1 | $125,000 | +1 |
| Balancing Differences | 2 | $380 | 0 |
| Other | 1 | — | — |
| **Total** | **54** | **$189,800** | **+10** |

---

## Priority Items — Same-Day Resolution Required

1. **Wire Exception — XXXX-7742**
   Type: Incoming wire received 3:12 PM; beneficiary account closed as of 04/01/2026.
   Amount: $125,000.00 | Return deadline: 5:00 PM ET today.
   Owner: P. Harrington, Treasury Ops.  [SAME-DAY REQUIRED]

2. **ACH Return — XXXX-3381** (R09 — Uncollected Funds)
   Amount: $14,200.00 | Second R09 return in 30 days for this account.
   Originator: Payroll Services Group LLC.
   Owner: ACH Operations Desk.  [SAME-DAY REQUIRED] [RECURRING — ESCALATE]

3. **Balancing Difference — Branch 04 (Lakeview)**
   Out-of-balance: $280.00 (over). Branch reported at 3:45 PM; cause unresolved.
   Owner: T. Bellamy (contact Branch 04 Manager directly).  [SAME-DAY REQUIRED]

4. **NSF — XXXX-9914** (Cash Activity)
   Amount: $8,750.00. Third NSF in 7 days on this account. Cash-intensive pattern noted.
   Owner: Deposit Operations.  [SAME-DAY REQUIRED] [BSA REVIEW — DO NOT RESOLVE WITHOUT COMPLIANCE]

---

## Standard Items — Resolve Within 2 Business Days

**ACH Returns (11 items, $4,140 total)**
- 8× R01 (Insufficient Funds): Routine. Total $2,890. Debit accounts per standard workflow.
- 2× R02 (Account Closed): Accounts XXXX-4421, XXXX-6603. Notify originators.
- 1× R03 (No Account): XXXX-8801. Originator notification required. Verify routing.

**Check Exceptions (7 items, $4,210 total)**
- 4× Encoding Errors: Totaling $1,840. Correction entries in process.
- 2× Missing Endorsements: Items returned to branches 02 and 07.
- 1× Stale Date (item dated 10/14/2024): XXXX-5590, $1,100. Request customer authorization.

**NSF / Overdraft (30 standard items, $33,120 total)**
All within standard courtesy pay limits. Batch process via ODP workflow. Notification letters
queued for 56 accounts.

---

## Recurrence Flags

- **XXXX-3381** — R09 ACH return for the second time in 30 days (same originator).
  [RECURRING — ESCALATE] Recommend Originator Review: consider addendum agreement.

- **NSF / Overdraft category** — Third consecutive day with NSF count above 28.
  [RECURRING — ESCALATE] Suggest COO review of ODP utilization trend.

---

## Resolved Since Last Report

- Wire Exception XXXX-6102 ($47,000 — originated 04/09): Confirmed posted correctly.
  Mismatch was input error on beneficiary reference field. Resolved 10:15 AM.
- Branch 03 balancing difference ($115.00): Identified as teller drawer count error. Corrected 9:40 AM.`,
    whatMakesItEffective: [
      {
        heading: 'Priority items are ranked by urgency and dollar impact',
        detail: 'The $125,000 wire exception with a hard 5:00 PM deadline appears first. The BSA-flagged NSF appears fourth — still same-day, but the regulatory flag elevates its importance beyond dollar amount alone.',
      },
      {
        heading: 'BSA flag is applied precisely, not broadly',
        detail: 'Only one item receives a BSA REVIEW flag, and it\'s justified: third NSF in 7 days with cash-intensive pattern. The skill constraint (never flag without cause) is respected — routine NSFs are processed normally.',
      },
      {
        heading: 'Recurrence logic surfaces management signals',
        detail: 'The third-consecutive-day NSF trend is flagged as a category-level pattern, not just an individual account issue. This is the kind of signal a manager needs to see but that raw data alone won\'t surface.',
      },
    ],
    qualityMarkers: [
      'Summary table uses "Change vs. Prior Day" — gives the supervisor trend information without needing to pull yesterday\'s report',
      'Wire return deadline (5:00 PM ET) is stated explicitly — not left for the assignee to look up',
      'Account numbers are masked throughout (XXXX-XXXX) — the skill constraint on data privacy is honored without exception',
      '"Resolved Since Last Report" section closes the loop on yesterday\'s open items without re-opening them as new exceptions',
    ],
  },

  // -------------------------------------------------------------------------
  // COMPLIANCE — Example 1: SAR narrative draft
  // -------------------------------------------------------------------------
  {
    id: 'compliance-sar-narrative',
    role: 'compliance',
    title: 'SAR Narrative Draft — Structuring Pattern',
    platform: 'claude',
    skillUsed: 'BSA/SAR Drafting Skill',
    outputText: `SAR NARRATIVE DRAFT — FOR BSA OFFICER REVIEW ONLY
DO NOT FILE WITHOUT BSA OFFICER VERIFICATION OF ALL [VERIFY] FLAGS
Prepared: April 10, 2026 | Reviewer: [BSA OFFICER NAME REQUIRED]
FinCEN SAR Field 38 — Narrative

---

NARRATIVE

On [VERIFY: confirm date range from transaction data], First Community Bank & Trust identified
a pattern of structured cash deposits in amounts consistently below $10,000 at multiple
branch locations, conducted by or on behalf of account holder [VERIFY: confirm legal name
from CIP documentation — do not use nickname or alias] (Account XXXX-[VERIFY: last 4 digits]).

The activity subject to this report spans [VERIFY: confirm date range] and involves
[VERIFY: confirm total transaction count] cash deposits totaling approximately
[VERIFY: confirm exact aggregate amount from transaction records]. Individual transaction
amounts ranged from $[VERIFY] to $[VERIFY], with no single transaction reaching the
$10,000 CTR threshold.

The structuring pattern was identified during routine transaction monitoring when the
institution's automated monitoring system generated an alert on [VERIFY: alert date] for
activity matching Rule [VERIFY: confirm rule ID from monitoring system]. A manual review
of transaction history conducted by [VERIFY: reviewer name and title] on [VERIFY: review date]
confirmed [VERIFY: number] transactions distributed across [VERIFY: number] branch locations
over the [VERIFY]-day reporting period.

The subject [VERIFY: confirm relationship — customer, authorized signatory, beneficial owner]
holds a [VERIFY: account type] account opened [VERIFY: account opening date] and listed
occupation as [VERIFY: occupation from CIP]. Business purpose stated at account opening:
[VERIFY: stated purpose from account opening documentation]. The transaction activity is
[inconsistent with / consistent with — VERIFY AND SELECT] the stated account purpose.

There is no known explanation for the structuring pattern. [VERIFY: document any contact
with customer or attempts to obtain explanation — include dates and outcomes. If no contact
was made, note that and confirm whether contact is appropriate given SAR filing sensitivity.]

Law enforcement has [not been / has been — VERIFY] notified. [If notified, add: Agency:
[name]. Contact: [name, date, case reference if provided].]

---

[SAR DRAFT GUIDANCE FOR BSA OFFICER]

This draft narrative was generated from the transaction data summary you provided. Before
filing, you must:

1. Replace every [VERIFY] flag with confirmed data from source systems.
2. Confirm the legal name from CIP — never use data from the transaction description field.
3. Review the narrative for any inadvertent disclosure of SAR filing to the subject.
   SAR confidentiality (31 USC 5318(g)(2)) prohibits disclosing a SAR to any person involved
   in the transaction. Do not retain this draft anywhere accessible to front-line staff.
4. Confirm the narrative is complete and accurate before submission — FinCEN guidance requires
   that the narrative describe the suspicious activity in sufficient detail for a law enforcement
   reader unfamiliar with the institution.
5. This draft does not constitute a legal opinion or compliance determination.
   Final filing responsibility rests with the institution's BSA Officer.`,
    whatMakesItEffective: [
      {
        heading: '[VERIFY] flags are placed at every data point requiring human confirmation',
        detail: 'The AI did not guess at names, dates, or dollar amounts. Every factual item that must come from source systems — not the prompt — is marked for BSA Officer verification. This is intentional and correct.',
      },
      {
        heading: 'SAR confidentiality warning is stated explicitly',
        detail: 'The output reminds the BSA Officer of 31 USC 5318(g)(2) without being asked. It also flags the access control risk: this draft should not be accessible to front-line staff. These are real compliance obligations, not boilerplate.',
      },
      {
        heading: 'The narrative structure follows FinCEN\'s guidance',
        detail: 'Who, what, when, where, why (unknown), and law enforcement status are all addressed in the correct order. A FinCEN reviewer can follow the narrative without hunting for information.',
      },
    ],
    qualityMarkers: [
      'The output header states clearly it is a draft requiring BSA Officer review — it does not look like a finalized document',
      'The skill did not make a SAR filing recommendation — it produced a narrative draft. The filing decision belongs to the BSA Officer',
      'Legal citation (31 USC 5318(g)(2)) is accurate and specific — not a vague reference to "bank secrecy rules"',
      'The guidance section at the bottom is numbered and actionable — it is a checklist, not a disclaimer',
    ],
  },

  // -------------------------------------------------------------------------
  // COMPLIANCE — Example 2: Regulatory change impact brief
  // -------------------------------------------------------------------------
  {
    id: 'compliance-regulatory-impact-brief',
    role: 'compliance',
    title: 'Regulatory Change Impact Brief — CFPB BNPL Guidance',
    platform: 'perplexity',
    skillUsed: 'Regulatory Research (Perplexity — new CFPB guidance)',
    outputText: `REGULATORY CHANGE IMPACT BRIEF
Topic: CFPB Interpretive Rule — Buy Now, Pay Later as Credit Cards
Issued: [VERIFY — confirm publication date from Federal Register]
Effective Date: [VERIFY — confirm from rule text]
Prepared: April 2026 | Prepared by: Compliance Department
Distribution: CLO, CCO, Retail Banking Director, Legal

---

## Situation

The CFPB issued an interpretive rule characterizing certain Buy Now, Pay Later (BNPL)
products as credit cards under the Truth in Lending Act (TILA) and Regulation Z. For
community banks that offer BNPL products, partner with BNPL fintechs, or have customers
using BNPL at point of sale, this guidance has operational and compliance implications
that require evaluation before the effective date.

[VERIFY: Confirm current CFPB enforcement posture under current administration — agency
guidance may be subject to revision or non-enforcement. Consult legal counsel before
relying on this brief for compliance program changes.]

---

## Key Provisions (As Reported)

1. **BNPL as Open-End Credit**: The rule interprets "digital user accounts" that can be
   used to access BNPL credit as credit cards under Regulation Z. This triggers Reg Z
   open-end credit disclosures for covered products.

2. **Required Protections**: Covered BNPL providers must provide:
   - Periodic billing statements
   - 21-day payment due date before late fees
   - Billing dispute rights under Reg Z
   - Ability to decline payment on returned merchandise

3. **Institution Applicability**: The rule primarily targets BNPL lenders. Community banks
   with referral arrangements or co-branded programs with BNPL providers should review
   whether any product triggers the rule.

---

## Preliminary Impact Assessment — First Community Bank & Trust

| Area | Current Exposure | Action Required | Owner |
|------|-----------------|----------------|-------|
| Proprietary BNPL product | [VERIFY — does institution offer one?] | TBD | CLO |
| BNPL partner referral program | [VERIFY — active partnerships?] | Contract review | CLO + Legal |
| Customer BNPL usage (credit reporting) | Indirect — none | Monitor | Compliance |
| Staff training (TILA/Reg Z obligations) | Low — no direct product | Awareness only | Training |

---

## Recommended Next Steps

1. **Confirm product inventory** (by April 18): Confirm whether the institution offers any
   product that meets the rule's definition of a covered digital user account. Assign to CLO.

2. **Review fintech partner agreements** (by April 25): If any BNPL referral or co-branding
   arrangement exists, legal should confirm whether the contract allocates Reg Z compliance
   responsibility appropriately.

3. **Monitor CFPB guidance status** (ongoing): Given current regulatory environment, confirm
   whether the rule is effective, under review, or subject to litigation stay before making
   compliance program investments. [VERIFY with legal counsel.]

4. **No immediate customer communication needed** based on preliminary review.

---

## Sources

- CFPB Interpretive Rule on BNPL (Federal Register — [VERIFY exact citation])
- American Bankers Association BNPL Compliance Bulletin (2024, public)
- Ballard Spahr CFPB Monitor (accessed April 2026)

[This brief is for internal compliance planning purposes only. It is not legal advice.
Confirm all regulatory citations and applicability with legal counsel before implementing
any compliance program changes.]`,
    whatMakesItEffective: [
      {
        heading: 'Impact table distinguishes what applies from what does not',
        detail: 'The output does not treat every regulatory change as urgent for every institution. Rows with low or indirect exposure are still listed, but marked clearly. The CLO can scan the table and immediately identify where action is needed.',
      },
      {
        heading: 'VERIFY flags reflect genuine uncertainty about the regulatory environment',
        detail: 'The note about the current administration\'s CFPB enforcement posture is not hedging — it is a real compliance consideration. The AI surfaced the uncertainty rather than presenting the guidance as settled.',
      },
      {
        heading: 'Recommended next steps have named owners and deadlines',
        detail: 'The output moves immediately from analysis to action. Every recommended step is specific enough to assign to a calendar without further interpretation.',
      },
    ],
    qualityMarkers: [
      'The situation statement tells the reader who is affected and why it matters before diving into provisions',
      'Sources are named (not just "CFPB guidance") — a compliance officer can verify each citation',
      'The disclaimer at the end is honest about the document\'s limits: planning tool, not legal advice',
      'The rule\'s key provisions are explained in plain language, not regulatory jargon lifted verbatim',
    ],
  },

  // -------------------------------------------------------------------------
  // FINANCE — Example 1: Budget vs. actual variance analysis
  // -------------------------------------------------------------------------
  {
    id: 'finance-budget-variance-narrative',
    role: 'finance',
    title: 'Q1 2026 Budget vs. Actual Variance Narrative',
    platform: 'claude',
    skillUsed: 'File upload — Q1 financial data (income statement, budget file)',
    outputText: `Q1 2026 BUDGET VERSUS ACTUAL ANALYSIS
First Community Bank & Trust
Quarter Ended March 31, 2026
Prepared by: Finance Department | Distribution: CFO, CEO, Board Finance Committee

---

## Executive Summary

First Community Bank & Trust finished Q1 2026 with net income of $1.84 million,
$127,000 (7.4%) above budget and $203,000 (12.4%) above Q1 2025. The favorable variance
was driven primarily by stronger-than-projected net interest income on the loan portfolio,
partially offset by higher-than-budgeted non-interest expense driven by two unplanned
technology items. Efficiency ratio came in at 64.2% versus the 65.8% budget — the institution
is tracking ahead of the full-year improvement target.

---

## Net Interest Income

Net interest income of $3.62 million exceeded budget by $184,000 (5.4%).

**Drivers:**
- Loan portfolio yield expanded 18 basis points above forecast as Q4 2025 variable-rate
  commercial loan originations priced at or above the SOFR floor assumption in the budget.
- Deposit repricing ran below budget: average rate paid on interest-bearing deposits was
  2.41% versus 2.58% budgeted, contributing $67,000 of favorable variance.
- Average loan balances came in $2.1 million above budget, adding approximately $42,000
  to interest income at the budgeted yield.

**Risk to Sustain:** The favorable deposit repricing is partially attributable to a January
CD maturity cycle that has not yet rolled into higher-rate renewals. Finance expects 40–60 bps
of pressure on Q2 deposit costs as approximately $18.2 million in CDs mature and reprice.
Q2 NIM guidance should reflect this drag.

---

## Non-Interest Income

Non-interest income of $612,000 was $28,000 (4.4%) below budget.

Service charge revenue ran $31,000 below budget as consumer account activity was lower than
modeled in January. Mortgage origination fee income of $94,000 was $12,000 above budget on
higher-than-projected refinance volume in March. Interchange income tracked within $3,000
of budget for the quarter.

---

## Non-Interest Expense

Non-interest expense of $2.79 million was $85,000 (3.1%) above budget.

Two items account for the variance:
1. **Core system upgrade (unbudgeted):** $47,000 one-time professional services fee from FIS
   related to the ACH cutoff extension approved by the Operations Committee in Q1. Classified
   as technology expense — not capitalized per accounting policy.
2. **Health insurance true-up:** $38,000 above budget following renewal pricing received in
   February. CFO approved absorption in Q1; 2027 budget cycle will reflect updated premium.

Personnel expense, occupancy, and all other expense lines were within 1.5% of budget.

---

## Efficiency Ratio

| Metric | Q1 2026 Actual | Q1 2026 Budget | Q1 2025 Actual | Full-Year Target |
|--------|---------------|----------------|----------------|-----------------|
| Efficiency Ratio | 64.2% | 65.8% | 67.1% | 64.0% |

The institution is 1.6 points ahead of Q1 budget and tracking closely with the full-year
64.0% target. To sustain this trajectory through Q2, non-interest expense growth must remain
below 4% annualized while NII is partially compressed by the CD repricing cycle.

---

## Q2 2026 Outlook

Based on Q1 actuals and known Q2 events:
- NII: Slight compression expected (CD repricing, see above). Finance projects NII of
  $3.44–$3.55 million, approximately flat to $180,000 below Q1.
- Non-interest expense: No further unbudgeted items identified. On track to return to
  budget run rate.
- Net income guidance: $1.70–$1.80 million (below Q1 on NII compression, above budget).

[VERIFY all figures against GL before distribution to board or external parties.]`,
    whatMakesItEffective: [
      {
        heading: 'Variance is explained, not just reported',
        detail: 'The non-interest expense section does not just say "85K over budget" — it identifies the two specific items, the dollar amount of each, and why each one occurred. A CFO can answer any board question from this narrative.',
      },
      {
        heading: 'Forward-looking risk is surfaced in the body',
        detail: 'The CD repricing risk in Q2 is flagged within the NII section, not buried in a footnote. It is quantified ($18.2M in maturities, 40–60 bps of pressure) and the guidance implication is stated directly.',
      },
      {
        heading: 'The efficiency ratio table enables trend comparison in one view',
        detail: 'Q1 actual, Q1 budget, Q1 prior year, and full-year target appear in one row. A board member can see at a glance that the institution is on track without reading the full narrative.',
      },
    ],
    qualityMarkers: [
      'The executive summary states the bottom line in the first sentence — no burying the lead',
      'All numbers in the narrative are labeled: "$184,000 (5.4%)" not just "$184K favorable"',
      'Q2 outlook uses a range, not a point estimate — appropriately honest about forecast uncertainty',
      'VERIFY flag at the end: the AI correctly notes this is a draft to be confirmed against GL before board distribution',
    ],
  },

  // -------------------------------------------------------------------------
  // FINANCE — Example 2: Board memo — efficiency ratio analysis
  // -------------------------------------------------------------------------
  {
    id: 'finance-board-memo-efficiency',
    role: 'finance',
    title: 'Board Memo — Efficiency Ratio Analysis',
    platform: 'claude',
    skillUsed: 'Executive Briefing Skill (skill-templates/executive-briefing.md)',
    outputText: `MEMORANDUM
To: Board of Directors — Finance Committee
From: Chief Financial Officer
Date: April 15, 2026
Re: Efficiency Ratio — Q1 2026 Performance and 2026 Improvement Trajectory

---

## Situation

First Community Bank & Trust's efficiency ratio of 64.2% in Q1 2026 is the strongest
quarterly result in three years and positions the institution favorably relative to the
community bank peer median of approximately 65% (FDIC CEIC data, 1992–2025 trend).
The full-year 64.0% target is within reach but carries execution risk in Q2 and Q3
as deposit costs reprice. The Board should be aware of the key variables that will
determine whether we close the year at or below target.

---

## Five Key Data Points

1. **64.2% Q1 efficiency ratio vs. 65.8% budget** — 160 basis point favorable variance driven
   by stronger NIM and controlled expense. Implication: Q1 outperformance provides buffer
   against expected Q2 compression.

2. **CD repricing cycle: $18.2M maturing Q2** — These CDs were acquired at 2024 rates and will
   renew at current market rates (estimated 4.25–4.60%). Implication: 40–60 bps NIM headwind
   in Q2 that was not fully modeled in the original 2026 budget.

3. **Non-interest expense: two unbudgeted items totaling $85K in Q1** — Technology ($47K) and
   health insurance true-up ($38K). Both are identifiable, non-recurring. Implication: Q2
   expense run rate returns to budget; these items do not represent a structural cost increase.

4. **Personnel expense: within 1.5% of budget all of Q1** — Headcount plan is on track.
   Implication: No staffing variance risk to 2026 efficiency target as currently structured.

5. **Community bank peer median ~65% (FDIC); industry-wide ~55.7% (Q4 2024 FDIC QPB)** —
   The institution is at the community bank median and 8+ points above the industry-wide
   figure. Implication: Path to continued improvement runs through revenue growth, not
   expense reduction alone.

---

## Recommendation

Management recommends the Board note Q1 performance as on-track and approve the following:

1. **Accept Q2 NII compression as anticipated** — No budget amendment needed. Finance will
   update full-year guidance at the May Board meeting with Q2 actuals.

2. **No supplemental efficiency program for 2026** — The Q1 unbudgeted items are resolved.
   Initiating a cost reduction program now would create unnecessary disruption given
   current trajectory.

3. **Authorize management to monitor CD pricing strategy** — If Q2 deposit cost pressure
   exceeds 60 bps, Finance will present a CD pricing recommendation to the Finance
   Committee before the June Board meeting.

---

## Risk Considerations

[RISK FLAG] If the Fed funds rate increases unexpectedly in Q2 or Q3, the CD repricing
impact could exceed the 40–60 bps range modeled above, increasing pressure on NIM
and the efficiency ratio.

Reputational note: The institution's efficiency ratio improvement story is credible and
documented. However, attributing peer comparisons to FDIC data is appropriate; avoid
referencing rankings or surveys without sourced data in any external communications.

This memo does not require board notification under current policy. Items requiring
formal board action are noted under Recommendation above.`,
    whatMakesItEffective: [
      {
        heading: 'Structured exactly to the executive briefing skill format',
        detail: 'The output follows the skill\'s four-part structure: Situation, Five Key Data Points, Recommendations with owner assignments, and Risk Considerations. A board reader immediately knows what to expect and where to find each type of information.',
      },
      {
        heading: 'Statistics are sourced in-line',
        detail: 'The community bank peer median is cited as "FDIC CEIC data, 1992–2025 trend" and the industry-wide figure references the FDIC QPB Q4 2024 specifically. These match the approved sources in CLAUDE.md exactly — no unsourced statistics.',
      },
      {
        heading: 'RISK FLAG is applied to a specific, quantified scenario',
        detail: 'The risk flag is not "interest rate risk" in the abstract — it is a specific condition (Fed funds increase) with a specific consequence (exceeds 60 bps threshold) triggering a specific action (pricing recommendation to Finance Committee).',
      },
    ],
    qualityMarkers: [
      'The memo header (To, From, Date, Re) is formatted as a board-quality document, not an email',
      'Recommendations are numbered and include the implicit decision for the board: "no budget amendment" and "no supplemental efficiency program" are decisions, not just suggestions',
      'Board notification determination is stated explicitly at the end — the CFO has done the work of assessing materiality',
      'The reputational note about external communications is proactive governance guidance, not requested but relevant',
    ],
  },

  // -------------------------------------------------------------------------
  // MARKETING — Example 1: Product launch email campaign
  // -------------------------------------------------------------------------
  {
    id: 'marketing-product-launch-email',
    role: 'marketing',
    title: 'Home Equity Line of Credit — Product Launch Email Campaign',
    platform: 'chatgpt',
    skillUsed: 'Campaign Content Skill with institutional brand voice',
    outputText: `HELOC PRODUCT LAUNCH — EMAIL CAMPAIGN COPY
Product: Home Equity Line of Credit | Launch Date: May 1, 2026
Audience: Existing mortgage customers (home equity > $50,000, no current HELOC)
Platform: Core email system | Review status: Compliance review required before send

---

## Email 1 of 3 — Awareness (Send: April 22, 2026)

Subject line: Your home has more value than you think
Preview text: You've built equity. Here's how to put it to work.

---

[Bank Name] — Your Community Bank Since [Year]

You've spent years building equity in your home. Now there's a flexible way to put that
value to work — for the projects, expenses, and opportunities that matter most to you.

Introducing our new Home Equity Line of Credit.

Borrow what you need, when you need it. Repay on your schedule. And because it's secured
by the equity you've already built, your rate may be substantially lower than other options.

**What a HELOC works well for:**
- Home improvements that increase your property value
- Education expenses
- Consolidating higher-rate debt
- A financial safety net for unexpected costs

Your neighbors at [Bank Name] are here to answer questions — no commitment required.

[Learn More About Our HELOC]

[Bank Name] | [Address] | NMLS #[NUMBER]
This is not a commitment to lend. All loans subject to credit approval.
Equal Housing Lender.

---

## Email 2 of 3 — Education (Send: April 29, 2026)

Subject line: HELOC vs. home equity loan — what's the difference?
Preview text: One is a line. One is a lump sum. Here's when each makes sense.

---

Not sure which home equity option is right for you? That's a common question.

Here's a plain-English comparison:

**Home Equity Line of Credit (HELOC)**
- Draw funds as needed, up to your credit limit
- Pay interest only on what you borrow
- Variable rate — may change with the market
- Best for: ongoing projects, flexible needs, financial safety nets

**Home Equity Loan**
- Receive a lump sum at closing
- Fixed rate, fixed monthly payment
- Predictable repayment schedule
- Best for: one-time expenses, debt consolidation with a known amount

Both options are secured by your home, which means lower rates than unsecured borrowing.
Both require you to have equity built up — and both come with real obligations.

Our lenders are happy to walk you through the numbers at no cost or commitment to you.

[Schedule a Conversation]     [Learn More]

[Bank Name] | [Address] | NMLS #[NUMBER]
This is not a commitment to lend. All loans subject to credit approval.
Equal Housing Lender.

---

## Email 3 of 3 — Conversion (Send: May 6, 2026)

Subject line: Ready to apply? Here's what you'll need.
Preview text: It takes about 15 minutes to start.

---

If you've been thinking about a Home Equity Line of Credit, this is a good time to start.

Here's what you'll need to apply:

- Your most recent mortgage statement
- Proof of homeowners insurance
- Two years of tax returns (or W-2s)
- Recent pay stubs (if employed)
- A rough estimate of your home's current value

Most customers complete the initial application in about 15 minutes. From there, we'll
handle the appraisal and title work — you'll hear from us within [VERIFY: confirm standard
turnaround] business days with a decision.

Questions? Call us at [phone] or stop by any branch.

[Start Your Application]

[Bank Name] | [Address] | NMLS #[NUMBER]
This is not a commitment to lend. All loans subject to credit approval.
Equal Housing Lender. Member FDIC.

---

[CAMPAIGN NOTES FOR COMPLIANCE REVIEW]
- All three emails include required NMLS disclosure and Equal Housing Lender language.
- No rate or APR quoted — no Reg Z triggered disclosures required in awareness phase.
- "May be substantially lower" in Email 1 avoids a rate claim; confirm with compliance.
- VERIFY placeholder on turnaround time in Email 3 — must be confirmed before send.
- Audience segmentation (existing mortgage customers) reduces CAN-SPAM opt-out risk.`,
    whatMakesItEffective: [
      {
        heading: 'Three-email arc is sequenced correctly',
        detail: 'Awareness leads with the customer\'s benefit (your equity), not the product. Education builds the case before asking for action. Conversion removes friction (what you\'ll need) rather than adding urgency. Each email has one job.',
      },
      {
        heading: 'Regulatory disclosures are included without being asked',
        detail: 'NMLS number placeholders, Equal Housing Lender, Member FDIC, and "not a commitment to lend" appear in every email. The compliance notes flag which items require legal review before send.',
      },
      {
        heading: 'No rate claims in the awareness email',
        detail: '"May be substantially lower" avoids triggering Regulation Z triggered-terms disclosure requirements while still conveying rate advantage. This is a deliberate compliance-aware word choice, not a hedge.',
      },
    ],
    qualityMarkers: [
      'Subject lines are functional (specific, testable) not clever — "Your home has more value than you think" works better than a pun for a community bank audience',
      'VERIFY flag on turnaround time prevents a compliance problem: a stated timeline becomes a promise',
      'Compliance notes at the end are written for the compliance officer, not the marketer — they identify what to check and why',
      'Plain-English comparison table in Email 2 treats the reader as intelligent without using jargon',
    ],
  },

  // -------------------------------------------------------------------------
  // MARKETING — Example 2: Social media content calendar
  // -------------------------------------------------------------------------
  {
    id: 'marketing-social-media-calendar',
    role: 'marketing',
    title: 'May 2026 Social Media Content Calendar',
    platform: 'chatgpt',
    skillUsed: 'Content Planning Skill — social media calendar',
    outputText: `MAY 2026 SOCIAL MEDIA CONTENT CALENDAR
Institution: First Community Bank & Trust
Platforms: LinkedIn, Facebook, Instagram
Compliance review required before publishing. Rate and product claims must be approved.
Generated: April 10, 2026

---

## Content Themes — May 2026

| Theme | Posts | Platforms |
|-------|-------|-----------|
| Financial literacy (Money Smart Month extension) | 5 | LinkedIn, Facebook |
| HELOC launch support | 4 | Facebook, Instagram, LinkedIn |
| Community spotlight | 4 | Facebook, Instagram |
| Team and culture | 3 | LinkedIn, Instagram |
| General banking tips | 3 | All |

---

## Week 1 (April 28 – May 2)

**Monday 4/28 — LinkedIn / Facebook**
Type: Educational
Copy: Most home improvement projects start with a budget. But budgets shift. A HELOC
gives you a flexible line of credit backed by your home equity — draw what you need,
when you need it. We're launching ours May 1. Learn more: [link]
Visual: Photo of home exterior with natural light. No stock photo.
Compliance flag: "Flexible line of credit backed by your home equity" — confirm no rate
claim triggered. No APR stated.

**Wednesday 4/30 — Instagram / Facebook**
Type: Community
Copy: Meet [NAME], Branch Manager at our [Location] branch for 14 years. What keeps
her here? "Watching our customers go from their first checking account to buying a home."
[Ask branch manager to provide a two-sentence quote for final copy.]
Visual: Candid photo at branch — not posed. Natural lighting.
Compliance flag: None — no product or rate content.

**Friday 5/2 — LinkedIn**
Type: Financial literacy
Copy: FDIC research shows community bank customers trust their local institution for
major financial decisions — and that trust is built transaction by transaction.
We're proud to be your community bank.
Visual: FDIC source graphic with logo and citation.
Compliance flag: Confirm FDIC statistic exact wording before post.

---

## Week 2 (May 5 – May 9) — HELOC Launch Week

**Monday 5/5 — All platforms**
Type: Product launch
Copy: Our Home Equity Line of Credit is now open. If you own your home and you've
built equity, this may be the most flexible borrowing option you haven't used.
[Start Here: link]
Visual: Clean product card — no imagery of people. Brand colors only.
Compliance flag: [LEGAL REVIEW — rate and product claim. Confirm NMLS displayed
in caption or link-out page.]

**Wednesday 5/7 — Facebook / Instagram**
Type: FAQ
Copy: Common question we're hearing: "What can I use a HELOC for?"
The short answer: almost anything. Home improvements, education, consolidating
higher-rate debt, or just a safety net. The longer answer is in the link below.
Visual: Simple Q&A text card, brand colors.
Compliance flag: "Almost anything" — confirm compliant with product use restrictions.

**Friday 5/9 — LinkedIn**
Type: Team
Copy: Our lenders completed training on our new Home Equity Line of Credit product
this week. If you have questions, they have answers. No pressure, no obligation.
[Schedule a conversation: Calendly link]
Visual: Team photo at training session (with permissions confirmed).
Compliance flag: None — no product terms stated.

---

## Week 3 (May 12 – May 16)

**Tuesday 5/13 — Facebook / Instagram**
Type: Community spotlight
Copy: [Community partner name] has served [city] families for [X] years.
We're proud to be their banking partner. [Partner quote if available.]
Visual: Photo at partner location (with permission).
Compliance flag: Confirm partner has approved use of their name and image.

**Thursday 5/15 — All platforms**
Type: Financial literacy
Copy: The difference between a rate and an APR: Your interest rate is the cost of
borrowing. The APR includes fees, so it's the more complete comparison number.
Always ask for the APR when comparing loan offers.
Visual: Side-by-side graphic: Rate vs. APR, plain language.
Compliance flag: Educational content — confirm no specific product rates implied.

---

## Week 4 (May 19 – May 23)

**Monday 5/19 — LinkedIn / Facebook**
Type: Financial literacy
Copy: 5 questions to ask before you take on debt:
1. What is the APR?
2. What is the monthly payment?
3. What happens if I pay it off early?
4. Is the rate fixed or variable?
5. What is the total cost over the life of the loan?
Visual: Numbered list graphic, branded.
Compliance flag: None.

**Wednesday 5/21 — Instagram / Facebook**
Type: Community
Copy: Congratulations to [Small Business Name], celebrating [X] years in [city].
We've been proud to grow alongside them. [Photo with owners if available.]
Visual: Business exterior or owners. Permissions required.
Compliance flag: Confirm customer approved public mention.

**Friday 5/23 — LinkedIn**
Type: Culture
Copy: We believe banking should be straightforward. No surprises, no runaround.
That's what community banking means to us.
Visual: Branch interior, natural light. No stock.
Compliance flag: Brand/values content — confirm tone aligns with brand standards.

---

[NOTES FOR COMPLIANCE AND MARKETING REVIEW]
- All posts with rate or product content flagged individually — do not publish without sign-off.
- Customer and partner names are placeholders — confirm written permission before use.
- HELOC launch content (Week 2) requires pre-approval before Monday 5/5 publish date.
- Recommend scheduling a compliance review of Week 2 content by April 28.`,
    whatMakesItEffective: [
      {
        heading: 'Compliance flags are post-specific, not generic',
        detail: 'Each post with a potential compliance concern has its own flag explaining the specific issue. The Monday HELOC launch post flags NMLS display requirements; the Tuesday FAQ flags a product use restriction. A compliance officer can review efficiently.',
      },
      {
        heading: 'Theme distribution is intentional',
        detail: 'The calendar mixes product content (HELOC launch) with financial literacy, community, and culture posts. A social media feed that is 100% product promotion underperforms — the skill balanced the content mix appropriately.',
      },
      {
        heading: 'Visual direction avoids stock photography',
        detail: 'Every visual note specifies "no stock photo" or requests a candid/natural image. This aligns with the institutional aesthetic (authentic, community-rooted) and avoids the generic bank marketing look.',
      },
    ],
    qualityMarkers: [
      'Placeholder text is clearly marked ([NAME], [VERIFY], [partner name]) rather than invented — prevents publishing errors',
      'The compliance review deadline for launch week content is stated in the notes: April 28, before the May 5 publish date',
      'Post copy is channel-appropriate: LinkedIn posts are slightly more formal; Instagram and Facebook are conversational',
      'Permission requirements for customer and partner content are flagged — a real operational detail most content calendars miss',
    ],
  },

  // -------------------------------------------------------------------------
  // IT / EXECUTIVE — Example 1: Executive AI briefing memo
  // -------------------------------------------------------------------------
  {
    id: 'it-executive-ai-briefing-memo',
    role: 'it',
    title: 'Executive Briefing — AI Readiness: Current State and Q2 Priorities',
    platform: 'claude',
    skillUsed: 'Executive Briefing Skill (skill-templates/executive-briefing.md)',
    outputText: `EXECUTIVE BRIEFING
To: CEO, COO, CFO, Chief Risk Officer
From: VP Information Technology
Date: April 15, 2026
Re: AI Readiness — Current State Assessment and Q2 2026 Priorities

---

## Situation

First Community Bank & Trust currently has three Microsoft 365 Copilot licenses active
(IT Department only) and no formal AI governance framework. Staff are using consumer
AI tools (ChatGPT, Google Gemini) on personal devices to assist with work tasks — a
pattern identified in a January 2026 IT audit. The decision before the executive team
is whether to formalize AI access with governance controls or continue managing the
existing ad hoc use without an institutional framework. Inaction carries its own risk.

---

## Five Key Data Points

1. **3 active M365 Copilot licenses; 0 governance policies as of April 2026** —
   IT, HR, and Compliance have each requested expanded access. No policy framework
   exists to govern expanded rollout responsibly.
   Implication: Expanding before policy is in place creates unmanaged data risk.

2. **Consumer AI use confirmed in 3 departments (IT audit, January 2026)** —
   Lending, Operations, and Marketing staff are using consumer LLM tools for
   work-related tasks. No confidential customer data incidents confirmed, but
   the pattern is ungoverned.
   Implication: Acceptable Use Policy must exist before adoption is normalized further.

3. **57% of financial institutions report AI skill gaps (Gartner, via Jack Henry 2025)** —
   Industry data confirms this is a common challenge, not an outlier condition.
   Implication: Staff training investment is the industry-standard response, not an
   exception spend.

4. **M365 Copilot data boundary: Microsoft 365 tenant only** —
   Copilot does not train on institutional data. Customer PII does not leave the
   Microsoft 365 tenant. This is the safest AI deployment path available to the institution
   without additional infrastructure.
   Implication: Expanding Copilot within M365 is lower risk than managing consumer tool use.

5. **Estimated 140 staff-hours per quarter recoverable via AI workflow automation** —
   Based on Operations Committee data and preliminary IT review of repetitive workflows
   (exception reports, meeting summaries, email drafting). Dollar value at average FTE
   cost: approximately $[VERIFY: calculate at institution's average burdened hourly rate].
   Implication: The ROI case for controlled deployment is concrete, not theoretical.

---

## Recommendations

1. **Approve AI Acceptable Use Policy (AUP) — Owner: CRO + IT. Due: May 15, 2026.**
   Draft policy to be circulated for executive review by May 1. The policy establishes
   permitted tools, data classification rules, and prohibited uses. This is a prerequisite
   for any expanded deployment.
   [RISK FLAG: Operating without an AUP while staff use consumer AI tools creates
   regulatory exposure under SR 11-7 and Interagency TPRM Guidance.]

2. **Expand M365 Copilot to Operations and Compliance — Owner: IT. Due: May 30, 2026.**
   Incremental cost: approximately $[VERIFY: pull current M365 Copilot per-seat pricing].
   Expansion is contingent on AUP approval (Item 1). Conservative rollout: 10–15 seats.

3. **Authorize AiBI-P certification enrollment for 6 staff — Owner: HR + IT. Due: Q2 2026.**
   AiBI-P provides the governance framework, skill-building curriculum, and vendor-neutral
   AI proficiency the institution needs before broad deployment. Enrollment is available now.

---

## Risk Considerations

[RISK FLAG] Inaction on the AUP while consumer AI use continues is not a neutral position.
It creates undocumented data handling practices that regulators may scrutinize under
third-party vendor management guidance.

No items in this briefing require immediate board notification under current policy.
If AUP is approved and rollout begins, recommend a board-level update at the June meeting.`,
    whatMakesItEffective: [
      {
        heading: 'The situation statement names the decision, not just the context',
        detail: 'The last sentence of the Situation section — "The decision before the executive team is whether to formalize AI access with governance controls or continue managing the existing ad hoc use without an institutional framework" — is the actual decision. Executives leave knowing what they are being asked.',
      },
      {
        heading: 'All statistics are sourced in-line using approved sources',
        detail: 'The 57% skill gap figure is attributed to Gartner via Jack Henry 2025 — the exact source noted in CLAUDE.md. The M365 data boundary claim is a verifiable product specification, not an opinion.',
      },
      {
        heading: 'RISK FLAG on inaction is the most important point in the memo',
        detail: 'Operating without an AUP while staff use consumer AI is a real regulatory risk. Flagging it as a risk of inaction (not just of action) reframes the executive decision correctly.',
      },
    ],
    qualityMarkers: [
      'The five data points follow the skill format: fact + implication. Every point answers "so what?"',
      'Recommendations include owner name, not just department — accountability is named, not diffused',
      'VERIFY placeholder on ROI calculation is correct: the AI should not invent the institution\'s burdened hourly rate',
      'The board notification determination at the end is explicit: no immediate notification required, but a June update is recommended',
    ],
  },

  // -------------------------------------------------------------------------
  // IT / EXECUTIVE — Example 2: Vendor AI evaluation scorecard
  // -------------------------------------------------------------------------
  {
    id: 'it-vendor-ai-scorecard',
    role: 'it',
    title: 'AI Vendor Evaluation Scorecard — Core Banking AI Add-On',
    platform: 'claude',
    skillUsed: 'Vendor Scoring Framework (Safe AI Use Guide)',
    outputText: `AI VENDOR EVALUATION SCORECARD
Vendor: [Vendor Name — complete before circulating]
Product: [Product Name and Version]
Use Case: AI-assisted transaction monitoring and anomaly detection
Evaluators: VP IT, CRO, Compliance Officer
Evaluation Date: April 2026 | Review Due: CFO + CEO before contract execution

---

## Evaluation Summary

| Category | Max Score | Score | Notes |
|----------|-----------|-------|-------|
| Data security and privacy | 25 | [SCORE] | See Section 1 |
| Regulatory alignment | 20 | [SCORE] | See Section 2 |
| Explainability and HITL controls | 20 | [SCORE] | See Section 3 |
| Vendor stability and support | 15 | [SCORE] | See Section 4 |
| Implementation and integration | 10 | [SCORE] | See Section 5 |
| Pricing and total cost | 10 | [SCORE] | See Section 6 |
| **Total** | **100** | **[TOTAL]** | |

**Scoring threshold:** 75+ = Recommend. 60–74 = Conditional recommend (address gaps).
Below 60 = Do not proceed.

---

## Section 1 — Data Security and Privacy (25 points)

Criteria and evidence:

**1a. Customer PII handling (10 pts)**
Does the vendor process customer PII, and if so, how?
- [ ] PII stays within institution's environment (10 pts)
- [ ] PII transmitted to vendor servers but encrypted in transit and at rest (7 pts)
- [ ] PII transmitted; encryption practices unspecified or unclear (3 pts)
- [ ] Vendor cannot confirm PII data flows (0 pts)
Evidence collected: [Document vendor's DPA or data flow diagram here]
Score: [  ]

**1b. SOC 2 Type II certification (8 pts)**
- [ ] Current SOC 2 Type II report provided, dated within 12 months (8 pts)
- [ ] SOC 2 Type I only, or Type II older than 12 months (4 pts)
- [ ] No SOC 2; alternative security certification provided (2 pts)
- [ ] No independent security certification (0 pts)
Evidence collected: [Document report date and any noted exceptions]
Score: [  ]

**1c. Incident notification SLA (7 pts)**
- [ ] Contractual obligation to notify within 72 hours of confirmed breach (7 pts)
- [ ] Notification required "promptly" or similar undefined standard (4 pts)
- [ ] No contractual notification provision (0 pts)
Evidence collected: [Quote contract language here]
Score: [  ]

---

## Section 2 — Regulatory Alignment (20 points)

**2a. SR 11-7 model risk management alignment (10 pts)**
The Federal Reserve's SR 11-7 guidance requires validation, documentation, and ongoing
monitoring of models used in banking decisions. Applies to AI used in credit, fraud, or
BSA contexts.
- [ ] Vendor provides model validation documentation and supports ongoing monitoring (10 pts)
- [ ] Vendor acknowledges SR 11-7 applicability; documentation partially available (6 pts)
- [ ] Vendor unfamiliar with SR 11-7 or disputes applicability (2 pts)
Evidence collected: [  ]
Score: [  ]

**2b. Fair lending / ECOA / Reg B controls (10 pts)**
AI models used in credit or account decisions must not produce disparate impact.
- [ ] Vendor provides disparate impact analysis and regular fairness testing reports (10 pts)
- [ ] Vendor acknowledges fair lending risk; no formal testing provided (5 pts)
- [ ] No fair lending risk acknowledgment in vendor documentation (0 pts)
Evidence collected: [  ]
Score: [  ]

[RISK FLAG: Any AI vendor scoring 0 on Section 2b should not be used in credit decisions
regardless of total score. Escalate to CRO before further evaluation.]

---

## Section 3 — Explainability and Human-in-the-Loop Controls (20 points)

**3a. Output explainability (10 pts)**
Per AIEOG AI Lexicon (US Treasury/FBIIC/FSSCC, February 2026): "explainability" is the
ability to describe how an AI system reached a specific output in terms understandable to
the intended audience.
- [ ] Vendor provides per-decision explanations in plain language (10 pts)
- [ ] Vendor provides feature importance or confidence scores; no plain-language explanation (6 pts)
- [ ] Output is black-box; no explainability capability (0 pts)
Evidence collected: [  ]
Score: [  ]

**3b. Human-in-the-loop override capability (10 pts)**
- [ ] All AI-generated decisions or flags can be overridden by authorized human reviewer (10 pts)
- [ ] Override is technically possible but not documented as standard workflow (5 pts)
- [ ] AI decisions are automatically applied; override requires vendor involvement (0 pts)
Evidence collected: [  ]
Score: [  ]

---

## Section 4 — Vendor Stability and Support (15 points)

- Vendor financial stability (years in market, customer base size): [  ] / 5
- Dedicated community bank / credit union customer support: [  ] / 5
- Contract term and exit provisions (data portability, termination rights): [  ] / 5
Evidence collected: [Note contract term, exit clause, and support SLA]

---

## Section 5 — Implementation and Integration (10 points)

- Core system compatibility ([name your core]): [  ] / 5
- Implementation timeline and resource requirements: [  ] / 5
Evidence collected: [Statement of Work or implementation plan provided?]

---

## Section 6 — Pricing and Total Cost (10 points)

- Transparent, all-in pricing (no undisclosed add-on fees): [  ] / 5
- Total 3-year cost relative to budget: [  ] / 5
Evidence collected: [Quote date and all-in cost including implementation and training]

---

## Recommendation

Total Score: [  ] / 100

Evaluator recommendation: [ ] Proceed  [ ] Conditional  [ ] Do not proceed

Conditions (if conditional):
[List any gaps that must be resolved before contract execution]

Final approval authority: CFO + CEO signature required before contract execution.
[RISK FLAG: Do not execute contract before legal review of DPA, exit provisions, and
indemnification language.]`,
    whatMakesItEffective: [
      {
        heading: 'Scoring criteria are objective and pre-defined',
        detail: 'Every criterion has specific point values and specific evidence requirements. The evaluation cannot be gamed by a vendor\'s sales narrative — the evaluator records what was actually provided, not what was claimed.',
      },
      {
        heading: 'Regulatory citations are specific and accurate',
        detail: 'SR 11-7, ECOA/Reg B, and the AIEOG AI Lexicon definition of explainability are all cited correctly with appropriate context. An examiner reviewing this scorecard would recognize these as correctly applied standards.',
      },
      {
        heading: 'Hard stop on fair lending score is non-negotiable',
        detail: 'The RISK FLAG in Section 2b is an absolute: a zero score disqualifies the vendor from credit-decision use regardless of total score. This is not a soft concern — it is a bright line that protects the institution.',
      },
    ],
    qualityMarkers: [
      'VERIFY placeholders are used correctly — vendor name, product name, and scores are left blank for the evaluator to complete',
      'The 75/60 scoring threshold is defined before the scoring begins, not after — prevents score-chasing',
      'HITL (human-in-the-loop) uses the AIEOG Lexicon definition, which is the official regulatory terminology',
      'The exit provision criterion (Section 4) is often overlooked in vendor evaluations — its inclusion here reflects real operational risk awareness',
    ],
  },

  // -------------------------------------------------------------------------
  // L-LEVEL — Example 1: Board AI strategy deck excerpt
  // -------------------------------------------------------------------------
  {
    id: 'l-board-ai-strategy-deck-excerpt',
    role: 'executive',
    title: 'Board AI Strategy Presentation — Slides 4 and 5 Excerpt',
    platform: 'claude',
    skillUsed: 'Board Deck Generator (AiBI-L)',
    outputText: `BOARD OF DIRECTORS BRIEFING
The AI Banking Institute · Executive Strategy Series
Prepared for: [INSTITUTION NAME] Board of Directors
Date: April 2026 | Presenter: President/CEO

---

SLIDE 4 — THE EFFICIENCY OPPORTUNITY

Current Performance
- Efficiency ratio: [FDIC EFFICIENCY RATIO]% (FDIC BankFind Suite, Q4 2025)
- Community bank peer median: ~65% (FDIC CEIC data, 1992–2025)
- Industry-wide benchmark: ~55.7% (FDIC Quarterly Banking Profile, Q4 2024)
- Gap to peer median: [CALCULATE: current ratio minus 65%] basis points

What the Gap Means
A $500M community bank with a 72% efficiency ratio and 120 FTE spends
approximately $0.72 on operations for every $1.00 it earns. Moving to the
peer median of 65% would free $[CALCULATE] annually for reinvestment,
capital, or competitive rate positioning.

The AI Productivity Lever
- Conservative: 1.5 hours saved per FTE per week
  Source: Jack Henry & Associates, Getting Started in AI, 2025
- Base case: 3 hours saved per FTE per week
  Source: Jack Henry & Associates, Getting Started in AI, 2025
- At base case, 120 FTE × 3 hrs/week × $[BURDENED HOURLY RATE] × 50 weeks
  = $[CALCULATE] annually in productivity value
  [VERIFY: pull burdened hourly rate from HR cost model before presenting]

Trajectory: Year 1 target — reduce efficiency ratio by 200–400 basis points
through expense-side productivity gains. Revenue impact modeled separately.

SPEAKER NOTE: The board will ask "how do you know this is achievable?" The
answer is: we are not projecting elimination of positions. We are projecting
that existing staff spend 3 fewer hours per week on tasks AI handles faster
and more accurately. That is a conservative target — our best performers
already demonstrate it individually.

---

SLIDE 5 — THE REGULATORY LANDSCAPE

Where We Stand
Examiners are paying attention. Per GAO-25-107197 (May 2025), there is
currently no comprehensive federal AI-specific banking framework, but
existing guidance applies directly:

  SR 11-7 (Federal Reserve, 2011) — Model risk management. Applies to
  any AI used in credit, fraud, BSA, or pricing decisions. Requires
  validation, documentation, and ongoing monitoring.

  Interagency TPRM Guidance (OCC Bulletin 2023-17) — Third-party risk.
  Applies to every AI vendor relationship. Requires due diligence,
  contract controls, and ongoing oversight.

  ECOA / Regulation B — Fair lending. Applies to any AI model that
  touches a credit decision. Requires explainability and adverse action
  notice capability.

  AIEOG AI Lexicon (US Treasury / FBIIC / FSSCC, Feb 2026) — Official
  definitions for AI governance terms. Examiners will use this vocabulary.

The Risk of Inaction
Operating without an AI Acceptable Use Policy while staff use consumer AI
tools is itself a regulatory risk. If an examiner finds undocumented AI use
in a supervised function, the institution cannot demonstrate control.
[RISK FLAG: This is the most important point on this slide. Do not soften it.]

What We Are Doing
- Phase 1 (Q2 2026): Adopt AI Acceptable Use Policy — board approval requested
- Phase 2 (Q3 2026): Complete vendor AI inventory and TPRM documentation
- Phase 3 (Q4 2026): Staff certification program — AiBI-P for first 30 users

SPEAKER NOTE: Some directors will want to wait for clearer federal guidance.
The response: the guidance is already here — SR 11-7, TPRM, ECOA. We are not
waiting for new rules; we are implementing the ones that already apply.`,
    whatMakesItEffective: [
      {
        heading: 'Every statistic is sourced in-line with publication name and date',
        detail: 'No slide says "industry data shows." Every figure cites its origin: FDIC BankFind Suite, Jack Henry 2025, GAO-25-107197. A board member or examiner can trace every number to its source.',
      },
      {
        heading: 'CALCULATE placeholders require the presenter to do the math for their institution',
        detail: 'The deck does not invent efficiency ratio improvement projections. It provides the formula and requires the CFO to populate it with actual FDIC-reported figures. This prevents the most common board presentation failure: plausible-sounding numbers that are not institution-specific.',
      },
      {
        heading: 'The risk of inaction is stated as a regulatory fact, not a persuasion tactic',
        detail: 'The RISK FLAG on Slide 5 is not a sales argument. It is a compliance observation: operating without documented AI governance while staff use AI is a real examination risk. The speaker note reinforces this.',
      },
      {
        heading: 'Speaker notes give the CEO exact language for the hardest questions',
        detail: 'Both speaker notes anticipate board objections — "how do you know this is achievable?" and "should we wait for clearer guidance?" — and provide responses that are factual, not defensive.',
      },
    ],
    qualityMarkers: [
      'FDIC BankFind Suite is cited as the source for the efficiency ratio — not a generic industry average',
      'The base-case productivity assumption (3 hours/week/FTE) cites Jack Henry 2025, not an invented number',
      'GAO-25-107197 is cited correctly — it specifically addresses the absence of a comprehensive AI framework',
      'The RISK FLAG instruction ("Do not soften it") is a quality marker: the AI understood that board risk communication requires directness',
    ],
  },

  // -------------------------------------------------------------------------
  // L-LEVEL — Example 2: Efficiency ratio scenario model output
  // -------------------------------------------------------------------------
  {
    id: 'l-efficiency-ratio-scenario-model',
    role: 'finance',
    title: 'Efficiency Ratio Scenario Model — 24-Month AI Productivity Projection',
    platform: 'chatgpt',
    skillUsed: 'Efficiency Ratio Scenario Modeling (AiBI-L)',
    outputText: `EFFICIENCY RATIO SCENARIO MODEL
Institution: [INSTITUTION NAME — complete before distributing]
Baseline Data Source: FDIC BankFind Suite (banks.data.fdic.gov)
Model Date: April 2026 | Prepared by: CFO Office
Purpose: Estimate productivity-driven efficiency ratio improvement over 24 months

[VERIFY ALL INSTITUTION-SPECIFIC FIGURES AGAINST FDIC BANKFIND SUITE BEFORE PRESENTING]

---

BASELINE INPUTS

Total FTE: [FTE COUNT — VERIFY]
Burdened cost per FTE: $[COST PER FTE — VERIFY from HR cost model]
Burdened hourly rate: $[COST PER FTE] ÷ 2,080 = $[HOURLY RATE]
Total non-interest expense (NIE): $[NIE]M — FDIC BankFind Suite Q4 2025
Total revenue (NII + non-interest income): $[REVENUE]M — FDIC BankFind Suite Q4 2025
Current efficiency ratio: [NIE ÷ REVENUE × 100]% — FDIC BankFind Suite Q4 2025
Community bank peer median: ~65% (FDIC CEIC data, 1992–2025)
Industry-wide benchmark: ~55.7% (FDIC Quarterly Banking Profile, Q4 2024)

---

PRODUCTIVITY ASSUMPTIONS (source: Jack Henry & Associates, Getting Started in AI, 2025)

Conservative: 1.5 hours saved per FTE per week
Base case:    3.0 hours saved per FTE per week
Optimistic:   5.0 hours saved per FTE per week

Annual productivity value formula:
FTE × hours/week × burdened hourly rate × 50 working weeks

---

SCENARIO SUMMARY TABLE

| Scenario     | Hrs/Wk | Annual Value | NIE Reduction Y1 (60%) | NIE Reduction Y2 (80%) | Efficiency Ratio Y1 | Efficiency Ratio Y2 | Δ vs. Peer Median |
|--------------|--------|--------------|------------------------|------------------------|---------------------|---------------------|-------------------|
| Conservative | 1.5    | $[CALC]      | $[CALC]                | $[CALC]                | [CALC]%             | [CALC]%             | [CALC] bps        |
| Base Case    | 3.0    | $[CALC]      | $[CALC]                | $[CALC]                | [CALC]%             | [CALC]%             | [CALC] bps        |
| Optimistic   | 5.0    | $[CALC]      | $[CALC]                | $[CALC]                | [CALC]%             | [CALC]%             | [CALC] bps        |

Notes:
- NIE reduction assumes 60% of productivity value flows to expense reduction in Year 1
  (remaining 40% = learning curve, partial-year ramp, redeployment of reclaimed time)
- Year 2 increases to 80% as processes are restructured around AI workflows
- Revenue held constant — this model is limited to expense-side productivity only
- These are projections under stated assumptions, not guarantees

---

CFO COMMENTARY (for board report)

Under the base-case assumption of 3 hours saved per FTE per week — consistent with
Jack Henry's 2025 community banking AI research — the institution projects a reduction
in non-interest expense of approximately $[CALC] in Year 1 and $[CALC] in Year 2,
yielding an efficiency ratio of approximately [CALC]% by end of 2027. This would
reduce the current gap to the community bank peer median of ~65% by approximately
[CALC] basis points. The conservative scenario (1.5 hours/week) still produces
meaningful improvement; the optimistic scenario (5 hours/week) requires sustained
adoption at scale and is not recommended as a planning target.

[VERIFY: Populate all CALC fields with institution-specific figures before board distribution.
Cross-check efficiency ratio baseline against FDIC BankFind Suite Q4 2025 report.]

---

SENSITIVITY NOTE — WHAT MUST BE TRUE FOR THE OPTIMISTIC SCENARIO

1. Adoption rate: 80%+ of eligible FTE actively using AI tools within 12 months
2. Training completion: All adopters have completed structured AI training (AiBI-P minimum)
3. Process restructuring: At least 3 high-volume workflows redesigned around AI assistance
4. Management reinforcement: Department heads actively measure and report time savings
5. Platform stability: No major AI platform disruptions or compliance restrictions on core tools

If any of these conditions is not met, the base case is the appropriate planning assumption.
The optimistic scenario is achievable — it is not the right number to put in a budget.`,
    whatMakesItEffective: [
      {
        heading: 'Every input is a VERIFY placeholder tied to a named source',
        detail: 'The model does not invent the institution\'s efficiency ratio, FTE count, or burdened cost. It specifies exactly where to get each number — FDIC BankFind Suite for financial data, the HR cost model for burdened rate — and marks every instance for verification before distribution.',
      },
      {
        heading: 'Productivity assumptions are sourced, not assumed',
        detail: 'The 1.5 / 3.0 / 5.0 hours-per-week figures cite Jack Henry\'s Getting Started in AI (2025). An examiner or board member can verify these are published estimates from a credible industry source, not numbers the CFO invented.',
      },
      {
        heading: 'The NIE flow-through percentages (60% / 80%) are explained',
        detail: 'The note explains why only 60% of productivity value flows to expense reduction in Year 1: learning curve, partial-year ramp, and redeployment of reclaimed time. This prevents the model from looking like it assumes instant, frictionless savings.',
      },
      {
        heading: 'The sensitivity note is the most important section',
        detail: 'The five conditions for the optimistic scenario are specific and testable. A CFO presenting this to the board can answer "what has to be true?" with a concrete list — not a vague assertion that adoption will happen.',
      },
    ],
    qualityMarkers: [
      'FDIC BankFind Suite is cited as the baseline source — the model cannot be populated without it',
      'The CFO commentary is written in board-ready language: no jargon, specific figures, stated assumptions',
      'Revenue is explicitly excluded from the model scope — this prevents inflating the projection with speculative income benefits',
      'The optimistic scenario includes an explicit caution: "not recommended as a planning target." The AI did not just produce numbers — it assessed their reliability.',
    ],
  },

] as const;

// ---------------------------------------------------------------------------
// Filter helper
// ---------------------------------------------------------------------------

export function filterOutputExamples(role?: PromptRole): readonly OutputExample[] {
  if (!role) return OUTPUT_EXAMPLES;
  return OUTPUT_EXAMPLES.filter((ex) => ex.role === role);
}
