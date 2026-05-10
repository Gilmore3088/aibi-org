'use client';

import type { RefineBeatContent, RubricScore } from '@/lib/aibi-s/types';

export function RefineBeat({
  beat,
  originalRebuttal,
  score,
  refined,
  onRefine,
  onAdvance,
  canAdvance,
}: {
  readonly beat: RefineBeatContent;
  readonly originalRebuttal: string;
  readonly score: RubricScore;
  readonly refined: string;
  readonly onRefine: (v: string) => void;
  readonly onAdvance: () => void;
  readonly canAdvance: boolean;
}) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl">Refine</h2>
      <p>{beat.guidance}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold mb-1">Your original rebuttal</p>
          <div className="p-3 border rounded whitespace-pre-wrap text-sm bg-[color:var(--color-parch)]">
            {originalRebuttal}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold mb-1">Feedback</p>
          <div className="p-3 border rounded text-sm bg-[color:var(--color-parch)]">
            {score.feedback}
          </div>
        </div>
      </div>

      <textarea
        value={refined}
        onChange={(e) => onRefine(e.target.value)}
        rows={10}
        className="w-full p-4 border rounded font-sans"
        placeholder="Rewrite your rebuttal, applying the feedback..."
      />

      <button
        disabled={!canAdvance}
        onClick={onAdvance}
        className="px-6 py-3 bg-[color:var(--color-cobalt)] text-white rounded disabled:opacity-40 hover:opacity-90"
      >
        Capture defended artifact →
      </button>
    </section>
  );
}
