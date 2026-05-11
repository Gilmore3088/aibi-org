'use client';

import type { RubricScore as ScoreT, Rubric } from '@/lib/aibi-s/types';

export function RubricScore({
  rubric,
  score,
  onContinue,
}: {
  readonly rubric: Rubric;
  readonly score: ScoreT;
  readonly onContinue: () => void;
}) {
  return (
    <div className="space-y-4 border rounded p-4 bg-[color:var(--color-parch)]">
      <h3 className="font-serif text-2xl">
        {score.passed ? 'Passed' : 'Work to do'} — {score.total} / 20
      </h3>
      <ul className="space-y-2">
        {rubric.dimensions.map((d) => {
          const v = score.dimensionScores[d.id] ?? 0;
          return (
            <li key={d.id} className="flex justify-between">
              <span>{d.label}</span>
              <span className={`font-mono ${v < rubric.passingMinPerDimension ? 'text-[color:var(--color-error)]' : ''}`}>
                {v} / {d.maxScore}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-[color:var(--color-slate)]">{score.feedback}</p>
      <button
        onClick={onContinue}
        className="px-6 py-3 bg-[color:var(--color-cobalt)] text-white rounded"
      >
        Continue to Refine →
      </button>
    </div>
  );
}
