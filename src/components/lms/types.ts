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

// Pillar color discipline (sage/cobalt/terra) was retired with the
// 2026-05-09 Ledger refresh. Per CLAUDE.md the 4-pillar structure
// remains for navigation but does NOT enforce a visual grammar —
// pillar marks all use the single gold accent. The pillar label
// text differentiates Awareness / Understanding / Creation / Application.
export const LMS_PILLARS: readonly LMSPillar[] = [
  { id: 'awareness', label: 'Awareness', color: 'var(--ledger-accent)' },
  { id: 'understanding', label: 'Understanding', color: 'var(--ledger-accent)' },
  { id: 'creation', label: 'Creation', color: 'var(--ledger-accent)' },
  { id: 'application', label: 'Application', color: 'var(--ledger-accent)' },
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
