// Adapter: collapses the project's canonical CourseModule shape (with phase,
// keyOutput, learnerOutcome, etc.) down to the LMSModule shape the prototype
// screens expect. One direction only — the canonical type stays the source
// of truth; this adapter exists only to feed the Ledger-styled UI.

import type { CourseModule } from '@/types/lms';
import type { LMSModule, LMSPillar } from './types';

const PHASE_TO_PILLAR: Record<CourseModule['phase'], LMSPillar['id']> = {
  understand: 'understanding',
  'daily-workflows': 'creation',
  'safe-use': 'awareness',
  'role-application': 'application',
  credential: 'application',
};

export function toLMSModule(mod: CourseModule): LMSModule {
  return {
    num: mod.number,
    pillar: PHASE_TO_PILLAR[mod.phase] ?? 'application',
    title: mod.title,
    mins: mod.estimatedMinutes,
    output: mod.keyOutput,
    goal: mod.learnerOutcome,
  };
}

export function toLMSModules(mods: readonly CourseModule[]): readonly LMSModule[] {
  return mods.map(toLMSModule);
}
