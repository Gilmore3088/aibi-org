// /courses/aibi-p — Course overview / preview page
// Server Component: compact hero + value props + course structure

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  modules,
  PILLAR_META,
  aibiPCourseConfig,
  V4_AIBIP_MODULE_BY_NUMBER,
} from '@content/courses/aibi-p';
import type { Pillar } from '@content/courses/aibi-p';
import { getEnrollment } from './_lib/getEnrollment';
import { getModuleStatus } from './_lib/courseProgress';
import type { ModuleStatus } from './_lib/courseProgress';

export const metadata: Metadata = {
  title: 'AiBI-P: Banking AI Practitioner | The AI Banking Institute',
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

const COURSE_PHASES = [
  'AI for your workday',
  'What AI is and is not',
  'Prompting fundamentals',
  'AI work profile',
  'Projects and context',
  'Files and document workflows',
  'AI tools landscape',
  'Agents and workflow thinking',
  'Safe AI use in banking',
  'Role-based use cases',
  'Personal prompt library',
  'Final practitioner lab',
] as const;

const FOUNDATIONS = [
  'Six prompt strategies',
  'AI tools landscape',
  'What an LLM does',
  'Simple agents concept',
  'File-based workflows',
  'Context and memory',
  'AI personal system',
  'Regulatory boundaries',
] as const;

function StatusIndicator({ status }: { readonly status: ModuleStatus }) {
  switch (status) {
    case 'completed':
      return <span className="text-[color:var(--color-sage)] font-mono text-xs" aria-label="Complete">&#10003;</span>;
    case 'current':
      return <span className="text-[color:var(--color-terra)] font-mono text-xs" aria-label="Current">&#8594;</span>;
    case 'locked':
      return <span className="text-[color:var(--color-ink)]/30 font-mono text-xs" aria-label="Locked">&#128274;</span>;
  }
}

export default async function CourseOverviewPage() {
  const enrollment = await getEnrollment();
  const completedModules = enrollment?.completed_modules ?? [];
  // current_module is already normalized to >= 1 inside getEnrollment.
  const currentModule = enrollment?.current_module ?? 1;
  const completedCount = completedModules.length;

  return (
    <div className="mx-auto px-8 lg:px-16 py-8">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link href="/education" className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-terra)] transition-colors">
          Education
        </Link>
        <span className="mx-2 text-[color:var(--color-ink)]/20">/</span>
        <span className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)]">AiBI-P</span>
      </nav>

      {/* Hero — tight, one line pitch, CTA, stats inline */}
      <section className="mb-8">
        <h1 className="font-serif text-3xl font-bold leading-tight text-[color:var(--color-ink)] mb-2">
          Banking AI <span className="text-[color:var(--color-terra)] italic">Practitioner</span>
        </h1>
        <p className="text-sm text-[color:var(--color-ink)]/75 mb-4 max-w-2xl">
          {aibiPCourseConfig.promise} In less than two weeks, learn how to
          write better, summarize faster, think clearer, and avoid risky AI
          mistakes.
        </p>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Link
            href={`/courses/aibi-p/${currentModule}`}
            className="bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] px-5 py-2.5 rounded-[2px] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] transition-colors flex items-center gap-2"
          >
            {completedCount > 0 ? 'Resume' : 'Start Course'}
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <span className="font-mono text-[10px] text-[color:var(--color-slate)] uppercase tracking-wider">
            12 modules
          </span>
          <span className="font-mono text-[10px] text-[color:var(--color-slate)] uppercase tracking-wider">
            Learn / Practice / Apply
          </span>
          <span className="font-mono text-[10px] text-[color:var(--color-slate)] uppercase tracking-wider">
            {aibiPCourseConfig.estimatedMinutes} min total
          </span>
          {completedCount > 0 && (
            <span className="font-mono text-[10px] text-[color:var(--color-terra)] uppercase tracking-wider tabular-nums">
              {completedCount}/{modules.length} complete
            </span>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-[0.8fr_1.2fr] gap-6 mb-8 border border-[color:var(--color-terra)]/20 bg-[color:var(--color-parch)] rounded-[3px] p-6">
        <div>
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            Pricing
          </p>
          <h2 className="font-serif text-3xl text-[color:var(--color-ink)] leading-tight">
            AiBI-P Practitioner
          </h2>
          <div className="mt-4 space-y-2">
            <p className="font-mono text-sm text-[color:var(--color-ink)] tabular-nums">
              $99 per individual
            </p>
            <p className="font-mono text-sm text-[color:var(--color-ink)] tabular-nums">
              $79 per user for 10+ seats
            </p>
          </div>
        </div>
        <div>
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-3">
            Includes
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              '12 modules',
              'Practice reps',
              'Prompt library',
              'Artifacts',
              'Certification path',
              'AiBI-S / AiBI-L coming soon',
            ].map((item) => (
              <div key={item} className="flex gap-3 text-sm text-[color:var(--color-ink)]/75">
                <span className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-[1fr_0.9fr] gap-8 mb-8">
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

      <section className="mb-8 border-y border-[color:var(--color-ink)]/10 py-5">
        <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-3">
          Course phases
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COURSE_PHASES.map((phase, idx) => (
            <div key={phase} className="flex sm:block items-baseline gap-3">
              <p className="font-mono text-[11px] text-[color:var(--color-terra)] tabular-nums">
                {String(idx + 1).padStart(2, '0')}
              </p>
              <p className="font-serif text-sm text-[color:var(--color-ink)] leading-tight">
                {phase}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 border border-[color:var(--color-ink)]/10 rounded-[3px] p-6">
        <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
          Foundations included
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FOUNDATIONS.map((foundation) => (
            <div key={foundation} className="flex gap-3 text-sm text-[color:var(--color-ink)]/75">
              <span className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
              <span>{foundation}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Course Structure — expanded V4 foundation module listing */}
      <section
        id="course-structure"
        className="bg-[color:var(--color-parch)] p-6 sm:p-8 border border-[color:var(--color-ink)]/10 rounded-[3px]"
      >
        <h2 className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-6">
          Course Structure
        </h2>

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

                <div className="grid gap-4" role="list">
                  {pillarModules.map((mod) => {
                    const status = getModuleStatus(mod.number, completedModules, currentModule);
                    const isAccessible = status !== 'locked';
                    const expanded = V4_AIBIP_MODULE_BY_NUMBER.get(mod.number);

                    const row = (
                      <div
                        className={`border border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)] rounded-[3px] p-5 transition-colors ${
                          isAccessible ? 'hover:border-[color:var(--color-terra)]/40' : ''
                        }`}
                        role="listitem"
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

                    return isAccessible ? (
                      <Link key={mod.id} href={`/courses/aibi-p/${mod.number}`} className="block rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)]">
                        {row}
                      </Link>
                    ) : (
                      <div key={mod.id}>{row}</div>
                    );
                  })}
                </div>

                {pillar !== 'application' && (
                  <div className="mt-6 border-b border-[color:var(--color-ink)]/5" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
