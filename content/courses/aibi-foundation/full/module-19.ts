// Foundation Full — Module 19: Examiner Q&A Practice (NEW in v2)
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-19-spec.md

import type { FoundationModule } from '../types';

export const module19: FoundationModule = {
  number: 19,
  id: 'f19-examiner-prep',
  trackId: 'full',
  trackPosition: '19',
  title: 'Examiner Q&A Practice',
  pillar: 'application',
  estimatedMinutes: 20,
  keyOutput: 'Examiner Q&A Prep Card',
  dailyUseOutcomes: [
    'Five examiner questions answered with the backing artifacts named.',
    'A practiced ability to answer "what is your AI training program?" without scrambling.',
    'A bridge from learner artifacts to institutional defensibility.',
  ],
  activityTypes: ['adaptive-scenario'],
  whyThisExists: `Examiners have started asking about AI programs. The questions are not gotchas; they are predictable. Module 19 walks the learner through the five most common examiner questions and trains them to answer with the specific artifact references that turn answers into evidence.

This module is also the dress rehearsal for the bank's AI program owner. A learner who has practiced these questions can step into a tabletop with their compliance officer or model-risk owner and play out the conversation cleanly.`,
  learningObjectives: [
    'Answer five common examiner questions with named backing artifacts.',
    'Recognize when an examiner question is actually about governance versus operations.',
    'Practice the answer cadence: claim, source, follow-up.',
    'Walk away with an Examiner Q&A Prep Card that fits in a binder pocket.',
  ],
  sections: [
    {
      id: 'f19-five-questions',
      title: 'The five questions to be ready for',
      content: `1. **Tell me about your AI training program.** Answer pattern: name the credential ladder, name the modules, name the artifacts each employee produces. Reference: AiBI-Foundation curriculum + bank's deployment record.

2. **Show me your AI use-case inventory.** Answer pattern: confirm it exists, when it was last updated, who owns it. Reference: bank's central inventory document.

3. **How do you handle NPI in AI tools?** Answer pattern: data tier framework + tool tier framework + the never-do's + the pre-flight check. Reference: Data-Tier Routing Card (every employee has one).

4. **What happens when AI is wrong?** Answer pattern: verification habit + Hallucination Catch Log + Incident Response Checklist + after-action reviews. Reference: M2 (Cybersecurity) and M18 (IR Drill) artifacts.

5. **Who owns AI governance at your bank?** Answer pattern: name the AI program owner, the compliance officer, the model risk owner. Reference: First-Call List.

The pattern is consistent: claim, source, follow-up. The follow-up is what shows the program is alive — *"the inventory was updated last month and the next quarterly review is on the calendar for July 15."*`,
      tryThis: 'Without looking, name the artifact that answers each of the five questions. Where you cannot, the artifact either does not exist yet or is not yet examiner-defensible.',
    },
  ],
  activities: [
    {
      id: '19.1',
      title: 'Five examiner scenarios',
      description: 'Branching dialogue with a simulated examiner. Five questions, five exchanges each. Best path requires naming the backing artifact every time.',
      activityType: 'adaptive-scenario',
      estimatedMinutes: 15,
      fields: [
        {
          id: 'answers',
          label: 'For each of the five questions: your answer + the artifact you referenced.',
          type: 'textarea',
          minLength: 250,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '19.2',
      title: 'Build your Examiner Q&A Prep Card',
      description: 'Personalized card with your bank\'s named owners and the artifacts they would point to. Prepared for the next exam cycle.',
      activityType: 'adaptive-scenario',
      estimatedMinutes: 5,
      fields: [
        {
          id: 'owners',
          label: 'Named owners for the five answer patterns.',
          type: 'textarea',
          minLength: 100,
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '19-examiner-qa-prep-card',
    },
  ],
  artifacts: [
    {
      id: '19-examiner-qa-prep-card',
      title: 'Examiner Q&A Prep Card',
      description: 'Five questions with backing artifacts named. Sized for a binder pocket. Refresh quarterly.',
      format: 'pdf+md',
      triggeredBy: '19.2',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/19-examiner-qa-prep-card.md',
    },
  ],
  dependencies: ['f6-talking-with-members', 'f7-regulatory-landscape', 'f17-prompt-library', 'f18-incident-response'],
  forwardLinks: ['f20-final-lab', 'bb1-vocabulary'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-19-spec.md',
} as const;
