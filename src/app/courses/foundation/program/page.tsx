// /courses/foundation/program — Course home (enrolled-learner view)
//
// Restructured per docs/lms-layout-audit-2026-05-27.md §2:
//   1. Sticky Resume Bar (first viewport — "what do I do now?")
//   2. Your Work strip (artifacts THIS learner produced)
//   3. This Week's Module card (current module + sub-tasks)
//   4. Where You're Going (next 3 modules, plain ordered prose)
//   5. Role personalization (RolePathCard) — if role completed
//   6. Full Curriculum (collapsed accordion wrapping CourseStructure)
//
// HeroIntro / ProgramStatsRow / OutcomesPanel were dropped from this
// page — they are marketing copy a buyer already saw before enrolling.
// Their source files are intact (other surfaces may still depend on
// them); only the imports here were removed.
//
// Server Component. Reads enrollment state, then renders the new home
// shape through the shared <CourseShell> primitives.

import type { Metadata } from 'next';
import {
  modules,
  foundationCourseConfig,
  getRolePath,
} from '@content/courses/foundation-program';
import { RolePathCard } from './_components/RolePathCard';
import {
  CourseShell,
  LMSTopBar,
  toLMSModules,
  type LMSModule,
} from '@/components/lms';
import { getEnrollmentResult, isFetchError } from './_lib/getEnrollment';
import { jsonLdString } from '@/lib/seo/jsonld';
import { FOUNDATION_COURSE_JSONLD } from './_lib/programJsonLd';
import { CourseStructure } from './_components/CourseStructure';
import { StickyResumeBar } from './_home/StickyResumeBar';
import { YourWorkStrip } from './_home/YourWorkStrip';
import { ThisWeeksModule } from './_home/ThisWeeksModule';
import { WhereYoureGoing } from './_home/WhereYoureGoing';
import { FullCurriculumAccordion } from './_home/FullCurriculumAccordion';

export const metadata: Metadata = {
  title: 'AiBI-Foundation | The AI Banking Institute',
  description:
    'AiBI-Foundation teaches every staff member at a community bank or credit union how to use AI tools safely, professionally, and with regulatory confidence.',
};

export default async function CourseOverviewPage() {
  const enrollmentResult = await getEnrollmentResult();
  const fetchFailed = isFetchError(enrollmentResult);
  const enrollment = fetchFailed ? null : enrollmentResult;
  const completedModules = enrollment?.completed_modules ?? [];
  const currentModule = enrollment?.current_module ?? 1;
  const completedCount = completedModules.length;
  const totalModules = modules.length;

  const lmsModules: readonly LMSModule[] = toLMSModules(
    foundationCourseConfig.modules,
  );
  const currentMod =
    lmsModules.find((m) => m.num === currentModule) ?? lmsModules[0];
  const isCurrentCompleted = completedModules.includes(currentMod.num);

  // Role-based personalization: only renders when the learner completed
  // onboarding and picked a supported role. Falls through silently otherwise.
  const primaryRole = enrollment?.onboarding_answers?.primary_role ?? null;
  const rolePath = primaryRole ? getRolePath(primaryRole) : null;

  return (
    <CourseShell
      modules={lmsModules}
      completed={completedModules}
      current={currentModule}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(FOUNDATION_COURSE_JSONLD) }}
      />
      <LMSTopBar
        crumbs={['Education', 'AiBI-Foundation']}
        right={
          <span
            style={{
              fontFamily:
                'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
            }}
          >
            {completedCount}/{totalModules} complete
          </span>
        }
      />

      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: 'clamp(24px, 4vw, 40px) clamp(20px, 4vw, 40px) 96px',
        }}
      >
        {fetchFailed && (
          <div
            role="status"
            style={{
              marginBottom: 24,
              padding: '14px 18px',
              borderRadius: 16,
              background: 'var(--cream-2)',
              border: '1px solid var(--ink-a10, rgba(7,26,47,0.1))',
              fontFamily:
                'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
              fontSize: 13,
              color: 'var(--slate-600)',
              lineHeight: 1.5,
            }}
          >
            We could not load your enrollment progress just now. The course
            below is showing the default starting state. Refresh in a moment
            to see your saved progress.
          </div>
        )}

        <StickyResumeBar
          currentModule={currentMod}
          completedModules={completedModules}
          totalModules={totalModules}
        />

        <YourWorkStrip completedModules={completedModules} currentModule={currentModule} />

        <ThisWeeksModule
          currentModule={currentMod}
          isCompleted={isCurrentCompleted}
        />

        <WhereYoureGoing
          lmsModules={lmsModules}
          currentModuleNum={currentMod.num}
          completedModules={completedModules}
        />

        {rolePath && (
          <div style={{ marginBottom: 40 }}>
            <RolePathCard rolePath={rolePath} />
          </div>
        )}

        <FullCurriculumAccordion totalModules={totalModules}>
          <CourseStructure
            lmsModules={lmsModules}
            completedModules={completedModules}
            currentModule={currentModule}
            totalModules={totalModules}
          />
        </FullCurriculumAccordion>
      </div>
    </CourseShell>
  );
}
