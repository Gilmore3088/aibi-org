// /courses/aibi-p — Course overview / preview page
// Server Component: compact hero + value props + course structure

import type { Metadata } from 'next';
import Link from 'next/link';
import { modules, PILLAR_META, PILLAR_DESCRIPTIONS } from '@content/courses/aibi-p';
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

      {/* Compact hero — problem + value + CTA in one tight block */}
      <section className="mb-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          {/* Left: title + pitch */}
          <div className="flex-1 max-w-2xl">
            <h1 className="font-serif text-3xl lg:text-4xl font-bold leading-tight text-[color:var(--color-ink)] mb-3">
              Banking AI <span className="text-[color:var(--color-terra)] italic">Practitioner</span>
            </h1>
            <p className="text-base text-[color:var(--color-ink)]/80 leading-relaxed mb-4">
              Your staff already use AI. The question is whether they use it safely,
              professionally, and in a way your examiners can defend. This course
              gives every banker at your institution the skills to do exactly that.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/courses/aibi-p/${currentModule}`}
                className="bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] px-6 py-3 rounded-[2px] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] transition-colors flex items-center gap-2"
              >
                {completedCount > 0 ? 'Resume Course' : 'Start Course'}
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              {completedCount > 0 && (
                <span className="font-mono text-xs text-[color:var(--color-slate)] self-center tabular-nums">
                  {completedCount}/{modules.length} complete
                </span>
              )}
            </div>
          </div>

          {/* Right: value props */}
          <div className="flex flex-col gap-4 lg:min-w-[280px]">
            {VALUE_PROPS.map((prop) => (
              <div key={prop.label} className="flex items-start gap-3">
                <span className="font-mono text-2xl tabular-nums text-[color:var(--color-terra)] leading-none mt-0.5">
                  {prop.stat}
                </span>
                <div>
                  <p className="font-sans text-sm font-semibold text-[color:var(--color-ink)]">
                    {prop.label}
                  </p>
                  <p className="font-sans text-xs text-[color:var(--color-slate)]">
                    {prop.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you walk away with */}
      <section className="mb-10 border-y border-[color:var(--color-ink)]/10 py-6">
        <div className="flex flex-wrap gap-x-12 gap-y-4">
          {[
            'A governed, repeatable AI skill you built yourself',
            'Data classification fluency your compliance team will trust',
            'A portfolio-ready work product reviewed against a professional rubric',
            'The AiBI-P credential for your institution and your LinkedIn',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 flex-1 min-w-[240px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-terra)] mt-1.5 shrink-0" aria-hidden="true" />
              <p className="font-sans text-sm text-[color:var(--color-ink)]/80 leading-snug">{item}</p>
            </div>
          ))}
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

        <div className="space-y-8">
          {PILLAR_ORDER.map((pillar) => {
            const meta = PILLAR_META[pillar];
            const description = PILLAR_DESCRIPTIONS[pillar];
            const pillarModules = modules.filter((m) => m.pillar === pillar);

            return (
              <div key={pillar}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: meta.colorVar }} aria-hidden="true" />
                  <h3 className="font-serif-sc text-xs uppercase tracking-[0.18em] font-bold" style={{ color: meta.colorVar }}>
                    {meta.label}
                  </h3>
                </div>
                <p className="font-serif italic text-xs text-[color:var(--color-slate)] mb-3 max-w-xl">
                  {description.split('.')[0]}.
                </p>

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
