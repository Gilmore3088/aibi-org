// Named profile detection for the In-Depth Briefing (#97 §12).
//
// The Briefing fails if every report reads the same. This module looks at
// the shape of the dimension scores and recognizes five named profiles
// the user named explicitly in the design doc. Each profile produces a
// distinct narrative emphasis in the Briefing.
//
// Profiles are detected by comparing dimension percentages, not raw
// scores. A "strong" dimension is one in the top 25% of the user's own
// score distribution; "weak" is bottom 25%. We don't require absolute
// thresholds because tier already captures absolute readiness — profile
// is about RELATIVE shape.

import type { Dimension } from './types';
import type { DimensionScore } from './scoring';

export type Profile =
  | 'governance-priority' // A: high experimentation, low security
  | 'capability-priority' // B: high leadership, low training
  | 'adoption-priority' //   C: low usage, high literacy
  | 'visibility-priority' // D: low leadership, high experimentation
  | 'use-case-priority'; //   E: strong security, low quick-win

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
    label: 'Permission without practice',
    diagnosis:
      'Leadership has signed off. The staff capability to deliver on that permission has not been built yet. The shape is air cover meeting a vacuum.',
    priority: 'Convert leadership backing into a recurring practice cadence — not another one-off workshop.',
    foundationEmphasis:
      'Lead with Prompting Fundamentals and the Personal Prompt Library. The directive is set; the muscle memory is the next milestone.',
  },
  'adoption-priority': {
    id: 'adoption-priority',
    label: 'Understanding without workflow',
    diagnosis:
      'Your team knows what AI is. They are not yet embedding it into the work that pays the bills. The shape is literacy that has not crossed into operations.',
    priority: 'Pick one workflow per department and put AI inside it — the same way, every week.',
    foundationEmphasis:
      'Lead with AI for Your Workday and Files and Document Workflows. The framing is solid; the workflows have to become real.',
  },
  'visibility-priority': {
    id: 'visibility-priority',
    label: 'Experimentation without visibility',
    diagnosis:
      'Staff are using AI; leadership does not know about it, cannot defend it, and cannot govern it. The shape is shadow IT in slow motion.',
    priority: 'Make the existing AI work visible to leadership before something forces visibility on you.',
    foundationEmphasis:
      'Lead with Personal Prompt Library and the Final Foundation Lab. The work exists; surfacing it is the next step.',
  },
  'use-case-priority': {
    id: 'use-case-priority',
    label: 'Posture without use cases',
    diagnosis:
      'Your guardrails are real. Your team has not yet found the workflows the guardrails are meant to protect. The shape is a posture in search of a program.',
    priority: 'Identify the three highest-impact workflows per department, then run them under the posture you already have.',
    foundationEmphasis:
      'Lead with Role-Based Use Cases and AI for Your Workday. The safety system is built; the program needs use cases to justify it.',
  },
};

// ---------------------------------------------------------------------------
// Detection — deterministic from dimension percentages.
// ---------------------------------------------------------------------------

interface RankedDim {
  readonly dimension: Dimension;
  readonly pct: number;
  readonly rank: number; // 0 = weakest, n-1 = strongest
}

// Sort once and tag each dimension with its rank (0 = lowest pct). Ties
// break stably by dimension id so the test is deterministic.
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

// "Top 2" — the two strongest dimensions. "Bottom 2" — the two weakest.
// These produce stable detection in face of mid-range noise, where percentile
// thresholds would mis-fire when several dimensions cluster at the same pct.
function isHigh(
  scores: Record<Dimension, DimensionScore>,
  dimension: Dimension,
): boolean {
  const ranked = rank(scores);
  const target = ranked.find((r) => r.dimension === dimension);
  if (!target) return false;
  // Top 2 of 8 = top quartile, and the score must clear 50% absolute so
  // a uniformly mediocre profile doesn't get flagged as "strong" anywhere.
  return target.rank >= ranked.length - 2 && target.pct >= 50;
}

function isLow(
  scores: Record<Dimension, DimensionScore>,
  dimension: Dimension,
): boolean {
  const ranked = rank(scores);
  const target = ranked.find((r) => r.dimension === dimension);
  if (!target) return false;
  return target.rank <= 1 && target.pct <= 50;
}

/**
 * Detects which named profile (if any) best fits the buyer's score shape.
 *
 * Returns null if no profile cleanly applies — the Briefing then falls back
 * to plain tier × weakest-dimension framing. This is intentional: forcing
 * a profile onto a non-matching score profile would produce worse copy
 * than skipping it.
 */
export function detectProfile(
  scores: Record<Dimension, DimensionScore>,
): Profile | null {
  // Order matters: more specific patterns first, more general last.

  // A — governance-priority: high experimentation/usage, low security
  if (
    (isHigh(scores, 'current-ai-usage') ||
      isHigh(scores, 'experimentation-culture')) &&
    isLow(scores, 'security-posture')
  ) {
    return 'governance-priority';
  }

  // D — visibility-priority: low leadership, high experimentation
  // Distinct from A because security can be OK or weak.
  if (
    isLow(scores, 'leadership-buy-in') &&
    isHigh(scores, 'experimentation-culture')
  ) {
    return 'visibility-priority';
  }

  // B — capability-priority: high leadership, low training
  if (
    isHigh(scores, 'leadership-buy-in') &&
    isLow(scores, 'training-infrastructure')
  ) {
    return 'capability-priority';
  }

  // C — adoption-priority: low usage, high literacy
  if (
    isLow(scores, 'current-ai-usage') &&
    isHigh(scores, 'ai-literacy-level')
  ) {
    return 'adoption-priority';
  }

  // E — use-case-priority: strong security, low quick-win
  if (
    isHigh(scores, 'security-posture') &&
    isLow(scores, 'quick-win-potential')
  ) {
    return 'use-case-priority';
  }

  return null;
}
