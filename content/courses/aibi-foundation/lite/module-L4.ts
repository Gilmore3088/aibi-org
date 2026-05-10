// Foundation Lite — Module L4: Talking to Members + Recognizing AI Threats
// EDITORIAL: voice-clone / deepfake elements deferred per 2026-05-09 decision.
// L4 ships text-only — three member conversations only. The voice-verification
// activity in the source spec is removed at launch.
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-lite/module-L4-spec.md

import type { FoundationModule } from '../types';

export const moduleL4: FoundationModule = {
  number: 4,
  id: 'l4-member-talk',
  trackId: 'lite',
  trackPosition: 'L4',
  title: 'Talking to Members About AI',
  estimatedMinutes: 25,
  keyOutput: 'Three Member Conversation Quick-Cards',
  dailyUseOutcomes: [
    'Three printed Quick-Cards covering the three most common member-AI questions.',
    'Confidence answering "are you using AI on my account?" without improvising.',
  ],
  activityTypes: ['adaptive-scenario', 'single-prompt'],
  whyThisExists: `Members are starting to ask "is your bank using AI on my account?" and "did AI write this letter?" Today, front-line staff improvise answers. Tomorrow, those improvised answers are grounds for complaint, exit, or bad press.

L4 gives every employee three rehearsed-but-not-canned scripts they can deliver in their own voice. The scripts come from the same five-question source set as Foundation Full Module 6; Lite uses three of the five (the other two are reserved for Full because they require more nuance around regulatory disclosure).`,
  learningObjectives: [
    'Deliver an honest, member-respectful answer to three common AI questions.',
    'Recognize when a member question is actually a privacy-event escalation.',
    'Distinguish AI-assisted work from AI-decided work in member-facing language.',
  ],
  sections: [
    {
      id: 'l4-honesty',
      title: 'Honesty wins; defensiveness loses',
      content: `Members asking about AI are not trying to trap you. They are trying to figure out whether the bank still feels like the bank they trust. The wrong answer is not "yes" or "no." The wrong answer is *defensive*.

Three patterns drive every good answer:

1. **Be honest about what AI does at the bank.** It drafts. It summarizes. It flags. It does not decide.
2. **Confirm the human in the loop.** Every member-affecting decision carries a human signature.
3. **Open the door for follow-up.** "If anything ever feels off about a communication you got, call me. We will look at it together."

The script in your head is shorter than you think. The hard part is not the words — it is the willingness to say them in a real moment without sounding rehearsed.`,
      tryThis: 'In your next two member interactions, mention "we use AI to help draft, never to decide" naturally — even if no one asked. The reps that build comfort happen before the question gets asked.',
    },
  ],
  activities: [
    {
      id: 'L4.1',
      title: 'Three member conversations',
      description: 'Three branching dialogues. Each conversation has a best path and one or two wrong paths. The platform shows the consequence of each pick before letting you continue.',
      activityType: 'adaptive-scenario',
      estimatedMinutes: 15,
      fields: [
        {
          id: 'conversation-1',
          label: '"Are you using AI on my account?" — your three-sentence answer.',
          type: 'textarea',
          minLength: 60,
          required: true,
        },
        {
          id: 'conversation-2',
          label: '"I do not want any AI making decisions about me." — your reassurance.',
          type: 'textarea',
          minLength: 60,
          required: true,
        },
        {
          id: 'conversation-3',
          label: '"I think you used AI on the wrong account." — your next three steps.',
          type: 'textarea',
          minLength: 60,
          required: true,
          placeholder: 'Note: this scenario is the one most likely to be a privacy event. Document, do not improvise.',
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: 'L4-member-conversation-quickcards',
    },
    {
      id: 'L4.2',
      title: 'Customize for your voice',
      description: 'AI refines your three answers into your role-specific voice. Each card should land in under 75 words.',
      activityType: 'single-prompt',
      estimatedMinutes: 8,
      fields: [
        {
          id: 'voice-cue',
          label: 'Two adjectives describing how you sound to members on a good day.',
          type: 'text',
          required: true,
          placeholder: 'e.g. plainspoken and warm',
        },
      ],
      completionTrigger: 'save-response',
    },
  ],
  artifacts: [
    {
      id: 'L4-member-conversation-quickcards',
      title: 'Member Conversation Quick-Cards',
      description: 'Three pocket cards with rehearsed answers to the most common AI questions members ask front-line staff.',
      format: 'pdf+md',
      triggeredBy: 'L4.1',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/L4-member-conversation-quickcards.md',
    },
  ],
  dependencies: ['l3-five-never-dos'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-lite/module-L4-spec.md',
} as const;
