// /courses/aibi-p — Course overview page
// Server Component: static pillar cards + module map

import type { Metadata } from 'next';
import Link from 'next/link';
import { modules, PILLAR_META, PILLAR_DESCRIPTIONS } from '@content/courses/aibi-p';
import type { Pillar } from '@content/courses/aibi-p';
import { getRolePath } from '@content/courses/aibi-p/role-paths';
import { PillarCard } from './_components/PillarCard';
import { ModuleMapItem } from './_components/ModuleMapItem';
import { ProgressIndicator } from './_components/ProgressIndicator';
import { RolePathCard } from './_components/RolePathCard';
import { getEnrollment } from './_lib/getEnrollment';
import { getModuleStatus, getPillarStatus } from './_lib/courseProgress';
import { getRoleSpotlight } from './_lib/contentRouting';

export const metadata: Metadata = {
  title: 'AiBI-P: Banking AI Practitioner | The AI Banking Institute',
  description:
    'The Banking AI Practitioner course teaches every staff member at a community financial institution how to use AI tools safely, professionally, and with regulatory confidence.',
};

const PILLAR_ORDER: Pillar[] = ['awareness', 'understanding', 'creation', 'application'];

export default async function CourseOverviewPage() {
  const enrollment = await getEnrollment();
  const completedModules = enrollment?.completed_modules ?? [];
  const currentModule = enrollment?.current_module ?? 1;

  const learnerRole =
    enrollment?.onboarding_answers
      ? getRoleSpotlight(enrollment.onboarding_answers)
      : null;
  const rolePath = learnerRole ? getRolePath(learnerRole) : null;

  const pillarModuleCounts = PILLAR_ORDER.reduce<Record<Pillar, number>>(
    (acc, pillar) => {
      acc[pillar] = modules.filter((m) => m.pillar === pillar).length;
      return acc;
    },
    { awareness: 0, understanding: 0, creation: 0, application: 0 },
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16">

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
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-dust)]">
            Banking AI Practitioner
          </span>
        </div>

        <h1
          id="course-heading"
          className="font-serif text-5xl lg:text-6xl font-bold leading-[1.05] mb-8 text-[color:var(--color-ink)]"
        >
          Banking AI<br />
          <span className="text-[color:var(--color-terra)] italic">Practitioner</span>
        </h1>

        <p className="font-serif italic text-lg text-[color:var(--color-slate)] max-w-xl leading-relaxed mb-6">
          Nine modules across four pillars. Every community bank and credit union staff member who
          completes this course earns the AiBI-P credential — not for memorizing definitions, but for
          demonstrating real proficiency.
        </p>

        <div className="mb-10">
          <ProgressIndicator
            completedModules={completedModules}
            totalModules={modules.length}
          />
        </div>

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
            href="#module-map-heading"
            className="border border-[color:var(--color-terra)]/20 text-[color:var(--color-ink)] px-8 py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-[color:var(--color-parch)] transition-colors font-mono focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
          >
            View Syllabus
          </a>
        </div>
      </section>

      {/* Role-specific learning path — only shown when onboarding role is captured */}
      {rolePath && <RolePathCard rolePath={rolePath} />}

      {/* Four Pillars */}
      <section className="mb-24" aria-labelledby="pillars-heading">
        <div className="flex justify-between items-end mb-12 border-b border-[color:var(--color-terra)]/10 pb-6">
          <div>
            <h2
              id="pillars-heading"
              className="font-serif text-4xl font-bold mb-2 text-[color:var(--color-ink)]"
            >
              The Four <span className="italic">Foundations</span>
            </h2>
            <p className="font-serif italic text-[color:var(--color-slate)] text-sm">
              Strategic pillars of the AiBI-P Framework
            </p>
          </div>
          <span
            className="font-mono text-[10px] tracking-[0.3em] text-[color:var(--color-dust)] hidden md:block"
            aria-hidden="true"
          >
            SCIENTIA POTENTIA EST
          </span>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[color:var(--color-terra)]/10 border border-[color:var(--color-terra)]/10 rounded-sm overflow-hidden"
          role="list"
          aria-label="Course pillars"
        >
          {PILLAR_ORDER.map((pillar) => {
            const meta = PILLAR_META[pillar];
            const status = getPillarStatus(pillar, modules, completedModules);
            return (
              <div key={pillar} role="listitem">
                <PillarCard
                  pillar={pillar}
                  label={meta.label}
                  colorVar={meta.colorVar}
                  description={PILLAR_DESCRIPTIONS[pillar]}
                  moduleCount={pillarModuleCounts[pillar]}
                  status={status}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Module Map */}
      <section
        className="bg-[color:var(--color-parch)] p-8 sm:p-12 border border-[color:var(--color-terra)]/10 rounded-sm"
        aria-labelledby="module-map-heading"
      >
        <div className="mb-12">
          <h2
            id="module-map-heading"
            className="font-serif text-4xl font-bold mb-2 text-[color:var(--color-ink)]"
          >
            The Module <span className="italic">Map</span>
          </h2>
          <div className="w-12 h-px bg-[color:var(--color-terra)] mb-4" aria-hidden="true" />
          <p className="font-serif italic text-[color:var(--color-slate)] text-sm">
            Sequential mastery of the AiBI-P curriculum
          </p>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12"
          role="list"
          aria-label="Course modules"
        >
          {modules.map((mod) => {
            const status = getModuleStatus(mod.number, completedModules, currentModule);
            return (
              <div key={mod.id} role="listitem">
                <ModuleMapItem module={mod} status={status} />
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
