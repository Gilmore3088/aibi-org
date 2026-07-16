'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/mockup';
import { getUserDataWithSupabaseFallback, type UserData } from '@/lib/user-data';
import { modules } from '@content/courses/foundation-program';
import {
  FOUNDATION_PRACTICE_REPS,
  getDailyPracticeRep,
} from '@content/practice-reps/foundation-program';
import { migrateStorageKey } from '@/lib/storage/migrate';
import {
  deriveDashboardViewModel,
  resolveGreetingName,
  type AssessmentsState,
  type LearnerDashboardState,
  type ReadinessSnapshot,
  type ToolboxAccessState,
} from './deriveDashboardViewModel';
import { ActivationStep } from './_components/ActivationStep';
import { DashboardLoading } from './_components/DashboardLoading';
import { dashboardStyles } from './_components/dashboardStyles';
import { FeatureRow } from './_components/FeatureRow';
import { DASHBOARD_RESOURCES, ResourceCard } from './_components/resources';
import { SAFE_CELLS } from './_components/safeCells';
import { SnapshotPanel } from './_components/SnapshotPanel';
import { WorkCard } from './_components/WorkCard';

type LoadArea = 'learner' | 'assessments' | 'toolbox';

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [dashboard, setDashboard] = useState<LearnerDashboardState | null>(null);
  const [localCompletedRepIds, setLocalCompletedRepIds] = useState<readonly string[]>([]);
  const [assessments, setAssessments] = useState<AssessmentsState | null>(null);
  const [toolboxAccess, setToolboxAccess] = useState<ToolboxAccessState | null>(null);
  const [loadWarnings, setLoadWarnings] = useState<readonly LoadArea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserDataWithSupabaseFallback()
      .then(async (loadedUser) => {
        setUser(loadedUser);
        const warnings: LoadArea[] = [];
        try {
          const [learnerRes, assessmentsRes, toolboxRes] = await Promise.all([
            fetch('/api/dashboard/learner', { cache: 'no-store' }),
            fetch('/api/dashboard/assessments', { cache: 'no-store' }),
            fetch('/api/dashboard/toolbox-access', { cache: 'no-store' }),
          ]);
          if (learnerRes.ok) {
            setDashboard((await learnerRes.json()) as LearnerDashboardState);
          } else {
            warnings.push('learner');
          }
          if (assessmentsRes.ok) {
            setAssessments((await assessmentsRes.json()) as AssessmentsState);
          } else {
            warnings.push('assessments');
          }
          if (toolboxRes.ok) {
            setToolboxAccess((await toolboxRes.json()) as ToolboxAccessState);
          } else {
            warnings.push('toolbox');
          }
        } catch {
          // Local assessment-only users still get a useful dashboard fallback.
          warnings.push('learner', 'assessments', 'toolbox');
        } finally {
          setLoadWarnings(Array.from(new Set(warnings)));
        }
      })
      .finally(() => {
        setLocalCompletedRepIds(readLocalCompletedRepIds());
        setLoading(false);
      });
  }, []);

  const dailyRep = useMemo(() => getDailyPracticeRep(), []);
  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  if (loading) return <DashboardLoading />;

  const accountEmail = dashboard?.email ?? user?.email ?? null;
  const name = resolveGreetingName(assessments?.displayName ?? '', accountEmail ?? undefined);
  const snapshot = assessments?.snapshot ?? localReadinessToSnapshot(user?.readiness);
  const completedRepIds = Array.from(new Set([
    ...(dashboard?.practice.completedRepIds ?? []),
    ...localCompletedRepIds,
  ]));
  const currentRep = completedRepIds.includes(dailyRep.id)
    ? FOUNDATION_PRACTICE_REPS.find((rep) => !completedRepIds.includes(rep.id)) ?? dailyRep
    : dailyRep;

  const dashboardView = deriveDashboardViewModel({
    accountEmail,
    assessments,
    completedRepIds,
    currentRep,
    dashboard,
    snapshot,
    toolboxAccess,
  });
  const {
    artifacts,
    certificateHref,
    certificateVerifyUrl,
    completedArtifactCount,
    completedModuleCount,
    currentModuleNumber,
    heroLede,
    heroPrimary,
    heroSecondary,
    nextArtifact,
    nowIndex,
    savedPromptCount,
    stepAccount,
    stepAssessment,
    stepCertificate,
    stepEnrolled,
    stepFirstModule,
    stepInDepth,
    stepRep,
    stepsComplete,
    toolboxEntitled,
    toolboxLabel,
    totalModules,
    totalSteps,
    workPrimaryHref,
    workPrimaryLabel,
  } = dashboardView;

  const tabs: ReadonlyArray<{ label: string; href: string; active?: boolean; lock?: string }> = [
    { label: 'Dashboard', href: '/dashboard', active: true },
    { label: 'Assessments', href: '/dashboard/assessments' },
    { label: 'The Brief', href: '/resources' },
    {
      label: 'Curriculum',
      href: stepEnrolled ? '/courses/foundation/program' : '/courses/foundation',
      lock: stepEnrolled ? undefined : '— with Foundation',
    },
    {
      label: 'Toolbox',
      href: '/dashboard/toolbox',
      lock: toolboxEntitled ? `— ${toolboxLabel}` : '— with paid access',
    },
  ];

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/dashboard" cta={{ label: 'Start a Lesson', href: '/courses/foundation/program' }} />
      <style jsx global>{dashboardStyles}</style>

      <main className="mockup-dash">
        {/* TABS */}
        <div className="tabs">
          <nav className="tabs-inner" aria-label="My account">
            {tabs.map((t) => (
              <Link
                key={t.label}
                href={t.href}
                aria-current={t.active ? 'page' : undefined}
                className={`tab${t.active ? ' active' : ''}`}
              >
                {t.label}
                {t.lock && <span className="lock"> {t.lock}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {loadWarnings.length > 0 && (
          <div className="dash-alert" role="status">
            Some dashboard details could not be refreshed. The page is showing the latest available state.
          </div>
        )}

        {/* WELCOME */}
        <section className="welcome">
          <div className="container">
            <div className="wgrid">
              <div>
                <span className="eyebrow greet">
                  {snapshot ? 'Your AI readiness reading' : 'Welcome to The AI Banking Institute'}
                </span>
                {snapshot ? (
                  <>
                    <h1>
                      {name ? <>Hello, <strong>{name}.</strong></> : <>Welcome <strong>back.</strong></>}
                    </h1>
                    <SnapshotPanel snapshot={snapshot} inDepthEntitled={Boolean(assessments?.inDepth?.entitled)} />
                  </>
                ) : (
                  <h1>
                    {name ? <>Hello, <strong>{name}.</strong></> : <>Welcome <strong>in.</strong></>}
                  </h1>
                )}
                <p className="lede">{heroLede}</p>
                <div className="ctas">
                  <Link href={heroPrimary.href} className="btn btn-primary">
                    {heroPrimary.label} <span className="arrow">→</span>
                  </Link>
                  <Link href={heroSecondary.href} className="btn btn-ghost">
                    {heroSecondary.label} <span className="arrow">→</span>
                  </Link>
                  {certificateHref && (
                    <Link href={certificateHref} className="btn btn-ghost">
                      View your certificate <span className="arrow">→</span>
                    </Link>
                  )}
                </div>
              </div>

              <aside className="progress" aria-label="Your path">
                <span className="lab">Your path · {stepsComplete} of {totalSteps} complete</span>
                <h4>
                  Seven steps to <strong>activate</strong> the full Institute.
                </h4>
                <div className="steps">
                  <ActivationStep
                    n={1}
                    done={stepAccount}
                    now={nowIndex === 0}
                    text="Create your account."
                    meta={stepAccount ? 'Done' : '1 min'}
                    href={stepAccount ? undefined : '/auth/signup'}
                  />
                  <ActivationStep
                    n={2}
                    done={stepAssessment}
                    now={nowIndex === 1}
                    text={
                      <>
                        Take the free <strong>readiness</strong> assessment.
                      </>
                    }
                    meta={stepAssessment ? 'Done' : '3 min'}
                    href="/assessment/take"
                  />
                  <ActivationStep
                    n={3}
                    done={stepRep}
                    now={nowIndex === 2}
                    text="Try today's banker-safe rep."
                    meta={stepRep ? 'Done' : '6 min'}
                    href={`/practice/${currentRep.id}`}
                  />
                  <ActivationStep
                    n={4}
                    done={stepInDepth}
                    now={nowIndex === 3}
                    text={
                      <>
                        Go deeper with the <strong>In-Depth</strong> Assessment.
                      </>
                    }
                    meta={stepInDepth ? 'Done' : '$99'}
                    href={
                      assessments?.inDepth?.entitled
                        ? '/assessment/in-depth/take'
                        : '/assessment/in-depth'
                    }
                  />
                  <ActivationStep
                    n={5}
                    done={stepEnrolled}
                    now={nowIndex === 4}
                    text={
                      <>
                        Enroll in <strong>AiBI-Foundation</strong>.
                      </>
                    }
                    meta={stepEnrolled ? 'Enrolled' : '$295'}
                    href={
                      stepEnrolled
                        ? '/courses/foundation/program'
                        : '/courses/foundation/program/purchase'
                    }
                  />
                  <ActivationStep
                    n={6}
                    done={stepFirstModule}
                    now={nowIndex === 5}
                    text="Complete your first module."
                    meta={
                      stepFirstModule
                        ? `${completedModuleCount} of ${totalModules}`
                        : 'Build the skill'
                    }
                    href={stepEnrolled ? '/courses/foundation/program' : undefined}
                  />
                  <ActivationStep
                    n={7}
                    done={stepCertificate}
                    now={nowIndex === 6}
                    text={
                      <>
                        Earn your <strong>Foundation</strong> certificate.
                      </>
                    }
                    meta={
                      stepCertificate
                        ? 'Verified'
                        : completedModuleCount >= totalModules
                          ? 'Submit packet'
                          : `${completedModuleCount}/${totalModules}`
                    }
                    href={
                      stepCertificate
                        ? certificateVerifyUrl ?? '/courses/foundation/program/certificate'
                        : stepEnrolled && completedModuleCount >= totalModules
                          ? '/courses/foundation/program/submit'
                          : stepEnrolled
                            ? '/courses/foundation/program'
                            : undefined
                    }
                  />
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* YOUR WORK */}
        <section className="sec work-sec">
          <div className="container">
            <header className="sec-head compact">
              <h2>
                Your <strong>work.</strong>
              </h2>
              <Link href={workPrimaryHref} className="more">
                {workPrimaryLabel} →
              </Link>
            </header>
            <div className="work-grid">
              <WorkCard
                kicker="Course"
                value={stepEnrolled ? `Module ${currentModuleNumber}` : 'Not enrolled'}
                label={
                  stepEnrolled
                    ? `${completedModuleCount} of ${totalModules} modules complete`
                    : 'Foundation preview is available before enrollment'
                }
                href={stepEnrolled ? `/courses/foundation/program/${currentModuleNumber}` : '/courses/foundation/program'}
                action={stepEnrolled ? 'Continue course' : 'Preview course'}
              />
              <WorkCard
                kicker="Practice"
                value={`${completedRepIds.length}`}
                label={`${completedRepIds.length === 1 ? 'rep' : 'reps'} completed · next: ${currentRep.title}`}
                href={`/practice/${currentRep.id}`}
                action="Start next rep"
              />
              <WorkCard
                kicker="Toolbox"
                value={`${savedPromptCount}`}
                label={`${savedPromptCount === 1 ? 'saved prompt' : 'saved prompts'} · ${toolboxEntitled ? toolboxLabel : 'unlock with paid access'}`}
                href={toolboxEntitled ? '/dashboard/toolbox' : '/assessment/in-depth'}
                action={toolboxEntitled ? 'Open Toolbox' : 'Unlock Toolbox'}
              />
              <WorkCard
                kicker="Artifacts"
                value={artifacts.length > 0 ? `${completedArtifactCount}/${artifacts.length}` : '0'}
                label={
                  nextArtifact
                    ? `Next: ${nextArtifact.title}`
                    : stepEnrolled
                      ? 'All tracked artifacts are complete'
                      : 'Artifacts appear after course enrollment'
                }
                href={nextArtifact ? `/courses/foundation/program/artifacts/${nextArtifact.id}` : '/resources'}
                action={nextArtifact ? 'Open artifact' : 'Browse resources'}
              />
            </div>
          </div>
        </section>

        {/* TRIO */}
        <section className="sec">
          <div className="container">
            <header className="sec-head">
              <h2>
                What you can <strong>do</strong> today.
              </h2>
              <Link href="/courses/foundation" className="more">
                Tour the Institute →
              </Link>
            </header>

            <div className="trio-grid">
              {(() => {
                // Trio card 1 — adapts to where the user actually is.
                // In-Depth completed → open their Briefing.
                // In-Depth entitled but not taken → take it.
                // Free done → sell the In-Depth.
                // Nothing → take the free scan.
                let assessHref = '/assessment/take';
                let assessCta = 'Take the free assessment';
                let assessCopy = 'Twelve dimensions. Three minutes. A scored snapshot.';
                if (stepInDepth && assessments?.inDepth?.profileId) {
                  assessHref = `/assessment/in-depth/results/${assessments.inDepth.profileId}`;
                  assessCta = 'View your Briefing';
                  assessCopy = 'Your In-Depth diagnosis with peer comparison and a ninety-day plan.';
                } else if (assessments?.inDepth?.entitled) {
                  assessHref = '/assessment/in-depth/take';
                  assessCta = 'Take your In-Depth';
                  assessCopy = 'Forty-eight questions across eight dimensions. About twelve minutes.';
                } else if (stepAssessment) {
                  assessHref = '/assessment/in-depth';
                  assessCta = 'Go deeper · In-Depth';
                  assessCopy = 'Eight dimensions, per-dimension root causes, a written ninety-day playbook.';
                }
                return (
                  <Link className="vc" href={assessHref}>
                    <div className="illust" aria-hidden="true">
                      <svg viewBox="0 0 140 120" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 92 A 48 48 0 0 1 118 92" fill="var(--gold-a10)" />
                        <line x1="22" y1="92" x2="30" y2="88" />
                        <line x1="38" y1="64" x2="44" y2="68" />
                        <line x1="70" y1="44" x2="70" y2="52" />
                        <line x1="102" y1="64" x2="96" y2="68" />
                        <line x1="118" y1="92" x2="110" y2="88" />
                        <line x1="70" y1="92" x2="92" y2="54" stroke="var(--gold-deep)" strokeWidth="2.4" />
                        <circle cx="70" cy="92" r="5" fill="var(--gold-deep)" stroke="none" />
                        <line x1="20" y1="100" x2="120" y2="100" />
                      </svg>
                    </div>
                    <div className="step">
                      <span>Step 01</span>
                      <strong>i.</strong>
                    </div>
                    <h3>
                      {stepInDepth ? <>Your <strong>Briefing.</strong></> : <>Assess your <strong>readiness.</strong></>}
                    </h3>
                    <p>{assessCopy}</p>
                    <div className="cta">
                      <b>{assessCta}</b>
                      <span className="arrow">→</span>
                    </div>
                  </Link>
                );
              })()}

              <Link className="vc" href={`/practice/${currentRep.id}`}>
                <div className="illust" aria-hidden="true">
                  <svg viewBox="0 0 140 120" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="20" y="46" width="14" height="28" fill="var(--gold-a20)" />
                    <rect x="106" y="46" width="14" height="28" fill="var(--gold-a20)" />
                    <rect x="34" y="54" width="8" height="12" />
                    <rect x="98" y="54" width="8" height="12" />
                    <line x1="42" y1="60" x2="98" y2="60" strokeWidth="3" />
                    <line x1="20" y1="34" x2="34" y2="34" strokeWidth="1" opacity="0.5" />
                    <line x1="106" y1="34" x2="120" y2="34" strokeWidth="1" opacity="0.5" />
                    <line x1="20" y1="98" x2="120" y2="98" />
                    <path d="M70 12 L66 24 L74 24 L70 36" stroke="var(--gold-deep)" strokeWidth="2" />
                  </svg>
                </div>
                <div className="step">
                  <span>Step 02</span>
                  <strong>ii.</strong>
                </div>
                <h3>
                  Practice a banker-safe <strong>rep.</strong>
                </h3>
                <p>A new six-minute exercise every day. Free, no enrollment.</p>
                <div className="cta">
                  <b>Start today&apos;s rep</b>
                  <span className="arrow">→</span>
                </div>
              </Link>

              <Link className="vc" href={stepEnrolled ? '/courses/foundation/program' : '/courses/foundation'}>
                <div className="illust" aria-hidden="true">
                  <svg viewBox="0 0 140 120" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
                    <rect x="20" y="44" width="100" height="60" fill="var(--gold-a10)" />
                    <rect x="20" y="44" width="100" height="14" />
                    <path d="M48 44 L48 30 L92 30 L92 44" />
                    <rect x="64" y="36" width="12" height="8" fill="var(--gold-deep)" stroke="none" />
                    <path d="M58 30 L58 22 L82 22 L82 30" strokeWidth="1.4" opacity="0.6" />
                    <line x1="44" y1="70" x2="44" y2="100" strokeWidth="1" opacity="0.5" />
                    <line x1="96" y1="70" x2="96" y2="100" strokeWidth="1" opacity="0.5" />
                    <line x1="70" y1="70" x2="70" y2="100" strokeWidth="1" opacity="0.5" />
                  </svg>
                </div>
                <div className="step">
                  <span>Step 03</span>
                  <strong>iii.</strong>
                </div>
                <h3>
                  Build with the full <strong>toolkit.</strong>
                </h3>
                <p>{modules.length} bite-sized modules. Prompt library. Templates. Certificate.</p>
                <div className="cta">
                  <b>{stepEnrolled ? 'Open the curriculum' : 'Preview Foundation'}</b>
                  <span className="arrow">→</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* TODAY'S REP */}
        <section className="sec shaded">
          <div className="container">
            <header className="sec-head">
              <h2>
                Today&apos;s six-minute <strong>rep.</strong>
              </h2>
            </header>

            <article className="rep-card">
              <div className="body">
                <div className="ts">
                  <span className="dot"></span>
                  {today} · Rep {currentRep.id}
                </div>
                <h3>{currentRep.title}</h3>
                <p className="rep-lede">{currentRep.scenario}</p>
                <div className="tags">
                  <span>{currentRep.skill}</span>
                  <span>SAFE rule</span>
                  <span>{currentRep.safetyLevel.toUpperCase()}</span>
                  <span>{currentRep.timeEstimateMinutes} minutes</span>
                </div>
                <div className="foot">
                  <span className="est">Free · No enrollment</span>
                  <Link href={`/practice/${currentRep.id}`} className="btn btn-primary">
                    Start the rep <span className="arrow">→</span>
                  </Link>
                </div>
              </div>

              <div className="demo">
                <span className="lbl">
                  <b>Risky</b> · example of a prompt you&apos;d want to fix
                </span>
                <div className="prompt risky">
                  &ldquo;Look at <mark>John D. Holt&apos;s</mark> account, <mark>acct 4471-2208</mark>, his last 6 months of statements. He has <mark>$184,209 in deposits</mark>. Should we approve his <mark>$240k HELOC</mark>?&rdquo;
                </div>
                <div className="arrow-down">↓</div>
                <span className="lbl">
                  <b className="safe">Safe</b> · the same question, banker-safe
                </span>
                <div className="prompt safe">
                  &ldquo;A member has six months of deposit history averaging <mark className="green">about $30k/month</mark>. They are requesting a HELOC of roughly <mark className="green">8× monthly deposits</mark>. What three questions should the underwriter ask before approving?&rdquo;
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* IN-DEPTH (only if entitled) */}
        {assessments?.inDepth?.entitled && (
          <section className="sec">
            <div className="container">
              <header className="sec-head">
                <h2>
                  Your In-Depth <strong>Briefing.</strong>
                </h2>
                {assessments.inDepth.hasCompleted && assessments.inDepth.profileId && (
                  <Link
                    href={`/assessment/in-depth/results/${assessments.inDepth.profileId}`}
                    className="more"
                  >
                    Open the Briefing →
                  </Link>
                )}
              </header>
              <article className="indepth-card">
                <div className="ic-body">
                  <span className="lab">
                    In-Depth AI Readiness Assessment · 48 questions · 8 dimensions
                  </span>
                  <h3>
                    {assessments.inDepth.hasCompleted
                      ? 'Your Briefing is ready.'
                      : 'Take your purchased assessment.'}
                  </h3>
                  <p>
                    {assessments.inDepth.hasCompleted
                      ? 'Re-take any time — every submission overwrites the previous reading so you can track progress across quarterly re-reads.'
                      : 'About twelve minutes. You receive a personalized Briefing with deep dives and a ninety-day action register.'}
                  </p>
                  <div className="ctas">
                    {assessments.inDepth.hasCompleted && assessments.inDepth.profileId && (
                      <Link
                        href={`/assessment/in-depth/results/${assessments.inDepth.profileId}`}
                        className="btn btn-primary"
                      >
                        View your Briefing <span className="arrow">→</span>
                      </Link>
                    )}
                    <Link
                      href="/assessment/in-depth/take"
                      className={assessments.inDepth.hasCompleted ? 'btn btn-ghost' : 'btn btn-primary'}
                    >
                      {assessments.inDepth.hasCompleted ? 'Re-take the assessment' : 'Start the assessment'} <span className="arrow">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          </section>
        )}

        {/* FOUNDATION PREVIEW (dark) */}
        <section className="sec dark">
          <div className="container">
            <header className="sec-head">
              <h2>
                The full <strong>Foundation</strong> course.
              </h2>
              <Link href="/courses/foundation/program" className="more">
                View the syllabus →
              </Link>
            </header>

            <article className="found-card">
              <div className="body">
                <span className="lab">AiBI-Foundation · Self-paced course</span>
                <h3>
                  Turn the <strong>skill</strong> into operating capability.
                </h3>
                <p className="copy">
                  {modules.length} bite-sized modules of structured exercises, working artifacts, and a banker-tested prompt library — taught with source-aware rigor and reviewable evidence. Aligned with SR 11-7 and TPRM.
                </p>
                <div className="ctas">
                  <Link href="/courses/foundation/program" className="btn btn-paper">
                    Preview Foundation <span className="arrow">→</span>
                  </Link>
                  {!stepEnrolled && (
                    <Link href="/courses/foundation/program/purchase" className="btn btn-primary">
                      Enroll · $295 <span className="arrow">→</span>
                    </Link>
                  )}
                </div>
                <div className="price">
                  <div className="n">$295</div>
                  <div className="l">
                    <b>Individual enrollment · Ongoing access under current offer</b>
                    Volume seats are scoped by request before rollout.
                  </div>
                </div>
              </div>

              <div className="feat">
                <div className="ftxt">What ships on enrollment</div>
                <FeatureRow svg={
                  <svg viewBox="0 0 32 32" fill="none" stroke="var(--gold-deep)" strokeWidth="1.4" strokeLinejoin="round">
                    <rect x="6" y="8" width="20" height="18" fill="var(--gold-a20)" />
                    <line x1="6" y1="14" x2="26" y2="14" />
                    <line x1="10" y1="20" x2="22" y2="20" opacity="0.5" />
                  </svg>
                } name={<>{modules.length} structured <strong>modules</strong></>} meta="Self-paced" />
                <FeatureRow svg={
                  <svg viewBox="0 0 32 32" fill="none" stroke="var(--gold-deep)" strokeWidth="1.4" strokeLinejoin="round">
                    <path d="M8 8 L24 8 L24 28 L8 28 Z" fill="var(--gold-a20)" />
                    <line x1="12" y1="14" x2="20" y2="14" />
                    <line x1="12" y1="18" x2="20" y2="18" />
                    <line x1="12" y1="22" x2="16" y2="22" />
                  </svg>
                } name={<>Banker-tested <strong>prompt library</strong></>} meta="30+ prompts" />
                <FeatureRow svg={
                  <svg viewBox="0 0 32 32" fill="none" stroke="var(--gold-deep)" strokeWidth="1.4" strokeLinecap="round">
                    <circle cx="16" cy="16" r="11" />
                    <path d="M11 16 L15 19 L21 12" strokeWidth="1.8" />
                  </svg>
                } name={<>Hands-on <strong>activities</strong></>} meta="In every module" />
                <FeatureRow svg={
                  <svg viewBox="0 0 32 32" fill="none" stroke="var(--gold-deep)" strokeWidth="1.4" strokeLinejoin="round">
                    <rect x="6" y="10" width="20" height="16" fill="var(--gold-a20)" />
                    <path d="M10 14 L22 14 M10 18 L18 18 M10 22 L20 22" opacity="0.6" />
                  </svg>
                } name={<>Working <strong>artifacts</strong></>} meta="PDFs + worksheets" />
                <FeatureRow svg={
                  <svg viewBox="0 0 32 32" fill="none" stroke="var(--gold-deep)" strokeWidth="1.4">
                    <circle cx="16" cy="14" r="6" fill="var(--gold-a20)" />
                    <path d="M10 24 L10 28 M22 24 L22 28 M16 20 L16 26" />
                    <circle cx="16" cy="14" r="2" fill="var(--gold-deep)" stroke="none" />
                  </svg>
                } name={<>Verified <strong>certificate</strong></>} meta="On completion" />
              </div>
            </article>
          </div>
        </section>

        {/* FREE RESOURCES */}
        <section className="sec">
          <div className="container">
            <header className="sec-head">
              <h2>
                Free <strong>resources.</strong>
              </h2>
              <Link href="/resources" className="more">
                All resources →
              </Link>
            </header>

            <div className="res-grid">
              {DASHBOARD_RESOURCES.map((resource) => (
                <ResourceCard key={resource.href} resource={resource} />
              ))}
            </div>
          </div>
        </section>

        {/* SAFE RULE STRIP */}
        <section className="sec shaded">
          <div className="container">
            <article className="safe-card">
              <div className="label">
                <span className="lab">SAFE rule</span>
                <h3>
                  Four <strong>checks</strong> before you press send.
                </h3>
                <span className="sub">The card every banker on your team should carry.</span>
              </div>
              <div className="grid">
                {SAFE_CELLS.map((cell) => (
                  <div key={cell.letter} className="cell">
                    <span className="letter">{cell.letter}</span>
                    <span className="word">{cell.word}</span>
                    <span className="desc">{cell.desc}</span>
                  </div>
                ))}
              </div>
              <div className="cta-col">
                <Link href="/resources/the-skill-not-the-prompt" className="btn btn-primary">
                  Read the briefing <span className="arrow">→</span>
                </Link>
                <span className="meta">The skill, not the prompt</span>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

function localReadinessToSnapshot(readiness: UserData['readiness']): ReadinessSnapshot | null {
  if (!readiness) return null;
  return {
    score: readiness.score,
    maxScore: readiness.maxScore ?? (readiness.answers.length === 48 ? 192 : 48),
    tierId: readiness.tierId,
    tierLabel: readiness.tierLabel,
    isInDepth: readiness.answers.length === 48 || readiness.maxScore === 192,
    takenAt: readiness.completedAt,
  };
}

function readLocalCompletedRepIds(): readonly string[] {
  try {
    return FOUNDATION_PRACTICE_REPS
      .filter((rep) => {
        migrateStorageKey(
          localStorage,
          `aibi-practice-${rep.id}`,
          `foundations-practice-${rep.id}`,
        );
        return localStorage.getItem(`foundations-practice-${rep.id}`);
      })
      .map((rep) => rep.id);
  } catch {
    return [];
  }
}
