// Version-selected content bundle for the assessment print/PDF route.
//
// The free funnel persists v3 data (12 v3 dimension keys) since 2026-05-27,
// while legacy rows are v2 (8 v2 keys) / v1. The print components are
// otherwise identical, so rather than fork them per version, the route picks
// the matching content bundle here and threads it through as a `pack` prop.
//
// Tier ids are shared between v2 and v3 (both re-export `tiers` from
// shared/free-readiness), so tier-keyed maps work for either version; only
// the dimension-keyed maps and the surrounding copy differ. The v3 maps key
// off the v3 Dimension union and the v2 maps off the v2 union; widening both
// to Record<string, …> lets a single pack type carry either.

import type { Tier } from '@content/assessments/shared/free-readiness';
import type {
  Persona,
  MaturityRung,
  PracticePictureRow,
  GapContent,
  Recommendation,
  StarterPrompt,
  FinancialImplications,
} from '@content/assessments/v2/personalization';

import * as v2Personalization from '@content/assessments/v2/personalization';
import * as v3Personalization from '@content/assessments/v3/personalization';
import { DIMENSION_LABELS as V2_DIMENSION_LABELS } from '@content/assessments/v2/types';
import { DIMENSION_LABELS as V3_DIMENSION_LABELS } from '@content/assessments/v3/types';

export type PrintContentVersion = 'v2' | 'v3';

export interface PrintPack {
  readonly version: PrintContentVersion;
  readonly DIMENSION_LABELS: Readonly<Record<string, string>>;
  readonly PERSONAS: Readonly<Record<Tier['id'], Persona>>;
  readonly FINANCIAL_IMPLICATIONS: Readonly<Record<Tier['id'], FinancialImplications>>;
  readonly PRACTICE_PICTURE: Readonly<Record<Tier['id'], ReadonlyArray<PracticePictureRow>>>;
  readonly SIGNATURE_INSIGHT: string;
  readonly MATURITY_LADDER: ReadonlyArray<MaturityRung>;
  readonly TIER_TO_RUNG: Readonly<Record<Tier['id'], number>>;
  readonly GAP_CONTENT: Readonly<Record<string, GapContent>>;
  readonly RECOMMENDATIONS: Readonly<Record<string, Recommendation>>;
  readonly STARTER_PROMPTS: Readonly<Record<string, StarterPrompt>>;
  readonly SEVEN_DAY_PLAN: typeof v2Personalization.SEVEN_DAY_PLAN;
}

export function getPrintPack(version: PrintContentVersion): PrintPack {
  const source = version === 'v3' ? v3Personalization : v2Personalization;
  const labels = version === 'v3' ? V3_DIMENSION_LABELS : V2_DIMENSION_LABELS;

  return {
    version,
    DIMENSION_LABELS: labels,
    PERSONAS: source.PERSONAS,
    FINANCIAL_IMPLICATIONS: source.FINANCIAL_IMPLICATIONS,
    PRACTICE_PICTURE: source.PRACTICE_PICTURE,
    SIGNATURE_INSIGHT: source.SIGNATURE_INSIGHT,
    MATURITY_LADDER: source.MATURITY_LADDER,
    TIER_TO_RUNG: source.TIER_TO_RUNG,
    GAP_CONTENT: source.GAP_CONTENT,
    RECOMMENDATIONS: source.RECOMMENDATIONS,
    STARTER_PROMPTS: source.STARTER_PROMPTS,
    SEVEN_DAY_PLAN: source.SEVEN_DAY_PLAN,
  };
}
