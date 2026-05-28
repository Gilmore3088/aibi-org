// Dynamic module page — /courses/foundation/program/[module]
//
// LMS reskin (Wave 1, 2026-05-27): ported the per-module surface to the
// mockup design system. Server Component: all content read from typed
// files at build time. T-02-03: parseInt + getModuleByNumber + notFound()
// guards invalid params. SHELL-12: Non-enrolled users redirected to
// purchase server-side. SHELL-04/05: Locked module access redirected to
// current module server-side.

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  modules,
  foundationCourseConfig,
  getModuleByNumber,
  V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER,
} from '@content/courses/foundation-program';
import { SubTaskProgressStrip, type SubTaskItem } from './_local/SubTaskProgressStrip';
import { ModuleHeaderCard } from './_local/ModuleHeaderCard';
import { ModuleArticleBody } from './_local/ModuleArticleBody';
import { buildV4Activity } from './_local/buildV4Activity';
import { MOCKUP_FONT } from './_local/moduleStyles';
import {
  CourseShell,
  LMSTopBar,
  getModuleStatus,
  toLMSModules,
  type LMSModule,
} from '@/components/lms';
import { getEnrollment } from '../_lib/getEnrollment';
import { canAccessModule } from '../_lib/courseProgress';
import { getRoleSpotlight } from '../_lib/contentRouting';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { ActivityResponse } from '@/types/course';
import { SANDBOX_CONFIGS } from '@content/sandbox-data/foundation-program';
import {
  getModuleActivitySpec,
  buildModuleActivity,
} from '@content/courses/foundation-program/module-activities';

interface ModulePageParams {
  readonly params: { module: string };
}

export function generateStaticParams() {
  return modules.map((m) => ({ module: String(m.number) }));
}

export async function generateMetadata({ params }: ModulePageParams): Promise<Metadata> {
  const moduleNum = parseInt(params.module, 10);
  const mod = getModuleByNumber(moduleNum);
  if (!mod) {
    return { title: 'Module Not Found | AiBI-Foundation' };
  }
  return {
    title: `Module ${mod.number}: ${mod.title} | AiBI-Foundation`,
  };
}

export default async function ModulePage({ params }: ModulePageParams) {
  const moduleNum = parseInt(params.module, 10);

  if (isNaN(moduleNum) || moduleNum < 1 || moduleNum > modules.length) {
    notFound();
  }

  const mod = getModuleByNumber(moduleNum);
  if (!mod) {
    notFound();
  }

  const enrollment = await getEnrollment();
  if (!enrollment) {
    redirect('/courses/foundation/program/purchase');
  }

  if (!canAccessModule(moduleNum, enrollment.completed_modules)) {
    redirect(`/courses/foundation/program/${enrollment.current_module}`);
  }

  const isLastModule = mod.number === modules.length;
  const isAlreadyCompleted = enrollment.completed_modules.includes(moduleNum);
  const expandedModule = V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER.get(moduleNum);
  const moduleSpec = getModuleActivitySpec(moduleNum);
  const moduleActivities = moduleSpec
    ? [buildModuleActivity(moduleSpec)]
    : expandedModule
      ? [buildV4Activity(expandedModule)]
      : mod.activities;
  const moduleTables = expandedModule ? undefined : mod.tables;

  const existingResponses: Record<string, Record<string, string>> = {};
  if (isSupabaseConfigured() && moduleActivities.length > 0) {
    const serviceClient = createServiceRoleClient();
    const { data: responses } = await serviceClient
      .from('activity_responses')
      .select('activity_id, response')
      .eq('enrollment_id', enrollment.id)
      .eq('module_number', moduleNum);

    if (responses) {
      for (const row of responses as Pick<ActivityResponse, 'activity_id' | 'response'>[]) {
        existingResponses[row.activity_id] = row.response as Record<string, string>;
      }
    }
  }

  const lmsModules: readonly LMSModule[] = toLMSModules(foundationCourseConfig.modules);
  const status = getModuleStatus(
    mod.number,
    enrollment.completed_modules,
    enrollment.current_module,
  );
  const goalLine =
    expandedModule?.goal ??
    `Use AI more safely and practically for ${mod.keyOutput.toLowerCase()}.`;
  const titleParts = mod.title.split(' — ');
  const titleMain = titleParts[0];
  const titleTail = titleParts.length > 1 ? titleParts.slice(1).join(' — ') : null;

  const statusLabel =
    status === 'current' ? 'In progress' : status === 'completed' ? 'Completed' : 'Locked';

  // Approximate per-sub-task minutes by splitting the module estimate.
  const totalMin = mod.estimatedMinutes;
  const takeawayMin = Math.max(5, Math.round(totalMin * 0.22));
  const sandboxMin = Math.max(5, Math.round(totalMin * 0.32));
  const submitMin = Math.max(5, totalMin - takeawayMin - sandboxMin);
  const hasSandbox = Boolean(SANDBOX_CONFIGS[moduleNum]);

  const subTaskItems: SubTaskItem[] = [
    {
      id: 'st-takeaway',
      label: 'Takeaway',
      minutes: takeawayMin,
      status: isAlreadyCompleted ? 'done' : 'current',
    },
    ...(hasSandbox
      ? [
          {
            id: 'st-sandbox',
            label: 'Sandbox',
            minutes: sandboxMin,
            status: (isAlreadyCompleted ? 'done' : 'pending') as SubTaskItem['status'],
          },
        ]
      : []),
    {
      id: 'st-submit',
      label: 'Submit',
      minutes: submitMin,
      status: isAlreadyCompleted ? 'done' : 'pending',
    },
    {
      id: 'st-saved',
      label: 'Saved artifact',
      minutes: null,
      status: isAlreadyCompleted ? 'done' : 'pending',
    },
  ];

  return (
    <CourseShell
      modules={lmsModules}
      completed={enrollment.completed_modules}
      current={enrollment.current_module}
    >
      <LMSTopBar
        crumbs={['Education', 'AiBI-Foundation', `Module ${String(mod.number).padStart(2, '0')}`]}
        right={
          <Link
            href="/courses/foundation/program"
            style={{
              fontFamily: MOCKUP_FONT,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: 'var(--slate-600)',
              textDecoration: 'none',
            }}
          >
            ← Course overview
          </Link>
        }
      />

      <div
        style={{
          background: 'var(--cream)',
          fontFamily: MOCKUP_FONT,
          color: 'var(--ink)',
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 36px 16px' }}>
          <ModuleHeaderCard
            moduleNumber={mod.number}
            pillarId={mod.pillar}
            titleMain={titleMain}
            titleTail={titleTail}
            keyOutput={mod.keyOutput}
            goalLine={goalLine}
            estimatedMinutes={mod.estimatedMinutes}
            status={status}
            statusLabel={statusLabel}
          />
        </div>

        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 36px' }}>
          <SubTaskProgressStrip items={subTaskItems} />
        </div>

        <ModuleArticleBody
          moduleNum={moduleNum}
          keyOutput={mod.keyOutput}
          expandedModule={expandedModule}
          moduleActivities={moduleActivities}
          moduleTables={moduleTables}
          enrollmentId={enrollment.id}
          isLastModule={isLastModule}
          isAlreadyCompleted={isAlreadyCompleted}
          learnerRole={
            enrollment.onboarding_answers
              ? getRoleSpotlight(enrollment.onboarding_answers)
              : 'other'
          }
          existingResponses={existingResponses}
          takeawayMin={takeawayMin}
          sandboxMin={sandboxMin}
          submitMin={submitMin}
          hasSandbox={hasSandbox}
        />
      </div>
    </CourseShell>
  );
}
