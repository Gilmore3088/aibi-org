// Foundation Full — Module 2: What AI Is and Is Not
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-02-spec.md

import type { FoundationModule } from '../types';

export const module02: FoundationModule = {
  number: 2,
  id: 'f2-what-ai-is',
  trackId: 'full',
  trackPosition: '2',
  title: 'What AI Is and Is Not',
  pillar: 'awareness',
  estimatedMinutes: 25,
  keyOutput: 'Hallucination Catch Log + AI Claim Review reference card',
  dailyUseOutcomes: [
    'A Hallucination Catch Log entry with the exact wording the AI fabricated.',
    'A five-point AI Claim Review reference card the learner uses on the next AI output.',
  ],
  activityTypes: ['find-flaw', 'multi-model', 'single-prompt'],
  whyThisExists: `Calibrate trust. The single most important calibration a banker can do in their first hour with AI is to *trigger a hallucination on demand* — to see, in their own work, the AI write something fluent and confident that is also entirely wrong.

After that experience, the verification habit becomes reflex rather than rule. Module 2 produces both the experience and a reusable reference card.`,
  learningObjectives: [
    'Trigger a hallucination on demand using a known prompt pattern.',
    'Catch hallucinations across three models and identify which fabricates most readily.',
    'Articulate "AI is good at language, bad at facts" in your own words.',
    'Maintain a Hallucination Catch Log that becomes evidence in the Final Lab.',
  ],
  sections: [
    {
      id: 'f2-confidence',
      title: 'Confidence is not accuracy',
      content: `AI language models are trained to produce text that sounds right. Sounding right and being right are two different things. A model will cite a regulation that does not exist, attribute a policy to the wrong agency, or invent a court case — in the same fluent prose it uses for accurate answers.

This is not a bug to be fixed. It is the architecture. The model has no notion of *true* — only of *plausible given the prompt*. When you ask it about something it does not know, it produces the most plausible-sounding answer. That answer is a hallucination.

The verification habit is the only defense. Every dollar amount, every regulation, every name, every date that came out of an AI tool gets checked against a primary source before it leaves your hands.`,
    },
    {
      id: 'f2-claim-review',
      title: 'The five-point Claim Review',
      content: `Apply this scan to every AI output that contains specific claims:

1. **Regulations.** Is the regulation real? Is the citation accurate? Primary source: CFR, agency website, FFIEC handbook.
2. **Dates.** Effective dates, publication dates, deadline dates. Primary source: the bulletin or rule itself.
3. **Dollars.** Thresholds, ratios, percentages. Primary source: the cited rule or your bank's policy.
4. **Names.** People, agencies, departments. Primary source: the institution's directory or the regulator's website.
5. **Policy claims.** "Banks must X" or "regulators require Y." Primary source: the cited regulation, not the AI's restatement.

Five primary sources, ninety seconds, every time. The card lives at the workstation.`,
      tryThis: 'Open the last AI-drafted message you sent. Apply the five-point scan. If you find one fabrication, the habit just paid for the module.',
    },
  ],
  activities: [
    {
      id: '2.1',
      title: 'Trigger a hallucination yourself',
      description: 'Three known-prone prompts; pick one and send to all three models. Reveals planted fabrications after you read the output.',
      activityType: 'multi-model',
      estimatedMinutes: 8,
      fields: [
        {
          id: 'prompt-choice',
          label: 'Which prompt did you send?',
          type: 'select',
          required: true,
          options: [
            { value: 'fdic-bulletin', label: '"What FDIC bulletin in 2024 covers AI in community banks?"' },
            { value: 'sr-11-7-update', label: '"Has SR 11-7 been updated for generative AI? Cite the bulletin."' },
            { value: 'rate-history', label: '"What was the average community-bank deposit rate in Q3 2024? Cite source."' },
          ],
        },
        {
          id: 'fabrication',
          label: 'Quote the most confident-sounding fabrication you saw.',
          type: 'textarea',
          minLength: 30,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '2.2',
      title: 'Find the flaw',
      description: 'Three responses to a banking question — one fully correct, one with a planted fabrication, one accurate-but-omits-a-caveat. Highlight claims to verify; platform reveals the planted issues.',
      activityType: 'find-flaw',
      estimatedMinutes: 10,
      fields: [
        {
          id: 'flagged',
          label: 'Which claims would you verify before using this output?',
          type: 'textarea',
          minLength: 50,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '2.3',
      title: 'Build your verification habit',
      description: 'Customize the five-point Claim Review for your role. Platform formats into a workstation reference card.',
      activityType: 'single-prompt',
      estimatedMinutes: 5,
      fields: [
        {
          id: 'role-sources',
          label: 'For your role, name the primary source for each of the five claim types (regulations, dates, dollars, names, policy claims).',
          type: 'textarea',
          minLength: 80,
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '02-ai-claim-review',
    },
  ],
  artifacts: [
    {
      id: '02-ai-claim-review',
      title: 'AI Claim Review reference card',
      description: 'Five-point claim scan with role-specific primary sources. Posted at workstation.',
      format: 'pdf+md',
      triggeredBy: '2.3',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/02-ai-claim-review.md',
    },
  ],
  dependencies: ['f1-ai-for-your-workday'],
  forwardLinks: ['f7-regulatory-landscape', 'f15-vendor-pitch', 'f20-final-lab'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-02-spec.md',
} as const;
