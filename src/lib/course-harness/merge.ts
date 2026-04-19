import type {
  CourseConfig,
  CourseProgress,
  ItemStatus,
  ResolvedCourseItem,
  ResolvedCourseSection,
  ResolvedCourseView,
} from './types';

function resolveStatus(
  itemId: string,
  isComingSoon: boolean | undefined,
  progress: CourseProgress | null,
): ItemStatus {
  if (isComingSoon) return 'coming-soon';
  if (!progress) return 'locked';
  if (progress.completedItemIds.includes(itemId)) return 'completed';
  if (progress.currentItemId === itemId) return 'current';
  return 'locked';
}

/**
 * Merge a static CourseConfig with per-request CourseProgress to produce a
 * ResolvedCourseView that renderers can consume. Pure function — no I/O.
 *
 * If progress is null (pre-enrollment / anonymous), every non-coming-soon
 * item resolves to 'locked' and currentItem is null.
 */
export function mergeProgress(
  config: CourseConfig,
  progress: CourseProgress | null,
): ResolvedCourseView {
  const sections: ResolvedCourseSection[] = config.sections.map((section) => ({
    ...section,
    items: section.items.map((item): ResolvedCourseItem => ({
      ...item,
      status: resolveStatus(item.id, item.isComingSoon, progress),
    })),
  }));

  const allItems = sections.flatMap((s) => s.items);
  const currentItem = allItems.find((i) => i.status === 'current') ?? null;
  const completedCount = allItems.filter((i) => i.status === 'completed').length;
  const totalItemCount = allItems.filter((i) => !i.isComingSoon).length;

  return {
    config,
    sections,
    currentItem,
    completedCount,
    totalItemCount,
  };
}
