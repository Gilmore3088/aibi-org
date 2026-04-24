'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { getUserDataWithSupabaseFallback, type UserData } from '@/lib/user-data';
import { getTier } from '@content/assessments/v1/scoring';
import { getTierV2 } from '@content/assessments/v2/scoring';
import { modules } from '@content/courses/aibi-p';
import {
  AIBI_P_ARTIFACTS,
  AIBI_P_CERTIFICATE_REQUIREMENTS,
  getDailyPracticeRep,
} from '@content/practice-reps/aibi-p';

function getReadinessDisplay(readiness: NonNullable<UserData['readiness']>) {
  const isV2 =
    readiness.version === 'v2' ||
    readiness.maxScore === 48 ||
    readiness.answers.length === 12;
  const maxScore = readiness.maxScore ?? (isV2 ? 48 : 32);

  try {
    const tier = isV2 ? getTierV2(readiness.score) : getTier(readiness.score);
    return { tier, maxScore };
  } catch {
    return {
      tier: {
        id: readiness.tierId,
        label: readiness.tierLabel,
        colorVar: 'var(--color-terra)',
        headline: 'Your readiness result is saved.',
      },
      maxScore,
    };
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserDataWithSupabaseFallback()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const dailyRep = useMemo(() => getDailyPracticeRep(), []);

  if (loading) return null;

  if (!user) {
    return (
      <main className="px-6 py-14 md:py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            Learner Dashboard
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            Start with your AI readiness score.
          </h1>
          <p className="text-lg text-[color:var(--color-ink)]/75 leading-relaxed">
            Take the assessment to unlock a practical next step, your first
            practice rep, and the AiBI-P learning path.
          </p>
          <Link
            href="/assessment"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
          >
            Take the Free Assessment
          </Link>
        </div>
      </main>
    );
  }

  const display = user.readiness ? getReadinessDisplay(user.readiness) : null;
  const tier = display?.tier ?? null;
  const maxScore = display?.maxScore ?? 48;
  const completedModules = 0;
  const currentModule = modules[0];
  const progressPct = Math.round((completedModules / modules.length) * 100);

  return (
    <main className="px-6 py-10 md:py-14">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="grid lg:grid-cols-[1.4fr_0.8fr] gap-8 items-end border-b border-[color:var(--color-ink)]/10 pb-8">
          <div>
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
              Learner Command Center
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
              Welcome back.
            </h1>
            <p className="text-[color:var(--color-slate)] mt-2">{user.email}</p>
            <p className="text-base text-[color:var(--color-ink)]/75 mt-5 max-w-2xl leading-relaxed">
              You are currently at Module {currentModule.number}:{' '}
              {currentModule.title}. Your next win is a short lesson, one
              practice rep, and one useful artifact.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-stretch">
            <Link
              href={`/courses/aibi-p/${currentModule.number}`}
              className="text-center px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
            >
              Continue Lesson
            </Link>
            <Link
              href="/courses/aibi-p"
              className="text-center px-6 py-3 border border-[color:var(--color-ink)]/25 text-[color:var(--color-ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] transition-colors"
            >
              Practice for 5 Minutes
            </Link>
          </div>
        </header>

        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <article className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 md:p-8">
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
              Today&apos;s AI Rep
            </p>
            <h2 className="font-serif text-3xl text-[color:var(--color-ink)] leading-tight">
              {dailyRep.title}
            </h2>
            <p className="text-sm text-[color:var(--color-ink)]/75 mt-3 leading-relaxed">
              {dailyRep.scenario}
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <MiniMetric label="Skill" value={dailyRep.skill} />
              <MiniMetric label="Time" value={`${dailyRep.timeEstimateMinutes} min`} />
              <MiniMetric label="Safety" value={dailyRep.safetyLevel.toUpperCase()} />
            </div>
            <div className="mt-6 border-t border-[color:var(--color-ink)]/10 pt-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-slate)] mb-2">
                Starter prompt
              </p>
              <p className="font-mono text-sm leading-relaxed text-[color:var(--color-ink)] bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/10 rounded-[2px] p-4">
                {dailyRep.starterPrompt}
              </p>
            </div>
          </article>

          <article className="border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 md:p-8">
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
              Course Progress
            </p>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl text-[color:var(--color-ink)]">
                  AiBI-P
                </h2>
                <p className="text-sm text-[color:var(--color-slate)] mt-1">
                  Banking AI Practitioner
                </p>
              </div>
              <p className="font-mono text-xl text-[color:var(--color-terra)] tabular-nums">
                {completedModules}/{modules.length}
              </p>
            </div>
            <div className="mt-6 h-2 bg-[color:var(--color-ink)]/10 rounded-[1px] overflow-hidden">
              <div
                className="h-full bg-[color:var(--color-terra)]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <ul className="mt-6 space-y-3">
              {AIBI_P_CERTIFICATE_REQUIREMENTS.map((requirement, idx) => (
                <li
                  key={requirement.id}
                  className="flex items-start gap-3 text-sm text-[color:var(--color-ink)]/75"
                >
                  <span className="mt-1 h-2 w-2 rounded-sm bg-[color:var(--color-ink)]/20" />
                  <span>
                    <span className="font-medium text-[color:var(--color-ink)]">
                      {idx === 0 ? 'Next: ' : ''}
                      {requirement.label}
                    </span>
                    {' - '}
                    {requirement.description}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <DashboardPanel title="Your AI Readiness">
            {user.readiness && tier ? (
              <>
                <p
                  className="font-serif text-3xl leading-none"
                  style={{ color: tier.colorVar }}
                >
                  {tier.label}
                </p>
                <p className="font-mono text-sm tabular-nums text-[color:var(--color-ink)] mt-2">
                  {user.readiness.score}/{maxScore}
                </p>
                <p className="text-sm text-[color:var(--color-slate)] mt-3 leading-relaxed">
                  {tier.headline}
                </p>
                <Link
                  href="/assessment"
                  className="inline-block mt-4 font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] border-b border-[color:var(--color-terra)]"
                >
                  Retake assessment
                </Link>
              </>
            ) : (
              <Link
                href="/assessment"
                className="inline-block px-4 py-2 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px]"
              >
                Take assessment
              </Link>
            )}
          </DashboardPanel>

          <DashboardPanel title="Saved Prompts">
            <p className="font-serif text-xl text-[color:var(--color-ink)]">
              Start with role prompts
            </p>
            <p className="text-sm text-[color:var(--color-slate)] mt-3 leading-relaxed">
              Save reusable prompts from the library as you build your personal
              AI toolkit.
            </p>
            <Link
              href="/courses/aibi-p/prompt-library"
              className="inline-block mt-4 font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] border-b border-[color:var(--color-terra)]"
            >
              Open prompt library
            </Link>
          </DashboardPanel>

          <DashboardPanel title="Recommended Path">
            <p className="font-serif text-xl text-[color:var(--color-ink)]">
              Begin with a practical win
            </p>
            <p className="text-sm text-[color:var(--color-slate)] mt-3 leading-relaxed">
              Complete Module 1, then do the rewrite-for-clarity rep and save
              your first prompt template.
            </p>
            <Link
              href="/courses/aibi-p/1"
              className="inline-block mt-4 font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] border-b border-[color:var(--color-terra)]"
            >
              Start Module 1
            </Link>
          </DashboardPanel>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-2">
                Artifacts
              </p>
              <h2 className="font-serif text-3xl text-[color:var(--color-ink)]">
                Useful outputs you can revisit
              </h2>
            </div>
            <Link
              href="/courses/aibi-p/toolkit"
              className="hidden sm:inline-block font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] border-b border-[color:var(--color-terra)]"
            >
              Open toolkit
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {AIBI_P_ARTIFACTS.map((artifact, idx) => (
              <article
                key={artifact.id}
                className="border border-[color:var(--color-ink)]/10 rounded-[3px] p-5 bg-[color:var(--color-linen)]"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-3">
                  {idx === 0 ? 'Available' : idx === 1 ? 'In progress' : 'Upcoming'} · Module {artifact.moduleNumber}
                </p>
                <h3 className="font-serif text-lg text-[color:var(--color-ink)] leading-tight">
                  {artifact.title}
                </h3>
                <p className="text-xs text-[color:var(--color-slate)] mt-3 leading-relaxed">
                  {artifact.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-[color:var(--color-ink)]/10 pt-8">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            SAFE Rule
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              ['Strip sensitive data', 'Remove customer and account details before prompting.'],
              ['Ask clearly', 'Give AI a role, task, format, and constraints.'],
              ['Fact-check outputs', 'Verify citations, claims, numbers, and policy language.'],
              ['Escalate risky decisions', 'Keep credit, legal, compliance, and PII decisions with humans.'],
            ].map(([title, body]) => (
              <div key={title} className="border-l-2 border-[color:var(--color-terra)] pl-4">
                <h3 className="font-serif text-lg text-[color:var(--color-ink)]">{title}</h3>
                <p className="text-xs text-[color:var(--color-slate)] mt-2 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function MiniMetric({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
        {label}
      </p>
      <p className="font-serif text-base text-[color:var(--color-ink)] mt-1 leading-tight">
        {value}
      </p>
    </div>
  );
}

function DashboardPanel({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <article className="border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 bg-[color:var(--color-parch)]">
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
        {title}
      </p>
      {children}
    </article>
  );
}
