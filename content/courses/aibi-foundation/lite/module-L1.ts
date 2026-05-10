// Foundation Lite — Module L1: AI for Your Workday
// Mirrors Foundation Full Module 1. The Lite track tags the learner so they
// proceed to L2 (rather than M2) after this module.
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-lite/module-L1-spec.md

import type { FoundationModule } from '../types';

export const moduleL1: FoundationModule = {
  number: 1,
  id: 'l1-ai-for-your-workday',
  trackId: 'lite',
  trackPosition: 'L1',
  title: 'AI for Your Workday',
  estimatedMinutes: 20,
  keyOutput: 'Rewritten Member Communication',
  dailyUseOutcomes: [
    'A Rewritten Member Communication ready to send the next day at work.',
    'A multi-model preference note recording which AI felt right and why.',
  ],
  activityTypes: ['multi-model', 'single-prompt'],
  whyThisExists: `Foundation Lite is the literacy floor for every employee at the bank. Tellers, vault, custodial, seasonal staff, board members during orientation. Mandatory bank-wide.

L1 mirrors Foundation Full Module 1 — first prompt, multi-model comparison, daily-use outcome. The difference is what comes after: Lite finishes in 4 modules, Full continues through 20.

Lite graduates can later upgrade to Full by completing the remaining modules (3, 5 to 20) without redoing Lite content.`,
  learningObjectives: [
    'Send a structured C-A-T-C prompt to three AI models simultaneously.',
    'Compare three responses and articulate what differs.',
    'Produce one Rewritten Member Communication ready to send.',
    'Capture an initial multi-model preference note.',
  ],
  sections: [
    {
      id: 'l1-opening',
      title: 'Your first prompt, three responses',
      content: `Most banker first encounters with AI go one of two ways: pasting something into a single chat box and either being impressed or unimpressed by what comes back. Neither produces real judgment about which AI tool to use for which job.

This module skips the single-tool experience and starts you with the comparison view that experienced practitioners use every day. The same prompt goes to Claude, ChatGPT, and Gemini in parallel. You see all three responses side-by-side. You decide which one is closest to what you needed, and you note why.

The prompt structure you will use is **C-A-T-C** — Context, Audience, Tone, Constraints. It will appear in every module after this one. Internalizing this four-part structure is the single highest-leverage prompting skill for community bank work.`,
      tryThis: 'Pick a member email you sent last week. Look at it as if a regulator handed it to a vendor and asked them to summarize it. What context, audience, tone, and constraints would the vendor need to reproduce your work? That is C-A-T-C.',
    },
    {
      id: 'l1-bridge',
      title: 'Back at the bank',
      content: `In this platform you sent the same prompt to three frontier models because building tool-selection judgment requires the comparison. At your bank, the equivalent is **M365 Copilot Chat** with the shield icon — the tenant-grounded version that respects your data classification rules.

Apply the C-A-T-C pattern in Copilot Chat. The platform helped you build the skill. The bank's approved tools are where you use it.`,
    },
  ],
  activities: [
    {
      id: 'L1.1',
      title: 'Your first prompt, three responses',
      description: 'Build a C-A-T-C prompt to rewrite a member communication. The platform sends to Claude, ChatGPT, and Gemini in parallel. Three responses stream side-by-side. Annotate which is most warm, most concise, most accurate, best banking voice.',
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
          placeholder: 'e.g. long-time deposit member, new business borrower',
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
          placeholder: 'Under 120 words. Plain English. End with a clear next step. Do not invent facts. Do not promise rates or terms not specified.',
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '01-rewritten-member-communication',
    },
    {
      id: 'L1.2',
      title: 'Your model preference signal',
      description: 'One-screen reflection. Which model felt right, and why? This is the start of your multi-model preference log; you will add to it across the course.',
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
            { value: 'mixed', label: 'I merged elements from more than one' },
          ],
        },
        {
          id: 'why',
          label: 'Why?',
          type: 'textarea',
          minLength: 25,
          required: true,
          placeholder: 'Be specific. "Better tone for a hesitant borrower" beats "I liked it."',
        },
      ],
      completionTrigger: 'save-response',
    },
  ],
  artifacts: [
    {
      id: '01-rewritten-member-communication',
      title: 'Rewritten Member Communication',
      description: 'A daily-use template for member messages. Built from your C-A-T-C inputs and the response you picked.',
      format: 'pdf+md',
      triggeredBy: 'L1.1',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/01-rewritten-member-communication.md',
    },
  ],
  forwardLinks: ['l2-spot-a-lie'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-lite/module-L1-spec.md',
} as const;
