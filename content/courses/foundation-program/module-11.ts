// AiBI-Foundation Module 11: Personal Prompt Library
// Pillar: Application | Estimated: 35 minutes
// Key Output: Personal Prompt Library

import type { Module } from './types';

export const module11: Module = {
  number: 11,
  id: 'm11-personal-prompt-library',
  title: 'Personal Prompt Library',
  pillar: 'application',
  estimatedMinutes: 35,
  keyOutput: 'Personal Prompt Library',
  sections: [
    {
      id: 'm11-library-purpose',
      title: 'Stop Rewriting the Same Instructions',
      content: `A personal prompt library turns repeated AI work into reusable assets. It should include prompts for your most common writing, summarizing, reviewing, planning, and formatting tasks.

Each saved prompt should include a title, when to use it, what to paste, what not to paste, the prompt text, an example output, and safety notes.`,
    },
    {
      id: 'm11-organize-by-strategy',
      title: 'Organize Prompts by Job, Not Cleverness',
      content: `Do not organize your prompt library around "best prompts." Organize it around the work you do.

Use the six strategy types from Module 3:

- Structured: first drafts and clear outputs
- Transformation: rewrite, summarize, simplify, convert
- Analysis: review, risk, gaps, unsupported claims
- Thinking: brainstorm, plan, break down a problem
- Template: recurring workflows and standard outputs
- Sanitization: remove risk before AI use

When you save a prompt, label the strategy. That makes the library useful later because you can find the right kind of help in seconds.`,
    },
    {
      id: 'm11-prompt-standard',
      title: 'The Prompt Card Standard',
      content: `A useful prompt card answers five questions.

1. What task does this help with?
2. What role should AI take?
3. What context is safe to include?
4. What format should the output use?
5. What must AI avoid or flag?

If a prompt cannot answer those questions, it is not ready to reuse.`,
      tryThis:
        'Turn one prompt you used earlier in the course into a reusable prompt card.',
    },
    {
      id: 'm11-banking-boundary',
      title: 'Banking Boundary',
      content: `Prompt libraries can accidentally normalize unsafe behavior. Every reusable prompt should include what not to paste and what needs human review.`,
    },
  ],
  activities: [
    {
      id: '11.1',
      title: 'Build a Personal Prompt Card',
      description:
        'Create one reusable prompt card for a task you expect to perform again.',
      type: 'form',
      completionTrigger: 'save-response',
      fields: [
        {
          id: 'personalPromptCard',
          label: 'Prompt card',
          type: 'textarea',
          placeholder:
            'Title, when to use it, what to paste, what not to paste, prompt text, example output, safety notes...',
          minLength: 220,
          required: true,
        },
      ],
    },
  ],
} as const;
