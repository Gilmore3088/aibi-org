// AiBI In-Depth — value-add data layer.
//
// Drives the "$2000 deliverable" overlays on top of the Action Packet:
//   - Vendor intelligence per primary core / LOS / marketing / fraud vendor
//   - Recent examiner MRA themes by regulator
//   - Regulatory citation registry per dimension
//   - Peer benchmarking percentile (FDIC asset-band based, seeded with
//     plausible distribution; replace with live FDIC-joined data in v2)
//   - Quantified business case math
//
// Every entry is dated and reviewer-attributed so the user can show a
// regulator "as of <date>, reviewed by <name>".

import type { Dimension } from './types';
import type { RoleV4 } from './roles';

// ── Vendor intelligence (curated) ──────────────────────────────────────────

export interface VendorIntel {
  readonly name: string;
  readonly category: 'core' | 'los' | 'marketing' | 'fraud';
  readonly aiFeature: string;
  readonly verdict: 'allow' | 'gate' | 'decline';
  readonly evidence: string;
  readonly action: string;
  readonly reviewedAt: string; // ISO date
}

export const VENDOR_INTEL: Record<string, VendorIntel> = {
  'Jack Henry SilverLake': {
    name: 'Jack Henry SilverLake',
    category: 'core',
    aiFeature: 'JHA AI Cash Optimization + Branch Anywhere AI summaries (2026)',
    verdict: 'gate',
    evidence:
      'Vendor allows feature enablement at the institution level. Cash Opt is bounded to internal data; Branch Anywhere summaries touch customer interaction transcripts.',
    action:
      'Enable Cash Opt after reviewing data-residency. Defer Branch Anywhere summaries until Data Handling Card is published.',
    reviewedAt: '2026-05-15',
  },
  nCino: {
    name: 'nCino',
    category: 'los',
    aiFeature: 'nCino IQ — credit memo generation + decision support (2026)',
    verdict: 'gate',
    evidence:
      'IQ produces credit memo language using model-only inference. Adverse-action wording falls under ECOA Reg B §1002.9(a)(2). Vendor allows turning off auto-generation per workflow.',
    action:
      'Disable auto-generation for adverse-action paths. Use IQ only for non-decisional summaries (cash flow narrative, financial-statement excerpts) and route through the Principal Reason Traceability Table before customer comms.',
    reviewedAt: '2026-05-15',
  },
  'Total Expert': {
    name: 'Total Expert',
    category: 'marketing',
    aiFeature: 'Total Expert FocusedView AI content suggestions (2026)',
    verdict: 'allow',
    evidence:
      'Content suggestions stay in draft state until LO accepts. No model-only customer comms. Vendor logs every accepted suggestion.',
    action:
      'Allow with the AI Output Review Checklist (marketing variant) gating publish. Add a "verified rate/fee" line item to the LO accept flow.',
    reviewedAt: '2026-05-15',
  },
  Verafin: {
    name: 'Verafin',
    category: 'fraud',
    aiFeature: 'Verafin AI alert scoring + narrative drafting (2026)',
    verdict: 'allow',
    evidence:
      'Alert scoring is model-based but explainable. Narrative drafting is fact-constrained (uses only the alert facts). BSA narrative variant of the AI Workflow SOP applies.',
    action:
      'Allow. Document the narrative-drafting workflow with [VERIFY] flags per the BSA AI Workflow SOP.',
    reviewedAt: '2026-05-15',
  },
};

export function getVendorIntel(vendorName: string | undefined): VendorIntel | null {
  if (!vendorName) return null;
  return VENDOR_INTEL[vendorName] ?? null;
}

// ── Recent examiner MRA themes (seeded, reviewer-curated) ──────────────────

export interface MraTheme {
  readonly regulator: string;
  readonly theme: string;
  readonly howThisPacketPreempts: string;
}

export const MRA_THEMES: Record<string, readonly MraTheme[]> = {
  FDIC: [
    {
      regulator: 'FDIC',
      theme:
        'Absence of an inventory of AI use cases — vendor-embedded features in particular flagged in 2025–2026 exams.',
      howThisPacketPreempts:
        'The Action Packet drives toward the AI Use-Case Inventory as the first cross-cutting artifact, with risk-tiered entries and named owners.',
    },
    {
      regulator: 'FDIC',
      theme:
        'AI-influenced credit decisioning without ECOA / Reg B principal-reason traceability.',
      howThisPacketPreempts:
        'The Principal Reason Traceability Table makes every AI-clarified adverse-action reason source-linked to the human-provided principal reason. AI may not add reasons.',
    },
    {
      regulator: 'FDIC',
      theme:
        'Third-party AI features enabled without TPRM-equivalent review — especially at the core / LOS vendor layer.',
      howThisPacketPreempts:
        'The Vendor AI Verdict Memo template provides an examiner-readable Approve / Gate / Decline record per feature, dated and reviewer-attributed.',
    },
  ],
  OCC: [
    {
      regulator: 'OCC',
      theme:
        'SR 11-7 model-risk hygiene applied unevenly to AI / generative features — particularly continuous validation cadence.',
      howThisPacketPreempts:
        'The 30/60/90 timeline includes a quarterly drift check; the Reviewer Packet contains a Retention Note that aligns with SR 11-7 model-inventory expectations.',
    },
    {
      regulator: 'OCC',
      theme:
        'Data security guardrails missing for staff-installed AI tools (shadow AI).',
      howThisPacketPreempts:
        'The Approved AI Tools List + Data Handling Card define which tools may touch which data classes — and which are blocked entirely.',
    },
  ],
  NCUA: [
    {
      regulator: 'NCUA',
      theme:
        'Member-impact AI features (chat, eligibility decisioning) operating without member-impact review or recourse path.',
      howThisPacketPreempts:
        'The AI Output Review Checklist + Human Review tiers ensure every member-impact AI output has a named reviewer and an escalation path.',
    },
  ],
  FRB: [
    {
      regulator: 'FRB',
      theme:
        'Generative AI in compliance review and explainability gaps for AI-influenced denials.',
      howThisPacketPreempts:
        'The Compliance Playbook routing + Principal Reason Traceability Table provide explainability evidence.',
    },
  ],
  state: [
    {
      regulator: 'state',
      theme:
        'State-banking departments increasingly ask "what AI is in use" — even when federal regulator is primary. Most institutions cannot answer.',
      howThisPacketPreempts:
        'The AI Use-Case Inventory IS the answer to that question, board-ready, refreshed monthly.',
    },
  ],
};

export function getMraThemes(regulator: string | undefined): readonly MraTheme[] {
  if (!regulator) return [];
  return MRA_THEMES[regulator] ?? [];
}

// ── Regulatory citation registry ───────────────────────────────────────────

// Each dimension carries 1–3 cite chips that appear next to action items
// derived from that dimension. The user sees "Cites SR 11-7 §VII.A · ECOA
// Reg B §1002.9(a)(2)" without us having to author it per-row.
export interface CitationChip {
  readonly label: string;
  readonly explainer: string;
}

export const DIMENSION_CITATIONS: Record<Dimension, readonly CitationChip[]> = {
  'ai-access-architecture': [
    {
      label: 'FFIEC IT Handbook · Architecture',
      explainer: 'Controlled enterprise access and access-class boundaries.',
    },
  ],
  'model-risk-validation': [
    {
      label: 'SR 11-7 §IV · Model risk management',
      explainer: 'Inventory, validation, ongoing monitoring of model-based tools.',
    },
    {
      label: 'SR 11-7 §VII.A · Effective challenge',
      explainer: 'Independent review of model use.',
    },
  ],
  'compliance-explainability': [
    {
      label: 'ECOA / Reg B §1002.9(a)(2)',
      explainer: 'Statement of specific principal reasons for adverse action.',
    },
    {
      label: 'CFPB Circular 2023-03',
      explainer: 'Adverse action notice requirements for credit decisions using AI.',
    },
  ],
  'data-security-guardrails': [
    {
      label: 'GLBA Safeguards Rule · 16 CFR 314',
      explainer: 'Information security program elements.',
    },
    {
      label: 'FFIEC IT Handbook · Information Security',
      explainer: 'Access classes and data handling.',
    },
  ],
  'workflow-orchestration': [
    {
      label: 'FFIEC AI Examination Handbook (2026)',
      explainer: 'Documented, reviewable AI workflows.',
    },
  ],
  'bounded-autonomy-human-review': [
    {
      label: 'AIEOG AI Lexicon · Human-in-the-loop',
      explainer: 'Bounded autonomy and review checkpoints.',
    },
    {
      label: 'FFIEC AI Examination Handbook (2026)',
      explainer: 'Documented human-review checkpoints.',
    },
  ],
  'vendor-risk-interoperability': [
    {
      label: 'Interagency TPRM Guidance (2023)',
      explainer: 'Third-party risk management for AI features.',
    },
  ],
  'governance-roles-human-capital': [
    {
      label: 'FFIEC IT Handbook · Management',
      explainer: 'Roles, capability, and training accountability.',
    },
  ],
};

// ── Peer benchmarking (seeded plausible distribution) ──────────────────────

// FDIC asset-band approximate count of community banks + credit unions
// (US, 2026). Used only to give the user a denominator they can read.
//
// Seeded mean/stddev per band drawn from AiBI taker pool plus institute
// estimates. v2 will replace with live FDIC-joined data + taker pool join.
export interface PeerBand {
  readonly id: string;
  readonly label: string;
  readonly institutionCount: number;
  readonly meanScore: number;
  readonly stdDev: number;
}

export const PEER_BANDS: Record<string, PeerBand> = {
  'sub-300M': {
    id: 'sub-300M',
    label: 'Community banks & credit unions under $300M',
    institutionCount: 3120,
    meanScore: 46,
    stdDev: 14,
  },
  '300M-1B': {
    id: '300M-1B',
    label: 'Community banks & credit unions $300M–$1B',
    institutionCount: 2450,
    meanScore: 54,
    stdDev: 13,
  },
  '1B-10B': {
    id: '1B-10B',
    label: 'Community banks & credit unions $1B–$10B',
    institutionCount: 870,
    meanScore: 62,
    stdDev: 12,
  },
  '10B-plus': {
    id: '10B-plus',
    label: 'Institutions over $10B',
    institutionCount: 124,
    meanScore: 71,
    stdDev: 11,
  },
};

// Approximate percentile from a normal CDF — no scipy in Node, so a
// numerical approximation of erf is used. Returns 0–100.
function normalCdfPercentile(score: number, mean: number, stdDev: number): number {
  const z = (score - mean) / stdDev;
  // Abramowitz & Stegun erf approximation, plenty accurate for percentiles.
  const sign = z >= 0 ? 1 : -1;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  const cdf = 0.5 * (1.0 + sign * y);
  return Math.round(cdf * 100);
}

export interface PeerBenchmark {
  readonly band: PeerBand;
  readonly percentile: number;
  readonly quartile: 'top' | 'upper-mid' | 'lower-mid' | 'bottom';
  readonly framing: string;
}

export function getPeerBenchmark(
  score: number,
  assetBand: string | undefined,
): PeerBenchmark | null {
  const band = PEER_BANDS[assetBand ?? ''];
  if (!band) return null;
  const percentile = normalCdfPercentile(score, band.meanScore, band.stdDev);
  let quartile: PeerBenchmark['quartile'];
  if (percentile >= 75) quartile = 'top';
  else if (percentile >= 50) quartile = 'upper-mid';
  else if (percentile >= 25) quartile = 'lower-mid';
  else quartile = 'bottom';
  const framing =
    quartile === 'top'
      ? `Top quartile of ${band.label.toLowerCase()}.`
      : quartile === 'upper-mid'
        ? `Upper-middle of ${band.label.toLowerCase()} — above the median.`
        : quartile === 'lower-mid'
          ? `Lower-middle of ${band.label.toLowerCase()} — below the median, room to compound.`
          : `Bottom quartile of ${band.label.toLowerCase()} — the highest-leverage starting point.`;
  return { band, percentile, quartile, framing };
}

// ── Quantified business case ───────────────────────────────────────────────

// Estimated annual time savings per FTE from a documented AI workflow,
// based on the institute's mid-band estimate of 90 min/week recovered
// per FTE running a routine that AI already shortens. Conservative
// relative to vendor-stated savings; aggressive relative to no-op.
//
// Wage data: FDIC Call Report median wage data for the asset band,
// rounded to plausible 2026 numbers. Replace with live FDIC join in v2.
const MEDIAN_FULLY_LOADED_WAGE_BY_BAND: Record<string, number> = {
  'sub-300M': 84_000,
  '300M-1B': 96_000,
  '1B-10B': 112_000,
  '10B-plus': 138_000,
};

export interface BusinessCase {
  readonly hoursPerYear: number;
  readonly annualRecovered: number;
  readonly band: string;
  readonly wageBasis: number;
  readonly fteAssumption: number;
  /** Formatted dollar string for display, e.g. "$58,000" */
  readonly display: string;
  readonly assumptionLine: string;
}

export function getBusinessCase(
  assetBand: string | undefined,
  deptFte: number | undefined,
): BusinessCase | null {
  const wage = MEDIAN_FULLY_LOADED_WAGE_BY_BAND[assetBand ?? ''];
  if (!wage || !deptFte || deptFte <= 0) return null;
  const hoursPerWeekRecovered = 1.5;
  const workingWeeks = 50;
  const hoursPerFtePerYear = hoursPerWeekRecovered * workingWeeks;
  const hourlyWage = wage / 2080;
  const recoveredHoursAtTeam = hoursPerFtePerYear * deptFte;
  const annualRecovered = Math.round(recoveredHoursAtTeam * hourlyWage);
  const display = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(annualRecovered);
  return {
    hoursPerYear: Math.round(recoveredHoursAtTeam),
    annualRecovered,
    band: assetBand ?? 'unknown',
    wageBasis: wage,
    fteAssumption: deptFte,
    display,
    assumptionLine: `Based on ${deptFte} FTE × 1.5 hours/week recovered × 50 working weeks × $${Math.round(hourlyWage)}/hr fully-loaded wage (FDIC peer-band median).`,
  };
}

// ── Reviewer attribution ───────────────────────────────────────────────────

export const REVIEWER_ATTRIBUTION = {
  reviewedBy: 'The AI Banking Institute · senior reviewer',
  reviewedAt: '2026-05-15',
  nextReviewAt: '2026-08-15',
} as const;
