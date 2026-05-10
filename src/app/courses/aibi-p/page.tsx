// /courses/aibi-p — Course overview / preview page
// Server Component: hero + outcomes + course structure

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  modules,
  PILLAR_META,
  aibiPCourseConfig,
  V4_AIBIP_MODULE_BY_NUMBER,
} from '@content/courses/aibi-p';
import type { Pillar } from '@content/courses/aibi-p';
import { getEnrollmentResult, isFetchError } from './_lib/getEnrollment';
import { getModuleStatus } from './_lib/courseProgress';
import type { ModuleStatus } from './_lib/courseProgress';

export const metadata: Metadata = {
  title: 'AiBI-Foundation — Banking AI Practitioner | The AI Banking Institute',
  description:
    'The Banking AI Practitioner course teaches every staff member at a community financial institution how to use AI tools safely, professionally, and with regulatory confidence.',
};

const PILLAR_ORDER: Pillar[] = ['awareness', 'understanding', 'creation', 'application'];

const LEARNER_OUTCOMES = [
  'Choose the right prompt strategy for the job',
  'Write safer, clearer prompts for daily banking work',
  'Summarize banking documents responsibly',
  'Review AI outputs for errors and unsupported claims',
  'Avoid entering sensitive data into public tools',
  'Use AI for communication, meetings, policy review, and productivity',
] as const;

function StatusIndicator({ status }: { readonly status: ModuleStatus }) {
  switch (status) {
    case 'completed':
      return <span className="text-[color:var(--color-sage)] font-mono text-xs" aria-label="Complete">&#10003;</span>;
    case 'current':
      return <span className="text-[color:var(--color-terra)] font-mono text-xs" aria-label="Current">&rarr;</span>;
    case 'locked':
      return <span className="text-[color:var(--color-ink)]/30 font-mono text-xs" aria-label="Locked">&middot;</span>;
  }
}

export default async function CourseOverviewPage() {
  const enrollmentResult = await getEnrollmentResult();
  const fetchFailed = isFetchError(enrollmentResult);
  const enrollment = fetchFailed ? null : enrollmentResult;
  const completedModules = enrollment?.completed_modules ?? [];
  // current_module is already normalized to >= 1 inside getEnrollment.
  const currentModule = enrollment?.current_module ?? 1;
  const completedCount = completedModules.length;

  return (
    <div className="mx-auto px-8 lg:px-16 py-8 max-w-6xl">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link href="/education" className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-terra)] transition-colors">
          Education
        </Link>
        <span className="mx-2 text-[color:var(--color-ink)]/20">/</span>
        <span className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)]">AiBI-Foundation</span>
      </nav>

      {/* Hero */}
      <section className="mb-12">
        <h1 className="font-serif text-5xl md:text-6xl leading-tight text-[color:var(--color-ink)]">
          Banking AI <span className="text-[color:var(--color-terra)] italic">Practitioner</span>
        </h1>
        <p className="mt-5 font-serif italic text-2xl leading-relaxed text-[color:var(--color-ink)]/80 max-w-3xl">
          {aibiPCourseConfig.promise}
        </p>
        <p className="mt-4 text-base text-[color:var(--color-ink)]/70 max-w-3xl leading-relaxed">
          In less than two weeks, learn how to write better, summarize faster,
          think clearer, and avoid risky AI mistakes.
        </p>

        {fetchFailed && (
          <p className="mt-6 border-l-2 border-[color:var(--color-error)] bg-[color:var(--color-error)]/5 px-4 py-3 text-sm text-[color:var(--color-ink)]">
            Couldn&apos;t load your progress right now.{' '}
            <Link href="/auth/login" className="underline">Sign in</Link> to resume,
            or refresh the page in a moment.
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href={`/courses/aibi-p/${currentModule}`}
            className="bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] px-6 py-3 rounded-[2px] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] transition-colors"
          >
            {completedCount > 0 ? 'Resume course' : 'Start course'} &rarr;
          </Link>
          {enrollment && (
            <Link
              href="/dashboard/toolbox?tab=guide"
              className="border border-[color:var(--color-ink)]/25 px-6 py-3 rounded-[2px] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] text-[color:var(--color-ink)] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] transition-colors"
            >
              Open Toolbox
            </Link>
          )}
        </div>

        <p className="mt-6 font-mono text-[11px] text-[color:var(--color-slate)] tabular-nums">
          12 modules &middot; {aibiPCourseConfig.estimatedMinutes} min total &middot;{' '}
          $295 per seat &middot; $199 per seat for 10+
          {completedCount > 0 && (
            <>
              {' '}&middot; <span className="text-[color:var(--color-terra)]">{completedCount}/{modules.length} complete</span>
            </>
          )}
        </p>
      </section>

      {/* Outcomes + Required outputs */}
      <section className="grid lg:grid-cols-[1fr_0.9fr] gap-8 mb-12">
        <div className="border border-[color:var(--color-ink)]/10 rounded-[3px] p-6">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            What you will be able to do
          </p>
          <ul className="space-y-3">
            {LEARNER_OUTCOMES.map((outcome) => (
              <li key={outcome} className="flex gap-3 text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 bg-[color:var(--color-parch)]">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            Required outputs
          </p>
          <div className="space-y-3">
            {aibiPCourseConfig.artifacts.map((artifact) => (
              <div key={artifact.id}>
                <h3 className="font-serif text-base text-[color:var(--color-ink)]">
                  {artifact.title}
                </h3>
                <p className="text-xs text-[color:var(--color-slate)] leading-relaxed">
                  {artifact.description}
                </p>
              </div>
            ))}
            <div>
              <h3 className="font-serif text-base text-[color:var(--color-ink)]">
                Final practical assessment
              </h3>
              <p className="text-xs text-[color:var(--color-slate)] leading-relaxed">
                Submit a reviewed work product package that demonstrates safe,
                practical AI use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Structure */}
      <section
        id="course-structure"
        className="bg-[color:var(--color-parch)] p-6 sm:p-8 border border-[color:var(--color-ink)]/10 rounded-[3px]"
      >
        <h2 className="font-serif text-3xl text-[color:var(--color-ink)] mb-2">
          Course structure
        </h2>
        <p className="text-sm text-[color:var(--color-slate)] leading-relaxed mb-8 max-w-2xl">
          Twelve modules grouped by pillar. Each module is roughly 20-40 minutes
          of learning, practice, and a single banking artifact you walk away with.
        </p>

        <div className="space-y-8">
          {PILLAR_ORDER.map((pillar) => {
            const meta = PILLAR_META[pillar];
            const pillarModules = modules.filter((m) => m.pillar === pillar);

            return (
              <div key={pillar}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: meta.colorVar }} aria-hidden="true" />
                  <h3 className="font-serif-sc text-[10px] uppercase tracking-[0.18em]" style={{ color: meta.colorVar }}>
                    {meta.label}
                  </h3>
                </div>

                <ul className="grid gap-4">
                  {pillarModules.map((mod) => {
                    const status = getModuleStatus(mod.number, completedModules, currentModule);
                    const isAccessible = status !== 'locked';
                    const expanded = V4_AIBIP_MODULE_BY_NUMBER.get(mod.number);

                    const row = (
                      <div
                        className={`border border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)] rounded-[3px] p-5 transition-colors ${
                          isAccessible ? 'hover:border-[color:var(--color-terra)]/40' : ''
                        }`}
                      >
                        <div className="flex flex-wrap items-start gap-3">
                          <span className="w-4 shrink-0 pt-1"><StatusIndicator status={status} /></span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                              <span className="font-mono text-[10px] text-[color:var(--color-slate)] shrink-0">
                                Module {mod.number}
                              </span>
                              <h4 className={`font-serif text-xl leading-tight ${status === 'current' ? 'text-[color:var(--color-terra)] font-semibold' : 'text-[color:var(--color-ink)]'}`}>
                                {mod.title}
                              </h4>
                              <span className="font-mono text-[9px] text-[color:var(--color-slate)] uppercase tracking-wider">
                                {mod.estimatedMinutes} min
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
                              {expanded?.goal ?? mod.keyOutput}
                            </p>
                          </div>
                        </div>

                        {expanded && (
                          <div className="mt-5 grid lg:grid-cols-[1.1fr_0.9fr] gap-5">
                            <div>
                              <p className="font-serif-sc text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] mb-3">
                                Includes
                              </p>
                              <div className="grid sm:grid-cols-2 gap-2">
                                {expanded.includes.map((item) => (
                                  <div key={item} className="flex gap-2 text-xs text-[color:var(--color-ink)]/70 leading-relaxed">
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)]/70 shrink-0" />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-3 text-xs text-[color:var(--color-slate)] leading-relaxed">
                              <div>
                                <p className="font-serif-sc text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/55 mb-1">
                                  Practice
                                </p>
                                <p>{expanded.practice}</p>
                              </div>
                              <div>
                                <p className="font-serif-sc text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/55 mb-1">
                                  Artifact
                                </p>
                                <p>{expanded.artifact}</p>
                              </div>
                              <div>
                                <p className="font-serif-sc text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/55 mb-1">
                                  Banking Boundary
                                </p>
                                <p>{expanded.bankingBoundary}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );

                    return (
                      <li key={mod.id}>
                        {isAccessible ? (
                          <Link href={`/courses/aibi-p/${mod.number}`} className="block rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)]">
                            {row}
                          </Link>
                        ) : (
                          row
                        )}
                      </li>
                    );
                  })}
                </ul>

                {pillar !== 'application' && (
                  <div className="mt-6 border-b border-[color:var(--color-ink)]/5" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-xs text-[color:var(--color-slate)]">
          More certifications launching soon: AiBI-S (Specialist) and AiBI-L (Leader).
        </p>
      </section>
    </div>
  );
}
