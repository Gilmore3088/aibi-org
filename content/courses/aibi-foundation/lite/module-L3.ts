// Foundation Lite — Module L3: Safe AI Use — Your Five Never-Do's
// Most operationally important module in the Lite track. Every employee
// should be able to sort confidently and recite the five never-do's.
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-lite/module-L3-spec.md

import type { FoundationModule } from '../types';

export const moduleL3: FoundationModule = {
  number: 3,
  id: 'l3-five-never-dos',
  trackId: 'lite',
  trackPosition: 'L3',
  title: "Safe AI Use — Your Five Never-Do's",
  estimatedMinutes: 20,
  keyOutput: "Personal Data-Tier Routing Card with signed Five Never-Do's",
  dailyUseOutcomes: [
    'A signed Data-Tier Routing Card with role-specific examples in each of the four data tiers.',
    "The five never-do's internalized as reflex, not policy.",
  ],
  activityTypes: ['sort-classify', 'adaptive-scenario', 'single-prompt'],
  whyThisExists: `This is the most operationally important module in the Lite track. Every employee at the bank should be able to sort confidently and recite the five never-do's.

Lite uses a 12-item sort bank instead of the 20-item bank in Foundation Full. The core skill is identical — what counts as Public, Internal, Confidential, or Restricted (NPI/PII) — and the consequences of getting it wrong are the same.`,
  learningObjectives: [
    'Classify a banking artifact into one of four data tiers within five seconds of seeing it.',
    "State the five never-do's from memory.",
    'Apply the routing card to your role-specific examples.',
  ],
  sections: [
    {
      id: 'l3-tiers',
      title: 'The four data tiers',
      content: `Every artifact at the bank — every email, document, spreadsheet, screenshot, voicemail transcript — falls into one of four tiers:

| Tier | Examples |
|---|---|
| **Public** | Posted rates, marketing copy, published reports, press releases |
| **Internal** | Internal procedures, training materials, draft agendas |
| **Confidential** | Strategic plans, employee data, vendor contracts, ALCO packets |
| **Restricted (NPI/PII)** | Account numbers, balances, member names tied to accounts, BSA alerts, wire instructions |

The tier determines what AI tools you can use. Public goes anywhere. Internal goes to tenant-grounded tools (Copilot Chat with the shield). Confidential goes only to tenant-grounded tools with manager approval. Restricted goes nowhere outside the bank's approved specialist systems — never into a public AI tool, never into a screenshot pasted into a chat box.`,
    },
    {
      id: 'l3-never-dos',
      title: "The five never-do's",
      content: `**Never paste customer NPI or PII into a public AI tool**, including screenshots. The screenshot is the loophole most often abused — visually you can see the account number, so AI can extract it.

**Never let AI make a final decision affecting a member.** AI assists; humans decide. Adverse action, account closure, member dispute resolution — these always carry a human signature.

**Never copy AI output into a regulatory filing or member-facing document without reviewing every word.** Regulators do not care that the hallucination came from an AI; you submitted it.

**Never use AI to evaluate a person's eligibility unless explicitly approved.** Credit, employment, hardship — these are governed decisions and require model risk management.

**Never assume what worked yesterday is approved today.** Tools change weekly. Vendor terms change. Tenant policies change. The pre-flight check happens every time, not once.`,
      tryThis: 'Open the last AI conversation you had at work and ask which never-do came closest to being broken. If none, look at one of your colleagues — that is where the leak is forming.',
    },
  ],
  activities: [
    {
      id: 'L3.1',
      title: 'The data-tier sort',
      description: 'Drag and drop 12 banking artifacts into the four tiers. Adaptive feedback explains why each item belongs where it does.',
      activityType: 'sort-classify',
      estimatedMinutes: 10,
      fields: [
        {
          id: 'sort-result',
          label: 'Final classification (the platform records this automatically)',
          type: 'text',
          required: true,
          placeholder: 'auto-populated by the sort engine',
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: 'L3.2',
      title: "Never-Do scenarios",
      description: "Five rapid-fire scenarios, one per never-do. Wrong picks branch to 'what would happen' so the consequence sticks.",
      activityType: 'adaptive-scenario',
      estimatedMinutes: 6,
      fields: [
        {
          id: 'scenario-results',
          label: 'Scenario outcome record (auto-populated)',
          type: 'text',
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: 'L3.3',
      title: 'Sign your card',
      description: 'Personalize your Routing Card with role-specific tier examples. Sign and date.',
      activityType: 'single-prompt',
      estimatedMinutes: 4,
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
          placeholder: 'Public: …\nInternal: …\nConfidential: …\nRestricted: …',
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
      description: "One-page personal reference. Four tiers, role-specific examples, five never-do's, signed and dated.",
      format: 'pdf+md',
      triggeredBy: 'L3.3',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/04-data-tier-routing-card.md',
    },
  ],
  forwardLinks: ['l4-member-talk'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-lite/module-L3-spec.md',
} as const;
