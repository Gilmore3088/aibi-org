// AiBI-S three-phase framing: Learn · Build · Strategize
// Each of the 6 beats belongs to one of three phases. This helper maps beat
// index → phase metadata so the UI can show "Phase: Build · Beat 2 of 3".

import type { BeatKind } from './types';

export type PhaseName = 'Learn' | 'Build' | 'Strategize';

const PHASE_OF_BEAT: Readonly<Record<BeatKind, PhaseName>> = {
  learn: 'Learn',
  practice: 'Build',
  apply: 'Build',
  defend: 'Build',
  refine: 'Strategize',
  capture: 'Strategize',
};

export const PHASE_DESCRIPTIONS: Readonly<Record<PhaseName, string>> = {
  Learn: 'Absorb the concept and the banking context.',
  Build: 'Practice the concept, apply it to your department, and defend it.',
  Strategize: 'Refine what survived the defense. Capture it as a portable artifact.',
};

export function phaseOfBeat(kind: BeatKind): PhaseName {
  return PHASE_OF_BEAT[kind];
}

export interface PhaseProgress {
  readonly phase: PhaseName;
  readonly stepInPhase: number;
  readonly stepsInPhase: number;
}

/**
 * For a given beat index in a beats array, return the phase name + which
 * step of that phase this beat is (e.g., Build 2/3).
 */
export function phaseProgressFor(
  beats: readonly { readonly kind: BeatKind }[],
  beatIndex: number,
): PhaseProgress {
  const currentKind = beats[beatIndex].kind;
  const phase = phaseOfBeat(currentKind);
  const beatsInPhase = beats.map((b) => phaseOfBeat(b.kind));
  const stepsInPhase = beatsInPhase.filter((p) => p === phase).length;
  const stepInPhase =
    beatsInPhase
      .slice(0, beatIndex + 1)
      .filter((p) => p === phase).length;
  return { phase, stepInPhase, stepsInPhase };
}
