// AiBI Foundations Tool Guides — Microsoft Copilot and Google Gemini
// Deep platform guides for banking practitioners
// Each guide covers: getting started, free vs paid, use cases, custom instructions, data safety, pro tips

import type { PromptPlatform } from './prompt-library';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToolGuideUseCase {
  readonly id: string;
  readonly title: string;
  readonly scenario: string;           // Real-world banking scenario context
  readonly prompt: string;             // Copy-paste-ready prompt text
  readonly expectedOutput: string;     // What a good output looks like
  readonly dataWarning?: string;       // Data classification note if applicable
}

export interface ToolGuideTier {
  readonly name: string;
  readonly price: string;
  readonly accessPath: string;
  readonly keyCapabilities: readonly string[];
  readonly bankingRelevance: string;
}

export interface ToolGuideCustomInstructions {
  readonly title: string;
  readonly navigationPath: string;
  readonly bankingTemplate: string;    // Ready-to-use system instruction text
  readonly notes: string;
}

export interface ToolGuideDataSafety {
  readonly summary: string;
  readonly keyProtections: readonly string[];
  readonly whatThisMeansForBanks: string;
  readonly dataClassificationRule: string;
}

export interface ToolGuideProTip {
  readonly id: string;
  readonly tip: string;
  readonly detail: string;
}

export interface ToolGuide {
  readonly id: string;
  readonly platform: PromptPlatform;
  readonly title: string;
  readonly subtitle: string;
  readonly gettingStarted: {
    readonly primaryUrl: string;
    readonly alternateUrl?: string;
    readonly firstSteps: readonly string[];
    readonly institutionalNote: string;
  };
  readonly tiers: readonly ToolGuideTier[];
  readonly useCases: readonly ToolGuideUseCase[];
  readonly customInstructions: ToolGuideCustomInstructions;
  readonly dataSafety: ToolGuideDataSafety;
  readonly proTips: readonly ToolGuideProTip[];
}

// ---------------------------------------------------------------------------
// Microsoft Copilot Guide
// ---------------------------------------------------------------------------

export const copilotGuide: ToolGuide = {
  id: 'tool-guide-copilot',
  platform: 'copilot',
  title: 'Microsoft Copilot',
  subtitle: 'AI embedded in the tools your institution already runs',

  gettingStarted: {
    primaryUrl: 'copilot.microsoft.com',
    firstSteps: [
      'Navigate to copilot.microsoft.com in any browser and sign in with your Microsoft account.',
      'If your institution uses Microsoft 365, sign in with your work email to activate commercial data protections automatically.',
      'Check whether your institution has provisioned M365 Copilot by opening Outlook, Word, or Teams and looking for the Copilot button in the toolbar or ribbon.',
      'If you see a Copilot button in M365 apps, your institution has the add-on license and you have access to the full integrated experience.',
      'If you do not see Copilot buttons in M365 apps, you still have access to the standalone Copilot at copilot.microsoft.com with your work credentials.',
    ],
    institutionalNote:
      'Most community banks and credit unions on Microsoft 365 Business or Enterprise plans already have some form of Copilot access. Before purchasing anything, ask your IT administrator whether M365 Copilot is provisioned. The section on licensing below includes the exact email to send.',
  },

  tiers: [
    {
      name: 'Free Copilot',
      price: 'Free',
      accessPath: 'copilot.microsoft.com (any Microsoft account)',
      keyCapabilities: [
        'Web-grounded conversational AI via Bing',
        'Image generation (limited)',
        'Basic drafting and summarization',
        'Available in Windows 11 Start menu and Edge browser sidebar',
      ],
      bankingRelevance:
        'Suitable for staff who need occasional research and drafting help and whose institution has not provisioned M365 Copilot. Uses consumer-grade data handling — do not enter customer data, loan details, or member information.',
    },
    {
      name: 'M365 Copilot in Apps',
      price: 'Included with M365 E3 or E5 plan (institution pays)',
      accessPath: 'Appears inside Outlook, Teams, Word, Excel, PowerPoint when IT activates it',
      keyCapabilities: [
        'Copilot in Outlook: email drafting, thread summarization, reply suggestions',
        'Copilot in Teams: meeting transcription and summary, action item extraction',
        'Copilot in Word: draft from outline, rewrite, summarize documents',
        'Copilot in Excel: formula generation, data analysis, chart creation from plain English',
        'Copilot in PowerPoint: generate slides from a Word document or outline',
        'Copilot in SharePoint: search and summarize internal documents',
      ],
      bankingRelevance:
        'This is the tier most relevant to day-to-day banking operations. If your institution is on M365 E3 or E5, ask IT whether Copilot is activated — it may already be available at no additional cost.',
    },
    {
      name: 'Microsoft 365 Copilot Add-On',
      price: '$30 per user per month (added to existing M365 subscription)',
      accessPath: 'Purchased through Microsoft or a Microsoft partner by your IT/procurement team',
      keyCapabilities: [
        'Everything in M365 Copilot in Apps',
        'Copilot Pages: collaborative AI workspace shared across your team',
        'Copilot Studio: build custom AI agents without code for workflows specific to your institution',
        'Business Chat (BizChat): cross-app AI that can reference emails, meetings, documents, and chats simultaneously',
        'Priority access to the latest model updates',
      ],
      bankingRelevance:
        'Justified for institutions where multiple staff members handle high-volume document work, compliance documentation, or member-facing correspondence. Copilot Studio is particularly relevant for building custom intake forms and approval routing.',
    },
  ],

  useCases: [
    {
      id: 'copilot-uc-1',
      title: 'Draft a Professional Response to a Member Complaint',
      scenario:
        'A member has submitted a written complaint about a hold placed on a deposited check. You need to respond within 24 hours in a tone that is empathetic, professional, and compliant with Reg CC disclosure requirements.',
      prompt: `You are a community bank customer service specialist. Draft a professional written response to the following member complaint. The response must be empathetic, clear, and compliant with Regulation CC requirements.

Member complaint: "I deposited a $3,200 check on Monday and your bank put a hold on it for 7 business days. I needed these funds for a time-sensitive home repair. Nobody explained why this was happening and I feel like I am being treated like a criminal."

Requirements for your response:
- Open with genuine acknowledgment of the member's frustration
- Explain the Reg CC check hold policy in plain language (no jargon)
- State the specific date funds will be available
- Offer one concrete next step the member can take if they have an urgent need
- Close professionally with member retention in mind
- Length: 150–200 words`,
      expectedOutput:
        'A 150–200 word letter that opens with empathy, explains the hold in plain language, references the fund availability date, offers the option to speak with a branch manager about expediting if urgent circumstances exist, and closes warmly.',
      dataWarning:
        'Replace the hold amount and dates with placeholders before drafting in Copilot. Do not enter the actual member name, account number, or specific check details.',
    },
    {
      id: 'copilot-uc-2',
      title: 'Auto-Summarize a Loan Committee Meeting',
      scenario:
        'Your loan committee meeting ran 90 minutes and covered six credit decisions, two policy questions, and an interest rate discussion. You need a summary with action items for the board packet.',
      prompt: `This is used in Copilot in Teams after a recorded and transcribed meeting. In the Teams meeting recap, click "Copilot" and enter:

"Summarize this meeting in the following format:
1. Credit decisions made (borrower type, amount approved or declined, key conditions)
2. Policy questions raised and their resolution status
3. Interest rate discussion summary (one paragraph)
4. Action items — each item should include the responsible party and due date if mentioned
5. Items deferred to next meeting

Format each section with a clear heading. Flag any item where the committee did not reach consensus."`,
      expectedOutput:
        'A structured summary with five labeled sections. Credit decisions listed as a table or bulleted list. Action items attributed to named participants with dates. Deferred items called out explicitly.',
      dataWarning:
        'Loan committee meetings may contain MNPI (material non-public information) and NPI (non-public personal information). Verify your institution\'s M365 data processing agreement covers meeting transcript retention before enabling Teams transcription.',
    },
    {
      id: 'copilot-uc-3',
      title: 'Analyze a Delinquency Report Without Writing Formulas',
      scenario:
        'You have received the monthly delinquency report as an Excel file. You need to identify trends, flag any loan categories with deteriorating performance, and produce a summary paragraph for the CFO.',
      prompt: `Used in Copilot in Excel. Open the delinquency report, click the Copilot button in the Home ribbon, and enter:

"Analyze this delinquency data and give me:
1. Which loan category has the highest 30-day delinquency rate this month?
2. Which loan categories show month-over-month deterioration of more than 10 basis points?
3. What is the total dollar value of loans 90+ days past due?
4. Create a summary paragraph (3–4 sentences) I can include in a CFO briefing that describes the overall portfolio health trend without using jargon.
5. Flag any outliers — loan categories or branch locations where delinquency is more than two standard deviations above the portfolio average."`,
      expectedOutput:
        'Copilot returns a structured analysis with answers to each numbered question, a highlighted table showing the deteriorating categories, and a clean narrative paragraph. Outliers are flagged with specific values.',
      dataWarning:
        'Aggregated delinquency reports that do not contain individual borrower names or account numbers may be used in M365 Copilot under your commercial data agreement. Confirm with your compliance officer before working with files that include individual loan-level NPI.',
    },
    {
      id: 'copilot-uc-4',
      title: 'Draft a Board Presentation Outline from Bullet Points',
      scenario:
        'You need to prepare the Q2 cybersecurity update for the board. You have rough notes but need a structured, boardroom-ready presentation.',
      prompt: `Used in Copilot in Word or PowerPoint. Open a new document, paste your rough notes, then enter:

"I am preparing a board-level cybersecurity update for a community bank. Using the notes below, create a 10-slide presentation outline that:
1. Opens with a one-slide executive summary (no more than 5 bullet points)
2. Follows with a slide on the current threat landscape relevant to community banks (cite 2–3 specific threat categories)
3. Covers our institution's Q2 incidents and near-misses (without assigning blame or creating discoverable admissions)
4. Presents our top 3 risk reduction actions with status (complete / in progress / not started)
5. Ends with one ask from the board — a decision or approval needed
6. Closes with a Q&A placeholder slide

Each slide should have a headline (8 words or fewer) and 3–5 supporting bullets. Write in plain language appropriate for non-technical board members."`,
      expectedOutput:
        'A 10-section outline with slide headlines and supporting bullets. Executive summary is concise. Threat landscape uses recognizable categories (phishing, ransomware, third-party risk). Board ask is specific and actionable.',
    },
    {
      id: 'copilot-uc-5',
      title: 'Find Out What Copilot License Your Institution Has',
      scenario:
        'Before building any AI workflow on Copilot, you need to know what your institution has licensed. This is the exact email to send your IT department.',
      prompt: `Subject: Question about our Microsoft 365 Copilot licensing

Hi [IT contact name],

I am looking into using Microsoft Copilot as part of a professional AI training program I am completing. Before I invest time in learning it, I want to make sure I understand what we have available.

Could you answer three quick questions?

1. Does our M365 subscription include the Copilot add-on ($30/user/month) for any users, and if so, am I included?
2. If we do not have the add-on, does our E3 or E5 license include any Copilot features in Outlook, Teams, Word, or Excel?
3. Is there an approved acceptable-use policy for Copilot that I should read before I start using it for work tasks?

I want to make sure I am working within our approved tools and data handling policies.

Thank you,
[Your name]`,
      expectedOutput:
        'Use this prompt as a literal email template. The three questions are designed to surface the three most common licensing situations without putting IT on the defensive. Most IT departments will respond within one business day.',
    },
  ],

  customInstructions: {
    title: 'Personalizing Copilot for Banking Work',
    navigationPath: 'copilot.microsoft.com → Settings (gear icon, top right) → Personalization',
    bankingTemplate: `I work at a community bank / credit union serving [asset size, e.g., $450 million in assets] in [state or region]. My role is [your role, e.g., VP of Compliance / Branch Manager / Loan Officer].

When I ask for help drafting communications, always use a professional, plain-language tone appropriate for a federally regulated financial institution. Avoid jargon, hedge language, and casual phrasing.

When I ask about regulations, cite specific regulation names (e.g., Reg B, Reg CC, BSA/AML, TPRM) and acknowledge when something requires legal review rather than stating a definitive legal conclusion.

Do not include customer or member personal information in responses unless I explicitly provide it in the prompt. Remind me to use placeholders if I appear to include real NPI.

Default output format: clear headings, numbered lists for action items, bullet points for reference information, prose paragraphs for member-facing content.`,
    notes:
      'Personalization settings apply to copilot.microsoft.com only. Copilot within M365 apps (Outlook, Teams, Word, Excel) does not currently read these personalization settings — you will need to include role context in your in-app prompts manually until Microsoft rolls out unified personalization.',
  },

  dataSafety: {
    summary:
      'Microsoft provides commercial data protection for any user signed in with a work or school Microsoft 365 account. This is meaningfully different from the consumer Copilot experience and is the baseline for institutional use.',
    keyProtections: [
      'Prompts and responses are not used to train Microsoft AI models when you are signed in with a work account.',
      'Data is processed under the Microsoft Product Terms and Data Processing Addendum, which satisfies GDPR and is compatible with most bank privacy programs.',
      'Microsoft 365 Copilot inherits your institution\'s existing M365 data residency settings — data stays in the same geographic region as your M365 tenant.',
      'Copilot cannot access data from SharePoint, Teams, or Exchange beyond what the signed-in user is already authorized to access — it respects existing permissions.',
      'Microsoft does not sell your prompts or data to advertisers.',
    ],
    whatThisMeansForBanks:
      'Commercial data protection means Copilot is appropriate for working with internal bank documents, policy drafts, meeting notes, and aggregated operational data. It is NOT automatically approved for individual member NPI (Social Security numbers, account numbers, loan details). Check with your compliance officer and review your institution\'s AI acceptable-use policy before processing member-specific data. For institutions with a signed Microsoft data processing addendum covering M365, Copilot falls under the same data governance framework as the rest of your M365 environment.',
    dataClassificationRule:
      'Rule of thumb: if you would send it in an internal email to a colleague, it is likely safe to use in M365 Copilot under commercial protection. If it is a document you would classify as Confidential or Restricted (loan files, exam reports, member statements), confirm with compliance before using Copilot to process it.',
  },

  proTips: [
    {
      id: 'copilot-tip-1',
      tip: 'Your IT department probably already has this — ask before you pay',
      detail:
        'A significant number of community banks and credit unions on Microsoft 365 E3 or E5 plans have some form of Copilot available and simply have not communicated it to staff. The email template in Use Case 5 is specifically designed to surface this. Before paying for any AI subscription, confirm what your institution already has licensed.',
    },
    {
      id: 'copilot-tip-2',
      tip: 'Copilot in Teams is the fastest ROI for most banking staff',
      detail:
        'Meeting summarization in Teams Copilot consistently produces the highest time savings per task for banking professionals. A 90-minute loan committee or ALCO meeting produces a usable summary in under 30 seconds. If your institution has meeting transcription enabled, this alone justifies learning the tool.',
    },
    {
      id: 'copilot-tip-3',
      tip: 'Use natural language column references in Excel — do not guess formulas',
      detail:
        'Most Excel users try to ask Copilot "write me a VLOOKUP." A more effective approach is to describe what you want in plain English: "Show me all loans where the current balance is more than 10% above the original approved amount." Copilot handles the formula construction. This works especially well for delinquency reports, call report prep, and budget variance analysis.',
    },
    {
      id: 'copilot-tip-4',
      tip: 'Include your regulatory context in every prompt',
      detail:
        'Copilot does not know you work at a federally regulated financial institution unless you tell it. A prompt that starts with "As a community bank compliance officer preparing for our next OCC exam..." produces materially more relevant output than the same prompt without that context. Until Microsoft\'s personalization applies inside M365 apps, make role context part of every prompt.',
    },
    {
      id: 'copilot-tip-5',
      tip: 'Copilot Studio is worth exploring for repetitive intake processes',
      detail:
        'If your institution has the M365 Copilot add-on, Copilot Studio lets you build custom AI agents without writing code. Use cases that work well in community banking include: vendor questionnaire intake, member complaint triage routing, and BSA case narrative drafting. These agents operate within your M365 data boundary. Engage IT early — the agent builder requires Azure permissions that may need admin approval.',
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// Google Gemini Guide
// ---------------------------------------------------------------------------

export const geminiGuide: ToolGuide = {
  id: 'tool-guide-gemini',
  platform: 'gemini',
  title: 'Google Gemini',
  subtitle: 'Google Workspace-native AI with a 1-million-token context window',

  gettingStarted: {
    primaryUrl: 'gemini.google.com',
    firstSteps: [
      'Navigate to gemini.google.com and sign in with your Google account.',
      'If your institution uses Google Workspace, sign in with your work Google account — this activates Workspace data protections.',
      'On first visit, Gemini will ask which model to use. Free accounts default to Gemini 2.0 Flash. Paid accounts access Gemini 2.5 Pro (the most capable model).',
      'Explore the left sidebar: "Gems" (custom AI personas), "Deep Research" (multi-source research mode), and recent conversations.',
      'If you use Google Workspace (Gmail, Docs, Sheets, Drive), look for the Gemini icon in the right-side panel of those apps — this is the Workspace-integrated experience.',
    ],
    institutionalNote:
      'Google Workspace Business Starter, Standard, and Plus plans include Gemini features in Gmail, Docs, and Sheets at no additional cost as of 2025. Google Workspace Business AI add-on ($20/user/month) enables the full Gemini Advanced experience within Workspace apps. If your institution runs Google Workspace, you may already have Gemini features available.',
  },

  tiers: [
    {
      name: 'Gemini Free',
      price: 'Free',
      accessPath: 'gemini.google.com with any Google account',
      keyCapabilities: [
        'Gemini 2.0 Flash model (fast, capable for most tasks)',
        'Gems (custom AI personas with system instructions)',
        'Google Search grounding (responses cite live web sources)',
        'Image, PDF, and document upload',
        'Limited Deep Research queries per day',
        'Google Workspace integration in Gmail and Docs (limited)',
      ],
      bankingRelevance:
        'Suitable for individual banking staff who need drafting, research, and document analysis. Free tier does not include the 1-million-token context window or the most powerful Gemini models. Sufficient for most practitioner use cases in this guide.',
    },
    {
      name: 'Gemini Advanced',
      price: '$19.99/month (Google One AI Premium plan)',
      accessPath: 'gemini.google.com → Upgrade, or via Google One subscription',
      keyCapabilities: [
        'Gemini 2.5 Pro model — Google\'s most capable model as of 2025',
        '1-million-token context window (upload a 700-page exam manual and query it)',
        'Unlimited Deep Research queries',
        'Extended Gems with more complex system instructions',
        'Google Workspace integration across Gmail, Docs, Sheets, Slides, Drive (with Google Workspace add-on)',
        'Priority access to new features',
        '2TB Google One storage included',
      ],
      bankingRelevance:
        'Justified for compliance officers, risk managers, and analysts who work with large regulatory documents, exam reports, or multi-source research tasks. The 1-million-token context window is a genuine advantage when analyzing a full FFIEC manual or a multi-year audit file in a single session.',
    },
  ],

  useCases: [
    {
      id: 'gemini-uc-1',
      title: 'Create a Gem for Recurring Compliance Research',
      scenario:
        'You regularly research BSA/AML topics and find yourself re-explaining your institution\'s context in every session. A Gem lets you create a reusable AI persona that already knows your context.',
      prompt: `Gem name: BSA Compliance Researcher

System instructions for the Gem:
You are a compliance research assistant for a community bank or credit union in the United States. Your role is to help the compliance team research BSA/AML regulatory requirements, FinCEN guidance, FFIEC exam manual references, and recent enforcement actions.

When answering questions:
- Cite specific FinCEN advisories, FFIEC BSA/AML Examination Manual sections, or Bank Secrecy Act provisions where relevant
- Distinguish between requirements (mandatory) and guidance (recommended best practice)
- Flag when a question requires consultation with legal counsel rather than providing a definitive legal opinion
- Use plain language — avoid acronym-only responses
- If the answer involves a recent regulatory change (post-2023), note that I should verify currency via FinCEN.gov or FFIEC.gov directly

My institution is a [community bank / credit union] with [asset size] in assets, supervised by [OCC / FDIC / Federal Reserve / NCUA].

---
To create this Gem: gemini.google.com → Gems (left sidebar) → New Gem → paste the above as the system instructions → save.`,
      expectedOutput:
        'A persistent Gem that opens every session already understanding your institution\'s regulatory context. When you ask "What are the current SAR filing thresholds?" it cites FinCEN requirements rather than giving a generic answer.',
    },
    {
      id: 'gemini-uc-2',
      title: 'Deep Research: Comprehensive Analysis of a Regulatory Topic',
      scenario:
        'The board has asked for a briefing on the current state of AI governance requirements for banks. You need a well-sourced, comprehensive overview in under an hour.',
      prompt: `Used in Gemini Deep Research mode. Click "Deep Research" in the Gemini sidebar or at gemini.google.com/deep-research.

Enter this research request:

"Conduct a comprehensive research review of AI governance requirements and guidance applicable to US community banks and credit unions as of 2025. Cover:

1. Existing federal regulatory frameworks that apply to AI use in banking (SR 11-7, TPRM guidance, ECOA/Reg B as applied to AI-driven credit decisions, UDAP/UDAAP)
2. The GAO-25-107197 findings on AI regulation gaps in financial services
3. The AIEOG AI Lexicon (US Treasury / FBIIC / FSSCC, February 2026) — key defined terms
4. What FFIEC examination guidance currently says about AI risk management
5. Any proposed federal legislation or pending rulemaking specifically targeting AI in banking as of 2025
6. How community banks differ from large bank AI governance requirements

Output format: executive briefing with source citations for every factual claim."`,
      expectedOutput:
        'A multi-page research report with 15–30 cited sources pulled from regulatory agency websites, GAO, academic publications, and news sources. Gemini will conduct iterative search rounds before synthesizing — this typically takes 3–8 minutes.',
    },
    {
      id: 'gemini-uc-3',
      title: 'Workspace Integration: Analyze a Google Sheet of Loan Data',
      scenario:
        'Your monthly loan portfolio report lives in Google Sheets. You want to analyze trends without writing complex formulas.',
      prompt: `Used in Gemini within Google Sheets. Open your loan portfolio sheet → click the Gemini icon in the right sidebar → enter:

"Analyze this loan portfolio data and answer the following:
1. What is the weighted average interest rate across all active loans?
2. Which loan officer has the highest 60-day delinquency rate in their portfolio this month?
3. Show me the top 5 loans by outstanding balance that are within 90 days of maturity
4. Create a summary table comparing this month's new originations by loan type to the same period last year
5. Write a 3-sentence portfolio health summary I can include in the monthly board report

Use DM Mono formatting for all dollar figures and percentages in your response."`,
      expectedOutput:
        'Gemini returns answers referencing specific cells and ranges in your sheet. Summary table is formatted for easy copy-paste into a report. Gemini may suggest creating charts — accept those suggestions for visual-ready board materials.',
      dataWarning:
        'Portfolio-level aggregated data without individual borrower NPI is appropriate for Workspace AI processing under your Google Workspace data processing agreement. Do not use this workflow with files that contain individual member Social Security numbers, account numbers, or full names without first confirming with your compliance officer.',
    },
    {
      id: 'gemini-uc-4',
      title: 'Upload an Image of a Physical Document for Text Extraction',
      scenario:
        'You have received a handwritten member complaint form, a legacy paper document, or a scanned certificate that needs to be digitized and summarized.',
      prompt: `At gemini.google.com, click the image/attachment icon and upload a photo or scan of the physical document. Then enter:

"I have uploaded an image of a [describe document type: e.g., handwritten member complaint form / paper loan application / physical certificate / legacy policy document].

Please:
1. Transcribe the text exactly as written, preserving formatting where possible
2. Flag any sections that were illegible or unclear
3. Summarize the key information in a structured format:
   - Document type
   - Date (if present)
   - Key parties or account references (use [REDACTED] if you detect sensitive identifiers)
   - Main request, complaint, or content
   - Any action items or deadlines mentioned
4. If this is a complaint or request, suggest a response category (acknowledgment needed / escalation required / routine inquiry)"`,
      expectedOutput:
        'A full transcription with illegible sections flagged. A structured summary card with the five labeled fields. Sensitive identifiers handled with redaction flags. A suggested response category.',
      dataWarning:
        'Before uploading physical documents containing NPI (Social Security numbers, account numbers, member names), confirm with your compliance officer whether your Google Workspace data processing agreement covers document image processing. For documents with visible NPI, redact sensitive fields before uploading or use this workflow only with your institution\'s Google Workspace account, not a personal account.',
    },
    {
      id: 'gemini-uc-5',
      title: 'Draft a Strategic Memo Using Google Docs Integration',
      scenario:
        'You need to prepare a strategic memo on your institution\'s AI readiness for the executive team. Gemini in Google Docs can draft from an outline while matching your institution\'s document style.',
      prompt: `Open Google Docs → create a new document → click the Gemini icon in the right sidebar (or use @Gemini in the document) → enter:

"Draft a 2-page strategic memo for the executive team of a community bank on the following topic: Our AI readiness assessment results and recommended 90-day action plan.

Structure the memo as follows:
- Header: To / From / Date / Re: [standard memo format]
- Executive Summary (3–4 sentences): overall readiness assessment and top recommendation
- Current State (one paragraph): where we stand relative to peer institutions and regulatory expectations
- Three Priority Actions for the next 90 days: each with a brief rationale, responsible owner, and success metric
- Resource Implications: one paragraph on budget and staff time estimates (use placeholder ranges)
- Recommended Board Motion: one sentence proposing the board approve the 90-day plan

Writing style: direct, professional, no filler phrases. Write for an executive audience that values brevity and specificity over comprehensiveness. Do not use AI jargon — use plain operational language."`,
      expectedOutput:
        'A fully formatted 2-page memo with standard memo header, five labeled sections, and a clean professional tone. The board motion is specific enough to include in board materials with minor editing.',
    },
  ],

  customInstructions: {
    title: 'Setting Up Gems for Banking Workflows',
    navigationPath: 'gemini.google.com → Gems (left sidebar) → New Gem',
    bankingTemplate: `You are a professional AI assistant for a community bank / credit union. My role is [your role, e.g., Senior Loan Officer / VP Operations / Compliance Manager].

My institution serves [asset size, e.g., $650 million in assets] in [state or region] and is supervised by [OCC / FDIC / Federal Reserve / NCUA].

Communication standards:
- Always write in professional, plain-language prose appropriate for a federally regulated financial institution
- Use regulatory terminology correctly (cite specific regulation names when relevant)
- Do not make definitive legal conclusions — flag when legal counsel review is appropriate
- Format numbers with commas and dollar signs; use consistent date formats (Month DD, YYYY)

Data handling:
- Remind me to use placeholder values if I appear to include member names, account numbers, or Social Security numbers in a prompt
- When analyzing financial data, distinguish between portfolio-level aggregates (generally safe) and individual member data (requires compliance clearance)

Default output format:
- Executive communication: memo or email format with clear subject/re line
- Analysis: numbered findings with one-sentence summaries
- Regulatory research: cited sources, distinguish requirements from guidance`,
    notes:
      'Each Gem retains its system instructions across all sessions. You can create multiple Gems for different job functions — one for compliance research, one for member communications, one for board reporting. Gems are private to your Google account unless you explicitly share them.',
  },

  dataSafety: {
    summary:
      'Google handles data differently depending on whether you are signed in with a personal account or a Google Workspace account. For institutional use, a Google Workspace account is required to activate the protections that make Gemini appropriate for professional banking work.',
    keyProtections: [
      'Google Workspace accounts: prompts and responses are not used to train Google AI models by default (Workspace data processing agreement applies).',
      'Gemini Activity can be turned off at myactivity.google.com — when off, conversations are not saved to your account and not reviewed by human evaluators.',
      'Google Workspace data processing terms require Google to process data only per your institution\'s instructions, consistent with GDPR and similar frameworks.',
      'Enterprise Google Workspace plans (Business Plus, Enterprise) include Customer Managed Encryption Keys (CMEK) and data access logging — consult your IT team.',
      'Gemini does not use Workspace data (emails, docs, Drive files) to train its models.',
    ],
    whatThisMeansForBanks:
      'For banking professionals, the key distinction is: personal Google account = consumer-grade protections (do not use for work); Google Workspace work account = commercial-grade protections with no model training on your data. Always use your institution\'s Google Workspace account for any Gemini work involving internal documents, operational data, or member-adjacent information. Confirm with your compliance officer whether your institution\'s Google Workspace agreement explicitly covers AI assistant use — some older agreements predate Gemini and may need amendment.',
    dataClassificationRule:
      'Rule of thumb: aggregated operational data (portfolio totals, efficiency ratios, headcount) — appropriate with your Workspace account. Individual member NPI (names + account numbers + SSNs together) — check with compliance before using in any AI tool, including Gemini.',
  },

  proTips: [
    {
      id: 'gemini-tip-1',
      tip: 'The 1-million-token context window is a genuine research advantage for compliance work',
      detail:
        'Gemini Advanced\'s 1-million-token context window means you can upload the entire FFIEC BSA/AML Examination Manual (700+ pages), a multi-year audit report, or a portfolio of regulatory guidance documents and query across all of them in a single session. This capability does not exist at this scale on any other consumer AI platform as of 2025. For compliance officers preparing for examinations, this alone justifies the Advanced subscription.',
    },
    {
      id: 'gemini-tip-2',
      tip: 'Use Deep Research for regulatory topics, not standard Gemini chat',
      detail:
        'Standard Gemini chat draws on training data with a knowledge cutoff. Deep Research mode actively queries the web, synthesizes multiple sources, and cites them explicitly — which is what you need for regulatory research where currency matters. FinCEN guidance, interagency statements, and enforcement actions change frequently. Any regulatory research for operational decisions should go through Deep Research, not standard chat.',
    },
    {
      id: 'gemini-tip-3',
      tip: 'Create role-specific Gems instead of re-explaining your context every session',
      detail:
        'Banking professionals who use Gemini most effectively maintain two to four Gems: one for compliance research, one for member communications, one for board reporting, and one for loan analysis. Each Gem opens with your institutional context already loaded. This eliminates the 100–200 word context-setting preamble that most users type at the start of every session and produces more accurate output from the first message.',
    },
    {
      id: 'gemini-tip-4',
      tip: 'Turn on Google Search grounding for any prompt involving current regulations',
      detail:
        'Gemini can ground its responses in live Google Search results when answering questions about regulations, rates, or current events. In standard chat, you can request this explicitly: "Answer using current Google Search results and cite your sources." In Deep Research mode, it happens automatically. Search-grounded responses include inline citations — always verify that the cited source is the actual regulatory agency document, not a summary.',
    },
    {
      id: 'gemini-tip-5',
      tip: 'Audit your Activity settings before using Gemini for any sensitive work',
      detail:
        'Navigate to myactivity.google.com and review your Gemini Activity settings. If you are using a personal Google account (not a Workspace account), your prompts may be saved and potentially reviewed. Turn off Gemini Activity if you are on a personal account and conducting any work-adjacent research. Better practice: use your institution\'s Google Workspace account for all banking-related AI work and confirm with IT that Workspace AI Activity logging meets your institution\'s retention policies.',
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const toolGuides: readonly ToolGuide[] = [copilotGuide, geminiGuide] as const;

export const getToolGuideById = (id: string): ToolGuide | undefined =>
  toolGuides.find((g) => g.id === id);

export const getToolGuideByPlatform = (platform: PromptPlatform): ToolGuide | undefined =>
  toolGuides.find((g) => g.platform === platform);
