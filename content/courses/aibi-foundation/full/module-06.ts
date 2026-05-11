// Foundation Full — Module 6: Talking About AI With Members
// Five branching dialogues — net-new module in v2.
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-06-spec.md

import type { FoundationModule } from '../types';

export const module06: FoundationModule = {
  number: 6,
  id: 'f6-talking-with-members',
  trackId: 'full',
  trackPosition: '6',
  title: 'Talking About AI With Members',
  pillar: 'understanding',
  estimatedMinutes: 20,
  keyOutput: 'Five Member-Conversation Script Cards',
  dailyUseOutcomes: [
    'Five rehearsed-but-personal conversation cards for the questions members are starting to ask.',
    'The ability to deliver an honest answer without sounding scripted.',
  ],
  activityTypes: ['adaptive-scenario', 'single-prompt'],
  whyThisExists: `Members are starting to ask "is your bank using AI on my account?" and "did AI write this letter?" Today, front-line staff improvise answers. Tomorrow, those improvised answers are grounds for complaint, exit, or bad press.

Module 6 gives every employee five rehearsed-but-not-canned scripts they can deliver in their own voice. The fifth scenario — *"I think you used AI on the wrong account"* — is the bridge to incident response in Module 18 because it is most likely to be a privacy event in disguise.`,
  learningObjectives: [
    'Deliver an honest, member-respectful answer to five common AI questions.',
    'Recognize when a member question is actually a privacy-event escalation.',
    'Distinguish AI-assisted work from AI-decided work in member-facing language.',
    'Walk away with five Script Cards in your own voice, sized for a name-badge clip.',
  ],
  sections: [
    {
      id: 'f6-three-patterns',
      title: 'Three patterns drive every good answer',
      content: `**Be honest about what AI does at the bank.** It drafts. It summarizes. It flags. It does not decide.

**Confirm the human in the loop.** Every member-affecting decision carries a human signature.

**Open the door for follow-up.** "If anything ever feels off about a communication you got, call me. We will look at it together."

The script in your head is shorter than you think. The hard part is not the words — it is the willingness to say them in a real moment without sounding rehearsed.`,
      tryThis: 'In your next two member interactions, mention "we use AI to help draft, never to decide" naturally — even if no one asked. The reps that build comfort happen before the question gets asked.',
    },
    {
      id: 'f6-fifth-scenario',
      title: 'When a member question is actually an incident',
      content: `Scenario five — *"I think you used AI on the wrong account"* — is different from the others. It might be a misunderstanding. It might be a real privacy event subject to GLBA notification analysis.

The right response is not a script. It is **document, do not improvise**. Take the member's account number, the specific item they are concerned about, and the time they noticed. Note that you will look into it personally. Escalate to compliance the same day.

The other four scenarios are conversations. The fifth is the start of an incident response. Recognizing the difference is the skill the module builds.`,
    },
  ],
  activities: [
    {
      id: '6.1',
      title: 'The five member conversations',
      description: 'Five branching dialogues. Each conversation has a best path; wrong picks branch to consequences. Platform shows rubric at the end.',
      activityType: 'adaptive-scenario',
      estimatedMinutes: 15,
      fields: [
        {
          id: 'q1',
          label: '"Are you using AI on my account?" — your three-sentence answer.',
          type: 'textarea',
          minLength: 60,
          required: true,
        },
        {
          id: 'q2',
          label: '"Did AI write this letter?" — your acknowledgment + reassurance.',
          type: 'textarea',
          minLength: 60,
          required: true,
        },
        {
          id: 'q3',
          label: '"I do not want any AI making decisions about me." — clarify and document the preference.',
          type: 'textarea',
          minLength: 60,
          required: true,
        },
        {
          id: 'q4',
          label: '"My friend\'s bank uses AI for loans. Do you?" — explain practice without disparaging peers.',
          type: 'textarea',
          minLength: 60,
          required: true,
        },
        {
          id: 'q5',
          label: '"I think you used AI on the wrong account." — your next three steps (document; escalate to compliance; follow up with member).',
          type: 'textarea',
          minLength: 80,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '6.2',
      title: 'Customize for your voice',
      description: 'AI refines your answers in your role-specific voice. Each script lands under 75 words.',
      activityType: 'single-prompt',
      estimatedMinutes: 4,
      fields: [
        {
          id: 'voice',
          label: 'Two adjectives describing how you sound to members on a good day.',
          type: 'text',
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '06-member-conversation-script-cards',
    },
  ],
  artifacts: [
    {
      id: '06-member-conversation-script-cards',
      title: 'Member-Conversation Script Cards',
      description: 'Five pocket-sized cards covering the most common AI questions members ask front-line staff.',
      format: 'pdf+md',
      triggeredBy: '6.2',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/06-member-conversation-script-cards.md',
    },
  ],
  dependencies: ['f5-cybersecurity'],
  forwardLinks: ['f18-incident-response', 'f19-examiner-prep', 'm1-coaching-team-ai'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-06-spec.md',
} as const;
