// CourseShellWrapper — Server Component helper that wraps any page in
// /courses/foundation/program/* with the new LMS chrome.
//
// Use this in place of an ad-hoc <div className="..."> outer wrapper:
//
//   import { CourseShellWrapper } from '@/components/lms';
//   export default async function MyPage() {
//     return (
//       <CourseShellWrapper crumbs={['Education', 'AiBI-Foundation', 'Toolkit']}>
//         {/* existing content */}
//       </CourseShellWrapper>
//     );
//   }
//
// Auto-fetches live enrollment state via getEnrollment() so the sidebar
// shows correct progress / locked-module styling. Visitors with no
// enrollment see all modules locked, matching the purchase page treatment.

import type { ReactNode } from 'react';
import { getEnrollment } from '@/app/courses/foundation/program/_lib/getEnrollment';
import { foundationProgramCourseConfig } from '@content/courses/foundation-program';
import { CourseShell } from './CourseShell';
import { LMSTopBar } from './LMSTopBar';
import { toLMSModules } from './_adapters';
import type { LMSModule } from './types';

interface CourseShellWrapperProps {
  readonly children: ReactNode;
  readonly crumbs: readonly string[];
  readonly topBarRight?: ReactNode;
  /** Outer padding around children. Default mirrors overview page. */
  readonly contentPadding?: string;
  /** Max width of the content column. Default 1080. Set 'none' to remove. */
  readonly contentMaxWidth?: number | 'none';
}

export async function CourseShellWrapper({
  children,
  crumbs,
  topBarRight,
  contentPadding = '40px 36px 80px',
  contentMaxWidth = 1080,
}: CourseShellWrapperProps) {
  const enrollment = await getEnrollment();
  const lmsModules: readonly LMSModule[] = toLMSModules(
    foundationProgramCourseConfig.modules,
  );
  const completed = enrollment?.completed_modules ?? [];
  const current = enrollment?.current_module ?? (enrollment ? 1 : 0);

  return (
    <CourseShell modules={lmsModules} completed={completed} current={current}>
      <LMSTopBar crumbs={[...crumbs]} right={topBarRight} />
      <div
        style={{
          maxWidth: contentMaxWidth === 'none' ? undefined : contentMaxWidth,
          margin: '0 auto',
          padding: contentPadding,
        }}
      >
        {children}
      </div>
    </CourseShell>
  );
}
