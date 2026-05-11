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

export interface ModuleActivitySpec {
  readonly moduleNumber: number;
  readonly title: string;
  readonly description: string;
  readonly fields: readonly ActivityField[];
  readonly artifactFilename: string; // e.g., 'aibi-p-m1-email-rewrite.md'
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

const MODULE_ACTIVITIES: Record<number, ModuleActivitySpec> = {
  1: {
    moduleNumber: 1,
    title: 'Workday wins — rewrite one banker email',
    description:
      'Pick one internal email or staff message you actually have to write this week. Rewrite the messy version. The artifact is your before-and-after, ready to send.',
    fields: [
      {
        id: 'context',
        label: 'Who is the audience and what is this email about?',
        type: 'text',
        placeholder: 'e.g., Branch managers — wire desk hours change next week',
        minLength: 10,
        required: true,
      },
      {
        id: 'original',
        label: 'Paste the original (messy) email',
        type: 'textarea',
        placeholder: 'The unedited version, in your real banker voice. AI will work from this.',
        minLength: 30,
        required: true,
      },
      {
        id: 'rewrite',
        label: 'Paste the AI rewrite (after one pass through the practice tab)',
        type: 'textarea',
        placeholder: 'The cleaner version you would actually send.',
        minLength: 30,
        required: true,
      },
      {
        id: 'changes',
        label: 'What did you change in the rewrite, and why?',
        type: 'textarea',
        placeholder: 'Two or three sentences. The reviewer wants to see your judgment, not the AI\'s.',
        minLength: 30,
        required: true,
      },
    ],
    artifactFilename: 'aibi-p-m1-email-rewrite.md',
    artifactTemplate: `# Module 1 — Workday wins · email rewrite

**Banker:** {{name}}
**Date:** {{date}}
**Audience + context:** {{context}}

## Original

{{original}}

## Rewrite

{{rewrite}}

## What I changed and why

{{changes}}

---

This is one of twelve workday wins from the AiBI-Foundation Practitioner course at
The AI Banking Institute. Each artifact is the banker's own work product;
the AI assistance is a tool, the banker's judgment is what makes it safe.
`,
  },

  2: {
    moduleNumber: 2,
    title: 'Spot the AI hallucination',
    description:
      'Three AI outputs. One is clean, two contain fabricated banking facts. Mark each as clean or flagged, name what is wrong, and explain how you spotted it.',
    fields: [
      {
        id: 'output_a_verdict',
        label: 'Output A — clean or flagged?',
        type: 'text',
        placeholder: 'clean / flagged',
        required: true,
      },
      {
        id: 'output_a_reasoning',
        label: 'If flagged: what is wrong with Output A?',
        type: 'textarea',
        placeholder: 'Name the specific fabrication or unsupported claim.',
        minLength: 20,
        required: true,
      },
      {
        id: 'output_b_verdict',
        label: 'Output B — clean or flagged?',
        type: 'text',
        required: true,
      },
      {
        id: 'output_b_reasoning',
        label: 'If flagged: what is wrong with Output B?',
        type: 'textarea',
        minLength: 20,
        required: true,
      },
      {
        id: 'output_c_verdict',
        label: 'Output C — clean or flagged?',
        type: 'text',
        required: true,
      },
      {
        id: 'output_c_reasoning',
        label: 'If flagged: what is wrong with Output C?',
        type: 'textarea',
        minLength: 20,
        required: true,
      },
      {
        id: 'reviewer_lesson',
        label: 'What is the one habit you will use to catch hallucinations going forward?',
        type: 'textarea',
        placeholder: 'One sentence. Specific to your role.',
        minLength: 20,
        required: true,
      },
    ],
    artifactFilename: 'aibi-p-m2-hallucination-log.md',
    artifactTemplate: `# Module 2 — Hallucination log

**Banker:** {{name}}
**Date:** {{date}}

## Output A

- Verdict: {{output_a_verdict}}
- Reasoning: {{output_a_reasoning}}

## Output B

- Verdict: {{output_b_verdict}}
- Reasoning: {{output_b_reasoning}}

## Output C

- Verdict: {{output_c_verdict}}
- Reasoning: {{output_c_reasoning}}

## Habit I commit to

{{reviewer_lesson}}

---

Hallucination is the single most important banker-side safety habit. Every
AI output traces back to a human who reviewed it. This log proves I can.
`,
  },

  3: {
    moduleNumber: 3,
    title: 'Build a reusable banking prompt',
    description:
      'Pick one task you do regularly. Build the prompt as a template with placeholders. The artifact is a save-and-reuse prompt card.',
    fields: [
      {
        id: 'prompt_name',
        label: 'Prompt name (3–5 words, no jargon)',
        type: 'text',
        placeholder: 'e.g., Variance narrative — monthly close',
        required: true,
      },
      {
        id: 'when_to_use',
        label: 'When to use it (1–2 sentences)',
        type: 'textarea',
        minLength: 20,
        required: true,
      },
      {
        id: 'role',
        label: 'Role the AI should play',
        type: 'text',
        placeholder: 'e.g., a financial reporting assistant for a community bank',
        required: true,
      },
      {
        id: 'task',
        label: 'The actual task instruction (with {{placeholders}} for variable inputs)',
        type: 'textarea',
        minLength: 50,
        required: true,
      },
      {
        id: 'constraints',
        label: 'Constraints (tone, length, what to escalate)',
        type: 'textarea',
        minLength: 20,
        required: true,
      },
      {
        id: 'do_not_paste',
        label: 'What-not-to-paste rules (bullets — never blank)',
        type: 'textarea',
        placeholder: '- Customer PII\n- Pre-release financials\n- Examiner correspondence',
        minLength: 30,
        required: true,
      },
    ],
    artifactFilename: 'aibi-p-m3-prompt-card.md',
    artifactTemplate: `# Module 3 — Reusable banking prompt

**Banker:** {{name}}
**Date:** {{date}}
**Prompt name:** {{prompt_name}}

## When to use it

{{when_to_use}}

## The prompt

\`\`\`
You are {{role}}.

{{task}}

Constraints: {{constraints}}
\`\`\`

## What-not-to-paste

{{do_not_paste}}

## Review cadence

Re-review this prompt every 6 months. Update if the task shape, your role,
or the bank's approved-tools list changes.

---

Reusable prompts compound. One good prompt saved this month is one fewer
ad-hoc paste next month — and one fewer chance for accidental data leakage.
`,
  },

  4: {
    moduleNumber: 4,
    title: 'Write your AI work profile (about-me.md)',
    description:
      'A short markdown bio AI tools can use to tailor outputs to your role and bank context. The artifact is about-me.md — paste the top of your prompts.',
    fields: [
      {
        id: 'role',
        label: 'Your role + department',
        type: 'text',
        placeholder: 'e.g., Operations Manager, Heritage Community Bank',
        required: true,
      },
      {
        id: 'institution_shape',
        label: 'Institution shape (asset size, branch count, charter)',
        type: 'text',
        placeholder: 'e.g., $510M community bank, 9 branches, FDIC-insured',
        required: true,
      },
      {
        id: 'audience',
        label: 'Who you usually write for',
        type: 'textarea',
        placeholder: 'e.g., Audit committee, branch managers, the CFO, the BSA officer.',
        minLength: 20,
        required: true,
      },
      {
        id: 'tone',
        label: 'Tone you prefer in AI output',
        type: 'textarea',
        placeholder: 'e.g., Direct. Plain English. No marketing language. Active voice.',
        minLength: 20,
        required: true,
      },
      {
        id: 'frameworks',
        label: 'Frameworks the AI should reference when relevant',
        type: 'textarea',
        placeholder: 'e.g., SR 11-7, Interagency TPRM Guidance, ECOA/Reg B, AIEOG AI Lexicon.',
        minLength: 20,
        required: true,
      },
    ],
    artifactFilename: 'aibi-p-m4-about-me.md',
    artifactTemplate: `# About me — AI work profile

**Updated:** {{date}}

## Role

{{role}}

## Institution

{{institution_shape}}

## Audience

I usually write for: {{audience}}

## Tone

{{tone}}

## Frameworks I work within

{{frameworks}}

---

## How to use this file

Paste the contents of this file at the top of any AI prompt where the role,
audience, or tone matters. The AI tunes its output to your context instead
of producing generic bank-themed prose.

Re-review this file every 6 months. Update if your role, audience, or
institution context changes.
`,
  },

  5: {
    moduleNumber: 5,
    title: 'Write a project brief',
    description:
      'Pick one workflow you want to improve with AI. Write a tight project brief. The artifact is the brief itself — share it with one peer for sanity check.',
    fields: [
      {
        id: 'project_name',
        label: 'Project name',
        type: 'text',
        required: true,
      },
      {
        id: 'objective',
        label: 'Objective (one sentence)',
        type: 'textarea',
        minLength: 20,
        required: true,
      },
      {
        id: 'scope',
        label: 'In scope and out of scope (bulleted)',
        type: 'textarea',
        placeholder: 'In scope:\n- ...\nOut of scope:\n- ...',
        minLength: 30,
        required: true,
      },
      {
        id: 'success_metric',
        label: 'Success metric (specific, measurable, time-bound)',
        type: 'textarea',
        placeholder: 'e.g., Reduce monthly variance-narrative drafting from 3 hours to 30 minutes by 2026-09-01.',
        minLength: 30,
        required: true,
      },
      {
        id: 'risks',
        label: 'Top 3 risks',
        type: 'textarea',
        minLength: 30,
        required: true,
      },
      {
        id: 'review_owner',
        label: 'Who reviews each output',
        type: 'text',
        placeholder: 'Named role: e.g., CFO; BSA officer.',
        required: true,
      },
    ],
    artifactFilename: 'aibi-p-m5-project-brief.md',
    artifactTemplate: `# Module 5 — Project brief

**Banker:** {{name}}
**Date:** {{date}}
**Project:** {{project_name}}

## Objective

{{objective}}

## Scope

{{scope}}

## Success metric

{{success_metric}}

## Risks

{{risks}}

## Review owner

{{review_owner}}

---

Bring this brief to one peer review meeting before any work starts. Tight
brief, less rework. The brief itself is the artifact — circulate, edit, file.
`,
  },

  6: {
    moduleNumber: 6,
    title: 'Build a document-summary template',
    description:
      'A reusable template for summarizing internal documents (policies, meeting transcripts, vendor proposals). The artifact is a template you fill in monthly.',
    fields: [
      {
        id: 'document_type',
        label: 'Document type the template handles',
        type: 'text',
        placeholder: 'e.g., Internal policy memo / vendor proposal / committee transcript',
        required: true,
      },
      {
        id: 'sections',
        label: 'Sections in the summary (numbered)',
        type: 'textarea',
        placeholder: '1. One-sentence headline\n2. Key decisions\n3. Open items\n...',
        minLength: 50,
        required: true,
      },
      {
        id: 'sanitization',
        label: 'Sanitization rules (what is removed before paste)',
        type: 'textarea',
        minLength: 30,
        required: true,
      },
      {
        id: 'reviewer',
        label: 'Who reviews the summary before circulation',
        type: 'text',
        required: true,
      },
    ],
    artifactFilename: 'aibi-p-m6-doc-summary-template.md',
    artifactTemplate: `# Module 6 — Document summary template

**Banker:** {{name}}
**Date:** {{date}}
**Handles:** {{document_type}}

## Output sections

{{sections}}

## Sanitization rules

{{sanitization}}

## Reviewer

{{reviewer}}

---

Paste the document into this template, fill the sanitization-rule placeholders,
and the AI produces the summary. The reviewer signs off before it leaves the desk.
`,
  },

  7: {
    moduleNumber: 7,
    title: 'Score one tool you actually use',
    description:
      'Pick one AI or AI-adjacent tool your bank uses or is evaluating. Run it through a quick fit-and-risk score. The artifact is a tool score card.',
    fields: [
      {
        id: 'tool_name',
        label: 'Tool name',
        type: 'text',
        required: true,
      },
      {
        id: 'use_case',
        label: 'Specific banking use case (one sentence)',
        type: 'textarea',
        minLength: 20,
        required: true,
      },
      {
        id: 'data_handling',
        label: 'How does the tool handle our data? (storage, retention, training-on-input)',
        type: 'textarea',
        placeholder: 'Cite the vendor\'s public docs. Note any unverified claims.',
        minLength: 30,
        required: true,
      },
      {
        id: 'fit_score',
        label: 'Fit (Strong / Moderate / Weak / Not a fit)',
        type: 'text',
        required: true,
      },
      {
        id: 'risk_score',
        label: 'Risk (Low / Moderate / High / Critical)',
        type: 'text',
        required: true,
      },
      {
        id: 'next_step',
        label: 'Next step (specific, named owner)',
        type: 'textarea',
        minLength: 20,
        required: true,
      },
    ],
    artifactFilename: 'aibi-p-m7-tool-score.md',
    artifactTemplate: `# Module 7 — Tool score card

**Banker:** {{name}}
**Date:** {{date}}
**Tool:** {{tool_name}}

## Use case

{{use_case}}

## Data handling

{{data_handling}}

## Fit + risk

- Fit: {{fit_score}}
- Risk: {{risk_score}}

## Next step

{{next_step}}

---

Score is preliminary, not a procurement decision. Bring to IT steering for
formal third-party risk assessment per Interagency TPRM Guidance.
`,
  },

  8: {
    moduleNumber: 8,
    title: 'Decompose one workflow into agent-safe steps',
    description:
      'Pick one multi-step workflow. Identify which steps AI can support, which need human handoff, and where the boundaries live. The artifact is a workflow design.',
    fields: [
      {
        id: 'workflow_name',
        label: 'Workflow name',
        type: 'text',
        required: true,
      },
      {
        id: 'steps',
        label: 'Steps (numbered, each with role + AI/human)',
        type: 'textarea',
        placeholder: '1. Trigger event — [role] [human/AI]\n2. ...',
        minLength: 100,
        required: true,
      },
      {
        id: 'handoffs',
        label: 'Handoff points (where AI output passes to human review)',
        type: 'textarea',
        minLength: 30,
        required: true,
      },
      {
        id: 'boundary',
        label: 'Decision boundary — what AI never does in this workflow',
        type: 'textarea',
        minLength: 30,
        required: true,
      },
    ],
    artifactFilename: 'aibi-p-m8-workflow-design.md',
    artifactTemplate: `# Module 8 — Workflow design

**Banker:** {{name}}
**Date:** {{date}}
**Workflow:** {{workflow_name}}

## Steps

{{steps}}

## Handoffs

{{handoffs}}

## Decision boundary

AI never: {{boundary}}

---

A workflow without explicit handoffs and boundaries is a workflow waiting to
embarrass the bank. Name them now, before the workflow is live.
`,
  },

  9: {
    moduleNumber: 9,
    title: 'Classify three AI use cases as red, yellow, or green',
    description:
      'Pick three AI use cases — yours or the bank\'s. Classify each. The artifact is your safe-AI-use card, ready to laminate or pin to the wall.',
    fields: [
      {
        id: 'case_1',
        label: 'Use case 1 — describe',
        type: 'textarea',
        minLength: 30,
        required: true,
      },
      {
        id: 'case_1_color',
        label: 'Use case 1 — red / yellow / green?',
        type: 'text',
        required: true,
      },
      {
        id: 'case_1_reasoning',
        label: 'Use case 1 — reasoning',
        type: 'textarea',
        minLength: 20,
        required: true,
      },
      {
        id: 'case_2',
        label: 'Use case 2 — describe',
        type: 'textarea',
        minLength: 30,
        required: true,
      },
      {
        id: 'case_2_color',
        label: 'Use case 2 — red / yellow / green?',
        type: 'text',
        required: true,
      },
      {
        id: 'case_2_reasoning',
        label: 'Use case 2 — reasoning',
        type: 'textarea',
        minLength: 20,
        required: true,
      },
      {
        id: 'case_3',
        label: 'Use case 3 — describe',
        type: 'textarea',
        minLength: 30,
        required: true,
      },
      {
        id: 'case_3_color',
        label: 'Use case 3 — red / yellow / green?',
        type: 'text',
        required: true,
      },
      {
        id: 'case_3_reasoning',
        label: 'Use case 3 — reasoning',
        type: 'textarea',
        minLength: 20,
        required: true,
      },
    ],
    artifactFilename: 'aibi-p-m9-safe-ai-use-card.md',
    artifactTemplate: `# Module 9 — Safe AI use card

**Banker:** {{name}}
**Date:** {{date}}

## Use case 1 — {{case_1_color}}

{{case_1}}

Reasoning: {{case_1_reasoning}}

## Use case 2 — {{case_2_color}}

{{case_2}}

Reasoning: {{case_2_reasoning}}

## Use case 3 — {{case_3_color}}

{{case_3}}

Reasoning: {{case_3_reasoning}}

---

## Boundaries I keep

- **Red** — never use AI. Examples above.
- **Yellow** — AI assists; human review on every output.
- **Green** — AI assists with light review.

Re-classify any use case if the data shape, regulator posture, or vendor
behavior changes. Annual review at minimum.
`,
  },

  10: {
    moduleNumber: 10,
    title: 'Fill out one role use-case card',
    description:
      'For your role, pick one use case and produce the four-field card from the practice tab. The artifact is the card itself, ready for the bank\'s prompt library.',
    fields: [
      {
        id: 'role_use_case',
        label: 'Role + use case (one sentence)',
        type: 'textarea',
        placeholder: 'e.g., Lending team uses AI to draft credit-memo prose from sanitized loan-officer notes.',
        minLength: 30,
        required: true,
      },
      {
        id: 'sample_input_shape',
        label: 'Sample input shape + sanitization rule',
        type: 'textarea',
        minLength: 50,
        required: true,
      },
      {
        id: 'review_owner',
        label: 'Output review owner + review step',
        type: 'textarea',
        placeholder: 'Named role + what they check.',
        minLength: 30,
        required: true,
      },
      {
        id: 'failure_mode',
        label: 'Most likely failure + escalation if it happens',
        type: 'textarea',
        minLength: 30,
        required: true,
      },
    ],
    artifactFilename: 'aibi-p-m10-role-use-case-card.md',
    artifactTemplate: `# Module 10 — Role use-case card

**Banker:** {{name}}
**Date:** {{date}}

## 1. Role + use case

{{role_use_case}}

## 2. Sample input shape

{{sample_input_shape}}

## 3. Output review owner + review step

{{review_owner}}

## 4. Failure mode + escalation

{{failure_mode}}

---

Re-review this card every 6 months. Frequency, review owner, and failure-mode
language drift faster than you expect.
`,
  },

  11: {
    moduleNumber: 11,
    title: 'Save three prompts to your personal library',
    description:
      'Three reusable prompts with placeholders, what-not-to-paste rules, and verified examples. The artifact is your starting prompt library — drop into the bank\'s shared drive.',
    fields: [
      {
        id: 'prompt_1_name',
        label: 'Prompt 1 — name',
        type: 'text',
        required: true,
      },
      {
        id: 'prompt_1_body',
        label: 'Prompt 1 — full text (with placeholders + what-not-to-paste rule + verified example)',
        type: 'textarea',
        minLength: 200,
        required: true,
      },
      {
        id: 'prompt_2_name',
        label: 'Prompt 2 — name',
        type: 'text',
        required: true,
      },
      {
        id: 'prompt_2_body',
        label: 'Prompt 2 — full text',
        type: 'textarea',
        minLength: 200,
        required: true,
      },
      {
        id: 'prompt_3_name',
        label: 'Prompt 3 — name',
        type: 'text',
        required: true,
      },
      {
        id: 'prompt_3_body',
        label: 'Prompt 3 — full text',
        type: 'textarea',
        minLength: 200,
        required: true,
      },
    ],
    artifactFilename: 'aibi-p-m11-prompt-library.md',
    artifactTemplate: `# Module 11 — Personal prompt library

**Banker:** {{name}}
**Date:** {{date}}

## 1. {{prompt_1_name}}

{{prompt_1_body}}

---

## 2. {{prompt_2_name}}

{{prompt_2_body}}

---

## 3. {{prompt_3_name}}

{{prompt_3_body}}

---

## Library hygiene

- Re-review every saved prompt every 6 months.
- Add a prompt when a colleague's "I just used AI to do X" sounds reusable.
- Delete prompts that have not been used in 12 months.
- The library lives in the bank's shared drive, not on a personal device.
`,
  },

  12: {
    moduleNumber: 12,
    title: 'Submit your final practitioner lab',
    description:
      'Package one real workflow you built into a credentialing-grade submission. The artifact is the lab itself — also what the credential reviewer reads.',
    fields: [
      {
        id: 'skill_summary',
        label: '1. The Skill (one sentence)',
        type: 'textarea',
        placeholder: 'Role + verb + boundary.',
        minLength: 50,
        required: true,
      },
      {
        id: 'sample_input',
        label: '2. Sample Input (sanitized)',
        type: 'textarea',
        minLength: 50,
        required: true,
      },
      {
        id: 'raw_output',
        label: '3. Raw AI Output (verbatim)',
        type: 'textarea',
        minLength: 100,
        required: true,
      },
      {
        id: 'edited_output',
        label: '4. Edited Output + Annotations',
        type: 'textarea',
        placeholder: 'Inline annotations explaining every correction.',
        minLength: 100,
        required: true,
      },
      {
        id: 'reviewer_notes',
        label: '5. Human Review Notes',
        type: 'textarea',
        minLength: 50,
        required: true,
      },
      {
        id: 'pledge',
        label: '6. Safe AI Use Pledge (signed)',
        type: 'textarea',
        minLength: 200,
        required: true,
      },
    ],
    artifactFilename: 'aibi-p-m12-final-lab.md',
    artifactTemplate: `# AiBI-Foundation Final Practitioner Lab

**Banker:** {{name}}
**Submission date:** {{date}}

## 1. The Skill

{{skill_summary}}

## 2. Sample Input

{{sample_input}}

## 3. Raw AI Output

\`\`\`
{{raw_output}}
\`\`\`

## 4. Edited Output + Annotations

{{edited_output}}

## 5. Human Review Notes

{{reviewer_notes}}

## 6. Safe AI Use Pledge

{{pledge}}

---

Submitted to The AI Banking Institute for review and credentialing as
AiBI-Foundation · Banking AI Practitioner.
`,
  },
};

export const MODULE_ACTIVITIES_BY_NUMBER = MODULE_ACTIVITIES;

export function getModuleActivitySpec(
  moduleNumber: number,
): ModuleActivitySpec | undefined {
  return MODULE_ACTIVITIES[moduleNumber];
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
