// AiBI-P Module 9: Safe AI Use in Banking
// Pillar: Understanding | Estimated: 35 minutes
// Key Output: Safe AI Use Checklist

import type { Module } from './types';

export const module9: Module = {
  number: 9,
  id: 'm9-safe-ai-use-banking',
  title: 'Safe AI Use in Banking',
  pillar: 'understanding',
  estimatedMinutes: 35,
  keyOutput: 'Safe AI Use Checklist',
  mockupRef: 'content/courses/AiBI-P v1/stitch_ai_banking_institute_course/m5_refined_safe_use_guardrails',
  sections: [
    {
      id: 'm9-safe-rule',
      title: 'The SAFE Rule',
      content: `SAFE is the learner-facing rule for using AI in regulated banking work.

**Strip sensitive data:** remove customer, account, credit, SAR, investigation, and confidential financial details before prompting.

**Ask clearly:** give AI a role, task, context, format, and constraints.

**Fact-check outputs:** verify claims, numbers, citations, dates, policy language, and customer-facing statements.

**Escalate risky decisions:** keep credit, legal, compliance, HR, and customer-impacting decisions with humans.`,
    },
    {
      id: 'm9-red-yellow-green',
      title: 'Red / Yellow / Green Use',
      content: `Use red/yellow/green to decide whether a task belongs in AI.

**Green:** generic drafting, brainstorming, formatting, public-document summaries, and personal productivity tasks.

**Yellow:** internal policy summaries, customer-facing draft language, board or management drafts, financial analysis drafts, and anything requiring human review.

**Red:** customer PII, account records, credit decisions, SAR details, legal/compliance determinations, HR decisions, passwords, and sensitive financial records in public tools.

When uncertain, classify up.`,
      tryThis:
        'Classify three AI use cases from your work as green, yellow, or red and name the required safeguard.',
    },
    {
      id: 'm9-sanitization-and-review-prompts',
      title: 'Safety Prompts: Sanitize, Then Review',
      content: `Safe AI use often starts before the main prompt.

Use a **sanitization prompt** when the source material may contain sensitive or unnecessary details:

> Sanitize this text for safe AI use. Remove customer identifiers, account details, transaction details, and unique facts that are not needed for the task. Replace removed details with placeholders.

Then use an **analysis prompt** to review the AI output:

> Review this draft for unsupported claims, risky promises, missing facts, and items that need human review.

This two-step habit keeps speed and safety together. First remove risk from the input. Then check risk in the output.`,
    },
    {
      id: 'm9-banking-boundary',
      title: 'Banking Boundary',
      content: `Compliance does not disappear when AI saves time. AI can support drafting, analysis, and organization, but it does not replace your institution's controls.

Use AI to prepare work. Use humans and approved processes to decide, approve, file, disclose, and communicate anything high-risk.`,
    },
  ],
  tables: [
    {
      id: 'm9-use-boundaries',
      caption: 'AI Use Boundaries for Banking Work',
      columns: [
        { header: 'Level', key: 'level' },
        { header: 'Examples', key: 'examples' },
        { header: 'Required safeguard', key: 'safeguard' },
      ],
      rows: [
        {
          level: 'Green',
          examples: 'Generic email drafts, meeting notes, public guidance summaries, brainstorming',
          safeguard: 'Human review before use',
        },
        {
          level: 'Yellow',
          examples: 'Internal policy summaries, customer-facing draft language, board memo drafts',
          safeguard: 'Approved tool, source verification, accountable owner review',
        },
        {
          level: 'Red',
          examples: 'Customer PII, credit decisions, SAR details, legal/compliance determinations',
          safeguard: 'Do not use public AI tools; escalate to approved process',
        },
      ],
    },
  ],
  activities: [
    {
      id: '9.1',
      title: 'Classify AI Use Cases',
      description:
        'Classify proposed AI uses as red, yellow, or green and identify the required safeguard.',
      type: 'form',
      completionTrigger: 'save-response',
      artifactId: 'safe-ai-use-checklist',
      fields: [
        {
          id: 'useCaseClassification',
          label: 'Use case classifications',
          type: 'textarea',
          placeholder:
            'Use case 1: ... Level: ... Safeguard: ... Escalation needed: ...',
          minLength: 180,
          required: true,
        },
      ],
    },
  ],
  artifacts: [
    {
      id: 'safe-ai-use-checklist',
      title: 'Safe AI Use Checklist',
      description: 'A quick reference for what to strip, verify, and escalate.',
      format: 'pdf',
      triggeredBy: '9.1',
      dynamic: false,
    },
  ],
} as const;
