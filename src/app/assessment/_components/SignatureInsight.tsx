import { SIGNATURE_INSIGHT } from '@content/assessments/v2/personalization';

/**
 * The memorable line that travels with the report. Italic display
 * serif on parchment, hairline rules above and below — small in area,
 * high in presence. Sits between Diagnosis and Practice Picture on
 * the on-screen brief.
 */
export function SignatureInsight() {
  return (
    <figure
      className="my-4"
      aria-label="The signature insight of the AI Readiness Briefing"
    >
      <div className="border-y border-[color:var(--ink)]/25 py-8 md:py-10 px-1">
        <p className="italic text-[color:var(--ink)]/85 text-xl md:text-2xl leading-[1.45] max-w-2xl">
          {SIGNATURE_INSIGHT}
        </p>
      </div>
    </figure>
  );
}
