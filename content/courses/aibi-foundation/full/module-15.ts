// Foundation Full — Module 15: Vendor Pitch Decoder (NEW in v2)
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-15-spec.md

import type { FoundationModule } from '../types';

export const module15: FoundationModule = {
  number: 15,
  id: 'f15-vendor-pitch',
  trackId: 'full',
  trackPosition: '15',
  title: 'Vendor Pitch Decoder',
  pillar: 'creation',
  estimatedMinutes: 30,
  keyOutput: 'Vendor Evaluation Scorecard',
  dailyUseOutcomes: [
    'A 12-question scorecard you can apply to the next AI vendor pitch you sit through.',
    'A working ability to spot substance, hype, and the specific evasions vendors use.',
    'A reusable decoder for vendor proposal documents and demos.',
  ],
  activityTypes: ['find-flaw', 'build-test'],
  whyThisExists: `Every community bank receives AI-flavored vendor pitches every quarter. Some are substance; many are hype. Module 15 gives the learner a 12-question scorecard distilled from the most common evasions and the most reliable signals of substance.

The scorecard is not a checklist of features. It is a list of questions vendors should be able to answer cleanly. The vendor's *answer pattern* — clean, evasive, marketing-flavored, hostile — tells you more than any specific answer does.`,
  learningObjectives: [
    'Apply the 12-question scorecard to a vendor pitch deck.',
    'Spot the three most common AI vendor evasions.',
    'Distinguish substance, hype, and real-world signal under live conditions.',
    'Walk away with a Vendor Evaluation Scorecard you bring to the next pitch.',
  ],
  sections: [
    {
      id: 'f15-twelve-questions',
      title: 'The 12 questions (in order)',
      content: `1. **What is the AI doing inside this product?** (LLM? ML scoring? Rules-based automation? All three?)
2. **What data does it train or run on?** (Customer data? Aggregated? Synthetic? Vendor's own data set?)
3. **Is there a human-in-the-loop step, and where?**
4. **How does this product handle our NPI?** (Goes to vendor servers? Stays on tenant? Never sees NPI?)
5. **What model do you use, and how often does it change?**
6. **How do you validate the model and how often?**
7. **Show me the worst output you have seen this product produce.** (Vendor inability to answer this is itself an answer.)
8. **What happens to our data if we leave?**
9. **Which framework does this fall under for us?** (SR 11-7? TPRM? Both?)
10. **Where is your product on the lens map for our examiners?** (vendor either knows or does not.)
11. **Who at your company answers regulatory inquiries from our examiner if they ask?**
12. **What would I lose by not using this for a year?** (Forces the vendor to articulate concrete value.)`,
    },
    {
      id: 'f15-three-evasions',
      title: 'The three most common evasions',
      content: `**The wrap-around.** "We use AI throughout the product." When asked which models or which steps, the answer becomes vague. Pattern: marketing language replacing technical specifics.

**The we'll-get-back-to-you.** Specific question; answer is "let me get the technical team to follow up." Sometimes legitimate. Frequently a stall. Watch for follow-up actually arriving.

**The compliance-implies-claim.** *"Our product is fully compliant with all relevant AI guidance."* Examiners do not certify products. The framing is meaningless. Use Module 7's lens map to test what the claim actually means.`,
      tryThis: 'Pull a recent AI vendor pitch deck or follow-up email. Run the 12 questions on the materials you already have. The questions you cannot answer are the questions to send back to the vendor.',
    },
  ],
  activities: [
    {
      id: '15.1',
      title: 'Decode three vendor pitches',
      description: 'Three real (anonymized) vendor pitch decks. Score each against the 12 questions. Tag each evasion you see.',
      activityType: 'find-flaw',
      estimatedMinutes: 18,
      fields: [
        {
          id: 'pitch-1-score',
          label: 'Pitch 1: total score (out of 12) + the worst question and the best question.',
          type: 'textarea',
          minLength: 50,
          required: true,
        },
        {
          id: 'pitch-2-score',
          label: 'Pitch 2: total score + the most-revealing question.',
          type: 'textarea',
          minLength: 50,
          required: true,
        },
        {
          id: 'pitch-3-score',
          label: 'Pitch 3: total score + the evasion pattern you saw.',
          type: 'textarea',
          minLength: 50,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '15.2',
      title: 'Build your Vendor Evaluation Scorecard',
      description: 'Personalize the scorecard for your role and the framework lens you most often need to defend.',
      activityType: 'build-test',
      estimatedMinutes: 12,
      fields: [
        {
          id: 'lens-priority',
          label: 'Which of the five regulatory lenses is most often involved in vendor pitches at your bank?',
          type: 'select',
          required: true,
          options: [
            { value: 'model-risk', label: 'Model Risk' },
            { value: 'tprm', label: 'Third-Party Risk' },
            { value: 'fair-lending', label: 'Fair Lending & Consumer Protection' },
            { value: 'bsa-aml', label: 'BSA/AML & Privacy' },
            { value: 'cyber', label: 'Cybersecurity & IT Risk' },
          ],
        },
        {
          id: 'extra-questions',
          label: 'List 1-2 questions specific to your role you would add to the scorecard.',
          type: 'textarea',
          minLength: 60,
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '15-vendor-evaluation-scorecard',
    },
  ],
  artifacts: [
    {
      id: '15-vendor-evaluation-scorecard',
      title: 'Vendor Evaluation Scorecard',
      description: '12-question pitch decoder personalized to your role and your bank\'s priority lens.',
      format: 'pdf+md',
      triggeredBy: '15.2',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/15-vendor-evaluation-scorecard.md',
    },
  ],
  dependencies: ['f3-how-ai-got-here', 'f7-regulatory-landscape', 'f13-tools-comparison'],
  forwardLinks: ['f17-prompt-library', 'f20-final-lab', 'bb1-vocabulary'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-15-spec.md',
} as const;
