import type {
  DimensionAggregate,
  SliceAggregate,
} from '@/lib/team-assessment/aggregate';
import { DIMENSION_ACTIONS, type DimensionAction } from './types';

export function shortDimension(label: string): string {
  return label
    .replace('Readiness', '')
    .replace('Governance', 'Gov.')
    .replace('Operations', 'Ops.')
    .replace('Implementation', 'Impl.')
    .replace(/\s+/g, ' ')
    .trim();
}

export function heatmapStyle(value: number): { background: string; color: string } {
  if (value >= 75) return { background: '#dce8da', color: '#18351f' };
  if (value >= 60) return { background: '#f1e4bf', color: '#5f4815' };
  return { background: '#ead7d3', color: '#61231f' };
}

export function dimensionActionFor(dim: DimensionAggregate): DimensionAction {
  return DIMENSION_ACTIONS[dim.id];
}

export function getWidestDimension(
  dimensions: readonly DimensionAggregate[],
): DimensionAggregate | null {
  return [...dimensions].sort((a, b) => (b.p75 - b.p25) - (a.p75 - a.p25))[0] ?? null;
}

export function sortSlicesByMedian(slices: readonly SliceAggregate[]): readonly SliceAggregate[] {
  return [...slices].sort((a, b) => a.median - b.median);
}

export function lowestSlice(slices: readonly SliceAggregate[]): SliceAggregate | null {
  return sortSlicesByMedian(slices)[0] ?? null;
}

export function strongestSlice(slices: readonly SliceAggregate[]): SliceAggregate | null {
  return [...slices].sort((a, b) => b.median - a.median)[0] ?? null;
}

export function buildLeadershipAgenda(
  focus: DimensionAggregate | null,
  action: DimensionAction | null,
): string {
  const gap = focus ? `${focus.label} (${focus.median})` : 'lowest readiness dimension';
  return [
    'Team AI Readiness Leadership Readout',
    '',
    '1. Confirm the score and completion coverage.',
    `2. Name the primary gap: ${gap}.`,
    `3. Assign owner: ${action?.owner ?? 'TBD'}.`,
    `4. Approve first artifact: ${action?.artifact ?? 'TBD'}.`,
    `5. Decide first move: ${action?.firstMove ?? 'choose one governed workflow'}.`,
    `6. Evidence to collect: ${action?.evidence ?? 'owner, review, artifact, and status trail'}.`,
    '7. Schedule the first department working session.',
  ].join('\n');
}

export function buildWorkshopAgenda(
  focus: DimensionAggregate | null,
  action: DimensionAction | null,
): string {
  return [
    'Department AI Readiness Workshop',
    '',
    `Focus: ${focus?.label ?? 'lowest team gap'}`,
    '1. Pick one real workflow from this department.',
    '2. Identify the approved tool, data class, owner, and reviewer.',
    `3. Build: ${action?.artifact ?? 'one control artifact'}.`,
    `4. Capture evidence: ${action?.evidence ?? 'decision notes, reviewer, and retained artifact'}.`,
    '5. Return in two weeks with the artifact and blockers.',
  ].join('\n');
}
