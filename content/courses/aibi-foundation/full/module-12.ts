// Foundation Full — Module 12: Spreadsheet Workflows (NEW in v2)
// Closes the v1 gap. Excel + AI hallucinates differently than text + AI.
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-12-spec.md

import type { FoundationModule } from '../types';

export const module12: FoundationModule = {
  number: 12,
  id: 'f12-spreadsheet-workflows',
  trackId: 'full',
  trackPosition: '12',
  title: 'Spreadsheet Workflows',
  pillar: 'creation',
  estimatedMinutes: 30,
  keyOutput: 'Three reusable Excel-AI patterns',
  dailyUseOutcomes: [
    'Three reusable Excel patterns: formula generation, narrative commentary, anomaly hunting.',
    'A documented false-positive catch from the anomaly lab.',
    'Notes on which model handles spreadsheet-grounded work best.',
  ],
  activityTypes: ['build-test', 'find-flaw'],
  whyThisExists: `Most banker analysis happens in spreadsheets — loan pipelines, ALCO scenarios, branch metrics, vendor comparisons, budgets, complaint logs. AI-for-Excel is its own skill set: formula generation, data analysis, chart creation, anomaly detection, narrative commentary.

Module 12 closes the v1 curriculum gap and gives the learner three concrete reusable patterns — every one of them with a planted error to catch, because Excel + AI hallucinates differently than text + AI. Wrong cell references, fabricated calculations, off-by-one indexing — these errors do not show up in text workflows.`,
  learningObjectives: [
    'Use AI to generate formulas and validate them against real data.',
    'Use AI to analyze a column of data and produce narrative commentary.',
    'Use AI to identify outliers, including the false positives AI is prone to.',
    'Catch AI errors specific to spreadsheet contexts (cell references, fabricated calculations).',
  ],
  sections: [
    {
      id: 'f12-excel-specific-errors',
      title: 'Why Excel + AI hallucinates differently',
      content: `Text hallucinations look like fabricated quotes or invented regulations. Spreadsheet hallucinations look like:

- **Wrong cell references.** Formula uses A2:A10 when the data is actually in B2:B11. Formula computes; answer is wrong by a column.
- **Fabricated row counts.** AI says "I analyzed all 50 rows" when it actually saw the first 25.
- **Off-by-one indexing.** Particularly common with quarterly or fiscal-year formulas where the AI got the boundary wrong.
- **Plausible-but-wrong calculations.** Weighted averages with the weights summing to something other than 1.0; ratios computed against the wrong denominator.

The verification habit for spreadsheet outputs is **paste the formula into a fresh cell, point it at known values, and check the answer manually**. Three minutes. Every formula. The habit is what stops bad numbers from reaching the board packet.`,
      tryThis: 'Take the most recent AI-generated formula you used. Type known values into a clean test row and verify by hand. If the formula passes, you keep using it. If not, you have just caught the kind of error that ends up in a regulator response.',
    },
  ],
  activities: [
    {
      id: '12.1',
      title: 'Formula generation lab',
      description: 'Three Excel formula tasks. AI drafts; you verify by pasting into the platform spreadsheet preview. Wrong formulas highlight the issue.',
      activityType: 'build-test',
      estimatedMinutes: 8,
      fields: [
        {
          id: 'formulas',
          label: 'Final three working formulas with notes on what AI got right or wrong.',
          type: 'textarea',
          minLength: 100,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '12.2',
      title: 'Narrative commentary lab',
      description: 'Pick a real reporting task. Build a prompt with role, context, and constraints. Send to all three models in parallel. Pick the best draft.',
      activityType: 'build-test',
      estimatedMinutes: 10,
      fields: [
        {
          id: 'task-type',
          label: 'Reporting task',
          type: 'select',
          required: true,
          options: [
            { value: 'monthly-variance', label: 'Monthly variance commentary' },
            { value: 'alco', label: 'ALCO scenario narrative' },
            { value: 'branch-dashboard', label: 'Branch dashboard explanation' },
            { value: 'pipeline', label: 'Pipeline summary' },
            { value: 'vendor-comparison', label: 'Vendor comparison narrative' },
          ],
        },
        {
          id: 'final-draft-source',
          label: 'Which model produced the draft you went with?',
          type: 'radio',
          required: true,
          options: [
            { value: 'claude', label: 'Claude' },
            { value: 'chatgpt', label: 'ChatGPT' },
            { value: 'gemini', label: 'Gemini' },
            { value: 'merged', label: 'Merged from two or more' },
          ],
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '12.3',
      title: 'Anomaly hunt with planted error',
      description: '50-row synthetic transaction summary. AI flags 4-6 items. Verify each. Two are real, at least one is a false positive.',
      activityType: 'find-flaw',
      estimatedMinutes: 10,
      fields: [
        {
          id: 'real-anomalies',
          label: 'Real anomalies you confirmed.',
          type: 'textarea',
          minLength: 60,
          required: true,
        },
        {
          id: 'false-positive',
          label: 'The false positive you caught — and why AI saw a pattern that was not there.',
          type: 'textarea',
          minLength: 60,
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '12-spreadsheet-ai-patterns',
    },
  ],
  artifacts: [
    {
      id: '12-spreadsheet-ai-patterns',
      title: 'Spreadsheet / AI Patterns',
      description: 'Three reusable Excel + AI patterns: formula generation, narrative commentary, anomaly hunting.',
      format: 'pdf+md',
      triggeredBy: '12.3',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/12-spreadsheet-ai-patterns.md',
    },
  ],
  dependencies: ['f8-prompting', 'f11-document-workflows'],
  forwardLinks: ['f13-tools-comparison', 'f14-agents', 'f16-role-cases', 'f17-prompt-library'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-12-spec.md',
} as const;
