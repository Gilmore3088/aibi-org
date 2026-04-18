// /courses/aibi-p — Course overview / preview page
// Server Component: compact hero + value props + course structure

import type { Metadata } from 'next';
import Link from 'next/link';
import { modules, PILLAR_META } from '@content/courses/aibi-p';
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

const VALUE_PROPS = [
  { stat: '9', label: 'Hands-on modules', detail: 'with AI sandbox exercises in every lesson' },
  { stat: '4', label: 'Competency pillars', detail: 'Awareness, Understanding, Creation, Application' },
  { stat: '1', label: 'Real credential', detail: 'earned by demonstrating proficiency, not passing a test' },
] as const;

export default async function CourseOverviewPage() {
  const enrollment = await getEnrollment();
  const completedModules = enrollment?.completed_modules ?? [];
  const currentModule = enrollment?.current_module ?? 1;
  const completedCount = completedModules.length;

  return (
    <div className="mx-auto px-8 lg:px-16 py-8">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link href="/courses" className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-terra)] transition-colors">
          Courses
        </Link>
        <span className="mx-2 text-[color:var(--color-ink)]/20">/</span>
        <span className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)]">AiBI-P</span>
      </nav>

      {/* Hero — tight, one line pitch, CTA, stats inline */}
      <section className="mb-8">
        <h1 className="font-serif text-3xl font-bold leading-tight text-[color:var(--color-ink)] mb-2">
          Banking AI <span className="text-[color:var(--color-terra)] italic">Practitioner</span>
        </h1>
        <p className="text-sm text-[color:var(--color-ink)]/75 mb-4 max-w-xl">
          Hands-on AI skills for every staff member. Build a real skill, earn a real credential.
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
            9 modules
          </span>
          <span className="font-mono text-[10px] text-[color:var(--color-slate)] uppercase tracking-wider">
            AI sandbox in every lesson
          </span>
          {completedCount > 0 && (
            <span className="font-mono text-[10px] text-[color:var(--color-terra)] uppercase tracking-wider tabular-nums">
              {completedCount}/{modules.length} complete
            </span>
          )}
        </div>
      </section>

      {/* Course Structure — unified pillar + module listing */}
      <section
        id="course-structure"
        className="bg-[color:var(--color-parch)] p-6 sm:p-8 border border-[color:var(--color-ink)]/10 rounded-[3px]"
      >
        <h2 className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-6">
          Course Structure
        </h2>

        <div className="space-y-6">
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

                <div className="space-y-0.5" role="list">
                  {pillarModules.map((mod) => {
                    const status = getModuleStatus(mod.number, completedModules, currentModule);
                    const isAccessible = status !== 'locked';

                    const row = (
                      <div
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-[2px] transition-colors ${
                          isAccessible ? 'hover:bg-[color:var(--color-linen)]' : 'opacity-40'
                        }`}
                        role="listitem"
                      >
                        <span className="w-4 shrink-0"><StatusIndicator status={status} /></span>
                        <span className="font-mono text-[10px] text-[color:var(--color-slate)] shrink-0">{mod.number}.</span>
                        <span className={`font-serif text-sm ${status === 'current' ? 'text-[color:var(--color-terra)] font-semibold' : 'text-[color:var(--color-ink)]'}`}>
                          {mod.title}
                        </span>
                        <span className="font-mono text-[9px] text-[color:var(--color-slate)] ml-auto hidden sm:block">{mod.estimatedMinutes} min</span>
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
