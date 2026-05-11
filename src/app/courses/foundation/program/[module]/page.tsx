// Dynamic module page — /courses/foundation/program/[module]
//
// LMS reskin (PR 2 of 7): wraps the module surface in the Ledger-styled
// <CourseShell> + <LMSTopBar> primitives introduced in PR #52. The tab
// content (Learn / Practice / Apply) and all activity-routing behavior
// are preserved unchanged — only the surrounding chrome is reskinned.
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
  foundationProgramCourseConfig,
  getModuleByNumber,
  V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER,
} from '@content/courses/foundation-program';
import type { Activity, ExpandedModule } from '@content/courses/foundation-program';
import { ContentTable } from '../_components/ContentTable';
import { LearnSection } from '../_components/LearnSection';
import { ModuleContentClient } from '../_components/ModuleContentClient';
import { CourseTabs } from '@/components/CourseTabs';
import {
  CourseShell,
  LMSTopBar,
  PillarTag,
  ProgressDot,
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
import { AIBI_P_ARTIFACTS } from '@content/practice-reps/foundation-program';
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

  const lmsModules: readonly LMSModule[] = toLMSModules(
    foundationProgramCourseConfig.modules,
  );
  const status = getModuleStatus(
    mod.number,
    enrollment.completed_modules,
    enrollment.current_module,
  );
  const pillarId = mod.pillar;
  const goalLine =
    expandedModule?.goal ??
    `Use AI more safely and practically for ${mod.keyOutput.toLowerCase()}.`;
  const titleParts = mod.title.split(' — ');
  const titleMain = titleParts[0];
  const titleTail = titleParts.length > 1 ? titleParts.slice(1).join(' — ') : null;

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
              fontFamily: 'var(--ledger-mono)',
              fontSize: 10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--ledger-muted)',
              textDecoration: 'none',
            }}
          >
            ← Course overview
          </Link>
        }
      />

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 36px 24px' }}>
        {/* Module header */}
        <header>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              marginBottom: 18,
              flexWrap: 'wrap',
            }}
          >
            <PillarTag pillarId={pillarId} />
            <span
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ledger-muted)',
              }}
            >
              Module {String(mod.number).padStart(2, '0')} · {mod.estimatedMinutes} min
            </span>
            <span style={{ flex: 1, height: 1, background: 'var(--ledger-rule)' }} />
            <ProgressDot status={status} />
            <span
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 10,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: status === 'current' ? 'var(--ledger-accent)' : 'var(--ledger-muted)',
              }}
            >
              {status === 'current'
                ? 'In progress'
                : status === 'completed'
                  ? 'Completed'
                  : 'Locked'}
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--ledger-serif)',
              fontWeight: 500,
              fontSize: 'clamp(38px, 5vw, 58px)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              margin: '0 0 12px',
              color: 'var(--ledger-ink)',
            }}
          >
            {titleMain}
            {titleTail && (
              <em
                style={{
                  color: 'var(--ledger-accent)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                {' — '}
                {titleTail}
              </em>
            )}
          </h1>

          <p
            style={{
              fontFamily: 'var(--ledger-serif)',
              fontStyle: 'italic',
              fontSize: 19,
              lineHeight: 1.45,
              color: 'var(--ledger-ink-2)',
              margin: '0 0 14px',
              maxWidth: '72ch',
            }}
          >
            {goalLine}
          </p>

          <p
            style={{
              color: 'var(--ledger-slate)',
              fontSize: 13,
              fontFamily: 'var(--ledger-mono)',
              letterSpacing: '0.04em',
              margin: 0,
              paddingTop: 14,
              borderTop: '1px solid var(--ledger-rule)',
            }}
          >
            You walk away with:{' '}
            <span style={{ color: 'var(--ledger-ink)', fontWeight: 600 }}>
              {mod.keyOutput}
            </span>
          </p>
        </header>
      </div>

      {/* Tabbed content (Learn / Practice / Apply) — behavior preserved */}
      <article style={{ maxWidth: 1180, margin: '0 auto', padding: '4px 36px 80px' }}>
        <CourseTabs
          storagePrefix="aibi-p-m"
          segmentNumber={moduleNum}
          accentColor="var(--ledger-accent)"
          learnContent={
            <>
              <LearnSection
                sections={expandedModule?.sections ?? mod.sections}
                keyTakeaways={expandedModule?.takeaways}
                moduleNumber={moduleNum}
              />
              <BankingBoundary moduleNumber={moduleNum} />
              {moduleTables && moduleTables.length > 0 && (
                <div style={{ marginTop: 24 }}>
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
                product="foundation"
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
    </CourseShell>
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
    <section
      style={{
        marginTop: 32,
        border: '1px solid var(--ledger-rule)',
        borderRadius: 3,
        background: 'var(--ledger-parch)',
        padding: 24,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--ledger-mono)',
          fontSize: 10.5,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--ledger-accent)',
          margin: '0 0 14px',
        }}
      >
        Banking Boundary
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
        }}
      >
        {boundary.map(([title, body]) => (
          <div key={title}>
            <h2
              style={{
                fontFamily: 'var(--ledger-serif)',
                fontSize: 18,
                fontWeight: 500,
                color: 'var(--ledger-ink)',
                margin: '0 0 6px',
              }}
            >
              {title}
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: 'var(--ledger-slate)',
                lineHeight: 1.55,
                margin: 0,
              }}
            >
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
