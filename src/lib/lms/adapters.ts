// LMS harness — adapters between harness types and other parts of the app.
//
// Adapters are used at boundaries where the harness CourseConfig touches
// data shapes that predate the harness (e.g., Foundation's enrollment row
// stored as completed_modules: number[]). Keep these pure and obvious —
// the harness should be the single source of truth, and adapters exist
// only to bridge to existing storage / external systems.

import type { CourseProgress, ResolvedCourseModule } from './types';

/**
 * Build a CourseProgress from Foundation's legacy storage shape:
 *   { completed_modules: number[], current_module: number }
 *
 * Foundation tracked progress by module number rather than module id.
 * Newer courses should store completedModuleIds + currentModuleId
 * directly and skip this adapter.
 */
export function progressFromLegacyNumbers(
  modules: readonly { readonly id: string; readonly number: string | number }[],
  legacy: {
    readonly completed_modules: readonly number[];
    readonly current_module: number;
  } | null,
): CourseProgress | null {
  if (!legacy) return null;

  const numberToId = new Map(modules.map((m) => [String(m.number), m.id]));

  const completedModuleIds = legacy.completed_modules
    .map((n) => numberToId.get(String(n)))
    .filter((id): id is string => id !== undefined);

  const currentModuleId = numberToId.get(String(legacy.current_module)) ?? null;

  return { completedModuleIds, currentModuleId };
}

/**
 * Pick the "next up" module — the current module, or the earliest locked
 * module if there is no current. Used by dashboard cards and Foundation's
 * post-enrollment landing page.
 */
export function getNextModule(
  modules: readonly ResolvedCourseModule[],
): ResolvedCourseModule | null {
  return (
    modules.find((m) => m.status === 'current') ??
    modules.find((m) => m.status === 'locked') ??
    null
  );
}
