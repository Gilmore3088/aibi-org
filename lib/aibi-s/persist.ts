import type { UnitLearnerState } from './types';

const PREFIX = 'aibi-s:prototype:unit:';

export function loadUnitState(unitId: string): UnitLearnerState | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(PREFIX + unitId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UnitLearnerState;
  } catch {
    return null;
  }
}

export function saveUnitState(state: UnitLearnerState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFIX + state.unitId, JSON.stringify(state));
}

export function clearUnitState(unitId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PREFIX + unitId);
}
