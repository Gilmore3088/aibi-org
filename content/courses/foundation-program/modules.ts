// AiBI-Foundation Course Module Map
// Imports all 12 module files and exports as typed array + lookup function.
//
// Source-of-truth note (2026-05-17, issues #107–#111):
//   These legacy module files are the source of truth for module *metadata*
//   only — number, title, pillar, estimatedMinutes, keyOutput. Module body
//   content (sections, takeaways, V4 activities) is canonically rendered
//   from `v4-expanded-modules.ts` via the
//   `V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER` map in
//   `src/app/courses/foundation/program/[module]/page.tsx`. V4 falls back
//   to the legacy `sections` array here only when a V4 entry is missing;
//   all 12 modules currently have V4 entries, so the legacy `sections`
//   fields are not rendered. They are kept for type contract reasons and
//   are scheduled for cleanup once the V4 contract absorbs the metadata
//   fields. Do not rely on them for learner-facing copy.

import type { Module } from './types';
import { module1 } from './module-1';
import { module2 } from './module-2';
import { module3 } from './module-3';
import { module4 } from './module-4';
import { module5 } from './module-5';
import { module6 } from './module-6';
import { module7 } from './module-7';
import { module8 } from './module-8';
import { module9 } from './module-9';
import { module10 } from './module-10';
import { module11 } from './module-11';
import { module12 } from './module-12';

export const modules: readonly Module[] = [
  module1, module2, module3, module4, module5,
  module6, module7, module8, module9, module10,
  module11, module12,
] as const;

export function getModuleByNumber(n: number): Module | undefined {
  return modules.find((m) => m.number === n);
}
