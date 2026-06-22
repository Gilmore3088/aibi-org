// Dynamic module page — /courses/foundation/program/[module]
//
// LMS reskin (Wave 1, 2026-05-27): ported the per-module surface to the
// mockup design system (Inter, navy --ink, gold --gold accent, cream
// surface, mockup radii + shadows). The CourseShell + LMSTopBar chrome
// is retained from Ledger for now (other Wave-1 agents own those
// shells); the page-level header and four-step workspace are restyled at
// the page level. The module body now uses Understand / Try / Build / Save
// phases so the learner sees one action at a time.
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
import { ModuleContentClient } from '../_components/ModuleContentClient';
import { ModuleTabs } from '../_components/ModuleTabs';
import {
  CourseShell,
  LMSTopBar,
  getModuleStatus,
  toLMSModules,
  type LMSModule,
} from '@/components/lms';
import { DEV_COURSE_ENROLLMENT_ID, getEnrollment } from '../_lib/getEnrollment';
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
import { SavedArtifactSection } from './_components/SavedArtifactSection';
import { ModuleHeaderCard } from './_components/ModuleHeaderCard';
import { LabArtifactDraft } from '../_components/LabArtifactDraft';
import {
  ModuleInteractiveTakeaway,
  ModuleInteractiveTakeawayStyles,
} from '../_components/ModuleInteractiveTakeaway';
import {
  getFoundationLabBrief,
  type FoundationLabBrief,
} from '@content/courses/foundation-program/lab-first';

interface ModulePageParams {
  readonly params: Promise<{ module: string }>;
}

const MOCKUP_FONT = 'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

function LabPracticeBrief({
  brief,
  artifactLabel,
  sampleLabel,
}: {
  readonly brief: FoundationLabBrief;
  readonly artifactLabel: string;
  readonly sampleLabel: string;
}) {
  return (
    <aside
      className="foundation-lab-practice-brief"
      aria-label="AiBI Lab practice brief"
      style={{
        marginBottom: 14,
        border: '1px solid var(--ink-a10)',
        borderRadius: 16,
        background: '#fff',
        padding: 'clamp(14px, 2vw, 18px)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: 'clamp(12px, 2vw, 20px)',
          alignItems: 'start',
        }}
        className="foundation-lab-practice-brief__grid"
      >
        <div className="foundation-lab-practice-brief__lead">
          <p
            style={{
              margin: '0 0 10px',
              color: 'var(--gold-deep)',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Try this
          </p>
          <h3
            style={{
              margin: 0,
              color: 'var(--ink)',
              fontSize: 'clamp(19px, 1.8vw, 24px)',
              lineHeight: 1.18,
              letterSpacing: '-0.02em',
              fontWeight: 850,
            }}
          >
            {brief.labTask}
          </h3>
          <p style={{ margin: '7px 0 0', color: 'var(--slate-600)', fontSize: 13, lineHeight: 1.38, fontWeight: 650 }}>
            Use the sample data. Save draft material only.
          </p>
        </div>

        <dl
          className="foundation-lab-practice-brief__items"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 8,
            margin: 0,
            padding: 0,
            minWidth: 280,
          }}
        >
          {[
            ['Source', sampleLabel],
            ['Save', artifactLabel],
          ].map(([label, value]) => (
            <div
              key={label}
              className="foundation-lab-practice-brief__item"
              style={{
                display: 'grid',
                gap: 5,
                minWidth: 0,
                padding: '10px 12px',
                border: '1px solid var(--ink-a10)',
                borderRadius: 12,
                background: 'var(--cream)',
              }}
            >
              <dt
                style={{
                  margin: 0,
                  color: 'var(--gold-deep)',
                  fontSize: 10,
                  fontWeight: 850,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </dt>
              <dd style={{ margin: 0, color: 'var(--ink)', fontSize: 13, lineHeight: 1.28, fontWeight: 780 }}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}

export const dynamic = 'force-dynamic';

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

  const isDevPreviewEnrollment = enrollment.id === DEV_COURSE_ENROLLMENT_ID;

  if (!isDevPreviewEnrollment && !canAccessModule(moduleNum, enrollment.completed_modules)) {
    redirect(`/courses/foundation/program/${enrollment.current_module}`);
  }

  const isLastModule = mod.number === modules.length;
  const completedModulesForView = enrollment.completed_modules;
  const currentModuleForView = isDevPreviewEnrollment ? moduleNum : enrollment.current_module;
  const isAlreadyCompleted = completedModulesForView.includes(moduleNum);
  const moduleId = `aibi-p-module-${moduleNum}`;
  const artifactFirst = getArtifactFirst(moduleNum);
  const labBrief = getFoundationLabBrief(moduleNum);
  const learnerRole = enrollment.onboarding_answers
    ? getRoleSpotlight(enrollment.onboarding_answers)
    : 'other';
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
  const status = getModuleStatus(mod.number, completedModulesForView, currentModuleForView);
  const pillarId = mod.pillar;
  const goalLine =
    expandedModule?.goal ??
    `Use AI more safely and practically for ${mod.keyOutput.toLowerCase()}.`;
  const titleParts = mod.title.split(' — ');
  const titleMain = titleParts[0];
  const titleTail = titleParts.length > 1 ? titleParts.slice(1).join(' — ') : null;

  const statusLabel =
    status === 'current' ? 'In progress' : status === 'completed' ? 'Completed' : 'Locked';
  const learningPlan = labBrief
    ? {
        artifact: artifactFirst?.saved ?? mod.keyOutput,
        recall: labBrief.learningLoop.recallPrompt,
        practice: labBrief.learningLoop.deliberatePractice,
        feedback: labBrief.learningLoop.feedbackCue,
        transfer: labBrief.learningLoop.transferPrompt,
      }
    : undefined;

  const totalMin = mod.estimatedMinutes;
  const takeawayMin = Math.max(5, Math.round(totalMin * 0.22));
  const sandboxMin = Math.max(5, Math.round(totalMin * 0.32));
  const submitMin = Math.max(5, totalMin - takeawayMin - sandboxMin);
  const hasSandbox = Boolean(SANDBOX_CONFIGS[moduleNum]);

  return (
    <CourseShell
      modules={lmsModules}
      completed={completedModulesForView}
      current={currentModuleForView}
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
        className="foundation-module-page"
        style={{ background: 'var(--cream)', fontFamily: MOCKUP_FONT, color: 'var(--ink)' }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .foundation-evidence-drawer {
                margin: 12px 0 0;
                border: 1px solid var(--ink-a10);
                border-radius: 16px;
                background: #fff;
                overflow: hidden;
                box-shadow: var(--shadow-soft);
              }
              .foundation-evidence-drawer > summary {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 13px 16px;
                cursor: pointer;
                list-style: none;
                font-family: ${MOCKUP_FONT};
              }
              .foundation-evidence-drawer > summary::-webkit-details-marker {
                display: none;
              }
              .foundation-evidence-drawer__label {
                color: var(--gold-deep);
                font-size: 11px;
                font-weight: 850;
                letter-spacing: 0.16em;
                text-transform: uppercase;
              }
              .foundation-evidence-drawer__hint {
                color: var(--slate-600);
                font-size: 13px;
                font-weight: 700;
                text-align: right;
              }
              @media (max-width: 900px) {
                .foundation-module-page__hero-wrap {
                  padding: 20px 20px 10px !important;
                }
                .foundation-module-page__article {
                  padding: 20px 20px 72px !important;
                }
              }
              @media (max-width: 640px) {
                .foundation-module-page__hero-wrap {
                  padding: 12px 16px 8px !important;
                }
                .foundation-module-page__article {
                  padding: 16px 16px 64px !important;
                }
                .foundation-module-page__lab-section,
                .foundation-module-page__submit-section {
                  padding-top: 28px !important;
                }
                .foundation-evidence-drawer > summary {
                  align-items: flex-start !important;
                  flex-direction: column !important;
                  gap: 5px !important;
                }
                .foundation-evidence-drawer__hint {
                  text-align: left !important;
                }
                .foundation-lab-practice-brief {
                  padding: 14px 0 !important;
                }
                .foundation-lab-practice-brief__grid {
                  grid-template-columns: 1fr !important;
                  gap: 12px !important;
                }
                .foundation-lab-practice-brief__lead {
                  padding: 0 !important;
                }
                .foundation-lab-practice-brief__lead h3 {
                  font-size: 22px !important;
                  line-height: 1.1 !important;
                }
                .foundation-lab-practice-brief__items {
                  grid-template-columns: 1fr !important;
                  gap: 8px !important;
                  min-width: 0 !important;
                }
                .foundation-lab-practice-brief__item {
                  min-height: auto !important;
                  padding: 10px 12px !important;
                  border: 1px solid var(--ink-a10) !important;
                  gap: 6px !important;
                }
              }
            `,
          }}
        />
        <ModuleInteractiveTakeawayStyles />
        <div
          className="foundation-module-page__hero-wrap"
          style={{ maxWidth: 'none', margin: '0 auto', padding: '40px 36px 16px' }}
        >
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
            hasLab={hasSandbox}
            learningPlan={learningPlan}
          />
        </div>

        <article
          className="foundation-module-page__article"
          style={{ maxWidth: 'none', margin: '0 auto', padding: '24px 36px 80px' }}
        >
          <ModuleTabs
            moduleNumber={moduleNum}
            learnContent={
              <section id="st-takeaway" aria-labelledby="st-takeaway-h" style={{ scrollMarginTop: 160 }}>
                <h2
                  id="st-takeaway-h"
                  style={{ fontFamily: MOCKUP_FONT, fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-deep)', margin: '0 0 16px' }}
                >
                  Understand · {takeawayMin} min
                </h2>
                <LearnSection
                  sections={expandedModule?.sections ?? []}
                  keyTakeaways={expandedModule?.takeaways}
                  moduleNumber={moduleNum}
                  learnerRole={learnerRole}
                />
                {moduleTables && moduleTables.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    {moduleTables.map((table) => (
                      <ContentTable key={table.id} table={table} />
                    ))}
                  </div>
                )}
              </section>
            }
            practiceContent={
              (
                <section
                  id="st-sandbox"
                  aria-labelledby="st-sandbox-h"
                  className="foundation-module-page__lab-section"
                  style={{ scrollMarginTop: 160 }}
                >
                  <h2
                    id="st-sandbox-h"
                    style={{ fontFamily: MOCKUP_FONT, fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-deep)', margin: '0 0 16px' }}
                  >
                    Try · {sandboxMin} min
                  </h2>
                  {labBrief && (
                    <LabPracticeBrief
                      brief={labBrief}
                      artifactLabel={artifactFirst?.saved ?? mod.keyOutput}
                      sampleLabel={SANDBOX_CONFIGS[moduleNum]?.sampleData[0]?.label ?? 'Guided practice task'}
                    />
                  )}
                  <ModuleInteractiveTakeaway
                    moduleNumber={moduleNum}
                    moduleId={moduleId}
                    artifactLabel={artifactFirst?.saved ?? mod.keyOutput}
                  />
                  {hasSandbox && (
                    <AIPracticeSandbox
                      moduleId={moduleId}
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
                </section>
              )
            }
            applyContent={
              <section
                id="st-submit"
                aria-labelledby="st-submit-h"
                className="foundation-module-page__submit-section"
                style={{ scrollMarginTop: 160 }}
              >
                <h2
                  id="st-submit-h"
                  style={{ fontFamily: MOCKUP_FONT, fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-deep)', margin: '0 0 16px' }}
                >
                  Build · {submitMin} min
                </h2>
                <LabArtifactDraft
                  moduleId={moduleId}
                  artifactLabel={artifactFirst?.saved ?? mod.keyOutput}
                  feedbackCue={labBrief?.learningLoop.feedbackCue}
                />
                <ModuleContentClient
                  activities={moduleActivities}
                  enrollmentId={enrollment.id}
                  moduleNumber={moduleNum}
                  existingResponses={existingResponses}
                  isLastModule={isLastModule}
                  isAlreadyCompleted={isAlreadyCompleted}
                />
              </section>
            }
            saveContent={
              <section
                id="st-saved"
                aria-labelledby="st-saved-h"
                className="foundation-module-page__submit-section"
                style={{ scrollMarginTop: 160 }}
              >
                <h2
                  id="st-saved-h"
                  style={{ fontFamily: MOCKUP_FONT, fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-deep)', margin: '0 0 16px' }}
                >
                  Save · Packet proof
                </h2>
                <SavedArtifactSection
                  moduleNum={moduleNum}
                  totalModules={modules.length}
                  isAlreadyCompleted={isAlreadyCompleted}
                  artifactLabel={artifactFirst?.saved ?? mod.keyOutput}
                />
              </section>
            }
          />
        </article>
      </div>
    </CourseShell>
  );
}
