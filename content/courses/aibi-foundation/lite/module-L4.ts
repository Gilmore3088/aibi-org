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
      description: 'A member walks up to your station and asks about AI. Pick how you respond. Each choice consequences forward. Wrong paths show what would happen; the right path lands honestly.',
      activityType: 'adaptive-scenario',
      estimatedMinutes: 15,
      fields: [
        {
          id: 'conversation-1',
          label: 'After the scenario: in your own words, what is the three-sentence answer to "are you using AI on my account?"',
          type: 'textarea',
          minLength: 60,
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: 'L4-member-conversation-quickcards',
      scenarioConfig: {
        intro:
          'A long-time deposit member, Margaret, walks up to your window with a printed letter from the bank. She is polite but pointed.',
        startNodeId: 'q1-open',
        nodes: [
          {
            id: 'q1-open',
            speaker: 'Margaret (member)',
            prompt:
              '"I got this letter about a service change, and the wording sounded… off. Are you using AI on my account?"',
            choices: [
              {
                id: 'q1-honest',
                label: '"We use AI to help draft communications, but a person reviews and signs every member-affecting decision. Want me to walk through what that means for your account?"',
                nextNodeId: 'q1-honest-followup',
                verdict: 'best',
              },
              {
                id: 'q1-deny',
                label: '"No, we do not use AI here."',
                nextNodeId: 'q1-deny-consequence',
                verdict: 'wrong',
                consequence:
                  'This is not true — the bank uses AI in drafting and summarization. Denying it now means a harder conversation later when the member finds out, and could become a UDAAP issue. Better to be honest about scope.',
              },
              {
                id: 'q1-deflect',
                label: '"I am not sure, let me get someone else."',
                nextNodeId: 'q1-deflect-consequence',
                verdict: 'partial',
                consequence:
                  'Not wrong, but you missed the moment. Members ask AI questions at the front line because they trust their banker. Punting can read as evasion. Better to be ready with a three-sentence answer.',
              },
            ],
          },
          {
            id: 'q1-honest-followup',
            speaker: 'Margaret',
            prompt:
              '"Okay. So a person actually saw this letter before it went out?"',
            choices: [
              {
                id: 'q1a-confirm-and-offer',
                label: '"Yes — every member-facing communication is reviewed and signed by a human before it goes out. If anything ever feels off about a letter you receive, please call me directly and we will look at it together."',
                nextNodeId: 'q2-open',
                verdict: 'best',
              },
              {
                id: 'q1a-overshare',
                label: '"Well, mostly. Sometimes things go out automatically if they are routine."',
                nextNodeId: 'q1a-overshare-consequence',
                verdict: 'wrong',
                consequence:
                  '"Mostly" undermines the trust statement. The bank has a policy: human review on member-affecting communications. If your branch is doing something different, that is itself an issue to escalate — not to disclose to the member as if it were the policy.',
              },
            ],
          },
          {
            id: 'q1-deny-consequence',
            // Branch terminus from a wrong path that nonetheless continues
            speaker: 'Margaret',
            prompt:
              'Margaret takes the letter back and says: "Are you sure?" The conversation has cooled.',
            choices: [
              {
                id: 'q1-deny-recover',
                label: '"Actually, let me correct myself — we do use AI in drafting communications, with a human review on every member-facing piece. I should have said that more clearly."',
                nextNodeId: 'q2-open',
                verdict: 'partial',
              },
              {
                id: 'q1-deny-double-down',
                label: '"I am sure."',
                nextNodeId: 'q1-end-bad',
                verdict: 'catastrophic',
              },
            ],
          },
          {
            id: 'q1-deflect-consequence',
            speaker: 'Margaret',
            prompt:
              'You step away to get the manager. Margaret waits, glancing at the letter again. You return with the manager.',
            choices: [
              {
                id: 'q1-deflect-recover',
                label:
                  'Listen as the manager handles it. After the conversation, ask the manager for a script you can use next time.',
                nextNodeId: 'q2-open',
                verdict: 'partial',
              },
            ],
          },
          {
            id: 'q1a-overshare-consequence',
            speaker: 'Margaret',
            prompt:
              '"So letters can go out without anyone reading them?" Her tone has changed.',
            choices: [
              {
                id: 'q1a-recover',
                label:
                  '"Let me clarify. The policy is that member-affecting communications get human review. I misspoke about exceptions. I am going to flag your concern with my manager today."',
                nextNodeId: 'q2-open',
                verdict: 'partial',
              },
            ],
          },
          {
            id: 'q2-open',
            speaker: 'Margaret',
            prompt:
              '"One more thing. I do not want any AI making decisions about me. Can you make sure of that?"',
            choices: [
              {
                id: 'q2-clarify',
                label:
                  '"AI assists us with drafting and summarizing. Decisions that affect you — credit, account changes, dispute resolution — those always carry a human signature. Let me document your preference so we have it on file."',
                nextNodeId: 'q3-open',
                verdict: 'best',
              },
              {
                id: 'q2-promise-too-much',
                label:
                  '"Absolutely — no AI will ever touch your account in any way."',
                nextNodeId: 'q2-promise-consequence',
                verdict: 'wrong',
                consequence:
                  'You cannot promise this. AI assists in many back-office functions. The honest framing is "AI assists, humans decide."',
              },
            ],
          },
          {
            id: 'q2-promise-consequence',
            speaker: 'Margaret',
            prompt:
              '"Wonderful." Margaret leaves satisfied — but you just made a promise the bank cannot keep.',
            choices: [
              {
                id: 'q2-recover',
                label: 'After she leaves, document the conversation accurately and note the over-promise so compliance can flag it.',
                nextNodeId: 'q3-open',
                verdict: 'partial',
              },
            ],
          },
          {
            id: 'q3-open',
            speaker: 'Margaret',
            prompt:
              '"Actually — I think you used AI on the wrong account a few weeks ago. The auto-pay on my CD got reset and the letter mentioned my checking. That should not have happened."',
            choices: [
              {
                id: 'q3-document',
                label:
                  '"I want to take this seriously. Can you tell me the date and what specifically you noticed? I am writing this down. I will personally look into it and have someone from compliance follow up with you within two business days."',
                nextNodeId: 'q3-end-good',
                verdict: 'best',
              },
              {
                id: 'q3-improvise',
                label:
                  '"That is probably just a system thing. Let me reset it for you now."',
                nextNodeId: 'q3-end-bad',
                verdict: 'catastrophic',
                consequence:
                  'A member-reported error involving AI handling of NPI is a potential GLBA / privacy event. Improvising a fix loses the record and may violate notification obligations. The right move is document, escalate to compliance, follow up.',
              },
            ],
          },
          {
            id: 'q3-end-good',
            speaker: 'Narrator',
            prompt:
              'Margaret thanks you and leaves. You document the conversation, escalate to compliance the same day, and follow up with her within 48 hours. The bank treats it as a near-miss and reviews the workflow.',
            endingVerdict: 'best',
            endingRubric:
              'Best path. You stayed honest about what AI does at the bank, confirmed human review where required, documented the third question as a potential incident, and escalated to compliance. The Quick-Cards you produce next will sound like this.',
          },
          {
            id: 'q3-end-bad',
            speaker: 'Narrator',
            prompt:
              'Margaret leaves. The auto-pay gets reset; the original concern is undocumented. Two weeks later she files a complaint and the bank does not have a record of the conversation.',
            endingVerdict: 'catastrophic',
            endingRubric:
              'Wrong path. The third question — "I think you used AI on the wrong account" — is the one most likely to be a real privacy event. The right move is always document, do not improvise. This is the bridge to incident response in Foundation Full M18.',
          },
          {
            id: 'q1-end-bad',
            speaker: 'Narrator',
            prompt:
              'Margaret leaves with the letter, unsatisfied. She mentions the conversation to a relative who works at a regulator.',
            endingVerdict: 'catastrophic',
            endingRubric:
              'Wrong path. Doubling down on a denial that is not true sets up a much larger problem later. Member-facing AI questions deserve honest, scoped answers — every time.',
          },
        ],
        bestPathHint:
          'The pattern across all three: be honest about what AI does at the bank, confirm human-in-the-loop, open the door for follow-up. Question three is special — document, do not improvise.',
      },
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
