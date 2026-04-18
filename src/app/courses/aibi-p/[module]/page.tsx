// Dynamic module page — /courses/aibi-p/[module]
// Server Component: all content read from typed files at build time
// T-02-03: parseInt + getModuleByNumber + notFound() guards invalid params
// SHELL-12: Non-enrolled users redirected to purchase page server-side
// SHELL-04/05: Locked module access redirected to current module server-side

import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { modules, getModuleByNumber } from '@content/courses/aibi-p';
import { ModuleHeader } from '../_components/ModuleHeader';
import { ContentTable } from '../_components/ContentTable';
import { LearnSection } from '../_components/LearnSection';
import { ModuleContentClient } from '../_components/ModuleContentClient';
import { CourseTabs } from '@/components/CourseTabs';
import { getEnrollment } from '../_lib/getEnrollment';
import { canAccessModule } from '../_lib/courseProgress';
import { getRoleSpotlight } from '../_lib/contentRouting';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { ActivityResponse } from '@/types/course';
import { AIPracticeSandbox } from '@/components/AIPracticeSandbox';
import { SANDBOX_CONFIGS } from '@content/sandbox-data/aibi-p';

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
    return { title: 'Module Not Found | AiBI-P' };
  }
  return {
    title: `Module ${mod.number}: ${mod.title} | AiBI-P`,
  };
}

export default async function ModulePage({ params }: ModulePageParams) {
  const moduleNum = parseInt(params.module, 10);

  // T-02-03: Guard against invalid params (NaN, out of range, non-existent)
  if (isNaN(moduleNum) || moduleNum < 1 || moduleNum > 9) {
    notFound();
  }

  const mod = getModuleByNumber(moduleNum);
  if (!mod) {
    notFound();
  }

  // SHELL-12: Require enrollment — redirect unauthenticated / non-enrolled visitors
  const enrollment = await getEnrollment();
  if (!enrollment) {
    redirect('/courses/aibi-p/purchase');
  }

  // SHELL-04/05: Forward-only enforcement — redirect to current module if locked
  if (!canAccessModule(moduleNum, enrollment.completed_modules)) {
    redirect(`/courses/aibi-p/${enrollment.current_module}`);
  }

  const isLastModule = mod.number === 9;
  const isAlreadyCompleted = enrollment.completed_modules.includes(moduleNum);

  // Fetch existing activity responses for this enrollment + module (read-only, service role)
  const existingResponses: Record<string, Record<string, string>> = {};
  if (isSupabaseConfigured() && mod.activities.length > 0) {
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

  return (
    <>
      {/* Pillar-colored header band */}
      <ModuleHeader
        moduleNumber={mod.number}
        title={mod.title}
        pillar={mod.pillar}
        estimatedMinutes={mod.estimatedMinutes}
        keyOutput={mod.keyOutput}
      />

      {/* Content area — tabbed: Learn / Practice / Apply */}
      <article className="mx-auto px-8 lg:px-16 py-4">
        <CourseTabs
          storagePrefix="aibi-p-m"
          segmentNumber={moduleNum}
          learnContent={
            <>
              <LearnSection
                sections={mod.sections}
                keyTakeaways={mod.keyTakeaways}
              />
              {mod.tables && mod.tables.length > 0 && (
                <div className="mt-6">
                  {mod.tables.map((table) => (
                    <ContentTable key={table.id} table={table} />
                  ))}
                </div>
              )}
            </>
          }
          practiceContent={
            SANDBOX_CONFIGS[moduleNum] ? (
              <AIPracticeSandbox
                moduleId={`aibi-p-module-${moduleNum}`}
                product="aibi-p"
                sandboxConfig={SANDBOX_CONFIGS[moduleNum]!}
              />
            ) : null
          }
          applyContent={
            <ModuleContentClient
              activities={mod.activities}
              enrollmentId={enrollment.id}
              moduleNumber={moduleNum}
              existingResponses={existingResponses}
              isLastModule={isLastModule}
              isAlreadyCompleted={isAlreadyCompleted}
              tables={mod.tables}
              learnerRole={
                enrollment.onboarding_answers
                  ? getRoleSpotlight(enrollment.onboarding_answers)
                  : 'other'
              }
            />
          }
        />
      </article>
    </>
  );
}
