// AiBI-P Module 6: Files and Document Workflows
// Pillar: Creation | Estimated: 35 minutes
// Key Output: Document Workflow Prompt

import type { Module } from './types';

export const module6: Module = {
  number: 6,
  id: 'm6-files-document-workflows',
  title: 'Files and Document Workflows',
  pillar: 'creation',
  estimatedMinutes: 35,
  keyOutput: 'Document Workflow Prompt',
  mockupRef: 'content/courses/AiBI-P v1/stitch_ai_banking_institute_course/m6_anatomy_of_a_skill',
  sections: [
    {
      id: 'm6-file-workflows',
      title: 'What AI Can Do With Files',
      content: `File-based AI workflows help you summarize, compare, extract, organize, and check documents. For bankers, this usually means turning approved procedures, meeting notes, public guidance, or internal templates into clearer working materials.

The useful pattern is simple: upload or paste approved source material, ask for a specific output, require uncertainty flags, and review the result before use.`,
    },
    {
      id: 'm6-document-prompts',
      title: 'Document Prompt Pattern',
      content: `A strong document prompt tells AI what to do with the source.

**Summarize:** turn long text into short instructions.

**Extract:** pull dates, owners, requirements, exceptions, or definitions.

**Compare:** identify what changed between two approved documents.

**Convert:** turn notes into a checklist, table, email, or procedure.

**Flag:** identify ambiguity, unsupported claims, missing facts, and items needing review.`,
      tryThis:
        'Ask AI to summarize an approved policy excerpt for frontline staff and separate required actions from background context.',
    },
    {
      id: 'm6-document-strategies',
      title: 'Two Strategies for Document Work',
      content: `Most file and document workflows use two prompt strategies from Module 3.

**Transformation prompts** turn a document into a more useful form:

- policy into branch instructions
- meeting notes into action items
- procedure into a checklist
- long memo into an executive summary

**Analysis prompts** review a document for risk, gaps, ambiguity, unsupported claims, or items that need supervisor review.

The safest document workflow often uses both:

1. Transform the approved source into a useful format.
2. Analyze the output for missing facts, unsupported claims, and items needing review.

Do not ask AI to make the final judgment. Ask it to prepare the work so a human can review faster.`,
    },
    {
      id: 'm6-banking-boundary',
      title: 'Banking Boundary',
      content: `Only use files your institution allows in the tool you are using. Do not upload customer PII, account records, loan files, SAR-related materials, investigation details, or confidential financial records into public AI tools.

For document work, the safest default is: approved source, clear task, explicit review step, no sensitive data.`,
    },
  ],
  activities: [
    {
      id: '6.2',
      title: 'Build a Document Workflow Prompt',
      description:
        'Write a prompt that turns an approved policy or procedure excerpt into a useful frontline output.',
      type: 'form',
      completionTrigger: 'save-response',
      fields: [
        {
          id: 'documentWorkflowPrompt',
          label: 'Document workflow prompt',
          type: 'textarea',
          placeholder:
            'Summarize this approved procedure for frontline staff. Separate required actions, background context, and items that need supervisor review...',
          minLength: 180,
          required: true,
        },
      ],
    },
  ],
} as const;
