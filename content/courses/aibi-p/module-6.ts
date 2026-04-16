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
