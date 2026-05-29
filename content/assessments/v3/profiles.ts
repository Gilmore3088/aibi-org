// Named profile detection for the v3 free-assessment briefing.
//
// The briefing fails if every report reads the same. This module looks at
// the shape of the dimension scores and recognizes five named profiles.
// Each profile produces a distinct narrative emphasis. Detection is by
// relative dimension rank (strongest / weakest) — tier already captures
// absolute readiness, so profile is about RELATIVE shape.

import type { Dimension } from './types';
import type { DimensionScore } from './scoring';

export type Profile =
  | 'governance-priority' // A: high strategic energy, low security or runtime safeguards
  | 'capability-priority' // B: high compliance posture, low talent / data-safety reflexes
  | 'adoption-priority' //   C: low strategic-value naming, high talent-culture
  | 'visibility-priority' // D: low approved-tool control, high data-safety practice (shadow IT pattern)
  | 'use-case-priority'; //   E: strong security and oversight, low strategic naming

export interface ProfileMeta {
  readonly id: Profile;
  readonly label: string;
  readonly diagnosis: string;
  readonly priority: string;
  readonly foundationEmphasis: string;
}

export const PROFILE_META: Record<Profile, ProfileMeta> = {
  'governance-priority': {
    id: 'governance-priority',
    label: 'Energy without guardrails',
    diagnosis:
      'Your staff are using AI. They are also exposing your institution to risk that no policy currently covers. The shape is enthusiasm running ahead of governance.',
    priority: 'Codify safe-use rules before another quarter of unsanctioned experimentation.',
    foundationEmphasis:
      'Lead with the Safe AI Use module and the documented workflow practices. The energy is already there — the guardrails are what compound it.',
  },
  'capability-priority': {
    id: 'capability-priority',
    label: 'Posture without practice',
    diagnosis:
      'You have written the policies. Your staff have not yet built the day-to-day reflexes those policies assume. The shape is governance meeting a culture that has not caught up.',
    priority: 'Convert the policies into recurring practice — not another all-staff email.',
    foundationEmphasis:
      'Lead with the Foundations of Safe Use module and the per-team reinforcement plan. The rules are set; the muscle memory is the next milestone.',
  },
  'adoption-priority': {
    id: 'adoption-priority',
    label: 'Readiness without direction',
    diagnosis:
      'Your team understands AI broadly. They have not yet picked the workflows where AI would do real work. The shape is literacy that has not crossed into operations.',
    priority: 'Pick two named candidate workflows this quarter and assign owners.',
    foundationEmphasis:
      'Lead with the Workflow Selection module and the Candidate Brief template. The framing is solid; the workflows have to become real.',
  },
  'visibility-priority': {
    id: 'visibility-priority',
    label: 'Experimentation without visibility',
    diagnosis:
      'Staff are using AI; leadership and compliance do not have visibility into it and cannot govern it. The shape is shadow IT in slow motion.',
    priority: 'Make the existing AI work visible before something forces visibility on you.',
    foundationEmphasis:
      'Lead with the Approved Tools module and the AI Use Inventory exercise. The work exists; surfacing it is the next step.',
  },
  'use-case-priority': {
    id: 'use-case-priority',
    label: 'Posture without use cases',
    diagnosis:
      'Your guardrails are real. Your team has not yet found the workflows the guardrails are meant to protect. The shape is a posture in search of a program.',
    priority: 'Identify the three highest-impact workflows per department, then run them under the posture you already have.',
    foundationEmphasis:
      'Lead with the Workflow Selection module and Role-Based Use Cases. The safety system is built; the program needs use cases to justify it.',
  },
};

// ---------------------------------------------------------------------------
// Detection — deterministic from dimension percentages.
// ---------------------------------------------------------------------------

interface RankedDim {
  readonly dimension: Dimension;
  readonly pct: number;
  readonly rank: number;
}

function rank(
  scores: Record<Dimension, DimensionScore>,
): readonly RankedDim[] {
  const withPct = (Object.entries(scores) as readonly [Dimension, DimensionScore][]).map(
    ([dimension, s]) => ({
      dimension,
      pct: s.maxScore > 0 ? (s.score / s.maxScore) * 100 : 0,
    }),
  );
  return [...withPct]
    .sort((a, b) => a.pct - b.pct || a.dimension.localeCompare(b.dimension))
    .map((entry, idx) => ({ ...entry, rank: idx }));
}

// Top quartile (top 3 of 12) AND clears 50% absolute.
function isHigh(
  scores: Record<Dimension, DimensionScore>,
  dimension: Dimension,
): boolean {
  const ranked = rank(scores);
  const target = ranked.find((r) => r.dimension === dimension);
  if (!target) return false;
  return target.rank >= ranked.length - 3 && target.pct >= 50;
}

// Bottom quartile (bottom 3 of 12) AND below 50% absolute.
function isLow(
  scores: Record<Dimension, DimensionScore>,
  dimension: Dimension,
): boolean {
  const ranked = rank(scores);
  const target = ranked.find((r) => r.dimension === dimension);
  if (!target) return false;
  return target.rank < 3 && target.pct < 50;
}

/**
 * Detect the dominant profile from dimension shape. Returns null when no
 * profile triggers — uniformly mediocre or strong reports get tier-only
 * framing without a named profile lens.
 *
 * Priority order matters: each profile fires only if the prior ones did
 * not. The first match wins so the briefing has one narrative spine.
 */
export function detectProfile(
  scores: Record<Dimension, DimensionScore>,
): Profile | null {
  // A — Energy without guardrails: strategic use, weak safety reflexes.
  if (
    isHigh(scores, 'strategic-value') &&
    (isLow(scores, 'approved-tool-path') ||
      isLow(scores, 'data-safety-reflexes') ||
      isLow(scores, 'human-review'))
  ) {
    return 'governance-priority';
  }

  // B — Posture without practice: review-aware, culture not yet caught up.
  if (
    (isHigh(scores, 'customer-impact-awareness') ||
      isHigh(scores, 'human-review')) &&
    (isLow(scores, 'training-culture') || isLow(scores, 'data-safety-reflexes'))
  ) {
    return 'capability-priority';
  }

  // C — Readiness without direction: skills present, no specific use cases.
  if (
    isHigh(scores, 'training-culture') &&
    isLow(scores, 'strategic-value')
  ) {
    return 'adoption-priority';
  }

  // D — Experimentation without visibility: shadow-tool pattern.
  if (
    isLow(scores, 'approved-tool-path') &&
    (isHigh(scores, 'strategic-value') || isHigh(scores, 'training-culture'))
  ) {
    return 'visibility-priority';
  }

  // E — Posture without use cases: discipline ready, no workflows named.
  if (
    (isHigh(scores, 'approved-tool-path') ||
      isHigh(scores, 'data-safety-reflexes') ||
      isHigh(scores, 'human-review')) &&
    isLow(scores, 'strategic-value')
  ) {
    return 'use-case-priority';
  }

  return null;
}
