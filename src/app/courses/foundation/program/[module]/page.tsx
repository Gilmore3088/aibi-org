// Dynamic module page — /courses/foundation/program/[module]
//
// LMS reskin (Wave 1, 2026-05-27): ported the per-module surface to the
// mockup design system (Inter, navy --ink, gold --gold accent, cream
// surface, mockup radii + shadows). The CourseShell + LMSTopBar chrome
// is retained from Ledger for now (other Wave-1 agents own those
// shells); the page-level header, loop ribbon, and Banking Boundary
// section are restyled at the page level. The Tabbed body keeps its
// structural role (Learn it / Try it / Use it / Save it) and gets the
// mockup gold accent passed through to its existing accentColor prop.
//
// Server Component: all content read from typed files at build time.
// T-02-03: parseInt + getModuleByNumber + notFound() guards invalid params.
// SHELL-12: Non-enrolled users redirected to purchase page server-side.
// SHELL-04/05: Locked module access redirected to current module server-side.

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  modules,
  foundationCourseConfig,
  getModuleByNumber,
  V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER,
  getArtifactFirst,
} from '@content/courses/foundation-program';
import { ContentTable } from '@/components/lms/ContentTable';
import { LearnSection } from '../_components/LearnSection';
import { ModuleArtifactHeader } from '../_components/ModuleArtifactHeader';
import { ModuleContentClient } from '../_components/ModuleContentClient';
import { SubTaskProgressStrip, type SubTaskItem } from './_local/SubTaskProgressStrip';
import { CollapsibleBoundary } from './_local/CollapsibleBoundary';
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
import { AIPracticeSandbox } from '@/components/AIPracticeSandbox';
import { SANDBOX_CONFIGS } from '@content/sandbox-data/foundation-program';
import { MiniTutorialList } from '../_components/MiniTutorialList';
import {
  M3_TUTORIALS,
  M7_TUTORIALS,
} from '@content/courses/foundation-program/prompt-library';
import { getModuleActivitySpec, buildModuleActivity } from '@content/courses/foundation-program/module-activities';
import { buildV4Activity } from './_lib/buildV4Activity';
import { BankingBoundary } from './_components/BankingBoundary';
import { SavedArtifactSection } from './_components/SavedArtifactSection';
import { ModuleHeaderCard } from './_components/ModuleHeaderCard';

interface ModulePageParams {
  readonly params: Promise<{ module: string }>;
}

const MOCKUP_FONT = 'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

export function generateStaticParams() {
  return modules.map((m) => ({ module: String(m.number) }));
}

export async function generateMetadata(props: ModulePageParams): Promise<Metadata> {
  const params = await props.params;
  const moduleNum = parseInt(params.module, 10);
  const mod = getModuleByNumber(moduleNum);
  if (!mod) {
    return { title: 'Module Not Found | AiBI-Foundation' };
  }
  return {
    title: `Module ${mod.number}: ${mod.title} | AiBI-Foundation`,
  };
}

export default async function ModulePage(props: ModulePageParams) {
  const params = await props.params;
  const moduleNum = parseInt(params.module, 10);

  if (isNaN(moduleNum) || moduleNum < 1 || moduleNum > modules.length) {
    notFound();
  }

  const mod = getModuleByNumber(moduleNum);
  if (!mod) {
    notFound();
  }

  // Post-payment race guard: a brand-new buyer can reach Module 1 before the
  // Stripe webhook writes their enrollment row (journey audit 2026-06-10,
  // F2). Retry the lookup briefly before concluding they haven't purchased.
  let enrollment = await getEnrollment();
  for (let attempt = 0; !enrollment && attempt < 3; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    enrollment = await getEnrollment();
  }
  if (!enrollment) {
    redirect('/courses/foundation/program/purchase');
  }

  if (!canAccessModule(moduleNum, enrollment.completed_modules)) {
    redirect(`/courses/foundation/program/${enrollment.current_module}`);
  }

  const isLastModule = mod.number === modules.length;
  const isAlreadyCompleted = enrollment.completed_modules.includes(moduleNum);
  const artifactFirst = getArtifactFirst(moduleNum);
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
  const status = getModuleStatus(mod.number, enrollment.completed_modules, enrollment.current_module);
  const pillarId = mod.pillar;
  const goalLine =
    expandedModule?.goal ??
    `Use AI more safely and practically for ${mod.keyOutput.toLowerCase()}.`;
  const titleParts = mod.title.split(' — ');
  const titleMain = titleParts[0];
  const titleTail = titleParts.length > 1 ? titleParts.slice(1).join(' — ') : null;

  const statusLabel =
    status === 'current' ? 'In progress' : status === 'completed' ? 'Completed' : 'Locked';

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

      <div style={{ background: 'var(--cream)', fontFamily: MOCKUP_FONT, color: 'var(--ink)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '40px 36px 16px' }}>
          <ModuleHeaderCard
            moduleNumber={mod.number}
            titleMain={titleMain}
            titleTail={titleTail}
            keyOutput={mod.keyOutput}
            goalLine={goalLine}
            estimatedMinutes={mod.estimatedMinutes}
            pillarId={pillarId}
            status={status}
            statusLabel={statusLabel}
          />
        </div>

        {artifactFirst && <ModuleArtifactHeader meta={artifactFirst} />}

        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 36px' }}>
          <SubTaskProgressStrip items={subTaskItems} />
        </div>

        <article style={{ maxWidth: 1320, margin: '0 auto', padding: '24px 36px 80px' }}>
          <section id="st-takeaway" aria-labelledby="st-takeaway-h" style={{ scrollMarginTop: 160, paddingTop: 12 }}>
            <h2
              id="st-takeaway-h"
              style={{ fontFamily: MOCKUP_FONT, fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-deep)', margin: '0 0 16px' }}
            >
              Takeaway · {takeawayMin} min
            </h2>
            <LearnSection
              sections={expandedModule?.sections ?? []}
              keyTakeaways={expandedModule?.takeaways}
              moduleNumber={moduleNum}
            />
            <CollapsibleBoundary defaultOpen={moduleNum === 1}>
              <BankingBoundary moduleNumber={moduleNum} />
            </CollapsibleBoundary>
            {moduleTables && moduleTables.length > 0 && (
              <div style={{ marginTop: 24 }}>
                {moduleTables.map((table) => (
                  <ContentTable key={table.id} table={table} />
                ))}
              </div>
            )}
          </section>

          {hasSandbox && (
            <section id="st-sandbox" aria-labelledby="st-sandbox-h" style={{ scrollMarginTop: 160, paddingTop: 48 }}>
              <h2
                id="st-sandbox-h"
                style={{ fontFamily: MOCKUP_FONT, fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-deep)', margin: '0 0 16px' }}
              >
                Sandbox · {sandboxMin} min
              </h2>
              <AIPracticeSandbox
                moduleId={`aibi-p-module-${moduleNum}`}
                product="foundation"
                sandboxConfig={SANDBOX_CONFIGS[moduleNum]!}
              />
              {moduleNum === 3 && (
                <MiniTutorialList
                  tutorials={M3_TUTORIALS}
                  heading="First-try tutorials"
                  intro="Step-by-step walkthroughs for your first real banking task on each platform. Pick the one that matches what you already have access to."
                />
              )}
              {moduleNum === 7 && (
                <MiniTutorialList
                  tutorials={M7_TUTORIALS}
                  heading="Skill-builder tutorials"
                  intro="Worked examples of the anatomy-of-a-skill pattern applied to common banking workflows. Open the platform you use, copy the prompt, work through the steps."
                />
              )}
            </section>
          )}

          <section id="st-submit" aria-labelledby="st-submit-h" style={{ scrollMarginTop: 160, paddingTop: 48 }}>
            <h2
              id="st-submit-h"
              style={{ fontFamily: MOCKUP_FONT, fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-deep)', margin: '0 0 16px' }}
            >
              Submit · {submitMin} min
            </h2>
            <ModuleContentClient
              activities={moduleActivities}
              enrollmentId={enrollment.id}
              moduleNumber={moduleNum}
              existingResponses={existingResponses}
              isLastModule={isLastModule}
              isAlreadyCompleted={isAlreadyCompleted}
              tables={moduleTables}
              learnerRole={
                enrollment.onboarding_answers
                  ? getRoleSpotlight(enrollment.onboarding_answers)
                  : 'other'
              }
            />
          </section>

          <SavedArtifactSection
            moduleNum={moduleNum}
            totalModules={modules.length}
            isAlreadyCompleted={isAlreadyCompleted}
            artifactLabel={artifactFirst?.saved ?? mod.keyOutput}
          />
        </article>
      </div>
    </CourseShell>
  );
}
