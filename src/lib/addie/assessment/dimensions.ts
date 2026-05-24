// Canonical dimension keys + labels for the In-Depth Readiness Assessment.
//
// Mirrors content/assessments/v2/types.ts (8 dimensions). Re-exported here
// so the ADDIE reader surface doesn't reach across into the runner's content
// package directly — keeps the contract narrow.
//
// DECISIONS 2026-05-23: locked at 8 dimensions, not 10+.

export type DimensionKey =
  | 'current-ai-usage'
  | 'experimentation-culture'
  | 'ai-literacy-level'
  | 'quick-win-potential'
  | 'leadership-buy-in'
  | 'security-posture'
  | 'training-infrastructure'
  | 'builder-potential';

export const DIMENSION_KEYS: readonly DimensionKey[] = [
  'current-ai-usage',
  'experimentation-culture',
  'ai-literacy-level',
  'quick-win-potential',
  'leadership-buy-in',
  'security-posture',
  'training-infrastructure',
  'builder-potential',
] as const;

export const DIMENSION_LABELS: Readonly<Record<DimensionKey, string>> = {
  'current-ai-usage': 'Current AI Usage',
  'experimentation-culture': 'Experimentation Culture',
  'ai-literacy-level': 'AI Literacy Level',
  'quick-win-potential': 'Quick Win Potential',
  'leadership-buy-in': 'Leadership Buy-In',
  'security-posture': 'Security Posture',
  'training-infrastructure': 'Training Infrastructure',
  'builder-potential': 'Builder Potential',
};

export function isDimensionKey(value: unknown): value is DimensionKey {
  return typeof value === 'string' && (DIMENSION_KEYS as readonly string[]).includes(value);
}

/**
 * Each dimension carries 6 questions in the full 48-Q pool (48 / 8 = 6),
 * each scored 1–4. Max per dimension is therefore 24. This is a default
 * — the route stores whatever max is implied by the runner's payload.
 */
export const DEFAULT_DIMENSION_MAX = 24;
