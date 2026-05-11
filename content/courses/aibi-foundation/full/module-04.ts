// Foundation Full — Module 4: Safe AI Use I — Data and the Five Never-Do's
// Same shape as Foundation Lite L3 with a 20-item sort bank instead of 12.
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-04-spec.md

import type { FoundationModule } from '../types';

export const module04: FoundationModule = {
  number: 4,
  id: 'f4-five-never-dos',
  trackId: 'full',
  trackPosition: '4',
  title: "Safe AI Use I — Data and the Five Never-Do's",
  pillar: 'awareness',
  estimatedMinutes: 25,
  keyOutput: "Personal Data-Tier Routing Card with signed Five Never-Do's",
  dailyUseOutcomes: [
    'A signed Routing Card with role-specific examples in each of the four data tiers.',
    "The five never-do's internalized as reflex, not policy.",
    'A pre-flight check the learner runs every time before pasting into an AI tool.',
  ],
  activityTypes: ['sort-classify', 'adaptive-scenario', 'single-prompt'],
  whyThisExists: `The most operationally critical Awareness module. Every employee at the bank needs to internalize the four data tiers and the five never-do's *before* they begin building anything. Module 4 uses a 20-item sort bank (rotated quarterly) instead of the 12-item bank in Foundation Lite — the depth of items is the difference. The core skill is identical.

The pre-flight check pattern introduced here ("the five questions") becomes a default field on every Personal Prompt Library entry in Module 17.`,
  learningObjectives: [
    'Classify any banking artifact into one of four data tiers within five seconds of seeing it.',
    "State the five never-do's from memory.",
    'Apply the pre-flight check to a real workflow at the bank.',
    'Walk away with a signed Routing Card sized for the workstation.',
  ],
  sections: [
    {
      id: 'f4-tiers',
      title: 'The four data tiers',
      content: `Every artifact at the bank — every email, document, spreadsheet, screenshot, voicemail transcript — falls into one of four tiers:

| Tier | Examples |
|---|---|
| **Public** | Posted rates, marketing copy, published reports, press releases |
| **Internal** | Internal procedures, training materials, draft agendas, ALCO calendars |
| **Confidential** | Strategic plans, employee data, vendor contracts, board packets |
| **Restricted (NPI/PII)** | Account numbers, balances, member names tied to accounts, BSA alerts, wire instructions, exam workpapers |

The tier determines tool. Public goes anywhere. Internal goes to tenant-grounded tools (Copilot Chat with the shield). Confidential goes only to tenant-grounded tools with manager approval. Restricted goes nowhere outside the bank's approved specialist systems — never into a public AI tool, never into a screenshot pasted into a chat box.`,
    },
    {
      id: 'f4-never-dos',
      title: "The five never-do's",
      content: `**Never paste customer NPI or PII into a public AI tool**, including screenshots. The screenshot is the loophole most often abused.

**Never let AI make a final decision affecting a member.** AI assists; humans decide. Adverse action, account closure, member dispute resolution — these always carry a human signature.

**Never copy AI output into a regulatory filing or member-facing document without reviewing every word.** Regulators do not care that the hallucination came from an AI; you submitted it.

**Never use AI to evaluate a person's eligibility unless explicitly approved.** Credit, employment, hardship — these are governed decisions and require model risk management.

**Never assume what worked yesterday is approved today.** Tools change weekly. Vendor terms change. Tenant policies change. The pre-flight check happens every time, not once.`,
    },
    {
      id: 'f4-preflight',
      title: 'The pre-flight check (five questions)',
      content: `Before any paste:

1. What tier is this artifact?
2. What tool am I about to use?
3. Does the tool tier match the artifact tier?
4. Have I removed names, account numbers, dollar amounts that are not necessary for the task?
5. If a regulator looked at this paste tomorrow, what would I say?

Five seconds. Every time. The pre-flight check is a default field on every Personal Prompt Library entry; it is what makes the library defensible to an examiner.`,
      tryThis: 'Run the pre-flight check on the most recent AI tool you used at work. If question 3 fails, retire the prompt or change the tool — do not modify the artifact.',
    },
  ],
  activities: [
    {
      id: '4.1',
      title: 'The data-tier sort',
      description: 'Drag-and-drop 20 banking artifacts into the four tiers. Adaptive feedback explains why each item belongs where it does. Items rotated quarterly.',
      activityType: 'sort-classify',
      estimatedMinutes: 12,
      fields: [
        {
          id: 'sort-result',
          label: 'Final classification (auto-recorded)',
          type: 'text',
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '4.2',
      title: "Never-Do scenarios",
      description: "Five rapid-fire scenarios, one per never-do. Wrong picks branch to 'what would happen' so the consequence sticks.",
      activityType: 'adaptive-scenario',
      estimatedMinutes: 8,
      fields: [
        {
          id: 'scenario-record',
          label: 'Scenario outcome record (auto-populated)',
          type: 'text',
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '4.3',
      title: 'Sign your card',
      description: 'Personalize your Routing Card with role-specific tier examples and your pre-flight check answers. Sign and date.',
      activityType: 'single-prompt',
      estimatedMinutes: 5,
      fields: [
        {
          id: 'role',
          label: 'Your role',
          type: 'text',
          required: true,
        },
        {
          id: 'role-examples',
          label: 'List one example artifact in each tier from your daily work.',
          type: 'textarea',
          minLength: 60,
          required: true,
        },
        {
          id: 'signature',
          label: 'Type your name to acknowledge.',
          type: 'text',
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '04-data-tier-routing-card',
    },
  ],
  artifacts: [
    {
      id: '04-data-tier-routing-card',
      title: 'Data-Tier Routing Card',
      description: "Workstation-sized reference. Four tiers, role-specific examples, five never-do's, the five-question pre-flight check.",
      format: 'pdf+md',
      triggeredBy: '4.3',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/04-data-tier-routing-card.md',
    },
  ],
  dependencies: ['f3-how-ai-got-here'],
  forwardLinks: ['f5-cybersecurity', 'f7-regulatory-landscape', 'f17-prompt-library', 'f18-incident-response'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-04-spec.md',
} as const;
