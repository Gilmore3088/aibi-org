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

interface ReadinessSnapshot {
  readonly score: number;
  readonly maxScore: number;
  readonly tierId: string;
  readonly tierLabel: string;
  readonly isInDepth: boolean;
  readonly takenAt: string | null;
}

interface AssessmentsState {
  readonly displayName: string;
  readonly snapshot: ReadinessSnapshot | null;
  readonly inDepth: {
    readonly entitled: boolean;
    readonly profileId: string | null;
    readonly hasCompleted: boolean;
    readonly purchasedAt: string | null;
  } | null;
}

interface LearnerDashboardState {
  readonly enrollment: {
    readonly id: string;
    readonly completedModules: readonly number[];
    readonly currentModule: number;
    readonly enrolledAt: string;
  } | null;
  readonly practice: {
    readonly completedRepIds: readonly string[];
    readonly completedCount: number;
  };
  readonly prompts: {
    readonly savedPromptIds: readonly string[];
    readonly savedCount: number;
  };
}

// Greeting name resolution.
// 1. Prefer the user's full_name from Supabase auth metadata (passed in via
//    the /api/dashboard/assessments response as displayName).
// 2. Fall back to the email local-part ONLY when it reads like a real name
//    (alpha characters, no digits) — never turn "jlgilmore2" into
//    "Jlgilmore2", which looks like a username, not a salutation.
// 3. Last resort: empty string. Callers should render "Welcome back" with
//    no name attached rather than guessing.
function resolveGreetingName(apiName: string, email: string | undefined): string {
  if (apiName.trim().length > 0) return apiName.trim();
  if (!email) return '';
  const local = email.split('@')[0] ?? '';
  const first = local.split(/[._-]/)[0] ?? local;
  // Treat it as a real first name only if it's purely alpha and short-ish.
  if (first.length === 0 || first.length > 24 || !/^[a-zA-Z]+$/.test(first)) {
    return '';
  }
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [dashboard, setDashboard] = useState<LearnerDashboardState | null>(null);
  const [localCompletedRepIds, setLocalCompletedRepIds] = useState<readonly string[]>([]);
  const [assessments, setAssessments] = useState<AssessmentsState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserDataWithSupabaseFallback()
      .then(async (loadedUser) => {
        setUser(loadedUser);
        try {
          const [learnerRes, assessmentsRes] = await Promise.all([
            fetch('/api/dashboard/learner', { cache: 'no-store' }),
            fetch('/api/dashboard/assessments', { cache: 'no-store' }),
          ]);
          if (learnerRes.ok) {
            setDashboard((await learnerRes.json()) as LearnerDashboardState);
          }
          if (assessmentsRes.ok) {
            setAssessments((await assessmentsRes.json()) as AssessmentsState);
          }
        } catch {
          // Local assessment-only users still get a useful dashboard fallback.
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

  if (loading) return null;

  const name = resolveGreetingName(assessments?.displayName ?? '', user?.email);
  const snapshot = assessments?.snapshot ?? null;
  const completedRepIds = Array.from(new Set([
    ...(dashboard?.practice.completedRepIds ?? []),
    ...localCompletedRepIds,
  ]));
  const currentRep = completedRepIds.includes(dailyRep.id)
    ? FOUNDATION_PRACTICE_REPS.find((rep) => !completedRepIds.includes(rep.id)) ?? dailyRep
    : dailyRep;

  // Activation ladder — derived from the user's actual state. Seven rungs,
  // each tied to real evidence in the data. The "now" badge is computed
  // separately so only the next un-done step lights up.
  const stepAccount = Boolean(user?.email);
  const stepAssessment = Boolean(user?.readiness);
  const stepRep = completedRepIds.length > 0;
  const stepInDepth = Boolean(assessments?.inDepth?.hasCompleted);
  const stepEnrolled = Boolean(dashboard?.enrollment);
  const stepFirstModule =
    (dashboard?.enrollment?.completedModules.length ?? 0) > 0;
  const totalModules = modules.length;
  const completedModuleCount = dashboard?.enrollment?.completedModules.length ?? 0;
  const stepCertificate = stepEnrolled && completedModuleCount >= totalModules;

  const stepsDone = [
    stepAccount,
    stepAssessment,
    stepRep,
    stepInDepth,
    stepEnrolled,
    stepFirstModule,
    stepCertificate,
  ];
  const stepsComplete = stepsDone.filter(Boolean).length;
  const totalSteps = stepsDone.length;
  // Index of the first un-done step — that one renders as "now".
  const nowIndex = stepsDone.findIndex((d) => !d);

  // Hero CTA pair adapts to what's most actionable next.
  // Order matters — most-progressed states first so we never push a user
  // backwards (e.g. don't show "take in-depth" to someone who took it).
  let heroPrimary: { href: string; label: string };
  let heroSecondary: { href: string; label: string };
  let heroLede: string;
  const profileIdForBriefing = assessments?.inDepth?.profileId;
  if (stepEnrolled) {
    const cur = modules.find((m) => m.number === (dashboard?.enrollment?.currentModule ?? 1)) ?? modules[0]!;
    heroPrimary = { href: `/courses/foundation/program/${cur.number}`, label: `Continue Module ${cur.number}` };
    heroSecondary = { href: `/practice/${currentRep.id}`, label: "Today's rep" };
    heroLede =
      `Pick up where you left off in ${cur.title}. Practice reps are your shortest path between modules — six minutes, banker-safe.`;
  } else if (stepInDepth) {
    // Took the In-Depth — push them to the Briefing and to Foundation.
    heroPrimary = profileIdForBriefing
      ? { href: `/assessment/in-depth/results/${profileIdForBriefing}`, label: 'View your Briefing' }
      : { href: '/courses/foundation/program/purchase', label: 'Enroll · $295' };
    heroSecondary = { href: '/courses/foundation/program/purchase', label: 'Enroll · $295' };
    heroLede =
      'Your In-Depth Briefing is filed. The next move is to turn the diagnosis into operating capability — Foundation is the course that does that.';
  } else if (assessments?.inDepth?.entitled) {
    // Paid but hasn't taken it yet.
    heroPrimary = { href: '/assessment/in-depth/take', label: 'Take your In-Depth assessment' };
    heroSecondary = { href: `/practice/${currentRep.id}`, label: "Try today's rep" };
    heroLede =
      'Your In-Depth Assessment is ready. Forty-eight questions across eight dimensions — about twelve minutes — for a personalized Briefing and ninety-day action register.';
  } else if (stepAssessment) {
    // Free assessment only — sell the In-Depth.
    heroPrimary = { href: '/assessment/in-depth', label: 'Take In-Depth · $99' };
    heroSecondary = { href: '/courses/foundation/program', label: 'Preview Foundation' };
    heroLede = snapshot
      ? `You scored ${snapshot.score}/${snapshot.maxScore} — ${snapshot.tierLabel}. The In-Depth Assessment goes from a three-minute scan to a forty-eight-question diagnostic with peer-band comparison and a ninety-day playbook.`
      : 'Go deeper with the In-Depth Assessment — forty-eight questions, peer-band comparison, and a starting playbook keyed to your weakest area.';
  } else {
    heroPrimary = { href: '/assessment/take', label: 'Take the free assessment' };
    heroSecondary = { href: '/courses/foundation/program', label: 'Preview Foundation' };
    heroLede =
      "Start with a three-minute readiness check. You'll get your score, your strongest area, your weakest area, and the recommended next step.";
  }

  const tabs: ReadonlyArray<{ label: string; href: string; active?: boolean; lock?: string }> = [
    { label: 'Dashboard', href: '/dashboard', active: true },
    { label: 'The Brief', href: '/resources' },
    {
      label: 'Curriculum',
      href: stepEnrolled ? '/courses/foundation/program' : '/courses/foundation',
      lock: stepEnrolled ? undefined : '— with Foundation',
    },
    {
      label: 'Toolbox',
      href: '/dashboard/toolbox',
      lock: stepEnrolled ? undefined : '— with Foundation',
    },
  ];

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/dashboard" cta={{ label: 'Start a Lesson', href: '/courses/foundation/program' }} />
      <style jsx global>{dashboardStyles}</style>

      <main className="mockup-dash">
        {/* TABS */}
        <div className="tabs">
          <div className="tabs-inner" role="tablist" aria-label="My account">
            {tabs.map((t) => (
              <Link
                key={t.label}
                href={t.href}
                role="tab"
                aria-selected={t.active ? true : false}
                className={`tab${t.active ? ' active' : ''}`}
              >
                {t.label}
                {t.lock && <span className="lock"> {t.lock}</span>}
              </Link>
            ))}
          </div>
        </div>

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
                    meta={stepCertificate ? 'Verified' : `${completedModuleCount}/${totalModules}`}
                    href={stepEnrolled ? '/courses/foundation/program' : undefined}
                  />
                </div>
              </aside>
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
                  assessCopy = 'Eight dimensions, peer-band comparison, a written ninety-day playbook.';
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
                  {modules.length} bite-sized modules of structured exercises, working artifacts, and a banker-tested prompt library — taught with the same examiner-aware rigor as our research desk. Aligned with SR 11-7 and TPRM.
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
                    <b>Per seat · Lifetime access</b>
                    Institutional pricing from $199/seat for 10+.
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
                } name={<>12 structured <strong>modules</strong></>} meta="Self-paced" />
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
                All research →
              </Link>
            </header>

            <div className="res-grid">
              <ResourceCard
                href="/resources/the-skill-not-the-prompt"
                tag="Briefing"
                title={<>The <strong>skill</strong>, not the prompt.</>}
                meta="Briefing · 8 min read"
                svg={
                  <svg viewBox="0 0 48 48" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round">
                    <rect x="10" y="6" width="28" height="36" fill="var(--gold-a10)" />
                    <line x1="14" y1="14" x2="34" y2="14" />
                    <line x1="14" y1="20" x2="28" y2="20" opacity="0.6" />
                    <line x1="14" y1="26" x2="32" y2="26" opacity="0.6" />
                  </svg>
                }
              />
              <ResourceCard
                href="/resources/six-ways-ai-fails-in-banking"
                tag="Briefing"
                title={<>Six ways AI <strong>fails</strong> in banking.</>}
                meta="Briefing · 10 min read"
                svg={
                  <svg viewBox="0 0 48 48" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round">
                    <rect x="6" y="10" width="36" height="28" fill="var(--gold-a10)" />
                    <line x1="6" y1="18" x2="42" y2="18" />
                    <line x1="18" y1="10" x2="18" y2="38" />
                    <line x1="30" y1="10" x2="30" y2="38" />
                    <rect x="9" y="22" width="6" height="3" fill="var(--gold-deep)" stroke="none" />
                    <rect x="21" y="22" width="6" height="3" fill="var(--gold-deep)" stroke="none" />
                    <rect x="33" y="22" width="6" height="3" fill="var(--gold-deep)" stroke="none" />
                  </svg>
                }
              />
              <ResourceCard
                href="/resources/ai-governance-without-the-jargon"
                tag="Briefing"
                title={<>AI governance, <strong>without</strong> the jargon.</>}
                meta="Briefing · 12 min read"
                svg={
                  <svg viewBox="0 0 48 48" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round">
                    <path d="M8 10 L40 10 L40 32 L26 32 L18 38 L18 32 L8 32 Z" fill="var(--gold-a10)" />
                    <line x1="14" y1="18" x2="34" y2="18" opacity="0.6" />
                    <line x1="14" y1="24" x2="28" y2="24" opacity="0.6" />
                    <circle cx="14" cy="14" r="1.5" fill="var(--gold-deep)" stroke="none" />
                    <circle cx="20" cy="14" r="1.5" fill="var(--gold-deep)" stroke="none" />
                  </svg>
                }
              />
              <ResourceCard
                href="/resources"
                tag="All research"
                title={<>The AI Banking <strong>Brief.</strong></>}
                meta="Six briefings + more"
                svg={
                  <svg viewBox="0 0 48 48" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round">
                    <rect x="8" y="6" width="32" height="36" fill="var(--gold-a10)" />
                    <line x1="14" y1="14" x2="34" y2="14" strokeWidth="2" />
                    <line x1="14" y1="20" x2="34" y2="20" opacity="0.6" />
                    <line x1="14" y1="24" x2="34" y2="24" opacity="0.6" />
                    <line x1="14" y1="28" x2="28" y2="28" opacity="0.6" />
                    <rect x="14" y="33" width="20" height="5" fill="var(--gold-deep)" stroke="none" />
                  </svg>
                }
              />
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

function SnapshotPanel({
  snapshot,
  inDepthEntitled,
}: {
  readonly snapshot: ReadinessSnapshot;
  readonly inDepthEntitled: boolean;
}) {
  const pct = Math.round((snapshot.score / snapshot.maxScore) * 100);
  const sourceLabel = snapshot.isInDepth ? 'In-Depth Briefing' : 'Free Readiness Scan';
  const takenAt = snapshot.takenAt
    ? new Date(snapshot.takenAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;
  return (
    <div className="snap">
      <div className="snap-row">
        <div className="snap-cell">
          <span className="snap-lab">Tier</span>
          <span className="snap-tier">{snapshot.tierLabel}</span>
        </div>
        <div className="snap-cell">
          <span className="snap-lab">Score</span>
          <span className="snap-score">
            {snapshot.score}
            <span className="snap-score-max">/{snapshot.maxScore}</span>
          </span>
          <span className="snap-pct">{pct}%</span>
        </div>
        <div className="snap-cell">
          <span className="snap-lab">Source</span>
          <span className="snap-source">{sourceLabel}</span>
          {takenAt && <span className="snap-meta">Filed {takenAt}</span>}
        </div>
      </div>
      {!snapshot.isInDepth && !inDepthEntitled && (
        <p className="snap-foot">
          The free scan gives you the headline. The In-Depth Assessment gives you the explanation —
          eight dimensions, peer-band comparison, and a ninety-day action register.
        </p>
      )}
    </div>
  );
}

function ActivationStep({
  n,
  done,
  now,
  text,
  meta,
  href,
}: {
  readonly n: number;
  readonly done: boolean;
  readonly now: boolean;
  readonly text: React.ReactNode;
  readonly meta: string;
  readonly href?: string;
}) {
  const cls = done ? 'step done' : now ? 'step now' : 'step locked';
  const body = (
    <>
      <span className="pn">{done ? '✓' : n}</span>
      <span className="t">{text}</span>
      <span className="meta">{meta}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {body}
      </Link>
    );
  }
  return <div className={cls}>{body}</div>;
}

function FeatureRow({
  svg,
  name,
  meta,
}: {
  readonly svg: React.ReactNode;
  readonly name: React.ReactNode;
  readonly meta: string;
}) {
  return (
    <div className="it">
      <div className="ico">{svg}</div>
      <span className="nm">{name}</span>
      <span className="n">{meta}</span>
    </div>
  );
}

function ResourceCard({
  href,
  tag,
  title,
  meta,
  svg,
}: {
  readonly href: string;
  readonly tag: string;
  readonly title: React.ReactNode;
  readonly meta: string;
  readonly svg: React.ReactNode;
}) {
  return (
    <Link className="res-card" href={href}>
      <div className="ricon" aria-hidden="true">{svg}</div>
      <span className="tag">{tag}</span>
      <h4>{title}</h4>
      <div className="fmeta">
        <span>{meta}</span>
        <span className="arrow">→</span>
      </div>
    </Link>
  );
}

const SAFE_CELLS: ReadonlyArray<{ letter: string; word: string; desc: string }> = [
  { letter: 'S', word: 'Strip', desc: 'Sensitive data — names, account numbers, dollar amounts — out before sending.' },
  { letter: 'A', word: 'Ask clearly', desc: 'Specific prompt, specific output. Vague prompts are how you get hallucinations.' },
  { letter: 'F', word: 'Fact-check', desc: 'Treat AI output as a draft. Verify any number, name, or rule before it leaves your desk.' },
  { letter: 'E', word: 'Escalate', desc: 'Member decisions, adverse actions, or examiner-facing outputs always need a human.' },
];

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

// Scoped Mockup-system styles. Built off the migrated dashboard layout that
// originally shipped in the Ledger-era /dashboard port. All Ledger tokens
// have been swapped to mockup tokens (--ink, --gold, --cream, slate scale).
// Italics are retired — emphasis carried by weight. UPPER CASE button
// labels per brand spec.
const dashboardStyles = `
  .mockup-dash{
    --paper:var(--cream);
    --paper-2:var(--cream-2);
    --ink:var(--ink);
    --ink-2:var(--ink-2);
    --slate:var(--slate-500);
    --muted:var(--slate-500);
    --soft:var(--slate-400);
    --terra:var(--gold-deep);
    --terra-2:var(--gold-deep);
    --accent:var(--gold);
    --forest:var(--emerald-700);
    --weak:#9F3B1F;
    --rule:var(--ink-a10);
    --rule-strong:var(--ink-a15);
    --maxw:1280px;
    background:var(--cream); color:var(--ink);
    font-family:"Inter", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif;
    font-size:15px; line-height:1.55; position:relative;
  }
  .mockup-dash .container{ position:relative; z-index:1; max-width:var(--maxw); margin:0 auto; padding:0 32px }
  .mockup-dash .eyebrow{ font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--gold-deep); font-weight:700 }

  .mockup-dash .btn{ display:inline-flex; align-items:center; gap:10px; padding:14px 22px; border:1px solid transparent; font-size:11px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; line-height:1; cursor:pointer; border-radius:12px; transition:background .15s,color .15s,border-color .15s,transform .12s; text-decoration:none }
  .mockup-dash .btn-primary{ background:var(--gold); color:var(--ink); border-color:var(--gold) }
  .mockup-dash .btn-primary:hover{ background:var(--gold-2); border-color:var(--gold-2) }
  .mockup-dash .btn-ghost{ background:transparent; color:var(--ink); border:1px solid var(--ink) }
  .mockup-dash .btn-ghost:hover{ background:var(--ink); color:#fff }
  .mockup-dash .btn-paper{ background:#fff; color:var(--ink); border:1px solid var(--slate-200) }
  .mockup-dash .btn-paper:hover{ background:var(--cream-2) }
  .mockup-dash .btn .arrow{ font-weight:600; font-size:14px; letter-spacing:0; text-transform:none }

  .mockup-dash .tabs{ background:transparent; border-bottom:1px solid var(--rule) }
  .mockup-dash .tabs-inner{ max-width:var(--maxw); margin:0 auto; padding:0 32px; display:flex; align-items:center; gap:0; flex-wrap:wrap }
  .mockup-dash .tab{ font-size:11px; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; color:var(--slate-500); padding:16px 18px 14px; border-bottom:2px solid transparent; margin-bottom:-1px; display:inline-flex; align-items:center; gap:8px; text-decoration:none; transition:color .15s,border-color .15s }
  .mockup-dash .tab:hover{ color:var(--ink) }
  .mockup-dash .tab.active{ color:var(--ink); border-bottom-color:var(--gold) }
  .mockup-dash .tab .lock{ font-size:10px; color:var(--gold-deep); text-transform:none; letter-spacing:0.04em; font-weight:600 }

  .mockup-dash .welcome{ padding:72px 0 60px; border-bottom:1px solid var(--rule); position:relative; overflow:hidden }
  .mockup-dash .welcome .wgrid{ display:grid; grid-template-columns:1.35fr 1fr; gap:64px; align-items:center }
  .mockup-dash .welcome .greet{ color:var(--gold-deep); margin-bottom:18px; display:block }
  .mockup-dash .welcome h1{ font-weight:600; font-size:clamp(48px,5.8vw,84px); line-height:0.98; letter-spacing:-0.025em; margin:0 0 22px; max-width:14ch; color:var(--ink) }
  .mockup-dash .welcome h1 strong{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .welcome .lede{ font-size:19px; line-height:1.55; color:var(--slate-600); max-width:46ch; margin:0 0 30px; font-weight:400 }
  .mockup-dash .welcome .ctas{ display:flex; gap:12px; flex-wrap:wrap }

  /* Snapshot panel */
  .mockup-dash .welcome .snap{ background:#fff; border:1px solid var(--rule-strong); padding:22px 24px; margin:0 0 26px; max-width:560px; border-radius:16px; box-shadow:var(--shadow-card) }
  .mockup-dash .welcome .snap-row{ display:grid; grid-template-columns:repeat(3,1fr); gap:0; align-items:start }
  .mockup-dash .welcome .snap-cell{ display:flex; flex-direction:column; gap:6px; padding:0 18px; border-left:1px solid var(--rule) }
  .mockup-dash .welcome .snap-cell:first-child{ padding-left:0; border-left:none }
  .mockup-dash .welcome .snap-cell:last-child{ padding-right:0 }
  .mockup-dash .welcome .snap-lab{ font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--slate-500); font-weight:700 }
  .mockup-dash .welcome .snap-tier{ font-size:22px; line-height:1.1; color:var(--gold-deep); font-weight:700; letter-spacing:-0.015em }
  .mockup-dash .welcome .snap-score{ font-size:26px; font-weight:700; color:var(--ink); line-height:1; font-variant-numeric:tabular-nums }
  .mockup-dash .welcome .snap-score-max{ font-size:14px; font-weight:500; color:var(--slate-500); margin-left:2px }
  .mockup-dash .welcome .snap-pct{ font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--gold-deep); font-weight:700 }
  .mockup-dash .welcome .snap-source{ font-size:15px; line-height:1.25; color:var(--ink); font-weight:600 }
  .mockup-dash .welcome .snap-meta{ font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--slate-500); font-weight:600 }
  .mockup-dash .welcome .snap-foot{ font-size:14px; line-height:1.5; color:var(--slate-600); margin:18px 0 0; padding-top:14px; border-top:1px solid var(--rule); max-width:56ch }
  @media (max-width:640px){
    .mockup-dash .welcome .snap-row{ grid-template-columns:1fr; gap:18px }
    .mockup-dash .welcome .snap-cell{ padding:0; border-left:none; border-top:1px solid var(--rule); padding-top:14px }
    .mockup-dash .welcome .snap-cell:first-child{ border-top:none; padding-top:0 }
  }

  /* Activation ladder */
  .mockup-dash .welcome .progress{ background:#fff; border:1px solid var(--rule-strong); padding:32px 32px 28px; position:relative; border-radius:20px; box-shadow:var(--shadow-card) }
  .mockup-dash .welcome .progress .lab{ font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--gold-deep); font-weight:700; margin-bottom:14px; display:block }
  .mockup-dash .welcome .progress h4{ font-weight:600; font-size:22px; line-height:1.2; letter-spacing:-0.015em; margin:0 0 22px; max-width:28ch; color:var(--ink) }
  .mockup-dash .welcome .progress h4 strong{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .welcome .progress .steps{ display:flex; flex-direction:column; gap:14px }
  .mockup-dash .welcome .progress .step{ display:grid; grid-template-columns:28px 1fr auto; gap:14px; align-items:center; padding:10px 0; border-top:1px solid var(--rule); text-decoration:none; color:inherit; transition:color .15s }
  .mockup-dash .welcome .progress a.step{ cursor:pointer }
  .mockup-dash .welcome .progress a.step:hover .t{ color:var(--gold-deep) }
  .mockup-dash .welcome .progress .step:first-child{ border-top:none; padding-top:0 }
  .mockup-dash .welcome .progress .step .pn{ width:28px; height:28px; border:1.4px solid var(--rule-strong); border-radius:50%; display:grid; place-items:center; font-size:11px; color:var(--slate-500); font-weight:700 }
  .mockup-dash .welcome .progress .step.done .pn{ background:var(--gold); border-color:var(--gold); color:var(--ink) }
  .mockup-dash .welcome .progress .step.now .pn{ border-color:var(--ink); color:var(--ink); border-width:2px }
  .mockup-dash .welcome .progress .step .t{ font-size:15px; line-height:1.35; color:var(--ink); font-weight:500 }
  .mockup-dash .welcome .progress .step .t strong{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .welcome .progress .step.locked .t{ color:var(--slate-500) }
  .mockup-dash .welcome .progress .step .meta{ font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--slate-500); font-weight:600 }
  .mockup-dash .welcome .progress .step.done .meta{ color:var(--emerald-700); font-weight:700 }
  .mockup-dash .welcome .progress .step.now .meta{ color:var(--ink); font-weight:700 }

  .mockup-dash .sec{ padding:72px 0; border-bottom:1px solid var(--rule) }
  .mockup-dash .sec.shaded{ background:var(--cream-2) }
  .mockup-dash .sec.dark{ background:var(--ink); color:#fff; border-color:var(--on-dark-10) }
  .mockup-dash .sec.dark .sec-head h2{ color:#fff }
  .mockup-dash .sec.dark .sec-head h2 strong{ color:var(--gold-soft) }
  .mockup-dash .sec-head{ display:flex; align-items:flex-end; gap:24px; margin-bottom:40px; padding-bottom:16px; border-bottom:1px solid var(--ink-a15); flex-wrap:wrap }
  .mockup-dash .sec.dark .sec-head{ border-color:var(--on-dark-20) }
  .mockup-dash .sec-head h2{ font-weight:600; font-size:clamp(32px,3.4vw,44px); line-height:1.05; letter-spacing:-0.02em; margin:0; color:var(--ink) }
  .mockup-dash .sec-head h2 strong{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .sec-head .more{ margin-left:auto; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:var(--gold-deep); font-weight:700; text-decoration:none }
  .mockup-dash .sec-head .more:hover{ color:var(--ink) }
  .mockup-dash .sec.dark .sec-head .more{ color:var(--gold-soft) }

  /* Trio cards */
  .mockup-dash .trio-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px }
  .mockup-dash .vc{ padding:28px 24px 24px; background:#fff; border:1px solid var(--rule); border-radius:24px; display:flex; flex-direction:column; gap:18px; min-height:340px; position:relative; transition:transform .15s,box-shadow .15s,border-color .15s; cursor:pointer; text-decoration:none; color:inherit; box-shadow:var(--shadow-card) }
  .mockup-dash .vc:hover{ transform:translateY(-4px); border-color:var(--gold); box-shadow:var(--shadow-feature) }
  .mockup-dash .vc .illust{ height:120px; display:grid; place-items:center; padding-bottom:18px; border-bottom:1px solid var(--rule) }
  .mockup-dash .vc .illust svg{ width:100%; height:100%; max-width:130px; display:block }
  .mockup-dash .vc .step{ font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--slate-500); font-weight:700; display:flex; justify-content:space-between; align-items:baseline }
  .mockup-dash .vc .step strong{ color:var(--gold-deep); font-size:14px; letter-spacing:0; font-weight:700 }
  .mockup-dash .vc h3{ font-weight:600; font-size:24px; line-height:1.15; letter-spacing:-0.015em; margin:0; max-width:14ch; color:var(--ink) }
  .mockup-dash .vc h3 strong{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .vc p{ font-size:15px; line-height:1.5; color:var(--slate-600); margin:0; max-width:32ch }
  .mockup-dash .vc .cta{ margin-top:auto; display:flex; justify-content:space-between; align-items:baseline; padding-top:16px; border-top:1px solid var(--rule); font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:var(--ink); font-weight:700 }
  .mockup-dash .vc .cta b{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .vc .cta .arrow{ font-size:14px; color:var(--gold-deep); letter-spacing:0; text-transform:none; font-weight:700 }

  /* Rep card */
  .mockup-dash .rep-card{ display:grid; grid-template-columns:1.1fr 1fr; gap:0; border:1px solid var(--rule); background:#fff; border-radius:24px; overflow:hidden; box-shadow:var(--shadow-card) }
  .mockup-dash .rep-card .body{ padding:44px 48px; display:flex; flex-direction:column; gap:22px }
  .mockup-dash .rep-card .ts{ font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--gold-deep); font-weight:700; display:flex; align-items:center; gap:14px }
  .mockup-dash .rep-card .ts .dot{ width:6px; height:6px; background:var(--gold); border-radius:50%; flex:none }
  .mockup-dash .rep-card h3{ font-weight:600; font-size:clamp(30px,3.4vw,42px); line-height:1.05; letter-spacing:-0.02em; margin:0; max-width:18ch; color:var(--ink) }
  .mockup-dash .rep-card h3 strong{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .rep-card .rep-lede{ font-size:17px; line-height:1.5; color:var(--slate-600); margin:0; max-width:42ch }
  .mockup-dash .rep-card .tags{ display:flex; gap:14px; flex-wrap:wrap; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--slate-500); font-weight:600 }
  .mockup-dash .rep-card .tags span{ display:inline-flex; align-items:center; gap:6px }
  .mockup-dash .rep-card .tags span::before{ content:""; width:4px; height:4px; background:var(--gold); border-radius:50%; flex:none }
  .mockup-dash .rep-card .foot{ display:flex; justify-content:space-between; align-items:center; padding-top:22px; border-top:1px solid var(--rule); flex-wrap:wrap; gap:14px }
  .mockup-dash .rep-card .foot .est{ font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--slate-500); font-weight:600 }
  .mockup-dash .rep-card .demo{ background:var(--cream-2); border-left:1px solid var(--rule); padding:36px 40px; display:flex; flex-direction:column; gap:18px; justify-content:center; min-height:300px }
  .mockup-dash .rep-card .demo .lbl{ font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--slate-500); font-weight:700; line-height:1.4 }
  .mockup-dash .rep-card .demo .lbl b{ color:var(--weak); font-weight:700 }
  .mockup-dash .rep-card .demo .lbl b.safe{ color:var(--emerald-700) }
  .mockup-dash .rep-card .demo .prompt{ font-family:"Inter", ui-sans-serif, system-ui, sans-serif; font-size:13px; line-height:1.55; color:var(--ink); padding:14px 16px; background:#fff; border:1px solid var(--rule); border-radius:12px; position:relative }
  .mockup-dash .rep-card .demo .prompt.risky{ border-left:3px solid var(--weak) }
  .mockup-dash .rep-card .demo .prompt.safe{ border-left:3px solid var(--emerald-700) }
  .mockup-dash .rep-card .demo .prompt mark{ background:rgba(159,59,31,0.14); color:var(--weak); padding:1px 4px; border-radius:3px }
  .mockup-dash .rep-card .demo .prompt mark.green{ background:rgba(4,120,87,0.14); color:var(--emerald-700) }
  .mockup-dash .rep-card .demo .arrow-down{ display:grid; place-items:center; color:var(--gold-deep); font-size:22px; line-height:1; font-weight:700 }

  /* In-depth card */
  .mockup-dash .indepth-card{ display:grid; grid-template-columns:1fr; gap:0; border:1px solid var(--rule); background:#fff; border-radius:24px; overflow:hidden; box-shadow:var(--shadow-card) }
  .mockup-dash .indepth-card .ic-body{ padding:44px 48px; display:flex; flex-direction:column; gap:18px }
  .mockup-dash .indepth-card .lab{ font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--gold-deep); font-weight:700 }
  .mockup-dash .indepth-card h3{ font-weight:600; font-size:clamp(28px,3vw,40px); line-height:1.05; letter-spacing:-0.02em; margin:0; max-width:22ch; color:var(--ink) }
  .mockup-dash .indepth-card p{ font-size:17px; line-height:1.55; color:var(--slate-600); margin:0; max-width:52ch }
  .mockup-dash .indepth-card .ctas{ display:flex; gap:12px; flex-wrap:wrap; padding-top:8px }

  /* Foundation dark card */
  .mockup-dash .found-card{ display:grid; grid-template-columns:1.1fr 1fr; gap:0; background:var(--ink); color:#fff; position:relative; overflow:hidden; border-radius:32px; box-shadow:var(--shadow-hero) }
  .mockup-dash .found-card .body{ padding:48px 52px; display:flex; flex-direction:column; gap:24px; position:relative; z-index:1 }
  .mockup-dash .found-card .lab{ font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--gold-soft); font-weight:700 }
  .mockup-dash .found-card h3{ font-weight:600; font-size:clamp(36px,4vw,52px); line-height:1.02; letter-spacing:-0.02em; margin:0; max-width:14ch }
  .mockup-dash .found-card h3 strong{ color:var(--gold-soft); font-weight:700 }
  .mockup-dash .found-card .copy{ font-size:18px; line-height:1.55; color:var(--on-dark-70); margin:0; max-width:42ch }
  .mockup-dash .found-card .copy strong{ color:var(--gold-soft); font-weight:600 }
  .mockup-dash .found-card .ctas{ display:flex; gap:12px; flex-wrap:wrap; padding-top:14px }
  .mockup-dash .found-card .price{ display:flex; align-items:baseline; gap:14px; padding-top:18px; border-top:1px solid var(--on-dark-20); margin-top:auto }
  .mockup-dash .found-card .price .n{ font-weight:700; font-size:48px; letter-spacing:-0.025em; color:var(--gold-soft); line-height:1 }
  .mockup-dash .found-card .price .l{ font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--on-dark-65); font-weight:600; line-height:1.5 }
  .mockup-dash .found-card .price .l b{ color:#fff; font-weight:700; display:block }
  .mockup-dash .found-card .feat{ padding:48px 44px; background:var(--on-dark-08); border-left:1px solid var(--on-dark-10); display:flex; flex-direction:column; gap:0 }
  .mockup-dash .found-card .feat .ftxt{ font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--gold-soft); font-weight:700; margin-bottom:18px }
  .mockup-dash .found-card .feat .it{ display:grid; grid-template-columns:30px 1fr auto; gap:14px; align-items:center; padding:14px 0; border-bottom:1px solid var(--on-dark-10); font-size:16px }
  .mockup-dash .found-card .feat .it:last-child{ border-bottom:none }
  .mockup-dash .found-card .feat .it .ico{ width:30px; height:30px; display:grid; place-items:center }
  .mockup-dash .found-card .feat .it .ico svg{ width:24px; height:24px; color:var(--gold) }
  .mockup-dash .found-card .feat .it .nm{ font-size:15px; color:#fff; font-weight:500; letter-spacing:-0.005em }
  .mockup-dash .found-card .feat .it .nm strong{ color:var(--gold-soft); font-weight:700 }
  .mockup-dash .found-card .feat .it .n{ font-size:10px; letter-spacing:0.18em; color:var(--on-dark-50); font-weight:600; text-transform:uppercase }

  /* Resource grid */
  .mockup-dash .res-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px }
  .mockup-dash .res-card{ background:#fff; border:1px solid var(--rule); border-radius:20px; padding:22px 22px 18px; display:flex; flex-direction:column; gap:14px; min-height:230px; position:relative; transition:transform .15s,box-shadow .15s,border-color .15s; cursor:pointer; text-decoration:none; color:inherit; box-shadow:var(--shadow-card) }
  .mockup-dash .res-card:hover{ transform:translateY(-4px); border-color:var(--gold); box-shadow:var(--shadow-hover) }
  .mockup-dash .res-card .ricon{ width:48px; height:48px; display:grid; place-items:center }
  .mockup-dash .res-card .ricon svg{ width:100%; height:100%; display:block }
  .mockup-dash .res-card .tag{ font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--gold-deep); font-weight:700 }
  .mockup-dash .res-card h4{ font-weight:600; font-size:19px; line-height:1.2; letter-spacing:-0.01em; margin:0; max-width:14ch; color:var(--ink) }
  .mockup-dash .res-card h4 strong{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .res-card .fmeta{ margin-top:auto; padding-top:14px; border-top:1px solid var(--rule); display:flex; justify-content:space-between; align-items:baseline; font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--slate-500); font-weight:600 }
  .mockup-dash .res-card .fmeta .arrow{ color:var(--gold-deep); font-size:14px; letter-spacing:0; text-transform:none; font-weight:700 }

  /* SAFE card */
  .mockup-dash .safe-card{ background:#fff; border:1px solid var(--rule); border-radius:24px; padding:0; display:grid; grid-template-columns:1.2fr 2fr auto; gap:0; align-items:stretch; overflow:hidden; box-shadow:var(--shadow-card) }
  .mockup-dash .safe-card .label{ padding:32px 36px; border-right:1px solid var(--rule); background:var(--cream); display:flex; flex-direction:column; gap:8px; justify-content:center }
  .mockup-dash .safe-card .label .lab{ font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--gold-deep); font-weight:700 }
  .mockup-dash .safe-card .label h3{ font-weight:600; font-size:30px; line-height:1.05; letter-spacing:-0.02em; margin:0; color:var(--ink) }
  .mockup-dash .safe-card .label h3 strong{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .safe-card .label .sub{ font-size:14px; color:var(--slate-500); margin-top:4px }
  .mockup-dash .safe-card .grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:0 }
  .mockup-dash .safe-card .cell{ padding:28px 22px; border-right:1px solid var(--rule); display:flex; flex-direction:column; gap:8px; min-height:160px }
  .mockup-dash .safe-card .cell:last-child{ border-right:none }
  .mockup-dash .safe-card .cell .letter{ font-weight:700; font-size:44px; line-height:0.9; letter-spacing:-0.025em; color:var(--gold-deep) }
  .mockup-dash .safe-card .cell .word{ font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--ink); font-weight:700 }
  .mockup-dash .safe-card .cell .desc{ font-size:14px; line-height:1.45; color:var(--slate-600); margin-top:4px }
  .mockup-dash .safe-card .cta-col{ padding:32px; border-left:1px solid var(--rule); display:flex; flex-direction:column; justify-content:center; gap:10px; background:var(--cream); min-width:200px }
  .mockup-dash .safe-card .cta-col .meta{ font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--slate-500); font-weight:600 }

  @media (max-width:1080px){
    .mockup-dash .welcome .wgrid{ grid-template-columns:1fr; gap:32px }
    .mockup-dash .trio-grid{ grid-template-columns:1fr }
    .mockup-dash .rep-card{ grid-template-columns:1fr }
    .mockup-dash .rep-card .demo{ border-left:none; border-top:1px solid var(--rule) }
    .mockup-dash .found-card{ grid-template-columns:1fr }
    .mockup-dash .found-card .feat{ border-left:none; border-top:1px solid var(--on-dark-10) }
    .mockup-dash .res-grid{ grid-template-columns:repeat(2,1fr) }
    .mockup-dash .safe-card{ grid-template-columns:1fr }
    .mockup-dash .safe-card .label{ border-right:none; border-bottom:1px solid var(--rule) }
    .mockup-dash .safe-card .cta-col{ border-left:none; border-top:1px solid var(--rule) }
  }
  @media (max-width:640px){
    .mockup-dash .res-grid{ grid-template-columns:1fr }
    .mockup-dash .safe-card .grid{ grid-template-columns:1fr }
    .mockup-dash .safe-card .cell{ border-right:none; border-bottom:1px solid var(--rule); min-height:auto }
    .mockup-dash .welcome{ padding:48px 0 40px }
    .mockup-dash .sec{ padding:48px 0 }
    .mockup-dash .rep-card .body, .mockup-dash .rep-card .demo{ padding:28px 24px }
    .mockup-dash .found-card .body, .mockup-dash .found-card .feat{ padding:32px 24px }
  }
`;
