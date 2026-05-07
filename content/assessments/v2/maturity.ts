// Maturity-stage substance for the four-tier system. Wraps (does not replace)
// the Tier type in scoring.ts. Authored content lives here as the single
// source of truth consumed by every assessment-results surface.

import type { Tier } from './scoring';
import type { Dimension } from './types';

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export interface TierMaturity {
  readonly tierId: Tier['id'];
  /** Maturity-stage label (e.g. "Individual Experimentation"). Internal frame; not a public rebrand. */
  readonly stageName: string;
  /** One-paragraph "what is true at this stage" — banker-direct, present tense. */
  readonly whatIsTrue: string;
  /** The single named blocker holding the institution at this stage. Null only at the top tier. */
  readonly blockerToNext: string | null;
}

export interface BankingRole {
  readonly id:
    | 'deposit-operations'
    | 'loan-operations'
    | 'bsa-aml'
    | 'treasury-management'
    | 'branch-leadership'
    | 'compliance-review'
    | 'marketing'
    | 'collections'
    | 'card-operations';
  readonly label: string;
  /** Two-line description used when overlaying recommendations onto a role context. */
  readonly contextLine: string;
}

/** Per-dimension tier substance: what does dimension X mean at tier Y. 8 dims × 4 tiers = 32 cells. */
export interface DimensionTierMeaning {
  readonly dimension: Dimension;
  readonly tierId: Tier['id'];
  /** One-line meaning of this dimension at this tier. Banker-direct, present tense. */
  readonly meaning: string;
}

// ---------------------------------------------------------------------------
// AUTHORED CONTENT — populated in Tasks 2, 3, 4
// ---------------------------------------------------------------------------

export const TIER_MATURITY: Record<Tier['id'], TierMaturity> = {
  'starting-point': {
    tierId: 'starting-point',
    stageName: 'Individual Experimentation',
    whatIsTrue:
      'A handful of staff are using AI tools — usually a free chat tool, usually on personal devices, usually for tasks they were going to do anyway. Nothing is shared. Nothing is documented. Leadership is either unaware or has not signaled whether this is allowed.',
    blockerToNext:
      'There is no leadership signal that AI use is sanctioned, no shared place where what works can be captured, and no permission to bring AI use onto bank work without ambiguity about policy.',
  },
  'early-stage': {
    tierId: 'early-stage',
    stageName: 'Team Adoption',
    whatIsTrue:
      'AI use has spread inside one or two teams — often Marketing, Operations, or a single curious branch. Informal best practices are emerging in the form of shared prompts and side-channel chatter. Most use is still unsanctioned by formal policy and invisible to compliance.',
    blockerToNext:
      'No written governance frame, no measurement of what AI use is producing, and no named executive sponsor to convert isolated team wins into an institutional program.',
  },
  'building-momentum': {
    tierId: 'building-momentum',
    stageName: 'Program Building',
    whatIsTrue:
      'AI use is sanctioned. A written acceptable-use policy exists, a use-case inventory is being maintained, and at least one named owner is accountable for AI risk. Real workflows are running in real seats — but the program is fragile because most institutional knowledge still lives in three or four individuals.',
    blockerToNext:
      'Measurement is not yet defensible to leadership or examiners, security and compliance review was bolted on rather than built in, and the program has not yet survived the loss of a key person.',
  },
  'ready-to-scale': {
    tierId: 'ready-to-scale',
    stageName: 'Operational Integration',
    whatIsTrue:
      'AI is part of how work gets done across multiple departments. Governance is operating, not theoretical — the policy is enforced, the inventory is current, and reviews happen on a schedule. Measurement produces budget-defensible numbers, and the next move is the builder move: building bank-specific tools rather than only adopting vendor tools.',
    blockerToNext: null,
  },
};

export const BANKING_ROLES: readonly BankingRole[] = [
  { id: 'deposit-operations', label: 'Deposit Operations',
    contextLine: 'Account exception research, document review, customer correspondence drafting, and procedure summarization — high-volume, structured work where written language and lookups dominate the day.' },
  { id: 'loan-operations', label: 'Loan Operations / Underwriting Support',
    contextLine: 'Credit memo drafting, condition tracking, loan file review, and policy lookup — work where summarization and structured-document handling consume hours that compound across the pipeline.' },
  { id: 'bsa-aml', label: 'BSA / AML Support',
    contextLine: 'Alert narrative drafting, SAR support, news adverse-media review, and policy interpretation — tasks where written reasoning and source synthesis are the bottleneck.' },
  { id: 'treasury-management', label: 'Treasury Management',
    contextLine: 'RFP responses, onboarding documentation, customer education materials, and product comparison memos — long-form written work that scales poorly with relationship-manager headcount.' },
  { id: 'branch-leadership', label: 'Branch Leadership',
    contextLine: 'Coaching notes, performance summaries, customer escalations, and procedure interpretation — the management overhead between customer-facing time and reporting upward.' },
  { id: 'compliance-review', label: 'Compliance Review',
    contextLine: 'Regulatory change tracking, policy gap analysis, exam prep, and procedure update drafting — reading-heavy work where AI shifts the bottleneck from intake to judgment.' },
  { id: 'marketing', label: 'Marketing',
    contextLine: 'Email drafting, social copy, segment analysis, and brand-consistent content production — a department where AI adoption is usually furthest along and policy needs to catch up.' },
  { id: 'collections', label: 'Collections',
    contextLine: 'Account-history summarization, customer correspondence, and call-prep notes — structured, repeatable communication tasks that benefit from drafting acceleration with human review on the send.' },
  { id: 'card-operations', label: 'Card Operations',
    contextLine: 'Dispute documentation, fraud-case narrative drafting, network rule lookup, and customer correspondence — procedure-heavy work where the right answer is buried in long documents.' },
] as const;

/** 32-cell ladder. Populated in Task 3. */
export const DIMENSION_TIER_LADDER: readonly DimensionTierMeaning[] = [
  // current-ai-usage
  { dimension: 'current-ai-usage', tierId: 'starting-point',
    meaning: 'AI use, if it exists, is private and invisible — a few staff using free tools on personal devices for tasks management never sees the inputs or outputs of.' },
  { dimension: 'current-ai-usage', tierId: 'early-stage',
    meaning: 'AI use has surfaced inside one or two teams. Time savings are real but inconsistent and not yet documented anywhere a manager can find them.' },
  { dimension: 'current-ai-usage', tierId: 'building-momentum',
    meaning: 'AI is embedded in two or three repeating workflows. The bank can name which seats use which tools for which tasks, and someone owns each one.' },
  { dimension: 'current-ai-usage', tierId: 'ready-to-scale',
    meaning: 'AI is a routine part of how work gets done across multiple departments. Workflows are documented, owned, and survive turnover.' },

  // experimentation-culture
  { dimension: 'experimentation-culture', tierId: 'starting-point',
    meaning: 'Trying new tools is treated as personal time. There is no forum where staff can share what worked, and no signal that experimentation is welcome.' },
  { dimension: 'experimentation-culture', tierId: 'early-stage',
    meaning: 'A handful of curious staff experiment in side channels. Wins stay verbal; nothing is captured in a place the next person can find.' },
  { dimension: 'experimentation-culture', tierId: 'building-momentum',
    meaning: 'Experimentation is sanctioned and lightly structured — a shared prompt library, a monthly demo, or a small budget for tool trials with a named owner.' },
  { dimension: 'experimentation-culture', tierId: 'ready-to-scale',
    meaning: 'Experimentation is a managed pipeline: ideas are captured, scored, piloted, and either operationalized or retired on a known cadence.' },

  // ai-literacy-level
  { dimension: 'ai-literacy-level', tierId: 'starting-point',
    meaning: 'Most staff cannot articulate what generative AI is, what it is bad at, or where the bank\'s sensitive data is at risk when using it.' },
  { dimension: 'ai-literacy-level', tierId: 'early-stage',
    meaning: 'A few power users have working intuition for AI. The rest of the institution has heard the buzzwords but not had any structured exposure.' },
  { dimension: 'ai-literacy-level', tierId: 'building-momentum',
    meaning: 'A baseline literacy program has been delivered to a meaningful share of staff. Frontline managers can answer basic questions about acceptable use without escalating.' },
  { dimension: 'ai-literacy-level', tierId: 'ready-to-scale',
    meaning: 'AI literacy is treated as a job skill — onboarded into new-hire training, refreshed annually, and tested in role-relevant context.' },

  // quick-win-potential
  { dimension: 'quick-win-potential', tierId: 'starting-point',
    meaning: 'Repeating workflows that would benefit from AI have not been mapped or named. The bank cannot answer "where would we even start" without a discovery exercise.' },
  { dimension: 'quick-win-potential', tierId: 'early-stage',
    meaning: 'One or two obvious candidate workflows have been identified informally. No one has yet committed to running a structured pilot with a measured before/after.' },
  { dimension: 'quick-win-potential', tierId: 'building-momentum',
    meaning: 'A short list of candidate workflows is being worked, with at least one pilot in flight that has a baseline measurement and a named owner.' },
  { dimension: 'quick-win-potential', tierId: 'ready-to-scale',
    meaning: 'Quick-win identification is a managed backlog. New candidates are surfaced from frontline staff and prioritized against measurable institutional impact.' },

  // leadership-buy-in
  { dimension: 'leadership-buy-in', tierId: 'starting-point',
    meaning: 'Leadership has not made a public statement about AI. Staff infer the position from silence — usually as "do not bring it up."' },
  { dimension: 'leadership-buy-in', tierId: 'early-stage',
    meaning: 'A senior leader has signaled openness to AI in a meeting or two, but no budget, owner, or written direction has followed.' },
  { dimension: 'leadership-buy-in', tierId: 'building-momentum',
    meaning: 'AI is a named line item — an executive sponsor exists, a budget exists, and AI updates appear on at least a quarterly leadership agenda.' },
  { dimension: 'leadership-buy-in', tierId: 'ready-to-scale',
    meaning: 'AI capability is treated as a strategic objective with board-level visibility, defended in budget cycles, and tracked alongside other operational KPIs.' },

  // security-posture
  { dimension: 'security-posture', tierId: 'starting-point',
    meaning: 'There is no written acceptable-use policy for AI tools. Staff using free chat tools may be pasting non-public information without anyone reviewing the exposure.' },
  { dimension: 'security-posture', tierId: 'early-stage',
    meaning: 'Verbal guardrails exist ("don\'t paste customer data") but nothing is written, tested, or auditable. Compliance has not yet been brought into the conversation.' },
  { dimension: 'security-posture', tierId: 'building-momentum',
    meaning: 'A written AI acceptable-use policy exists, a use-case inventory is maintained, and named owners are accountable for AI risk inside the institution.' },
  { dimension: 'security-posture', tierId: 'ready-to-scale',
    meaning: 'AI risk is integrated into existing third-party and model risk programs (SR 11-7, TPRM). Reviews happen on schedule. Examiner questions have defensible answers.' },

  // training-infrastructure
  { dimension: 'training-infrastructure', tierId: 'starting-point',
    meaning: 'No AI-specific training exists. New hires receive no orientation on what tools they may or may not use, or on what good prompting looks like.' },
  { dimension: 'training-infrastructure', tierId: 'early-stage',
    meaning: 'Training, if it exists, is one-off — a lunch-and-learn, a forwarded webinar. Nothing is required, repeatable, or refreshed.' },
  { dimension: 'training-infrastructure', tierId: 'building-momentum',
    meaning: 'A baseline AI literacy module is part of onboarding for at least one role family. Refresh cadence is defined even if not yet fully operationalized.' },
  { dimension: 'training-infrastructure', tierId: 'ready-to-scale',
    meaning: 'AI training is role-specific, sustained, and measured. New hires arrive prepared; existing staff are kept current as tools and policy evolve.' },

  // builder-potential
  { dimension: 'builder-potential', tierId: 'starting-point',
    meaning: 'No staff have been identified as candidates to build bank-specific AI workflows. The institution is in pure tool-consumer mode.' },
  { dimension: 'builder-potential', tierId: 'early-stage',
    meaning: 'A few staff have shown aptitude for prompt engineering or workflow design but have no time, mandate, or path to develop the skill further.' },
  { dimension: 'builder-potential', tierId: 'building-momentum',
    meaning: 'One or two staff have been informally designated as "the AI person" for their team. They are building reusable prompts, agents, or small workflows.' },
  { dimension: 'builder-potential', tierId: 'ready-to-scale',
    meaning: 'The bank has a defined builder track — staff who design, ship, and maintain bank-specific AI workflows as a recognized part of their role.' },
];

// ---------------------------------------------------------------------------
// RESOLVERS — pure, total functions
// ---------------------------------------------------------------------------

export function getTierMaturity(tierId: Tier['id']): TierMaturity {
  return TIER_MATURITY[tierId];
}

/**
 * Map a per-dimension score (out of maxScore) onto the four-tier ladder.
 * Uses the same equal-spaced 9-point logic as overall scoring, normalized
 * to whatever maxScore the dimension actually has in this session.
 *
 * Pass the dimension's actual maxScore — typically 24 (6 questions × 4 points)
 * for the in-depth 48Q assessment, or 4 (1 question × 4 points) for the
 * free 12Q rotation.
 */
export function scoreToTier(score: number, maxScore: number): Tier['id'] {
  if (maxScore <= 0) return 'starting-point';
  const ratio = score / maxScore;
  if (ratio >= 0.875) return 'ready-to-scale';
  if (ratio >= 0.625) return 'building-momentum';
  if (ratio >= 0.375) return 'early-stage';
  return 'starting-point';
}

export function getDimensionTierMeaning(
  dimension: Dimension,
  tierId: Tier['id']
): DimensionTierMeaning | undefined {
  return DIMENSION_TIER_LADDER.find((c) => c.dimension === dimension && c.tierId === tierId);
}
