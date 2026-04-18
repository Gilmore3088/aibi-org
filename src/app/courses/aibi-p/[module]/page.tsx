// Dynamic module page — /courses/aibi-p/[module]
// Server Component: all content read from typed files at build time
// T-02-03: parseInt + getModuleByNumber + notFound() guards invalid params
// SHELL-12: Non-enrolled users redirected to purchase page server-side
// SHELL-04/05: Locked module access redirected to current module server-side

import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { modules, getModuleByNumber } from '@content/courses/aibi-p';
import { ModuleHeader } from '../_components/ModuleHeader';
import { ContentSection } from '../_components/ContentSection';
import { ContentTable } from '../_components/ContentTable';
import { ModuleContentClient } from '../_components/ModuleContentClient';
import { ModuleTabs } from '../_components/ModuleTabs';
import { getEnrollment } from '../_lib/getEnrollment';
import { canAccessModule } from '../_lib/courseProgress';
import { getRoleSpotlight } from '../_lib/contentRouting';
import { isDeepDiveModule, getDeepDiveFocus, getRolePath } from '@content/courses/aibi-p/role-paths';
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

  const learnerRole = enrollment.onboarding_answers
    ? getRoleSpotlight(enrollment.onboarding_answers)
    : null;
  const deepDiveFocus =
    learnerRole && isDeepDiveModule(learnerRole, moduleNum)
      ? getDeepDiveFocus(learnerRole, moduleNum)
      : null;
  const rolePath = learnerRole ? getRolePath(learnerRole) : null;

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
      <article className="mx-auto px-8 lg:px-16 py-8">

        {/* Role-specific deep-dive callout — shown above tabs */}
        {deepDiveFocus && rolePath && (
          <div
            className="mb-8 flex items-start gap-4 rounded-sm px-6 py-5"
            style={{
              backgroundColor: 'var(--color-parch)',
              border: '1px solid rgba(181,81,46,0.2)',
              borderLeft: '3px solid var(--color-terra)',
            }}
            role="note"
            aria-label={`Role-specific note for ${rolePath.label} learners`}
          >
            <svg
              className="flex-shrink-0 w-5 h-5 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ color: 'var(--color-terra)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <div>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-1"
                style={{ color: 'var(--color-terra)' }}
              >
                Especially relevant for {rolePath.label}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>
                Pay close attention to: <span className="font-medium">{deepDiveFocus}</span>
              </p>
            </div>
          </div>
        )}

        <ModuleTabs
          moduleNumber={moduleNum}
          learnContent={
            <>
              {mod.sections.map((section) => (
                <ContentSection key={section.id} section={section} />
              ))}
              {mod.tables && mod.tables.length > 0 && (
                <div className="mt-4">
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
