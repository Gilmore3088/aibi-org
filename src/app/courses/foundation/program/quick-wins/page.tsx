// /courses/foundation/program/quick-wins — Quick Win Tracker (server wrapper)
//
// The interactive form lives in QuickWinsClient.tsx (client component).
// This server page wraps it in the LMS shell so the sidebar + topbar
// chrome stays consistent with the rest of the course tree.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CourseShellWrapper } from "@/components/lms/CourseShellWrapper";
import { QuickWinsClient } from './QuickWinsClient';
import { getEnrollment } from '../_lib/getEnrollment';

export const metadata: Metadata = {
  title: 'Quick Wins | AiBI-Foundation | The AI Banking Institute',
  description:
    'Log automations you built and time saved. Hit three wins to unlock a recommendation letter template.',
};

export default async function QuickWinsPage() {
  const enrollment = await getEnrollment();
  if (!enrollment) {
    redirect('/courses/foundation/program/purchase');
  }

  return (
    <CourseShellWrapper crumbs={['Education', 'AiBI-Foundation', 'Quick Wins']}>
      <QuickWinsClient />
    </CourseShellWrapper>
  );
}
