// AiBI-Foundation course configuration.
//
// Two exports:
//   - `foundationCourseConfig` — the canonical harness CourseConfig from
//     @/lib/lms. Lean: identity, brand, terminology, sections, modules,
//     certificate requirements. Consumed by LMS shell components.
//   - `FOUNDATION_MODULES_META` — Foundation-specific per-module data
//     (pillar, keyOutput, learnerOutcome) keyed by harness module id.
//     Consumed by adapters and pages that need pillar grouping or
//     module-level copy. Lives alongside the harness config rather
//     than inside it so the harness CourseModule shape stays small
//     and other courses (AiBI-S, future courses) don't carry
//     Foundation-specific fields.
//
// `dbProductKey: 'aibi-p'` is the legacy Stripe / Supabase write key.
// Preserved for webhook retries and pre-rename `course_enrollments`
// rows. See src/lib/products/normalize.ts for the boundary shim. The
// public-facing slug is 'foundation'.

import type { CourseConfig } from '@/lib/lms';
import type { Pillar } from './types';
import { modules } from './modules';
import {
  FOUNDATION_ARTIFACTS,
  FOUNDATION_CERTIFICATE_REQUIREMENTS,
  FOUNDATION_PRACTICE_REPS,
} from '@content/practice-reps/foundation-program';

// ─── Foundation-specific module metadata ─────────────────────────────────────

export interface FoundationModuleMeta {
  readonly pillar: Pillar;
  readonly keyOutput: string;
  readonly learnerOutcome: string;
}

export const FOUNDATION_MODULES_META: Readonly<Record<string, FoundationModuleMeta>> =
  Object.fromEntries(
    modules.map((mod) => [
      mod.id,
      {
        pillar: mod.pillar,
        keyOutput: mod.keyOutput,
        learnerOutcome:
          `Use AI more safely and practically for ${mod.keyOutput.toLowerCase()}.`,
      },
    ]),
  );

// ─── Sections: the four learning pillars ─────────────────────────────────────
//
// Pillar colors come from the Ledger token set. The sidebar groups by
// CourseSection.id; each module references its pillar via sectionId.

const FOUNDATION_SECTIONS = [
  {
    id: 'awareness',
    label: 'Awareness',
    description:
      'Identifying AI opportunities and regulatory boundaries in community banking.',
    colorVar: 'var(--ledger-accent)',
  },
  {
    id: 'understanding',
    label: 'Understanding',
    description:
      'Platform mastery and safe-use guardrails — what you already have, how to activate it.',
    colorVar: 'var(--ledger-accent-2)',
  },
  {
    id: 'creation',
    label: 'Creation',
    description:
      'Building skills that make AI output institutional-grade.',
    colorVar: 'var(--ledger-accent)',
  },
  {
    id: 'application',
    label: 'Application',
    description:
      'Real-world automation and the assessed work product.',
    colorVar: 'var(--ledger-accent-2)',
  },
] as const;

// ─── The harness config ──────────────────────────────────────────────────────

export const foundationCourseConfig: CourseConfig = {
  slug: 'foundation',
  dbProductKey: 'aibi-p',
  brand: {
    name: 'AiBI-Foundation',
    shortCode: 'AiBI-Foundation',
    wordmark: 'AiBI Foundation',
    accentColorVar: 'var(--ledger-accent)',
  },
  terminology: {
    itemLabel: 'Module',
    sectionLabel: 'Pillar',
  },
  promise:
    'Help every community banking employee use AI safely, confidently, and practically in daily work.',
  audience: 'Community bank and credit union employees',
  sections: FOUNDATION_SECTIONS,
  modules: modules.map((mod) => ({
    id: mod.id,
    number: mod.number,
    title: mod.title,
    href: `/courses/foundation/program/${mod.number}`,
    sectionId: mod.pillar,
    estimatedMinutes: mod.estimatedMinutes,
    bodyTemplate: 'tabbed' as const,
  })),
  certificateRequirements: FOUNDATION_CERTIFICATE_REQUIREMENTS.map((req) => ({
    id: req.id,
    label: req.label,
    description: req.description,
    requiredCount: req.requiredCount,
  })),
};

// ─── Convenience exports ─────────────────────────────────────────────────────

/** Total course duration in minutes. Derived from modules. */
export const FOUNDATION_TOTAL_MINUTES = foundationCourseConfig.modules.reduce(
  (total, mod) => total + mod.estimatedMinutes,
  0,
);

/** Look up Foundation-specific metadata by harness module id. */
export function getFoundationModuleMeta(moduleId: string): FoundationModuleMeta | null {
  return FOUNDATION_MODULES_META[moduleId] ?? null;
}

/** Re-export the standalone content collections so downstream code can
 *  pull everything Foundation-related from this barrel. */
export {
  FOUNDATION_ARTIFACTS,
  FOUNDATION_CERTIFICATE_REQUIREMENTS,
  FOUNDATION_PRACTICE_REPS,
};
