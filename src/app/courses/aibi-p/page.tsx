// /courses/aibi-p — Course overview page
// Server Component: unified pillar/module structure

import type { Metadata } from 'next';
import Link from 'next/link';
import { modules, PILLAR_META, PILLAR_DESCRIPTIONS } from '@content/courses/aibi-p';
import type { Pillar } from '@content/courses/aibi-p';
import { ProgressIndicator } from './_components/ProgressIndicator';
import { getEnrollment } from './_lib/getEnrollment';
import { getModuleStatus } from './_lib/courseProgress';
import type { ModuleStatus } from './_lib/courseProgress';

export const metadata: Metadata = {
  title: 'AiBI-P: Banking AI Practitioner | The AI Banking Institute',
  description:
    'The Banking AI Practitioner course teaches every staff member at a community financial institution how to use AI tools safely, professionally, and with regulatory confidence.',
};

const PILLAR_ORDER: Pillar[] = ['awareness', 'understanding', 'creation', 'application'];

function StatusIndicator({ status }: { readonly status: ModuleStatus }) {
  switch (status) {
    case 'completed':
      return (
        <span className="text-[color:var(--color-sage)] font-mono text-xs" aria-label="Complete">
          &#10003;
        </span>
      );
    case 'current':
      return (
        <span className="text-[color:var(--color-terra)] font-mono text-xs" aria-label="Current module">
          &#8594;
        </span>
      );
    case 'locked':
      return (
        <span className="text-[color:var(--color-ink)]/30 font-mono text-xs" aria-label="Locked">
          &#128274;
        </span>
      );
  }
}

export default async function CourseOverviewPage() {
  const enrollment = await getEnrollment();
  const completedModules = enrollment?.completed_modules ?? [];
  const currentModule = enrollment?.current_module ?? 1;

  return (
    <div className="mx-auto px-8 lg:px-16 py-16">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/courses"
          className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-terra)] transition-colors"
        >
          Courses
        </Link>
        <span className="mx-2 text-[color:var(--color-ink)]/20">/</span>
        <span className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)]">
          AiBI-P
        </span>
      </nav>

      {/* Hero section */}
      <section className="mb-24" aria-labelledby="course-heading">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-terra)]">
            AiBI-P
          </span>
          <div className="h-px w-8 bg-[color:var(--color-terra)]/30" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-slate)]">
            Banking AI Practitioner
          </span>
        </div>

        <h1
          id="course-heading"
          className="font-serif text-4xl lg:text-5xl font-bold leading-[1.05] mb-6 text-[color:var(--color-ink)]"
        >
          Banking AI<br />
          <span className="text-[color:var(--color-terra)] italic">Practitioner</span>
        </h1>

        <p className="font-serif italic text-lg text-[color:var(--color-dust)] max-w-xl leading-relaxed mb-8">
          Hands-on AI proficiency for every staff member at your institution.
          Build real skills, earn a real credential.
        </p>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/courses/aibi-p/${currentModule}`}
              className="bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] px-8 py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.15em] transition-colors flex items-center gap-3 font-mono focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
            >
              Resume Course
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <a
              href="#course-structure"
              className="border border-[color:var(--color-terra)]/20 text-[color:var(--color-ink)] px-8 py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-[color:var(--color-parch)] transition-colors font-mono focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
            >
              View Syllabus
            </a>
          </div>
          <ProgressIndicator
            completedModules={completedModules}
            totalModules={modules.length}
          />
        </div>
      </section>

      {/* Course Structure — unified pillar + module listing */}
      <section
        id="course-structure"
        className="bg-[color:var(--color-parch)] p-8 sm:p-12 border border-[color:var(--color-terra)]/10 rounded-sm"
        aria-labelledby="course-structure-heading"
      >
        <div className="mb-12">
          <h2
            id="course-structure-heading"
            className="font-serif text-4xl font-bold mb-2 text-[color:var(--color-ink)]"
          >
            Course <span className="italic">Structure</span>
          </h2>
          <div className="w-12 h-px bg-[color:var(--color-terra)] mb-4" aria-hidden="true" />
        </div>

        <div className="space-y-10">
          {PILLAR_ORDER.map((pillar) => {
            const meta = PILLAR_META[pillar];
            const description = PILLAR_DESCRIPTIONS[pillar];
            const pillarModules = modules.filter((m) => m.pillar === pillar);

            return (
              <div key={pillar}>
                {/* Pillar heading */}
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: meta.colorVar }}
                    aria-hidden="true"
                  />
                  <h3
                    className="font-serif-sc text-sm uppercase tracking-[0.18em] font-bold"
                    style={{ color: meta.colorVar }}
                  >
                    {meta.label}
                  </h3>
                </div>
                <p className="font-serif italic text-sm text-[color:var(--color-slate)] mb-4 max-w-2xl leading-relaxed">
                  {description}
                </p>

                {/* Module list */}
                <div className="space-y-1" role="list" aria-label={`${meta.label} modules`}>
                  {pillarModules.map((mod) => {
                    const status = getModuleStatus(mod.number, completedModules, currentModule);
                    const isAccessible = status !== 'locked';

                    const content = (
                      <div
                        className={`flex items-center gap-4 px-4 py-3 rounded-sm transition-colors ${
                          isAccessible
                            ? 'hover:bg-[color:var(--color-linen)]'
                            : 'opacity-50'
                        }`}
                        role="listitem"
                      >
                        <span className="w-5 shrink-0">
                          <StatusIndicator status={status} />
                        </span>
                        <span className="font-mono text-[11px] text-[color:var(--color-slate)] shrink-0 w-6">
                          {mod.number}.
                        </span>
                        <span className={`font-serif text-base ${
                          status === 'current'
                            ? 'text-[color:var(--color-terra)] font-semibold'
                            : 'text-[color:var(--color-ink)]'
                        }`}>
                          {mod.title}
                        </span>
                        <span className="font-mono text-[10px] text-[color:var(--color-slate)] ml-auto hidden sm:block shrink-0">
                          {mod.estimatedMinutes} min
                        </span>
                        <span className="font-serif italic text-xs text-[color:var(--color-dust)] ml-4 hidden md:block max-w-xs truncate">
                          {mod.keyOutput}
                        </span>
                      </div>
                    );

                    if (isAccessible) {
                      return (
                        <Link
                          key={mod.id}
                          href={`/courses/aibi-p/${mod.number}`}
                          className="block focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-1 rounded-sm"
                        >
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <div key={mod.id}>
                        {content}
                      </div>
                    );
                  })}
                </div>

                {/* Divider between pillars (except last) */}
                {pillar !== 'application' && (
                  <div className="mt-8 border-b border-[color:var(--color-terra)]/10" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
