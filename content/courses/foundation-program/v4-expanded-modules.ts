import type { Section } from './types';
import { FOUNDATION_MICRO_MODULES, buildMicroSections } from './micro-modules';

export interface ExpandedModule {
  readonly number: number;
  readonly goal: string;
  readonly includes: readonly string[];
  readonly practice: string;
  readonly artifact: string;
  readonly bankingBoundary: string;
  readonly takeaways: readonly string[];
  readonly sections: readonly Section[];
}

export const V4_FOUNDATION_PROGRAM_MODULES: readonly ExpandedModule[] =
  FOUNDATION_MICRO_MODULES.map((module) => ({
    number: module.number,
    goal: module.mission,
    includes: module.visualModel,
    practice: module.tryTask,
    artifact: module.saveArtifact,
    bankingBoundary: module.bankingGuardrail,
    takeaways: [
      module.plainLanguageConcept,
      module.reviewChecklist[0],
      module.qualitySignals[0],
    ],
    sections: buildMicroSections(module),
  }));

export const V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER = new Map(
  V4_FOUNDATION_PROGRAM_MODULES.map((module) => [module.number, module]),
);
