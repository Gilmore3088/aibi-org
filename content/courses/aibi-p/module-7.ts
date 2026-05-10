// AiBI-P Module 7: AI Tools Landscape
// Pillar: Creation | Estimated: 35 minutes
// Key Output: Tool Choice Map

import type { Module } from './types';

export const module7: Module = {
  number: 7,
  id: 'm7-ai-tools-landscape',
  title: 'AI Tools Landscape',
  pillar: 'creation',
  estimatedMinutes: 35,
  keyOutput: 'Tool Choice Map',
  sections: [
    {
      id: 'm7-tool-categories',
      title: 'Know the Tool Categories',
      content: `You do not need to become a technologist to choose the right AI tool. You need to know what each category is good for.

**ChatGPT / Claude / Gemini:** drafting, summarizing, reasoning, brainstorming, document work, and reusable prompts.

**Microsoft Copilot:** work inside Microsoft 365 when your institution has approved access.

**Perplexity:** research-oriented answers with source links, still requiring verification.

**NotebookLM:** source-grounded analysis of approved documents and notes.

The question is not "which tool is best?" The question is "which approved tool fits this task and data boundary?"`,
    },
    {
      id: 'm7-tool-choice',
      title: 'The Tool Choice Rule',
      content: `Use the lowest-risk tool that can complete the task.

If the task is generic drafting, a general AI assistant may be enough. If the task involves internal documents, use an approved environment. If the task involves customer data, credit decisions, SAR details, or sensitive records, do not use a public AI tool.

Good tool selection is a banking control. It keeps useful AI work from drifting into unsafe data handling.`,
      tryThis:
        'Pick one task from your week and decide which tool category fits it best: general assistant, Microsoft 365 tool, source-grounded notebook, or no AI tool.',
    },
    {
      id: 'm7-prompts-across-tools',
      title: 'Prompts Behave Differently Across Tools',
      content: `The prompt strategy stays the same, but the tool changes the result.

**Structured prompts** work in every general assistant.

**Transformation prompts** are strongest when the tool can safely see the source material.

**Analysis prompts** are stronger in tools that can cite sources, compare files, or work inside approved documents.

**Template prompts** work best when the tool supports projects, custom instructions, saved prompts, or workspace context.

Before you decide a prompt "did not work," ask whether the tool was the right tool for the strategy. A weak result may mean the tool lacked context, sources, file access, citations, or approval for the data boundary.`,
    },
    {
      id: 'm7-banking-boundary',
      title: 'Banking Boundary',
      content: `A tool being popular does not make it approved. Your institution's policies, vendor reviews, data protection terms, and access controls determine where work belongs.

When unsure, classify the data first and escalate before using the tool.`,
    },
  ],
  activities: [
    {
      id: '7.2',
      title: 'Choose the Right Tool',
      description:
        'Match three common banking tasks to the right tool category and explain the safety boundary.',
      type: 'form',
      completionTrigger: 'save-response',
      fields: [
        {
          id: 'toolChoiceMap',
          label: 'Tool choice map',
          type: 'textarea',
          placeholder:
            'Task 1: ... Tool category: ... Why: ... Safety boundary: ...',
          minLength: 180,
          required: true,
        },
      ],
    },
  ],
} as const;
