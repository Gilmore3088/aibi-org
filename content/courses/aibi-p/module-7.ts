// AiBI-P Module 7: Role-Based AI Use
// Pillar: Creation | Estimated: 45 minutes
// Key Output: My First Skill (.md, dynamic: true)
// roleSpecific: true — role-specific placeholders in builder fields

import type { Module } from './types';

export const module7: Module = {
  number: 7,
  id: 'm7-skill-builder',
  title: 'Role-Based AI Use',
  pillar: 'creation',
  estimatedMinutes: 45,
  keyOutput: 'My First Skill',
  mockupRef: 'content/courses/AiBI-P v1/stitch_ai_banking_institute_course/m7_refined_skill_builder',
  roleSpecific: true,
  sections: [
    {
      id: 'm7-opening',
      title: 'Precision is Engineered, Not Accidental',
      content: `> Precision in banking AI is not accidental — it is engineered.

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

Best practice: Use action verbs — "Analyze," "Extract," "Draft," "Identify," "Flag," "Compare." Avoid passive or vague language: "help," "review," "look at."

**F — Format**

Define the output structure. What should the response look like? A table, a numbered list, a narrative paragraph, a structured report with section headers?

Best practice: Name the format and specify the structure. "A Markdown table with columns: Risk Factor | Severity (High/Med/Low) | Recommended Action."

**C — Constraint**

List the guardrails. What should the skill never do? What boundaries must every output respect?

> Write constraints as "never" or "always" statements. "Never provide a definitive regulatory determination — flag for human review." "Always cite the specific policy section when referencing internal procedures."`,
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
      id: 'm7-context-binding',
      title: 'Context Binding: What Goes Inside vs. Outside the Skill',
      content: `One of the most common skill-building mistakes is context placement — putting information in the wrong location. The rule is simple once you internalize it.

**The Context Binding Rule**

> Ask one question about every piece of context: is it about the skill, or about you and your organization?

- Is this context *about the skill* — specific to this task, traveling with this skill, used only in this context? If yes, put it inside the skill.
- Is this context *about you or your organization* — shared across multiple skills, maintained separately, or likely to change independently? If yes, point to it externally (a shared reference file, a project-level document, your CLAUDE.md or equivalent project context).

**Inside the skill (context specific to this skill):**
- The output template for this specific document type
- The regulatory rubric applicable to this specific task
- The persona or expert framing needed for this specific job
- The example inputs and outputs that calibrate this skill's behavior
- The failure patterns documented in the Gotcha Section

**Outside the skill (context about your institution):**
- Your institution's standard data classification rules (used across all skills)
- Your staff directory or stakeholder list (changes independently)
- Your institution's general AI acceptable use policy (applies to all AI work)
- Your project-level instructions or CLAUDE.md that every skill in the project inherits

**Why this matters in practice:**

A Compliance skill that embeds your institution's entire acceptable use policy as part of its instructions will produce a bloated, hard-to-maintain skill file. More importantly, when the policy updates, you have to find and update every skill that embedded it. If the policy lives externally and is referenced by the skill, a single update propagates everywhere.

Conversely, a Loan QC skill that references an external checklist file — and the checklist gets moved or renamed — will silently fail. The checklist is specific to that skill and should travel with it.

> "About the skill" = inside. "About you or your org" = outside.`,
    },
    {
      id: 'm7-scoping-rule',
      title: 'The Scoping Rule: One Clear Job Per Skill',
      content: `> One clear job per skill. If you cannot describe what the skill does in a single sentence, it is probably two skills.

This is the most important structural rule in skill design. Violating it produces skills that are inconsistent, hard to debug, and difficult to maintain.

**What scope creep looks like in banking skills:**

A Lending staff member builds a "Loan File Skill" that starts as a documentation checklist — then gains a risk narrative section, then a comparative market analysis component, then a borrower financial summary, then a rate sensitivity analysis. Each addition seems incremental. The result is a 700-line skill file that does five different jobs, fails differently on different inputs, and is impossible to diagnose when something goes wrong.

**The one-sentence test:**

Write one sentence describing what this skill does. If the sentence requires "and" to be accurate — "it checks documentation and generates risk narratives and summarizes borrower financials" — that is three skills, not one.

**Correct scope in banking:**
- "This skill checks a loan file package against the 22-item documentation checklist and produces a gap analysis." — One job.
- "This skill takes a completed gap analysis and generates a credit risk narrative for the underwriter's file." — One job.
- "This skill takes a credit risk narrative and formats it for the loan committee memo template." — One job.

**The benefit of narrow skills:**

Three narrow skills are easier to maintain than one broad skill. Each can be tested independently. Each can be improved without breaking the others. Each can be shared selectively — a Loan Processor may need the checklist skill but not the narrative skill. The narrow scope also makes the skill easier to explain to a colleague who wants to use it.

> When two skills consistently run in sequence, that is a candidate for skill chaining — an advanced pattern covered in the AiBI-S curriculum. For now, build them separately and run them manually in sequence.`,
    },
    {
      id: 'm7-four-starter-skills',
      title: 'Four Universal Starter Skills for Community Bankers',
      content: `These four skills work for any role in community banking. They are starting points — not finished tools. Each is designed to be built in 15-20 minutes and immediately useful, with clear paths to refinement as you learn what your specific workflow requires.

**Starter Skill 1: Research with Confidence**

Purpose: Structured research with confidence scoring and cross-source verification. Forces the AI to surface uncertainty rather than paper over it.

Why it matters in banking: Regulatory research, competitor analysis, and market condition summaries are high-stakes. A model that confidently states an incorrect regulatory threshold can create real compliance risk. This skill makes confidence levels explicit and requires citation for every material claim.

Core constraint to include: "For every factual claim, assign a confidence level: [HIGH] — multiple sources agree; [MED] — single source or inference; [LOW] — uncertain or conflicting. Flag any [LOW] item for human verification before use."

Banking adaptations: Regulatory change monitoring (SR letters, CFPB rule updates, FDIC guidance); peer institution competitive analysis using public FDIC call report data; market conditions research for ALCO rate environment summaries.

---

**Starter Skill 2: Devil's Advocate**

Purpose: Identify hidden assumptions, construct the strongest possible counter-argument, and surface blind spots in a proposal or decision.

Why it matters in banking: Loan committee and ALCO decisions benefit from structured challenge. The AI can simulate the most skeptical examiner, the most cautious board member, or the most risk-aware credit officer — stress-testing a proposal before it faces real scrutiny.

Core constraint to include: "Your job is to find weaknesses, not to evaluate overall merit. Produce the three strongest arguments against the proposal, regardless of whether the proposal is ultimately sound."

Banking adaptations: Credit exception review — build the strongest case for denial before the exception is approved; strategic initiative stress-testing — surface the three most likely failure modes before the initiative goes to the board; policy draft review — identify the three interpretations of ambiguous language that could create examination findings.

---

**Starter Skill 3: Morning Briefing**

Purpose: Structured daily brief synthesizing calendar, outstanding items, and priorities into a single actionable summary.

Why it matters in banking: Branch managers, department heads, and executive staff at community institutions manage high-variety days with frequent context-switching. A Morning Briefing skill eliminates the cognitive overhead of triaging inputs from multiple sources each morning.

Core constraint to include: "Organize output into three sections only: [MUST DO TODAY] — items with hard deadlines or regulatory implications; [FOLLOW UP] — items requiring action but not today; [WATCH] — items to monitor that require no action yet. Do not include items that fit none of these categories."

Banking adaptations: Branch manager daily prep synthesizing overnight exception reports, maturing CDs, and scheduled member appointments; department head brief synthesizing pending regulatory deadlines, open audit items, and staff scheduling; executive morning brief synthesizing board action items, rate environment changes, and key operational metrics.

---

**Starter Skill 4: Board of Advisors**

Purpose: Multi-perspective review from expert archetypes who evaluate a decision or proposal from distinct professional vantage points.

Why it matters in banking: Decisions that look sound from one perspective often reveal problems when viewed through a different professional lens. A credit-strong loan may have operational processing gaps. A compliance-clean policy may create operational inefficiency. Simulating multiple expert perspectives before a decision is finalized reduces the chance of one-dimensional analysis.

Core constraint to include: "Each advisor speaks in first person, from their professional frame only. They do not agree with each other to be polite. The Strategist does not validate the Operator's concerns unless they are genuinely aligned. Produce each advisor's view as a distinct, candid section."

Banking adaptations: Loan committee simulation — Strategist (growth opportunity), Operator (processing and documentation risk), Risk Officer (credit and concentration risk), Compliance Officer (regulatory exposure); ALCO scenario analysis — CFO, Chief Risk Officer, Chief Lending Officer each assessing the same rate environment scenario; new product launch review — member experience, compliance, and operations perspectives before product committee approval.`,
    },
    {
      id: 'm7-reuse-vs-create',
      title: 'Reuse vs. Create: How to Approach Your First Skills',
      content: `There is a reasonable question at the start of any skill-building effort: should you build your own skills, or adapt and reuse skills that others have built?

The answer for your first skills is clear: **build your own.**

**Why building your own first skills matters:**

> The act of building is the learning.

Writing a Role definition forces you to articulate exactly what expertise this task requires. Writing a Constraint list forces you to think through what could go wrong. Writing a Gotcha Section after your first test run forces you to observe AI failure modes rather than assume competence.

A banker who downloads a pre-built Compliance skill and uses it without building their own first cannot diagnose why it fails on an unusual input. A banker who built their own skill — even an imperfect one — has the mental model to debug any skill they encounter.

**When reuse makes sense:**

After you have built and iterated your first two or three skills, reuse becomes a legitimate accelerant. The Skill Template Library from Module 6 contains 12 pre-built templates across four banking roles. These are well-constructed starting points — not finished skills. They still require you to:

- Add the institutional context specific to your bank or credit union
- Populate the Output Format section with your institution's actual templates
- Build a Gotcha Section from your own observed failure patterns (the template's Gotcha Section is a placeholder)
- Adjust Constraints to match your institution's specific regulatory exposure and risk tolerance

**The rule of thumb:**

> Reuse structure. Own the content.

A borrowed template with your institution's real context, your actual output templates, and your observed failure patterns is a better skill than a from-scratch build that lacks those specifics. But you need to have built from scratch once to know what "from scratch" requires.`,
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

**The .md file:**

Your exported skill file is human-readable and version-controllable. Consider saving it to your OneDrive or SharePoint so you can share it with colleagues and update it as your skill improves.`,
    },
  ],
  tables: [
    {
      id: 'm7-context-binding',
      caption: 'Context Binding Rule — Inside the Skill vs. External Reference',
      columns: [
        { header: 'Put Inside the Skill When...', key: 'inside' },
        { header: 'Point Externally When...', key: 'outside' },
      ],
      rows: [
        {
          inside: 'Context is specific to this skill and travels with it: the output template for this document type, the regulatory rubric for this task, the persona framing needed here',
          outside: 'Context is shared across multiple skills: institution-wide data classification rules, acceptable use policy, staff directory, project-level instructions',
        },
        {
          inside: 'Example inputs and outputs that calibrate this skill\'s behavior for this specific job',
          outside: 'Reference documents that change independently of the skill: regulatory guidance that updates quarterly, stakeholder lists, rate sheets',
        },
        {
          inside: 'Failure patterns in the Gotcha Section — observations specific to how this skill behaves on this type of input',
          outside: 'General AI guidelines your institution has established for all AI use — these belong in a project-level context file, not repeated in every skill',
        },
      ],
    },
    {
      id: 'm7-four-starter-skills',
      caption: 'Four Universal Starter Skills — Banking Adaptations',
      columns: [
        { header: 'Skill', key: 'skill' },
        { header: 'Core Purpose', key: 'purpose' },
        { header: 'Community Banking Use Cases', key: 'useCases' },
        { header: 'Key Constraint to Include', key: 'constraint' },
      ],
      rows: [
        {
          skill: 'Research with Confidence',
          purpose: 'Multi-source research with explicit confidence scoring and cross-source fact verification',
          useCases: 'Regulatory change monitoring (SR letters, CFPB updates); peer institution competitive analysis via FDIC call report data; ALCO rate environment summaries',
          constraint: '"Assign [HIGH] / [MED] / [LOW] confidence to every factual claim. Flag any [LOW] item for human verification before use."',
        },
        {
          skill: 'Devil\'s Advocate',
          purpose: 'Identify hidden assumptions, construct strongest counter-arguments, surface blind spots',
          useCases: 'Credit exception review — build the strongest case for denial before approval; strategic initiative stress-testing; policy draft review for ambiguous language that could create examination findings',
          constraint: '"Produce the three strongest arguments against the proposal regardless of overall merit. Do not evaluate whether the proposal is sound — find weaknesses only."',
        },
        {
          skill: 'Morning Briefing',
          purpose: 'Structured daily brief synthesizing calendar, outstanding items, and priorities',
          useCases: 'Branch manager daily prep from overnight exception reports and scheduled appointments; department head brief for pending regulatory deadlines and open audit items; executive brief for board action items and rate environment changes',
          constraint: '"Three sections only: [MUST DO TODAY], [FOLLOW UP], [WATCH]. Omit any item that fits none of these categories."',
        },
        {
          skill: 'Board of Advisors',
          purpose: 'Multi-perspective review from expert archetypes who evaluate from distinct professional vantage points',
          useCases: 'Loan committee simulation (Strategist, Operator, Risk Officer, Compliance Officer); ALCO scenario analysis from CFO, CRO, and CLO perspectives; new product launch review before product committee approval',
          constraint: '"Each advisor speaks in first person from their frame only. They do not agree to be polite. Produce each view as a distinct, candid section."',
        },
      ],
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
