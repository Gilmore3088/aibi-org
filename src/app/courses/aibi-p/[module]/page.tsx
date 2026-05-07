// Dynamic module page — /courses/aibi-p/[module]
// Server Component: all content read from typed files at build time
// T-02-03: parseInt + getModuleByNumber + notFound() guards invalid params
// SHELL-12: Non-enrolled users redirected to purchase page server-side
// SHELL-04/05: Locked module access redirected to current module server-side

import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  modules,
  getModuleByNumber,
  V4_AIBIP_MODULE_BY_NUMBER,
} from '@content/courses/aibi-p';
import type { Activity, ExpandedModule } from '@content/courses/aibi-p';
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
import { AIBI_P_ARTIFACTS } from '@content/practice-reps/aibi-p';
import {
  getModuleActivitySpec,
  buildModuleActivity,
} from '@content/courses/aibi-p/module-activities';

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
    return { title: 'Module Not Found | AiBI-Practitioner' };
  }
  return {
    title: `Module ${mod.number}: ${mod.title} | AiBI-Practitioner`,
  };
}

export default async function ModulePage({ params }: ModulePageParams) {
  const moduleNum = parseInt(params.module, 10);

  // T-02-03: Guard against invalid params (NaN, out of range, non-existent)
  if (isNaN(moduleNum) || moduleNum < 1 || moduleNum > modules.length) {
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

  const isLastModule = mod.number === modules.length;
  const isAlreadyCompleted = enrollment.completed_modules.includes(moduleNum);
  const expandedModule = V4_AIBIP_MODULE_BY_NUMBER.get(moduleNum);
  // 2026-04-29: per-module structured Apply activities replace the generic
  // V4 textarea form. Each spec drives both the form fields and the
  // downloadable artifact .md served by /api/courses/generate-module-artifact.
  const moduleSpec = getModuleActivitySpec(moduleNum);
  const moduleActivities = moduleSpec
    ? [buildModuleActivity(moduleSpec)]
    : expandedModule
      ? [buildV4Activity(expandedModule)]
      : mod.activities;
  const moduleTables = expandedModule ? undefined : mod.tables;

  // Fetch existing activity responses for this enrollment + module (read-only, service role)
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
                sections={expandedModule?.sections ?? mod.sections}
                keyTakeaways={expandedModule?.takeaways}
                moduleNumber={moduleNum}
              />
              <BankingBoundary moduleNumber={moduleNum} />
              {moduleTables && moduleTables.length > 0 && (
                <div className="mt-6">
                  {moduleTables.map((table) => (
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
          }
        />
      </article>
    </>
  );
}

function buildV4Activity(module: ExpandedModule): Activity {
  const artifact = AIBI_P_ARTIFACTS.find((item) => item.moduleNumber === module.number);

  return {
    id: `${module.number}.1`,
    title: module.practice,
    description: `Complete the practice, capture the useful output, and save the artifact: ${module.artifact}`,
    type: 'free-text',
    fields: [
      {
        id: 'practice-response',
        label: 'Paste or write your practice response here.',
        type: 'textarea',
        minLength: 20,
        required: true,
        placeholder: module.practice,
      },
      {
        id: 'review-notes',
        label: 'What did you change, verify, or decide before using the output?',
        type: 'textarea',
        minLength: 20,
        required: true,
        placeholder: 'Note the human review step, safety boundary, or improvement you made.',
      },
    ],
    completionTrigger: 'save-response',
    artifactId: artifact?.id,
  };
}

function BankingBoundary({ moduleNumber }: { readonly moduleNumber: number }) {
  const boundary = BANKING_BOUNDARIES[moduleNumber] ?? BANKING_BOUNDARIES.default;

  return (
    <section className="mt-8 border border-[color:var(--color-ink)]/10 rounded-[3px] bg-[color:var(--color-parch)] p-6">
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
        Banking Boundary
      </p>
      <div className="grid md:grid-cols-3 gap-5">
        {boundary.map(([title, body]) => (
          <div key={title}>
            <h2 className="font-serif text-lg text-[color:var(--color-ink)]">
              {title}
            </h2>
            <p className="text-sm text-[color:var(--color-slate)] leading-relaxed mt-2">
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const BANKING_BOUNDARIES: Record<string | number, readonly (readonly [string, string])[]> = {
  1: [
    ['Do not paste', 'Customer data, account details, or confidential internal reports.'],
    ['Human review', 'Any customer-facing draft, numbers, policy claims, or procedural instruction.'],
    ['Escalate', 'Credit, legal, compliance, privacy, or complaint decisions.'],
  ],
  2: [
    ['Do not assume', 'AI confidence is not evidence. Treat unsupported claims as review items.'],
    ['Human review', 'Citations, dates, policy interpretations, and regulatory statements.'],
    ['Escalate', 'Anything that could change customer treatment or institutional risk.'],
  ],
  4: [
    ['Do not paste', 'PII, NPI, customer records, account numbers, or transaction-level detail.'],
    ['Human review', 'All yellow-zone drafts before they leave an approved internal workflow.'],
    ['Escalate', 'Red-zone use cases or any use requiring approved systems and controls.'],
  ],
  8: [
    ['Do not include', 'Customer data, private employee information, passwords, or confidential records.'],
    ['Human review', 'Voice profiles, examples, reusable prompts, and do-not-do boundaries.'],
    ['Escalate', 'Any system file that would affect customer treatment, credit, legal, or compliance decisions.'],
  ],
  default: [
    ['Do not paste', 'Sensitive customer, employee, financial, or confidential bank data.'],
    ['Human review', 'Facts, numbers, policy language, recommendations, and external-facing outputs.'],
    ['Escalate', 'Legal, compliance, credit, privacy, or high-impact operational decisions.'],
  ],
};
