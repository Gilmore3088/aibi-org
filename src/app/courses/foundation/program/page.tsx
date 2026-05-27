// /courses/foundation/program — Course overview (LMS prototype reskin)
//
// Server Component. Reads enrollment state, then renders the prototype's
// OverviewScreen pattern through the shared <CourseShell> primitives.
// V4 expanded module details (includes / practice / artifact / boundary) are
// preserved via the existing data source and rendered inline inside the
// pillar grouping in <CourseStructure>.

import type { Metadata } from 'next';
import {
  modules,
  foundationCourseConfig,
  FOUNDATION_TOTAL_MINUTES,
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
import { HeroIntro } from './_components/HeroIntro';
import { ResumeStrip } from './_components/ResumeStrip';
import { ProgramStatsRow } from './_components/ProgramStatsRow';
import { OutcomesPanel } from './_components/OutcomesPanel';
import { CourseStructure } from './_components/CourseStructure';

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
  const currentMod = lmsModules.find((m) => m.num === currentModule) ?? lmsModules[0];

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
          padding: 'clamp(32px, 5vw, 56px) clamp(20px, 4vw, 40px) 96px',
        }}
      >
        <section style={{ marginBottom: 64 }}>
          <HeroIntro
            completedCount={completedCount}
            promise={foundationCourseConfig.promise}
            fetchFailed={fetchFailed}
          />
          <ResumeStrip currentModule={currentMod} completedCount={completedCount} />
          <ProgramStatsRow
            completedCount={completedCount}
            totalModules={totalModules}
            totalMinutes={FOUNDATION_TOTAL_MINUTES}
          />
        </section>

        <OutcomesPanel />

        {rolePath && (
          <div style={{ marginBottom: 32 }}>
            <RolePathCard rolePath={rolePath} />
          </div>
        )}

        <CourseStructure
          lmsModules={lmsModules}
          completedModules={completedModules}
          currentModule={currentModule}
          totalModules={totalModules}
        />
      </div>
    </CourseShell>
  );
}
