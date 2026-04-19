// UnitStub — fallback renderer for units whose content isn't yet authored.
// Shows the same pillar-banded header (so the harness stays consistent) but
// the body is a clear "content coming" message. Lets testers walk the sidebar
// navigation end-to-end while we build out Unit 1.2 through 3.2.

import { CourseItemHeader } from '@/lib/course-harness/CourseItemHeader';
import type { ResolvedCourseItem, ResolvedCourseSection, CourseConfig } from '@/lib/course-harness/types';

interface UnitStubProps {
  readonly resolvedItem: ResolvedCourseItem;
  readonly resolvedSection: ResolvedCourseSection;
  readonly config: CourseConfig;
}

export function UnitStub({ resolvedItem, resolvedSection, config }: UnitStubProps) {
  return (
    <div>
      <CourseItemHeader
        item={resolvedItem}
        section={resolvedSection}
        config={config}
        estimatedMinutes={resolvedItem.estimatedMinutes}
        keyOutput="Coming soon"
      />
      <article className="mx-auto max-w-3xl px-8 lg:px-16 py-16 space-y-6">
        <p className="font-serif-sc text-[11px] uppercase tracking-[0.25em] text-[color:var(--color-ink)]/50">
          Unit scaffold
        </p>
        <h2 className="font-serif text-2xl text-[color:var(--color-ink)]">
          This unit is planned but not yet authored.
        </h2>
        <p className="text-[color:var(--color-ink)]/75 leading-relaxed">
          The course harness has every route ready — sidebar, header, tabs, AI routing. Only the unit&apos;s content (Learn / Practice / Apply beats + persona for Defend) hasn&apos;t been written yet.
        </p>
        <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 p-6 rounded-[3px]">
          <p className="text-sm font-mono text-[color:var(--color-slate)] mb-2">
            When this unit is authored it will follow the same 6-beat pattern as Unit 1.1:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-[color:var(--color-ink)]/80">
            <li>Learn — concept + worked banking example</li>
            <li>Practice — decision sim with data-tier classification</li>
            <li>Apply — write a 4–6 sentence proposal about your own workflow</li>
            <li>Defend — persona challenge memo + AI-driven follow-up</li>
            <li>Refine — rewrite after rubric feedback</li>
            <li>Capture — artifact to portfolio</li>
          </ol>
        </div>
      </article>
    </div>
  );
}
