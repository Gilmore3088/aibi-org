'use client';

import type { CaptureBeatContent, UnitLearnerState } from '../../../../../../../../lib/aibi-s/types';

export function CaptureBeat({
  beat,
  state,
  onCapture,
  captured,
}: {
  readonly beat: CaptureBeatContent;
  readonly state: UnitLearnerState;
  readonly onCapture: () => void;
  readonly captured: boolean;
}) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl">Capture</h2>
      <p>This is what will be added to your AiBI-S portfolio:</p>
      <div className="p-4 border rounded bg-[color:var(--color-parch)] space-y-2 font-mono text-sm">
        <p><strong>Artifact:</strong> {beat.artifactLabel}</p>
        <p><strong>Practice choice:</strong> {state.practiceChoice ?? '—'}</p>
        <p><strong>Apply response:</strong> {state.applyResponse.slice(0, 200)}…</p>
        <p><strong>Rubric total:</strong> {state.rubricScore?.total} / 20</p>
        <p><strong>Passed:</strong> {state.rubricScore?.passed ? 'Yes' : 'No'}</p>
        <p><strong>Refined rebuttal length:</strong> {state.refinedRebuttal.length} chars</p>
      </div>
      {!captured ? (
        <button
          onClick={onCapture}
          className="px-6 py-3 bg-[color:var(--color-cobalt)] text-white rounded hover:opacity-90"
        >
          Capture to portfolio
        </button>
      ) : (
        <p className="text-[color:var(--color-sage)] font-semibold">
          ✓ Captured at {state.capturedAt}
        </p>
      )}
    </section>
  );
}
