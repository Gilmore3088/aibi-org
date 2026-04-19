import type { ReactNode } from 'react';
import { aibiSConfig } from '@/../content/courses/aibi-s/course.config';
import { mergeProgress } from '@/lib/course-harness/merge';
import { CourseShell } from '@/lib/course-harness/CourseShell';
import { fetchAibiSProgress } from './_lib/progress';

interface LayoutProps {
  readonly children: ReactNode;
}

export default async function AiBISPreviewLayout({ children }: LayoutProps) {
  const progress = await fetchAibiSProgress();
  const view = mergeProgress(aibiSConfig, progress);
  return <CourseShell view={view}>{children}</CourseShell>;
}
