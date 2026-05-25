// M0 Data Discipline Coach — canned chip answers.
//
// Six suggested questions from PRD §11. Each answer is pre-authored
// (no model call) and follows the PRD's response pattern:
//   1. restate the safety principle
//   2. classify the example if possible
//   3. recommend redaction or escalation if uncertain
//   4. remind the learner to follow institution policy
//
// Answers are markdown-ish but rendered as styled text in the drawer.
// No legal advice, no institution-approval claims, no policy override.

export interface CoachChip {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

export const M0_COACH_CHIPS: ReadonlyArray<CoachChip> = [
  {
    id: 'internal_policy',
    question: 'Can I paste internal policy?',
    answer:
      'Maybe — do not assume. If the policy is public-facing and contains no confidential, customer, member, or internal-only information, it may be okay. If it is internal-only, confidential, or references customer/member details, do not paste it into a public AI tool. Use a made-up excerpt, a redacted section, or your bank\'s approved process.',
  },
  {
    id: 'member_data',
    question: 'What counts as member data?',
    answer:
      'Anything that ties an identity to a financial relationship: names, account numbers, card numbers, SSNs / tax IDs, balances, transaction details, loan files, beneficiary information, contact lists. If a row would let a stranger recognize a specific person at your institution, it is member data — and it stays out of public AI.',
  },
  {
    id: 'anonymize',
    question: 'How do I anonymize this?',
    answer:
      'Use the move you just practiced: describe the situation, not the person. Replace names with "the customer," account numbers with "an account," dollar amounts tied to a real account with a general description, and specific dates with the situation\'s shape. The Strip-it drill on this page shows the exact pattern: real detail → safe situation → AI prompt.',
  },
  {
    id: 'approved_tool',
    question: 'What if my bank has an approved AI tool?',
    answer:
      'Follow your institution\'s policy on what that tool may receive — the Institute cannot approve specific tools for you. Even an "approved" enterprise tool usually has rules about what data classes are allowed and which workflows require additional review. Ask your IT, compliance, or risk team if you are unsure, and default to the safe-situation pattern when in doubt.',
  },
  {
    id: 'sar_redacted',
    question: 'Is a redacted SAR narrative safe?',
    answer:
      'No — treat it as off-limits in a public AI tool, even after identifiers are removed. SAR/BSA material is supervisory and confidential by statute. Redaction does not change the classification. Use approved internal processes; if you need help structuring the narrative, ask your BSA officer or compliance team.',
  },
  {
    id: 'public_regulatory',
    question: 'Can I use public regulatory information?',
    answer:
      'Yes — public CFPB, FFIEC, OCC, FDIC, NCUA, and similar rule summaries and guidance documents are safe to paste into public AI tools for help digesting or drafting summaries. The rule applies to non-public bank data and customer/member information, not to publicly published regulatory material.',
  },
];
