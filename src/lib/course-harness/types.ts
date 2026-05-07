// Course harness types — static config, runtime progress, and the merged view.

import type { ReactNode } from 'react';

// ================= STATIC CONFIG (per course, serializable) =================

export interface CourseBrand {
  readonly name: string;              // 'Banking AI Practitioner'
  readonly shortCode: string;         // 'AiBI-Practitioner'
  readonly wordmark: string;          // displayed in sidebar
  readonly accentColorVar: string;    // 'var(--color-terra)' | 'var(--color-cobalt)' | ...
}

export interface CourseTerminology {
  readonly itemLabel: string;         // 'Module' | 'Unit' | 'Session'
  readonly sectionLabel: string;      // 'Pillar' | 'Phase' | 'Theme'
  readonly pluralItemLabel?: string;  // optional override — defaults to itemLabel + 's'
}

export interface CourseItem {
  readonly id: string;                // stable unique per course: 'm-01', 'u-1.1'
  readonly number: string | number;   // display form: 1, '1.1', 'A'
  readonly title: string;
  readonly href: string;              // route to this item
  readonly estimatedMinutes?: number;
  readonly isComingSoon?: boolean;    // true = unauthored, not yet buildable
}

export interface CourseSection {
  readonly id: string;                // 'awareness' | 'foundation' | 'theme-kyc'
  readonly label: string;             // display label
  readonly colorVar?: string;         // optional per-section color
  readonly items: readonly CourseItem[];
}

export interface CrossCourseLink {
  readonly label: string;
  readonly href: string;
}

export interface AIFeatureDef {
  readonly provider: 'anthropic' | 'openai' | 'gemini';
  readonly model: string;
  readonly maxTokens: number;
  readonly maxTurns?: number;
  readonly rateLimit?: {
    readonly perLearnerDaily?: number;
  };
}

export interface CourseConfig {
  readonly slug: string;                  // 'aibi-p' | 'aibi-s' | 'aibi-l'
  readonly brand: CourseBrand;
  readonly terminology: CourseTerminology;
  readonly sections: readonly CourseSection[];
  readonly crossCourseNav?: readonly CrossCourseLink[];
  readonly aiFeatures?: Readonly<Record<string, AIFeatureDef>>;
  readonly aiBudget?: {
    readonly perCourseDailyCents?: number;
  };
}

// ================= RUNTIME STATE (per user, per request) =================

export interface CourseProgress {
  readonly completedItemIds: readonly string[];
  readonly currentItemId: string | null;  // null = pre-enrollment / not started
}

// ================= MERGED VIEW (what renderers consume) =================

export type ItemStatus = 'completed' | 'current' | 'locked' | 'coming-soon';

export interface ResolvedCourseItem extends CourseItem {
  readonly status: ItemStatus;
}

export interface ResolvedCourseSection extends Omit<CourseSection, 'items'> {
  readonly items: readonly ResolvedCourseItem[];
}

export interface ResolvedCourseView {
  readonly config: CourseConfig;
  readonly sections: readonly ResolvedCourseSection[];
  readonly currentItem: ResolvedCourseItem | null;
  readonly completedCount: number;
  readonly totalItemCount: number;          // items minus coming-soon
}

// ================= TAB PRIMITIVES (H2) =================

export interface TabDef {
  readonly id: string;
  readonly label: string;
  readonly sublabel: string;
  readonly disabled?: boolean;
  readonly content: ReactNode;
}
