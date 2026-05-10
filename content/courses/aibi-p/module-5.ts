// AiBI Foundations Module 5: Projects and Context
// Pillar: Understanding | Estimated: 35 minutes
// Key Output: Project Brief Template

import type { Module } from './types';

export const module5: Module = {
  number: 5,
  id: 'm5-projects-and-context',
  title: 'Projects and Context',
  pillar: 'understanding',
  estimatedMinutes: 35,
  keyOutput: 'Project Brief Template',
  mockupRef: 'content/courses/AiBI Foundations v1/stitch_ai_banking_institute_course/m5_refined_safe_use_guardrails',
  sections: [
    {
      id: 'm5-why-context-matters',
      title: 'Why Context Changes the Output',
      content: `AI performs better when it understands the job, audience, source material, and desired output. A vague prompt asks AI to guess. A good project brief gives it the working context a colleague would need before helping you.

For banking work, context should be useful without being sensitive. Describe the role, task, audience, policy area, format, tone, and review boundary. Do not include customer PII, account details, confidential financial records, passwords, or anything your institution has not approved for the tool you are using.`,
      tryThis:
        'Take one recurring task and write the context a new teammate would need before helping you complete it.',
    },
    {
      id: 'm5-project-brief-template',
      title: 'The Practical Project Brief',
      content: `Use a short project brief whenever the task has more than one step.

**Project:** What are we working on?

**Role:** Who should AI act as?

**Audience:** Who will read or use the output?

**Source context:** What approved information can AI use?

**Output format:** What should the response look like?

**Constraints:** What should AI avoid or flag?

**Review step:** What must a human verify before use?`,
    },
    {
      id: 'm5-banking-boundary',
      title: 'Banking Boundary',
      content: `Context is not permission to paste sensitive information. If the task needs customer-specific data, credit judgment, legal interpretation, SAR/BSA details, or non-public financial records, stop and use your institution's approved process.

The safe habit is to give AI enough context to structure the work, while keeping protected data out of the prompt.`,
    },
  ],
  activities: [
    {
      id: '5.1',
      title: 'Write a Project Brief',
      description:
        'Create a reusable project brief for one recurring banking task using placeholders instead of sensitive details.',
      type: 'form',
      completionTrigger: 'save-response',
      fields: [
        {
          id: 'projectBrief',
          label: 'Project brief',
          type: 'textarea',
          placeholder:
            'Project, role, audience, source context, output format, constraints, and review step...',
          minLength: 200,
          required: true,
        },
      ],
    },
  ],
} as const;
