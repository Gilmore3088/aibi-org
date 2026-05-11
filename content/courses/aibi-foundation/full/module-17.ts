// Foundation Full — Module 17: Personal Prompt Library
// THE SPINE ARTIFACT. The 18-field schema is the FIXED CONTRACT linking
// Foundation -> Specialist (Departmental Skill Library) -> Leader (bank-wide
// AI portfolio). Do not modify field names without coordinating across all
// three tiers.
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-17-spec.md

import type { FoundationModule } from '../types';

export const module17: FoundationModule = {
  number: 17,
  id: 'f17-prompt-library',
  trackId: 'full',
  trackPosition: '17',
  title: 'Personal Prompt Library',
  pillar: 'application',
  estimatedMinutes: 30,
  keyOutput: 'Personal Prompt Library — schema-conformant collection (spine artifact)',
  dailyUseOutcomes: [
    'A library of at least 5 tested prompts conforming to the 18-field schema.',
    'Forward-compatibility with the Specialist Departmental Skill Library.',
    'A documented record of which model handled which task best across your library.',
  ],
  activityTypes: ['build-test'],
  whyThisExists: `The Personal Prompt Library is the **spine artifact** of the Foundation curriculum and the contract that links Foundation, Specialist, and Leader. Every module before this one produced an artifact that *feeds* the library; Module 17 is where the library itself gets formalized.

The 18-field schema is fixed. Module 17 walks the learner through entering five real prompts in the format, stress-testing each across multiple models, and documenting the verification step. The output is examiner-defensible: every entry has a tested system prompt, a verification step, a pre-flight check, a last-tested date, and a quarterly-review date.`,
  learningObjectives: [
    'Convert your top-3 candidates and your Module 11-15 pattern work into schema-conformant library entries.',
    'Stress-test each entry across multiple models and capture the model-strength notes.',
    'Apply the pre-flight check to every entry before saving.',
    'Walk away with a library of 5+ entries ready to grow over the year.',
  ],
  sections: [
    {
      id: 'f17-schema',
      title: 'The 18-field schema (fixed contract)',
      content: `Every library entry has these fields, in this order, with these names:

| Field | Description |
|---|---|
| ID | Short reference (3 letters + 2 digits, e.g. MEM-01) |
| Name | What this prompt does |
| Task type | Drafting / summarizing / extracting / format-shifting / Q&A / workflow |
| Role | Who uses this |
| Frequency | How often it runs |
| Data tier | Public / Internal / Confidential / Restricted |
| Tool tier | Public AI / Copilot Chat / M365 Copilot / Approved Specialist |
| Tool | Specific tool name |
| Project | Linked project name |
| System prompt | Persistent instructions, paste verbatim |
| Sample input prompt | Example invocation |
| Sample output | Example good output |
| Verification step | How to check the result |
| Pre-flight check | Default: "All five questions" |
| Time saved per use | Honest estimate |
| Last tested | Date last verified |
| Quarterly review | Next scheduled review |
| Notes | Lessons from refinement; model-strength observations |

Missing fields are not optional. The schema is what makes the library examiner-defensible at the institution level when libraries roll up to Specialist (departmental) and Leader (bank-wide).`,
    },
    {
      id: 'f17-quarterly',
      title: 'The quarterly review ritual',
      content: `Every entry has a quarterly review date 90 days after creation. On that date the learner — or their manager, in the M2 Library Review — looks at:

- Did this prompt actually get used in the last quarter?
- Has the model behavior drifted? (Re-run the sample; compare to the saved sample output.)
- Is the data tier still right? (Tools change tiers. Vendor terms change.)
- Should this entry be retired, refined, or kept?

The review takes ten minutes per entry. Skipping the review is how libraries decay into a list of half-tested prompts no one remembers writing.`,
      tryThis: 'Take any prompt you used at work in the last week. Drop it into the 18-field schema by hand. The fields you cannot fill are the gaps; they will become real once you run the verification step.',
    },
  ],
  activities: [
    {
      id: '17.1',
      title: 'Build five library entries',
      description: 'Convert your top-3 candidates plus two more from Module 11-15 work into schema-conformant entries. Each must pass the pre-flight check.',
      activityType: 'build-test',
      estimatedMinutes: 24,
      fields: [
        {
          id: 'entry-count',
          label: 'How many entries did you complete?',
          type: 'radio',
          required: true,
          options: [
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5 (target)' },
            { value: '6+', label: '6 or more' },
          ],
        },
        {
          id: 'first-entry',
          label: 'Paste your first entry in full schema format (all 18 fields).',
          type: 'textarea',
          minLength: 400,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '17.2',
      title: 'Stress-test across models',
      description: 'For each entry, run the sample input through at least two models. Note divergence in the Notes field.',
      activityType: 'build-test',
      estimatedMinutes: 6,
      fields: [
        {
          id: 'model-notes',
          label: 'For your most-used entry: which model handled it best, and where did the others diverge?',
          type: 'textarea',
          minLength: 60,
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '17-personal-prompt-library',
    },
  ],
  artifacts: [
    {
      id: '17-personal-prompt-library',
      title: 'Personal Prompt Library',
      description: 'Schema-conformant collection of tested prompts. Forward-compatible with Specialist Departmental Skill Library and Leader bank-wide AI portfolio. Spine artifact.',
      format: 'pdf+md',
      triggeredBy: '17.2',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/17-personal-prompt-library.md',
    },
  ],
  dependencies: ['f8-prompting', 'f9-work-profile', 'f10-projects-context', 'f11-document-workflows', 'f12-spreadsheet-workflows', 'f13-tools-comparison', 'f16-role-cases'],
  forwardLinks: ['f20-final-lab', 'm2-library-review'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-17-spec.md',
} as const;
