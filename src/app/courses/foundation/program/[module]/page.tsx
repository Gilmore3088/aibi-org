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
} from '@content/courses/foundation-program';
import type { Activity, ExpandedModule } from '@content/courses/foundation-program';
import { ContentTable } from '@/components/lms/ContentTable';
import { LearnSection } from '../_components/LearnSection';
import { ModuleContentClient } from '../_components/ModuleContentClient';
import { Tabbed } from '@/lib/lms/module-body';
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
import { MiniTutorialList } from '../_components/MiniTutorialList';
import {
  M3_TUTORIALS,
  M7_TUTORIALS,
} from '@content/courses/foundation-program/prompt-library';
import { FOUNDATION_ARTIFACTS } from '@content/practice-reps/foundation-program';
import {
  getModuleActivitySpec,
  buildModuleActivity,
} from '@content/courses/foundation-program/module-activities';

interface ModulePageParams {
  readonly params: { module: string };
}

// Mockup-system shared text styles — kept in module scope so this file
// stays self-contained (no shared LMS components touched in Wave 1).
const MOCKUP_FONT = 'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const KICKER_STYLE: React.CSSProperties = {
  fontFamily: MOCKUP_FONT,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
};

const META_STYLE: React.CSSProperties = {
  fontFamily: MOCKUP_FONT,
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: '0.04em',
  color: 'var(--slate-500)',
};

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
    foundationCourseConfig.modules,
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

  const statusLabel =
    status === 'current'
      ? 'In progress'
      : status === 'completed'
        ? 'Completed'
        : 'Locked';
  const statusColor =
    status === 'current'
      ? 'var(--gold-deep)'
      : status === 'completed'
        ? 'var(--emerald-700)'
        : 'var(--slate-500)';

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

      {/* Page surface — cream background extends through the module body. */}
      <div
        style={{
          background: 'var(--cream)',
          fontFamily: MOCKUP_FONT,
          color: 'var(--ink)',
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 36px 24px' }}>
          {/* Module header */}
          <header>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                marginBottom: 20,
                flexWrap: 'wrap',
              }}
            >
              <PillarTag pillarId={pillarId} />
              <span style={META_STYLE}>
                Module {String(mod.number).padStart(2, '0')} · {mod.estimatedMinutes} min
              </span>
              <span style={{ flex: 1, height: 1, background: 'var(--ink-a10)' }} />
              <ProgressDot status={status} />
              <span
                style={{
                  ...META_STYLE,
                  color: statusColor,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  fontSize: 11,
                }}
              >
                {statusLabel}
              </span>
            </div>

            <h1
              style={{
                fontFamily: MOCKUP_FONT,
                fontWeight: 700,
                fontSize: 'clamp(36px, 4.8vw, 54px)',
                lineHeight: 1.06,
                letterSpacing: '-0.02em',
                margin: '0 0 14px',
                color: 'var(--ink)',
              }}
            >
              {titleMain}
              {titleTail && (
                <span
                  style={{
                    color: 'var(--gold-deep)',
                    fontWeight: 600,
                  }}
                >
                  {' — '}
                  {titleTail}
                </span>
              )}
            </h1>

            <p
              style={{
                fontFamily: MOCKUP_FONT,
                fontSize: 19,
                lineHeight: 1.5,
                color: 'var(--slate-600)',
                margin: '0 0 18px',
                maxWidth: '72ch',
                fontWeight: 400,
              }}
            >
              {goalLine}
            </p>

            {/* Artifact-forward callout — the practical thing this module produces. */}
            <div
              style={{
                marginTop: 6,
                padding: '18px 22px',
                background: 'white',
                border: '1px solid var(--ink-a10)',
                borderRadius: 'var(--r-lg, 16px)',
                boxShadow: 'var(--shadow-soft)',
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              <span style={KICKER_STYLE}>You walk away with</span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  flex: '1 1 320px',
                  lineHeight: 1.5,
                }}
              >
                {mod.keyOutput}
              </span>
            </div>

            {/*
              Canonical module loop indicator (issue #104 §6). Four steps,
              mockup-styled as a numbered ribbon of pcards.
            */}
            <ol
              aria-label="Module loop"
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '22px 0 0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
              }}
            >
              {[
                { n: '01', label: 'Learn it.' },
                { n: '02', label: 'Try it.' },
                { n: '03', label: 'Use it.' },
                { n: '04', label: 'Save it.' },
              ].map((step) => (
                <li
                  key={step.n}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 10,
                    padding: '12px 14px',
                    background: 'var(--cream-2)',
                    border: '1px solid var(--ink-a10)',
                    borderRadius: 'var(--r-md, 12px)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: MOCKUP_FONT,
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--gold-deep)',
                      letterSpacing: '0.14em',
                    }}
                  >
                    {step.n}
                  </span>
                  <span
                    style={{
                      fontFamily: MOCKUP_FONT,
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--ink)',
                    }}
                  >
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>
          </header>
        </div>

        {/* Tabbed content (Learn / Practice / Apply) — behavior preserved.
            Mockup gold accent is passed through the existing accentColor prop;
            the inner tab chrome lives in shared CourseTabs (out of scope for
            this pass). */}
        <article style={{ maxWidth: 1180, margin: '0 auto', padding: '4px 36px 80px' }}>
          <Tabbed
            storagePrefix="foundations-m"
            legacyStoragePrefix="aibi-p-m"
            moduleNumber={moduleNum}
            accentColor="var(--gold)"
            learnContent={
              <>
                <LearnSection
                  sections={expandedModule?.sections ?? []}
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
              <>
                {SANDBOX_CONFIGS[moduleNum] && (
                  <AIPracticeSandbox
                    moduleId={`aibi-p-module-${moduleNum}`}
                    product="foundation"
                    sandboxConfig={SANDBOX_CONFIGS[moduleNum]!}
                  />
                )}
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
              </>
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
      </div>
    </CourseShell>
  );
}

function buildV4Activity(module: ExpandedModule): Activity {
  const artifact = FOUNDATION_ARTIFACTS.find((item) => item.moduleNumber === module.number);

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
        border: '1px solid var(--ink-a10)',
        borderRadius: 'var(--r-xl, 24px)',
        background: 'white',
        boxShadow: 'var(--shadow-soft)',
        padding: 28,
        fontFamily: MOCKUP_FONT,
      }}
    >
      <p
        style={{
          ...KICKER_STYLE,
          margin: '0 0 16px',
        }}
      >
        Banking Boundary
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 22,
        }}
      >
        {boundary.map(([title, body]) => (
          <div key={title}>
            <h2
              style={{
                fontFamily: MOCKUP_FONT,
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--ink)',
                margin: '0 0 6px',
                letterSpacing: '-0.005em',
              }}
            >
              {title}
            </h2>
            <p
              style={{
                fontSize: 14,
                color: 'var(--slate-600)',
                lineHeight: 1.55,
                margin: 0,
                fontWeight: 400,
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
