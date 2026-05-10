// AiBI Foundations Module 10: Role-Based Use Cases
// Pillar: Application | Estimated: 35 minutes
// Key Output: Role Use-Case Card

import type { Module } from './types';

export const module10: Module = {
  number: 10,
  id: 'm10-role-based-use-cases',
  title: 'Role-Based Use Cases',
  pillar: 'application',
  estimatedMinutes: 35,
  keyOutput: 'Role Use-Case Card',
  mockupRef: 'content/courses/AiBI Foundations v1/stitch_ai_banking_institute_course/m9_final_capstone_submission',
  roleSpecific: true,
  sections: [
    {
      id: 'm10-use-cases',
      title: 'AI Use Cases by Banking Role',
      content: `AI becomes useful when it attaches to real work.

**Retail/frontline:** clearer customer emails, call summaries, product explanations, complaint response drafts.

**Lending:** document checklists, borrower communication drafts, policy comparison, committee memo structure.

**Operations:** procedure summaries, exception categorization, meeting notes, checklist conversion.

**Compliance:** policy summaries, training drafts, issue logs, regulatory change briefs for human review.

**Finance/executive:** variance narratives, board draft outlines, management summaries, planning questions.`,
    },
    {
      id: 'm10-choose-first-use-case',
      title: 'Choose a First Use Case',
      content: `Start with tasks that are frequent, low-risk, easy to review, and visibly useful. A good first use case saves time this week without creating new approval complexity.

Avoid starting with customer-specific decisions, credit judgment, compliance determinations, or anything requiring sensitive data.`,
      tryThis:
        'Pick one weekly task and explain why it is frequent, low-risk, reviewable, and useful.',
    },
    {
      id: 'm10-role-prompt-patterns',
      title: 'Match the Strategy to the Role',
      content: `Different roles tend to reach for different prompt strategies.

**Retail/frontline:** structured prompts and transformation prompts for customer drafts, call summaries, and clearer internal messages.

**Lending:** analysis prompts and transformation prompts for checklist review, borrower communication drafts, and committee memo structure.

**Operations:** template prompts for recurring reports, meeting notes, exception summaries, and checklist conversion.

**Compliance:** analysis prompts for unsupported claims, citation review, policy gaps, and training draft review.

**Finance/executive:** thinking prompts and structured prompts for planning questions, board summaries, and variance narratives.

The point is not to memorize examples. The point is to know what kind of help you need: writing, editing, reviewing, thinking, repeating, or sanitizing.`,
    },
    {
      id: 'm10-banking-boundary',
      title: 'Banking Boundary',
      content: `A role-based use case is not permission to bypass policy. Use role context to improve the prompt, not to include sensitive role-specific data in an unapproved tool.`,
    },
  ],
  activities: [
    {
      id: '10.1',
      title: 'Create a Role Use-Case Card',
      description:
        'Select one useful role-based AI use case and document its task, data boundary, review step, and expected output.',
      type: 'form',
      completionTrigger: 'save-response',
      fields: [
        {
          id: 'roleUseCaseCard',
          label: 'Role use-case card',
          type: 'textarea',
          placeholder:
            'Role: ... Use case: ... Input: ... Output: ... Safety boundary: ... Review step: ...',
          minLength: 180,
          required: true,
        },
      ],
    },
  ],
} as const;
