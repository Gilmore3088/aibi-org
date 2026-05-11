// Foundation Full — Module 20: Final Practitioner Lab (CERTIFYING ARTIFACT)
// NOTE: Activity Type 8 (real-world capture) deferred at v2 launch. Final Lab
// uses synthetic-but-realistic inputs only. The capture is the SUBMISSION
// PACKAGE, not the inputs. Once Type 8 ships, learners may optionally use
// sanitized real artifacts; until then, the synthetic path is the path.
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-20-spec.md

import type { FoundationModule } from '../types';

export const module20: FoundationModule = {
  number: 20,
  id: 'f20-final-lab',
  trackId: 'full',
  trackPosition: '20',
  title: 'Final Practitioner Lab',
  pillar: 'application',
  estimatedMinutes: 60,
  keyOutput: 'Final Practitioner Lab Package — certifying artifact',
  dailyUseOutcomes: [
    'A complete capstone package demonstrating practical judgment across all four pillars.',
    'A planted-error catch that proves the verification habit.',
    'A submitted Final Lab eligible for AiBI-Foundation Full certification.',
  ],
  activityTypes: ['build-test', 'find-flaw', 'multi-model'],
  whyThisExists: `The Final Lab is the gate. The learner is given a synthetic-but-realistic banking scenario containing planted errors, fabrications, and at least one regulatory-routing trap. They must:

1. Apply the right pattern from Modules 11-15.
2. Catch the planted errors using the verification habit from Module 2.
3. Route any regulatory question through Module 7's lens framework.
4. Document the work in a submission package using their Personal Prompt Library schema.

A passing Final Lab demonstrates practical judgment, not memorization. The bar is "would this work hold up to your manager's review next Tuesday." The lab is the bridge to the AiBI-Foundation Full credential and to Specialist enrollment.`,
  learningObjectives: [
    'Synthesize the four pillars on a single realistic scenario.',
    'Catch at least 5 of 6 planted errors in the scenario.',
    'Route any regulatory question through the correct lens with named First-Call.',
    'Submit a Final Lab Package documenting the work in schema format.',
  ],
  sections: [
    {
      id: 'f20-rubric',
      title: 'The rubric',
      content: `The Final Lab is graded against six dimensions, each weighted equally:

1. **Awareness.** Data-tier classification correct; never-do's respected; pre-flight check applied.
2. **Understanding.** Right tool for the right tier; right model for the right task; right lens for the right question.
3. **Creation.** Pattern from Modules 11-15 correctly applied; system prompt is schema-conformant.
4. **Application.** Library entry produced with all 18 fields; verification step real, not placeholder.
5. **Verification.** At least 5 of 6 planted errors caught.
6. **Documentation.** Submission package readable; reasoning traceable.

5/6 or higher across all dimensions = pass. Below that on any dimension = remediation. Remediation is structured, not punitive — re-read the relevant module, redo the relevant artifact, resubmit.`,
    },
    {
      id: 'f20-after-the-lab',
      title: 'What happens after a passing Lab',
      content: `**The credential.** AiBI-Foundation Full. Listed as *AiBI-Foundation · The AI Banking Institute* with the issue date and the cohort identifier.

**The library.** The learner's library now lives in the artifact store and refreshes quarterly. Manager-review links are issued.

**The Specialist door.** The learner becomes eligible for AiBI-Specialist enrollment in the role track that matches their work (Operations, Lending, Compliance, Finance, Retail). The Specialist track will inherit the learner's library as the seed of the Departmental Skill Library.

**The Manager Track door.** If the learner supervises others, they are eligible for the Manager Track once their direct reports begin Foundation Full.

The certificate is the visible artifact. The library is the durable one.`,
    },
  ],
  activities: [
    {
      id: '20.1',
      title: 'The synthetic scenario',
      description: 'A 4-page synthetic banking scenario with 6 planted errors (rotated quarterly). Read; identify; document.',
      activityType: 'find-flaw',
      estimatedMinutes: 25,
      fields: [
        {
          id: 'errors-found',
          label: 'List each error you caught and why it is wrong.',
          type: 'textarea',
          minLength: 300,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '20.2',
      title: 'Apply the right pattern',
      description: 'Pick the document or spreadsheet workflow that fits the scenario. Build the prompt. Stress-test across at least two models.',
      activityType: 'build-test',
      estimatedMinutes: 18,
      fields: [
        {
          id: 'pattern-used',
          label: 'Pattern + model + verification step.',
          type: 'textarea',
          minLength: 150,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '20.3',
      title: 'Submit the Final Lab Package',
      description: 'Compile errors-found, pattern-used, and library entry into the submission package. Submit for review.',
      activityType: 'build-test',
      estimatedMinutes: 17,
      fields: [
        {
          id: 'reasoning-summary',
          label: 'In one paragraph: walk a reviewer through your reasoning, naming the modules you drew on.',
          type: 'textarea',
          minLength: 200,
          required: true,
        },
        {
          id: 'self-assessment',
          label: 'Honest self-assessment: which of the six rubric dimensions is your weakest?',
          type: 'textarea',
          minLength: 60,
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '20-final-practitioner-lab-package',
    },
  ],
  artifacts: [
    {
      id: '20-final-practitioner-lab-package',
      title: 'Final Practitioner Lab Package',
      description: 'Certifying artifact. Demonstrates practical judgment across all four pillars. Submission triggers credential issuance on pass.',
      format: 'pdf+md',
      triggeredBy: '20.3',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/20-final-practitioner-lab-package.md',
    },
  ],
  dependencies: [
    'f2-what-ai-is',
    'f4-five-never-dos',
    'f7-regulatory-landscape',
    'f8-prompting',
    'f10-projects-context',
    'f11-document-workflows',
    'f15-vendor-pitch',
    'f17-prompt-library',
    'f18-incident-response',
    'f19-examiner-prep',
  ],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-20-spec.md',
} as const;
