// Foundation Full — Module 1: AI for Your Workday
// Same content as Foundation Lite L1; the platform tags the learner's track.
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-01-spec.md

import type { FoundationModule } from '../types';

export const module01: FoundationModule = {
  number: 1,
  id: 'f1-ai-for-your-workday',
  trackId: 'full',
  trackPosition: '1',
  title: 'AI for Your Workday',
  pillar: 'awareness',
  estimatedMinutes: 20,
  keyOutput: 'Rewritten Member Communication',
  dailyUseOutcomes: [
    'A Rewritten Member Communication ready to send the next day at work.',
    'A multi-model preference note recording which AI felt right and why.',
  ],
  activityTypes: ['multi-model', 'single-prompt'],
  whyThisExists: `Most banker first encounters with AI go one of two ways: pasting something into a single chat box and being either impressed or unimpressed. Neither produces real judgment about which AI tool to use for which job.

Module 1 skips the single-tool experience and starts the learner with the comparison view that experienced practitioners use every day. Same prompt, three models, side-by-side. The C-A-T-C structure (Context, Audience, Tone, Constraints) is introduced here and reused in every module after.`,
  learningObjectives: [
    'Send a structured C-A-T-C prompt to three AI models simultaneously.',
    'Compare three responses and articulate what differs.',
    'Produce one Rewritten Member Communication ready to send.',
    'Capture an initial multi-model preference note.',
  ],
  sections: [
    {
      id: 'f1-catc',
      title: 'C-A-T-C: the four-part prompt',
      content: `Every prompt that produces banker-grade output has four ingredients:

**Context.** Who you are, what bank, what role. *"You are a community-bank loan officer at a $500M institution"* gets different output than *"write me a loan letter."*

**Audience.** Who reads this. *"A long-time deposit member who is shopping rates"* shapes tone differently than *"a new business borrower"*.

**Tone.** Warm, direct, professional, reassuring. The tone signal saves the AI from defaulting to generic-corporate.

**Constraints.** Word count, format, things to avoid. *"Under 120 words. Plain English. End with a clear next step. Do not invent facts."* The constraint line is where most banker prompts gain or lose quality.

In this module you will write one C-A-T-C prompt, send it to three models simultaneously, and pick the response closest to what you needed. Internalizing C-A-T-C is the single highest-leverage prompting skill for community-bank work.`,
      tryThis: 'Pick a member email you sent last week. Look at it as if a regulator handed it to a vendor and asked for a summary. What context, audience, tone, and constraints would the vendor need to reproduce your work? That is C-A-T-C.',
    },
    {
      id: 'f1-bridge',
      title: 'Back at the bank',
      content: `In the platform you sent the same prompt to three frontier models because building tool-selection judgment requires the comparison. At your bank, the equivalent is **M365 Copilot Chat** with the shield icon — the tenant-grounded version that respects your data classification rules.

Apply C-A-T-C in Copilot Chat. The platform helped you build the skill. The bank's approved tools are where you use it.`,
    },
  ],
  activities: [
    {
      id: '1.1',
      title: 'Your first prompt, three responses',
      description: 'Build a C-A-T-C prompt to rewrite a member communication. The platform sends to Claude, ChatGPT, and Gemini in parallel. Three responses stream side-by-side.',
      activityType: 'multi-model',
      estimatedMinutes: 12,
      fields: [
        {
          id: 'role',
          label: 'Pick the closest role flavor',
          type: 'select',
          required: true,
          options: [
            { value: 'service-followup', label: 'Service follow-up after a member inquiry' },
            { value: 'loan-inquiry', label: 'Loan officer following up on a loan inquiry' },
            { value: 'branch-announcement', label: 'Branch manager announcing a change in services' },
          ],
        },
        {
          id: 'audience',
          label: 'Audience',
          type: 'text',
          required: true,
        },
        {
          id: 'tone',
          label: 'Tone',
          type: 'select',
          required: true,
          options: [
            { value: 'warm', label: 'Warm' },
            { value: 'direct', label: 'Direct' },
            { value: 'professional', label: 'Professional' },
            { value: 'reassuring', label: 'Reassuring' },
          ],
        },
        {
          id: 'constraints',
          label: 'Constraints',
          type: 'textarea',
          minLength: 30,
          required: true,
          placeholder: 'Under 120 words. Plain English. End with a clear next step. Do not invent facts.',
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '01-rewritten-member-communication',
    },
    {
      id: '1.2',
      title: 'Your model preference signal',
      description: 'Reflect on which model felt right and why. The start of your multi-model preference log.',
      activityType: 'single-prompt',
      estimatedMinutes: 5,
      fields: [
        {
          id: 'preferred-model',
          label: 'Which model produced the response closest to what you needed?',
          type: 'radio',
          required: true,
          options: [
            { value: 'claude', label: 'Claude' },
            { value: 'chatgpt', label: 'ChatGPT' },
            { value: 'gemini', label: 'Gemini' },
            { value: 'mixed', label: 'Merged elements from more than one' },
          ],
        },
        {
          id: 'why',
          label: 'Why?',
          type: 'textarea',
          minLength: 25,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
  ],
  artifacts: [
    {
      id: '01-rewritten-member-communication',
      title: 'Rewritten Member Communication',
      description: 'Daily-use template for member messages. Built from your C-A-T-C inputs and the response you picked.',
      format: 'pdf+md',
      triggeredBy: '1.1',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/01-rewritten-member-communication.md',
    },
  ],
  forwardLinks: ['f2-what-ai-is', 'f8-prompting', 'f17-prompt-library'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-01-spec.md',
} as const;
