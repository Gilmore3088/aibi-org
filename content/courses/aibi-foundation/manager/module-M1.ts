// Manager Track — Module M1: Coaching Your Team's AI Use
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/manager-track/module-M1-spec.md

import type { FoundationModule } from '../types';

export const moduleM1: FoundationModule = {
  number: 1,
  id: 'm1-coaching-team-ai',
  trackId: 'manager',
  trackPosition: 'M1',
  title: "Coaching Your Team's AI Use",
  estimatedMinutes: 30,
  keyOutput: 'Coaching Conversation Pack — five starter conversations',
  dailyUseOutcomes: [
    'A printed Coaching Conversation Pack covering the five most common 1:1 AI scenarios.',
    "An honest read on the difference between coaching and policing in your team's AI rollout.",
  ],
  activityTypes: ['adaptive-scenario', 'single-prompt'],
  whyThisExists: `Foundation teaches the individual. The supervisor is invisible in the Foundation curriculum. That is a gap because adoption fails when managers do not know how to manage it.

M1 gives the manager realistic 1:1 coaching scenarios — the conversations they will actually have with their team about AI use — and produces a Coaching Conversation Pack the manager keeps. The five scenarios cover the patterns that come up first in any deployment: the graduate who is not applying it, the over-user, the shadow-AI user, the skeptic, and the near-miss disclosure.`,
  learningObjectives: [
    'Coach a direct report through five common AI-related conversations.',
    'Distinguish coaching from policing.',
    'Recognize the signs of overuse, underuse, or misuse.',
    'Walk away with a Coaching Conversation Pack ready for use.',
  ],
  sections: [
    {
      id: 'm1-coaching-vs-policing',
      title: 'Coaching versus policing',
      content: `The single biggest manager mistake in an AI rollout is treating every gap as a violation. The graduate who is not using their library has a different problem from the report pasting member data into ChatGPT. Both deserve a conversation. Only one deserves an escalation.

Coaching opens the conversation with curiosity: *what is showing up in your work?* Policing opens with judgment: *you are not using what you learned.* The first invites a real answer. The second guarantees a defensive one.

Apply policing only when a never-do has been broken or a Restricted-tier artifact has crossed a tool boundary. Everything else is coaching — a 1:1, an open question, an offer to look at the work together.`,
    },
    {
      id: 'm1-near-miss',
      title: 'Reward the near-miss disclosure',
      content: `The most valuable signal a manager can get is a direct report saying *I almost pasted member info into ChatGPT last week, and stopped.* The temptation is to escalate. The better instinct is to thank them.

Punishing the disclosure ends future disclosures. The next near-miss happens silently. The one after that is the one you read about in the audit report.

Document the near-miss. Surface the workflow gap that led to it (the report was reaching for ChatGPT because the approved tool did not handle the task — that is on the tool, not the person). Refresh the never-do's at the next team huddle. Move on.`,
      tryThis: 'At your next 1:1, ask: "what almost-mistake have you caught yourself making with AI in the last month?" If the answer is "none," your report does not yet trust the question.',
    },
  ],
  activities: [
    {
      id: 'M1.1',
      title: 'Five coaching scenarios',
      description: '1:1 role-play across the five most common patterns: the under-user, the over-user, the shadow-AI user, the skeptic, the near-miss disclosure. Each conversation has 3-4 exchanges; platform shows the rubric and the best path after the run.',
      activityType: 'adaptive-scenario',
      estimatedMinutes: 24,
      fields: [
        {
          id: 'scenario-record',
          label: 'Branching choices and outcomes (auto-recorded by the platform)',
          type: 'text',
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: 'M1.2',
      title: 'Build your Coaching Conversation Pack',
      description: 'AI drafts the five conversation starters in your voice. You edit. The pack becomes a personal reference for the next time the scenario comes up.',
      activityType: 'single-prompt',
      estimatedMinutes: 5,
      fields: [
        {
          id: 'team-context',
          label: 'One sentence about your team — size, role mix, AI fluency level today.',
          type: 'textarea',
          minLength: 30,
          required: true,
        },
        {
          id: 'voice-cue',
          label: 'How do you sound on a good day? Two adjectives.',
          type: 'text',
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: 'M1-coaching-conversation-pack',
    },
  ],
  artifacts: [
    {
      id: 'M1-coaching-conversation-pack',
      title: 'Coaching Conversation Pack',
      description: 'Five starter conversations for the patterns every manager hits in the first 90 days of an AI rollout. Personalized to your team and your voice.',
      format: 'pdf+md',
      triggeredBy: 'M1.2',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/M1-coaching-conversation-pack.md',
    },
  ],
  forwardLinks: ['m2-library-review'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/manager-track/module-M1-spec.md',
} as const;
