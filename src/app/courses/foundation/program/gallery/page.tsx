// /courses/foundation/program/gallery — Reference gallery of exemplary AI outputs by role.
// Server Component shell with client-side role filtering.
// Wrapped in CourseShellWrapper so the LMS chrome matches the rest of the course tree.
//
// 2026-05-27 (audit §12): redesigned to lead with the artifacts (mosaic preview strip)
// instead of marketing chrome. Filter strip + expanded cards live below the mosaic.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CourseShellWrapper } from '@/components/lms/CourseShellWrapper';
import { OutputGalleryClient } from './OutputGalleryClient';
import { getEnrollment } from '../_lib/getEnrollment';

export const metadata: Metadata = {
  title: 'Output Gallery | AiBI-Foundation | The AI Banking Institute',
  description:
    'See what excellent AI outputs look like in every banking department. Role-specific examples from lending, operations, compliance, finance, marketing, and IT. Part of the AiBI-Foundation course.',
};

export default async function OutputGalleryPage() {
  const enrollment = await getEnrollment();
  if (!enrollment) {
    redirect('/courses/foundation/program/purchase');
  }

  return (
    <CourseShellWrapper crumbs={['Education', 'AiBI-Foundation', 'Output Gallery']}>
      <OutputGalleryClient />
    </CourseShellWrapper>
  );
}
