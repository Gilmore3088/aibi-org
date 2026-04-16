// Pure progress logic — no Supabase imports, no side effects.
// SHELL-04: Forward-only module access enforcement.
// SHELL-05: Server-side check (called from Server Components).

import type { Module, Pillar } from '@content/courses/aibi-p';

export type ModuleStatus = 'completed' | 'current' | 'locked';
export type PillarStatus = 'completed' | 'in-progress' | 'locked';

/**
 * Determine whether a learner may access a given module.
 *
 * Rules (SHELL-04):
 *   - Module 1 is always accessible when enrolled.
 *   - Module N is accessible only when modules 1 through N-1 are ALL completed.
 *   - Gaps in completion (e.g., completed [1,2,4] but missing 3) block access to 5+.
 */
export function canAccessModule(
  moduleNumber: number,
  completedModules: readonly number[],
): boolean {
  if (moduleNumber === 1) return true;

  // Every prior module must be in completedModules
  for (let prior = 1; prior < moduleNumber; prior++) {
    if (!completedModules.includes(prior)) return false;
  }
  return true;
}

/**
 * Return the display status of a single module relative to the learner's progress.
 */
export function getModuleStatus(
  moduleNumber: number,
  completedModules: readonly number[],
  currentModule: number,
): ModuleStatus {
  if (completedModules.includes(moduleNumber)) return 'completed';
  if (moduleNumber === currentModule) return 'current';
  return 'locked';
}

/**
 * Return the aggregate status of a pillar based on its constituent modules.
 *
 * Completed: every module in the pillar appears in completedModules.
 * In-progress: at least one module is accessible (module 1 of the pillar is unlocked).
 * Locked: no module in the pillar is accessible yet.
 */
export function getPillarStatus(
  pillar: Pillar,
  modules: readonly Module[],
  completedModules: readonly number[],
): PillarStatus {
  const pillarModules = modules.filter((m) => m.pillar === pillar);
  if (pillarModules.length === 0) return 'locked';

  const pillarNumbers = pillarModules.map((m) => m.number);
  const allComplete = pillarNumbers.every((n) => completedModules.includes(n));
  if (allComplete) return 'completed';

  const anyAccessible = pillarNumbers.some((n) => canAccessModule(n, completedModules));
  if (anyAccessible) return 'in-progress';

  return 'locked';
}
