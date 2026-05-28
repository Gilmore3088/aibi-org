// Google Gemini — Workspace-native AI with a 1-million-token context
// window. Best fit for institutions running Google Workspace and for
// large-document regulatory research (FFIEC manuals, multi-year audits).

import type { ToolGuide } from './types';

export const geminiGuide: ToolGuide = {
  platformId: 'gemini',
  platformLabel: 'Google Gemini',
  platform: 'gemini',
  colorVar: 'var(--gold)',
  tagline:
    'Google Workspace-native AI with a 1-million-token context window — built for whole-manual regulatory research.',
  url: 'https://gemini.google.com',

  gettingStarted: {
    steps: [
      'Navigate to gemini.google.com and sign in with your Google account.',
      'If your institution uses Google Workspace, sign in with your work Google account — this activates Workspace data protections.',
      'On first visit, Gemini will ask which model to use. Free defaults to Gemini 2.0 Flash; paid plans access Gemini 2.5 Pro.',
      'Explore the left sidebar: "Gems" (custom AI personas), "Deep Research" (multi-source research mode), recent conversations.',
      'If you use Workspace (Gmail, Docs, Sheets, Drive), look for the Gemini icon in the right-side panel of those apps.',
    ],
    firstSessionNote:
      'Google Workspace Business Starter, Standard, and Plus plans include Gemini features in Gmail, Docs, and Sheets at no additional cost as of 2025. The Workspace Business AI add-on ($20/user/month) enables the full Gemini Advanced experience within Workspace apps. If your institution runs Google Workspace, you may already have Gemini features available — ask IT before paying.',
  },

  pricing: [
    {
      tierName: 'Gemini Free',
      cost: 'Free',
      keyLimits: [
        'Gemini 2.0 Flash model (fast, capable for most tasks)',
        'Gems (custom AI personas with system instructions)',
        'Google Search grounding (responses cite live web sources)',
        'Image, PDF, and document upload',
        'Limited Deep Research queries per day',
        'Google Workspace integration in Gmail and Docs (limited)',
      ],
      bankingVerdict:
        'Suitable for individual banking staff who need drafting, research, and document analysis. Free does not include the 1-million-token context window or the most powerful Gemini models. Sufficient for most practitioner use cases in this guide.',
    },
    {
      tierName: 'Gemini Advanced',
      cost: '$19.99/month (Google One AI Premium plan)',
      keyLimits: [
        "Gemini 2.5 Pro — Google's most capable model as of 2025",
        '1-million-token context window (upload a 700-page exam manual and query it)',
        'Unlimited Deep Research queries',
        'Extended Gems with more complex system instructions',
        'Google Workspace integration across Gmail, Docs, Sheets, Slides, Drive (with Workspace add-on)',
        'Priority access to new features',
        '2TB Google One storage included',
      ],
      bankingVerdict:
        'Justified for compliance officers, risk managers, and analysts working with large regulatory documents, exam reports, or multi-source research. The 1-million-token context is a genuine advantage when analyzing a full FFIEC manual or multi-year audit file in a single session.',
    },
  ],

  bankingUseCases: [
    {
      number: 1,
      title: 'Create a Gem for recurring compliance research',
      description:
        "You regularly research BSA/AML topics and find yourself re-explaining your institution's context in every session. A Gem lets you create a reusable AI persona that already knows your context.",
      steps: [
        'gemini.google.com → Gems (left sidebar) → New Gem.',
        'Name the Gem (e.g., "BSA Compliance Researcher").',
        'Paste the system instructions from the prompt below.',
        'Save. The Gem is now available in the left sidebar.',
        'Start any compliance research session from that Gem instead of a fresh chat.',
      ],
      prompt:
        'GEM NAME: BSA Compliance Researcher\n\nSYSTEM INSTRUCTIONS:\nYou are a compliance research assistant for a community bank or credit union in the United States. Your role is to help the compliance team research BSA/AML regulatory requirements, FinCEN guidance, FFIEC exam manual references, and recent enforcement actions.\n\nWhen answering questions:\n- Cite specific FinCEN advisories, FFIEC BSA/AML Examination Manual sections, or Bank Secrecy Act provisions where relevant\n- Distinguish between requirements (mandatory) and guidance (recommended best practice)\n- Flag when a question requires consultation with legal counsel rather than providing a definitive legal opinion\n- Use plain language — avoid acronym-only responses\n- If the answer involves a recent regulatory change (post-2023), note that I should verify currency via FinCEN.gov or FFIEC.gov directly\n\nMy institution is a [community bank / credit union] with [asset size] in assets, supervised by [OCC / FDIC / Federal Reserve / NCUA].',
      expectedOutput:
        "A persistent Gem that opens every session already understanding your institution's regulatory context. When you ask \"What are the current SAR filing thresholds?\" it cites FinCEN requirements rather than giving a generic answer.",
    },
    {
      number: 2,
      title: 'Deep Research: comprehensive analysis of a regulatory topic',
      description:
        'The board has asked for a briefing on the current state of AI governance requirements for banks. You need a well-sourced, comprehensive overview in under an hour.',
      steps: [
        'Click "Deep Research" in the Gemini sidebar or navigate to gemini.google.com/deep-research.',
        'Submit the prompt below.',
        'Gemini conducts iterative search rounds before synthesizing — typically 3–8 minutes.',
        'Review the report and open every cited source before circulating.',
        'Save the conversation; rerun quarterly to catch new guidance as it issues.',
      ],
      prompt:
        'Conduct a comprehensive research review of AI governance requirements and guidance applicable to US community banks and credit unions as of 2025. Cover:\n\n1. Existing federal regulatory frameworks that apply to AI use in banking (SR 11-7, TPRM guidance, ECOA/Reg B as applied to AI-driven credit decisions, UDAP/UDAAP)\n2. The GAO-25-107197 findings on AI regulation gaps in financial services\n3. The AIEOG AI Lexicon (US Treasury / FBIIC / FSSCC, February 2026) — key defined terms\n4. What FFIEC examination guidance currently says about AI risk management\n5. Any proposed federal legislation or pending rulemaking specifically targeting AI in banking as of 2025\n6. How community banks differ from large bank AI governance requirements\n\nOutput format: executive briefing with source citations for every factual claim.',
      expectedOutput:
        'A multi-page research report with 15–30 cited sources pulled from regulatory agency websites, GAO, academic publications, and news sources. Each factual claim links to a verifiable source.',
    },
    {
      number: 3,
      title: 'Workspace integration: analyze a Google Sheet of loan data',
      description:
        'Your monthly loan portfolio report lives in Google Sheets. You want to analyze trends without writing complex formulas.',
      steps: [
        'Open your loan portfolio sheet in Google Sheets.',
        'Click the Gemini icon in the right sidebar.',
        'Submit the prompt below.',
        'Gemini answers with cell-level references; accept any suggested chart inserts for board-ready visuals.',
        'Copy the summary table and narrative into your monthly report.',
      ],
      prompt:
        "Analyze this loan portfolio data and answer the following:\n1. What is the weighted average interest rate across all active loans?\n2. Which loan officer has the highest 60-day delinquency rate in their portfolio this month?\n3. Show me the top 5 loans by outstanding balance that are within 90 days of maturity\n4. Create a summary table comparing this month's new originations by loan type to the same period last year\n5. Write a 3-sentence portfolio health summary I can include in the monthly board report\n\nUse tabular formatting for all dollar figures and percentages in your response.",
      expectedOutput:
        'Answers referencing specific cells and ranges in your sheet. Summary table formatted for easy copy-paste into a report. Suggested chart inserts for visual-ready board materials.',
      dataWarning:
        "Portfolio-level aggregated data without individual borrower NPI is appropriate for Workspace AI processing under your Google Workspace data processing agreement. Do not use this workflow with files that contain individual member SSNs, account numbers, or full names without first confirming with your compliance officer.",
    },
    {
      number: 4,
      title: 'Upload an image of a physical document for text extraction',
      description:
        'You have received a handwritten member complaint form, a legacy paper document, or a scanned certificate that needs to be digitized and summarized.',
      steps: [
        'At gemini.google.com, click the image/attachment icon and upload a photo or scan.',
        'Submit the prompt below.',
        'Review the transcription against the source image.',
        'Use the structured summary card to route the document into your existing workflow.',
      ],
      prompt:
        'I have uploaded an image of a [describe document type: e.g., handwritten member complaint form / paper loan application / physical certificate / legacy policy document].\n\nPlease:\n1. Transcribe the text exactly as written, preserving formatting where possible\n2. Flag any sections that were illegible or unclear\n3. Summarize the key information in a structured format:\n   - Document type\n   - Date (if present)\n   - Key parties or account references (use [REDACTED] if you detect sensitive identifiers)\n   - Main request, complaint, or content\n   - Any action items or deadlines mentioned\n4. If this is a complaint or request, suggest a response category (acknowledgment needed / escalation required / routine inquiry)',
      expectedOutput:
        'A full transcription with illegible sections flagged. A structured summary card with the five labeled fields. Sensitive identifiers handled with redaction flags. A suggested response category.',
      dataWarning:
        "Before uploading physical documents containing NPI (SSNs, account numbers, member names), confirm with your compliance officer whether your Google Workspace data processing agreement covers document image processing. For documents with visible NPI, redact sensitive fields before uploading — or use this workflow only with your institution's Workspace account, never a personal account.",
    },
    {
      number: 5,
      title: 'Draft a strategic memo using Google Docs integration',
      description:
        "You need to prepare a strategic memo on your institution's AI readiness for the executive team. Gemini in Google Docs can draft from an outline while matching your institution's document style.",
      steps: [
        'Open Google Docs and create a new document.',
        'Click the Gemini icon in the right sidebar (or type @Gemini in the document).',
        'Submit the prompt below.',
        'Review the draft, refine the resource implications section against your real budget, route to the executive team.',
      ],
      prompt:
        'Draft a 2-page strategic memo for the executive team of a community bank on the following topic: Our AI readiness assessment results and recommended 90-day action plan.\n\nStructure the memo as follows:\n- Header: To / From / Date / Re: [standard memo format]\n- Executive Summary (3–4 sentences): overall readiness assessment and top recommendation\n- Current State (one paragraph): where we stand relative to peer institutions and regulatory expectations\n- Three Priority Actions for the next 90 days: each with a brief rationale, responsible owner, and success metric\n- Resource Implications: one paragraph on budget and staff time estimates (use placeholder ranges)\n- Recommended Board Motion: one sentence proposing the board approve the 90-day plan\n\nWriting style: direct, professional, no filler phrases. Write for an executive audience that values brevity and specificity over comprehensiveness. Do not use AI jargon — use plain operational language.',
      expectedOutput:
        'A fully formatted 2-page memo with standard memo header, five labeled sections, and a clean professional tone. The board motion is specific enough to include in board materials with minor editing.',
    },
  ],

  customInstructions: {
    available: true,
    howTo:
      'gemini.google.com → Gems (left sidebar) → New Gem. Paste the template below as the system instructions and save. Each Gem retains its system instructions across all sessions. Create multiple Gems for different job functions — one for compliance research, one for member communications, one for board reporting. Gems are private to your Google account unless you explicitly share them.',
    bankingExample:
      'You are a professional AI assistant for a community bank / credit union. My role is [your role, e.g., Senior Loan Officer / VP Operations / Compliance Manager].\n\nMy institution serves [asset size, e.g., $650 million in assets] in [state or region] and is supervised by [OCC / FDIC / Federal Reserve / NCUA].\n\nCommunication standards:\n- Always write in professional, plain-language prose appropriate for a federally regulated financial institution\n- Use regulatory terminology correctly (cite specific regulation names when relevant)\n- Do not make definitive legal conclusions — flag when legal counsel review is appropriate\n- Format numbers with commas and dollar signs; use consistent date formats (Month DD, YYYY)\n\nData handling:\n- Remind me to use placeholder values if I appear to include member names, account numbers, or Social Security numbers in a prompt\n- When analyzing financial data, distinguish between portfolio-level aggregates (generally safe) and individual member data (requires compliance clearance)\n\nDefault output format:\n- Executive communication: memo or email format with clear subject/re line\n- Analysis: numbered findings with one-sentence summaries\n- Regulatory research: cited sources, distinguish requirements from guidance',
  },

  dataSafety: {
    summary:
      'Google handles data differently depending on whether you sign in with a personal account or a Workspace account. For institutional use, a Google Workspace account is required to activate the protections that make Gemini appropriate for professional banking work.',
    details: [
      'Google Workspace accounts: prompts and responses are not used to train Google AI models by default (Workspace data processing agreement applies).',
      'Gemini Activity can be turned off at myactivity.google.com — when off, conversations are not saved to your account and not reviewed by human evaluators.',
      "Google Workspace data processing terms require Google to process data only per your institution's instructions, consistent with GDPR and similar frameworks.",
      'Enterprise Workspace plans (Business Plus, Enterprise) include Customer Managed Encryption Keys (CMEK) and data access logging — consult your IT team.',
      'Gemini does not use Workspace data (emails, docs, Drive files) to train its models.',
      'Personal Google account = consumer-grade protections (do not use for work). Workspace work account = commercial-grade protections with no model training.',
      "Rule of thumb: aggregated operational data (portfolio totals, efficiency ratios, headcount) — appropriate with your Workspace account. Individual member NPI (names + account numbers + SSNs together) — check with compliance before using in any AI tool, including Gemini.",
    ],
    bankingVerdict:
      "Always use your institution's Google Workspace account for any Gemini work involving internal documents, operational data, or member-adjacent information. Confirm with your compliance officer whether your institution's Workspace agreement explicitly covers AI assistant use — some older agreements predate Gemini and may need amendment.",
  },

  proTips: [
    {
      number: 1,
      tip: "The 1-million-token context window is a genuine research advantage. Gemini Advanced can hold the entire FFIEC BSA/AML Examination Manual (700+ pages), a multi-year audit report, or a portfolio of regulatory guidance documents and query across all of them in a single session. For compliance officers preparing for examinations, this alone justifies the Advanced subscription.",
    },
    {
      number: 2,
      tip: 'Use Deep Research for regulatory topics, not standard Gemini chat. Standard chat draws on training data with a knowledge cutoff; Deep Research actively queries the web and cites sources. FinCEN guidance, interagency statements, and enforcement actions change frequently — regulatory research for operational decisions should always go through Deep Research.',
    },
    {
      number: 3,
      tip: 'Create role-specific Gems instead of re-explaining your context every session. The most effective Gemini users maintain 2–4 Gems (compliance research, member communications, board reporting, loan analysis). Each opens with institutional context already loaded — eliminates the 100–200 word preamble most users type at the start of every session.',
    },
    {
      number: 4,
      tip: 'Turn on Google Search grounding for prompts involving current regulations. In standard chat: "Answer using current Google Search results and cite your sources." In Deep Research mode this happens automatically. Always verify that the cited source is the actual regulatory agency document, not a summary.',
    },
    {
      number: 5,
      tip: 'Audit your Activity settings before using Gemini for sensitive work. Navigate to myactivity.google.com and review your Gemini Activity settings. Better practice: use your Workspace account for all banking work and confirm with IT that Workspace AI Activity logging meets your retention policies.',
    },
  ],
};
