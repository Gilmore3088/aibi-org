// Foundation Full — Module 3: How AI Got Here, in Plain English
// Net-new module in v2 (no v1 equivalent). Activity types: 4 (timeline), 1 (prompt).
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-03-spec.md

import type { FoundationModule } from '../types';

export const module03: FoundationModule = {
  number: 3,
  id: 'f3-how-ai-got-here',
  trackId: 'full',
  trackPosition: '3',
  title: 'How AI Got Here, in Plain English',
  pillar: 'awareness',
  estimatedMinutes: 20,
  keyOutput: '"What this means for my bank" briefing card',
  dailyUseOutcomes: [
    'A one-page CEO briefing the learner can hand to their executive sponsor.',
    'A calibrated sense of which AI claims to take seriously and which to treat as marketing.',
    'A historical anchor that prevents being swept up in hype or paralyzed by skepticism.',
  ],
  activityTypes: ['adaptive-scenario', 'find-flaw', 'single-prompt'],
  whyThisExists: `Every conversation with a community-bank CEO eventually includes "okay but explain to me what actually changed in 2022 and why everyone is freaking out now." Bankers are pragmatic. They need historical context to evaluate hype.

This module gives the learner the briefest, most accurate version of how AI got here, using the AI itself as a teacher, and ends with a one-page briefing card the learner could hand to their CEO or board.`,
  learningObjectives: [
    'Explain the 2017 to 2022 to present arc of LLMs in three sentences.',
    'Distinguish hype from substance when AI is mentioned in news or vendor pitches.',
    'Articulate why community banks should care now and why some adjacent claims are exaggerated.',
    'Walk away with a briefing card a CEO would actually read.',
  ],
  sections: [
    {
      id: 'f3-arc',
      title: 'The three-sentence version',
      content: `In 2017, a paper called "Attention is All You Need" introduced the transformer architecture. In November 2022, OpenAI wrapped that architecture in a chat interface called ChatGPT, and the technology became suddenly accessible to anyone with a browser. Since then, multiple frontier labs (Anthropic with Claude, Google with Gemini, Microsoft embedding models in M365 Copilot) have shipped competing models that are now woven into everyday banker tools.

That is the whole arc. Everything else is detail. The detail matters when a vendor is pitching, when a regulator is asking, when a board member is worried — but the arc is the anchor.`,
      tryThis: 'In a one-sentence message to someone who has not used AI yet, explain what changed and why it matters to community banking. If the sentence is more than 35 words, it is not yet the arc.',
    },
    {
      id: 'f3-substance-vs-hype',
      title: 'Substance versus hype',
      content: `Not every sentence that contains "AI" is meaningful. Three patterns reliably mark hype:

**Capability claims with no scope.** "Our AI eliminates loan defaults." If you cannot ask *how, what data, validated against what,* the claim is marketing.

**Conflated layers.** Vendor presentations that mix LLMs, ML scoring models, and rules-based automation under a single "AI" label. The risk surface is different for each. The contract language has to disclose which is which.

**Examiner-flavor language without examiner backing.** "Compliant with all relevant AI guidance." Examiners do not certify products. They certify institutions' programs.

The substance pattern is the opposite: bounded claims, named techniques, specific metrics, primary-source citations.`,
    },
  ],
  activities: [
    {
      id: '3.1',
      title: 'Interactive timeline',
      description: 'A branching timeline of the AI moments that matter for community banking. Click through 8 nodes; the platform reveals plain-English explanations and "what this means for my bank" branches.',
      activityType: 'adaptive-scenario',
      estimatedMinutes: 10,
      fields: [
        {
          id: 'path',
          label: 'Path through the timeline (auto-recorded)',
          type: 'text',
          required: true,
        },
        {
          id: 'pivotal-moment',
          label: 'Which moment most changes how you think about AI at your bank?',
          type: 'textarea',
          minLength: 30,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '3.2',
      title: 'Hype versus substance check',
      description: 'Three quotes — one regulator, one vendor pitch, one peer-bank CEO. Tag each as substance, hype, or real-world signal. Platform reveals the reasoning.',
      activityType: 'find-flaw',
      estimatedMinutes: 5,
      fields: [
        {
          id: 'tags',
          label: 'For each of the three quotes, name your tag and write a one-sentence reason.',
          type: 'textarea',
          minLength: 90,
          required: true,
          placeholder: 'Quote A: substance — names a specific framework and a specific metric.\nQuote B: hype — capability claim with no scope.\nQuote C: real-world signal — peer-bank CEO describing actual experience.',
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '3.3',
      title: 'Build your briefing card',
      description: 'AI drafts the one-page card from your timeline path and your substance/hype tags. You refine in your voice. Final card is under 350 words and reads like a banker would read it.',
      activityType: 'single-prompt',
      estimatedMinutes: 5,
      fields: [
        {
          id: 'audience',
          label: 'Who is the briefing for? (CEO, COO, board chair, etc.)',
          type: 'text',
          required: true,
        },
        {
          id: 'tone',
          label: 'Two adjectives describing the voice they expect from you.',
          type: 'text',
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '03-what-this-means-for-my-bank',
    },
  ],
  artifacts: [
    {
      id: '03-what-this-means-for-my-bank',
      title: '"What This Means for My Bank" Briefing Card',
      description: 'One-page CEO briefing card. Three-sentence arc + the substance/hype calibration applied to your bank.',
      format: 'pdf+md',
      triggeredBy: '3.3',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/03-what-this-means-for-my-bank.md',
    },
  ],
  dependencies: ['f1-ai-for-your-workday', 'f2-what-ai-is'],
  forwardLinks: ['f7-regulatory-landscape', 'f15-vendor-pitch', 'bb1-vocabulary'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-03-spec.md',
} as const;
