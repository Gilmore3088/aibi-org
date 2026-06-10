// AiBI-Foundation Module 9: Safe AI Use in Banking
// Pillar: Creation | Estimated: 35 minutes
// Key Output: Safe AI Use Checklist
//
// Pillar moved from Understanding to Creation (2026-05-17) so the sidebar
// renders modules in clean sequential order per pillar: Awareness 1,2 /
// Understanding 3,4,5 / Creation 6,7,8,9 / Application 10,11,12. The
// module's content is daily-workflow / safe-use guidance, which fits
// Creation more naturally than the conceptual Understanding pillar.

import type { Module } from './types';

export const module9: Module = {
  number: 9,
  id: 'm9-safe-ai-use-banking',
  title: 'Safe AI Use in Banking',
  pillar: 'creation',
  estimatedMinutes: 35,
  keyOutput: 'Safe AI Use Checklist',
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
      title: 'Repair four dangerous prompts',
      description:
        'In the Safety Lab you are handed four prompts that already work — good output, task done — and have to find what makes each one dangerous and repair it. Spot the danger, pick the fix, watch the re-run come back safe: a confident wrong answer (no source), a needless data leak, a red-zone decision the AI should never make, and a hidden instruction buried in a document. Each maps to a Green/Yellow/Red zone and completes the two safety moves Module 3 left dark — Check and Escalate.',
      type: 'builder',
      completionTrigger: 'save-response',
      artifactId: 'safe-ai-use-checklist',
      fields: [
        {
          id: 'safeguards_practiced',
          label: 'Safeguards practiced',
          type: 'textarea',
          placeholder:
            'The lab records the four safeguards you practiced — Check, Protect data, Escalate.',
          minLength: 40,
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
