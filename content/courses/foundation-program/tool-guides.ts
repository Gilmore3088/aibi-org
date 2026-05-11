export interface BankingUseCase {
  readonly title: string;
  readonly description: string;
  readonly steps: readonly string[];
  readonly prompt: string;
  readonly expectedOutput: string;
  readonly verifyBefore: string;
}

export interface ToolGuide {
  readonly id: string;
  readonly platform: string;
  readonly gettingStarted: string; // markdown
  readonly freeVsPaid: string; // markdown
  readonly bankingUseCases: readonly BankingUseCase[];
  readonly customInstructionsSetup: string; // markdown
  readonly dataSafety: string; // markdown
  readonly proTips: readonly string[];
}

// ---------------------------------------------------------------------------
// ChatGPT
// ---------------------------------------------------------------------------

const chatGPTUseCases: readonly BankingUseCase[] = [
  {
    title: 'Summarize a regulatory update for staff',
    description:
      'Paste the full text of a CFPB bulletin, FDIC Financial Institution Letter, or Federal Reserve SR Letter ' +
      'and receive a plain-English summary your frontline staff can act on.',
    steps: [
      'Open chatgpt.com and start a new chat.',
      'Copy the full text of the regulatory document (bulletin body only — no appendices on the first pass).',
      'Paste the text into the message box, then add the prompt below.',
      'Review the output against the original. Verify every obligation listed is present in the source text.',
      'Share the summary via your normal compliance distribution channel. Do not treat it as legal advice.',
    ],
    prompt:
      'I am a compliance officer at a community bank. The following is the full text of a regulatory bulletin. ' +
      'Please produce: (1) a one-paragraph executive summary for senior management, ' +
      '(2) a bulleted list of specific obligations or changes that affect deposit operations, ' +
      '(3) a bulleted list of obligations that affect lending, ' +
      'and (4) a recommended internal deadline for acknowledging these changes. ' +
      'Flag any item that requires a policy update. Do not speculate beyond what is written.\n\n' +
      '[PASTE BULLETIN TEXT HERE]',
    expectedOutput:
      'A four-section structured response: executive summary paragraph, deposit obligations list, ' +
      'lending obligations list, and a suggested 30/60/90-day action timeline with policy-update flags.',
    verifyBefore:
      'Confirm each obligation in the output maps to specific language in the source document. ' +
      'If a deadline is inferred, verify it against the effective date stated in the original.',
  },
  {
    title: 'Draft a member rate-change communication',
    description:
      'Generate a compliant, plain-language letter or email notifying members or customers of a deposit ' +
      'or loan rate change, ready for compliance review.',
    steps: [
      'Gather: the account type, current rate, new rate, effective date, and any Regulation DD or TISA disclosure requirements that apply.',
      'Open a new ChatGPT chat.',
      'Provide the details using the prompt below.',
      'Review output against your institution\'s model letter archive and compliance checklist.',
      'Route through compliance before sending.',
    ],
    prompt:
      'I work in marketing at a community bank. Draft a rate-change notification letter for our ' +
      'certificate of deposit holders. Details: current APY is [CURRENT_RATE]%, new APY will be [NEW_RATE]%, ' +
      'effective [EFFECTIVE_DATE]. The letter must: use plain language at an 8th-grade reading level, ' +
      'comply with Regulation DD advance-notice requirements, include a clear call to action if the member ' +
      'needs to take any steps, and close with contact information for our Member Services team at [PHONE] or [EMAIL]. ' +
      'Do not make any representations about future rates. Tone: warm, professional, reassuring.',
    expectedOutput:
      'A formatted letter (salutation, body paragraphs, closing) with a subject line for email delivery, ' +
      'flagged disclosure language, and a note on the Reg DD advance-notice window.',
    verifyBefore:
      'Confirm the notice window (typically 30 days for time deposits under Reg DD). ' +
      'Verify the new rate matches your board-approved rate sheet before compliance review.',
  },
  {
    title: 'Deep Research for CRE lending market analysis',
    description:
      'Use ChatGPT\'s Deep Research feature (Plus/Team required) to compile a sourced market analysis ' +
      'on commercial real estate lending trends in your target geography.',
    steps: [
      'Confirm you have a ChatGPT Plus or Team subscription (Deep Research is not available on the free tier).',
      'Open a new chat and click the "Deep Research" option before submitting.',
      'Submit the prompt below, substituting your target geography and property type.',
      'Review the research report and its citations. Open each linked source to verify the data.',
      'Use the output as a starting brief for your lending team — not as a standalone underwriting document.',
    ],
    prompt:
      'Conduct a deep research analysis of the commercial real estate lending environment for ' +
      '[PROPERTY_TYPE, e.g., multifamily / office / retail] properties in [MSA or STATE] as of [CURRENT_YEAR]. ' +
      'Include: (1) vacancy rate trends over the past 24 months, (2) cap rate benchmarks by property class, ' +
      '(3) recent notable distress events or lender exits in this market, ' +
      '(4) relevant FDIC or Federal Reserve guidance on CRE concentration risk published in the last 18 months, ' +
      'and (5) three specific risk factors a community bank originating in this market should underwrite against. ' +
      'Cite all sources with publication date and publisher.',
    expectedOutput:
      'A multi-section research brief with inline citations, a risk-factor section, and a summary table ' +
      'of vacancy and cap rate data. Each claim should link to a verifiable source.',
    verifyBefore:
      'Open every cited source before distributing. Deep Research can hallucinate citations. ' +
      'Cross-reference vacancy data against CoStar, CBRE, or your state banking association\'s market reports.',
  },
  {
    title: 'Analyze an uploaded financial statement',
    description:
      'Upload a borrower\'s financial statement (balance sheet, income statement, or tax return) ' +
      'and ask ChatGPT to calculate key credit ratios and flag anomalies for your underwriting review.',
    steps: [
      'Before uploading: redact or replace all personally identifiable information (name, SSN, EIN, address) with placeholders such as "[BORROWER_A]". This is mandatory — see Data Safety section.',
      'In a new ChatGPT chat, click the paperclip icon to upload the redacted PDF or spreadsheet.',
      'Submit the prompt below.',
      'Review each ratio against your institution\'s credit policy thresholds.',
      'Document the AI output as a preliminary screening tool only. Final credit decisions require human underwriter sign-off.',
    ],
    prompt:
      'I am a commercial lender at a community bank. I have uploaded a redacted borrower financial statement ' +
      '(all PII has been removed). Please: ' +
      '(1) calculate debt-service coverage ratio (DSCR) using net operating income divided by total debt service, ' +
      '(2) calculate the current ratio and quick ratio, ' +
      '(3) calculate debt-to-equity and debt-to-assets, ' +
      '(4) identify any year-over-year trends that would be material to a credit decision, ' +
      'and (5) list any line items that appear unusual or inconsistent and should be verified with source documents. ' +
      'Present calculations in a table. Flag where a ratio falls below typical community bank credit policy thresholds.',
    expectedOutput:
      'A ratio table with calculated values and policy-benchmark comparisons, a trend analysis paragraph, ' +
      'and a flagged-items list with suggested verification steps.',
    verifyBefore:
      'Confirm PII redaction is complete before upload. Verify all ratio formulas against your credit policy. ' +
      'ChatGPT may misread table formatting — cross-check raw figures against the uploaded document.',
  },
  {
    title: 'Create a custom GPT for your department',
    description:
      'Build a department-specific custom GPT (Plus/Team required) that carries your institution\'s ' +
      'policies, terminology, and formatting standards into every interaction.',
    steps: [
      'Confirm you have a ChatGPT Plus or Team subscription.',
      'Navigate to chatgpt.com → your profile icon → "My GPTs" → "Create a GPT".',
      'In the Configure tab, fill in the Name, Description, and Instructions fields using the guidance in the prompt below.',
      'Upload reference documents (your policy manual excerpt, product sheet, or compliance checklist) under "Knowledge".',
      'Set Capabilities: enable Web Browsing only if staff need current rate data; disable DALL-E and Code Interpreter to reduce distraction.',
      'Under "Additional Settings," enable "Only people with a link" sharing for internal use.',
      'Test with 10 representative staff questions before releasing.',
    ],
    prompt:
      'You are a custom GPT assistant for the [DEPARTMENT, e.g., Mortgage Lending / BSA-AML Compliance / Retail Branch] ' +
      'team at [INSTITUTION NAME], a community bank headquartered in [STATE]. ' +
      'Your role is to help staff [SPECIFIC TASK, e.g., draft customer disclosures / screen transactions / answer product FAQs]. ' +
      'Always: use plain language, cite the relevant policy section when referencing internal guidelines, ' +
      'recommend human review before any customer-facing output is sent, and flag any request that may involve ' +
      'regulatory compliance or legal interpretation for escalation to the compliance or legal team. ' +
      'Never: provide specific legal advice, make credit decisions, or speculate about regulatory intent. ' +
      'When uncertain, say so and suggest the appropriate internal resource.',
    expectedOutput:
      'A configured custom GPT with department-specific instructions, uploaded knowledge documents, ' +
      'and a shareable internal link your team can bookmark.',
    verifyBefore:
      'Review instructions with your compliance officer before launch. ' +
      'Confirm uploaded policy documents are the current approved version. ' +
      'Test edge-case prompts (e.g., "Can I approve this loan?") to verify the GPT escalates correctly.',
  },
];

const chatGPTGuide: ToolGuide = {
  id: 'chatgpt',
  platform: 'ChatGPT (OpenAI)',

  gettingStarted: `
## Getting Started with ChatGPT

**URL:** [chatgpt.com](https://chatgpt.com)

1. Navigate to chatgpt.com and click **Sign up**.
2. Create an account with your work email address. Use your institutional email so IT can manage access if needed.
3. Verify your email and complete the onboarding flow.
4. You will land on the free tier (GPT-4o with daily rate limits). For heavier use, see the Free vs. Paid section.

**First session checklist:**
- Set Custom Instructions before your first real task (see Custom Instructions section below).
- Bookmark the chat interface — avoid saving sensitive work conversations to your browser history.
- Familiarize yourself with the **New Chat** button. Each new chat is a clean context. Use it when switching topics.

**Mobile:** The ChatGPT iOS and Android apps are fully functional and support file upload and voice input.
  `.trim(),

  freeVsPaid: `
## Free vs. Paid (ChatGPT)

| Feature | Free | Plus ($20/mo) | Team ($25/user/mo) |
|---|---|---|---|
| GPT-4o access | Limited daily messages | Full access | Full access |
| GPT-4o mini | Unlimited | Unlimited | Unlimited |
| Deep Research | No | Yes (limited) | Yes |
| DALL-E image generation | No | Yes | Yes |
| File uploads (PDF, Excel) | Limited | Up to 10 files/chat | Up to 10 files/chat |
| Custom GPTs (create) | No | Yes | Yes |
| Custom GPTs (use) | Access to GPT Store | Yes | Yes |
| Context window | ~8K tokens | ~128K tokens | ~128K tokens |
| Data training opt-out | Manual setting | Automatic | Automatic (admin-controlled) |
| Admin console | No | No | Yes |
| Conversation retention controls | Limited | Settings → Data Controls | Admin-managed |

**Recommendation for banking teams:**
- Individual contributors exploring AI: start with **Free** tier for 30 days.
- Power users (compliance, lending, operations) who run 5+ tasks/day: **Plus**.
- Teams sharing custom GPTs and needing admin visibility: **Team**.
- Institutions requiring BAA, audit logs, and SSO: evaluate **Enterprise** — contact OpenAI sales directly.

**Note on data training:** On the free tier, conversations may be used to train future models unless you opt out in Settings → Data Controls → Improve the model for everyone (toggle off). Plus and Team plans do not use conversations for training by default.
  `.trim(),

  bankingUseCases: chatGPTUseCases,

  customInstructionsSetup: `
## Setting Up Custom Instructions

Custom Instructions persist across all new chats and save you from re-explaining your role every session.

**How to access:**
1. Click your profile icon (bottom-left on desktop).
2. Select **Custom Instructions**.
3. You will see two text fields.

---

### Field 1: "What would you like ChatGPT to know about you?"

Paste this template, filling in your details:

\`\`\`
I am a [YOUR ROLE] at [INSTITUTION NAME], a community [bank / credit union] with approximately
$[ASSET SIZE] in assets, headquartered in [STATE]. We serve [primary market: rural / suburban /
commercial / agricultural]. My primary responsibilities include [2–3 key duties].

Relevant regulatory context: We are [FDIC-insured / NCUA-insured]. Our primary federal regulator
is [OCC / FDIC / Federal Reserve / NCUA]. We are subject to [CRA / BSA-AML / Reg B / HMDA —
list applicable].

I often work with: [e.g., call reports, loan files, board reports, member communications,
policy documents].
\`\`\`

---

### Field 2: "How would you like ChatGPT to respond?"

Paste this template:

\`\`\`
- Lead with the most actionable information first.
- Use plain language (8th-grade reading level) for member-facing drafts; use precise regulatory
  terminology for internal compliance work.
- Present lists and comparisons in tables when possible.
- Always flag when a response involves regulatory interpretation and recommend human compliance review.
- Do not speculate about regulatory intent or provide legal advice.
- When citing a regulation, include the specific section number (e.g., Reg DD §1030.4).
- If you are uncertain about a fact, say so explicitly — do not fabricate sources.
- Keep responses concise. If a detailed breakdown is needed, ask before expanding.
\`\`\`

**Important:** Custom Instructions are visible to OpenAI. Do not include confidential institution
data, customer information, or security credentials in these fields.
  `.trim(),

  dataSafety: `
## Data Safety: What You Must Know Before Pasting

### OpenAI's data handling (as of 2025)

- **Free tier:** Conversations may be reviewed by OpenAI staff for safety and quality. Training opt-out is available in Settings → Data Controls.
- **Plus:** Conversations are not used for training by default. Still subject to OpenAI's standard retention policy.
- **Team:** Admin can enforce retention settings. Conversations are not used for training.
- **Enterprise:** SOC 2 compliant, 0-day retention option, BAA available — contact OpenAI sales.

### What you MUST NOT paste into ChatGPT (any tier, unless Enterprise with BAA)

| Data Type | Why |
|---|---|
| Customer names, SSNs, account numbers | Personal data — potential Gramm-Leach-Bliley Act exposure |
| Loan application details with borrower identity | GLBA + potential ECOA implications |
| Unreacted financial statements | Customer PII |
| Board meeting minutes (non-public) | Material non-public information |
| Examination findings or MRAs | Confidential supervisory information — regulatory prohibition |
| Core system credentials or API keys | Security risk |
| Insider trading-adjacent information | Legal risk |

### Safe practice for financial analysis tasks

Before uploading or pasting any document, run this checklist:
1. Replace all customer names with placeholders (e.g., "Borrower A").
2. Remove or mask SSNs, EINs, account numbers, and addresses.
3. Remove any text marked "Confidential Supervisory Information."
4. Remove examination dates, examiner names, and MRA/MRE language.
5. Replace your institution's name with a generic label if the task does not require it.

### Institutional policy requirement

Use of AI tools with non-public institution data should be covered by your AI use policy.
If your institution does not have an AI use policy, flag this to your compliance officer.
The AI Banking Institute's AiBI-Foundation curriculum includes a model AI use policy template.
  `.trim(),

  proTips: [
    'Use a new chat for each distinct task. Mixing a compliance summary and a marketing draft in one chat degrades response quality as the context fills up.',
    'Paste long documents before your instruction, not after. ChatGPT processes the full context but anchors more strongly to recent tokens — put the task last.',
    'When a response is 80% right, use "Revise the second section only — keep everything else" rather than regenerating. Targeted revisions are faster and preserve what worked.',
    'For recurring tasks (e.g., monthly board report draft), save your best prompt in a shared document and paste it each time. Custom GPTs are the better long-term solution for team-wide reuse.',
    'If ChatGPT adds unsolicited caveats that clutter the output (e.g., "Please consult a legal professional"), add "Omit standard disclaimers — I understand this is AI-generated and requires professional review" to your prompt.',
  ],
};

// ---------------------------------------------------------------------------
// Claude
// ---------------------------------------------------------------------------

const claudeUseCases: readonly BankingUseCase[] = [
  {
    title: 'Upload and analyze a 100-page policy document',
    description:
      'Claude\'s 200K+ token context window makes it uniquely suited to ingest an entire policy manual, ' +
      'exam manual, or regulatory guidance document and answer specific questions about it — ' +
      'without chunking or losing cross-document context.',
    steps: [
      'Log in to claude.ai and start a new conversation.',
      'Click the paperclip icon to attach the PDF. Claude accepts PDFs up to approximately 32MB.',
      'Wait for the upload to process (indicated by the file chip in the message box).',
      'Submit the prompt below. Because the entire document is in context, Claude can cross-reference sections.',
      'Ask follow-up questions in the same conversation — Claude retains the full document context throughout.',
    ],
    prompt:
      'I have uploaded our institution\'s [POLICY NAME, e.g., BSA/AML Compliance Program Policy]. ' +
      'Please: (1) produce a one-page executive summary of the policy\'s stated objectives and scope, ' +
      '(2) identify any internal controls that reference a specific dollar threshold and list those thresholds in a table, ' +
      '(3) identify any sections that reference a regulatory citation and note whether those citations appear current ' +
      '(flag any that reference superseded guidance), ' +
      'and (4) list any procedures described as "to be developed" or "pending" that represent open gaps. ' +
      'Cite the page number or section heading for each finding.',
    expectedOutput:
      'An executive summary, a thresholds table with section references, a regulatory citation audit, ' +
      'and a gap list — all with page or section citations traceable to the uploaded document.',
    verifyBefore:
      'Confirm the uploaded document is the current board-approved version (check the revision date on the cover page). ' +
      'Verify any cited regulatory references against the actual regulation text before acting on the gap analysis.',
  },
  {
    title: 'Create a Project with persistent banking context',
    description:
      'Claude\'s Projects feature lets you store institution-specific context — your asset size, charter type, ' +
      'regulatory environment, and common document formats — so every conversation in that Project starts ' +
      'with full institutional awareness.',
    steps: [
      'In claude.ai, click "Projects" in the left sidebar, then "New Project".',
      'Name the project for your team or function (e.g., "Compliance Team Workspace" or "Lending Underwriting").',
      'Click "Project Instructions" and paste the context template from the Custom Instructions section below.',
      'Upload standing reference documents to the Project Knowledge section: your current policy manual, product glossary, or rate sheet.',
      'Every new conversation started inside this Project will automatically have access to these instructions and documents.',
      'Add team members under Project Settings → Share (Pro team plan required for multi-user Projects).',
    ],
    prompt:
      'This is the Project Instructions template — paste this into the Project Instructions field, not into a chat:\n\n' +
      'Institution context: [INSTITUTION NAME] is a [CHARTER TYPE] with $[ASSET SIZE] in assets, ' +
      'headquartered in [CITY, STATE]. Primary regulator: [OCC / FDIC / Federal Reserve / NCUA]. ' +
      'Key markets: [commercial / agricultural / residential / consumer]. ' +
      'This Project is used by the [DEPARTMENT] team.\n\n' +
      'Standing instructions: Always use precise regulatory terminology. ' +
      'When drafting member-facing copy, target an 8th-grade reading level. ' +
      'Flag any response that requires compliance or legal review before use. ' +
      'Do not speculate on regulatory intent. Cite specific regulation sections when applicable. ' +
      'When asked to analyze a document, cite page numbers or section headings for each finding.',
    expectedOutput:
      'A configured Project where every new conversation automatically inherits the institutional context, ' +
      'uploaded reference documents are searchable, and team members share a common starting point.',
    verifyBefore:
      'Review Project Instructions with your compliance officer before adding team members. ' +
      'Confirm that uploaded policy documents carry the current approval date and version number.',
  },
  {
    title: 'Draft a board memo from raw financial data',
    description:
      'Provide Claude with raw quarterly figures and ask it to produce a structured board memo ' +
      'in your institution\'s standard format — ready for CFO review.',
    steps: [
      'Gather the raw data: net interest margin, noninterest income/expense, provision for credit losses, ' +
        'ROA, ROE, capital ratios, and any notable variances from prior quarter and prior year.',
      'In a Project conversation (or new chat), paste the data table.',
      'Submit the prompt below.',
      'Review the output: verify every figure matches your source data exactly.',
      'Route to CFO and compliance for review before board distribution.',
    ],
    prompt:
      'I am the CFO of [INSTITUTION NAME]. Below is our [Q#] [YEAR] financial summary. ' +
      'Draft a board memo with these sections: ' +
      '(1) Executive Summary (3–4 sentences — highlight the single most important positive result and the single most important concern), ' +
      '(2) Net Interest Margin Analysis (compare to prior quarter and prior year; note rate environment context), ' +
      '(3) Asset Quality (ALLL ratio, NPL ratio, net charge-offs — flag any ratio that has moved more than 10 basis points), ' +
      '(4) Capital Position (compare reported ratios to well-capitalized thresholds under PCA), ' +
      'and (5) Outlook (one paragraph — no speculation beyond what the data supports). ' +
      'Format: formal memo header (To: Board of Directors, From: [CFO], Date: [DATE], Subject: [PERIOD] Financial Results). ' +
      'All figures must be presented in DM Mono-style tabular format. Do not editorialize beyond what the numbers show.\n\n' +
      '[PASTE DATA TABLE HERE]',
    expectedOutput:
      'A complete board memo with five sections, a formal header, and all figures in tabular format. ' +
      'Each variance from benchmark is flagged with the specific threshold reference.',
    verifyBefore:
      'Cross-check every figure in the output against your source data line by line. ' +
      'Claude may transpose numbers when multiple periods are present in a data table. ' +
      'Confirm PCA well-capitalized thresholds are current (12 CFR Part 6 for national banks; 12 CFR Part 702 for credit unions).',
  },
  {
    title: 'Analyze a loan file for completeness against your checklist',
    description:
      'Upload a redacted loan file package and your institution\'s loan documentation checklist. ' +
      'Claude will identify missing items, flag deficiencies, and produce a completion matrix.',
    steps: [
      'Redact all borrower PII from the loan file before uploading (replace with "Borrower A", mask SSN/EIN, etc.).',
      'Upload both files: the redacted loan package and your checklist document.',
      'Submit the prompt below.',
      'Review the completion matrix. Use it as the first-pass review for your loan administration team.',
      'Document the AI review in the loan file as a preliminary screening — human underwriter sign-off remains mandatory.',
    ],
    prompt:
      'I have uploaded two documents: (1) a redacted commercial loan file package and ' +
      '(2) our institution\'s commercial loan documentation checklist. ' +
      'Please produce a completion matrix that lists every checklist item and marks it as: ' +
      'Present and Complete / Present but Deficient (describe the deficiency) / Missing. ' +
      'For each deficient or missing item, note the potential regulatory or credit policy implication. ' +
      'Conclude with a priority-ordered list of the top five documentation gaps that should be resolved ' +
      'before the file is presented to the loan committee. ' +
      'Cite the page or section of the loan file where each present item was found.',
    expectedOutput:
      'A three-column completion matrix (item / status / notes), a deficiency detail section, ' +
      'and a prioritized remediation list with regulatory context for each gap.',
    verifyBefore:
      'Confirm PII redaction before upload. ' +
      'Verify the checklist version matches the type of loan being reviewed (construction vs. term vs. line of credit). ' +
      'Claude may miss items presented in non-standard formats (handwritten forms, scanned tables) — ' +
      'manual review of those sections is required.',
  },
  {
    title: 'Build a reusable Artifact for recurring reports',
    description:
      'Use Claude\'s Artifacts feature to create a structured template — rendered as a formatted document — ' +
      'that your team can reuse each reporting cycle without reformatting.',
    steps: [
      'In a Project conversation, describe the report structure you need.',
      'Ask Claude to create the report as an Artifact using the prompt below.',
      'Claude will render the Artifact in a side panel. Review the structure.',
      'Ask for revisions directly ("Move the capital section before asset quality"), and Claude will update the Artifact.',
      'Once finalized, copy the Artifact content into your institution\'s report template. ' +
        'Save the conversation in the Project so you can return and regenerate next quarter.',
    ],
    prompt:
      'Create an Artifact containing a reusable quarterly reporting template for our community bank\'s ' +
      'ALCO (Asset/Liability Committee) packet. The template should include these sections with placeholder text ' +
      'and table structures: ' +
      '(1) Rate Risk Summary — a table for NII at risk at +/- 100, 200, 300 basis point shocks; ' +
      '(2) Liquidity Position — a table for the liquidity coverage ratio, brokered deposit concentration, ' +
      'and available contingency funding sources; ' +
      '(3) Investment Portfolio Summary — a table for total portfolio, unrealized gain/loss, duration, and ' +
      'yield by security type; ' +
      '(4) Key Assumptions — a text block for rate assumptions and prepayment speed assumptions; ' +
      'and (5) Committee Recommendations — a free-text section. ' +
      'Format as a professional committee document. Use placeholder values in brackets for all figures. ' +
      'Include column headers and row labels that match standard ALCO reporting conventions.',
    expectedOutput:
      'A rendered Artifact in the side panel containing a complete, formatted ALCO packet template ' +
      'with all five sections, placeholder table structures, and professional headers — ' +
      'ready to be populated with current-period data each quarter.',
    verifyBefore:
      'Review table structures with your CFO or ALM officer to confirm columns match your current ALCO format. ' +
      'Confirm rate shock scenarios align with your IRR policy before first use.',
  },
];

const claudeGuide: ToolGuide = {
  id: 'claude',
  platform: 'Claude (Anthropic)',

  gettingStarted: `
## Getting Started with Claude

**URL:** [claude.ai](https://claude.ai)

1. Navigate to claude.ai and click **Sign up**.
2. Create an account with your work email address.
3. Verify your email and complete the onboarding flow.
4. You will land on the free tier (Claude Sonnet, usage-capped). For unlimited access and Opus, see the Free vs. Paid section.

**First session checklist:**
- Create a Project before your first real work task — it will carry your institutional context automatically (see Custom Instructions section).
- Familiarize yourself with the Artifacts panel (right side) — it renders formatted documents and tables separately from the conversation.
- Note the context window indicator. Claude can hold 200K+ tokens in a single conversation — roughly 150,000 words, enough for an entire policy manual.

**Mobile:** claude.ai is mobile-responsive. There is no dedicated mobile app as of mid-2025 — use the browser on iOS/Android.
  `.trim(),

  freeVsPaid: `
## Free vs. Paid (Claude)

| Feature | Free | Pro ($20/mo) | Team ($25/user/mo, 5-seat min) |
|---|---|---|---|
| Model access | Claude Sonnet (rate-limited) | Sonnet + Opus (5x more usage) | Sonnet + Opus (higher limits) |
| Context window | ~200K tokens | ~200K tokens | ~200K tokens |
| Projects | No | Yes | Yes |
| Project Knowledge (file store) | No | Yes | Yes |
| Artifacts | Yes | Yes | Yes |
| File uploads per conversation | 5 files | 20 files | 20 files |
| PDF analysis | Yes (limited) | Yes (full) | Yes (full) |
| Data training opt-out | Default off (free tier may differ by region) | No training on Pro conversations | No training on Team conversations |
| Admin console | No | No | Yes |
| SSO / SAML | No | No | Contact sales |

**Recommendation for banking teams:**
- Individual contributors running 1–3 tasks/day: **Free** for exploration; **Pro** when hitting rate limits.
- Compliance, lending, or operations staff using large document analysis weekly: **Pro** is essential for Projects and extended file uploads.
- Teams sharing Projects and needing admin oversight: **Team**.
- Institutions requiring BAA, enterprise controls, or SSO: contact Anthropic enterprise sales.

**Why context window matters for banking:** A 200K-token context means Claude can hold an entire 100-page examination manual, your policy document, and your question in a single conversation — with no chunking, no retrieval gaps. This is materially different from tools with 8K–32K limits.

**Note on data training:** Anthropic does not train on conversations from Pro and Team plan users by default. Free tier conversations may be used to improve the model. Verify current policy at anthropic.com/privacy.
  `.trim(),

  bankingUseCases: claudeUseCases,

  customInstructionsSetup: `
## Setting Up Persistent Context with Projects

Claude does not have a standalone "Custom Instructions" field like ChatGPT. The equivalent — and more powerful — mechanism is **Projects with Project Instructions**.

### Step 1: Create a Project

1. In claude.ai, click **Projects** in the left sidebar.
2. Click **New Project** and give it a meaningful name (e.g., "Compliance Workspace" or "Lending Team").
3. All conversations you start inside this Project will share the same instructions and knowledge files.

### Step 2: Set Project Instructions

Click **Project Instructions** (wrench icon) and paste the following template, completed for your institution:

\`\`\`
Institution: [INSTITUTION NAME] is a [FDIC-insured community bank / NCUA-insured credit union]
with approximately $[ASSET SIZE] in assets, headquartered in [CITY, STATE].
Primary federal regulator: [OCC / FDIC / Federal Reserve / NCUA].
Primary markets: [commercial / agricultural / residential / consumer / municipal].
This Project is used by the [DEPARTMENT NAME] team.

Standing instructions:
- Use precise regulatory terminology for internal work. Use plain language (8th-grade reading level) for member-facing drafts.
- Cite specific regulation sections (e.g., 12 CFR §226.4, Regulation B §1002.9) when applicable.
- Flag every response that requires compliance or legal review before use.
- Do not speculate on regulatory intent. If a regulatory interpretation is uncertain, say so.
- When analyzing an uploaded document, cite page numbers or section headings for each finding.
- Present data comparisons in tables.
- All figures in financial documents should use tabular formatting.
- Do not fabricate citations, statistics, or regulatory thresholds. If you do not know a threshold, state that and recommend the source.
\`\`\`

### Step 3: Upload Knowledge Documents

Under **Project Knowledge**, upload standing reference files:
- Your current compliance policy manual (PDF)
- Your loan documentation checklist
- Your product rate sheet (current period)
- Your institution's standard report templates

Claude can reference these documents in any conversation within the Project without you re-uploading them.

### Step 4: Share with Team (Team plan required)

Navigate to Project Settings → Share → invite team members by email. All team members will share the same Project Instructions and Knowledge files.

**Security note:** Project Instructions and Knowledge files are visible to all Project members. Do not store customer PII, examination findings, or confidential supervisory information in Project Knowledge.
  `.trim(),

  dataSafety: `
## Data Safety: What You Must Know Before Pasting

### Anthropic's data handling (as of 2025)

- **Free tier:** Conversations may be reviewed by Anthropic staff for safety and quality and may be used to improve models. Check current policy at anthropic.com/privacy.
- **Pro:** Conversations are not used to train models by default. Anthropic may review conversations for safety violations.
- **Team:** Conversations are not used to train models. Admin controls available.
- **Enterprise:** Dedicated infrastructure, BAA available, 0-day retention options — contact Anthropic sales.

### What you MUST NOT paste into Claude (any tier, unless Enterprise with BAA)

| Data Type | Why |
|---|---|
| Customer names, SSNs, account numbers | Personal data — potential GLBA exposure |
| Loan files with borrower identity intact | GLBA + potential ECOA implications |
| Unreacted financial statements | Customer PII |
| Board minutes containing material non-public information | MNPI — legal risk |
| Examination findings, MRAs, or MREs | Confidential supervisory information — regulatory prohibition |
| Core banking system credentials | Security risk |
| Any document marked "Confidential Supervisory Information" | Federal law prohibits disclosure |

### Safe practice for document analysis

Before uploading any document to Claude:
1. Replace all customer names with placeholders (e.g., "Borrower A," "Member 1").
2. Mask SSNs, EINs, account numbers, and physical addresses.
3. Remove all examination dates, examiner names, and MRA/MRE language.
4. Remove institution-specific identifiers if not required for the task.
5. Replace confidential supervisory language with "[REDACTED]" markers.

### Why Claude's large context window changes the risk calculus

The ability to upload a 100-page document is powerful — and creates a proportionally larger surface area for inadvertent data exposure. The redaction checklist above is not optional for loan files or exam-related materials. Apply it before every upload, regardless of the tier you are on.

### Institutional policy requirement

AI tool use involving institution data should be governed by a written AI use policy. If your institution does not have one, flag this gap to your compliance officer. The AI Banking Institute's AiBI-Foundation curriculum includes a model AI use policy template aligned with SR 11-7 and the AIEOG AI Lexicon.
  `.trim(),

  proTips: [
    'Use Projects for every recurring workflow. The 5-minute setup pays off within the first week — you stop re-explaining your institution\'s context at the start of every session.',
    'When uploading a large PDF for analysis, ask Claude to confirm what it has received first: "Summarize the document title, date, and table of contents." This surfaces upload parsing errors before you build on a faulty foundation.',
    'Claude\'s 200K context means you can paste multiple documents in a single conversation and ask cross-document questions. Example: upload your current and prior-year policy side by side and ask "What changed between these two versions?"',
    'Use the Artifacts panel for any output you intend to reuse — reports, templates, checklists. Artifacts are versioned within the conversation, so you can ask Claude to "go back to version 2 of the table" if a revision misses the mark.',
    'For compliance drafting, end your prompt with: "After producing the draft, list three things a compliance officer should verify before this is used." This builds a self-audit step into every output and trains good review habits across your team.',
  ],
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const toolGuides: readonly ToolGuide[] = [chatGPTGuide, claudeGuide] as const;

export const getToolGuideById = (id: string): ToolGuide | undefined =>
  toolGuides.find((g) => g.id === id);
