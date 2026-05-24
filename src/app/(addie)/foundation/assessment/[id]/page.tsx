// /foundation/assessment/[id] — full Readiness Briefing reader.
// Renders the four PRD §6.6 deliverables plus a print-friendly header strip.

import { notFound } from 'next/navigation';
import { loadOwnAssessmentResult } from '@/lib/addie/assessment/loadForViewer';
import { ResultsHeader } from '@/components/addie/assessment/ResultsHeader';
import { DimensionScorecard } from '@/components/addie/assessment/DimensionScorecard';
import { DeliverableSection } from '@/components/addie/assessment/DeliverableSection';

export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: { readonly id: string };
}

export default async function FoundationAssessmentDetailPage({ params }: PageProps) {
  const { result } = await loadOwnAssessmentResult(params.id);
  if (!result) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-10">
      <ResultsHeader created_at={result.created_at} />

      <DimensionScorecard dimension_scores={result.dimension_scores} />

      <hr className="border-[var(--ledger-rule)]" />

      <DeliverableSection
        kicker="Deliverable 2 of 4"
        title="Personalized plan"
        markdown={result.plan_md}
        emptyState="No plan was generated for this attempt."
      />

      <hr className="border-[var(--ledger-rule)]" />

      <DeliverableSection
        kicker="Deliverable 3 of 4"
        title="Curated ideas and prompts"
        markdown={result.ideas_prompts_md}
        emptyState="No ideas or prompts were generated for this attempt."
      />

      <hr className="border-[var(--ledger-rule)]" />

      <DeliverableSection
        kicker="Deliverable 4 of 4"
        title="Recommended next steps"
        markdown={result.ctas_md}
        emptyState="No recommended next steps were generated for this attempt."
      />
    </main>
  );
}
