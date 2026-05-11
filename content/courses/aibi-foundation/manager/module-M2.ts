// Manager Track — Module M2: Reading and Reviewing a Personal Prompt Library
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/manager-track/module-M2-spec.md

import type { FoundationModule } from '../types';

export const moduleM2: FoundationModule = {
  number: 2,
  id: 'm2-library-review',
  trackId: 'manager',
  trackPosition: 'M2',
  title: 'Reading and Reviewing a Personal Prompt Library',
  estimatedMinutes: 30,
  keyOutput: 'Library Review Worksheet — 10-minute review template per direct report',
  dailyUseOutcomes: [
    'A 10-minute review ritual that fits in any 1:1 cadence.',
    "A worksheet that turns each library entry into 'keep, fix, or retire'.",
  ],
  activityTypes: ['find-flaw', 'single-prompt'],
  whyThisExists: `The Personal Prompt Library is the spine artifact of Foundation Full. Every library entry is supposed to follow the 18-field schema and be tested against real work. In practice, libraries decay. Entries get added, never reviewed, and eventually become a list of half-tested prompts the report cannot remember why they made.

M2 gives the manager a 10-minute review ritual. They look at the library against three filters: schema compliance, evidence of testing, and current use. Each entry gets a verdict — keep, fix, or retire. The worksheet captures the verdicts so the conversation with the report stays specific.`,
  learningObjectives: [
    'Read a Personal Prompt Library and identify schema violations.',
    'Distinguish a library entry that has been tested from one that has not.',
    'Triage entries into keep, fix, or retire.',
    'Walk away with a reusable Library Review Worksheet.',
  ],
  sections: [
    {
      id: 'm2-three-filters',
      title: 'The three filters',
      content: `**Schema.** The library entry has an ID, name, task type, role, frequency, data tier, tool tier, tool, project, system prompt, sample input, sample output, verification step, pre-flight check, time saved per use, last tested date, quarterly review date, and notes. Missing fields are not optional. The schema exists because Foundation, Specialist, and Leader artifacts roll up against it. A library entry without a data-tier field cannot be promoted to the departmental library.

**Evidence of testing.** *Last tested* must have a real date within the last 90 days. The sample output field must contain a real output, not a placeholder. The verification step must reference how the report checks the result — *I cross-reference against the loan policy* is a verification; *I check it* is not.

**Current use.** *Frequency* should match reality. An entry tagged "weekly" that has not been invoked in two months is either a retired use case (delete it) or a workflow gap (the report is doing the task another way; ask why).`,
    },
    {
      id: 'm2-tone',
      title: 'How to give the verdict',
      content: `Each entry gets one of three verdicts: **keep**, **fix**, **retire**.

*Keep* needs no commentary. *Fix* needs the specific schema field or the specific test that is missing. *Retire* needs a thank-you and a quick read of *why this happened* — usually a workflow that changed, sometimes a tool that did not deliver, occasionally a use case that turned out not to need AI.

The conversation stays inside the library. It is not a performance review. It is not a coaching of judgment. It is a 10-minute look at one artifact, with three verdicts, in the same way a senior loan officer might look at a junior officer's pipeline.`,
      tryThis: "Pull your own Foundation Full library (or your reports' if you have one available). Run the three filters on the first three entries before doing it as an exercise. The honest read is the one you do on yourself first.",
    },
  ],
  activities: [
    {
      id: 'M2.1',
      title: 'Read a sample library, find the schema violations',
      description: 'A synthetic 8-entry Personal Prompt Library, three with schema violations and one with a stale last-tested date. Highlight what is wrong in each entry; the platform reveals which violations matter most.',
      activityType: 'find-flaw',
      estimatedMinutes: 18,
      fields: [
        {
          id: 'violations',
          label: 'For each entry you flagged, name the field or condition that failed.',
          type: 'textarea',
          minLength: 60,
          required: true,
          placeholder: 'Entry MEM-03: missing data tier field; tool tier is "M365 Copilot" which conflicts with sample input that contains member account numbers (Restricted)…',
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: 'M2.2',
      title: 'Build your Library Review Worksheet',
      description: 'Assemble the 10-minute review checklist into a worksheet you will use in your next 1:1. The platform tailors the rubric to your team size and review cadence.',
      activityType: 'single-prompt',
      estimatedMinutes: 12,
      fields: [
        {
          id: 'team-size',
          label: 'How many direct reports use AI for work?',
          type: 'text',
          required: true,
        },
        {
          id: 'cadence',
          label: '1:1 cadence',
          type: 'select',
          required: true,
          options: [
            { value: 'weekly', label: 'Weekly' },
            { value: 'biweekly', label: 'Every other week' },
            { value: 'monthly', label: 'Monthly' },
          ],
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: 'M2-library-review-worksheet',
    },
  ],
  artifacts: [
    {
      id: 'M2-library-review-worksheet',
      title: 'Library Review Worksheet',
      description: '10-minute review template per direct report. Schema compliance, evidence of testing, current use — keep, fix, or retire each entry.',
      format: 'pdf+md',
      triggeredBy: 'M2.2',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/M2-library-review-worksheet.md',
    },
  ],
  dependencies: ['m1-coaching-team-ai'],
  forwardLinks: ['m3-spotting-misuse'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/manager-track/module-M2-spec.md',
} as const;
