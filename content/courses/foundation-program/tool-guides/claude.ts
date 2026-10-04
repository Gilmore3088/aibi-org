// Claude (Anthropic) — large-context document analysis and Projects for
// persistent institutional context. The strongest fit for community
// banks doing policy-document or loan-file work.

import type { ToolGuide } from './types';

export const claudeGuide: ToolGuide = {
  platformId: 'claude',
  platformLabel: 'Claude',
  platform: 'claude',
  colorVar: 'var(--ink)',
  tagline:
    'Long-document reading plus Projects — built for policy manuals, loan files, and context that carries from chat to chat.',
  url: 'https://claude.ai',
  pricingUrl: 'https://claude.com/pricing',
  verifiedOn: '2026-10-04',
  reviewBy: '2027-01-04',

  gettingStarted: {
    steps: [
      'Navigate to claude.ai and click "Sign up".',
      'Create an account with your work email address.',
      'Verify your email and complete the onboarding flow.',
      'Create a Project before your first real work task — it carries institutional context automatically (see Custom Instructions).',
      'Familiarize yourself with the Artifacts panel (right side) — it renders formatted documents separately from the conversation.',
    ],
    firstSessionNote:
      "You start on the Free plan, which has usage limits and up to 5 Projects. A single conversation can hold a long policy manual. Claude has iOS and Android apps as well as the web.",
  },

  pricing: [
    {
      tierName: 'Free',
      cost: '$0',
      keyLimits: [
        'Usage limits',
        'Up to 5 Projects',
        'Personal account: check the training setting in Settings → Privacy',
      ],
      bankingVerdict:
        'Enough to learn on with public, non-sensitive text. Not for institution data.',
    },
    {
      tierName: 'Pro',
      cost: '$20/month monthly · $17 billed annually',
      keyLimits: [
        'Higher limits and unlimited Projects',
        'Personal account: your institution has no admin control',
      ],
      bankingVerdict:
        'The plan for one person doing weekly long-document work while learning. Still a personal account.',
    },
    {
      tierName: 'Max',
      cost: 'From $100/month',
      keyLimits: ['Everything in Pro with much higher usage limits'],
      bankingVerdict: 'Only for heavy individual users. Most bankers will not need it.',
    },
    {
      tierName: 'Team and Enterprise',
      cost: 'Per seat · see pricing page',
      keyLimits: [
        'Admin console, shared Projects, SSO',
        'Commercial terms: conversations are not used for training by default',
        'Enterprise adds audit logs and retention controls',
      ],
      bankingVerdict:
        'The plans a bank should consider for real work, because IT controls them. Have your vendor-management process review them first.',
    },
  ],

  bankingUseCases: [
    {
      number: 1,
      title: 'Upload and analyze a 100-page policy document',
      description:
        "Claude can read an entire policy manual, exam manual, or regulatory guidance document in one conversation and answer specific questions across it.",
      steps: [
        'Log in to claude.ai and start a new conversation.',
        'Click the + button to attach the PDF. Very large files may need splitting; the upload will tell you.',
        'Wait for the upload to process (indicated by the file chip in the message box).',
        'Submit the prompt below. Because the entire document is in context, Claude can cross-reference sections.',
        'Ask follow-up questions in the same conversation — Claude retains the full document context throughout.',
      ],
      prompt:
        "I have uploaded our institution's [POLICY NAME, e.g., BSA/AML Compliance Program Policy]. Please: (1) produce a one-page executive summary of the policy's stated objectives and scope, (2) identify any internal controls that reference a specific dollar threshold and list those thresholds in a table, (3) identify any sections that reference a regulatory citation and note whether those citations appear current (flag any that reference superseded guidance), and (4) list any procedures described as \"to be developed\" or \"pending\" that represent open gaps. Cite the page number or section heading for each finding.",
      expectedOutput:
        'An executive summary, a thresholds table with section references, a regulatory citation audit, and a gap list — all with page or section citations traceable to the uploaded document.',
      verifyBefore:
        'Confirm the uploaded document is the current board-approved version (check the revision date on the cover page). Verify any cited regulatory references against the actual regulation text before acting on the gap analysis.',
    },
    {
      number: 2,
      title: 'Create a Project with persistent banking context',
      description:
        "Claude's Projects feature lets you store institution-specific context — your asset size, charter type, regulatory environment, and common document formats — so every conversation in that Project starts with full institutional awareness.",
      steps: [
        'In claude.ai, click "Projects" in the left sidebar, then "New Project".',
        'Name the project for your team or function (e.g., "Compliance Team Workspace" or "Lending Underwriting").',
        'Click "Project Instructions" and paste the context template from the Custom Instructions section below.',
        'Upload standing reference documents to the Project Knowledge section: your current policy manual, product glossary, or rate sheet.',
        'Every new conversation started inside this Project will automatically have access to these instructions and documents.',
        'To share a Project with colleagues you need a Team or Enterprise workspace.',
      ],
      prompt:
        'Paste the Project Instructions template (see Custom Instructions section) into the Project Instructions field, not into a chat. New conversations in the Project will inherit this context automatically.',
      expectedOutput:
        'A configured Project where every new conversation automatically inherits the institutional context, uploaded reference documents are searchable, and team members share a common starting point.',
      verifyBefore:
        'Review Project Instructions with your compliance officer before adding team members. Confirm that uploaded policy documents carry the current approval date and version number.',
    },
    {
      number: 3,
      title: 'Draft a board memo from raw financial data',
      description:
        "Provide Claude with raw quarterly figures and ask it to produce a structured board memo in your institution's standard format — ready for CFO review.",
      steps: [
        'Gather the raw data: net interest margin, noninterest income/expense, provision for credit losses, ROA, ROE, capital ratios, and notable variances from prior quarter and prior year.',
        'In a Project conversation (or new chat), paste the data table.',
        'Submit the prompt below.',
        'Review the output: verify every figure matches your source data exactly.',
        'Route to CFO and compliance for review before board distribution.',
      ],
      prompt:
        'I am the CFO of [INSTITUTION NAME]. Below is our [Q#] [YEAR] financial summary. Draft a board memo with these sections: (1) Executive Summary (3–4 sentences — highlight the single most important positive result and the single most important concern), (2) Net Interest Margin Analysis (compare to prior quarter and prior year; note rate environment context), (3) Asset Quality (ALLL ratio, NPL ratio, net charge-offs — flag any ratio that has moved more than 10 basis points), (4) Capital Position (compare reported ratios to well-capitalized thresholds under PCA), and (5) Outlook (one paragraph — no speculation beyond what the data supports). Format: formal memo header (To: Board of Directors, From: [CFO], Date: [DATE], Subject: [PERIOD] Financial Results). All figures must be presented in tabular format. Do not editorialize beyond what the numbers show.\n\n[PASTE DATA TABLE HERE]',
      expectedOutput:
        'A complete board memo with five sections, a formal header, and all figures in tabular format. Each variance from benchmark is flagged with the specific threshold reference.',
      verifyBefore:
        'Cross-check every figure in the output against your source data line by line. Claude may transpose numbers when multiple periods are present in a data table. Confirm PCA well-capitalized thresholds are current (12 CFR Part 6 for national banks; 12 CFR Part 702 for credit unions).',
    },
    {
      number: 4,
      title: 'Analyze a loan file for completeness against your checklist',
      description:
        "Upload a redacted loan file package and your institution's loan documentation checklist. Claude will identify missing items, flag deficiencies, and produce a completion matrix.",
      steps: [
        'Redact all borrower PII from the loan file before uploading (replace with "Borrower A", mask SSN/EIN, etc.).',
        'Upload both files: the redacted loan package and your checklist document.',
        'Submit the prompt below.',
        'Review the completion matrix. Use it as the first-pass review for your loan administration team.',
        'Document the AI review in the loan file as a preliminary screening — human underwriter sign-off remains mandatory.',
      ],
      prompt:
        "I have uploaded two documents: (1) a redacted commercial loan file package and (2) our institution's commercial loan documentation checklist. Please produce a completion matrix that lists every checklist item and marks it as: Present and Complete / Present but Deficient (describe the deficiency) / Missing. For each deficient or missing item, note the potential regulatory or credit policy implication. Conclude with a priority-ordered list of the top five documentation gaps that should be resolved before the file is presented to the loan committee. Cite the page or section of the loan file where each present item was found.",
      expectedOutput:
        'A three-column completion matrix (item / status / notes), a deficiency detail section, and a prioritized remediation list with regulatory context for each gap.',
      verifyBefore:
        'Confirm PII redaction before upload. Verify the checklist version matches the type of loan being reviewed (construction vs. term vs. line of credit). Claude may miss items presented in non-standard formats (handwritten forms, scanned tables) — manual review of those sections is required.',
      dataWarning:
        'Loan files are GLBA-protected. Redact every borrower identifier before upload. Even on a commercial plan the data passes through Anthropic infrastructure. Unredacted loan files belong only in a workspace your institution has approved for them.',
    },
    {
      number: 5,
      title: 'Build a reusable Artifact for recurring reports',
      description:
        "Use Claude's Artifacts feature to create a structured template — rendered as a formatted document — that your team can reuse each reporting cycle without reformatting.",
      steps: [
        'In a Project conversation, describe the report structure you need.',
        'Ask Claude to create the report as an Artifact using the prompt below.',
        'Claude will render the Artifact in a side panel. Review the structure.',
        'Ask for revisions directly ("Move the capital section before asset quality"), and Claude will update the Artifact.',
        "Once finalized, copy the Artifact content into your institution's report template. Save the conversation in the Project so you can return and regenerate next quarter.",
      ],
      prompt:
        "Create an Artifact containing a reusable quarterly reporting template for our community bank's ALCO (Asset/Liability Committee) packet. The template should include these sections with placeholder text and table structures: (1) Rate Risk Summary — a table for NII at risk at +/- 100, 200, 300 basis point shocks; (2) Liquidity Position — a table for the liquidity coverage ratio, brokered deposit concentration, and available contingency funding sources; (3) Investment Portfolio Summary — a table for total portfolio, unrealized gain/loss, duration, and yield by security type; (4) Key Assumptions — a text block for rate assumptions and prepayment speed assumptions; and (5) Committee Recommendations — a free-text section. Format as a professional committee document. Use placeholder values in brackets for all figures. Include column headers and row labels that match standard ALCO reporting conventions.",
      expectedOutput:
        'A rendered Artifact in the side panel containing a complete, formatted ALCO packet template with all five sections, placeholder table structures, and professional headers — ready to be populated with current-period data each quarter.',
      verifyBefore:
        'Review table structures with your CFO or ALM officer to confirm columns match your current ALCO format. Confirm rate shock scenarios align with your IRR policy before first use.',
    },
  ],

  customInstructions: {
    available: true,
    howTo:
      'Two places. For rules that apply everywhere: Settings → Profile → personal preferences. For one job: Projects → New Project → set the Project instructions, then add standing reference files to the Project knowledge (policy manual, documentation checklist, report templates). Every conversation inside the Project inherits them.',
    bankingExample:
      'PROJECT INSTRUCTIONS TEMPLATE:\n\nInstitution: [INSTITUTION NAME] is a [FDIC-insured community bank / NCUA-insured credit union] with approximately $[ASSET SIZE] in assets, headquartered in [CITY, STATE]. Primary federal regulator: [OCC / FDIC / Federal Reserve / NCUA]. Primary markets: [commercial / agricultural / residential / consumer / municipal]. This Project is used by the [DEPARTMENT NAME] team.\n\nStanding instructions:\n- Use precise regulatory terminology for internal work. Use plain language (8th-grade reading level) for member-facing drafts.\n- Cite specific regulation sections (e.g., 12 CFR §226.4, Regulation B §1002.9) when applicable.\n- Flag every response that requires compliance or legal review before use.\n- Do not speculate on regulatory intent. If a regulatory interpretation is uncertain, say so.\n- When analyzing an uploaded document, cite page numbers or section headings for each finding.\n- Present data comparisons in tables. All figures in financial documents use tabular formatting.\n- Do not fabricate citations, statistics, or regulatory thresholds. If you do not know a threshold, state that and recommend the source.\n\nSecurity note: Project Instructions and Knowledge files are visible to all Project members. Do not store customer PII, examination findings, or confidential supervisory information in Project Knowledge.',
  },

  dataSafety: {
    summary:
      "Data handling depends on the plan. On personal plans (Free, Pro, Max) you choose whether chats help train models in Settings → Privacy. Team and Enterprise are commercial plans: conversations are not used for training by default.",
    details: [
      'Personal plans (Free, Pro, Max): check the model-training setting in Settings → Privacy, and recheck it after policy updates. Verify current terms at anthropic.com/legal.',
      'Team and Enterprise: commercial terms; conversations are not used for training by default. Admin controls available.',
      'Enterprise: adds SSO, audit logs, and retention controls. Your vendor-management review decides what data it may hold.',
      "Never paste into Claude unless your institution has approved the plan for that data: customer names/SSNs/account numbers, loan files with borrower identity intact, unredacted financial statements, board minutes with material non-public information, examination findings or MRAs, core banking credentials, anything marked 'Confidential Supervisory Information'.",
      "Redaction checklist before every upload: replace customer names with placeholders, mask SSNs/EINs/account numbers/addresses, remove examiner names and MRA/MRE language, remove institution-specific identifiers if not required, replace confidential supervisory language with '[REDACTED]'.",
      "Why long-document reading changes the risk calculus: the ability to upload a 100-page document is powerful and creates a proportionally larger surface area for inadvertent data exposure. The redaction checklist is mandatory for loan files and exam-related materials.",
    ],
    bankingVerdict:
      "Appropriate for Tier 1 (public) tasks on any plan. Tier 2 (internal) tasks need a Team or Enterprise workspace your institution has approved. Long-document reading makes it strong for policy-manual and loan-file analysis — once redaction discipline is in place. AI tool use involving institution data should be governed by a written AI use policy.",
  },

  proTips: [
    {
      number: 1,
      tip: "Use Projects for every recurring workflow. The 5-minute setup pays off within the first week — you stop re-explaining your institution's context at the start of every session.",
    },
    {
      number: 2,
      tip: 'When uploading a large PDF for analysis, ask Claude to confirm what it has received first: "Summarize the document title, date, and table of contents." This surfaces upload parsing errors before you build on a faulty foundation.',
    },
    {
      number: 3,
      tip: "You can attach several documents in a single conversation to one conversation and ask cross-document questions. Example: upload your current and prior-year policy side by side and ask 'What changed between these two versions?'",
    },
    {
      number: 4,
      tip: 'Use the Artifacts panel for any output you intend to reuse — reports, templates, checklists. Artifacts are versioned within the conversation, so you can ask Claude to "go back to version 2 of the table" if a revision misses the mark.',
    },
    {
      number: 5,
      tip: 'For compliance drafting, end your prompt with: "After producing the draft, list three things a compliance officer should verify before this is used." This builds a self-audit step into every output and trains good review habits across your team.',
    },
  ],
};
