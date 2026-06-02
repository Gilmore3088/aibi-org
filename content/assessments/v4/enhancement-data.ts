// AiBI In-Depth — enhancement-data layer.
//
// 2026-06-01 redacted: the prior version of this file shipped fabricated
// vendor verdicts ("Allow / Gate / Decline" on named vendors), unsourced
// examiner MRA themes, and a "senior reviewer · last reviewed" attribution
// that did not correspond to any real reviewer or review process. None of
// that may appear on a paid report without a real, citable source.
//
// This file is intentionally near-empty pending real, source-backed
// content. Specifically:
//   - Vendor intelligence requires a maintained AI-feature matrix authored
//     and dated by a named institute reviewer.
//   - MRA / examiner themes require either a quoted public examiner
//     reference or a redacted-real source with permission to publish.
//   - Reviewer attribution requires a real reviewer name + real review
//     date tied to a real review process.
//
// Until those sources exist, the report renders only the templated
// guidance authored in action-packet.ts and the live AI personalization
// (which is grounded in the taker's own answers and the role's templated
// guidance — not in any unverified third-party claims).
//
// Helpers below intentionally return null / [] so any caller renders
// nothing. Do NOT re-seed plausible-looking distributions, vendor
// verdicts, or examiner themes here. If a real source becomes available,
// add it with a citation field and a publishedAt / reviewedBy line.

import type { Dimension } from './types';

// ── Vendor intelligence — empty until real source ─────────────────────────

export interface VendorIntel {
  readonly name: string;
  readonly category: 'core' | 'los' | 'marketing' | 'fraud';
  readonly aiFeature: string;
  readonly verdict: 'allow' | 'gate' | 'decline';
  readonly evidence: string;
  readonly action: string;
  readonly reviewedAt: string;
  readonly sourceUrl?: string;
}

export function getVendorIntel(_vendorName: string | undefined): VendorIntel | null {
  return null;
}

// ── Examiner themes — empty until real source ─────────────────────────────

export interface MraTheme {
  readonly regulator: string;
  readonly theme: string;
  readonly source: string;
  readonly sourceUrl?: string;
  readonly howThisPacketPreempts: string;
}

export function getMraThemes(_regulator: string | undefined): readonly MraTheme[] {
  return [];
}

// ── Regulatory citation registry — real, public references ────────────────
//
// Kept because these are public federal regulations and can be cited
// directly. Used by future per-action-step citation chips. No claim of
// endorsement, only that the regulation exists and applies.

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
      label: 'SR 11-7 · Model risk management',
      explainer: 'Inventory, validation, and ongoing monitoring of model-based tools.',
    },
  ],
  'compliance-explainability': [
    {
      label: 'ECOA / Reg B §1002.9(a)(2)',
      explainer: 'Statement of specific principal reasons for adverse action.',
    },
  ],
  'data-security-guardrails': [
    {
      label: 'GLBA Safeguards Rule · 16 CFR 314',
      explainer: 'Information security program elements.',
    },
  ],
  'workflow-orchestration': [
    {
      label: 'FFIEC IT Handbook · Operations',
      explainer: 'Documented and reviewable workflows.',
    },
  ],
  'bounded-autonomy-human-review': [
    {
      label: 'AIEOG AI Lexicon · Human-in-the-loop',
      explainer: 'Bounded autonomy and review checkpoints.',
    },
  ],
  'vendor-risk-interoperability': [
    {
      label: 'Interagency TPRM Guidance (2023)',
      explainer: 'Third-party risk management for vendor features.',
    },
  ],
  'governance-roles-human-capital': [
    {
      label: 'FFIEC IT Handbook · Management',
      explainer: 'Roles, capability, and training accountability.',
    },
  ],
};

// ── Peer benchmarking — REMOVED ────────────────────────────────────────────
// Prior version exported a seeded peer-band distribution that the report
// rendered as if it were real FDIC data. It was not. Re-introduce only
// when joined to live, sourceable FDIC data. Callers should check for
// null and render nothing.

export function getPeerBenchmark(): null {
  return null;
}

// ── Quantified business case — REMOVED ────────────────────────────────────
// Prior version used a seeded wage table presented as "FDIC peer-band
// median." It was not sourced. Re-introduce only with a real wage source
// citation. Callers should check for null and render nothing.

export function getBusinessCase(): null {
  return null;
}
