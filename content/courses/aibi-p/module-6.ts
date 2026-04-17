// AiBI-P Module 6: Anatomy of a Skill
// Pillar: Creation | Estimated: 35 minutes
// Key Output: Skill Template Library

import type { Module } from './types';

export const module6: Module = {
  number: 6,
  id: 'm6-anatomy-of-a-skill',
  title: 'Anatomy of a Skill',
  pillar: 'creation',
  estimatedMinutes: 35,
  keyOutput: 'Skill Template Library',
  mockupRef: 'content/courses/AiBI-P v1/stitch_ai_banking_institute_course/m6_anatomy_of_a_skill',
  sections: [
    {
      id: 'm6-opening',
      title: 'From Prompting to Skills',
      content: `The difference between a banker who is "good at prompting" and a banker who has automated something is a skill.

A prompt is a one-time instruction. A skill is a persistent, reusable instruction that executes reliably every time you need it — without requiring you to reconstruct the full context of what you want from scratch.

The AiBI-P course uses "skill" as a precise term. In most AI platforms, the equivalent concept lives under different labels: "Custom Instructions," "System Prompt," "GPT," "Claude Project," or "Gemini Gem." The underlying pattern is the same across all of them: a standing configuration that shapes every response the AI produces within that context.

**Why this distinction matters in banking:**

A lending analyst who asks ChatGPT "analyze this loan file" gets a generic response. A lending analyst who has built a Loan QC Skill — configured to act as a senior credit analyst, focus on collateral adequacy and documentation completeness, format output as a two-column risk table, and never flag regulatory compliance issues without citing the specific regulation — gets a reproducible, institution-grade output every time.

The Loan QC Skill took 20 minutes to build. It saves 15 minutes per use. After two uses, it has paid back its build time. After 50 uses, it has saved the analyst over 12 hours of work.`,
    },
    {
      id: 'm6-mental-models',
      title: 'Three Mental Models for Skills',
      content: `Understanding what a skill *is* conceptually helps you build better ones. These three mental models come from practitioners who have built institutional AI skills.

**A Standing Order**

A skill is like a standing order in a trading system or a recurring instruction to a back-office team. It executes perfectly every time, without manual re-intervention or re-briefing. You define the conditions and the expected output once; the system executes against those conditions every time they arise.

The standing order analogy is useful for compliance and operations staff who are already familiar with standing instructions in banking workflows.

**A Trained Colleague**

Think of a skill as a digital colleague who has been briefed once on a specific task and requires no further hand-holding. You explained exactly what you need, how you need it formatted, and what they should never do — and now they can execute that task indefinitely without you repeating yourself.

The trained colleague analogy is useful for explaining skills to staff who are skeptical of AI tools — it grounds the technology in a familiar human parallel.

**A Smarter Template**

A skill is what happens when a document template gains intelligence. It is not static text with blanks to fill in — it is a dynamic logic processor that understands the nuance of banking documentation and applies consistent professional judgment to variable inputs.

The smarter template analogy resonates with operations and compliance staff who already rely heavily on templates and checklists.`,
    },
    {
      id: 'm6-five-components',
      title: 'The Five Components of a Skill',
      content: `Every robust banking AI skill contains five components. Missing any one of them degrades the quality and consistency of outputs.

**1. Role**
The expert persona the AI must adopt. Role is not decoration — it materially affects the AI's vocabulary, assumptions, and reasoning depth. An AI told to be a "senior compliance officer specializing in KYC" will produce fundamentally different outputs than an AI told simply to "help with compliance."

Rule: Role should always start with a specific, expertise-anchored phrase. "You are a senior..." is a reliable opener. "You are helpful..." is not a role definition.

**2. Context**
The background and institutional setting that the AI needs to reason accurately. Without context, the AI makes assumptions — and those assumptions are often wrong for banking use cases. Context grounds the AI in your specific situation.

Good context includes: your institution's size and type (community bank, credit union), the regulatory environment applicable to the task, the audience for the output, and any relevant institutional constraints.

**3. Task**
The specific, measurable action required. Vague tasks produce vague outputs. The task component of a skill should describe the deliverable precisely: what to produce, at what level of detail, covering which specific elements.

Bad: "Summarize this." Good: "Extract three primary risk factors from the collateral section and flag any missing documentation items against the standard 17-item checklist."

**4. Format**
The technical output structure. Format determines how the AI organizes and presents information. Explicit format instructions prevent the AI from defaulting to its generic response style — which is often inappropriate for professional banking use.

Format options for banking: Markdown table (structured comparison), executive summary (narrative), bullet-point list (action items), JSON (technical integration), two-column format (risk/mitigation pairs), numbered list with headers.

**5. Constraints**
The guardrails and "never-do" rules. Constraints are the safety layer of a skill. They prevent the AI from doing things that would make the output unusable or inappropriate — citing external URLs when only internal data should be used, using informal language in formal documents, making regulatory compliance determinations without flagging them for human review.

A well-constructed constraint list is specific and behavioral: "Do not use bullet points in the final output," "Always flag any finding that has a regulatory implication with [REQUIRES REVIEW]," "Never provide a definitive compliance determination — provide analysis and flag for counsel review."`,
    },
    {
      id: 'm6-skill-types',
      title: 'Capability Uplift vs. Encoded Preference',
      content: `Not all skills serve the same purpose. Understanding the distinction between the two fundamental skill types helps you decide where to invest your build time.

**Capability Uplift Skills**

A capability uplift skill enables a function the AI model cannot perform well on its own without structured guidance. The skill compensates for a known gap in the base model's behavior — usually around domain specificity, output format precision, or institutional context.

Examples in community banking:
- A Loan QC Skill that checks file packages against your institution's exact 22-item documentation checklist (the model has no knowledge of your specific checklist without instruction)
- A SAR Narrative Skill that enforces FinCEN's five required narrative elements in the correct legal tone (without instruction, the model uses general prose conventions)
- A Complaint Triage Skill that classifies member complaints against UDAAP and Reg E categories (without instruction, the model applies general categorization logic, not regulatory framework logic)

Capability uplift skills are valuable now. Their durability, however, is uncertain — as AI models improve, some of the gaps they fill will narrow or close without any action on your part.

**Encoded Preference Skills**

An encoded preference skill sequences existing AI capabilities according to your specific workflow, institutional standards, and professional judgment. The model could, in principle, do each individual step — but without instruction, it would not do them in your order, using your format, with your priorities.

Examples in community banking:
- A Morning Brief Skill that surfaces your branch's top three operational priorities based on your exception report, your calendar, and your outstanding items in that specific sequence
- A Board Update Skill that formats ALCO analysis using your board's standard three-column presentation template with your institution's threshold language
- A Credit Exception Memo Skill that structures exceptions using your policy's exact approval language and flags using your internal exception code taxonomy

Encoded preference skills get more valuable over time. Every iteration makes them a more precise reflection of how your team works. Unlike capability uplift skills, they cannot be surpassed by a model update — a better model will simply execute your preferences more accurately.

**Where to invest your build time:** Spend most effort on preference skills. They encode institutional knowledge that lives nowhere else. A well-built preference skill is a form of organizational IP — it makes your workflows portable, trainable, and consistent across staff changes.`,
    },
    {
      id: 'm6-extended-anatomy',
      title: 'Extended Skill Anatomy: The Full Component Set',
      content: `The five-component framework introduced in this module (Role, Context, Task, Format, Constraints) is the foundation. As your skills grow more sophisticated, two additional components become important: the Output Format template and the Gotcha Section.

**Output Format — Show, Don't Describe**

The Format component in a basic skill tells the AI what type of output to produce. The extended Output Format component shows the AI exactly what the output should look like by providing a literal template.

Instead of: "Produce a table with three columns: Risk Factor, Severity, and Recommended Action."

Use: A fully populated example table with sample data, headers, and cell formatting exactly as you want it. The AI will pattern-match against the example rather than interpreting your description.

This is especially valuable for:
- Regulatory memo formats your institution uses for exam responses
- Board committee report templates
- Standard loan decision letters where formatting precision matters
- Member correspondence that must comply with Reg Z or Reg E disclosure requirements

**The Gotcha Section — Your Most Valuable Component**

The Gotcha Section is where you document every failure you have observed from this skill and the specific instruction that prevents it from recurring.

It is not a warning list. It is a failure log converted into binding instructions. Each entry represents something you discovered by watching the skill run on real inputs — and fixed by adding a precise instruction.

Format each entry as: "Do not [specific failure behavior]. Instead, [correct behavior]."

Examples from banking skills in production:
- "Do not infer regulatory applicability from the document text. Apply only the regulations listed in the Context section."
- "Do not produce a compliance determination. Produce an analysis and flag the determination point with [DETERMINATION REQUIRED — HUMAN REVIEW]."
- "Do not round dollar amounts. Report exact figures as they appear in the source document."
- "Do not produce any output if the input contains member Social Security numbers or account numbers. Respond: [PII DETECTED — REMOVE BEFORE RESUBMITTING]."

The Gotcha Section is where the institutional knowledge lives. A new team member deploying your skill inherits everything you learned the hard way. Treat it as the highest-value section of any skill you build.

**Skip the Role/Identity Section in Legacy Skills**

You may encounter older skill templates — from prompting guides, online tutorials, or early AI consulting materials — that include a "Role/Identity" component asking the AI to adopt a persona: "You are named Alex. You are friendly, professional, and helpful."

This is a legacy pattern. Current AI models do not need a persona name or personality description to perform well. What they need is task-specific expertise framing ("You are a Senior BSA/AML Officer...") — which is the Role component already covered in the five-component framework.

When reviewing or updating old skills: keep the expertise framing, discard the identity persona. Adding persona instructions wastes tokens and adds no functional value.`,
    },
    {
      id: 'm6-progressive-disclosure',
      title: 'Progressive Disclosure: How a Skill Loads',
      content: `Understanding how AI platforms load skill content helps you write skills that are efficient as well as effective. Skills are not loaded all at once — they use a three-layer progressive disclosure model.

**Layer 1 — The Description (Always Loaded)**

The description is approximately 100 tokens that live in the system prompt at all times. It determines whether the skill activates for a given input. This is the trigger — the AI reads it on every interaction to decide whether to engage the full skill.

Write your description as a trigger condition, not a summary. "Use when a loan officer uploads a file for QC review" is a trigger. "This skill reviews loan files" is a summary. Summaries describe. Triggers activate.

In platforms that surface skill descriptions to users (like Claude's project skills), the description also functions as documentation — it tells a colleague when to use this skill and what it will do.

**Layer 2 — The Skill Body (Loaded on Trigger)**

The full skill instructions — Role, Context, Task, Output Format, Gotcha Section, Constraints — load when the description triggers the skill. This is where your detailed instructions live. It is consumed by the model only when the skill is actually being used, which keeps system prompt token usage manageable.

Keep the skill body under 500 lines of Markdown. If a skill file is growing beyond this, it is usually doing more than one job. Split it into two focused skills rather than expanding one skill indefinitely.

**Layer 3 — Folder Contents (Loaded When Needed)**

Advanced skills can reference separate files: a regulatory reference document, a sample output template, a data dictionary, a standard checklist. These are loaded only when the skill specifically calls for them — not on every use.

This is useful for banking skills that reference institution-specific documents: your loan policy excerpts, your internal procedure manuals, your standard reporting templates. Keeping them as separate files means you can update the reference document without touching the skill instructions.

**Practical implication:** The description is your skill's first impression. Write it last — after you have built the full skill body — so it accurately reflects what the skill actually does.`,
    },
    {
      id: 'm6-five-killers',
      title: 'The 5 Skill Killers',
      content: `Anti-pattern teaching is more memorable than rules. These five killers account for the majority of skill failures observed in practice. Recognizing them in your own drafts is faster than checking against a design checklist.

The table below describes each killer, why it degrades skill performance, and the specific fix. Review it before finalizing any skill you build.`,
    },
    {
      id: 'm6-good-vs-mediocre',
      title: 'Good vs. Mediocre Skills',
      content: `The gap between a mediocre AI skill and a good one is almost always in Role specificity and Constraint completeness.

**Mediocre Skill:** *"You are a helpful assistant. Review this document and tell me if there are any problems."*

Problems with this skill:
- Role is generic ("helpful assistant") — no expertise anchor
- Task is vague ("tell me if there are any problems") — no definition of what "problem" means
- No format specification — output will be whatever the AI chooses
- No constraints — no guardrails against inappropriate determinations

**Good Skill:** *"You are a Senior Compliance Officer with 15 years of experience in community banking BSA/AML. I will provide you with a customer transaction narrative from our investigation file. Your task is to (1) identify the specific elements of the narrative that meet or partially meet FinCEN's SAR filing thresholds, and (2) suggest three specific questions an investigator should ask to determine whether a SAR is warranted. Format your output as a two-section response: [THRESHOLD ANALYSIS] and [INVESTIGATOR QUESTIONS]. Do not make a SAR filing recommendation — provide analysis only. Flag any element that requires legal counsel review with [LEGAL FLAG]."*

This skill will produce consistent, institution-grade outputs every time it encounters a new transaction narrative. The mediocre skill will produce different outputs on every use — ranging from useful to misleading.`,
    },
  ],
  tables: [
    {
      id: 'm6-five-skill-killers',
      caption: 'The 5 Skill Killers — Anti-Patterns That Degrade Skill Performance',
      columns: [
        { header: '#', key: 'number' },
        { header: 'Killer', key: 'killer' },
        { header: 'Problem', key: 'problem' },
        { header: 'Fix', key: 'fix' },
      ],
      rows: [
        {
          number: '1',
          killer: 'Description does not trigger properly',
          problem: 'The description is too vague ("helps with loan analysis"), too narrow ("only for 22-item checklist reviews"), or written in first person rather than third. The AI mis-fires — activating the skill when it should not, or failing to activate it when it should.',
          fix: 'Write in third person. Use a specific trigger condition. Format: "Use when [actor] [action] [object]." Example: "Use when a loan officer uploads a document package for pre-closing QC review."',
        },
        {
          number: '2',
          killer: 'Over-defining the process',
          problem: 'The instructions micromanage every reasoning step. This railroads the AI through a rigid sequence when the task calls for adaptive judgment — producing brittle outputs that break on inputs that do not match the expected pattern exactly.',
          fix: 'Set degrees of freedom deliberately. Tight constraints for compliance and operational tasks where variance is a liability. Loose constraints for research, drafting, and analysis tasks where adaptive judgment adds value.',
        },
        {
          number: '3',
          killer: 'Stating the obvious',
          problem: 'The skill explains what the AI already knows — "be professional," "read the document carefully," "organize your response logically." These instructions waste tokens and add no functional value. In long skills, they dilute the instructions that actually matter.',
          fix: 'Challenge every paragraph with: "Does the model already know this without instruction?" If yes, delete it. Reserve instruction space for banking-specific knowledge, institutional context, and constraints the model could not infer on its own.',
        },
        {
          number: '4',
          killer: 'Missing Gotcha Section',
          problem: 'The skill has no record of observed failure patterns. When the skill produces a bad output, there is no institutional memory of what went wrong — so the same failure recurs on every similar input.',
          fix: 'Add a Gotcha Section and populate it after every real-world test run. Document every failure you have seen and the specific instruction that prevents it. This section is where the skill\'s institutional value accumulates over time.',
        },
        {
          number: '5',
          killer: 'Monolithic blob',
          problem: 'Everything is packed into one overlong skill file — the instructions, the reference documents, the output templates, the regulatory citations. The file exceeds 500 lines and is impossible to maintain or debug.',
          fix: 'Keep the SKILL.md body under 500 lines. Move reference documents, regulatory excerpts, and output templates to separate files in the skill folder. Reference them from the skill body rather than embedding them inline.',
        },
      ],
    },
    {
      id: 'm6-skill-types',
      caption: 'Capability Uplift vs. Encoded Preference — Know Where to Invest Build Time',
      columns: [
        { header: 'Type', key: 'type' },
        { header: 'What It Does', key: 'what' },
        { header: 'Banking Example', key: 'example' },
        { header: 'Durability', key: 'durability' },
      ],
      rows: [
        {
          type: 'Capability Uplift',
          what: 'Enables a function the model cannot perform well without structured domain guidance',
          example: 'Loan QC Skill that checks against your institution\'s specific 22-item checklist; SAR Narrative Skill enforcing FinCEN\'s five required elements in legal-tone prose',
          durability: 'Valuable now. May become partially obsolete as base model capabilities improve. Review quarterly.',
        },
        {
          type: 'Encoded Preference',
          what: 'Sequences existing AI capabilities according to your specific workflow, formats, and institutional standards',
          example: 'Morning Brief Skill that surfaces branch priorities in your exact triage sequence; Board Update Skill that formats ALCO analysis using your board\'s three-column template',
          durability: 'Gets more valuable over time. A better model executes your preferences more accurately — it does not make your preferences irrelevant.',
        },
      ],
    },
    {
      id: 'm6-extended-anatomy',
      caption: 'Extended Skill Anatomy — All Six Components',
      columns: [
        { header: 'Component', key: 'component' },
        { header: 'What It Does', key: 'what' },
        { header: 'Banking Adaptation', key: 'banking' },
      ],
      rows: [
        {
          component: 'name',
          what: 'Lowercase, hyphens, max 64 characters. Use gerund form (verb-ing) to reflect the skill\'s action.',
          banking: 'loan-file-completeness-check, sar-narrative-drafter, exception-report-triage',
        },
        {
          component: 'description',
          what: 'A trigger condition, not a summary. Written in third person. Format: "Use when [actor] [action] [object]."',
          banking: '"Use when a loan officer uploads a file package for pre-closing QC review."',
        },
        {
          component: 'Instructions',
          what: 'The core task logic. Numbered steps or bullet lists over prose. Tight for compliance tasks, loose for research and drafting.',
          banking: 'Numbered steps for SAR narrative structure; loose bullet guidance for competitive research analysis',
        },
        {
          component: 'Output Format',
          what: 'Show, do not describe. Include a literal template with sample data so the AI pattern-matches against a concrete example.',
          banking: 'Include the exact memo format your institution uses for exam responses, not a description of what the memo should contain',
        },
        {
          component: 'Gotcha Section',
          what: 'The highest-signal content. Documents every observed failure and the specific instruction that prevents recurrence.',
          banking: '"Do not cite regulatory statutes without a [VERIFY] flag. Do not produce a SAR filing recommendation — produce analysis only."',
        },
        {
          component: 'Constraints',
          what: 'What NOT to do. Sharp, specific, behavioral. Written as "never" or "always" statements.',
          banking: '"Never include member PII in output. Always flag any dollar amount exceeding $10,000 with [CTR THRESHOLD] regardless of transaction type."',
        },
      ],
    },
    {
      id: 'm6-progressive-disclosure',
      caption: 'Progressive Disclosure — Three Layers of a Skill',
      columns: [
        { header: 'Layer', key: 'layer' },
        { header: 'What Loads', key: 'loads' },
        { header: 'Token Cost', key: 'tokens' },
        { header: 'Write It To...', key: 'writeTo' },
      ],
      rows: [
        {
          layer: '1. Description',
          loads: '~100 tokens in the system prompt — read on every interaction to determine whether the skill activates',
          tokens: 'Always loaded, every session',
          writeTo: 'Trigger the skill precisely. Use "Use when..." format. Write this last, after the full body is built.',
        },
        {
          layer: '2. SKILL.md body',
          loads: 'Full Role, Context, Task, Output Format, Gotcha Section, Constraints — consumed only when the skill is triggered',
          tokens: 'Loaded on trigger only',
          writeTo: 'Deliver all task-specific instructions. Keep under 500 lines. Split into two skills if it grows larger.',
        },
        {
          layer: '3. Folder contents',
          loads: 'Separate reference files — regulatory excerpts, output templates, checklists — loaded only when the skill calls for them',
          tokens: 'Loaded on demand only',
          writeTo: 'Hold reference material that changes independently of the skill logic. Update documents without touching skill instructions.',
        },
      ],
    },
    {
      id: 'm6-five-components',
      caption: 'The Five Core Elements of a Banking AI Skill',
      columns: [
        { header: 'Element', key: 'element' },
        { header: 'Description', key: 'description' },
        { header: 'What Bad Looks Like', key: 'bad' },
        { header: 'What Good Looks Like', key: 'good' },
      ],
      rows: [
        {
          element: 'Role',
          description: 'The expert persona the AI must adopt — sets vocabulary, assumptions, and reasoning depth',
          bad: '"Help me write a report."',
          good: '"Act as a Senior Compliance Officer specializing in KYC/AML with 15 years of community banking experience."',
        },
        {
          element: 'Context',
          description: 'The background and institutional setting that grounds the AI\'s reasoning',
          bad: 'No background provided — AI makes generic assumptions',
          good: '"For a $450M community bank in the midwest, subject to FFIEC examination, with a loan portfolio concentrated in commercial real estate."',
        },
        {
          element: 'Task',
          description: 'The specific, measurable action required — defines the deliverable precisely',
          bad: '"Summarize this."',
          good: '"Extract three primary risk factors from the collateral section and flag any missing documentation items against the standard 17-item loan checklist."',
        },
        {
          element: 'Format',
          description: 'The technical output structure — prevents default generic formatting',
          bad: '"Write a long email."',
          good: '"A two-column table: Column 1 header \'Risk Factor\', Column 2 header \'Recommended Mitigation\'. Maximum 5 rows."',
        },
        {
          element: 'Constraints',
          description: 'The guardrails and never-do rules — the safety layer of the skill',
          bad: 'None — AI can produce any type of output',
          good: '"Do not use bullet points. Flag any finding with regulatory implications with [REQUIRES HUMAN REVIEW]. Never provide a definitive compliance determination."',
        },
      ],
    },
    {
      id: 'm6-cross-platform',
      caption: 'Cross-Platform Skill Configuration — Where to Find Each Setting',
      columns: [
        { header: 'Platform', key: 'platform' },
        { header: 'Skill Equivalent', key: 'skillName' },
        { header: 'Where to Configure', key: 'location' },
        { header: 'Persistence', key: 'persistence' },
      ],
      rows: [
        {
          platform: 'ChatGPT',
          skillName: 'Custom Instructions + GPT + Project',
          location: 'Settings > Custom Instructions (applies to all chats), or create a GPT in GPT Builder, or start a Project',
          persistence: 'Custom Instructions persist across all conversations; GPTs and Projects are saved separately',
        },
        {
          platform: 'Claude',
          skillName: 'Project with System Prompt',
          location: 'Create a new Project, then set a system prompt in Project Instructions',
          persistence: 'Project instructions persist for all conversations within that Project',
        },
        {
          platform: 'Microsoft 365 Copilot',
          skillName: 'Not directly configurable at staff level',
          location: 'Some persistence available in Copilot Pages and Loop — check with IT',
          persistence: 'Limited staff-level skill configuration; primarily configured by admins',
        },
        {
          platform: 'Gemini',
          skillName: 'Gem',
          location: 'Gem Manager in Gemini Advanced',
          persistence: 'Gems persist as named configurations you can return to',
        },
        {
          platform: 'Perplexity',
          skillName: 'Space',
          location: 'Create a Space in Perplexity Pro',
          persistence: 'Space instructions persist for all queries within that Space',
        },
        {
          platform: 'NotebookLM',
          skillName: 'Notebook (document-specific)',
          location: 'Create a Notebook and upload source documents',
          persistence: 'Notebook context (uploaded documents) persists across sessions',
        },
      ],
    },
  ],
  activities: [
    {
      id: '6.1',
      title: 'Skill Diagnosis',
      description: 'A weak prompt is presented below. Identify which of the five components are missing or poorly specified, then write an improved version of the skill. This exercise builds the diagnostic reflex that separates practitioners from casual users.',
      type: 'free-text',
      fields: [
        {
          id: 'missing-components',
          label: 'Review this prompt: "Check this quarterly statement for errors and tell me if the portfolio looks healthy compared to last year. Write it in an email." Which of the five components are missing? Select all that apply.',
          type: 'select',
          required: true,
          options: [
            { value: 'role', label: 'Role — no expert persona defined' },
            { value: 'context', label: 'Context — no institutional or situational background' },
            { value: 'task', label: 'Task — vague deliverable ("tell me if healthy" is unmeasurable)' },
            { value: 'format', label: 'Format — "an email" is under-specified' },
            { value: 'constraints', label: 'Constraints — no guardrails or never-do rules' },
          ],
        },
        {
          id: 'improved-skill',
          label: 'Write an improved version of this skill using all five components. The improved skill should be specific enough to produce consistent outputs across multiple quarterly statements.',
          type: 'textarea',
          minLength: 100,
          required: true,
          placeholder: 'Start with a Role definition ("You are a..."), add Context about the institution and portfolio type, specify the Task precisely (what to check and what criteria), define a Format for the output, and add at least two Constraints that prevent problematic outputs.',
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: 'skill-template-library',
    },
  ],
  artifacts: [
    {
      id: 'skill-template-library',
      title: 'Skill Template Library',
      description: 'PDF and Markdown versions: 12 pre-built banking skill templates across four roles (Lending, Compliance, Operations, Marketing) with all five components filled in. Ready to copy into ChatGPT, Claude, or Gemini.',
      format: 'pdf+md',
      triggeredBy: '6.1',
      dynamic: false,
    },
  ],
} as const;
