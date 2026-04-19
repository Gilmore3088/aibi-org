// Progress fetcher for AiBI-S prototype.
// Prototype-scope: returns hardcoded "current = u-1.1" so the sidebar highlights
// the only live unit. Wire to Supabase enrollment tracking in a later phase.

import type { CourseProgress } from '@/lib/course-harness/types';

export async function fetchAibiSProgress(): Promise<CourseProgress> {
  return {
    completedItemIds: [],
    currentItemId: 'u-1.1',
  };
}
