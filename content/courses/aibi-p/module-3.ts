// AiBI-P Module 3: Prompting Fundamentals
// Pillar: Understanding | Estimated: 30 minutes
// Key Output: Prompt Strategy Cheat Sheet

import type { Module } from './types';

export const module3: Module = {
  number: 3,
  id: 'm3-prompting-fundamentals',
  title: 'Prompting Fundamentals',
  pillar: 'understanding',
  estimatedMinutes: 30,
  keyOutput: 'Prompt Strategy Cheat Sheet',
  roleSpecific: true,
  sections: [
    {
      id: 'm3-prompt-strategies',
      title: 'Prompts Are Tools for Specific Jobs',
      content: `A prompt is not one thing. In daily banking work, you use different prompt strategies for different jobs.

The useful question is not "How do I write a better prompt?" The useful question is "What kind of work am I asking AI to help with?"

This module teaches six ways you use AI at work:

1. Structured prompts for clear first drafts.
2. Transformation prompts for rewriting, summarizing, simplifying, and reorganizing.
3. Analysis prompts for review, gaps, risks, comparison, and unsupported claims.
4. Thinking prompts for planning, brainstorming, and breaking down a problem.
5. Template prompts for recurring workflows.
6. Sanitization prompts for removing risk before AI use.

The goal is simple: know which type of prompt to reach for before you start typing.`,
    },
    {
      id: 'm3-structured-and-transformation',
      title: 'Structured and Transformation Prompts',
      content: `**Structured prompts** are the foundation. They give AI the role, task, context, format, and constraints.

Example:

> You are a retail banker. Draft a response to a customer upset about an overdraft fee. Keep it under 150 words, do not promise a refund, and offer to review the account by phone.

Use structured prompts when you need a draft, summary, list, memo, or first-pass output.

**Transformation prompts** take something that already exists and change it into a better form.

Examples:

- Rewrite this internal email for clarity.
- Summarize this policy for frontline staff.
- Turn these meeting notes into decisions, owners, deadlines, and open questions.
- Restructure this paragraph into a checklist.

Transformation is the highest-frequency AI use case for most bankers because so much banking work is communication, summarization, and clarification.`,
      tryThis:
        'Take one messy internal message and identify whether it needs a structured prompt or a transformation prompt.',
    },
    {
      id: 'm3-analysis-and-thinking',
      title: 'Analysis and Thinking Prompts',
      content: `**Analysis prompts** ask AI to evaluate something.

Use them to identify risks, gaps, unsupported claims, contradictions, missing facts, or items that need human review.

Example:

> Review this AI-generated response. Identify unsupported claims and mark anything that needs review.

Analysis prompts matter in banking because polished language can hide weak reasoning. A good analysis prompt helps you slow down and verify before work moves forward.

**Thinking prompts** use AI as a planning partner.

Use them for brainstorming, breaking down a problem, organizing next steps, preparing a meeting, or comparing options.

Example:

> Help me break down this problem into steps. I need to improve our onboarding process for new accounts.

Thinking prompts are where AI becomes useful beyond writing. They help you structure the work before you produce the work.`,
    },
    {
      id: 'm3-template-and-sanitization',
      title: 'Template and Sanitization Prompts',
      content: `**Template prompts** are prompts you reuse. They are the foundation of your personal prompt library.

Example:

> You are a banking operations assistant. Summarize [DOCUMENT] for [AUDIENCE]. Include key actions, risks, follow-ups, and items that need supervisor review.

Use template prompts for weekly reports, recurring summaries, committee prep, meeting notes, customer draft patterns, and standard review workflows.

**Sanitization prompts** remove risk before using AI.

Example:

> Sanitize this text for safe AI use. Remove any customer identifiers and replace them with placeholders.

Use sanitization prompts whenever the source material may contain customer information, account details, transaction details, internal identifiers, or confidential context that is not required for the task.`,
    },
    {
      id: 'm3-strategy-cheat-sheet',
      title: 'Prompt Strategy Cheat Sheet',
      content: `Use this decision rule:

- If you are writing, use a structured prompt.
- If you are editing, use a transformation prompt.
- If you are reviewing, use an analysis prompt.
- If you are thinking, use a thinking prompt.
- If the task repeats, use a template prompt.
- If the task is risky, use a sanitization prompt first.

Level 1 awareness: some prompts combine several steps, such as "analyze this report, identify key risks, then draft a summary for leadership." Treat these as multi-step prompts. You do not need to build agents in this course. You only need to understand how to give AI a sequence of steps while keeping human checkpoints visible.`,
    },
    {
      id: 'm3-banking-boundary',
      title: 'Banking Boundary',
      content: `Prompt strategy does not override data rules.

Before using any strategy, ask:

1. What data does this task require?
2. Is this tool approved for that data?
3. What must a human verify?
4. What should be escalated instead of automated?

Good prompting in banking is not clever wording. It is choosing the right strategy, giving enough context, removing sensitive data, and keeping review visible.`,
    },
  ],
  tables: [
    {
      id: 'm3-prompt-strategy-map',
      caption: 'Six Prompt Strategies for Daily Banking Work',
      columns: [
        { header: 'Strategy', key: 'strategy' },
        { header: 'Use When', key: 'useWhen' },
        { header: 'Banking Example', key: 'example' },
      ],
      rows: [
        {
          strategy: 'Structured',
          useWhen: 'You need a clear first draft or output.',
          example: 'Draft a customer response with tone, length, and review constraints.',
        },
        {
          strategy: 'Transformation',
          useWhen: 'You already have text or notes and need a better form.',
          example: 'Rewrite a wordy procedure email so the action is obvious.',
        },
        {
          strategy: 'Analysis',
          useWhen: 'You need review, risk detection, comparison, or gap finding.',
          example: 'Identify unsupported claims in an AI-generated answer.',
        },
        {
          strategy: 'Thinking',
          useWhen: 'You need help planning, brainstorming, or breaking down a problem.',
          example: 'Break a process improvement problem into steps and decisions.',
        },
        {
          strategy: 'Template',
          useWhen: 'The task repeats and deserves a reusable pattern.',
          example: 'Create a weekly report prompt with placeholders and safety notes.',
        },
        {
          strategy: 'Sanitization',
          useWhen: 'The source material may contain sensitive or unnecessary data.',
          example: 'Remove customer identifiers before asking for a generic draft.',
        },
      ],
    },
  ],
  activities: [
    {
      id: '3.1',
      title: 'Choose the Right Prompt Strategy',
      description:
        'Match six banking tasks to the right prompt strategy and write one reusable structured prompt for your role.',
      type: 'form',
      completionTrigger: 'save-response',
      artifactId: 'prompt-strategy-cheat-sheet',
      fields: [
        {
          id: 'strategyMap',
          label: 'Prompt strategy map',
          type: 'textarea',
          minLength: 220,
          required: true,
          placeholder:
            'Task: ... Strategy: structured / transformation / analysis / thinking / template / sanitization. Why this strategy fits: ... Human review needed: ...',
        },
      ],
    },
  ],
  artifacts: [
    {
      id: 'prompt-strategy-cheat-sheet',
      title: 'Prompt Strategy Cheat Sheet',
      description: 'A practical guide for choosing the right type of prompt for daily banking work.',
      format: 'pdf+md',
      triggeredBy: '3.1',
      dynamic: false,
    },
  ],
} as const;
