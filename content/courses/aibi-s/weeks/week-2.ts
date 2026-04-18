// AiBI-S Week 2: Platform Mastery for Your Department
// Phase: Foundation | Estimated: 90 min live + 90-120 min assignment
// Key Output: Departmental AI workspace configured with all six context blocks

import type { CohortWeek } from '../types';

export const week2: CohortWeek = {
  number: 2,
  phase: 'foundation',
  title: 'Platform Mastery for Your Department',
  estimatedLiveMinutes: 90,
  estimatedAssignmentMinutes: 105,
  keyOutput:
    'Departmental AI workspace configured and documented with a one-page setup guide a colleague can follow',
  whyThisWeekExists: `AiBI-P introduced six platforms at a survey level. Every learner activated at least one. In AiBI-S, platform training goes deep and role-specific. An operations manager learning Power Automate and a compliance officer learning Perplexity for regulatory research are doing fundamentally different work — the live session splits into role-track breakout groups for the platform deep dive.

The other purpose of this week is scale. In AiBI-P, learners set up personal Custom Instructions or Projects. In AiBI-S, the same concept scales to the department. A departmental workspace pre-loads institutional context so that any authorized team member gets output calibrated to the institution, not just to the person who configured it.`,

  keyTakeaways: [
    'Configure a departmental AI workspace with all six required context blocks',
    'Write a one-page setup guide a colleague can follow without assistance',
    'Apply the naming convention [Institution]-[Department]-[Function] to shared workspaces',
  ],

  learningGoals: [
    'Configure a departmental AI workspace with all six required context blocks',
    'Achieve deep proficiency in the platforms most relevant to their role track',
    'Understand the difference between personal platform configuration (AiBI-P) and departmental workspace setup (AiBI-S)',
    'Produce a one-page setup guide that enables a colleague with AiBI-P-level proficiency to access and use the workspace',
  ],

  sections: [
    {
      id: 'w2-workspace-concept',
      title: 'The Departmental Workspace Concept',
      content: `In AiBI-P, you set up Custom Instructions in ChatGPT or a Project in Claude. The context was personal: your role, your institution, your preferences. That configuration made the AI useful for you.

In AiBI-S, the concept scales to the department. A departmental workspace is an AI environment pre-loaded with institutional context so that any team member who uses it gets output calibrated to the institution — not just to the person who built it.

The difference is not just scope. It is ownership, maintenance, and access. Your personal setup lives in your account. The departmental workspace is a shared asset. It has documentation. It has a designated owner who keeps it current. It is accessible to any authorized team member, not just to you.

The naming convention reflects this shift: **[Institution]-[Department]-[Function]**. A compliance workspace at First Community Credit Union might be called "FCCU-Compliance-RegResearch." That name tells anyone who encounters it exactly what it is, who owns it, and what it does.`,
    },
    {
      id: 'w2-six-context-blocks',
      title: 'The Six Context Blocks Every Departmental Workspace Needs',
      content: `A departmental workspace is only as useful as the context it contains. Six blocks ensure output is accurate for your institution, appropriate for your department, and compliant with your data handling requirements.

**Block 1 — Institution context:** Institution name, charter type (state-chartered bank, federally chartered credit union, etc.), asset size (this affects regulatory thresholds and peer benchmarks), primary regulators, and number of staff in the department. This block ensures the AI understands the scale and regulatory environment of your institution.

**Block 2 — Department context:** Department mission in one sentence, key processes the department owns, reporting relationships, and the current technology stack. This block orients the AI to what your department actually does, so outputs are calibrated to your workflows rather than generic banking processes.

**Block 3 — Regulatory context:** The applicable regulatory frameworks for this department's work. Operations focuses on BSA/AML and operational risk. Lending focuses on ECOA/Reg B and SR 11-7. Compliance touches all five frameworks. Finance focuses on financial reporting standards. Retail focuses on consumer protection regulations. This block draws on AiBI-P Module 1 knowledge.

**Block 4 — Data handling rules:** Explicit statement of what data tiers this workspace handles, what data must never be entered, and what redaction is required before using AI on specific inputs. This block is the compliance guardrail built into the workspace itself — for every team member who uses it, not just the person who configured it.

**Block 5 — Output standards:** Default output format, tone, and quality expectations for this department. Finance output should be board-ready: precise, conservative, sourced. Retail output should be warm and member-focused. Operations output should be action-oriented: clear owners, clear deadlines. This block means every skill avoids re-specifying format and tone from scratch.

**Block 6 — Skill references:** Pointers to any existing skills the department uses or is building. Even before the skill library exists (it is built in Week 5), this block documents what exists and where it is stored. Over time it becomes the workspace index of available skills.`,
    },
    {
      id: 'w2-maintenance',
      title: 'Ownership and Maintenance: Why Workspaces Degrade Without a Plan',
      content: `A personal setup degrades gracefully — if it gets outdated, only you notice. The departmental workspace has colleagues depending on it. When the institution credit policy changes, the context needs to update. When a new platform feature ships, the output standards may need revision. When the regulatory environment shifts, Block 3 needs current guidance.

The workspace owner is responsible for this maintenance. In most cases, the AiBI-S graduate becomes that owner initially. Part of the Week 5 and Week 6 work is transferring this responsibility into the institutional skill library framework — establishing the quarterly review cadence and naming backup owners for every asset the department depends on.

**A workspace without a maintenance plan is a liability, not an asset.** The one-page setup guide you write in Activity 2.1 should include a "maintenance notes" section that tells the next owner what needs periodic review.`,
    },
  ],

  tables: [
    {
      id: 'w2-personal-vs-dept',
      caption: 'Personal Setup (AiBI-P) vs. Departmental Setup (AiBI-S)',
      columns: [
        { header: 'Component', key: 'component' },
        { header: 'Personal Setup (AiBI-P)', key: 'personal' },
        { header: 'Departmental Setup (AiBI-S)', key: 'departmental' },
      ],
      rows: [
        {
          component: 'Context',
          personal: 'Your role, your institution, your preferences',
          departmental: 'Department mission, team processes, institutional standards, regulatory context',
        },
        {
          component: 'Skills',
          personal: 'Your personal skill files',
          departmental: 'Shared skill files accessible to any authorized team member',
        },
        {
          component: 'Data classification',
          personal: 'Your personal awareness of the tiers',
          departmental: 'Explicit data handling rules embedded in workspace instructions',
        },
        {
          component: 'Naming',
          personal: 'Whatever you called it',
          departmental: 'Standard convention: [Institution]-[Department]-[Function]',
        },
        {
          component: 'Access',
          personal: 'You only',
          departmental: 'Any authorized team member can use it or copy it',
        },
        {
          component: 'Maintenance',
          personal: 'You update it when you feel like it',
          departmental: 'Named owner reviews quarterly or on material change',
        },
      ],
    },
  ],

  activities: [
    {
      id: '2.1',
      title: 'Set Up a Departmental AI Workspace',
      description: `Set up a departmental AI workspace using the platform most relevant to your role track. Configure all six context blocks. Run at least one test query demonstrating that the context produces department-calibrated output. Write a one-page setup guide a colleague could follow.

**Platform selection by role track:**
- Operations: Custom Instructions in Copilot, or a Project in Claude
- Lending: A Project in Claude, or a Custom GPT in ChatGPT
- Compliance: A Notebook in NotebookLM, or a Project in Claude
- Finance: A Project in Claude (with Copilot in Excel as companion)
- Retail: A Custom GPT in ChatGPT, or Custom Instructions in Copilot

**Requirements:**

1. All six context blocks completed — institution, department, regulatory, data handling, output standards, skill references.
2. At least one test query run through the workspace demonstrating that the context produces department-calibrated output. The submission should show what a default session (no context) would produce vs. what the configured workspace produces.
3. A one-page setup guide written for someone with AiBI-P-level proficiency who has never configured a departmental workspace. Cover: how to access the workspace, what it is for, the data handling rules they must follow, and who to contact if something goes wrong.

**What "department-calibrated output" looks like:** A lending workspace asked to summarize a market conditions memo should include references to the institution credit policy context if it was uploaded. A compliance workspace asked about a regulatory requirement should cite the specific framework — because the regulatory context block tells it which frameworks apply. A retail workspace drafting a member response should match the institution voice because the output standards block specifies it.`,
      type: 'builder',
      estimatedMinutes: 105,
      submissionFormat:
        'Screenshot of the configured workspace (at least two context blocks visible). The one-page setup guide (Markdown, Word, or PDF). The test query with output — plus a 2-3 sentence comparison noting what a default session would have produced differently.',
      dueBy: 'Before the W3 live session',
      peerReview: false,
      fields: [
        {
          id: 'platform-selected',
          label: 'Platform Used',
          type: 'select',
          required: true,
          options: [
            { value: 'claude-project', label: 'Claude Project' },
            { value: 'chatgpt-custom-gpt', label: 'ChatGPT Custom GPT' },
            { value: 'copilot-custom-instructions', label: 'Copilot Custom Instructions' },
            { value: 'notebooklm', label: 'NotebookLM Notebook' },
          ],
        },
        {
          id: 'workspace-name',
          label: 'Workspace Name (follow convention: [Institution]-[Dept]-[Function])',
          type: 'text',
          placeholder: 'e.g. FCCU-Lending-DocumentAnalysis',
          required: true,
        },
        {
          id: 'institution-context',
          label: 'Block 1: Institution Context (paste the text you entered)',
          type: 'textarea',
          required: true,
          minLength: 100,
        },
        {
          id: 'department-context',
          label: 'Block 2: Department Context (paste the text you entered)',
          type: 'textarea',
          required: true,
          minLength: 100,
        },
        {
          id: 'data-handling-rules',
          label: 'Block 4: Data Handling Rules (paste the exact rules you embedded)',
          type: 'textarea',
          required: true,
          minLength: 50,
        },
        {
          id: 'test-query',
          label: 'Test Query and Output (paste query + AI response)',
          type: 'textarea',
          required: true,
          minLength: 200,
        },
        {
          id: 'setup-guide',
          label: 'One-Page Setup Guide (paste full text or attach file)',
          type: 'textarea',
          required: true,
          minLength: 300,
        },
      ],
      completionTrigger: 'save-response',
    },
  ],

  roleTrackContent: {
    operations: {
      platformFocus: 'Copilot in Teams, Outlook, and Excel — Power Automate trigger-action basics',
      deepDiveTopics: [
        'Copilot in Teams: meeting summarization, action item extraction, follow-up draft generation. Setting up recurring meeting summaries for operational standups and committee reviews.',
        'Copilot in Outlook: email triage and response drafting with operational tone. Custom instructions for operations communication style — action-oriented, owner-assigned, deadline-explicit.',
        'Copilot in Excel: data analysis, pivot table generation, trend identification from operational metrics. Formula assistance for exception rate tracking and scorecard calculations.',
        'Power Automate: trigger-action workflow basics. Email-to-task flows. Approval chain routing. Document processing automation. SharePoint and Teams integration patterns for operational workflows.',
      ],
      activityVariations:
        'Operations workspace uses Custom Instructions in Copilot or a Claude Project. The technology stack block should list the core banking system, document management platform, and ticketing system — these inform what data can and cannot be exported for AI processing. Data handling rules must address exception report data (typically Tier 2) and member account data that may appear in operational extracts (Tier 3 — must be redacted before AI processing).',
      skillExamples: [
        'Copilot in Teams summarizing a 60-minute operations review meeting into action items with owners and deadlines in under 2 minutes',
        'Power Automate routing exception notifications from email into a SharePoint tracking list automatically, no manual data entry required',
        'Copilot in Excel generating a trend narrative from 12 months of operational metrics with chart creation and board-ready formatting',
        'Claude Project producing an operational scorecard narrative from raw monthly numbers in institutional voice',
      ],
    },
    lending: {
      platformFocus: 'Claude Projects for document analysis, ChatGPT Custom GPTs for market research',
      deepDiveTopics: [
        'Claude Projects with uploaded documents: loading credit policy, underwriting guidelines, and loan product specifications as Project knowledge. How uploaded context changes the quality of document analysis outputs.',
        'Document analysis for loan file review: completeness checks against institution checklists, condition tracking, covenant monitoring. Understanding what Claude can and cannot do with uploaded loan documents.',
        'ChatGPT Custom GPTs: research assistant for market conditions, competitor rate analysis, and CRE industry trends. Structuring research queries for maximum citation quality.',
        'Platform selection logic for lending: Claude (long document analysis, policy application, multi-page files) vs. ChatGPT (broad research, data synthesis) vs. Copilot (Excel-based pipeline tracking, formatting).',
      ],
      activityVariations:
        'Lending workspace uses a Claude Project with credit policy documents uploaded. The regulatory context block must explicitly reference ECOA/Reg B for any workflow touching credit decisions. Data handling rules must state clearly: borrower names, SSNs, account numbers, and specific financial details are Tier 3 — never entered into any AI platform. Loan analysis uses redacted scenarios or structural data only. The output standards block should specify that any output touching credit decisions must include a human review flag.',
      skillExamples: [
        'Claude Project with credit policy uploaded producing a completeness check against a 47-point checklist in under 3 minutes — what previously took a processor 25 minutes',
        'ChatGPT Custom GPT synthesizing CRE market conditions for a specific property type and submarket before underwriting committee review',
        'Claude analyzing a commercial loan file structure (redacted of all PII) and identifying documentation gaps against the institution checklist',
        'Copilot in Excel generating a pipeline status report with stage-by-stage conversion analysis from a CRM data export',
      ],
    },
    compliance: {
      platformFocus: 'Perplexity for regulatory research, NotebookLM for policy library',
      deepDiveTopics: [
        'Perplexity: regulatory research with source citations. Monitoring CFPB, OCC, FDIC, FinCEN, and state regulators. Setting up persistent research threads for ongoing regulatory topics (BNPL, AI governance, BSA beneficial ownership). Citation verification discipline — Perplexity is a research starting point, not a regulatory conclusion.',
        'NotebookLM: uploading institutional policies, regulatory guidance documents, and previous examination reports as sources. Querying across the entire policy corpus with source-grounded, citation-specific responses. Building a searchable policy library that any compliance staff member can access.',
        'Claude Projects for compliance analysis: BSA/AML workflow support, regulatory change impact analysis, policy gap documentation. The mandatory [HUMAN REVIEW REQUIRED] flag for any output used in examination preparation or regulatory filing.',
        'Source discipline in compliance contexts: every AI-assisted regulatory conclusion must trace to a primary source. NotebookLM cites uploaded documents — those documents must be the current versions. Perplexity cites web sources — those citations must be verified against the primary regulatory text.',
      ],
      activityVariations:
        'Compliance workspace uses a NotebookLM notebook (policy library) plus a Claude Project (analysis). Data handling rules are the strictest of all five tracks: examination findings are Tier 3, SAR information is Tier 3 with additional legal restrictions (SAR filings are legally confidential and cannot be discussed in any AI platform), internal policy documents are Tier 2. The regulatory context block should reference all five frameworks from AiBI-P M1 — compliance touches all of them.',
      skillExamples: [
        'NotebookLM notebook with 15 institutional policy documents — compliance officer queries "what does our BSA policy say about beneficial ownership documentation for LLCs" and gets a source-cited answer in 30 seconds',
        'Perplexity research thread tracking CFPB guidance on BNPL products — new guidance surfaces with citations for manual verification against primary source',
        'Claude Project with redacted examination findings producing a structured gap analysis comparing previous findings to current policy documentation',
        'BSA/AML narrative assistance: transaction timeline entered in redacted form (no names, no account numbers), Claude produces structured draft with [HUMAN REVIEW REQUIRED] at the top — BSA officer reviews and approves every output before filing',
      ],
    },
    finance: {
      platformFocus: 'Claude Projects for narrative generation, Copilot in Excel for financial analysis',
      deepDiveTopics: [
        'Claude Projects for finance: setting up a workspace with chart of accounts context, reporting templates, and institutional financial targets uploaded. Variance analysis narrative generation from budget-vs-actual exports. Board memo drafting from financial packages. ALCO scenario narrative generation from rate scenario data.',
        'Copilot in Excel: financial modeling assistance, ratio calculations, and trend analysis. Efficiency ratio tracking and commentary generation. Automated formatting for board-ready financial exhibits. Formula assistance for complex multi-tab financial models.',
        'Platform selection for finance: Claude (narrative generation from complex structured data, multi-step financial analysis requiring explanatory prose, ALCO analysis) vs. Copilot (in-spreadsheet calculations, chart generation, formatting, formula building).',
        'Board-ready output standards: finance AI output must meet a higher quality bar than any other track. Numbers must be precise. Claims must be conservative. Sources must be traceable. Every material variance requires an explanation a board member can understand without financial analysis background.',
      ],
      activityVariations:
        'Finance workspace uses a Claude Project with chart of accounts, current reporting templates, and strategic financial targets uploaded. Data handling rules must note that financial projections and board materials are Tier 2. Actual member or customer financial data is Tier 3 — never entered. The output standards block should specify: all numbers to consistent decimal precision, all percentages to one decimal place, all projections labeled explicitly as projections not forecasts, conservative language throughout.',
      skillExamples: [
        'Claude Project with chart of accounts generating a variance analysis narrative from a budget-vs-actual export in 4 minutes — what previously required 45 minutes of Excel work and writing',
        'Copilot in Excel calculating efficiency ratios across 8 quarters, generating a trend chart, and formatting a board-ready exhibit from raw GL data',
        'Claude drafting an ALCO scenario narrative from a rate scenario data table, including balance sheet impact projections labeled as projections and written in institutional voice',
        'Claude generating a first-draft board memo from a financial package data export, preserving all numbers exactly as provided and flagging any calculations that require CFO verification',
      ],
    },
    retail: {
      platformFocus: 'Copilot in Outlook/Teams for communications, ChatGPT Custom GPTs for staff FAQ',
      deepDiveTopics: [
        'Copilot in Outlook: member communication drafting calibrated to institution voice. Response templates for common inquiry types. Complaint response assistance with consumer protection guardrails. Service recovery communication drafting with appropriate empathy and resolution framing.',
        'Copilot in Teams: branch meeting facilitation and follow-up. Action item extraction from branch manager calls. Staff communication drafting for service updates, product launches, and policy changes.',
        'ChatGPT Custom GPTs for staff reference: FAQ automation trained on the institution product set, current rates, policies, and service standards. New employee onboarding assistant configured with institutional context. Critical distinction: staff-facing tool only, never member-facing.',
        'Institution voice discipline: retail AI output must sound like the institution. Whether the voice is formal or warm, credit union community-focused or community bank relationship-focused, it must be embedded in the workspace context block — not left to each staff member to interpret individually.',
      ],
      activityVariations:
        'Retail workspace uses a ChatGPT Custom GPT (product knowledge FAQ for staff) plus Custom Instructions in Copilot (communications). The institution voice documentation in Block 5 is the most important context block for this track — every communication that reaches a member carries the institution brand. Data handling rules must be explicit: member names, account numbers, and transaction details are Tier 3 — all communications are drafted with placeholder language that the staff member fills in with actual details before sending.',
      skillExamples: [
        'ChatGPT Custom GPT with product catalog answering "what are our current CD rates and early withdrawal penalties" in staff-facing format in 10 seconds — replacing a 5-minute search through the institution intranet',
        'Copilot in Outlook drafting a service recovery response to a member ATM fee complaint, calibrated to institution voice and consumer protection guidelines, with [MEMBER NAME] and [ACCOUNT DETAIL] placeholders',
        'Copilot in Teams summarizing a branch manager weekly call into structured action items with owner assignments and target dates',
        'Claude Project drafting a staff communication about a new savings product launch, including all required disclosure language prompts for the compliance team to fill in',
      ],
    },
  },
};
