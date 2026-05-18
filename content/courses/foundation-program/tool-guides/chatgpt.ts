// ChatGPT (OpenAI) — the most widely adopted general-purpose AI chat
// platform. Strong on document drafting, regulatory summarization, and
// custom GPTs for departmental workflows.

import type { ToolGuide } from './types';

export const chatgptGuide: ToolGuide = {
  platformId: 'chatgpt',
  platformLabel: 'ChatGPT',
  platform: 'chatgpt',
  colorVar: 'var(--ledger-accent-2)',
  tagline:
    'The widely adopted default — strong on drafting, summarizing, and custom GPTs that carry your institution into every chat.',
  url: 'https://chatgpt.com',

  gettingStarted: {
    steps: [
      'Navigate to chatgpt.com and click "Sign up".',
      'Create an account with your work email so IT can manage access if needed.',
      'Verify your email and complete the onboarding flow.',
      'Set Custom Instructions before your first real task (see Custom Instructions section).',
      'Use a new chat for each distinct task — each chat is a clean context.',
    ],
    firstSessionNote:
      'You land on the free tier (GPT-4o with daily rate limits) by default. The ChatGPT iOS and Android apps are fully functional and support file upload and voice input. Avoid saving sensitive conversations to your browser history.',
  },

  pricing: [
    {
      tierName: 'Free',
      cost: '$0/month',
      keyLimits: [
        'GPT-4o with daily message limits',
        'Unlimited GPT-4o mini',
        '~8K token context window',
        'File uploads limited',
        'Conversations may be used for training unless opted out (Settings → Data Controls)',
      ],
      bankingVerdict:
        'Sufficient for individual contributors exploring AI with non-sensitive tasks. Set Custom Instructions and opt out of training data on first sign-in. Not appropriate for any task involving institution data.',
    },
    {
      tierName: 'Plus',
      cost: '$20/month',
      keyLimits: [
        'Full GPT-4o access',
        '~128K token context window',
        'Up to 10 file uploads per chat',
        'Deep Research (limited monthly quota)',
        'DALL-E image generation',
        'Create and use custom GPTs',
        'Conversations not used for training by default',
      ],
      bankingVerdict:
        'The right tier for compliance, lending, and operations staff who run 5+ AI-assisted tasks daily. Custom GPTs alone justify the cost for a power user.',
    },
    {
      tierName: 'Team',
      cost: '$25/user/month',
      keyLimits: [
        'Everything in Plus, with admin console',
        'Admin-managed conversation retention',
        'Shared custom GPTs across the workspace',
        'Conversations not used for training (admin-enforced)',
      ],
      bankingVerdict:
        'For departments sharing custom GPTs and needing admin visibility (audit trail, retention controls). The natural starting point when a team moves past individual experimentation.',
    },
    {
      tierName: 'Enterprise',
      cost: 'Contact OpenAI sales',
      keyLimits: [
        'SOC 2 compliant',
        'BAA available',
        '0-day retention option',
        'SSO + audit logs',
        'Dedicated workspace',
      ],
      bankingVerdict:
        'The only tier appropriate for institutions that need to process Tier 2 (internal) data through ChatGPT. Smaller community banks should evaluate whether NotebookLM (free, document-grounded) covers the use cases first.',
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
        "Use ChatGPT's Deep Research feature (Plus/Team required) to compile a sourced market analysis on commercial real estate lending trends in your target geography.",
      steps: [
        'Confirm you have a ChatGPT Plus or Team subscription (Deep Research is not available on the free tier).',
        'Open a new chat and click the "Deep Research" option before submitting.',
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
        'PII redaction is non-negotiable. Customer identity in a borrower financial statement crosses into GLBA territory and is not appropriate for any ChatGPT tier below Enterprise with a signed BAA.',
    },
    {
      number: 5,
      title: 'Create a custom GPT for your department',
      description:
        "Build a department-specific custom GPT (Plus/Team required) that carries your institution's policies, terminology, and formatting standards into every interaction.",
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
      'Click your profile icon (bottom-left on desktop) → "Custom Instructions". You will see two text fields: one for context about you, one for how ChatGPT should respond. These persist across all new chats and save you from re-explaining your role every session. Custom Instructions are visible to OpenAI — do not include confidential institution data or customer information.',
    bankingExample:
      'WHAT TO KNOW ABOUT YOU:\nI am a [YOUR ROLE] at [INSTITUTION NAME], a community [bank / credit union] with approximately $[ASSET SIZE] in assets, headquartered in [STATE]. We serve [primary market: rural / suburban / commercial / agricultural]. My primary responsibilities include [2–3 key duties]. Our primary federal regulator is [OCC / FDIC / Federal Reserve / NCUA]. We are subject to [CRA / BSA-AML / Reg B / HMDA — list applicable]. I often work with: [call reports, loan files, board reports, member communications, policy documents].\n\nHOW TO RESPOND:\n- Lead with the most actionable information first.\n- Use plain language (8th-grade reading level) for member-facing drafts; use precise regulatory terminology for internal compliance work.\n- Present lists and comparisons in tables when possible.\n- Always flag when a response involves regulatory interpretation and recommend human compliance review.\n- Do not speculate about regulatory intent or provide legal advice.\n- When citing a regulation, include the specific section number (e.g., Reg DD §1030.4).\n- If you are uncertain about a fact, say so explicitly — do not fabricate sources.\n- Keep responses concise. If a detailed breakdown is needed, ask before expanding.',
  },

  dataSafety: {
    summary:
      "OpenAI's data handling varies by tier. Free conversations may be used for training unless opted out. Plus and Team do not use conversations for training by default. Enterprise offers BAA + 0-day retention.",
    details: [
      'Free tier: conversations may be reviewed by OpenAI staff for safety and quality. Training opt-out is in Settings → Data Controls → "Improve the model for everyone".',
      'Plus: conversations are not used for training by default. Still subject to OpenAI\'s standard retention policy.',
      'Team: admin can enforce retention settings. Conversations are not used for training.',
      'Enterprise: SOC 2 compliant, 0-day retention option, BAA available. Required for any Tier 2 (internal) data processing.',
      'Never paste into ChatGPT (any tier below Enterprise with BAA): customer names/SSNs/account numbers, loan application details with borrower identity, unredacted financial statements, non-public board minutes, examination findings or MRAs, core system credentials, or material non-public information.',
      'Safe-practice redaction checklist before uploading any document: replace customer names with placeholders, mask SSNs/EINs/account numbers/addresses, remove "Confidential Supervisory Information" text, remove examiner names and MRA/MRE language, replace institution name with a generic label if not required.',
    ],
    bankingVerdict:
      "Appropriate for Tier 1 (public) tasks on any tier. Tier 2 (internal) tasks require Enterprise with BAA. Use of ChatGPT with non-public institution data should be covered by your AI use policy — if your institution does not have one, flag to compliance and use the AiBI-Foundation model policy template.",
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
      tip: 'When a response is 80% right, use "Revise the second section only — keep everything else" rather than regenerating. Targeted revisions are faster and preserve what worked.',
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
