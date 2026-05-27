// LMS harness — canonical course config + view types.
//
// Single source of truth for any course rendered by the shared LMS shell
// (CourseShell, LMSSidebar, LMSTopBar, LMSMobileNav). Courses define a
// CourseConfig once; the harness handles sidebar grouping, progress
// resolution, and module-body template selection.
//
// To add a new course: write a CourseConfig in
// content/courses/<slug>/course-config.ts, point a route at it, pick a
// bodyTemplate per module. See src/lib/lms/README.md for the walkthrough.

import type { ReactNode } from 'react';

// ─── Identity ────────────────────────────────────────────────────────────────

export type CourseSlug = 'foundation' | 'aibi-s' | (string & {});

// ─── Brand + terminology ─────────────────────────────────────────────────────

export interface CourseBrand {
  readonly name: string;            // 'AiBI-Foundation' | 'Banking AI Specialist'
  readonly shortCode: string;       // 'AiBI-Foundation' | 'AiBI-S'
  readonly wordmark: string;        // displayed in sidebar (may equal shortCode)
  readonly accentColorVar: string;  // 'var(--gold)' | 'var(--ink)' (was Ledger; now mockup)
}

export interface CourseTerminology {
  readonly itemLabel: string;       // 'Module' | 'Unit'
  readonly sectionLabel: string;    // 'Pillar' | 'Phase'
  readonly pluralItemLabel?: string;
}

// ─── Module body template ────────────────────────────────────────────────────

export type ModuleBodyTemplate =
  | 'tabbed'   // Foundation pattern — Learn / Practice / Apply tabs
  | 'linear'   // AiBI-S pattern — sequential steps with progress dots
  | 'custom';  // Course-defined layout, harness provides header + nav only

// ─── Section + module (flat with section ref) ────────────────────────────────

export interface CourseSection {
  readonly id: string;              // 'awareness' | 'foundation-phase'
  readonly label: string;
  readonly description?: string;
  readonly colorVar?: string;
}

export interface CourseModule {
  readonly id: string;              // stable: 'm-01' | 'u-1.1'
  readonly number: string | number; // display form: 1 | '1.1' | 'A'
  readonly title: string;
  readonly href: string;            // '/courses/foundation/program/1'
  readonly sectionId: string;       // references CourseSection.id
  readonly estimatedMinutes: number;
  readonly bodyTemplate: ModuleBodyTemplate;
  readonly isComingSoon?: boolean;
}

// ─── AI features (carried over from old course-harness) ──────────────────────

export interface AIFeatureDef {
  readonly provider: 'anthropic' | 'openai' | 'gemini';
  readonly model: string;
  readonly maxTokens: number;
  readonly maxTurns?: number;
  readonly rateLimit?: {
    readonly perLearnerDaily?: number;
  };
}

export interface AIBudget {
  readonly perCourseDailyCents?: number;
}

// ─── Cross-course nav + certificate ──────────────────────────────────────────

export interface CrossCourseLink {
  readonly label: string;
  readonly href: string;
}

export interface CertificateRequirement {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly requiredCount?: number;
}

// ─── The canonical CourseConfig ──────────────────────────────────────────────

export interface CourseConfig {
  readonly slug: CourseSlug;
  // Stripe / Supabase write key. Decoupled from slug to preserve DB
  // compatibility for renamed courses (e.g. Foundation slug='foundation'
  // but dbProductKey='aibi-p' for pre-rename enrollments).
  readonly dbProductKey: string;
  readonly brand: CourseBrand;
  readonly terminology: CourseTerminology;
  readonly promise: string;
  readonly audience: string;
  readonly sections: readonly CourseSection[];
  readonly modules: readonly CourseModule[];
  readonly aiFeatures?: Readonly<Record<string, AIFeatureDef>>;
  readonly aiBudget?: AIBudget;
  readonly certificateRequirements?: readonly CertificateRequirement[];
  readonly crossCourseNav?: readonly CrossCourseLink[];
}

// ─── Runtime state ───────────────────────────────────────────────────────────

export interface CourseProgress {
  readonly completedModuleIds: readonly string[];
  readonly currentModuleId: string | null;  // null = pre-enrollment / not started
}

// ─── Resolved view (what renderers consume) ──────────────────────────────────

export type ModuleStatus = 'completed' | 'current' | 'locked' | 'coming-soon';

export interface ResolvedCourseModule extends CourseModule {
  readonly status: ModuleStatus;
}

export interface ResolvedCourseSection extends CourseSection {
  readonly modules: readonly ResolvedCourseModule[];
}

export interface ResolvedCourseView {
  readonly config: CourseConfig;
  readonly sections: readonly ResolvedCourseSection[];
  readonly modules: readonly ResolvedCourseModule[];   // flat, for non-grouped views
  readonly currentModule: ResolvedCourseModule | null;
  readonly completedCount: number;
  readonly totalModuleCount: number;                    // excludes coming-soon
}

// ─── Tab primitive (used by Tabbed body template) ────────────────────────────

export interface TabDef {
  readonly id: string;
  readonly label: string;
  readonly sublabel?: string;
  readonly disabled?: boolean;
  readonly content: ReactNode;
}
