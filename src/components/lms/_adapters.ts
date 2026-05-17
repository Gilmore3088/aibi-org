// Adapter: collapses the project's canonical CourseModule shape (with phase,
// keyOutput, learnerOutcome, etc.) down to the LMSModule shape the prototype
// screens expect. One direction only — the canonical type stays the source
// of truth; this adapter exists only to feed the Ledger-styled UI.
//
// History: an earlier version derived pillar from phase via a PHASE_TO_PILLAR
// lookup. That diverged from the module's actual pillar field and produced
// scrambled sidebar groupings (e.g., M1 "AI for Your Workday" landing under
// Understanding even though its canonical pillar is Awareness). Now the
// canonical pillar is carried through CourseModule and used directly.

import type { CourseModule } from '@/types/lms';
import type { LMSModule } from './types';

export function toLMSModule(mod: CourseModule): LMSModule {
  return {
    num: mod.number,
    pillar: mod.pillar,
    title: mod.title,
    mins: mod.estimatedMinutes,
    output: mod.keyOutput,
    goal: mod.learnerOutcome,
  };
}

export function toLMSModules(mods: readonly CourseModule[]): readonly LMSModule[] {
  return mods.map(toLMSModule);
}
