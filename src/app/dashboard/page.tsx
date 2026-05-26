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
    heroPrimary = { href: '/assessment/start', label: 'Take the free assessment' };
    heroSecondary = { href: '/courses/foundation/program', label: 'Preview Foundation' };
    heroLede =
      "Start with a three-minute readiness check. You'll get your score, your strongest area, your weakest area, and the recommended next step.";
  }

  const tabs: ReadonlyArray<{ label: string; href: string; active?: boolean; lock?: string }> = [
    { label: 'Dashboard', href: '/dashboard', active: true },
    { label: 'The Brief', href: '/research' },
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

      <main className="ledger-dash">
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
                      {name ? <>Hello, <em>{name}.</em></> : <>Welcome <em>back.</em></>}
                    </h1>
                    <SnapshotPanel snapshot={snapshot} inDepthEntitled={Boolean(assessments?.inDepth?.entitled)} />
                  </>
                ) : (
                  <h1>
                    {name ? <>Hello, <em>{name}.</em></> : <>Welcome <em>in.</em></>}
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
                  Seven steps to <em>activate</em> the full Institute.
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
                        Take the free <em>readiness</em> assessment.
                      </>
                    }
                    meta={stepAssessment ? 'Done' : '3 min'}
                    href="/assessment/start"
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
                        Go deeper with the <em>In-Depth</em> Assessment.
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
                        Enroll in <em>AiBI-Foundation</em>.
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
                        Earn your <em>Foundation</em> certificate.
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
                What you can <em>do</em> today.
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
                let assessHref = '/assessment/start';
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
                      <svg viewBox="0 0 140 120" fill="none" stroke="#0E1B2D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 92 A 48 48 0 0 1 118 92" fill="var(--ledger-accent-a10)" />
                        <line x1="22" y1="92" x2="30" y2="88" />
                        <line x1="38" y1="64" x2="44" y2="68" />
                        <line x1="70" y1="44" x2="70" y2="52" />
                        <line x1="102" y1="64" x2="96" y2="68" />
                        <line x1="118" y1="92" x2="110" y2="88" />
                        <line x1="70" y1="92" x2="92" y2="54" stroke="var(--ledger-accent)" strokeWidth="2.4" />
                        <circle cx="70" cy="92" r="5" fill="var(--ledger-accent)" stroke="none" />
                        <line x1="20" y1="100" x2="120" y2="100" />
                      </svg>
                    </div>
                    <div className="step">
                      <span>Step 01</span>
                      <em>i.</em>
                    </div>
                    <h3>
                      {stepInDepth ? <>Your <em>Briefing.</em></> : <>Assess your <em>readiness.</em></>}
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
                  <svg viewBox="0 0 140 120" fill="none" stroke="#0E1B2D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="20" y="46" width="14" height="28" fill="var(--ledger-accent-a18)" />
                    <rect x="106" y="46" width="14" height="28" fill="var(--ledger-accent-a18)" />
                    <rect x="34" y="54" width="8" height="12" />
                    <rect x="98" y="54" width="8" height="12" />
                    <line x1="42" y1="60" x2="98" y2="60" strokeWidth="3" />
                    <line x1="20" y1="34" x2="34" y2="34" strokeWidth="1" opacity="0.5" />
                    <line x1="106" y1="34" x2="120" y2="34" strokeWidth="1" opacity="0.5" />
                    <line x1="20" y1="98" x2="120" y2="98" />
                    <path d="M70 12 L66 24 L74 24 L70 36" stroke="var(--ledger-accent)" strokeWidth="2" />
                  </svg>
                </div>
                <div className="step">
                  <span>Step 02</span>
                  <em>ii.</em>
                </div>
                <h3>
                  Practice a banker-safe <em>rep.</em>
                </h3>
                <p>A new six-minute exercise every day. Free, no enrollment.</p>
                <div className="cta">
                  <b>Start today&apos;s rep</b>
                  <span className="arrow">→</span>
                </div>
              </Link>

              <Link className="vc" href={stepEnrolled ? '/courses/foundation/program' : '/courses/foundation'}>
                <div className="illust" aria-hidden="true">
                  <svg viewBox="0 0 140 120" fill="none" stroke="#0E1B2D" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
                    <rect x="20" y="44" width="100" height="60" fill="var(--ledger-accent-a10)" />
                    <rect x="20" y="44" width="100" height="14" />
                    <path d="M48 44 L48 30 L92 30 L92 44" />
                    <rect x="64" y="36" width="12" height="8" fill="var(--ledger-accent)" stroke="none" />
                    <path d="M58 30 L58 22 L82 22 L82 30" strokeWidth="1.4" opacity="0.6" />
                    <line x1="44" y1="70" x2="44" y2="100" strokeWidth="1" opacity="0.5" />
                    <line x1="96" y1="70" x2="96" y2="100" strokeWidth="1" opacity="0.5" />
                    <line x1="70" y1="70" x2="70" y2="100" strokeWidth="1" opacity="0.5" />
                  </svg>
                </div>
                <div className="step">
                  <span>Step 03</span>
                  <em>iii.</em>
                </div>
                <h3>
                  Build with the full <em>toolkit.</em>
                </h3>
                <p>Twelve modules. Prompt library. Templates. Certificate.</p>
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
                Today&apos;s six-minute <em>rep.</em>
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
                  Your In-Depth <em>Briefing.</em>
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
                The full <em>Foundation</em> course.
              </h2>
              <Link href="/courses/foundation/program" className="more">
                View the syllabus →
              </Link>
            </header>

            <article className="found-card">
              <div className="body">
                <span className="lab">AiBI-Foundation · Self-paced course</span>
                <h3>
                  Turn the <em>skill</em> into operating capability.
                </h3>
                <p className="copy">
                  Twelve modules of structured exercises, working artifacts, and a banker-tested prompt library — taught with the same examiner-aware rigor as our research desk. Aligned with SR 11-7 and TPRM.
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
                  <svg viewBox="0 0 32 32" fill="none" stroke="var(--ledger-accent)" strokeWidth="1.4" strokeLinejoin="round">
                    <rect x="6" y="8" width="20" height="18" fill="var(--ledger-accent-a20)" />
                    <line x1="6" y1="14" x2="26" y2="14" />
                    <line x1="10" y1="20" x2="22" y2="20" opacity="0.5" />
                  </svg>
                } name={<>12 structured <em>modules</em></>} meta="Self-paced" />
                <FeatureRow svg={
                  <svg viewBox="0 0 32 32" fill="none" stroke="var(--ledger-accent)" strokeWidth="1.4" strokeLinejoin="round">
                    <path d="M8 8 L24 8 L24 28 L8 28 Z" fill="var(--ledger-accent-a18)" />
                    <line x1="12" y1="14" x2="20" y2="14" />
                    <line x1="12" y1="18" x2="20" y2="18" />
                    <line x1="12" y1="22" x2="16" y2="22" />
                  </svg>
                } name={<>Banker-tested <em>prompt library</em></>} meta="30+ prompts" />
                <FeatureRow svg={
                  <svg viewBox="0 0 32 32" fill="none" stroke="var(--ledger-accent)" strokeWidth="1.4" strokeLinecap="round">
                    <circle cx="16" cy="16" r="11" />
                    <path d="M11 16 L15 19 L21 12" strokeWidth="1.8" />
                  </svg>
                } name={<>Hands-on <em>activities</em></>} meta="In every module" />
                <FeatureRow svg={
                  <svg viewBox="0 0 32 32" fill="none" stroke="var(--ledger-accent)" strokeWidth="1.4" strokeLinejoin="round">
                    <rect x="6" y="10" width="20" height="16" fill="var(--ledger-accent-a18)" />
                    <path d="M10 14 L22 14 M10 18 L18 18 M10 22 L20 22" opacity="0.6" />
                  </svg>
                } name={<>Working <em>artifacts</em></>} meta="PDFs + worksheets" />
                <FeatureRow svg={
                  <svg viewBox="0 0 32 32" fill="none" stroke="var(--ledger-accent)" strokeWidth="1.4">
                    <circle cx="16" cy="14" r="6" fill="var(--ledger-accent-a20)" />
                    <path d="M10 24 L10 28 M22 24 L22 28 M16 20 L16 26" />
                    <circle cx="16" cy="14" r="2" fill="var(--ledger-accent)" stroke="none" />
                  </svg>
                } name={<>Verified <em>certificate</em></>} meta="On completion" />
              </div>
            </article>
          </div>
        </section>

        {/* FREE RESOURCES */}
        <section className="sec">
          <div className="container">
            <header className="sec-head">
              <h2>
                Free <em>resources.</em>
              </h2>
              <Link href="/research" className="more">
                All research →
              </Link>
            </header>

            <div className="res-grid">
              <ResourceCard
                href="/research/the-skill-not-the-prompt"
                tag="Briefing"
                title={<>The <em>skill</em>, not the prompt.</>}
                meta="Briefing · 8 min read"
                svg={
                  <svg viewBox="0 0 48 48" fill="none" stroke="#0E1B2D" strokeWidth="1.5" strokeLinejoin="round">
                    <rect x="10" y="6" width="28" height="36" fill="var(--ledger-accent-a12)" />
                    <line x1="14" y1="14" x2="34" y2="14" />
                    <line x1="14" y1="20" x2="28" y2="20" opacity="0.6" />
                    <line x1="14" y1="26" x2="32" y2="26" opacity="0.6" />
                  </svg>
                }
              />
              <ResourceCard
                href="/research/six-ways-ai-fails-in-banking"
                tag="Briefing"
                title={<>Six ways AI <em>fails</em> in banking.</>}
                meta="Briefing · 10 min read"
                svg={
                  <svg viewBox="0 0 48 48" fill="none" stroke="#0E1B2D" strokeWidth="1.5" strokeLinejoin="round">
                    <rect x="6" y="10" width="36" height="28" fill="var(--ledger-accent-a10)" />
                    <line x1="6" y1="18" x2="42" y2="18" />
                    <line x1="18" y1="10" x2="18" y2="38" />
                    <line x1="30" y1="10" x2="30" y2="38" />
                    <rect x="9" y="22" width="6" height="3" fill="var(--ledger-accent)" stroke="none" />
                    <rect x="21" y="22" width="6" height="3" fill="var(--ledger-accent)" stroke="none" />
                    <rect x="33" y="22" width="6" height="3" fill="var(--ledger-accent)" stroke="none" />
                  </svg>
                }
              />
              <ResourceCard
                href="/research/ai-governance-without-the-jargon"
                tag="Briefing"
                title={<>AI governance, <em>without</em> the jargon.</>}
                meta="Briefing · 12 min read"
                svg={
                  <svg viewBox="0 0 48 48" fill="none" stroke="#0E1B2D" strokeWidth="1.5" strokeLinejoin="round">
                    <path d="M8 10 L40 10 L40 32 L26 32 L18 38 L18 32 L8 32 Z" fill="var(--ledger-accent-a12)" />
                    <line x1="14" y1="18" x2="34" y2="18" opacity="0.6" />
                    <line x1="14" y1="24" x2="28" y2="24" opacity="0.6" />
                    <circle cx="14" cy="14" r="1.5" fill="var(--ledger-accent)" stroke="none" />
                    <circle cx="20" cy="14" r="1.5" fill="var(--ledger-accent)" stroke="none" />
                  </svg>
                }
              />
              <ResourceCard
                href="/research"
                tag="All research"
                title={<>The AI Banking <em>Brief.</em></>}
                meta="Six briefings + more"
                svg={
                  <svg viewBox="0 0 48 48" fill="none" stroke="#0E1B2D" strokeWidth="1.5" strokeLinejoin="round">
                    <rect x="8" y="6" width="32" height="36" fill="var(--ledger-accent-a10)" />
                    <line x1="14" y1="14" x2="34" y2="14" strokeWidth="2" />
                    <line x1="14" y1="20" x2="34" y2="20" opacity="0.6" />
                    <line x1="14" y1="24" x2="34" y2="24" opacity="0.6" />
                    <line x1="14" y1="28" x2="28" y2="28" opacity="0.6" />
                    <rect x="14" y="33" width="20" height="5" fill="var(--ledger-accent)" stroke="none" />
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
                  Four <em>checks</em> before you press send.
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
                <Link href="/research/the-skill-not-the-prompt" className="btn btn-primary">
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

// Scoped Ledger styles ported from the User Home.html design bundle.
// Variables resolve to the project's existing --ledger-* tokens where present;
// fallbacks repeat the design's color values so the page renders identically
// in surfaces that haven't migrated yet.
const dashboardStyles = `
  .ledger-dash{
    --bg:var(--ledger-bg,#ECE9DF);
    --paper:var(--ledger-paper,#F4F1E7);
    --paper-2:#EDE8DA;
    --parch:var(--ledger-parch,#E4E0D2);
    --parch-dark:var(--ledger-parch-dark,#D9D4C2);
    --tape:var(--ledger-tape,#F1E9D0);
    --ink:var(--ledger-ink,#0E1B2D);
    --ink-2:var(--ledger-ink-2,#1F2A3F);
    --slate:var(--ledger-slate,#5C6B82);
    --muted:var(--ledger-muted,#5C6B82);
    --soft:var(--ledger-soft,#8C95A8);
    --terra:var(--ledger-accent,var(--ledger-accent));
    --terra-2:#8E6212;
    --forest:#4A6B47;
    --weak:var(--ledger-weak,#8E3B2A);
    --rule:rgba(14,27,45,0.10);
    --rule-strong:rgba(14,27,45,0.22);
    --serif:var(--ledger-serif,'Newsreader',Georgia,serif);
    --sans:var(--ledger-sans,'Geist',-apple-system,system-ui,sans-serif);
    --mono:var(--ledger-mono,'JetBrains Mono',ui-monospace,monospace);
    --maxw:1280px;
    background:var(--paper); color:var(--ink); font-family:var(--sans); font-size:15px; line-height:1.55;
    position:relative;
  }
  .ledger-dash .container{ position:relative; z-index:1; max-width:var(--maxw); margin:0 auto; padding:0 32px }
  .ledger-dash .eyebrow{ font-family:var(--mono); font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--muted); font-weight:600 }

  .ledger-dash .btn{ display:inline-flex; align-items:center; gap:10px; padding:14px 22px; border:1px solid transparent; font-family:var(--mono); font-size:11px; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; line-height:1; cursor:pointer; border-radius:1px; transition:background .15s,color .15s,border-color .15s; text-decoration:none }
  .ledger-dash .btn-primary{ background:var(--terra); color:#FAF7EE; border-color:var(--terra) }
  .ledger-dash .btn-primary:hover{ background:var(--terra-2); border-color:var(--terra-2) }
  .ledger-dash .btn-ghost{ background:transparent; color:var(--ink); border:1px solid var(--ink) }
  .ledger-dash .btn-ghost:hover{ background:var(--ink); color:var(--paper) }
  .ledger-dash .btn-paper{ background:var(--paper); color:var(--ink); border:1px solid var(--paper) }
  .ledger-dash .btn-paper:hover{ background:var(--paper-2) }
  .ledger-dash .btn .arrow{ font-family:var(--serif); font-style:italic; font-weight:400; font-size:14px; letter-spacing:0; text-transform:none }

  .ledger-dash .tabs{ background:transparent; border-bottom:1px solid var(--rule) }
  .ledger-dash .tabs-inner{ max-width:var(--maxw); margin:0 auto; padding:0 32px; display:flex; align-items:center; gap:0; flex-wrap:wrap }
  .ledger-dash .tab{ font-family:var(--mono); font-size:11px; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; color:var(--muted); padding:16px 18px 14px; border-bottom:2px solid transparent; margin-bottom:-1px; display:inline-flex; align-items:center; gap:8px; text-decoration:none }
  .ledger-dash .tab:hover{ color:var(--ink-2) }
  .ledger-dash .tab.active{ color:var(--ink); border-bottom-color:var(--terra) }
  .ledger-dash .tab .lock{ font-family:var(--serif); font-style:italic; font-size:10px; color:var(--terra); text-transform:none; letter-spacing:0; font-weight:500 }

  .ledger-dash .welcome{ padding:72px 0 60px; border-bottom:1px solid var(--rule); position:relative; overflow:hidden }
  .ledger-dash .welcome .wgrid{ display:grid; grid-template-columns:1.35fr 1fr; gap:64px; align-items:center }
  .ledger-dash .welcome .greet{ color:var(--terra); margin-bottom:18px; display:block }
  .ledger-dash .welcome h1{ font-family:var(--serif); font-weight:500; font-size:clamp(48px,5.8vw,84px); line-height:0.96; letter-spacing:-0.035em; margin:0 0 22px; max-width:14ch; color:var(--ink) }
  .ledger-dash .welcome h1 em{ font-style:italic; color:var(--terra); font-weight:500 }
  .ledger-dash .welcome .lede{ font-family:var(--serif); font-size:21px; line-height:1.45; color:var(--ink-2); max-width:42ch; margin:0 0 30px; font-weight:400 }
  .ledger-dash .welcome .ctas{ display:flex; gap:12px; flex-wrap:wrap }

  /* Snapshot panel — replaces the generic lede when the user has results */
  .ledger-dash .welcome .snap{ background:var(--paper); border:1px solid var(--rule-strong); padding:22px 24px; margin:0 0 26px; max-width:560px }
  .ledger-dash .welcome .snap-row{ display:grid; grid-template-columns:repeat(3,1fr); gap:0; align-items:start }
  .ledger-dash .welcome .snap-cell{ display:flex; flex-direction:column; gap:6px; padding:0 18px; border-left:1px solid var(--rule) }
  .ledger-dash .welcome .snap-cell:first-child{ padding-left:0; border-left:none }
  .ledger-dash .welcome .snap-cell:last-child{ padding-right:0 }
  .ledger-dash .welcome .snap-lab{ font-family:var(--mono); font-size:9.5px; letter-spacing:0.2em; text-transform:uppercase; color:var(--muted); font-weight:600 }
  .ledger-dash .welcome .snap-tier{ font-family:var(--serif); font-style:italic; font-size:22px; line-height:1.1; color:var(--terra); font-weight:500; letter-spacing:-0.015em }
  .ledger-dash .welcome .snap-score{ font-family:var(--mono); font-size:24px; font-weight:600; color:var(--ink); line-height:1; font-variant-numeric:tabular-nums }
  .ledger-dash .welcome .snap-score-max{ font-size:14px; font-weight:400; color:var(--muted); margin-left:2px }
  .ledger-dash .welcome .snap-pct{ font-family:var(--mono); font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--terra); font-weight:600 }
  .ledger-dash .welcome .snap-source{ font-family:var(--serif); font-size:15px; line-height:1.2; color:var(--ink); font-weight:500 }
  .ledger-dash .welcome .snap-meta{ font-family:var(--mono); font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:var(--muted); font-weight:500 }
  .ledger-dash .welcome .snap-foot{ font-family:var(--serif); font-style:italic; font-size:14px; line-height:1.5; color:var(--ink-2); margin:18px 0 0; padding-top:14px; border-top:1px solid var(--rule); max-width:56ch }
  @media (max-width:640px){
    .ledger-dash .welcome .snap-row{ grid-template-columns:1fr; gap:18px }
    .ledger-dash .welcome .snap-cell{ padding:0; border-left:none; border-top:1px solid var(--rule); padding-top:14px }
    .ledger-dash .welcome .snap-cell:first-child{ border-top:none; padding-top:0 }
  }
  .ledger-dash .welcome .progress{ background:var(--paper-2); border:1px solid var(--rule-strong); padding:32px 32px 28px; position:relative }
  .ledger-dash .welcome .progress .lab{ font-family:var(--mono); font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--terra); font-weight:600; margin-bottom:14px; display:block }
  .ledger-dash .welcome .progress h4{ font-family:var(--serif); font-weight:500; font-size:22px; line-height:1.2; letter-spacing:-0.015em; margin:0 0 22px; max-width:28ch; color:var(--ink) }
  .ledger-dash .welcome .progress h4 em{ font-style:italic; color:var(--terra) }
  .ledger-dash .welcome .progress .steps{ display:flex; flex-direction:column; gap:14px }
  .ledger-dash .welcome .progress .step{ display:grid; grid-template-columns:24px 1fr auto; gap:14px; align-items:center; padding:10px 0; border-top:1px solid var(--rule); text-decoration:none; color:inherit; transition:background .15s }
  a.ledger-dash .welcome .progress .step,
  .ledger-dash .welcome .progress a.step{ cursor:pointer }
  .ledger-dash .welcome .progress a.step:hover .t{ color:var(--terra) }
  .ledger-dash .welcome .progress .step:first-child{ border-top:none; padding-top:0 }
  .ledger-dash .welcome .progress .step .pn{ width:24px; height:24px; border:1.4px solid var(--rule-strong); border-radius:50%; display:grid; place-items:center; font-family:var(--mono); font-size:10px; color:var(--muted); font-weight:700 }
  .ledger-dash .welcome .progress .step.done .pn{ background:var(--terra); border-color:var(--terra); color:#FAF7EE }
  .ledger-dash .welcome .progress .step.now .pn{ border-color:var(--ink); color:var(--ink); border-width:1.8px }
  .ledger-dash .welcome .progress .step .t{ font-family:var(--serif); font-size:16px; line-height:1.3; color:var(--ink) }
  .ledger-dash .welcome .progress .step.locked .t{ color:var(--muted) }
  .ledger-dash .welcome .progress .step .meta{ font-family:var(--mono); font-size:9.5px; letter-spacing:0.16em; text-transform:uppercase; color:var(--muted); font-weight:500 }
  .ledger-dash .welcome .progress .step.done .meta{ color:var(--terra); font-weight:600 }
  .ledger-dash .welcome .progress .step.now .meta{ color:var(--ink); font-weight:600 }

  .ledger-dash .sec{ padding:72px 0; border-bottom:1px solid var(--rule) }
  .ledger-dash .sec.shaded{ background:var(--paper-2) }
  .ledger-dash .sec.dark{ background:var(--ink); color:var(--paper-2); border-color:rgba(244,241,231,0.18) }
  .ledger-dash .sec.dark .sec-head h2{ color:var(--paper) }
  .ledger-dash .sec.dark .sec-head h2 em{ color:var(--terra) }
  .ledger-dash .sec-head{ display:flex; align-items:flex-end; gap:24px; margin-bottom:40px; padding-bottom:16px; border-bottom:2px solid var(--ink); flex-wrap:wrap }
  .ledger-dash .sec.dark .sec-head{ border-color:var(--paper) }
  .ledger-dash .sec-head h2{ font-family:var(--serif); font-weight:500; font-size:clamp(34px,3.6vw,46px); line-height:1; letter-spacing:-0.025em; margin:0; color:var(--ink) }
  .ledger-dash .sec-head h2 em{ font-style:italic; color:var(--terra); font-weight:500 }
  .ledger-dash .sec-head .more{ margin-left:auto; font-family:var(--mono); font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:var(--terra); font-weight:600; text-decoration:none }
  .ledger-dash .sec-head .more:hover{ color:var(--terra-2) }
  .ledger-dash .sec.dark .sec-head .more{ color:var(--terra) }

  .ledger-dash .trio-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:0; border:1px solid var(--rule-strong); background:var(--paper) }
  .ledger-dash .vc{ padding:36px 32px 30px; border-right:1px solid var(--rule); display:flex; flex-direction:column; gap:18px; min-height:340px; position:relative; transition:background .2s; cursor:pointer; text-decoration:none; color:inherit }
  .ledger-dash .vc:last-child{ border-right:none }
  .ledger-dash .vc:hover{ background:var(--paper-2) }
  .ledger-dash .vc::before{ content:""; position:absolute; left:0; top:0; width:0; height:3px; background:var(--terra); transition:width .35s ease-out }
  .ledger-dash .vc:hover::before{ width:100% }
  .ledger-dash .vc .illust{ height:120px; display:grid; place-items:center; padding-bottom:18px; border-bottom:1px solid var(--rule) }
  .ledger-dash .vc .illust svg{ width:100%; height:100%; max-width:130px; display:block }
  .ledger-dash .vc .step{ font-family:var(--mono); font-size:10.5px; letter-spacing:0.22em; text-transform:uppercase; color:var(--muted); font-weight:600; display:flex; justify-content:space-between; align-items:baseline }
  .ledger-dash .vc .step em{ font-family:var(--serif); font-style:italic; color:var(--terra); font-size:18px; letter-spacing:-0.02em; font-weight:500 }
  .ledger-dash .vc h3{ font-family:var(--serif); font-weight:500; font-size:28px; line-height:1.05; letter-spacing:-0.02em; margin:0; max-width:14ch; color:var(--ink) }
  .ledger-dash .vc h3 em{ font-style:italic; color:var(--terra) }
  .ledger-dash .vc p{ font-family:var(--serif); font-size:15.5px; line-height:1.5; color:var(--ink-2); margin:0; max-width:30ch }
  .ledger-dash .vc .cta{ margin-top:auto; display:flex; justify-content:space-between; align-items:baseline; padding-top:16px; border-top:1px solid var(--rule); font-family:var(--mono); font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:var(--ink); font-weight:600 }
  .ledger-dash .vc .cta b{ color:var(--terra); font-weight:700 }
  .ledger-dash .vc .cta .arrow{ font-family:var(--serif); font-style:italic; font-size:16px; color:var(--terra); letter-spacing:0; text-transform:none; font-weight:500 }

  .ledger-dash .rep-card{ display:grid; grid-template-columns:1.1fr 1fr; gap:0; border:1px solid var(--rule-strong); background:var(--paper) }
  .ledger-dash .rep-card .body{ padding:44px 48px; display:flex; flex-direction:column; gap:22px }
  .ledger-dash .rep-card .ts{ font-family:var(--mono); font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--terra); font-weight:600; display:flex; align-items:center; gap:14px }
  .ledger-dash .rep-card .ts .dot{ width:6px; height:6px; background:var(--terra); border-radius:50%; flex:none }
  .ledger-dash .rep-card h3{ font-family:var(--serif); font-weight:500; font-size:clamp(34px,3.8vw,48px); line-height:1.02; letter-spacing:-0.025em; margin:0; max-width:18ch; color:var(--ink) }
  .ledger-dash .rep-card h3 em{ font-style:italic; color:var(--terra) }
  .ledger-dash .rep-card .rep-lede{ font-family:var(--serif); font-style:italic; font-size:18px; line-height:1.5; color:var(--ink-2); margin:0; max-width:42ch }
  .ledger-dash .rep-card .tags{ display:flex; gap:18px; flex-wrap:wrap; font-family:var(--mono); font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--muted); font-weight:500 }
  .ledger-dash .rep-card .tags span{ display:inline-flex; align-items:center; gap:6px }
  .ledger-dash .rep-card .tags span::before{ content:""; width:4px; height:4px; background:var(--terra); border-radius:50%; flex:none }
  .ledger-dash .rep-card .foot{ display:flex; justify-content:space-between; align-items:center; padding-top:22px; border-top:1px solid var(--rule); flex-wrap:wrap; gap:14px }
  .ledger-dash .rep-card .foot .est{ font-family:var(--mono); font-size:10.5px; letter-spacing:0.18em; text-transform:uppercase; color:var(--muted); font-weight:500 }
  .ledger-dash .rep-card .demo{ background:var(--paper-2); border-left:1px solid var(--rule); padding:36px 40px; display:flex; flex-direction:column; gap:18px; justify-content:center; min-height:300px }
  .ledger-dash .rep-card .demo .lbl{ font-family:var(--mono); font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--muted); font-weight:600; line-height:1.4 }
  .ledger-dash .rep-card .demo .lbl b{ color:var(--weak); font-weight:700 }
  .ledger-dash .rep-card .demo .lbl b.safe{ color:var(--forest) }
  .ledger-dash .rep-card .demo .prompt{ font-family:var(--mono); font-size:13px; line-height:1.55; color:var(--ink); padding:14px 16px; background:var(--paper); border:1px solid var(--rule-strong); position:relative }
  .ledger-dash .rep-card .demo .prompt.risky{ border-left:3px solid var(--weak) }
  .ledger-dash .rep-card .demo .prompt.safe{ border-left:3px solid var(--forest) }
  .ledger-dash .rep-card .demo .prompt mark{ background:rgba(142,59,42,0.16); color:var(--weak); padding:1px 4px; border-radius:1px }
  .ledger-dash .rep-card .demo .prompt mark.green{ background:rgba(74,107,71,0.16); color:var(--forest) }
  .ledger-dash .rep-card .demo .arrow-down{ display:grid; place-items:center; font-family:var(--serif); font-style:italic; color:var(--terra); font-size:24px; line-height:1 }

  .ledger-dash .indepth-card{ display:grid; grid-template-columns:1fr; gap:0; border:1px solid var(--rule-strong); background:var(--paper) }
  .ledger-dash .indepth-card .ic-body{ padding:44px 48px; display:flex; flex-direction:column; gap:18px }
  .ledger-dash .indepth-card .lab{ font-family:var(--mono); font-size:10.5px; letter-spacing:0.22em; text-transform:uppercase; color:var(--terra); font-weight:600 }
  .ledger-dash .indepth-card h3{ font-family:var(--serif); font-weight:500; font-size:clamp(30px,3.2vw,42px); line-height:1.02; letter-spacing:-0.025em; margin:0; max-width:22ch; color:var(--ink) }
  .ledger-dash .indepth-card p{ font-family:var(--serif); font-size:17px; line-height:1.5; color:var(--ink-2); margin:0; max-width:48ch }
  .ledger-dash .indepth-card .ctas{ display:flex; gap:12px; flex-wrap:wrap; padding-top:8px }

  .ledger-dash .found-card{ display:grid; grid-template-columns:1.1fr 1fr; gap:0; background:var(--ink); color:var(--paper); position:relative; overflow:hidden; border:1px solid rgba(244,241,231,0.18) }
  .ledger-dash .found-card .body{ padding:48px 52px; display:flex; flex-direction:column; gap:24px; position:relative; z-index:1 }
  .ledger-dash .found-card .lab{ font-family:var(--mono); font-size:10.5px; letter-spacing:0.22em; text-transform:uppercase; color:var(--terra); font-weight:600 }
  .ledger-dash .found-card h3{ font-family:var(--serif); font-weight:500; font-size:clamp(38px,4.4vw,56px); line-height:1; letter-spacing:-0.028em; margin:0; max-width:14ch }
  .ledger-dash .found-card h3 em{ font-style:italic; color:var(--terra) }
  .ledger-dash .found-card .copy{ font-family:var(--serif); font-style:italic; font-size:19px; line-height:1.45; color:rgba(244,241,231,0.82); margin:0; max-width:36ch }
  .ledger-dash .found-card .copy em{ color:var(--terra) }
  .ledger-dash .found-card .ctas{ display:flex; gap:12px; flex-wrap:wrap; padding-top:14px }
  .ledger-dash .found-card .price{ display:flex; align-items:baseline; gap:14px; padding-top:18px; border-top:1px solid rgba(244,241,231,0.18); margin-top:auto }
  .ledger-dash .found-card .price .n{ font-family:var(--serif); font-weight:500; font-style:italic; font-size:48px; letter-spacing:-0.03em; color:var(--terra); line-height:1 }
  .ledger-dash .found-card .price .l{ font-family:var(--mono); font-size:10.5px; letter-spacing:0.18em; text-transform:uppercase; color:rgba(244,241,231,0.72); font-weight:500; line-height:1.5 }
  .ledger-dash .found-card .price .l b{ color:var(--paper); font-weight:700; display:block }
  .ledger-dash .found-card .feat{ padding:48px 44px; background:rgba(244,241,231,0.04); border-left:1px solid rgba(244,241,231,0.14); display:flex; flex-direction:column; gap:0 }
  .ledger-dash .found-card .feat .ftxt{ font-family:var(--mono); font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--terra); font-weight:600; margin-bottom:18px }
  .ledger-dash .found-card .feat .it{ display:grid; grid-template-columns:30px 1fr auto; gap:14px; align-items:center; padding:14px 0; border-bottom:1px solid rgba(244,241,231,0.10); font-family:var(--serif); font-size:16.5px }
  .ledger-dash .found-card .feat .it:last-child{ border-bottom:none }
  .ledger-dash .found-card .feat .it .ico{ width:30px; height:30px; display:grid; place-items:center }
  .ledger-dash .found-card .feat .it .ico svg{ width:24px; height:24px }
  .ledger-dash .found-card .feat .it .nm{ font-family:var(--serif); font-size:16px; color:var(--paper); font-weight:500; letter-spacing:-0.01em }
  .ledger-dash .found-card .feat .it .nm em{ font-style:italic; color:var(--terra) }
  .ledger-dash .found-card .feat .it .n{ font-family:var(--mono); font-size:9.5px; letter-spacing:0.18em; color:rgba(244,241,231,0.6); font-weight:500; text-transform:uppercase }

  .ledger-dash .res-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px }
  .ledger-dash .res-card{ background:var(--paper); border:1px solid var(--rule-strong); padding:24px 24px 22px; display:flex; flex-direction:column; gap:14px; min-height:230px; position:relative; transition:transform .2s,box-shadow .2s; cursor:pointer; text-decoration:none; color:inherit }
  .ledger-dash .res-card:hover{ transform:translateY(-2px); box-shadow:0 14px 32px -28px rgba(14,27,45,0.30) }
  .ledger-dash .res-card .ricon{ width:48px; height:48px; display:grid; place-items:center }
  .ledger-dash .res-card .ricon svg{ width:100%; height:100%; display:block }
  .ledger-dash .res-card .tag{ font-family:var(--mono); font-size:9.5px; letter-spacing:0.18em; text-transform:uppercase; color:var(--terra); font-weight:600 }
  .ledger-dash .res-card h4{ font-family:var(--serif); font-weight:500; font-size:20px; line-height:1.15; letter-spacing:-0.015em; margin:0; max-width:14ch; color:var(--ink) }
  .ledger-dash .res-card h4 em{ font-style:italic; color:var(--terra) }
  .ledger-dash .res-card .fmeta{ margin-top:auto; padding-top:14px; border-top:1px solid var(--rule); display:flex; justify-content:space-between; align-items:baseline; font-family:var(--mono); font-size:9.5px; letter-spacing:0.16em; text-transform:uppercase; color:var(--muted); font-weight:500 }
  .ledger-dash .res-card .fmeta .arrow{ font-family:var(--serif); font-style:italic; color:var(--terra); font-size:14px; letter-spacing:0; text-transform:none; font-weight:500 }

  .ledger-dash .safe-card{ background:var(--paper); border:1px solid var(--rule-strong); padding:0; display:grid; grid-template-columns:1.2fr 2fr auto; gap:0; align-items:stretch }
  .ledger-dash .safe-card .label{ padding:32px 36px; border-right:1px solid var(--rule); background:var(--paper-2); display:flex; flex-direction:column; gap:8px; justify-content:center }
  .ledger-dash .safe-card .label .lab{ font-family:var(--mono); font-size:10.5px; letter-spacing:0.22em; text-transform:uppercase; color:var(--terra); font-weight:600 }
  .ledger-dash .safe-card .label h3{ font-family:var(--serif); font-weight:500; font-size:34px; line-height:0.98; letter-spacing:-0.025em; margin:0; color:var(--ink) }
  .ledger-dash .safe-card .label h3 em{ font-style:italic; color:var(--terra) }
  .ledger-dash .safe-card .label .sub{ font-family:var(--serif); font-style:italic; font-size:15px; color:var(--muted); margin-top:4px }
  .ledger-dash .safe-card .grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:0 }
  .ledger-dash .safe-card .cell{ padding:28px 22px; border-right:1px solid var(--rule); display:flex; flex-direction:column; gap:8px; min-height:160px }
  .ledger-dash .safe-card .cell:last-child{ border-right:none }
  .ledger-dash .safe-card .cell .letter{ font-family:var(--serif); font-weight:500; font-style:italic; font-size:48px; line-height:0.9; letter-spacing:-0.03em; color:var(--terra) }
  .ledger-dash .safe-card .cell .word{ font-family:var(--mono); font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--ink); font-weight:700 }
  .ledger-dash .safe-card .cell .desc{ font-family:var(--serif); font-size:14.5px; line-height:1.4; color:var(--ink-2); margin-top:4px }
  .ledger-dash .safe-card .cta-col{ padding:32px; border-left:1px solid var(--rule); display:flex; flex-direction:column; justify-content:center; gap:10px; background:var(--paper-2); min-width:200px }
  .ledger-dash .safe-card .cta-col .meta{ font-family:var(--mono); font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--muted); font-weight:500 }

  @media (max-width:1080px){
    .ledger-dash .welcome .wgrid{ grid-template-columns:1fr; gap:32px }
    .ledger-dash .trio-grid{ grid-template-columns:1fr }
    .ledger-dash .vc{ border-right:none; border-bottom:1px solid var(--rule) }
    .ledger-dash .vc:last-child{ border-bottom:none }
    .ledger-dash .rep-card{ grid-template-columns:1fr }
    .ledger-dash .rep-card .demo{ border-left:none; border-top:1px solid var(--rule) }
    .ledger-dash .found-card{ grid-template-columns:1fr }
    .ledger-dash .found-card .feat{ border-left:none; border-top:1px solid rgba(244,241,231,0.14) }
    .ledger-dash .res-grid{ grid-template-columns:repeat(2,1fr) }
    .ledger-dash .safe-card{ grid-template-columns:1fr }
    .ledger-dash .safe-card .label{ border-right:none; border-bottom:1px solid var(--rule) }
    .ledger-dash .safe-card .cta-col{ border-left:none; border-top:1px solid var(--rule) }
  }
  @media (max-width:640px){
    .ledger-dash .res-grid{ grid-template-columns:1fr }
    .ledger-dash .safe-card .grid{ grid-template-columns:1fr }
    .ledger-dash .safe-card .cell{ border-right:none; border-bottom:1px solid var(--rule); min-height:auto }
    .ledger-dash .welcome{ padding:48px 0 40px }
    .ledger-dash .sec{ padding:48px 0 }
    .ledger-dash .rep-card .body, .ledger-dash .rep-card .demo{ padding:28px 24px }
    .ledger-dash .found-card .body, .ledger-dash .found-card .feat{ padding:32px 24px }
  }
`;
