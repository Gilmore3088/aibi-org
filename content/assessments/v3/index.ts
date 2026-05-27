export { questions } from './questions';
export { selectQuestions } from './rotation';
export { getTierV3, getDimensionScores, tiers } from './scoring';
export type { Tier, DimensionScore } from './scoring';
export { DIMENSION_LABELS } from './types';
export type { Dimension, AssessmentQuestion, AssessmentOption } from './types';
export {
  PERSONAS,
  BIG_INSIGHT,
  SIGNATURE_INSIGHT,
  MATURITY_LADDER,
  TIER_TO_RUNG,
  PRACTICE_PICTURE,
  GAP_CONTENT,
  RECOMMENDATIONS,
  STARTER_PROMPTS,
  SEVEN_DAY_PLAN,
  FINANCIAL_IMPLICATIONS,
  TIER_CLOSING_CTA,
} from './personalization';
export { getStarterArtifact, STARTER_ARTIFACTS } from './starter-artifacts';
export { detectProfile, PROFILE_META } from './profiles';
export type { Profile, ProfileMeta } from './profiles';
