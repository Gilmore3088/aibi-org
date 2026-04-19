// /aibi-s-preview/ops — Track overview page
// Derives all structure from aibiSConfig; no hardcoded UNITS array.

import type { Metadata } from 'next';
import Link from 'next/link';
import { aibiSConfig } from '@/../content/courses/aibi-s/course.config';
import { fetchAibiSProgress } from '../_lib/progress';
import { mergeProgress } from '@/lib/course-harness/merge';
import type { ItemStatus } from '@/lib/course-harness/types';

export const metadata: Metadata = {
  title: 'AiBI-S /Ops: Operations Specialist | The AI Banking Institute',
  description:
    'The /Ops role track of the Banking AI Specialist course teaches department managers to deploy AI to their team, measure the impact, and defend it under pressure.',
};

function StatusIndicator({ status }: { readonly status: ItemStatus }) {
  switch (status) {
    case 'completed':
      return <span className="text-[color:var(--color-sage)] font-mono text-xs" aria-label="Complete">&#10003;</span>;
    case 'current':
      return <span className="font-mono text-xs" style={{ color: 'var(--color-cobalt)' }} aria-label="Current">&#8594;</span>;
    case 'locked':
      return <span className="text-[color:var(--color-ink)]/30 font-mono text-xs" aria-label="Locked">&#128274;</span>;
    case 'coming-soon':
      return <span className="text-[color:var(--color-ink)]/30 font-mono text-[9px] uppercase tracking-wider" aria-label="Coming soon">Soon</span>;
  }
}

export default async function OpsTrackOverviewPage() {
  const progress = await fetchAibiSProgress();
  const view = mergeProgress(aibiSConfig, progress);

  const accentColor = view.config.brand.accentColorVar;
  const itemLabel = view.config.terminology.itemLabel;
  const allItems = view.sections.flatMap((s) => s.items);
  const completedCount = view.completedCount;
  const firstLiveHref =
    allItems.find((i) => !i.isComingSoon)?.href ?? '/aibi-s-preview';

  return (
    <div className="mx-auto px-8 lg:px-16 py-8">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          href="/education"
          className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-cobalt)] transition-colors"
        >
          Education
        </Link>
        <span className="mx-2 text-[color:var(--color-ink)]/20">/</span>
        <Link
          href="/aibi-s-preview"
          className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-cobalt)] transition-colors"
        >
          AiBI-S
        </Link>
        <span className="mx-2 text-[color:var(--color-ink)]/20">/</span>
        <span
          className="font-serif-sc text-[11px] uppercase tracking-[0.18em]"
          style={{ color: accentColor }}
        >
          /Ops
        </span>
      </nav>

      {/* Hero */}
      <section className="mb-8">
        <h1 className="font-serif text-3xl font-bold leading-tight text-[color:var(--color-ink)] mb-2">
          Banking AI{' '}
          <span className="italic" style={{ color: accentColor }}>
            Specialist
          </span>{' '}
          — Operations
        </h1>
        <p className="text-sm text-[color:var(--color-ink)]/75 mb-4 max-w-xl">
          Deploy AI to your department. Measure it. Defend it under pressure from your Department Head, Compliance Liaison, and peers.
        </p>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Link
            href={firstLiveHref}
            className="hover:opacity-90 text-[color:var(--color-linen)] px-5 py-2.5 rounded-[2px] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] transition-colors flex items-center gap-2"
            style={{ backgroundColor: accentColor }}
          >
            {completedCount > 0 ? 'Resume' : 'Start Track'}
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <span className="font-mono text-[10px] text-[color:var(--color-slate)] uppercase tracking-wider">
            {view.totalItemCount} {itemLabel.toLowerCase()}{view.totalItemCount === 1 ? '' : 's'} available in prototype
          </span>
          <span className="font-mono text-[10px] text-[color:var(--color-slate)] uppercase tracking-wider">
            Persona-driven defense
          </span>
          {completedCount > 0 && (
            <span
              className="font-mono text-[10px] uppercase tracking-wider tabular-nums"
              style={{ color: accentColor }}
            >
              {completedCount}/{allItems.length} complete
            </span>
          )}
        </div>
      </section>

      {/* Track Structure */}
      <section
        id="track-structure"
        className="bg-[color:var(--color-parch)] p-6 sm:p-8 border border-[color:var(--color-ink)]/10 rounded-[3px]"
      >
        <h2 className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-6">
          Track Structure
        </h2>

        <div className="space-y-6">
          {view.sections.map((section, sectionIdx) => {
            const sectionColor = section.colorVar ?? accentColor;

            return (
              <div key={section.id}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: sectionColor }} aria-hidden="true" />
                  <h3
                    className="font-serif-sc text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: sectionColor }}
                  >
                    {section.label}
                  </h3>
                </div>

                <div className="space-y-0.5" role="list">
                  {section.items.map((item) => {
                    const isAccessible = item.status !== 'locked' && item.status !== 'coming-soon';

                    const row = (
                      <div
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-[2px] transition-colors ${
                          isAccessible ? 'hover:bg-[color:var(--color-linen)]' : 'opacity-40'
                        }`}
                        role="listitem"
                      >
                        <span className="w-4 shrink-0"><StatusIndicator status={item.status} /></span>
                        <span className="font-mono text-[10px] text-[color:var(--color-slate)] shrink-0">{item.number}.</span>
                        <span
                          className={`font-serif text-sm ${item.status === 'current' ? 'font-semibold' : 'text-[color:var(--color-ink)]'}`}
                          style={item.status === 'current' ? { color: accentColor } : undefined}
                        >
                          {item.title}
                        </span>
                        {item.estimatedMinutes !== undefined && (
                          <span className="font-mono text-[9px] text-[color:var(--color-slate)] ml-auto hidden sm:block">
                            {item.estimatedMinutes} min
                          </span>
                        )}
                      </div>
                    );

                    return isAccessible ? (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="block rounded-[2px] focus:outline-none focus:ring-2"
                        style={{ ['--tw-ring-color' as string]: accentColor }}
                      >
                        {row}
                      </Link>
                    ) : (
                      <div key={item.id}>{row}</div>
                    );
                  })}
                </div>

                {sectionIdx < view.sections.length - 1 && (
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
