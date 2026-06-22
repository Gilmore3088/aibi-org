// Microsoft Copilot — AI embedded in Outlook, Teams, Word, Excel,
// PowerPoint, and SharePoint. The most institutionally-relevant option
// for community banks already on M365.

import type { ToolGuide } from './types';

export const copilotGuide: ToolGuide = {
  platformId: 'copilot',
  platformLabel: 'Microsoft Copilot',
  platform: 'copilot',
  colorVar: 'var(--ink)',
  tagline:
    'AI embedded in the tools your institution already runs — Outlook, Teams, Word, Excel.',
  url: 'https://copilot.microsoft.com',

  gettingStarted: {
    steps: [
      'Navigate to copilot.microsoft.com in any browser and sign in.',
      'If your institution uses Microsoft 365, sign in with your work email to activate commercial data protections automatically.',
      'Check whether your institution has provisioned M365 Copilot by opening Outlook, Word, or Teams and looking for the Copilot button.',
      'If you see Copilot buttons in M365 apps, your institution has the add-on license and you have access to the full integrated experience.',
      'If not, you still have access to the standalone Copilot at copilot.microsoft.com with your work credentials.',
    ],
    firstSessionNote:
      'Most community banks and credit unions on Microsoft 365 Business or Enterprise plans already have some form of Copilot access. Before purchasing anything, ask your IT administrator whether M365 Copilot is provisioned — the email template in Use Case 5 is designed exactly for this conversation.',
  },

  pricing: [
    {
      tierName: 'Free Copilot',
      cost: 'Free',
      keyLimits: [
        'Web-grounded conversational AI via Bing',
        'Image generation (limited)',
        'Basic drafting and summarization',
        'Available in Windows 11 Start menu and Edge browser sidebar',
        'Consumer-grade data handling — no commercial protection',
      ],
      bankingVerdict:
        'Suitable for staff who need occasional research and drafting help and whose institution has not provisioned M365 Copilot. Do not enter customer data, loan details, or member information on the free tier.',
    },
    {
      tierName: 'M365 Copilot in Apps',
      cost: 'Included with M365 E3 or E5 (institution pays)',
      keyLimits: [
        'Copilot in Outlook: email drafting, thread summarization, reply suggestions',
        'Copilot in Teams: meeting transcription and summary, action item extraction',
        'Copilot in Word: draft from outline, rewrite, summarize documents',
        'Copilot in Excel: formula generation, data analysis, chart creation from plain English',
        'Copilot in PowerPoint: generate slides from a Word document or outline',
        'Copilot in SharePoint: search and summarize internal documents',
      ],
      bankingVerdict:
        'The tier most relevant to day-to-day banking operations. If your institution is on M365 E3 or E5, ask IT whether Copilot is activated — it may already be available at no additional cost.',
    },
    {
      tierName: 'Microsoft 365 Copilot Add-On',
      cost: '$30/user/month (added to existing M365 subscription)',
      keyLimits: [
        'Everything in M365 Copilot in Apps',
        'Copilot Pages: collaborative AI workspace shared across your team',
        'Copilot Studio: build custom AI agents without code',
        'Business Chat (BizChat): cross-app AI that references emails, meetings, documents, and chats simultaneously',
        'Priority access to the latest model updates',
      ],
      bankingVerdict:
        'Justified for institutions where multiple staff handle high-volume document work, compliance documentation, or member correspondence. Copilot Studio is particularly relevant for custom intake forms and approval routing.',
    },
  ],

  bankingUseCases: [
    {
      number: 1,
      title: 'Draft a professional response to a member complaint',
      description:
        'A member has submitted a written complaint about a hold placed on a deposited check. You need to respond within 24 hours in a tone that is empathetic, professional, and compliant with Reg CC disclosure requirements.',
      prompt:
        'You are a community bank customer service specialist. Draft a professional written response to the following member complaint. The response must be empathetic, clear, and compliant with Regulation CC requirements.\n\nMember complaint: "I deposited a $3,200 check on Monday and your bank put a hold on it for 7 business days. I needed these funds for a time-sensitive home repair. Nobody explained why this was happening and I feel like I am being treated like a criminal."\n\nRequirements for your response:\n- Open with genuine acknowledgment of the member\'s frustration\n- Explain the Reg CC check hold policy in plain language (no jargon)\n- State the specific date funds will be available\n- Offer one concrete next step the member can take if they have an urgent need\n- Close professionally with member retention in mind\n- Length: 150–200 words',
      expectedOutput:
        'A 150–200 word letter that opens with empathy, explains the hold in plain language, references the fund availability date, offers the option to speak with a branch manager about expediting if urgent circumstances exist, and closes warmly.',
      dataWarning:
        'Replace the hold amount and dates with placeholders before drafting in Copilot. Do not enter the actual member name, account number, or specific check details.',
    },
    {
      number: 2,
      title: 'Auto-summarize a loan committee meeting',
      description:
        'Your loan committee meeting ran 90 minutes and covered six credit decisions, two policy questions, and an interest rate discussion. You need a summary with action items for the board packet.',
      steps: [
        'Record the Teams meeting with transcription enabled (Teams → More → Start transcription).',
        'After the meeting, open the meeting recap in Teams.',
        'Click the Copilot icon in the recap panel.',
        'Submit the prompt below.',
        'Review the output, verify attribution of action items, distribute to attendees.',
      ],
      prompt:
        'Summarize this meeting in the following format:\n1. Credit decisions made (borrower type, amount approved or declined, key conditions)\n2. Policy questions raised and their resolution status\n3. Interest rate discussion summary (one paragraph)\n4. Action items — each item should include the responsible party and due date if mentioned\n5. Items deferred to next meeting\n\nFormat each section with a clear heading. Flag any item where the committee did not reach consensus.',
      expectedOutput:
        'A structured summary with five labeled sections. Credit decisions listed as a table or bulleted list. Action items attributed to named participants with dates. Deferred items called out explicitly.',
      dataWarning:
        "Loan committee meetings may contain MNPI (material non-public information) and NPI (non-public personal information). Verify your institution's M365 data processing agreement covers meeting transcript retention before enabling Teams transcription.",
    },
    {
      number: 3,
      title: 'Analyze a delinquency report without writing formulas',
      description:
        'You have received the monthly delinquency report as an Excel file. You need to identify trends, flag any loan categories with deteriorating performance, and produce a summary paragraph for the CFO.',
      steps: [
        'Open the delinquency report in Excel.',
        'Click the Copilot button in the Home ribbon.',
        'Submit the prompt below.',
        "Review Copilot's analysis. Verify the math against your raw data.",
        'Copy the narrative paragraph into the CFO briefing.',
      ],
      prompt:
        'Analyze this delinquency data and give me:\n1. Which loan category has the highest 30-day delinquency rate this month?\n2. Which loan categories show month-over-month deterioration of more than 10 basis points?\n3. What is the total dollar value of loans 90+ days past due?\n4. Create a summary paragraph (3–4 sentences) I can include in a CFO briefing that describes the overall portfolio health trend without using jargon.\n5. Flag any outliers — loan categories or branch locations where delinquency is more than two standard deviations above the portfolio average.',
      expectedOutput:
        'A structured analysis with answers to each numbered question, a highlighted table showing the deteriorating categories, and a clean narrative paragraph. Outliers are flagged with specific values.',
      dataWarning:
        'Aggregated delinquency reports without individual borrower names or account numbers may be used in M365 Copilot under your commercial data agreement. Confirm with your compliance officer before working with files that include individual loan-level NPI.',
    },
    {
      number: 4,
      title: 'Draft a board presentation outline from bullet points',
      description:
        'You need to prepare the Q2 cybersecurity update for the board. You have rough notes but need a structured, boardroom-ready presentation.',
      steps: [
        'In Word or PowerPoint, open a new document and paste your rough notes.',
        'Click the Copilot icon and select "Generate" or "Visualize as slides".',
        'Submit the prompt below.',
        'Review the outline, adjust headlines, route to the CISO for technical review.',
      ],
      prompt:
        'I am preparing a board-level cybersecurity update for a community bank. Using the notes below, create a 10-slide presentation outline that:\n1. Opens with a one-slide executive summary (no more than 5 bullet points)\n2. Follows with a slide on the current threat landscape relevant to community banks (cite 2–3 specific threat categories)\n3. Covers our institution\'s Q2 incidents and near-misses (without assigning blame or creating discoverable admissions)\n4. Presents our top 3 risk reduction actions with status (complete / in progress / not started)\n5. Ends with one ask from the board — a decision or approval needed\n6. Closes with a Q&A placeholder slide\n\nEach slide should have a headline (8 words or fewer) and 3–5 supporting bullets. Write in plain language appropriate for non-technical board members.',
      expectedOutput:
        'A 10-section outline with slide headlines and supporting bullets. Executive summary is concise. Threat landscape uses recognizable categories (phishing, ransomware, third-party risk). Board ask is specific and actionable.',
    },
    {
      number: 5,
      title: 'Find out what Copilot license your institution has',
      description:
        'Before building any AI workflow on Copilot, you need to know what your institution has licensed. This is the exact email to send your IT department.',
      prompt:
        'Subject: Question about our Microsoft 365 Copilot licensing\n\nHi [IT contact name],\n\nI am looking into using Microsoft Copilot as part of a professional AI training program I am completing. Before I invest time in learning it, I want to make sure I understand what we have available.\n\nCould you answer three quick questions?\n\n1. Does our M365 subscription include the Copilot add-on ($30/user/month) for any users, and if so, am I included?\n2. If we do not have the add-on, does our E3 or E5 license include any Copilot features in Outlook, Teams, Word, or Excel?\n3. Is there an approved acceptable-use policy for Copilot that I should read before I start using it for work tasks?\n\nI want to make sure I am working within our approved tools and data handling policies.\n\nThank you,\n[Your name]',
      expectedOutput:
        'Use this prompt as a literal email template. The three questions are designed to surface the three most common licensing situations without putting IT on the defensive. Most IT departments respond within one business day.',
    },
  ],

  customInstructions: {
    available: true,
    howTo:
      'copilot.microsoft.com → Settings (gear icon, top right) → Personalization. Add the template below in the personalization field. Note: personalization settings apply to copilot.microsoft.com only. Copilot within M365 apps (Outlook, Teams, Word, Excel) does not currently read these — include role context in your in-app prompts manually until Microsoft rolls out unified personalization.',
    bankingExample:
      'I work at a community bank / credit union serving [asset size, e.g., $450 million in assets] in [state or region]. My role is [your role, e.g., VP of Compliance / Branch Manager / Loan Officer].\n\nWhen I ask for help drafting communications, always use a professional, plain-language tone appropriate for a federally regulated financial institution. Avoid jargon, hedge language, and casual phrasing.\n\nWhen I ask about regulations, cite specific regulation names (e.g., Reg B, Reg CC, BSA/AML, TPRM) and acknowledge when something requires legal review rather than stating a definitive legal conclusion.\n\nDo not include customer or member personal information in responses unless I explicitly provide it in the prompt. Remind me to use placeholders if I appear to include real NPI.\n\nDefault output format: clear headings, numbered lists for action items, bullet points for reference information, prose paragraphs for member-facing content.',
  },

  dataSafety: {
    summary:
      'Microsoft provides commercial data protection for users signed in with a work or school Microsoft 365 account. This is meaningfully different from the consumer Copilot experience and is the baseline for institutional use.',
    details: [
      'Prompts and responses are not used to train Microsoft AI models when you are signed in with a work account.',
      'Data is processed under the Microsoft Product Terms and Data Processing Addendum (GDPR-compliant, compatible with most bank privacy programs).',
      "Microsoft 365 Copilot inherits your institution's existing M365 data residency settings — data stays in the same geographic region as your M365 tenant.",
      'Copilot cannot access data from SharePoint, Teams, or Exchange beyond what the signed-in user is already authorized to access — it respects existing permissions.',
      'Microsoft does not sell your prompts or data to advertisers.',
      'Rule of thumb: if you would send it in an internal email to a colleague, it is likely safe in M365 Copilot under commercial protection. Documents classified as Confidential or Restricted (loan files, exam reports, member statements) require compliance review before Copilot use.',
    ],
    bankingVerdict:
      "Commercial data protection makes Copilot appropriate for internal bank documents, policy drafts, meeting notes, and aggregated operational data. It is NOT automatically approved for individual member NPI (SSNs, account numbers, loan details). For institutions with a signed Microsoft DPA covering M365, Copilot falls under the same governance framework as the rest of your M365 environment.",
  },

  proTips: [
    {
      number: 1,
      tip: 'Your IT department probably already has this — ask before you pay. A significant number of community banks on M365 E3/E5 have Copilot available and have not communicated it to staff. The email in Use Case 5 is designed to surface this.',
    },
    {
      number: 2,
      tip: 'Copilot in Teams is the fastest ROI for most banking staff. A 90-minute loan committee or ALCO meeting produces a usable summary in under 30 seconds.',
    },
    {
      number: 3,
      tip: 'Use natural language column references in Excel — do not guess formulas. "Show me all loans where the current balance is more than 10% above the original approved amount" works better than asking for a VLOOKUP. Especially good for delinquency reports and call report prep.',
    },
    {
      number: 4,
      tip: 'Include your regulatory context in every prompt. Copilot does not know you work at a federally regulated financial institution unless you tell it. A prompt that starts with "As a community bank compliance officer preparing for our next OCC exam..." produces materially more relevant output.',
    },
    {
      number: 5,
      tip: 'Copilot Studio is worth exploring for repetitive intake processes. If your institution has the M365 Copilot add-on, plan agent-shaped workflows for vendor questionnaire intake, member complaint triage routing, or BSA case narrative drafting. Engage IT early because Copilot Studio requires Azure permissions that may need admin approval.',
    },
  ],
};
