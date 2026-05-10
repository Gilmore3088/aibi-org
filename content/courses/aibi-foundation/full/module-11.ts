// Foundation Full — Module 11: Document Workflows
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-11-spec.md

import type { FoundationModule } from '../types';

export const module11: FoundationModule = {
  number: 11,
  id: 'f11-document-workflows',
  trackId: 'full',
  trackPosition: '11',
  title: 'Document Workflows',
  pillar: 'creation',
  estimatedMinutes: 30,
  keyOutput: 'Document Workflow Prompt + model-strength notes',
  dailyUseOutcomes: [
    'A reusable prompt for the document task you do most often.',
    'Notes on which model handled summarize, extract, compare, format-shift, and grounded Q&A best.',
    'A verified habit of catching the planted hallucination in document outputs.',
  ],
  activityTypes: ['multi-model', 'build-test', 'find-flaw'],
  whyThisExists: `Most banker work involves documents — meeting transcripts, vendor contracts, regulatory bulletins, member correspondence, board packets. Module 11 covers the five reliable patterns for AI-assisted document work and trains the verification habit specific to document outputs (where hallucination most often hides as a subtly-fabricated detail).`,
  learningObjectives: [
    'Apply five document workflows: summarize, extract, compare, format-shift, grounded Q&A.',
    'Compare model strengths across document tasks and document the differences.',
    'Catch a planted hallucination in a structured extraction.',
    'Walk away with a Document Workflow Prompt for your most common document task.',
  ],
  sections: [
    {
      id: 'f11-five-workflows',
      title: 'The five document workflows',
      content: `1. **Summarize.** Long doc → shorter doc. Easy to do well; easy to do badly. The risk is the AI inserting a confident detail that was not in the source.

2. **Extract.** Unstructured text → structured data (table, list, fields). The most useful single AI workflow for community-bank operations.

3. **Compare.** Differences and similarities across two or more documents. Useful for vendor proposal evaluation, policy revision, regulatory bulletin comparison.

4. **Format-shift.** Same content, different format. Long form to bullet points, formal to plain language, English to a member's preferred reading level.

5. **Grounded Q&A.** Answer questions using only the attached document. The "only" is the discipline. The pattern fails when the AI quietly draws on its training data instead.

Each workflow has a different verification surface. Summarize: spot-check facts. Extract: verify each row against source. Compare: check for missed differences. Format-shift: ensure no content invented. Grounded Q&A: confirm the answer cites the source explicitly.`,
      tryThis: 'On the document you handle most often, pick the workflow that fits and run it through two models. Note which model fabricated less.',
    },
  ],
  activities: [
    {
      id: '11.1',
      title: 'Multi-model document summary',
      description: 'Sample 2-page meeting transcript (synthetic, no NPI). Same prompt to all three models. Compare. At least one model adds a fabricated detail (rotated quarterly).',
      activityType: 'multi-model',
      estimatedMinutes: 10,
      fields: [
        {
          id: 'planted-fab',
          label: 'Quote the fabricated detail you caught and the model that produced it.',
          type: 'textarea',
          minLength: 30,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '11.2',
      title: 'Structured extraction with verification',
      description: 'Same transcript. Extract action items table with source quotes. Each row has a Verify button revealing the source. One row contains a planted issue.',
      activityType: 'find-flaw',
      estimatedMinutes: 8,
      fields: [
        {
          id: 'flagged-row',
          label: 'Which row had the planted issue and what was wrong with it?',
          type: 'textarea',
          minLength: 30,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '11.3',
      title: 'Build your Document Workflow Prompt',
      description: 'Pick the document type from your Module 9 inventory. Draft the prompt. Stress-test against a synthetic example.',
      activityType: 'build-test',
      estimatedMinutes: 10,
      fields: [
        {
          id: 'doc-type',
          label: 'Document type from your inventory',
          type: 'text',
          required: true,
        },
        {
          id: 'workflow',
          label: 'Which of the five workflows fits?',
          type: 'select',
          required: true,
          options: [
            { value: 'summarize', label: 'Summarize' },
            { value: 'extract', label: 'Extract' },
            { value: 'compare', label: 'Compare' },
            { value: 'format-shift', label: 'Format-shift' },
            { value: 'grounded-qa', label: 'Grounded Q&A' },
          ],
        },
        {
          id: 'final-prompt',
          label: 'Final prompt + verification step.',
          type: 'textarea',
          minLength: 100,
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '11-document-workflow-prompt',
    },
  ],
  artifacts: [
    {
      id: '11-document-workflow-prompt',
      title: 'Document Workflow Prompt',
      description: 'Reusable doc-handling prompt with verification step for the document task you do most often.',
      format: 'pdf+md',
      triggeredBy: '11.3',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/11-document-workflow-prompt.md',
    },
  ],
  dependencies: ['f10-projects-context'],
  forwardLinks: ['f12-spreadsheet-workflows', 'f13-tools-comparison', 'f17-prompt-library'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-11-spec.md',
} as const;
