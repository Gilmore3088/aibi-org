// Scroll-through article body — anchored sections for each sub-task
// (Takeaway / Sandbox / Submit / Saved artifact). Driven by the
// module page's already-prepared inputs.

import type { Activity, ExpandedModule, ContentTable as ContentTableData } from '@content/courses/foundation-program';
import { ContentTable } from '@/components/lms/ContentTable';
import { LearnSection } from '../../_components/LearnSection';
import { ModuleContentClient } from '../../_components/ModuleContentClient';
import { AIPracticeSandbox } from '@/components/AIPracticeSandbox';
import { SANDBOX_CONFIGS } from '@content/sandbox-data/foundation-program';
import { MiniTutorialList } from '../../_components/MiniTutorialList';
import {
  M3_TUTORIALS,
  M7_TUTORIALS,
} from '@content/courses/foundation-program/prompt-library';
import { CollapsibleBoundary } from './CollapsibleBoundary';
import { BankingBoundaryGrid } from './BankingBoundaryGrid';
import { SavedArtifactCard } from './SavedArtifactCard';
import { SECTION_H2_STYLE } from './moduleStyles';
import type { LearnerRole } from '@/types/course';

interface ModuleArticleBodyProps {
  readonly moduleNum: number;
  readonly keyOutput: string;
  readonly expandedModule: ExpandedModule | undefined;
  readonly moduleActivities: readonly Activity[];
  readonly moduleTables: readonly ContentTableData[] | undefined;
  readonly enrollmentId: string;
  readonly isLastModule: boolean;
  readonly isAlreadyCompleted: boolean;
  readonly learnerRole: LearnerRole;
  readonly existingResponses: Record<string, Record<string, string>>;
  readonly takeawayMin: number;
  readonly sandboxMin: number;
  readonly submitMin: number;
  readonly hasSandbox: boolean;
}

export function ModuleArticleBody({
  moduleNum,
  keyOutput,
  expandedModule,
  moduleActivities,
  moduleTables,
  enrollmentId,
  isLastModule,
  isAlreadyCompleted,
  learnerRole,
  existingResponses,
  takeawayMin,
  sandboxMin,
  submitMin,
  hasSandbox,
}: ModuleArticleBodyProps) {
  return (
    <article style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 36px 80px' }}>
      <section
        id="st-takeaway"
        aria-labelledby="st-takeaway-h"
        style={{ scrollMarginTop: 160, paddingTop: 12 }}
      >
        <h2 id="st-takeaway-h" style={SECTION_H2_STYLE}>
          Takeaway · {takeawayMin} min
        </h2>
        <LearnSection
          sections={expandedModule?.sections ?? []}
          keyTakeaways={expandedModule?.takeaways}
          moduleNumber={moduleNum}
        />
        <CollapsibleBoundary defaultOpen={moduleNum === 1}>
          <BankingBoundaryGrid moduleNumber={moduleNum} />
        </CollapsibleBoundary>
        {moduleTables && moduleTables.length > 0 && (
          <div style={{ marginTop: 24 }}>
            {moduleTables.map((table) => (
              <ContentTable key={table.id} table={table} />
            ))}
          </div>
        )}
      </section>

      {hasSandbox && (
        <section
          id="st-sandbox"
          aria-labelledby="st-sandbox-h"
          style={{ scrollMarginTop: 160, paddingTop: 48 }}
        >
          <h2 id="st-sandbox-h" style={SECTION_H2_STYLE}>
            Sandbox · {sandboxMin} min
          </h2>
          <AIPracticeSandbox
            moduleId={`aibi-p-module-${moduleNum}`}
            product="foundation"
            sandboxConfig={SANDBOX_CONFIGS[moduleNum]!}
          />
          {moduleNum === 3 && (
            <MiniTutorialList
              tutorials={M3_TUTORIALS}
              heading="First-try tutorials"
              intro="Step-by-step walkthroughs for your first real banking task on each platform. Pick the one that matches what you already have access to."
            />
          )}
          {moduleNum === 7 && (
            <MiniTutorialList
              tutorials={M7_TUTORIALS}
              heading="Skill-builder tutorials"
              intro="Worked examples of the anatomy-of-a-skill pattern applied to common banking workflows. Open the platform you use, copy the prompt, work through the steps."
            />
          )}
        </section>
      )}

      <section
        id="st-submit"
        aria-labelledby="st-submit-h"
        style={{ scrollMarginTop: 160, paddingTop: 48 }}
      >
        <h2 id="st-submit-h" style={SECTION_H2_STYLE}>
          Submit · {submitMin} min
        </h2>
        <ModuleContentClient
          activities={moduleActivities}
          enrollmentId={enrollmentId}
          moduleNumber={moduleNum}
          existingResponses={existingResponses}
          isLastModule={isLastModule}
          isAlreadyCompleted={isAlreadyCompleted}
          tables={moduleTables}
          learnerRole={learnerRole}
        />
      </section>

      <section
        id="st-saved"
        aria-labelledby="st-saved-h"
        style={{ scrollMarginTop: 160, paddingTop: 48 }}
      >
        <h2 id="st-saved-h" style={{ ...SECTION_H2_STYLE, margin: '0 0 12px' }}>
          Saved artifact
        </h2>
        <SavedArtifactCard keyOutput={keyOutput} isAlreadyCompleted={isAlreadyCompleted} />
      </section>
    </article>
  );
}
