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
import { SubTaskProgressStrip, type SubTaskItem } from './_local/SubTaskProgressStrip';
import { CollapsibleBoundary } from './_local/CollapsibleBoundary';
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

  // Approximate per-sub-task minutes by splitting the module estimate.
  // The content data has no per-sub-task breakdown (see report); these
  // proportions match the audit's example pattern (12 / 18 / 25 / 0).
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

      {/* Page surface — cream background extends through the module body. */}
      <div
        style={{
          background: 'var(--cream)',
          fontFamily: MOCKUP_FONT,
          color: 'var(--ink)',
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 36px 16px' }}>
          {/* Module header — H1 promoted to keyOutput (audit §3 minor). */}
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
              <span style={KICKER_STYLE}>
                Module {String(mod.number).padStart(2, '0')} · {titleMain}
                {titleTail ? ` — ${titleTail}` : ''}
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

            {/* H1: the artifact this module produces (audit §3, item 1). */}
            <p style={{ ...KICKER_STYLE, margin: '0 0 8px' }}>You walk away with</p>
            <h1
              style={{
                fontFamily: MOCKUP_FONT,
                fontWeight: 700,
                fontSize: 'clamp(32px, 4.2vw, 48px)',
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                margin: '0 0 14px',
                color: 'var(--ink)',
              }}
            >
              {mod.keyOutput}
            </h1>

            <p
              style={{
                fontFamily: MOCKUP_FONT,
                fontSize: 17,
                lineHeight: 1.5,
                color: 'var(--slate-600)',
                margin: '0 0 14px',
                maxWidth: '72ch',
                fontWeight: 400,
              }}
            >
              {goalLine}
            </p>

            {/* Compacted loop ribbon — single row, smaller (audit §3, item 2). */}
            <div
              aria-label="Module loop"
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                alignItems: 'center',
                fontFamily: MOCKUP_FONT,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--slate-600)',
                letterSpacing: '0.04em',
              }}
            >
              <span style={META_STYLE}>{mod.estimatedMinutes} min total</span>
              <span style={{ color: 'var(--slate-400)' }}>·</span>
              <span>Learn it</span>
              <span style={{ color: 'var(--slate-400)' }}>→</span>
              <span>Try it</span>
              <span style={{ color: 'var(--slate-400)' }}>→</span>
              <span>Use it</span>
              <span style={{ color: 'var(--slate-400)' }}>→</span>
              <span>Save it</span>
            </div>
          </header>
        </div>

        {/* Sticky sub-task progress strip — primary in-page nav (audit §3 structural). */}
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 36px' }}>
          <SubTaskProgressStrip items={subTaskItems} />
        </div>

        {/* Scroll-through sections — each sub-task anchored, no tabs. */}
        <article style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 36px 80px' }}>
          <section
            id="st-takeaway"
            aria-labelledby="st-takeaway-h"
            style={{ scrollMarginTop: 160, paddingTop: 12 }}
          >
            <h2
              id="st-takeaway-h"
              style={{
                fontFamily: MOCKUP_FONT,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
                margin: '0 0 16px',
              }}
            >
              Takeaway · {takeawayMin} min
            </h2>
            <LearnSection
              sections={expandedModule?.sections ?? []}
              keyTakeaways={expandedModule?.takeaways}
              moduleNumber={moduleNum}
            />
            <CollapsibleBoundary defaultOpen={moduleNum === 1}>
              <BankingBoundaryGrid moduleNumber={moduleNum} />
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
            <section
              id="st-sandbox"
              aria-labelledby="st-sandbox-h"
              style={{ scrollMarginTop: 160, paddingTop: 48 }}
            >
              <h2
                id="st-sandbox-h"
                style={{
                  fontFamily: MOCKUP_FONT,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--gold-deep)',
                  margin: '0 0 16px',
                }}
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

          <section
            id="st-submit"
            aria-labelledby="st-submit-h"
            style={{ scrollMarginTop: 160, paddingTop: 48 }}
          >
            <h2
              id="st-submit-h"
              style={{
                fontFamily: MOCKUP_FONT,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
                margin: '0 0 16px',
              }}
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

          <section
            id="st-saved"
            aria-labelledby="st-saved-h"
            style={{ scrollMarginTop: 160, paddingTop: 48 }}
          >
            <h2
              id="st-saved-h"
              style={{
                fontFamily: MOCKUP_FONT,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
                margin: '0 0 12px',
              }}
            >
              Saved artifact
            </h2>
            <div
              style={{
                padding: '20px 22px',
                background: 'white',
                border: '1px solid var(--ink-a10, rgba(7,26,47,0.10))',
                borderRadius: 16,
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <p
                style={{
                  fontFamily: MOCKUP_FONT,
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  margin: '0 0 6px',
                  lineHeight: 1.5,
                }}
              >
                {mod.keyOutput}
              </p>
              <p
                style={{
                  fontFamily: MOCKUP_FONT,
                  fontSize: 14,
                  color: 'var(--slate-600)',
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                {isAlreadyCompleted
                  ? 'Saved to your library. Open the Submit step above to review or revise your response.'
                  : 'Once you complete the Submit step above, your response is saved here as a reusable artifact in your library.'}
              </p>
            </div>
          </section>
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

function BankingBoundaryGrid({ moduleNumber }: { readonly moduleNumber: number }) {
  const boundary = BANKING_BOUNDARIES[moduleNumber] ?? BANKING_BOUNDARIES.default;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 22,
        fontFamily: MOCKUP_FONT,
      }}
    >
      {boundary.map(([title, body]) => (
        <div key={title}>
          <h3
            style={{
              fontFamily: MOCKUP_FONT,
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--ink)',
              margin: '0 0 6px',
              letterSpacing: '-0.005em',
            }}
          >
            {title}
          </h3>
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
