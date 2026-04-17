// AiBI-P Module 7: Skill Builder
// Pillar: Creation | Estimated: 45 minutes
// Key Output: My First Skill (.md, dynamic: true)
// roleSpecific: true — role-specific placeholders in builder fields

import type { Module } from './types';

export const module7: Module = {
  number: 7,
  id: 'm7-skill-builder',
  title: 'Write Your First Skill',
  pillar: 'creation',
  estimatedMinutes: 45,
  keyOutput: 'My First Skill',
  mockupRef: 'content/courses/AiBI-P v1/stitch_ai_banking_institute_course/m7_refined_skill_builder',
  roleSpecific: true,
  sections: [
    {
      id: 'm7-opening',
      title: 'Precision is Engineered, Not Accidental',
      content: `Precision in banking AI is not accidental — it is engineered.

The practitioners who get the most from AI tools are not the ones who have "figured out prompting." They are the ones who have invested 20-30 minutes building skills that make consistent performance automatic.

Module 7 is the build session. You will write your first institutional-grade skill using the RTFC Framework — Role, Task, Format, Constraint — then export it as a Markdown file you can load into any AI platform immediately.

**Why Markdown?**

Markdown files are platform-portable. A skill written in Markdown can be pasted into ChatGPT's Custom Instructions, loaded into Claude's Project system prompt, or uploaded to any AI platform's configuration interface. It is the universal format for AI skills — and it is human-readable, making it easy to review, share, and version-control.

When you complete this module, you will have a skill file saved to your device that you can use immediately in your primary AI platform.`,
    },
    {
      id: 'm7-rtfc-framework',
      title: 'The RTFC Framework',
      content: `The RTFC Framework is the AiBI-P institutional standard for crafting executable AI skills. It is a simplification of the five-component anatomy from Module 6 — collapsing Context into Role and combining Task with Format into a single structured block.

**R — Role**

Define the specific persona with expertise anchored in your context. Are you building a skill for a Senior Risk Analyst, a Customer Concierge, a Compliance Associate, or a Marketing Coordinator? The Role sets the tone and expertise level for every response.

Best practice: Start with "You are a [specific expertise]..." and add 1-2 sentences of institutional context that will always be true for this skill's use cases.

**T — Task**

State the objective explicitly and completely. What does this skill need to do? What inputs will it receive? What constitutes a successful output?

Best practice: Use action verbs. "Analyze," "Extract," "Draft," "Identify," "Flag," "Compare." Avoid passive or vague language: "help," "review," "look at."

**F — Format**

Define the output structure. What should the response look like? A table, a numbered list, a narrative paragraph, a structured report with section headers?

Best practice: Name the format and specify the structure. "A Markdown table with columns: Risk Factor | Severity (High/Med/Low) | Recommended Action."

**C — Constraint**

List the guardrails. What should the skill never do? What boundaries must every output respect?

Best practice: Write constraints as "never" or "always" statements. "Never provide a definitive regulatory determination — flag for human review." "Always cite the specific policy section when referencing internal procedures."`,
    },
    {
      id: 'm7-role-specific-placeholders',
      title: 'Role-Specific Starting Points',
      content: `Your onboarding role selection pre-populates the skill builder with role-specific placeholder examples. These are not requirements — they are starting points to accelerate your first build.

**Lending staff:** The default Role placeholder is "Senior Credit Analyst." The default Task placeholder focuses on loan document review and risk factor identification. These can be changed to match any lending workflow — mortgage underwriting, commercial credit, consumer loan origination.

**Compliance staff:** The default Role placeholder is "BSA/AML Compliance Officer." The default Task placeholder focuses on transaction narrative analysis. Compliance skills benefit from strong Constraint sections — the "never provide a definitive compliance determination" constraint is pre-loaded.

**Operations staff:** The default Role placeholder is "Operations Manager." The default Task placeholder focuses on process documentation and exception analysis. Operations skills often benefit from structured output formats — checklists and numbered procedures.

**Marketing and Communications staff:** The default Role placeholder is "Marketing Communications Specialist for a community bank." The default Task placeholder focuses on drafting member-facing communications. Brand voice and tone constraints are pre-loaded.

**Retail/Frontline staff:** The default Role placeholder is "Member Services Representative." The default Task placeholder focuses on account inquiry responses and product information drafting.

After building your first skill, you can build additional skills for any task in your workflow — the platform is not limited to your onboarding role's defaults.`,
    },
    {
      id: 'm7-starter-skill-tutorials',
      title: 'Starter Skills: Five Complete Walk-Throughs',
      content: `The RTFC Framework makes sense conceptually. These five tutorials make it practical.

Each tutorial below is a complete walk-through for a specific banking role: the prompt, what it produces, how to deploy it, and how to improve it. You will build one real skill that you can use immediately in your daily work.

**Choose the tutorial that matches your role.** Complete it before the Activity 7.1 Skill Builder exercise below — it will give you a concrete model for how a well-built skill looks and performs.

**1. Loan File Completeness Checker (Lending)**

A skill that checks any commercial loan file against a 22-item documentation checklist and produces a gap analysis table with priority ratings. Uses ChatGPT with a Project-based Custom Instruction. The prompt embeds the full checklist so nothing gets missed — even items that experienced loan officers might overlook through familiarity. Time saved: 15-20 minutes per file review. Tutorial ID: tut-m7-loan-checklist.

**2. Daily Exception Report Analyzer (Operations)**

A skill that transforms a raw exception report export into a categorized, prioritized triage plan with pattern detection. Uses Claude with a Project-based system prompt. The skill groups exceptions by category, sorts by dollar amount, flags BSA threshold transactions, and recommends a morning triage sequence. Time saved: 10-15 minutes per daily triage. Tutorial ID: tut-m7-exception-report.

**3. SAR Narrative Drafting Assistant (Compliance)**

A skill that produces structured SAR narrative drafts following FinCEN's five required elements (who, what, when, where, why). Uses Claude with heavy constraints: third person, past tense, "appears inconsistent with" language, and clear DRAFT labeling. The BSA Officer Review Flags section is the most valuable output — it tells the reviewer exactly where human judgment is needed. Time saved: 30 minutes per narrative draft. Tutorial ID: tut-m7-sar-narrative.

**4. Monthly Variance Commentary Generator (Finance)**

A skill that takes income statement data and produces board-ready variance commentary with dual materiality thresholds (both percentage AND dollar amount must be exceeded). Uses ChatGPT with Code Interpreter for Excel file analysis. Classifies each variance as timing, trend, or anomaly. Generates a three-sentence CFO commentary paragraph. Time saved: 20-30 minutes per monthly report. Tutorial ID: tut-m7-variance-analysis.

**5. Product Campaign Copy Writer (Marketing)**

A skill that produces multi-channel campaign copy (direct mail, email, branch flyer) with built-in UDAP/UDAAP and Reg DD compliance awareness. Uses Gemini with a Gem-based persistent instruction. Includes headline options, channel-specific body copy, and a required disclosures section. The "[COMPLIANCE CHECK]" flags create a productive workflow between marketing and compliance. Time saved: 1-2 hours per campaign package. Tutorial ID: tut-m7-campaign-copy.

All five skill prompts are available in the [Prompt Library](/courses/aibi-p/prompt-library). Each prompt follows the RTFC Framework from Module 6: Role, Task, Format, Constraint.`,
    },
    {
      id: 'm7-export-and-deploy',
      title: 'Exporting and Deploying Your Skill',
      content: `When you complete the Skill Builder form, the system generates a Markdown file (.md) with all five components assembled in the correct format for loading into AI platforms.

**How to deploy your skill:**

**ChatGPT (Custom Instructions):**
1. Open ChatGPT and navigate to Settings > Custom Instructions
2. Paste your skill content into the "What would you like ChatGPT to know?" field
3. Click Save — the skill now applies to every ChatGPT conversation

**ChatGPT (Project):**
1. Create a new Project in ChatGPT
2. Open Project Settings
3. Paste your skill content into the Custom Instructions field for the Project
4. All conversations within this Project will use this skill

**Claude (Project):**
1. Create a new Project in Claude
2. Open Project Settings (gear icon)
3. Paste your skill content into the Project Instructions field
4. All conversations within this Project will use this skill

**Gemini (Gem):**
1. Open Gem Manager in Gemini Advanced
2. Create a new Gem
3. Paste your skill content into the instructions field
4. Save and name your Gem for future use

**Microsoft 365 Copilot:**
Copilot does not have staff-level custom instructions in the same way. Contact your IT department about institutional-level Copilot configuration options. In the interim, paste your skill content as the opening message in any new Copilot conversation.

**The .md file:** Your exported skill file is human-readable and version-controllable. Consider saving it to your OneDrive or SharePoint so you can share it with colleagues and update it as your skill improves.`,
    },
  ],
  activities: [
    {
      id: '7.1',
      title: 'Write Your First Skill',
      description: 'Build your first institutional-grade banking AI skill using the RTFC Framework. Your completed skill will be exported as a Markdown file you can immediately deploy in your primary AI platform. Role-specific placeholder examples are pre-loaded based on your onboarding selection.',
      type: 'builder',
      fields: [
        {
          id: 'skill-role',
          label: 'Role',
          type: 'text',
          minLength: 20,
          required: true,
          placeholder: 'e.g., You are a Senior Compliance Officer at a community bank with expertise in BSA/AML and ECOA/Reg B requirements. You specialize in regulatory interpretation and practical implementation for institutions under $1B in assets.',
        },
        {
          id: 'skill-context',
          label: 'Context',
          type: 'textarea',
          minLength: 20,
          required: true,
          placeholder: 'e.g., I am providing you with [describe the type of input: transaction narratives, loan documents, policy excerpts, customer correspondence]. My institution is a community bank/credit union with [size, specialty, regulatory focus]. The output will be used for [describe the use case and audience].',
        },
        {
          id: 'skill-task',
          label: 'Task',
          type: 'textarea',
          minLength: 30,
          required: true,
          placeholder: 'e.g., Analyze the provided document and: (1) Identify three primary risk factors with their severity level (High/Medium/Low). (2) Flag any missing documentation against the standard checklist. (3) Summarize the overall risk profile in two sentences. Be specific about what the AI should produce — vague tasks produce vague outputs.',
        },
        {
          id: 'skill-format',
          label: 'Format',
          type: 'select',
          required: true,
          options: [
            { value: 'markdown-table', label: 'Markdown Table (structured comparison)' },
            { value: 'executive-summary', label: 'Executive Summary (narrative paragraphs)' },
            { value: 'numbered-list', label: 'Numbered List with section headers' },
            { value: 'two-column', label: 'Two-Column Format (Risk | Action or similar pairs)' },
            { value: 'checklist', label: 'Checklist with status indicators' },
            { value: 'custom', label: 'Custom format (describe in Constraint field)' },
          ],
        },
        {
          id: 'skill-constraint',
          label: 'Constraints',
          type: 'textarea',
          minLength: 30,
          required: true,
          placeholder: 'e.g., Never provide a definitive compliance determination — flag for human review with [REVIEW REQUIRED]. Do not cite external sources unless specifically requested. Always flag any item that requires legal counsel input with [LEGAL FLAG]. Keep the total response under 400 words unless the complexity of the input warrants more. Do not use informal language or contractions.',
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: 'my-first-skill',
    },
  ],
  artifacts: [
    {
      id: 'my-first-skill',
      title: 'My First Skill',
      description: 'A Markdown file (.md) containing your complete, five-component banking AI skill, formatted for immediate deployment in ChatGPT, Claude, Gemini, or any AI platform with custom instruction capabilities.',
      format: 'md',
      triggeredBy: '7.1',
      dynamic: true,
    },
  ],
} as const;
