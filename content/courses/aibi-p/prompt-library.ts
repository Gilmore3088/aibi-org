// AiBI Foundations Prompt Library — Copy-paste-ready prompts for banking practitioners
// Organized by platform, role, and difficulty
// All prompts are banking-specific with institutional constraints

export type PromptPlatform =
  | 'chatgpt'
  | 'claude'
  | 'copilot'
  | 'gemini'
  | 'notebooklm'
  | 'perplexity';

export type PromptRole =
  | 'lending'
  | 'operations'
  | 'compliance'
  | 'finance'
  | 'marketing'
  | 'it'
  | 'retail'
  | 'executive';

export type PromptDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type ContentLevel = 'p' | 's' | 'l';
export type PromptTaskType =
  | 'email'
  | 'summary'
  | 'policy'
  | 'board'
  | 'lending'
  | 'complaint'
  | 'meeting'
  | 'report'
  | 'verification'
  | 'sanitization'
  | 'workflow';

export type PromptSafetyLevel = 'green' | 'yellow' | 'red';

export interface Prompt {
  readonly id: string;
  readonly title: string;
  readonly platform: PromptPlatform;
  readonly role: PromptRole;
  readonly difficulty: PromptDifficulty;
  readonly promptText: string;
  readonly expectedOutput: string;
  readonly timeEstimate: string;
  readonly relatedModule: number;
  readonly taskType?: PromptTaskType;
  readonly safetyLevel?: PromptSafetyLevel;
  readonly whenToUse?: string;
  readonly whatToPaste?: string;
  readonly whatNotToPaste?: string;
  readonly exampleOutput?: string;
  readonly tags?: readonly string[];
}

export interface MiniTutorialStep {
  readonly stepNumber: number;
  readonly instruction: string;
  readonly detail?: string;
  readonly screenshotPlaceholder?: string;
}

export interface MiniTutorial {
  readonly id: string;
  readonly title: string;
  readonly platform: PromptPlatform;
  readonly role: PromptRole | 'all';
  readonly difficulty: PromptDifficulty;
  readonly relatedModule: number;
  readonly timeEstimate: string;
  readonly introduction: string;
  readonly steps: readonly MiniTutorialStep[];
  readonly prompt: Prompt;
  readonly whatWentWell: string;
  readonly whatToWatchFor: string;
}

// ---------------------------------------------------------------------------
// Platform metadata — colors use CSS variables for brand consistency
// ---------------------------------------------------------------------------

export const PLATFORM_META: Record<
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

export const ROLE_LABELS: Record<PromptRole, string> = {
  lending:    'Lending',
  operations: 'Operations',
  compliance: 'Compliance',
  finance:    'Finance',
  marketing:  'Marketing',
  it:         'IT',
  retail:     'Retail / Frontline',
  executive:  'Executive',
} as const;

export const DIFFICULTY_LABELS: Record<PromptDifficulty, string> = {
  beginner:     'Beginner',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
} as const;

export const TASK_TYPE_LABELS: Record<PromptTaskType, string> = {
  email: 'Email',
  summary: 'Summary',
  policy: 'Policy',
  board: 'Board',
  lending: 'Lending',
  complaint: 'Complaint',
  meeting: 'Meeting',
  report: 'Report',
  verification: 'Verification',
  sanitization: 'Sanitization',
  workflow: 'Workflow',
} as const;

export const SAFETY_LEVEL_LABELS: Record<PromptSafetyLevel, string> = {
  green: 'Green',
  yellow: 'Yellow',
  red: 'Red',
} as const;

export function getPromptTaskType(prompt: Prompt): PromptTaskType {
  if (prompt.taskType) return prompt.taskType;
  const haystack = [
    prompt.title,
    prompt.expectedOutput,
    prompt.promptText,
    ...(prompt.tags ?? []),
  ].join(' ').toLowerCase();

  if (haystack.includes('complaint')) return 'complaint';
  if (haystack.includes('email')) return 'email';
  if (haystack.includes('board')) return 'board';
  if (haystack.includes('loan') || haystack.includes('lending') || haystack.includes('credit')) return 'lending';
  if (haystack.includes('meeting')) return 'meeting';
  if (haystack.includes('policy')) return 'policy';
  if (haystack.includes('verify') || haystack.includes('citation') || haystack.includes('hallucination')) return 'verification';
  if (haystack.includes('sanitize') || haystack.includes('pii') || haystack.includes('sensitive')) return 'sanitization';
  if (haystack.includes('report') || haystack.includes('memo')) return 'report';
  if (haystack.includes('summary') || haystack.includes('summar')) return 'summary';
  return 'workflow';
}

export function getPromptSafetyLevel(prompt: Prompt): PromptSafetyLevel {
  if (prompt.safetyLevel) return prompt.safetyLevel;
  const haystack = [
    prompt.title,
    prompt.expectedOutput,
    prompt.promptText,
    ...(prompt.tags ?? []),
  ].join(' ').toLowerCase();

  if (
    haystack.includes('customer data') ||
    haystack.includes('pii') ||
    haystack.includes('credit decision') ||
    haystack.includes('account number')
  ) {
    return 'red';
  }
  if (
    haystack.includes('policy') ||
    haystack.includes('compliance') ||
    haystack.includes('customer') ||
    haystack.includes('board') ||
    haystack.includes('loan')
  ) {
    return 'yellow';
  }
  return 'green';
}

export function getPromptTimeMinutes(prompt: Prompt): number {
  const match = prompt.timeEstimate.match(/\d+/);
  return match ? Number(match[0]) : 10;
}

// ---------------------------------------------------------------------------
// Module 3 — "First Try" prompts
// ---------------------------------------------------------------------------

const m3Prompts: readonly Prompt[] = [
  {
    id: 'm3-first-chatgpt',
    title: 'Your First ChatGPT Banking Query',
    platform: 'chatgpt',
    role: 'compliance',
    difficulty: 'beginner',
    relatedModule: 3,
    timeEstimate: '5 minutes',
    expectedOutput: 'A structured summary of the guidance with key dates, affected institutions, and required actions — written in plain language suitable for forwarding to your compliance committee.',
    promptText: `You are a compliance analyst at a community bank under $1B in assets. Summarize the following regulatory development for a non-technical compliance committee audience:

Topic: The most recent interagency guidance on third-party risk management for AI and technology vendors.

For each key point, provide:
1. What changed or was clarified
2. Which institution functions are affected (lending, operations, IT, compliance)
3. The practical action required within the next 90 days

Constraints:
- Do not cite specific regulation numbers unless you can verify them. If unsure, write "[verify citation]" instead.
- Keep the summary under 400 words.
- Use plain language — no jargon that a board member could not understand.
- End with a one-sentence recommendation for next steps.`,
    tags: ['regulatory', 'first-try', 'summarization'],
  },
  {
    id: 'm3-first-copilot',
    title: 'Your First Copilot Email Draft',
    platform: 'copilot',
    role: 'retail',
    difficulty: 'beginner',
    relatedModule: 3,
    timeEstimate: '5 minutes',
    expectedOutput: 'A professional, empathetic email draft in your institution\'s voice that explains the rate change clearly and offers to discuss alternatives. Ready for review and sending.',
    promptText: `Draft an email to a business checking customer explaining that their promotional money market rate is expiring next month and transitioning to the standard rate.

Tone: Professional, empathetic, relationship-focused. This is a community bank — we know our customers by name.

Include:
1. A clear explanation of the rate change with specific dates (use [DATE] placeholders)
2. The new rate (use [RATE] placeholder) and how it compares to the promotional rate
3. Two alternative options the customer can explore (CD ladder, relationship pricing)
4. A direct phone number and name for follow-up (use [BANKER NAME] and [PHONE] placeholders)

Constraints:
- Do not make claims about rates being "competitive" or "best available" — let the customer decide.
- Do not use exclamation points or marketing language. This is a service communication, not a sales email.
- Keep under 200 words.`,
    tags: ['email', 'first-try', 'customer-communication'],
  },
  {
    id: 'm3-first-claude',
    title: 'Your First Claude Analysis',
    platform: 'claude',
    role: 'operations',
    difficulty: 'beginner',
    relatedModule: 3,
    timeEstimate: '10 minutes',
    expectedOutput: 'A structured analysis with the top five key provisions, a plain-language summary of each, and flagged items requiring committee review — formatted as a table you can paste into a memo.',
    promptText: `You are an operations manager at a community bank reviewing an internal policy document. I will upload the document in the next message.

Your task:
1. Identify the five most important provisions that directly affect day-to-day staff operations
2. For each provision, provide: a plain-language summary (one sentence), the affected department(s), and whether it requires staff training or process changes
3. Flag any provisions that are ambiguous or could be interpreted multiple ways — these need committee discussion

Format: A Markdown table with columns:
| Provision | Summary | Affected Dept | Action Required | Ambiguity Flag |

Constraints:
- Do not rewrite the policy. Summarize and flag — do not recommend changes.
- If you are unsure whether a provision requires action, flag it as "[NEEDS REVIEW]" rather than guessing.
- Do not include provisions that are purely administrative (e.g., document revision dates, signature blocks).

After the table, provide a two-sentence executive summary suitable for opening a committee meeting.`,
    tags: ['document-analysis', 'first-try', 'policy-review'],
  },
] as const;

// ---------------------------------------------------------------------------
// Module 4 — "Feature Discovery" role-specific prompts
// ---------------------------------------------------------------------------

const m4Prompts: readonly Prompt[] = [
  {
    id: 'm4-lending-deep-research',
    title: 'CRE Lending Trends Deep Research',
    platform: 'chatgpt',
    role: 'lending',
    difficulty: 'intermediate',
    relatedModule: 4,
    timeEstimate: '15 minutes',
    expectedOutput: 'A multi-page research report with cited sources covering vacancy rates, cap rate trends, delinquency data, and regulatory commentary — specific to your geographic market.',
    promptText: `Use Deep Research to analyze current commercial real estate (CRE) lending conditions in the [YOUR STATE/REGION] market.

I need a market intelligence brief I can present to my loan committee. Cover:

1. Current CRE vacancy rates by property type (office, retail, industrial, multifamily) with year-over-year trend
2. Cap rate movements over the past 12 months
3. CRE delinquency rates at community banks ($100M-$1B in assets) vs. large banks
4. Any recent regulatory commentary or guidance on CRE concentration risk
5. Two to three specific risks a community bank lender should monitor in the next 6 months

Requirements:
- Cite every data point with source name, publication, and date. If a source cannot be verified, exclude the data point.
- Distinguish between national data and regional/state-level data. My committee cares about local conditions.
- Use FDIC Call Report data or Federal Reserve data where available.
- Do not include projections or forecasts from unnamed "industry experts."
- Format as a structured brief with section headers, suitable for a 10-minute committee presentation.`,
    tags: ['deep-research', 'market-intelligence', 'CRE'],
  },
  {
    id: 'm4-compliance-perplexity',
    title: 'CFPB Overdraft Guidance Research',
    platform: 'perplexity',
    role: 'compliance',
    difficulty: 'intermediate',
    relatedModule: 4,
    timeEstimate: '10 minutes',
    expectedOutput: 'A cited research summary with direct links to CFPB guidance documents, enforcement actions, and compliance deadlines — ready for compliance officer review.',
    promptText: `Research current CFPB guidance, enforcement actions, and rulemaking related to overdraft fees and NSF fees at banks and credit unions.

I am a compliance officer at a community bank and need to brief my CEO on our exposure. Provide:

1. The current status of the CFPB overdraft/NSF fee rule (proposed, final, effective date, legal challenges)
2. Key provisions that affect institutions under $10B in assets specifically
3. Recent enforcement actions or consent orders related to overdraft practices (past 18 months) with institution names and dollar amounts
4. Three specific compliance risks a community bank should assess in its current overdraft program
5. Peer comparison: how are other community banks ($300M-$1B) modifying their overdraft programs in response

Constraints:
- Every factual claim must have a citation with URL. No unsourced statements.
- Distinguish between final rules, proposed rules, and guidance — these have different compliance obligations.
- Do not provide legal advice. Frame findings as "areas for review" not "required changes."
- If the regulatory landscape has changed since your last update, note the knowledge cutoff clearly.`,
    tags: ['regulatory-research', 'cited-sources', 'overdraft'],
  },
  {
    id: 'm4-operations-custom-instructions',
    title: 'Consistent Meeting Summary Format',
    platform: 'chatgpt',
    role: 'operations',
    difficulty: 'intermediate',
    relatedModule: 4,
    timeEstimate: '10 minutes',
    expectedOutput: 'A Custom Instruction that produces identical meeting summary formatting every time — with decisions, action items, owners, and deadlines in a consistent structure across all meetings.',
    promptText: `Set these as your Custom Instructions (paste into Settings > Custom Instructions):

---

You are a meeting documentation specialist for a community bank operations department. When I provide meeting notes, a transcript, or a verbal summary, produce a structured meeting summary using this exact format:

MEETING SUMMARY
Date: [extract from content or ask]
Attendees: [extract from content or ask]
Duration: [extract or estimate]

DECISIONS MADE
- [Decision]: [brief context]. Owner: [name]. Effective: [date or "immediately"].

ACTION ITEMS
| # | Action | Owner | Deadline | Priority |
|---|--------|-------|----------|----------|
| 1 | [action] | [name] | [date] | High/Med/Low |

DISCUSSION NOTES
[Organized by topic, not chronologically. Group related discussions.]

PARKING LOT
[Items raised but not resolved — carried to next meeting.]

NEXT MEETING
[Date/time if mentioned, or "TBD"]

---

Constraints:
- Always ask for missing information rather than guessing names or dates.
- If a decision was discussed but not finalized, put it in Parking Lot, not Decisions Made.
- Keep Discussion Notes under 300 words. Focus on reasoning behind decisions, not the discussion itself.
- Never include confidential customer names — use "[Customer A]" placeholders.`,
    tags: ['custom-instructions', 'meeting-notes', 'workflow'],
  },
  {
    id: 'm4-finance-file-upload',
    title: 'Balance Sheet Variance Analysis',
    platform: 'chatgpt',
    role: 'finance',
    difficulty: 'intermediate',
    relatedModule: 4,
    timeEstimate: '15 minutes',
    expectedOutput: 'A structured variance analysis table with dollar and percentage changes, materiality flags, and plain-language explanations suitable for a board report.',
    promptText: `I am uploading two Excel files: our balance sheet as of [CURRENT QUARTER] and [PRIOR QUARTER]. Analyze the variances between periods.

You are a community bank CFO analyst preparing a quarterly board report. Produce:

1. A variance table showing:
   | Line Item | Prior Quarter | Current Quarter | $ Change | % Change | Material? |

2. Flag any line item with a variance exceeding 10% or $500K as "Material — requires explanation"

3. For each material variance, provide a one-sentence plain-language explanation of what likely drove the change (e.g., "Increase in CRE loans consistent with Q3 origination pipeline" or "Decline in non-interest deposits may reflect seasonal municipal fund withdrawals")

4. An executive summary paragraph (under 100 words) highlighting the three most significant balance sheet movements

Constraints:
- Do not fabricate explanations. If the cause of a variance is not evident from the data alone, write "Requires management discussion — cause not apparent from financial data."
- Use thousands ($000s) for all dollar figures.
- Do not calculate or display ratios unless specifically asked. This is a variance report, not a ratio analysis.
- Round all percentages to one decimal place.
- Never reference specific customer or borrower names even if they appear in the data — use "[Borrower A]" placeholders.`,
    tags: ['file-analysis', 'financial-reporting', 'board-report'],
  },
  {
    id: 'm4-marketing-gemini',
    title: 'Community Bank Social Media Posts',
    platform: 'gemini',
    role: 'marketing',
    difficulty: 'intermediate',
    relatedModule: 4,
    timeEstimate: '10 minutes',
    expectedOutput: 'Five ready-to-review social media posts (3 LinkedIn, 2 Facebook) with appropriate length, tone, and compliance-safe language for a community bank audience.',
    promptText: `You are a marketing communications specialist at a community bank. We are launching a new high-yield savings product and need social media content.

Product details:
- Product name: [PRODUCT NAME]
- APY: [RATE]% (variable, subject to change)
- Minimum opening deposit: [AMOUNT]
- Available to: existing and new customers
- FDIC insured

Create five social media posts:
- 3 for LinkedIn (professional tone, 100-150 words each, targeting local business owners and professionals)
- 2 for Facebook (conversational tone, 50-80 words each, targeting existing customers and community members)

Each post must include:
- A clear value proposition without superlative claims ("best," "highest," "unbeatable")
- A call to action directing to [BRANCH/URL]
- Appropriate regulatory language: "APY accurate as of [DATE]. Rate may change. $[AMOUNT] minimum to open. FDIC insured."

Constraints:
- Do not use the phrase "limited time" unless the product actually has an expiration date.
- Do not compare our rate to competitors by name.
- Do not promise returns or use the word "guaranteed" in connection with variable rates.
- No hashtag spam — maximum 3 relevant hashtags per post.
- No emojis. Professional community bank tone throughout.`,
    tags: ['social-media', 'product-launch', 'marketing-copy'],
  },
  {
    id: 'm4-it-notebooklm',
    title: 'Policy Library Knowledge Base',
    platform: 'notebooklm',
    role: 'it',
    difficulty: 'intermediate',
    relatedModule: 4,
    timeEstimate: '20 minutes',
    expectedOutput: 'A searchable knowledge base where you can ask natural-language questions across your entire policy library — and get answers grounded only in your actual documents.',
    promptText: `Steps to build your NotebookLM policy knowledge base:

1. Create a new notebook in NotebookLM titled "Institution Policy Library"

2. Upload your institution's policy documents (PDF or Google Docs). Start with these five categories:
   - Information Security Policy
   - Acceptable Use Policy (technology)
   - Business Continuity / Disaster Recovery Plan
   - Vendor Management Policy
   - Data Classification Policy

3. Once uploaded, set the following Notebook Guide instruction:

"You are an internal policy reference assistant for a community bank IT department. When answering questions, cite the specific policy document name and section number. If a question cannot be answered from the uploaded documents, say 'This is not addressed in the current policy library.' Do not infer or extrapolate policy positions — only report what the documents explicitly state. Flag any policies that appear to conflict with each other."

4. Test with these queries:
   - "What is our data retention requirement for email?"
   - "Does our acceptable use policy address employee use of AI tools?"
   - "What are the vendor due diligence requirements for cloud service providers?"
   - "Are there any gaps in our policies regarding generative AI use by staff?"`,
    tags: ['notebooklm', 'policy-library', 'knowledge-base'],
  },
] as const;

// ---------------------------------------------------------------------------
// Module 7 — "Starter Skill" complete tutorials
// ---------------------------------------------------------------------------

const m7Prompts: readonly Prompt[] = [
  {
    id: 'm7-lending-loan-checklist',
    title: 'Loan File Completeness Checker',
    platform: 'chatgpt',
    role: 'lending',
    difficulty: 'advanced',
    relatedModule: 7,
    timeEstimate: '20 minutes',
    expectedOutput: 'A structured gap analysis table showing which required documents are present, missing, or expired — with a risk-rated priority for each missing item and a one-paragraph summary for the loan officer.',
    promptText: `You are a Senior Credit Analyst at a community bank with 12 years of experience in commercial lending. You specialize in CRE and C&I loan documentation review for institutions between $300M and $1B in total assets.

Context: I am providing you with a list of documents in a commercial loan file. My institution uses a standard 22-item documentation checklist for CRE loans. The output will be reviewed by a loan officer before submission to the loan committee.

Task: Compare the provided document list against the standard CRE loan documentation checklist below and produce a gap analysis.

Standard CRE Documentation Checklist:
1. Signed loan application
2. Personal financial statement (within 90 days)
3. Business financial statements (2 most recent fiscal years)
4. Interim financial statements (within 90 days)
5. Federal tax returns (2 most recent years — personal)
6. Federal tax returns (2 most recent years — business)
7. Appraisal (compliant with FIRREA / Interagency Appraisal Guidelines)
8. Environmental Phase I (if applicable)
9. Title commitment or preliminary title report
10. Survey (for new acquisitions)
11. Flood determination
12. Insurance verification (property, liability, flood if applicable)
13. Entity formation documents (articles, operating agreement, bylaws)
14. Authorization to borrow (corporate resolution or member consent)
15. UCC search results
16. Credit report (within 30 days)
17. Rent roll (for income-producing property, within 60 days)
18. Lease copies (for income-producing property)
19. DSCR / global cash flow analysis
20. Collateral valuation memo
21. Loan presentation / credit memo
22. Compliance checklist (HMDA, CRA, fair lending if applicable)

Format: A Markdown table with columns:
| # | Document | Status | Staleness Risk | Priority |
Where Status = Present / Missing / Expired / Not Applicable
Staleness Risk = Current / Approaching Expiry / Stale / N/A
Priority = Critical / High / Medium / Low

After the table, provide:
- A one-paragraph summary of overall file readiness (suitable for the loan officer's memo)
- A count: [X] of 22 items present, [Y] missing, [Z] expired

Constraints:
- Do not assess the quality or adequacy of any document — only its presence or absence.
- If a document type is not applicable (e.g., Environmental Phase I for an office refinance with no change in use), mark as "Not Applicable" with a brief reason.
- Do not make loan approval recommendations. This is a documentation completeness tool, not a credit decision tool.
- Flag any item marked "Expired" with the staleness threshold (e.g., "PFS older than 90 days").`,
    tags: ['skill-builder', 'loan-documentation', 'checklist', 'RTFC'],
  },
  {
    id: 'm7-operations-exception-report',
    title: 'Daily Exception Report Analyzer',
    platform: 'claude',
    role: 'operations',
    difficulty: 'advanced',
    relatedModule: 7,
    timeEstimate: '20 minutes',
    expectedOutput: 'A prioritized exception summary grouped by category, with pattern identification across recent reports and a recommended triage sequence for the operations team.',
    promptText: `You are an Operations Manager at a $500M community bank with responsibility for deposit operations, wire transfers, and ACH processing. You have 10 years of experience triaging daily exception reports and know which exceptions are routine and which require immediate escalation.

Context: I will provide you with today's exception report (typically 15-40 line items from our core system export). Each exception includes: date, account number (masked), exception type, dollar amount, and originating department. The output will be used to prioritize the operations team's morning triage.

Task:
1. Group exceptions by category (overdraft, ACH return, wire hold, dormant account activity, large transaction, new account, other)
2. Within each category, sort by dollar amount descending
3. Identify any patterns: multiple exceptions on the same account, unusual volume in any category vs. typical daily counts, or dollar amounts exceeding $10,000 (BSA/AML reporting threshold)
4. Produce a recommended triage sequence (what to handle first, second, third) based on regulatory urgency, dollar exposure, and customer impact

Format:
EXCEPTION SUMMARY — [DATE]
Total exceptions: [count]
[Category breakdown table]

PRIORITY TRIAGE SEQUENCE
1. [Category/item] — [reason this is first priority]
2. [Category/item] — [reason]
3. [Category/item] — [reason]

PATTERN ALERTS
- [Any unusual patterns detected]

Constraints:
- Never display full account numbers. Use last-four masking: ****1234.
- If any single transaction exceeds $10,000 in cash or cash equivalents, flag it as "[CTR REVIEW]" — do not assess whether a CTR is required; that is a BSA officer decision.
- Do not dismiss any exception as "routine" — categorize and rank all of them. Ops staff make the judgment call; you provide the organized data.
- If the report contains customer names, replace them with "[Customer]" in your output.`,
    tags: ['skill-builder', 'exception-report', 'triage', 'RTFC'],
  },
  {
    id: 'm7-compliance-sar-narrative',
    title: 'SAR Narrative Drafting Assistant',
    platform: 'claude',
    role: 'compliance',
    difficulty: 'advanced',
    relatedModule: 7,
    timeEstimate: '25 minutes',
    expectedOutput: 'A structured SAR narrative draft following FinCEN formatting conventions, with all five required elements addressed and clear flags for BSA officer review before filing.',
    promptText: `You are a BSA/AML Compliance Analyst at a community bank with expertise in Suspicious Activity Report narrative drafting. You have reviewed FinCEN's SAR narrative guidance and understand the five required elements of an effective SAR narrative.

Context: I will provide you with an investigation summary containing: subject information (sanitized), transaction details, investigative findings, and the triggering alert. My institution files approximately 40-60 SARs per year. The output will be reviewed and edited by the BSA Officer before filing — this is a draft, not a final filing.

Task: Draft a SAR narrative that addresses all five elements required by FinCEN:
1. Who is conducting the suspicious activity?
2. What instruments or mechanisms are being used?
3. When did the activity occur (dates, times, frequency)?
4. Where did the activity take place (branches, channels, jurisdictions)?
5. Why is the activity suspicious (what makes it inconsistent with expected behavior)?

Format:
SAR NARRATIVE — DRAFT
Filing Type: [Initial / Continuing / Amendment]
Subject: [As provided]
Date Range: [As provided]

[Narrative organized by the five elements above, written in third person, past tense, factual tone]

BSA OFFICER REVIEW FLAGS
- [Items requiring BSA officer judgment or additional investigation]

Constraints:
- This is a DRAFT. Mark it clearly as "DRAFT — REQUIRES BSA OFFICER REVIEW BEFORE FILING" at the top and bottom.
- Do not make a determination of criminal activity. Describe the facts and explain why they are suspicious — the determination is a law enforcement function.
- Use precise language: "appears inconsistent with" rather than "is suspicious." The narrative supports the filing; it does not make accusations.
- Do not include information you are unsure about. Flag gaps as "[VERIFY: additional detail needed on X]."
- Write in third person, past tense. Do not use "we" or "our bank."
- Do not cite specific criminal statutes. Describe behavior patterns; let law enforcement determine applicable statutes.`,
    tags: ['skill-builder', 'SAR', 'BSA-AML', 'compliance', 'RTFC'],
  },
  {
    id: 'm7-finance-variance-analysis',
    title: 'Monthly Variance Commentary Generator',
    platform: 'chatgpt',
    role: 'finance',
    difficulty: 'advanced',
    relatedModule: 7,
    timeEstimate: '20 minutes',
    expectedOutput: 'A board-ready variance commentary document with material items explained in plain language, trend context, and management discussion prompts for the CFO.',
    promptText: `You are a Senior Financial Analyst at a community bank ($400M in assets) with expertise in management reporting and board presentations. You prepare monthly income statement variance analysis reports for the CFO and Board Finance Committee.

Context: I will provide you with the current month's income statement alongside the budget and prior year comparative. The output will be incorporated into the monthly board report package. The board includes directors who are not financial professionals — clarity and plain language are essential.

Task:
1. Identify all line items where actual vs. budget variance exceeds 5% AND $25,000 (both thresholds must be met — small dollar variances on large percentage swings are not material for board reporting)
2. For each material variance, provide:
   - Dollar and percentage variance
   - Direction (favorable or unfavorable)
   - A one-sentence plain-language explanation
   - Whether this is a timing issue, a trend, or an anomaly
3. Compare material variances to the same month in the prior year to identify emerging trends
4. Produce a three-sentence CFO commentary paragraph suitable for the board report cover letter

Format:
MONTHLY VARIANCE REPORT — [MONTH/YEAR]

MATERIAL VARIANCES
| Line Item | Budget | Actual | $ Var | % Var | F/U | Type | Commentary |

TREND COMPARISON (vs. Prior Year Same Month)
[Narrative paragraph identifying emerging patterns]

CFO COMMENTARY (for board report cover letter)
[Three sentences maximum]

Constraints:
- Use thousands ($000s) for all figures. Round to nearest thousand.
- "Favorable" means higher revenue or lower expense. "Unfavorable" is the opposite. Do not reverse this convention.
- Do not speculate on causes beyond what the financial data supports. If the cause is not apparent, write "Requires management discussion — cause not evident from financial data."
- Do not recommend budget adjustments. Variance analysis describes what happened; budget revision is a management decision.
- If provision for loan losses shows a material variance, always flag it as "[ALLL REVIEW — discuss with Chief Credit Officer]" regardless of direction.`,
    tags: ['skill-builder', 'variance-analysis', 'board-reporting', 'RTFC'],
  },
  {
    id: 'm7-marketing-campaign-copy',
    title: 'Product Campaign Copy Writer',
    platform: 'gemini',
    role: 'marketing',
    difficulty: 'advanced',
    relatedModule: 7,
    timeEstimate: '20 minutes',
    expectedOutput: 'A complete campaign copy package with headline options, body copy for three channels, and compliance-checked disclosures — ready for marketing manager and compliance review.',
    promptText: `You are a Marketing Communications Specialist at a community bank with 8 years of experience in financial services marketing. You understand UDAP/UDAAP requirements, Regulation DD (Truth in Savings), and the difference between marketing claims and regulatory disclosures.

Context: My institution is a community bank serving [REGION]. We are launching a campaign for [PRODUCT TYPE: e.g., home equity line of credit, business checking, CD special]. The campaign will run across direct mail, email, and branch lobby materials. All copy must pass compliance review before production.

Task: Create a campaign copy package with the following components:

1. THREE headline options (each under 12 words, no superlatives, no guarantees)
2. Direct mail body copy (150-200 words, professional but warm community bank tone)
3. Email body copy (100-150 words, slightly more conversational, with clear CTA)
4. Branch lobby flyer copy (75-100 words, scannable with bullet points)
5. Required disclosures section (Reg DD for deposits, TILA for credit products, UDAP-compliant language)

Format:
CAMPAIGN COPY PACKAGE — [PRODUCT NAME]

HEADLINES
A. [headline]
B. [headline]
C. [headline]

DIRECT MAIL
[copy]

EMAIL
Subject line: [subject]
[copy]

BRANCH FLYER
[copy]

REQUIRED DISCLOSURES
[regulatory disclosures appropriate to product type]

Constraints:
- Never use "free" without qualification (UDAP risk). If there are conditions, state them.
- Do not use "guaranteed" with any variable-rate product.
- All rate references must include: APY or APR as appropriate, effective date, and minimum balance/amount if applicable.
- Do not use competitor names or comparative claims.
- Do not promise approval or pre-qualification in marketing copy.
- Mark any claim that needs compliance verification with "[COMPLIANCE CHECK]."
- No exclamation points. No emojis. Community bank institutional tone.`,
    tags: ['skill-builder', 'campaign-copy', 'marketing', 'RTFC'],
  },
] as const;

// ---------------------------------------------------------------------------
// Additional reference prompts (browsable library)
// ---------------------------------------------------------------------------

const additionalPrompts: readonly Prompt[] = [
  {
    id: 'ref-exec-board-prep',
    title: 'Board Meeting AI Update Preparation',
    platform: 'claude',
    role: 'executive',
    difficulty: 'intermediate',
    relatedModule: 4,
    timeEstimate: '15 minutes',
    expectedOutput: 'A one-page board update on AI adoption progress with metrics, risk assessment, and recommended next steps — in board-appropriate language.',
    promptText: `You are a senior banking consultant preparing a quarterly board update on AI adoption for a community bank CEO. The CEO needs to report to the board on AI progress without overpromising or creating unrealistic expectations.

I will provide: current AI tools in use, number of staff trained, specific productivity gains documented, and any incidents or concerns raised.

Produce a one-page board update with these sections:
1. Executive Summary (3 sentences maximum)
2. Adoption Metrics (table: tool, users, documented time savings per week)
3. Risk Assessment (any data handling concerns, compliance gaps, or vendor issues)
4. Peer Context (how our adoption compares to community banks in the $300M-$1B range — use general industry knowledge, not fabricated benchmarks)
5. Recommended Next Steps (2-3 specific, actionable items with estimated cost and timeline)

Constraints:
- Board members range from tech-savvy to tech-skeptical. Use plain language throughout.
- Do not use the phrase "AI-powered" or "cutting-edge." These trigger skepticism in experienced directors.
- Quantify everything possible. "Staff report saving time" is weak. "Four lending staff report saving 45 minutes per week on document review" is board-ready.
- Do not fabricate peer benchmarks. If you do not have specific data, write "Industry surveys suggest [general trend]" with the source name.
- Keep the entire document under 500 words. Board members do not read long updates.`,
    tags: ['board-reporting', 'executive', 'AI-adoption'],
  },
  {
    id: 'ref-retail-product-qa',
    title: 'Product Knowledge Q&A Assistant',
    platform: 'chatgpt',
    role: 'retail',
    difficulty: 'beginner',
    relatedModule: 3,
    timeEstimate: '10 minutes',
    expectedOutput: 'A Custom Instruction that turns ChatGPT into a product knowledge assistant, answering common customer questions using only your institution\'s approved product information.',
    promptText: `Set these as your Custom Instructions for a product knowledge assistant:

---

You are a product knowledge assistant for frontline banking staff at a community bank. Staff will ask you questions about our products and services so they can respond to customer inquiries accurately.

When answering:
1. Provide the factual product details (rates, terms, fees, eligibility)
2. Suggest one cross-sell opportunity if relevant (e.g., customer asking about checking may benefit from knowing about our savings products)
3. Flag any answer that involves compliance-sensitive information with "[VERIFY WITH COMPLIANCE BEFORE QUOTING TO CUSTOMER]"

Constraints:
- Only answer based on the product information I have provided. If I have not given you information about a product, say "I do not have current information on [product]. Check the product sheet or ask your supervisor."
- Never provide specific rate quotes unless I have given you current rates. Rates change; stale rates create Reg DD issues.
- Never advise a customer to close an account at another institution. That is the customer's decision.
- If a question involves a complaint, a legal matter, or a regulatory issue, respond only with "This should be referred to [department]. Do not attempt to resolve this at the teller line."

---

After setting this, upload your institution's current product rate sheet and fee schedule as reference documents in a ChatGPT Project.`,
    tags: ['custom-instructions', 'retail', 'product-knowledge'],
  },
  {
    id: 'ref-it-vendor-assessment',
    title: 'AI Vendor Due Diligence Questionnaire',
    platform: 'claude',
    role: 'it',
    difficulty: 'advanced',
    relatedModule: 4,
    timeEstimate: '20 minutes',
    expectedOutput: 'A 25-question due diligence questionnaire organized by risk domain, ready to send to an AI vendor as part of your TPRM process.',
    promptText: `You are an IT Risk Manager at a community bank conducting third-party risk management (TPRM) due diligence on a prospective AI vendor. Your institution follows interagency TPRM guidance and OCC Bulletin 2013-29 / 2023-17 principles.

The vendor provides: [DESCRIBE VENDOR SERVICE — e.g., AI-powered document extraction for loan processing, AI chatbot for customer service, AI credit scoring model].

Task: Generate a due diligence questionnaire I can send to this vendor covering these risk domains:

1. Data Security & Privacy (5 questions — where is data stored, encrypted, who has access, retention, deletion)
2. Model Governance (5 questions — model validation, bias testing, explainability, drift monitoring, audit trails)
3. Regulatory Compliance (5 questions — fair lending, ECOA/Reg B, UDAP, consumer data rights, examination readiness)
4. Business Continuity (3 questions — uptime SLA, disaster recovery, data portability)
5. Contractual Protections (4 questions — indemnification, data ownership, subcontractor oversight, termination rights)
6. Financial Viability (3 questions — funding status, insurance, reference clients in banking)

Format: Numbered questionnaire organized by section, with each question on its own line. Include a brief instruction header explaining the purpose and expected response format.

Constraints:
- Frame questions as requests for documentation, not yes/no questions. "Provide your SOC 2 Type II report" not "Do you have a SOC 2?"
- Do not ask about proprietary model architecture — vendors will not disclose this. Focus on governance, outputs, and controls.
- Include a question about the vendor's own use of customer data for model training — this is the single most important data privacy question for banking AI vendors.
- Do not reference specific vendor names or products. Keep the questionnaire generic enough to reuse across vendors.`,
    tags: ['vendor-management', 'TPRM', 'due-diligence', 'IT-risk'],
  },
] as const;

// ---------------------------------------------------------------------------
// S-level gated prompts — visible to AiBI Foundations completers but unlocked at AiBI-S
// ---------------------------------------------------------------------------

const sLevelPrompts: readonly Prompt[] = [
  {
    id: 's-departmental-workflow-orchestration',
    title: 'Departmental Workflow Orchestration',
    platform: 'claude',
    role: 'operations',
    difficulty: 'advanced',
    relatedModule: 7,
    timeEstimate: '30 minutes',
    expectedOutput: 'A three-stage orchestration plan that chains a document-intake skill, an exception-detection skill, and a routing-and-notification skill into a single department workflow — with handoff logic and error conditions defined at each stage.',
    promptText: `You are an Operations Transformation Specialist at a community bank designing a multi-stage AI workflow for the deposit operations team.

Context: The team currently runs three separate AI skills in isolation:
1. Document Intake Classifier — routes inbound documents (wires, ACH exceptions, account maintenance) to the correct queue
2. Exception Analyzer — prioritizes each day's exception report by regulatory urgency and dollar exposure
3. Routing and Notification Composer — drafts triage assignments and supervisor alerts

Task: Design a workflow orchestration spec that chains all three skills into a single morning operations routine, running sequentially with defined handoffs.

For each stage, specify:
- Input: what data enters the stage (source, format, any conditioning required)
- Processing: what the AI skill does and what constraints apply
- Output: what leaves this stage and what triggers the next
- Error condition: what happens if the stage produces an ambiguous or incomplete result

Then produce:
- A decision tree for the routing stage (which exceptions go to which staff member, by category and dollar threshold)
- A supervisor escalation trigger (conditions that bypass normal routing and go directly to the manager)
- A daily time estimate for the full orchestrated workflow vs. the current manual process

Constraints:
- No customer PII in any stage output — use account masking throughout
- CTR review flag (transactions over $10,000) must be preserved through all three stages; it cannot be cleared by the workflow
- The orchestration must be executable by a non-technical operations manager — no code, no API calls, no automation platforms required
- Each stage must be independently testable before the full chain is deployed`,
    tags: ['workflow-orchestration', 'multi-skill', 'operations', 'advanced'],
  },
  {
    id: 's-vendor-ai-evaluation-scorecard',
    title: 'Vendor AI Evaluation Scorecard',
    platform: 'claude',
    role: 'it',
    difficulty: 'advanced',
    relatedModule: 4,
    timeEstimate: '25 minutes',
    expectedOutput: 'A structured 5-question scoring framework that produces a 0–100 vendor score across data security, regulatory alignment, explainability, vendor stability, and total cost — with a recommendation threshold and a hard stop on fair lending failures.',
    promptText: `You are a Senior IT Risk Officer at a community bank ($600M in assets) evaluating an AI vendor for a specific use case: [DESCRIBE USE CASE — e.g., AI-assisted underwriting support, AI document extraction, AI customer service routing].

Your institution follows SR 11-7 model risk management guidance, interagency TPRM principles (OCC Bulletin 2023-17), and the AIEOG AI Lexicon definitions for explainability and human-in-the-loop controls.

Task: Produce a 5-question scoring framework — one master question per domain — that yields a 100-point vendor evaluation score. Each question must:

1. State the evaluation criterion in plain language
2. Define a 4-tier response scale with specific point values (0 / partial / full / exceeds)
3. Specify what documentary evidence the vendor must provide to support each score
4. Identify the regulatory citation that makes this criterion non-negotiable

The five domains are:
1. Customer data handling and PII controls (25 points)
2. Regulatory alignment — SR 11-7, ECOA/Reg B, UDAP (20 points)
3. Explainability and human-in-the-loop controls per AIEOG Lexicon (20 points)
4. Vendor financial stability and community banking references (15 points)
5. All-in pricing and exit provisions (20 points)

After the scorecard, produce:
- A scoring matrix (table: domain, max points, actual points, evidence collected)
- Recommendation thresholds: 75+ = Proceed, 60-74 = Conditional, below 60 = Do not proceed
- One hard-stop criterion: if the ECOA/Reg B explainability score is zero, the vendor is disqualified from any credit-decision use case regardless of total score
- A one-paragraph recommendation narrative template for the board risk committee

Constraints:
- All regulatory citations must be specific and correct. Use "SR 11-7" not "Fed guidance." Use "AIEOG AI Lexicon" not "industry definitions."
- The HITL definition must match the AIEOG Lexicon: a human with appropriate authority, information, and time to intervene before the AI decision takes effect
- Do not create criteria that a vendor can satisfy with marketing materials alone. Evidence must be documentary (SOC 2, validation reports, contract language)`,
    tags: ['vendor-evaluation', 'TPRM', 'scorecard', 'IT-risk', 'advanced'],
  },
  {
    id: 's-team-skill-library-template',
    title: 'Team Skill Library Template',
    platform: 'chatgpt',
    role: 'executive',
    difficulty: 'advanced',
    relatedModule: 8,
    timeEstimate: '25 minutes',
    expectedOutput: 'A department-level skill library template with a standardized skill registry format, a skill submission and review process, a quarterly audit checklist, and a skill deprecation policy — ready for a department head to adopt and manage.',
    promptText: `You are an AI Transformation Lead at a community bank helping a department head build and manage a sustainable skill library for their team.

Context: The department has completed AiBI Foundations and individual staff have built 6-12 skills. Skills are currently stored inconsistently (some in personal ChatGPT Projects, some in shared drives, some only in individuals' heads). The goal is to create a department-level skill library that:
- Makes skills discoverable and usable by any qualified team member
- Ensures skills are reviewed, approved, and compliant before shared use
- Identifies skills that are stale, superseded, or no longer compliant

Task: Produce a complete Team Skill Library management template with four components:

1. SKILL REGISTRY FORMAT
A standardized one-page skill record for each skill in the library. Include fields for: skill name, use case description, platform, author, review date, compliance status, data classification tier(s), known limitations, and version number.

2. SKILL SUBMISSION AND REVIEW PROCESS
A 4-step process for submitting a new skill to the department library. Include: submission requirements, who reviews (role, not name), review criteria (what makes a skill library-ready vs. individual-use only), and approval documentation.

3. QUARTERLY AUDIT CHECKLIST
A checklist the department head runs every quarter to verify: skills are current with any regulatory changes, platform changes have not broken skill behavior, data classification tiers are still appropriate, and skills built around a specific vendor tool remain valid if the tool has changed.

4. SKILL DEPRECATION POLICY
Criteria for retiring a skill from the library: trigger conditions, notification process, and archival procedure (skills should be archived, not deleted — they may be useful for audit trail purposes).

Constraints:
- The template must be usable by a department head with no IT support. No automation, no databases, no code.
- All compliance language must reference the three-tier data classification framework (Tier 1 public / Tier 2 internal / Tier 3 restricted)
- Include a field for "last tested against current platform version" — platforms update frequently and skills degrade without maintenance
- Do not create a bureaucratic process that discourages skill sharing. The review step should take under 30 minutes for a standard skill`,
    tags: ['skill-management', 'team-library', 'department-operations', 'advanced'],
  },
] as const;

// ---------------------------------------------------------------------------
// L-level gated prompts — visible to AiBI-S completers but unlocked at AiBI-L
// ---------------------------------------------------------------------------

const lLevelPrompts: readonly Prompt[] = [
  {
    id: 'l-board-ai-strategy-deck-generator',
    title: 'Board AI Strategy Deck Generator',
    platform: 'claude',
    role: 'executive',
    difficulty: 'advanced',
    relatedModule: 9,
    timeEstimate: '35 minutes',
    expectedOutput: 'A complete 10-slide board presentation outline with speaker notes, data placeholders keyed to FDIC BankFind Suite and Jack Henry research, risk disclosures, and a board resolution template for AI governance policy adoption.',
    promptText: `You are an AI Strategy Advisor preparing a board-level presentation for a community bank CEO. The audience is a 7-person board of directors with mixed technical backgrounds: 2 former bankers, 2 business owners, 1 attorney, 1 CPA, and 1 technology executive.

The bank's profile: $[ASSET SIZE]M in assets, $[FTE COUNT] FTE, efficiency ratio of [EFFICIENCY RATIO]% (source: FDIC BankFind Suite). The board has not received a formal AI strategy presentation before.

Task: Produce a complete 10-slide board presentation outline. For each slide, provide:
- Slide title
- Three to five bullet points (the actual content, not placeholders)
- Speaker notes (2-3 sentences the CEO can use verbatim)
- Any data that should appear on the slide, with source citations

Slide structure:
1. Why AI, Why Now — market context using sourced statistics
2. What Our Peers Are Doing — community bank AI adoption data (cite Jack Henry 2025 report)
3. What We Are Already Doing — current AI tool inventory (use [TOOL LIST] placeholder)
4. The Efficiency Opportunity — ROI model using institution's own FTE count and efficiency ratio
5. Regulatory Landscape — what examiners are looking for (SR 11-7, TPRM, AIEOG Lexicon)
6. Our Governance Framework — three-layer model: policy, oversight, training
7. Risk Assessment — what we are managing, what we are watching, what we are avoiding
8. The 12-Month Roadmap — three phases with named owners and success metrics
9. Resource Requirements — budget, staffing, and training investment
10. Board Resolution — formal adoption of AI governance policy

After the outline, produce a draft board resolution (two paragraphs) authorizing the bank's AI governance framework and designating an AI oversight committee.

Constraints:
- All statistics must cite named sources. Use Jack Henry 2025, FDIC Quarterly Banking Profile Q4 2024, and Gartner via Jack Henry where applicable. Do not fabricate benchmarks.
- The efficiency ratio slide must use the institution's actual FDIC-reported figure, not an industry average. Insert [FDIC EFFICIENCY RATIO] as a placeholder if not provided.
- Do not use "AI-powered," "cutting-edge," or "revolutionary." Directors have seen too many technology presentations that overpromised.
- The risk slide must include regulatory risk of inaction (operating without a governance framework while staff use consumer AI) — not just risk of action
- Speaker notes must be in plain language. Assume the CEO is not a technologist.`,
    tags: ['board-presentation', 'AI-strategy', 'governance', 'executive', 'advanced'],
  },
  {
    id: 'l-efficiency-ratio-scenario-modeling',
    title: 'Efficiency Ratio Scenario Modeling',
    platform: 'chatgpt',
    role: 'finance',
    difficulty: 'advanced',
    relatedModule: 9,
    timeEstimate: '30 minutes',
    expectedOutput: 'A three-scenario efficiency ratio model (conservative / base / optimistic) showing projected impact of AI-driven productivity gains on the institution\'s efficiency ratio over 24 months, using FDIC BankFind Suite baseline data and sourced productivity assumptions.',
    promptText: `You are a Financial Strategy Analyst at a community bank building a 24-month AI productivity model for the CFO and board.

Institution data (pull from FDIC BankFind Suite at banks.data.fdic.gov):
- Current efficiency ratio: [FDIC EFFICIENCY RATIO]%
- Total non-interest expense: $[NIE]M
- Total revenue (NII + non-interest income): $[REVENUE]M
- Total FTE: [FTE COUNT]
- Average cost per FTE (burdened): $[COST PER FTE]

Community bank median efficiency ratio: ~65% (FDIC CEIC data, 1992-2025)
Industry-wide efficiency ratio: ~55.7% (FDIC Quarterly Banking Profile Q4 2024)

Task: Produce a three-scenario efficiency ratio model showing projected impact of AI adoption on the institution's efficiency ratio over 24 months.

For each scenario (Conservative / Base / Optimistic), model:
1. Productivity assumption: hours saved per FTE per week (Conservative: 1.5 hrs, Base: 3 hrs, Optimistic: 5 hrs) — source: Jack Henry 2025 Getting Started in AI
2. Dollar value of productivity gain: FTE count × hours/week × burdened hourly rate × 50 working weeks
3. Projected non-interest expense reduction (assume 60% of productivity gain flows to NIE reduction in Year 1, 80% in Year 2 as processes are restructured)
4. Projected efficiency ratio at 12 months and 24 months
5. Basis points of improvement vs. current ratio
6. Gap to community bank median (65%) and industry benchmark (55.7%)

Format output as:
- A summary table (scenario × metric × Year 1 × Year 2)
- Narrative paragraph for CFO (3 sentences, suitable for board report)
- Key assumption list with citations
- Sensitivity note: what has to be true for the Optimistic scenario to materialize

Constraints:
- All productivity assumptions must cite a source. Use Jack Henry 2025 or Gartner via Jack Henry.
- The model must show the gap to peer benchmarks — the goal is not just improvement but convergence toward the industry median
- Do not present cost reduction as guaranteed. Frame as "projected under stated assumptions" throughout.
- Include a VERIFY placeholder wherever institution-specific data is required: [VERIFY: pull from FDIC BankFind Suite]
- Do not model revenue growth — this model is limited to expense-side productivity only. Revenue impact of AI is a separate analysis.`,
    tags: ['efficiency-ratio', 'scenario-modeling', 'FDIC', 'finance', 'board-reporting', 'advanced'],
  },
] as const;

// ---------------------------------------------------------------------------
// All prompts combined
// ---------------------------------------------------------------------------

export const ALL_PROMPTS: readonly Prompt[] = [
  ...m3Prompts,
  ...m4Prompts,
  ...m7Prompts,
  ...additionalPrompts,
  ...sLevelPrompts,
  ...lLevelPrompts,
] as const;

export function getPromptById(id: string): Prompt | null {
  return ALL_PROMPTS.find((p) => p.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Module 3 — Mini Tutorials
// ---------------------------------------------------------------------------

export const M3_TUTORIALS: readonly MiniTutorial[] = [
  {
    id: 'tut-m3-chatgpt-first-query',
    title: 'Your First ChatGPT Banking Query',
    platform: 'chatgpt',
    role: 'all',
    difficulty: 'beginner',
    relatedModule: 3,
    timeEstimate: '5 minutes',
    introduction: 'This tutorial walks you through your first interaction with ChatGPT using a banking-specific prompt. The goal is not to produce a perfect output — it is to experience what a structured prompt produces compared to a vague one.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Open ChatGPT',
        detail: 'Navigate to chat.openai.com and sign in. If you have a paid account (Plus or Team), you will have access to GPT-4. Free accounts use GPT-3.5 — the exercise works with either model, but outputs will differ in depth.',
        screenshotPlaceholder: 'ChatGPT home screen with new conversation',
      },
      {
        stepNumber: 2,
        instruction: 'Paste the prompt below into the message box',
        detail: 'Copy the entire prompt text below. Do not modify it for your first attempt — use it exactly as written so you can see what a structured prompt produces. You will customize it afterward.',
      },
      {
        stepNumber: 3,
        instruction: 'Review the output',
        detail: 'Read through the AI response. Notice how the output is structured — it follows the format you specified in the prompt. Compare this to what you would get from a vague question like "tell me about regulatory changes."',
        screenshotPlaceholder: 'ChatGPT response showing structured regulatory summary',
      },
      {
        stepNumber: 4,
        instruction: 'What to look for in the response',
        detail: 'Check three things: (1) Did it use the format you specified? (2) Did it add the "[verify citation]" flags where it was unsure? (3) Is the language appropriate for a compliance committee — no jargon, no filler? If it did all three, the prompt structure worked. If it missed one, that tells you which component to strengthen.',
      },
    ],
    prompt: m3Prompts[0],
    whatWentWell: 'A well-structured prompt produces a consistently formatted, audience-appropriate output. Notice how specifying the audience (compliance committee), the format (numbered points with specific sub-items), and the constraints (word limit, verify citations) shaped every aspect of the response. This is the difference between prompting and professional AI use.',
    whatToWatchFor: 'The AI may cite specific regulation numbers or dates that sound authoritative but are fabricated. This is why the constraint "write [verify citation] if unsure" matters — it teaches the AI to flag its own uncertainty rather than inventing plausible-sounding references. Always verify any regulatory citation against the actual source document before using it in institutional communications.',
  },
  {
    id: 'tut-m3-copilot-email',
    title: 'Your First Copilot Email Draft',
    platform: 'copilot',
    role: 'all',
    difficulty: 'beginner',
    relatedModule: 3,
    timeEstimate: '5 minutes',
    introduction: 'This tutorial demonstrates using Microsoft 365 Copilot in Outlook to draft a customer communication. If you do not have Copilot, use ChatGPT or Claude with the same prompt — the principles apply across platforms.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Open Outlook and start a new email',
        detail: 'If you have Microsoft 365 Copilot, click the Copilot icon in the new email compose window. If you do not have Copilot, open ChatGPT or Claude instead and paste the prompt there.',
        screenshotPlaceholder: 'Outlook compose window with Copilot icon highlighted',
      },
      {
        stepNumber: 2,
        instruction: 'Paste the prompt below',
        detail: 'Replace the [PLACEHOLDER] values with your actual product details if you have them. If not, use realistic fictional values — the exercise is about prompt structure, not specific rates.',
      },
      {
        stepNumber: 3,
        instruction: 'Review the draft for tone and compliance',
        detail: 'Read the draft as if you were the customer receiving it. Does it sound like your institution? Does it avoid making promises about rates or returns? Is the tone relationship-focused rather than transactional?',
        screenshotPlaceholder: 'Generated email draft in Outlook',
      },
      {
        stepNumber: 4,
        instruction: 'Edit and personalize',
        detail: 'AI-generated email drafts are starting points, not final products. Add the customer\'s name, adjust the tone to match your institution\'s voice, and verify that all rate and product information is current. The value is in the 80% of the draft that is structurally sound — you add the 20% that makes it personal.',
      },
    ],
    prompt: m3Prompts[1],
    whatWentWell: 'The prompt produced a professional, compliance-safe email draft in under a minute. The constraints prevented common problems: no superlative claims about rates, no exclamation points, no marketing language in a service communication. This is exactly the kind of output that justifies the time investment in learning structured prompting.',
    whatToWatchFor: 'Copilot may pull in data from your recent emails or calendar — this is a feature, not a bug, but review the draft carefully to ensure it has not included sensitive information from unrelated communications. Also verify that any rate or product information is current — AI does not know your institution\'s current rate sheet.',
  },
  {
    id: 'tut-m3-claude-analysis',
    title: 'Your First Claude Document Analysis',
    platform: 'claude',
    role: 'all',
    difficulty: 'beginner',
    relatedModule: 3,
    timeEstimate: '10 minutes',
    introduction: 'This tutorial introduces Claude\'s document analysis capability. Claude\'s 200K token context window makes it particularly strong for analyzing lengthy policy documents — a common banking task. You will upload a document and ask Claude to identify the provisions that matter most for daily operations.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Open Claude and start a new conversation',
        detail: 'Navigate to claude.ai and sign in. If you have a Pro account, you will have access to Claude\'s full context window. For this exercise, select a policy document from your institution that is approved for external tool use under your data classification policy (Tier 1 or Tier 2 data only — see Module 5).',
        screenshotPlaceholder: 'Claude home screen with new conversation',
      },
      {
        stepNumber: 2,
        instruction: 'Paste the prompt below, then upload your document',
        detail: 'Paste the prompt first, then use the attachment button to upload the PDF. If you do not have an approved document available, use a publicly available policy template — many state banking associations publish sample policies. The exercise works with any multi-page policy document.',
      },
      {
        stepNumber: 3,
        instruction: 'Review the analysis table',
        detail: 'Claude should produce a Markdown table with the five most important provisions. Check: Did it correctly identify operational provisions vs. administrative ones? Did it flag genuinely ambiguous language? Did it assign departments correctly?',
        screenshotPlaceholder: 'Claude response showing structured policy analysis table',
      },
      {
        stepNumber: 4,
        instruction: 'Test the executive summary',
        detail: 'Read the two-sentence executive summary aloud. Could you use it to open a committee meeting? If it sounds like it was written by someone who actually read the document (not a generic AI summary), the prompt worked. If it is vague or generic, the document may not have had enough specificity for the AI to extract meaningful provisions.',
      },
    ],
    prompt: m3Prompts[2],
    whatWentWell: 'Claude excels at document analysis because of its long context window — it can process the entire document at once rather than chunking it. The structured output format (table + executive summary) makes the analysis immediately usable in a committee setting. The "[NEEDS REVIEW]" flag gives you confidence that the AI is being honest about its uncertainty.',
    whatToWatchFor: 'Two risks to manage: (1) Data classification — before uploading any document, confirm it meets your institution\'s data classification standard for external AI tools. When in doubt, use a publicly available sample document. (2) Completeness — Claude may miss provisions that use unusual formatting or are buried in appendices. Always review the original document alongside the AI analysis.',
  },
] as const;

// ---------------------------------------------------------------------------
// Module 7 — Starter Skill Tutorials
// ---------------------------------------------------------------------------

export const M7_TUTORIALS: readonly MiniTutorial[] = [
  {
    id: 'tut-m7-loan-checklist',
    title: 'Build a Loan File Completeness Checker',
    platform: 'chatgpt',
    role: 'lending',
    difficulty: 'advanced',
    relatedModule: 7,
    timeEstimate: '20 minutes',
    introduction: 'This tutorial walks you through building a complete lending skill using the RTFC Framework. By the end, you will have a reusable prompt that checks any commercial loan file for missing or expired documentation — saving 15-20 minutes per file review.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Open ChatGPT and create a new Project',
        detail: 'Go to ChatGPT, click "Projects" in the sidebar, and create a new project named "Loan File QC." This keeps your lending skill separate from other conversations and preserves the custom instructions.',
      },
      {
        stepNumber: 2,
        instruction: 'Paste the skill prompt into the Project Instructions',
        detail: 'Open your new Project\'s settings and paste the complete prompt below into the Custom Instructions field. This prompt uses all four RTFC components: Role (Senior Credit Analyst), Task (gap analysis against 22-item checklist), Format (Markdown table), and Constraints (no quality assessment, no approval recommendations).',
      },
      {
        stepNumber: 3,
        instruction: 'Test with a sample loan file document list',
        detail: 'In a new conversation within the Project, type a list of documents in a test loan file. For example: "Documents in file: signed application, 2023 and 2024 business tax returns, appraisal dated 14 months ago, flood determination, current rent roll, entity formation docs." The skill should flag the missing items, note the stale appraisal, and produce the gap analysis table.',
        screenshotPlaceholder: 'ChatGPT Project with loan file analysis output',
      },
      {
        stepNumber: 4,
        instruction: 'Improve the output',
        detail: 'Review the gap analysis. If items are miscategorized, add clarifying language to the Task component. If the priority ratings seem off, add a constraint specifying your institution\'s priority rules (e.g., "Appraisal and flood determination are always Critical priority"). Save the updated instructions. This is the iteration cycle: test, review, refine.',
      },
    ],
    prompt: m7Prompts[0],
    whatWentWell: 'A well-built loan file skill replaces a manual process that takes 15-20 minutes per file with a 2-minute AI check. The RTFC structure ensures consistent output across different loan officers and file compositions. The 22-item checklist embedded in the prompt means nothing gets missed — even items that experienced loan officers might overlook through familiarity.',
    whatToWatchFor: 'This skill checks documentation presence, not quality. A "present" appraisal that is 18 months old is flagged for staleness, but an appraisal with methodological problems will show as "present" and pass this check. Document quality review remains a human judgment task. Also: do not upload actual loan files to consumer AI tools. Use document lists only, with all PII removed.',
  },
  {
    id: 'tut-m7-exception-report',
    title: 'Build a Daily Exception Report Analyzer',
    platform: 'claude',
    role: 'operations',
    difficulty: 'advanced',
    relatedModule: 7,
    timeEstimate: '20 minutes',
    introduction: 'This tutorial builds an operations skill that transforms a raw exception report export into a prioritized, categorized triage plan. Instead of scanning 30 line items manually each morning, you will have a structured summary with pattern detection in under 3 minutes.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Open Claude and create a new Project',
        detail: 'In Claude, create a new Project named "Daily Exception Triage." Open the Project settings and paste the skill prompt into the Project Instructions field.',
      },
      {
        stepNumber: 2,
        instruction: 'Paste the skill prompt into Project Instructions',
        detail: 'The prompt establishes the Role (Operations Manager with 10 years of triage experience), the Task (categorize, sort, identify patterns, recommend triage sequence), the Format (three-section output: summary, triage sequence, pattern alerts), and the Constraints (mask account numbers, flag CTR thresholds, never dismiss exceptions as routine).',
      },
      {
        stepNumber: 3,
        instruction: 'Test with a sample exception report',
        detail: 'Paste a sanitized sample of your daily exception report. Remove all real customer names and full account numbers before pasting. Use realistic but fictional data if needed. The skill should categorize each exception, flag any large transactions, and produce the recommended triage sequence.',
        screenshotPlaceholder: 'Claude Project with exception report triage output',
      },
      {
        stepNumber: 4,
        instruction: 'Refine for your institution\'s patterns',
        detail: 'Every institution has its own exception patterns. If your bank sees frequent ACH returns from a specific originator, add that context to the prompt. If your threshold for "unusual volume" is different from the default, adjust the constraint. The skill improves as you add your institution\'s specific knowledge.',
      },
    ],
    prompt: m7Prompts[1],
    whatWentWell: 'The categorization and pattern detection save the most time. Instead of scanning 30 items sequentially, you get a prioritized list organized by urgency. The BSA threshold flagging ([CTR REVIEW]) adds a compliance safety net to the daily triage process.',
    whatToWatchFor: 'Exception report data often contains account numbers and customer names. Sanitize all data before pasting into any AI tool — even paid accounts with enterprise security commitments. The skill is designed to work with masked data (last-four account numbers, no customer names). If your core system export includes full PII, strip it first.',
  },
  {
    id: 'tut-m7-sar-narrative',
    title: 'Build a SAR Narrative Drafting Assistant',
    platform: 'claude',
    role: 'compliance',
    difficulty: 'advanced',
    relatedModule: 7,
    timeEstimate: '25 minutes',
    introduction: 'This tutorial builds a compliance skill for drafting SAR narrative sections. SAR narratives require specific structure (the five W elements) and careful language. This skill produces a consistent draft that the BSA Officer reviews and edits before filing — reducing drafting time from 45 minutes to 15 minutes per narrative.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Open Claude and create a new Project',
        detail: 'Create a new Project named "SAR Narrative Drafting." This is one of the highest-value compliance skills because SAR narratives are both time-consuming and structurally repetitive — exactly the pattern that AI skills automate well.',
      },
      {
        stepNumber: 2,
        instruction: 'Paste the skill prompt into Project Instructions',
        detail: 'This prompt is constraint-heavy by design. SAR narratives carry legal weight, so the constraints are as important as the task. Notice the specific language requirements: third person, past tense, "appears inconsistent with" rather than "is suspicious." These are not stylistic preferences — they are FinCEN drafting conventions.',
      },
      {
        stepNumber: 3,
        instruction: 'Test with a fictional investigation scenario',
        detail: 'Do NOT use real investigation data for testing. Create a fictional scenario: "Subject: John Smith, account opened 2023-06-15. Over a 90-day period, 47 cash deposits ranging from $8,500 to $9,900 were made at three different branches, totaling $438,000. Subject\'s stated occupation is freelance photographer. Monthly account activity prior to this period averaged $3,200 in deposits." The skill should produce a structured narrative draft addressing all five W elements.',
        screenshotPlaceholder: 'Claude SAR narrative draft with review flags',
      },
      {
        stepNumber: 4,
        instruction: 'Review the BSA Officer Review Flags section',
        detail: 'The most valuable part of this skill\'s output is not the narrative itself — it is the review flags. These tell the BSA Officer exactly where the draft needs human judgment: additional investigation needed, verification required, or legal counsel input recommended. A good skill knows what it does not know.',
      },
    ],
    prompt: m7Prompts[2],
    whatWentWell: 'The structured five-element format ensures no required SAR narrative component is missed. The "[VERIFY]" flags and "DRAFT" labeling create a clear workflow: AI drafts, human reviews, BSA Officer approves. This is the correct human-in-the-loop pattern for compliance-sensitive AI use.',
    whatToWatchFor: 'Critical data security consideration: real SAR investigation data is among the most sensitive information in your institution. Never paste real investigation details, customer names, account numbers, or transaction data into any AI tool — including paid enterprise accounts. Always use fictional scenarios for testing and skill development. For production use, work with your BSA Officer to determine whether any AI-assisted drafting is appropriate under your institution\'s policies.',
  },
  {
    id: 'tut-m7-variance-analysis',
    title: 'Build a Variance Commentary Generator',
    platform: 'chatgpt',
    role: 'finance',
    difficulty: 'advanced',
    relatedModule: 7,
    timeEstimate: '20 minutes',
    introduction: 'This tutorial builds a finance skill that takes income statement data and produces board-ready variance commentary. The skill applies dual materiality thresholds (percentage AND dollar amount), classifies variances by type (timing, trend, anomaly), and generates a CFO commentary paragraph.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Open ChatGPT and create a new Project',
        detail: 'Create a new Project named "Monthly Variance Analysis." This skill works best with ChatGPT\'s Code Interpreter / Advanced Data Analysis feature, which can process uploaded Excel files directly.',
      },
      {
        stepNumber: 2,
        instruction: 'Paste the skill prompt into Project Instructions',
        detail: 'The prompt defines dual materiality thresholds: variances must exceed BOTH 5% AND $25,000 to be flagged as material. This prevents the common problem of small-dollar items on large percentage swings cluttering the board report. Adjust these thresholds to match your institution\'s reporting standards.',
      },
      {
        stepNumber: 3,
        instruction: 'Test with sample financial data',
        detail: 'Upload a sample income statement (or paste tabular data) with budget, actual, and prior year columns. Use sanitized or fictional data for testing. The skill should identify material variances, classify each one, and produce the CFO commentary paragraph. Check that the Favorable/Unfavorable designations are correct — this is where AI sometimes reverses the convention.',
        screenshotPlaceholder: 'ChatGPT variance analysis with material items flagged',
      },
      {
        stepNumber: 4,
        instruction: 'Calibrate for your institution',
        detail: 'After the first test, refine: adjust materiality thresholds, add specific line items that always require commentary (e.g., provision for loan losses), and specify your institution\'s preferred terminology. Save the updated instructions. Test again with a different month\'s data to verify consistency.',
      },
    ],
    prompt: m7Prompts[3],
    whatWentWell: 'The dual materiality threshold and variance classification (timing/trend/anomaly) are the highest-value features. Board reports that distinguish between a one-time insurance rebate (timing) and a three-month decline in fee income (trend) give directors meaningfully better information for their governance role.',
    whatToWatchFor: 'The AI does not know why a variance occurred — it can only describe it. The instruction to write "Requires management discussion" when the cause is not apparent prevents the most dangerous AI behavior in financial reporting: fabricating plausible-sounding explanations that are wrong. Always review AI-generated commentary against your own knowledge of the month\'s activities.',
  },
  {
    id: 'tut-m7-campaign-copy',
    title: 'Build a Campaign Copy Writer',
    platform: 'gemini',
    role: 'marketing',
    difficulty: 'advanced',
    relatedModule: 7,
    timeEstimate: '20 minutes',
    introduction: 'This tutorial builds a marketing skill that produces multi-channel campaign copy with built-in compliance awareness. The skill generates headlines, body copy for three channels, and a required disclosures section — all in your institution\'s tone.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Open Gemini Advanced and create a new Gem',
        detail: 'In Gemini, navigate to Gem Manager and create a new Gem named "Campaign Copy Writer." Gems persist your instructions across conversations, functioning like ChatGPT Projects or Claude Projects.',
      },
      {
        stepNumber: 2,
        instruction: 'Paste the skill prompt into the Gem instructions',
        detail: 'This prompt includes UDAP/UDAAP and Reg DD awareness in the constraints. Marketing copy that sounds great but creates regulatory risk is worse than no copy at all. The skill is designed to produce draft copy that passes compliance review on the first submission.',
      },
      {
        stepNumber: 3,
        instruction: 'Test with a product launch scenario',
        detail: 'Ask the Gem to create a campaign package for a specific product: "Create a campaign package for our new 13-month CD special at 4.75% APY, $1,000 minimum deposit, available to new and existing customers, penalty for early withdrawal." Review each output component: headlines, direct mail, email, branch flyer, and disclosures.',
        screenshotPlaceholder: 'Gemini Gem producing multi-channel campaign copy',
      },
      {
        stepNumber: 4,
        instruction: 'Review compliance safety',
        detail: 'Check each piece of copy against these questions: Does it make any claims that could be considered unfair or deceptive? Does it include required disclosures for the product type? Does it avoid comparative claims about competitors? Are the "[COMPLIANCE CHECK]" flags placed appropriately? Share the output with your compliance team to validate the approach.',
      },
    ],
    prompt: m7Prompts[4],
    whatWentWell: 'Producing copy for three channels simultaneously saves significant time. The built-in compliance constraints mean the first draft is usually 80-90% ready for compliance review — compared to the typical cycle of marketing draft, compliance rejection, rewrite, re-review. The "[COMPLIANCE CHECK]" flags create a productive workflow between marketing and compliance teams.',
    whatToWatchFor: 'AI-generated marketing copy tends toward generic superlatives unless constrained. The prompt specifically prohibits "guaranteed," "free" without qualification, and competitor comparisons — but review every draft for subtler compliance issues. Also: the disclosures section is a starting point, not legal advice. Your compliance team must verify that all required regulatory disclosures are included for the specific product type.',
  },
] as const;

// ---------------------------------------------------------------------------
// Utility: filter prompts
// ---------------------------------------------------------------------------

export function filterPrompts(filters: {
  readonly platform?: PromptPlatform;
  readonly role?: PromptRole;
  readonly difficulty?: PromptDifficulty;
  readonly module?: number;
  readonly taskType?: PromptTaskType;
  readonly maxMinutes?: number;
  readonly query?: string;
}): readonly Prompt[] {
  const normalizedQuery = filters.query?.trim().toLowerCase();
  return ALL_PROMPTS.filter((p) => {
    if (filters.platform && p.platform !== filters.platform) return false;
    if (filters.role && p.role !== filters.role) return false;
    if (filters.difficulty && p.difficulty !== filters.difficulty) return false;
    if (filters.module && p.relatedModule !== filters.module) return false;
    if (filters.taskType && getPromptTaskType(p) !== filters.taskType) return false;
    if (filters.maxMinutes && getPromptTimeMinutes(p) > filters.maxMinutes) return false;
    if (normalizedQuery) {
      const haystack = [
        p.title,
        p.expectedOutput,
        p.promptText,
        PLATFORM_META[p.platform].label,
        ROLE_LABELS[p.role],
        DIFFICULTY_LABELS[p.difficulty],
        TASK_TYPE_LABELS[getPromptTaskType(p)],
        ...(p.tags ?? []),
      ].join(' ').toLowerCase();
      if (!haystack.includes(normalizedQuery)) return false;
    }
    return true;
  });
}
