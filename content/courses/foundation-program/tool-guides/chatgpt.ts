// ChatGPT (OpenAI) — the most widely adopted general-purpose AI chat
// platform. Strong on document drafting, regulatory summarization, and
// custom GPTs for departmental workflows.

import type { ToolGuide } from './types';

export const chatgptGuide: ToolGuide = {
  platformId: 'chatgpt',
  platformLabel: 'ChatGPT',
  platform: 'chatgpt',
  colorVar: 'var(--ink)',
  tagline:
    'The widely adopted default — strong on drafting, summarizing, and custom GPTs that carry your institution into every chat.',
  url: 'https://chatgpt.com',
  pricingUrl: 'https://chatgpt.com/pricing',
  verifiedOn: '2026-10-04',
  reviewBy: '2027-01-04',

  gettingStarted: {
    steps: [
      'Navigate to chatgpt.com and click "Sign up".',
      'Create an account with your work email so IT can manage access if needed.',
      'Verify your email and complete the onboarding flow.',
      'Set Custom Instructions before your first real task (see Custom Instructions section).',
      'Use a new chat for each distinct task — each chat is a clean context.',
    ],
    firstSessionNote:
      'You start on the Free plan, which has usage limits. The iOS and Android apps support file upload and voice. Before your first real task, turn off model training in Settings → Data Controls.',
  },

  pricing: [
    {
      tierName: 'Free',
      cost: '$0',
      keyLimits: [
        'Usage limits on the newest models',
        'Conversations may be used for training unless you opt out (Settings → Data Controls)',
      ],
      bankingVerdict:
        'Enough to learn on with public, non-sensitive text. Opt out of training on day one. Not for institution data.',
    },
    {
      tierName: 'Go, Plus, Pro',
      cost: 'Individual plans · see pricing page',
      keyLimits: [
        'Higher limits, file uploads, projects, custom GPTs, deep research',
        'Personal accounts: your institution has no admin control',
      ],
      bankingVerdict:
        'Fine for learning at home. A personal paid plan is still a personal account, so it does not make institution data safe.',
    },
    {
      tierName: 'Business',
      cost: '$25/user/month monthly · $20 billed annually (standard seats)',
      keyLimits: [
        'Admin console and shared workspace (formerly called Team)',
        'Business data is not used for training by default',
        'Shared GPTs and projects across the team',
      ],
      bankingVerdict:
        'The first plan a bank should consider for real work, because IT controls it. Have your vendor-management process review it first.',
    },
    {
      tierName: 'Enterprise',
      cost: 'Annual contract · contact OpenAI',
      keyLimits: [
        'SSO, audit logs, and retention controls',
        'Contractual data-processing terms',
      ],
      bankingVerdict:
        'For institutions that want contract terms covering internal data. Weigh it against the AI already inside tools you license.',
    },
  ],

  bankingUseCases: [
    {
      number: 1,
      title: 'Summarize a regulatory update for staff',
      description:
        'Paste the full text of a CFPB bulletin, FDIC Financial Institution Letter, or Federal Reserve SR Letter and receive a plain-English summary your frontline staff can act on.',
      steps: [
        'Open chatgpt.com and start a new chat.',
        'Copy the full text of the regulatory document (bulletin body only — no appendices on the first pass).',
        'Paste the text into the message box, then add the prompt below.',
        'Review the output against the original. Verify every obligation listed is present in the source text.',
        'Share the summary via your normal compliance distribution channel. Do not treat it as legal advice.',
      ],
      prompt:
        'I am a compliance officer at a community bank. The following is the full text of a regulatory bulletin. Please produce: (1) a one-paragraph executive summary for senior management, (2) a bulleted list of specific obligations or changes that affect deposit operations, (3) a bulleted list of obligations that affect lending, and (4) a recommended internal deadline for acknowledging these changes. Flag any item that requires a policy update. Do not speculate beyond what is written.\n\n[PASTE BULLETIN TEXT HERE]',
      expectedOutput:
        'A four-section structured response: executive summary paragraph, deposit obligations list, lending obligations list, and a suggested 30/60/90-day action timeline with policy-update flags.',
      verifyBefore:
        'Confirm each obligation in the output maps to specific language in the source document. If a deadline is inferred, verify it against the effective date stated in the original.',
    },
    {
      number: 2,
      title: 'Draft a member rate-change communication',
      description:
        'Generate a compliant, plain-language letter or email notifying members or customers of a deposit or loan rate change, ready for compliance review.',
      steps: [
        'Gather: the account type, current rate, new rate, effective date, and any Regulation DD or TISA disclosure requirements that apply.',
        'Open a new ChatGPT chat.',
        'Provide the details using the prompt below.',
        "Review output against your institution's model letter archive and compliance checklist.",
        'Route through compliance before sending.',
      ],
      prompt:
        'I work in marketing at a community bank. Draft a rate-change notification letter for our certificate of deposit holders. Details: current APY is [CURRENT_RATE]%, new APY will be [NEW_RATE]%, effective [EFFECTIVE_DATE]. The letter must: use plain language at an 8th-grade reading level, comply with Regulation DD advance-notice requirements, include a clear call to action if the member needs to take any steps, and close with contact information for our Member Services team at [PHONE] or [EMAIL]. Do not make any representations about future rates. Tone: warm, professional, reassuring.',
      expectedOutput:
        'A formatted letter (salutation, body paragraphs, closing) with a subject line for email delivery, flagged disclosure language, and a note on the Reg DD advance-notice window.',
      verifyBefore:
        'Confirm the notice window (typically 30 days for time deposits under Reg DD). Verify the new rate matches your board-approved rate sheet before compliance review.',
    },
    {
      number: 3,
      title: 'Deep Research for CRE lending market analysis',
      description:
        "Use ChatGPT's deep research mode (paid plans; limits vary by plan) to compile a sourced market analysis on commercial real estate lending trends in your target geography.",
      steps: [
        'Check that your plan includes deep research and how many runs it allows this month.',
        'Open a new chat and choose deep research from the tools menu before submitting.',
        'Submit the prompt below, substituting your target geography and property type.',
        'Review the research report and its citations. Open each linked source to verify the data.',
        'Use the output as a starting brief for your lending team — not as a standalone underwriting document.',
      ],
      prompt:
        'Conduct a deep research analysis of the commercial real estate lending environment for [PROPERTY_TYPE, e.g., multifamily / office / retail] properties in [MSA or STATE] as of [CURRENT_YEAR]. Include: (1) vacancy rate trends over the past 24 months, (2) cap rate benchmarks by property class, (3) recent notable distress events or lender exits in this market, (4) relevant FDIC or Federal Reserve guidance on CRE concentration risk published in the last 18 months, and (5) three specific risk factors a community bank originating in this market should underwrite against. Cite all sources with publication date and publisher.',
      expectedOutput:
        'A multi-section research brief with inline citations, a risk-factor section, and a summary table of vacancy and cap rate data. Each claim should link to a verifiable source.',
      verifyBefore:
        "Open every cited source before distributing. Deep Research can hallucinate citations. Cross-reference vacancy data against CoStar, CBRE, or your state banking association's market reports.",
    },
    {
      number: 4,
      title: 'Analyze a redacted financial statement',
      description:
        "Upload a borrower's financial statement (balance sheet, income statement, or tax return) and ask ChatGPT to calculate key credit ratios and flag anomalies for your underwriting review.",
      steps: [
        'Before uploading: redact or replace all PII (name, SSN, EIN, address) with placeholders such as "[BORROWER_A]". This is mandatory — see Data Safety section.',
        'In a new ChatGPT chat, click the paperclip icon to upload the redacted PDF or spreadsheet.',
        'Submit the prompt below.',
        "Review each ratio against your institution's credit policy thresholds.",
        'Document the AI output as a preliminary screening tool only. Final credit decisions require human underwriter sign-off.',
      ],
      prompt:
        'I am a commercial lender at a community bank. I have uploaded a redacted borrower financial statement (all PII has been removed). Please: (1) calculate debt-service coverage ratio (DSCR) using net operating income divided by total debt service, (2) calculate the current ratio and quick ratio, (3) calculate debt-to-equity and debt-to-assets, (4) identify any year-over-year trends that would be material to a credit decision, and (5) list any line items that appear unusual or inconsistent and should be verified with source documents. Present calculations in a table. Flag where a ratio falls below typical community bank credit policy thresholds.',
      expectedOutput:
        'A ratio table with calculated values and policy-benchmark comparisons, a trend analysis paragraph, and a flagged-items list with suggested verification steps.',
      verifyBefore:
        'Confirm PII redaction is complete before upload. Verify all ratio formulas against your credit policy. ChatGPT may misread table formatting — cross-check raw figures against the uploaded document.',
      dataWarning:
        'PII redaction is non-negotiable. Customer identity in a borrower financial statement is GLBA-protected and does not belong in any AI tool your institution has not approved for it.',
    },
    {
      number: 5,
      title: 'Create a custom GPT for your department',
      description:
        "Build a department-specific custom GPT (paid plans) that carries your institution's policies, terminology, and formatting standards into every interaction.",
      steps: [
        'Confirm your plan can create GPTs. On Business, check whether your admin allows sharing.',
        'Open GPTs in the sidebar and choose Create.',
        'In the Configure tab, fill in the Name, Description, and Instructions fields using the guidance in the prompt below.',
        'Upload reference documents (your policy manual excerpt, product sheet, or compliance checklist) under "Knowledge".',
        'Set capabilities: turn on web search only if staff need current information; turn off image generation unless the team needs it.',
        'Share it only inside your workspace, not by public link.',
        'Test with 10 representative staff questions before releasing.',
      ],
      prompt:
        'You are a custom GPT assistant for the [DEPARTMENT, e.g., Mortgage Lending / BSA-AML Compliance / Retail Branch] team at [INSTITUTION NAME], a community bank headquartered in [STATE]. Your role is to help staff [SPECIFIC TASK, e.g., draft customer disclosures / screen transactions / answer product FAQs]. Always: use plain language, cite the relevant policy section when referencing internal guidelines, recommend human review before any customer-facing output is sent, and flag any request that may involve regulatory compliance or legal interpretation for escalation to the compliance or legal team. Never: provide specific legal advice, make credit decisions, or speculate about regulatory intent. When uncertain, say so and suggest the appropriate internal resource.',
      expectedOutput:
        'A configured custom GPT with department-specific instructions, uploaded knowledge documents, and a shareable internal link your team can bookmark.',
      verifyBefore:
        'Review instructions with your compliance officer before launch. Confirm uploaded policy documents are the current approved version. Test edge-case prompts (e.g., "Can I approve this loan?") to verify the GPT escalates correctly.',
    },
  ],

  customInstructions: {
    available: true,
    howTo:
      'Settings → Personalization → Custom instructions. One field covers who you are, one covers how ChatGPT should respond. They apply to every new chat. They are stored by OpenAI, so keep confidential institution data and customer information out.',
    bankingExample:
      'WHAT TO KNOW ABOUT YOU:\nI am a [YOUR ROLE] at [INSTITUTION NAME], a community [bank / credit union] with approximately $[ASSET SIZE] in assets, headquartered in [STATE]. We serve [primary market: rural / suburban / commercial / agricultural]. My primary responsibilities include [2–3 key duties]. Our primary federal regulator is [OCC / FDIC / Federal Reserve / NCUA]. We are subject to [CRA / BSA-AML / Reg B / HMDA — list applicable]. I often work with: [call reports, loan files, board reports, member communications, policy documents].\n\nHOW TO RESPOND:\n- Lead with the most actionable information first.\n- Use plain language (8th-grade reading level) for member-facing drafts; use precise regulatory terminology for internal compliance work.\n- Present lists and comparisons in tables when possible.\n- Always flag when a response involves regulatory interpretation and recommend human compliance review.\n- Do not speculate about regulatory intent or provide legal advice.\n- When citing a regulation, include the specific section number (e.g., Reg DD §1030.4).\n- If you are uncertain about a fact, say so explicitly — do not fabricate sources.\n- Keep responses concise. If a detailed breakdown is needed, ask before expanding.',
  },

  dataSafety: {
    summary:
      "OpenAI's data handling depends on the plan. Personal plans (Free, Go, Plus, Pro) may use conversations for training unless you opt out. Business and Enterprise data is not used for training by default.",
    details: [
      'Personal plans: training opt-out is in Settings → Data Controls. Conversations may still be reviewed for safety.',
      'Business: admins manage the workspace; business data is not used for training by default.',
      'Enterprise: adds SSO, audit logs, retention controls, and contract terms. Your vendor-management review decides what data it may hold.',
      'Never paste into ChatGPT unless your institution has approved the plan for that data: customer names/SSNs/account numbers, loan application details with borrower identity, unredacted financial statements, non-public board minutes, examination findings or MRAs, core system credentials, or material non-public information.',
      'Safe-practice redaction checklist before uploading any document: replace customer names with placeholders, mask SSNs/EINs/account numbers/addresses, remove "Confidential Supervisory Information" text, remove examiner names and MRA/MRE language, replace institution name with a generic label if not required.',
    ],
    bankingVerdict:
      "Appropriate for Tier 1 (public) tasks on any plan. Tier 2 (internal) tasks need a Business or Enterprise workspace your institution has approved. Use of ChatGPT with non-public institution data should be covered by your AI use policy — if your institution does not have one, flag to compliance and use the AiBI-Foundation model policy template.",
  },

  proTips: [
    {
      number: 1,
      tip: 'Use a new chat for each distinct task. Mixing a compliance summary and a marketing draft in one chat degrades response quality as the context fills up with unrelated turns.',
    },
    {
      number: 2,
      tip: 'Paste long documents before your instruction, not after. ChatGPT processes the full context but anchors more strongly to recent tokens — put the task last.',
    },
    {
      number: 3,
      tip: 'When a response is mostly right, use "Revise the second section only — keep everything else" rather than regenerating. Targeted revisions are faster and preserve what worked.',
    },
    {
      number: 4,
      tip: 'For recurring tasks (e.g., monthly board report draft), save your best prompt in a shared document and paste it each time. Custom GPTs are the better long-term solution for team-wide reuse.',
    },
    {
      number: 5,
      tip: 'If ChatGPT adds unsolicited caveats that clutter the output (e.g., "Please consult a legal professional"), add "Omit standard disclaimers — I understand this is AI-generated and requires professional review" to your prompt.',
    },
  ],
};
