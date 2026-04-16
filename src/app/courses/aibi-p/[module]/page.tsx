// Dynamic module page — /courses/aibi-p/[module]
// Server Component: all content read from typed files at build time
// T-02-03: parseInt + getModuleByNumber + notFound() guards invalid params

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { modules, getModuleByNumber } from '@content/courses/aibi-p';
import { ModuleHeader } from '../_components/ModuleHeader';
import { ContentSection } from '../_components/ContentSection';
import { ContentTable } from '../_components/ContentTable';
import { ActivityFormShell } from '../_components/ActivityFormShell';

interface ModulePageParams {
  readonly params: { module: string };
}

export function generateStaticParams() {
  return modules.map((m) => ({ module: String(m.number) }));
}

export async function generateMetadata({ params }: ModulePageParams): Promise<Metadata> {
  const moduleNum = parseInt(params.module, 10);
  const mod = getModuleByNumber(moduleNum);
  if (!mod) {
    return { title: 'Module Not Found | AiBI-P' };
  }
  return {
    title: `Module ${mod.number}: ${mod.title} | AiBI-P`,
  };
}

export default function ModulePage({ params }: ModulePageParams) {
  const moduleNum = parseInt(params.module, 10);

  // T-02-03: Guard against invalid params (NaN, out of range, non-existent)
  if (isNaN(moduleNum) || moduleNum < 1 || moduleNum > 9) {
    notFound();
  }

  const mod = getModuleByNumber(moduleNum);
  if (!mod) {
    notFound();
  }

  const isLastModule = mod.number === 9;

  return (
    <>
      {/* Pillar-colored header band */}
      <ModuleHeader
        moduleNumber={mod.number}
        title={mod.title}
        pillar={mod.pillar}
        estimatedMinutes={mod.estimatedMinutes}
        keyOutput={mod.keyOutput}
      />

      {/* Content area */}
      <article className="max-w-4xl mx-auto px-6 lg:px-8 py-8">

        {/* Sections */}
        {mod.sections.map((section) => (
          <ContentSection key={section.id} section={section} />
        ))}

        {/* Tables — supplementary data after prose sections */}
        {mod.tables && mod.tables.length > 0 && (
          <div className="mt-4 mb-16">
            {mod.tables.map((table) => (
              <ContentTable key={table.id} table={table} />
            ))}
          </div>
        )}

        {/* Activities — at the bottom of the module */}
        {mod.activities.length > 0 && (
          <div className="mt-8">
            <h2 className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-6">
              Activities
            </h2>
            {mod.activities.map((activity) => (
              <ActivityFormShell key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {/* Module navigation footer */}
        <div className="flex items-center justify-between mt-16 pt-8 border-t border-[color:var(--color-parch-dark)]">
          <Link
            href="/courses/aibi-p"
            className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-dust)] hover:text-[color:var(--color-ink)] transition-colors"
          >
            Back to Overview
          </Link>

          {!isLastModule && (
            <Link
              href={`/courses/aibi-p/${mod.number + 1}`}
              className="inline-flex items-center gap-2 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] px-6 py-2.5 rounded-sm font-mono text-[11px] uppercase tracking-widest transition-colors"
            >
              Next Module
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          )}

          {isLastModule && (
            <span className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-dust)]">
              Course Complete
            </span>
          )}
        </div>
      </article>
    </>
  );
}
