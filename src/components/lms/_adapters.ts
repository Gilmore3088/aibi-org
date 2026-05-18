// Adapter: harness CourseModule (lean) + Foundation per-module metadata
// → LMSModule (the prototype-styled sidebar's display shape).
//
// One direction only — the canonical types stay the source of truth;
// this adapter exists only to feed the Ledger-styled UI.
//
// Foundation-specific by design: it reads FOUNDATION_MODULES_META for
// pillar/keyOutput/learnerOutcome. AiBI-S will introduce its own
// sidebar binding via the harness sidebar path in B6.

import type { CourseModule } from '@/lib/lms';
import {
  FOUNDATION_MODULES_META,
  type FoundationModuleMeta,
} from '@content/courses/foundation-program/course-config';
import type { LMSModule } from './types';

export function toLMSModule(mod: CourseModule): LMSModule {
  const meta: FoundationModuleMeta | undefined = FOUNDATION_MODULES_META[mod.id];
  if (!meta) {
    throw new Error(
      `toLMSModule: no FOUNDATION_MODULES_META entry for module '${mod.id}'. ` +
        `This adapter is Foundation-specific — verify the module belongs to the Foundation config.`,
    );
  }
  // Harness CourseModule.number can be string | number. Sidebar grew up
  // expecting numeric module numbers; coerce defensively here.
  const num = typeof mod.number === 'number' ? mod.number : Number(mod.number);
  return {
    num,
    pillar: meta.pillar,
    title: mod.title,
    mins: mod.estimatedMinutes,
    output: meta.keyOutput,
    goal: meta.learnerOutcome,
  };
}

export function toLMSModules(mods: readonly CourseModule[]): readonly LMSModule[] {
  return mods.map(toLMSModule);
}
