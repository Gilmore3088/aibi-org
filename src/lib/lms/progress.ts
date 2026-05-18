// LMS harness — progress resolution.
//
// Pure functions over CourseConfig + CourseProgress. No I/O, no React,
// no Supabase. The caller is responsible for fetching the learner's
// progress from whichever data source applies (Supabase, sessionStorage,
// memory, tests).

import type {
  CourseConfig,
  CourseProgress,
  ModuleStatus,
  ResolvedCourseModule,
  ResolvedCourseSection,
  ResolvedCourseView,
} from './types';

function resolveStatus(
  moduleId: string,
  isComingSoon: boolean | undefined,
  progress: CourseProgress | null,
): ModuleStatus {
  if (isComingSoon) return 'coming-soon';
  if (!progress) return 'locked';
  if (progress.completedModuleIds.includes(moduleId)) return 'completed';
  if (progress.currentModuleId === moduleId) return 'current';
  return 'locked';
}

/**
 * Merge a static CourseConfig with per-request CourseProgress to produce
 * a ResolvedCourseView. Pure function — safe to call in server components.
 *
 * If progress is null (pre-enrollment / anonymous), every non-coming-soon
 * module resolves to 'locked' and currentModule is null.
 */
export function resolveCourseView(
  config: CourseConfig,
  progress: CourseProgress | null,
): ResolvedCourseView {
  const modules: ResolvedCourseModule[] = config.modules.map((mod) => ({
    ...mod,
    status: resolveStatus(mod.id, mod.isComingSoon, progress),
  }));

  const sections: ResolvedCourseSection[] = config.sections.map((section) => ({
    ...section,
    modules: modules.filter((m) => m.sectionId === section.id),
  }));

  const currentModule = modules.find((m) => m.status === 'current') ?? null;
  const completedCount = modules.filter((m) => m.status === 'completed').length;
  const totalModuleCount = modules.filter((m) => !m.isComingSoon).length;

  return {
    config,
    sections,
    modules,
    currentModule,
    completedCount,
    totalModuleCount,
  };
}

/**
 * Look up a module by its public route param (id or stringified number).
 * Used by [module] page params to resolve the active module.
 */
export function findModule(
  view: ResolvedCourseView,
  idOrNumber: string,
): ResolvedCourseModule | null {
  return (
    view.modules.find((m) => m.id === idOrNumber) ??
    view.modules.find((m) => String(m.number) === idOrNumber) ??
    null
  );
}

/**
 * True when a learner is permitted to access a given module. Locked means
 * they need to complete prerequisites first.
 */
export function canAccessModule(
  view: ResolvedCourseView,
  moduleId: string,
): boolean {
  const m = view.modules.find((x) => x.id === moduleId);
  if (!m) return false;
  return m.status === 'current' || m.status === 'completed';
}
