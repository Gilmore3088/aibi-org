// AiBI-Foundation Course Module Map
//
// The course is now built from the 18-module micro-module source so module
// metadata, artifacts, lab briefs, and apply forms stay aligned.

import type { Module } from './types';
import { FOUNDATION_MICRO_MODULES, buildMicroModule } from './micro-modules';

export const modules: readonly Module[] = FOUNDATION_MICRO_MODULES.map(buildMicroModule);

export function getModuleByNumber(n: number): Module | undefined {
  return modules.find((m) => m.number === n);
}
