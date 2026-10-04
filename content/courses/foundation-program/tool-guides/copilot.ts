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
  pricingUrl: 'https://www.microsoft.com/en-us/copilot/pricing/enterprise',
  verifiedOn: '2026-10-04',
  reviewBy: '2027-01-04',

  gettingStarted: {
    steps: [
      'Sign in to the Microsoft 365 Copilot app (m365.cloud.microsoft) or Copilot in Outlook with your work account.',
      'Look for the shield or "Protected" label. It means enterprise data protection applies to the chat.',
      'Open Word, Excel, or Teams and look for the Copilot button inside the document or meeting.',
      'If Copilot works inside Word, Excel, and Teams, your institution has bought the Microsoft 365 Copilot license for you.',
      'If you only see Copilot Chat, you have the version included with eligible Microsoft 365 plans. It still works for drafting and summarizing.',
    ],
    firstSessionNote:
      'If your institution runs Microsoft 365, you likely already have Copilot Chat at no extra cost. Copilot inside Word, Excel, PowerPoint, and Teams needs the paid license. Ask IT before buying anything; the email in Use Case 5 is written for that conversation.',
  },

  pricing: [
    {
      tierName: 'Consumer Copilot',
      cost: 'Free with a personal Microsoft account',
      keyLimits: [
        'Web-grounded chat in the Copilot app, Windows, and Edge',
        'Consumer data handling — no enterprise data protection',
      ],
      bankingVerdict:
        'Do not use it for work. Sign in with your work account instead.',
    },
    {
      tierName: 'Microsoft 365 Copilot Chat',
      cost: 'Included with eligible Microsoft 365 plans',
      keyLimits: [
        'Web-grounded chat with enterprise data protection',
        'Works with files you upload or reference',
        'Copilot in Outlook (standard access)',
        'Agents can be built; agent use is metered',
      ],
      bankingVerdict:
        'Where most bank staff should start. It is probably already in your tenant; ask IT whether it is turned on.',
    },
    {
      tierName: 'Microsoft 365 Copilot',
      cost: '$30/user/month, paid yearly (enterprise list price)',
      keyLimits: [
        'Copilot in Word, Excel, PowerPoint, OneNote, and Teams',
        'Grounded in your mail, meetings, chats, and files (Work IQ)',
        'Researcher and Analyst agents; Copilot Studio agent use included',
      ],
      bankingVerdict:
        'Worth it for staff with heavy meeting, document, and spreadsheet work. Business-plan pricing differs; check the pricing page.',
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
        'Subject: Question about our Microsoft 365 Copilot licensing\n\nHi [IT contact name],\n\nI am looking into using Microsoft Copilot as part of a professional AI training program I am completing. Before I invest time in learning it, I want to make sure I understand what we have available.\n\nCould you answer three quick questions?\n\n1. Do we have Microsoft 365 Copilot Chat turned on, and should I sign in with my work account to use it?\n2. Have we bought Microsoft 365 Copilot licenses (Copilot inside Word, Excel, and Teams) for anyone, and am I included?\n3. Is there an approved acceptable-use policy for Copilot that I should read before I start using it for work tasks?\n\nI want to make sure I am working within our approved tools and data handling policies.\n\nThank you,\n[Your name]',
      expectedOutput:
        'Use this prompt as a literal email template. The three questions are designed to surface the three most common licensing situations without putting IT on the defensive. Most IT departments respond within one business day.',
    },
  ],

  customInstructions: {
    available: true,
    howTo:
      'In the Microsoft 365 Copilot app, open Settings → Personalization and add the template below, if your admin has turned personalization on. If you do not see it, paste the template at the start of each chat.',
    bankingExample:
      'I work at a community bank / credit union serving [asset size, e.g., $450 million in assets] in [state or region]. My role is [your role, e.g., VP of Compliance / Branch Manager / Loan Officer].\n\nWhen I ask for help drafting communications, always use a professional, plain-language tone appropriate for a federally regulated financial institution. Avoid jargon, hedge language, and casual phrasing.\n\nWhen I ask about regulations, cite specific regulation names (e.g., Reg B, Reg CC, BSA/AML, TPRM) and acknowledge when something requires legal review rather than stating a definitive legal conclusion.\n\nDo not include customer or member personal information in responses unless I explicitly provide it in the prompt. Remind me to use placeholders if I appear to include real NPI.\n\nDefault output format: clear headings, numbered lists for action items, bullet points for reference information, prose paragraphs for member-facing content.',
  },

  dataSafety: {
    summary:
      'Microsoft applies enterprise data protection when you sign in with a work Microsoft 365 account. That is meaningfully different from consumer Copilot and is the baseline for institutional use.',
    details: [
      'Prompts and responses are not used to train Microsoft AI models when you are signed in with a work account.',
      'Data is processed under the Microsoft Product Terms and Data Processing Addendum (GDPR-compliant, compatible with most bank privacy programs).',
      "Microsoft 365 Copilot inherits your institution's existing M365 data residency settings — data stays in the same geographic region as your M365 tenant.",
      'Copilot cannot access data from SharePoint, Teams, or Exchange beyond what the signed-in user is already authorized to access — it respects existing permissions.',
      'Microsoft does not sell your prompts or data to advertisers.',
      'Rule of thumb: if you would send it in an internal email to a colleague, it is likely safe in M365 Copilot under commercial protection. Documents classified as Confidential or Restricted (loan files, exam reports, member statements) require compliance review before Copilot use.',
    ],
    bankingVerdict:
      "Enterprise data protection makes Copilot appropriate for internal bank documents, policy drafts, meeting notes, and aggregated operational data. It is NOT automatically approved for individual member NPI (SSNs, account numbers, loan details). For institutions with a signed Microsoft DPA covering M365, Copilot falls under the same governance framework as the rest of your M365 environment.",
  },

  proTips: [
    {
      number: 1,
      tip: 'Your IT department probably already has Copilot Chat — ask before you pay. Many institutions have it turned on without telling staff. The email in Use Case 5 is designed to surface this.',
    },
    {
      number: 2,
      tip: 'If you have the full license, Copilot in Teams is the fastest payoff for most banking staff. A long loan committee or ALCO meeting becomes a usable summary in moments.',
    },
    {
      number: 3,
      tip: 'Use natural language column references in Excel — do not guess formulas. "Show me all loans where the current balance is more than $50,000 above the original approved amount" works better than asking for a VLOOKUP. Especially good for delinquency reports and call report prep.',
    },
    {
      number: 4,
      tip: 'Include your regulatory context in every prompt. Copilot does not know you work at a federally regulated financial institution unless you tell it. A prompt that starts with "As a community bank compliance officer preparing for our next OCC exam..." produces materially more relevant output.',
    },
    {
      number: 5,
      tip: 'Copilot Studio is worth exploring for repetitive intake processes. If your institution has Microsoft 365 Copilot licenses, plan agent-shaped workflows for vendor questionnaire intake, member complaint triage routing, or BSA case narrative drafting. Engage IT early: agent use can be metered and needs admin approval.',
    },
  ],
};
