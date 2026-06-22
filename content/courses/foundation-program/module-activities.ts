// Per-module Apply activities for AiBI-Foundation.
//
// Audit ref: C1 + C2 + H6. The previous buildV4Activity gave every module
// the same generic two-textarea form. This file replaces it with module-
// specific structured fields AND a markdown template that, when merged
// with the learner's response, produces the artifact .md they download.
//
// The shape: each module has 2-5 structured fields (textarea / text /
// select) and a markdown template using {{field_id}} placeholders.
// `/api/courses/generate-module-artifact` does the merge.

import type { Activity } from '@content/courses/foundation-program/types';
import { FOUNDATION_MICRO_MODULES } from './micro-modules';

export interface ModuleActivitySpec {
  readonly moduleNumber: number;
  readonly title: string;
  readonly description: string;
  readonly fields: readonly ActivityField[];
  readonly artifactFilename: string; // e.g., 'aibi-foundation-m4-first-prompt-card.md'
  readonly artifactTemplate: string; // markdown with {{field_id}} + {{date}} placeholders
}

export interface ActivityField {
  readonly id: string;
  readonly label: string;
  readonly type: 'text' | 'textarea';
  readonly placeholder?: string;
  readonly minLength?: number;
  readonly required?: boolean;
}

function buildMicroActivitySpec(
  module: (typeof FOUNDATION_MICRO_MODULES)[number],
): ModuleActivitySpec {
  const slug = module.saveArtifact
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    moduleNumber: module.number,
    title: `Build: ${module.saveArtifact}`,
    description: module.buildTask,
    fields: [
      {
        id: 'artifact_draft',
        label: 'What did you build?',
        type: 'textarea',
        placeholder: module.saveArtifact,
        minLength: 24,
        required: true,
      },
      {
        id: 'review_note',
        label: 'What did you check before saving it?',
        type: 'textarea',
        placeholder: module.reviewChecklist.join('; '),
        minLength: 24,
        required: true,
      },
      {
        id: 'first_use',
        label: 'Where will you reuse this at work?',
        type: 'textarea',
        placeholder: module.transferMove,
        minLength: 24,
        required: true,
      },
    ],
    artifactFilename: `aibi-foundation-m${module.number}-${slug}.md`,
    artifactTemplate: `# Module ${module.number} - ${module.saveArtifact}

**Banker:** {{name}}
**Date:** {{date}}

## What I built

{{artifact_draft}}

## Review note

{{review_note}}

## First reuse

{{first_use}}

## Banking guardrail

${module.bankingGuardrail}

---

Saved to the AiBI-Foundation Packet.
`,
  };
}

const GENERATED_MICRO_MODULE_ACTIVITIES_BY_NUMBER = Object.fromEntries(
  FOUNDATION_MICRO_MODULES.map((module) => [
    module.number,
    buildMicroActivitySpec(module),
  ]),
) as Record<number, ModuleActivitySpec>;

const MICRO_MODULE_ACTIVITY_OVERRIDES: Partial<Record<number, ModuleActivitySpec>> = {
  15: {
    moduleNumber: 15,
    title: 'Build: Human Review Gate Card',
    description:
      'Create a gate card that names the pause, reviewer authority, escalation trigger, and resume condition.',
    fields: [
      {
        id: 'paused_work',
        label: 'What work pauses at the gate?',
        type: 'textarea',
        placeholder: 'Example: AI drafts the staff-facing procedure update, but the draft pauses before distribution.',
        minLength: 24,
        required: true,
      },
      {
        id: 'reviewer_decision',
        label: 'Who can approve, edit, block, or escalate?',
        type: 'textarea',
        placeholder: 'Name the role and the decision authority they have before the work moves forward.',
        minLength: 24,
        required: true,
      },
      {
        id: 'escalation_trigger',
        label: 'What forces escalation?',
        type: 'textarea',
        placeholder: 'Example: Stop if the output references customer-specific decisions, unsupported policy claims, or missing source material.',
        minLength: 24,
        required: true,
      },
      {
        id: 'resume_condition',
        label: 'What must be true before work resumes?',
        type: 'textarea',
        placeholder: 'Example: Reviewer approves the corrected draft, source gaps are resolved, and blocked details are removed.',
        minLength: 24,
        required: true,
      },
    ],
    artifactFilename: 'aibi-foundation-m15-human-review-gate-card.md',
    artifactTemplate: `# Module 15 - Human Review Gate Card

**Banker:** {{name}}
**Date:** {{date}}

## Work that pauses at the gate

{{paused_work}}

## Reviewer decision authority

{{reviewer_decision}}

## Escalation trigger

{{escalation_trigger}}

## Resume condition

{{resume_condition}}

## Banking guardrail

Human review only counts when the reviewer can approve, edit, block, or escalate before impact.

---

Saved to the AiBI-Foundation Packet.
`,
  },
  16: {
    moduleNumber: 16,
    title: 'Build: AI Evidence Note',
    description:
      'Write a five-line evidence note for one AI-assisted work product.',
    fields: [
      {
        id: 'prompt_and_source',
        label: 'What did you ask AI to do?',
        type: 'textarea',
        placeholder: 'Summarize the prompt and source used. Do not include sensitive data.',
        minLength: 24,
        required: true,
      },
      {
        id: 'raw_output_summary',
        label: 'What did AI draft before review?',
        type: 'textarea',
        placeholder: 'What did the AI produce before human review? Name any unsupported claims or weak spots.',
        minLength: 24,
        required: true,
      },
      {
        id: 'human_edits',
        label: 'What did you verify or change?',
        type: 'textarea',
        placeholder: 'What did you change, remove, verify, or escalate before saving the artifact?',
        minLength: 24,
        required: true,
      },
      {
        id: 'final_owner_boundary',
        label: 'Who owns it, and when can it be reused?',
        type: 'textarea',
        placeholder: 'Who owns the final output, and when should this evidence note be reviewed before reuse?',
        minLength: 24,
        required: true,
      },
    ],
    artifactFilename: 'aibi-foundation-m16-ai-evidence-note.md',
    artifactTemplate: `# Module 16 - AI Evidence Note

**Banker:** {{name}}
**Date:** {{date}}

## Ask and source

{{prompt_and_source}}

## AI draft

{{raw_output_summary}}

## Banker verification and edits

{{human_edits}}

## Owner and reuse boundary

{{final_owner_boundary}}

## Banking guardrail

When AI supports reviewed work, keep enough proof for a manager, auditor, or compliance partner to understand what changed.

---

Saved to the AiBI-Foundation Packet.
`,
  },
  17: {
    moduleNumber: 17,
    title: 'Build: Reusable Workflow Kit',
    description:
      'Package one tested prompt or skill with allowed inputs, review gate, evidence note, and peer test.',
    fields: [
      {
        id: 'workflow_purpose',
        label: 'What job and inputs does this kit allow?',
        type: 'textarea',
        placeholder: 'What work does this support? What inputs are allowed, and what inputs are blocked?',
        minLength: 24,
        required: true,
      },
      {
        id: 'prompt_or_skill',
        label: 'Paste the reusable prompt or skill card',
        type: 'textarea',
        placeholder: 'Paste the reusable prompt, skill steps, or operating pattern with placeholders.',
        minLength: 24,
        required: true,
      },
      {
        id: 'checkpoint_and_escalation',
        label: 'Name blocked uses and the review gate',
        type: 'textarea',
        placeholder: 'Cite the reviewer, review gate, escalation trigger, and evidence note that travel with the kit.',
        minLength: 24,
        required: true,
      },
      {
        id: 'peer_test_plan',
        label: 'How will a peer test it before reuse?',
        type: 'textarea',
        placeholder: 'How will one peer or manager test this package before it becomes a team habit?',
        minLength: 24,
        required: true,
      },
    ],
    artifactFilename: 'aibi-foundation-m17-reusable-workflow-kit.md',
    artifactTemplate: `# Module 17 - Reusable Workflow Kit

**Banker:** {{name}}
**Date:** {{date}}

## Job and allowed inputs

{{workflow_purpose}}

## Reusable prompt or skill card

{{prompt_or_skill}}

## Blocked uses and review gate

{{checkpoint_and_escalation}}

## Peer test plan before reuse

{{peer_test_plan}}

## Banking guardrail

Do not treat a workflow kit as team-ready until inputs, blocked uses, reviewer, escalation path, evidence, and peer test are explicit.

---

Saved to the AiBI-Foundation Packet.
`,
  },
};

export const MODULE_ACTIVITIES_BY_NUMBER = {
  ...GENERATED_MICRO_MODULE_ACTIVITIES_BY_NUMBER,
  ...MICRO_MODULE_ACTIVITY_OVERRIDES,
} as Record<number, ModuleActivitySpec>;

export function getModuleActivitySpec(
  moduleNumber: number,
): ModuleActivitySpec | undefined {
  return MODULE_ACTIVITIES_BY_NUMBER[moduleNumber];
}

export function buildModuleActivity(spec: ModuleActivitySpec): Activity {
  return {
    id: `${spec.moduleNumber}.1`,
    title: spec.title,
    description: spec.description,
    type: 'free-text',
    fields: spec.fields.map((f) => ({
      id: f.id,
      label: f.label,
      type: f.type,
      placeholder: f.placeholder,
      minLength: f.minLength ?? 1,
      required: f.required ?? true,
    })),
    completionTrigger: 'artifact-download',
    artifactId: spec.artifactFilename.replace(/\.md$/, ''),
  };
}
