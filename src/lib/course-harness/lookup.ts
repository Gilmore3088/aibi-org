import type { ResolvedCourseView, ResolvedCourseItem, ResolvedCourseSection } from './types';

export function findItem(view: ResolvedCourseView, itemId: string): ResolvedCourseItem | null {
  for (const section of view.sections) {
    const item = section.items.find((i) => i.id === itemId);
    if (item) return item;
  }
  return null;
}

export function findSectionOf(
  view: ResolvedCourseView,
  itemId: string,
): ResolvedCourseSection | null {
  return view.sections.find((s) => s.items.some((i) => i.id === itemId)) ?? null;
}
