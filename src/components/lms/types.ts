// Shared types for the LMS-prototype-style course shell. These mirror the
// data shape used by the prototype so screens can be ported directly, but
// they don't replace the canonical course content types in @/types/lms.
// Adapters live in src/components/lms/_adapters.ts.

export interface LMSPillar {
  readonly id: 'awareness' | 'understanding' | 'creation' | 'application';
  readonly label: string;
  readonly color: string;
}

export interface LMSModule {
  readonly num: number;
  readonly pillar: LMSPillar['id'];
  readonly title: string;
  readonly mins: number;
  readonly output: string;
  readonly goal: string;
}

export type ModuleStatus = 'completed' | 'current' | 'locked';

export const LMS_PILLARS: readonly LMSPillar[] = [
  { id: 'awareness', label: 'Awareness', color: '#B8836B' },
  { id: 'understanding', label: 'Understanding', color: '#6B8AA0' },
  { id: 'creation', label: 'Creation', color: '#8A7B6B' },
  { id: 'application', label: 'Application', color: '#5C7B5C' },
];

export function getModuleStatus(
  num: number,
  completed: readonly number[],
  current: number,
): ModuleStatus {
  if (completed.includes(num)) return 'completed';
  if (num === current) return 'current';
  if (num < current) return 'completed';
  return 'locked';
}
