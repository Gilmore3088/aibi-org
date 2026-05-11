// Derives presentation data for the In-Depth Briefing from a loaded
// assessment response. The briefing is a personalized "ledger-style"
// dossier (see docs/superpowers/audits/2026-05-11-in-depth-briefing-design/).
//
// Real (driven by user data): composite score, tier, dimension scores,
// completion date, re-read date, lowest/highest dimension picks.
//
// Templated (same for every reader, framed as "the framework"):
// regulatory exhibit, 12-week reference plan, generic action register
// scaffold. The user's lowest dimension feeds row 01 of the register and
// the "if you only act on one thing" callout so even the templated
// surfaces hook into real data.

import type { DimensionScore } from '@content/assessments/v2/scoring';
import type { Dimension } from '@content/assessments/v2/types';
import { DIMENSION_LABELS } from '@content/assessments/v2/types';
import { getStarterArtifact } from '@content/assessments/v2/starter-artifacts';
import type { Tier } from '@content/assessments/v2/scoring';

// ── Phase mapping ───────────────────────────────────────────────────────────
// The design's four-phase rubric (Curious / Coordinated / Programmatic /
// Native) maps cleanly onto our four tier ids. We keep the design's labels
// in the briefing surface only — the rest of the app still uses tier ids
// (starting-point / early-stage / building-momentum / ready-to-scale).

export type Phase = 'Curious' | 'Coordinated' | 'Programmatic' | 'Native';

const PHASE_BY_TIER: Record<Tier['id'], Phase> = {
  'starting-point': 'Curious',
  'early-stage': 'Coordinated',
  'building-momentum': 'Programmatic',
  'ready-to-scale': 'Native',
};

export function phaseForTier(tierId: Tier['id']): Phase {
  return PHASE_BY_TIER[tierId];
}

// ── Pillar mapping ──────────────────────────────────────────────────────────
// The design organizes dimensions under four pillars. Our 8 dimensions map
// to the same four pillars — the assignment below is editorial, not
// algorithmic. Strategy = direction + leadership; Risk = security +
// governance; Stack = tools + infrastructure; Talent = people fluency.

export type Pillar = 'Strategy' | 'Risk' | 'Stack' | 'Talent';

export const PILLAR_BY_DIMENSION: Record<Dimension, Pillar> = {
  'current-ai-usage': 'Stack',
  'experimentation-culture': 'Strategy',
  'ai-literacy-level': 'Talent',
  'quick-win-potential': 'Strategy',
  'leadership-buy-in': 'Strategy',
  'security-posture': 'Risk',
  'training-infrastructure': 'Talent',
  'builder-potential': 'Talent',
};

// ── Composite normalization ─────────────────────────────────────────────────
// Raw score range is 12–48 (12 questions × 1–4 points). We render a 0–100
// equivalent for the radar chart, the timeline rubric, and the composite
// score figure. Map: (raw - 12) / 36 * 100.

export function normalizeComposite(rawScore: number, maxScore = 48): number {
  const min = 12;
  const range = maxScore - min;
  if (range <= 0) return 0;
  const pct = ((rawScore - min) / range) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

// Normalize a single dimension score (raw N out of maxN) to 0–100.
export function normalizeDimension(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((score / maxScore) * 100)));
}

// ── Bar terrain ─────────────────────────────────────────────────────────────
// Design colors bars by terrain: oxblood < 50, terra 50–74, forest 75+.
export type Terrain = 'weak' | 'mid' | 'strong';

export function terrainForPct(pct: number): Terrain {
  if (pct < 50) return 'weak';
  if (pct < 75) return 'mid';
  return 'strong';
}

// ── Dimension presentation row ──────────────────────────────────────────────

export interface DimRow {
  readonly id: Dimension;
  readonly code: string; // D01..D08 for visual continuity with the design
  readonly label: string;
  readonly subhead: string;
  readonly pillar: Pillar;
  readonly raw: number;
  readonly max: number;
  readonly pct: number;
  readonly terrain: Terrain;
}

// One-line subhead per dimension, matched to the design's "small" caption
// under each dimension name. Short, descriptive, banker-direct.
const SUBHEADS: Record<Dimension, string> = {
  'current-ai-usage': 'Where AI shows up in the work today',
  'experimentation-culture': 'Whether trying new things is allowed',
  'ai-literacy-level': 'Shared vocabulary across the bench',
  'quick-win-potential': 'Workflows that pay back quickly',
  'leadership-buy-in': 'Sponsorship at the top of the org chart',
  'security-posture': 'Policy, controls, examiner posture',
  'training-infrastructure': 'How fluency gets to the rest of the staff',
  'builder-potential': 'People who can ship a workflow',
};

// Stable display order — Strategy → Risk → Stack → Talent — matches the
// design's grouping logic so pillar tags read as a vertical rhythm.
const DISPLAY_ORDER: readonly Dimension[] = [
  'leadership-buy-in',
  'experimentation-culture',
  'quick-win-potential',
  'security-posture',
  'current-ai-usage',
  'ai-literacy-level',
  'training-infrastructure',
  'builder-potential',
] as const;

export function buildDimRows(
  breakdown: Record<Dimension, DimensionScore>,
): readonly DimRow[] {
  return DISPLAY_ORDER.map((id, idx) => {
    const entry = breakdown[id];
    const raw = entry?.score ?? 0;
    const max = entry?.maxScore ?? 1;
    const pct = normalizeDimension(raw, max);
    return {
      id,
      code: `D0${idx + 1}`,
      label: DIMENSION_LABELS[id],
      subhead: SUBHEADS[id],
      pillar: PILLAR_BY_DIMENSION[id],
      raw,
      max,
      pct,
      terrain: terrainForPct(pct),
    };
  });
}

// ── Deep-dive selection ─────────────────────────────────────────────────────
// Pick six dimensions for the long-form section: top 3 + bottom 3 by pct.
// Falls back gracefully if scores collide (stable ordering by display
// position resolves ties).

export function selectDeepDives(rows: readonly DimRow[]): readonly DimRow[] {
  const sorted = [...rows].sort((a, b) => b.pct - a.pct);
  const top = sorted.slice(0, 3);
  const bottom = sorted.slice(-3);
  const out: DimRow[] = [];
  const seen = new Set<string>();
  for (const r of [...top, ...bottom]) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  // Re-sort the picks to alternate strong → weak for a reading rhythm.
  return out.sort((a, b) => b.pct - a.pct);
}

// Posture label for the deep-dive card head. The design uses qualitative
// posture strings rather than reprinting the score.
export function postureFor(pct: number): string {
  if (pct >= 85) return 'Top decile';
  if (pct >= 70) return 'Strong';
  if (pct >= 55) return 'Coordinated';
  if (pct >= 40) return 'Room to move';
  return 'Below cohort';
}

// ── Lowest-dimension hook ───────────────────────────────────────────────────
// The "if you only act on one thing" callout, the action register's row 01,
// and the deep-dive primary recommendation all hook off the lowest dim.

export interface LowestHook {
  readonly row: DimRow;
  readonly title: string;
  readonly subtitle: string;
}

export function lowestHook(rows: readonly DimRow[]): LowestHook {
  const lowest = [...rows].sort((a, b) => a.pct - b.pct)[0];
  const artifact = getStarterArtifact(lowest.id);
  return {
    row: lowest,
    title: artifact.title,
    subtitle: artifact.subtitle,
  };
}

// ── Re-read date ────────────────────────────────────────────────────────────
// 90 days from completion, rounded to a calendar day. Matches the design's
// "Re-read on schedule, not on instinct" copy block.

export function rereadDate(completedAt: string): string {
  const completed = new Date(completedAt);
  const reread = new Date(completed.getTime() + 90 * 24 * 60 * 60 * 1000);
  return reread.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Filing reference number — derives a stable short id from the profileId
// suffix for the masthead "Filing AIBI-..." strip. Pure display.
export function filingRef(profileId: string): string {
  const tail = profileId.replace(/-/g, '').slice(0, 8).toUpperCase();
  return `AIBI-${tail}`;
}
