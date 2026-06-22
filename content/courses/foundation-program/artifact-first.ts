import { FOUNDATION_MICRO_MODULES } from './micro-modules';

export interface ArtifactFirstMeta {
  readonly module: number;
  readonly building: string;
  readonly usedFor: string;
  readonly saved: string;
  readonly mustProve: string;
}

export const ARTIFACT_FIRST_BY_MODULE = Object.fromEntries(
  FOUNDATION_MICRO_MODULES.map((module) => [
    module.number,
    {
      module: module.number,
      building: `${module.keyOutput} - ${module.mission}`,
      usedFor: module.transferMove,
      saved: module.saveArtifact,
      mustProve: module.bankingGuardrail,
    },
  ]),
) as Record<number, ArtifactFirstMeta>;

export function getArtifactFirst(moduleNumber: number): ArtifactFirstMeta | undefined {
  return ARTIFACT_FIRST_BY_MODULE[moduleNumber];
}
