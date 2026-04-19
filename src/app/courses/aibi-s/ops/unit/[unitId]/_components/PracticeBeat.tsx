'use client';

import { useState } from 'react';
import type { PracticeBeatContent } from '../../../../../../../../lib/aibi-s/types';
import { FrameworkHooks } from './FrameworkHooks';

export function PracticeBeat({
  beat,
  selectedOptionId,
  onChoose,
  onAdvance,
}: {
  readonly beat: PracticeBeatContent;
  readonly selectedOptionId: string | null;
  readonly onChoose: (id: string) => void;
  readonly onAdvance: () => void;
}) {
  const [revealed, setRevealed] = useState<boolean>(selectedOptionId !== null);
  const chosen = beat.options.find((o) => o.id === selectedOptionId);

  return (
    <section className="space-y-6">
      <FrameworkHooks hooks={beat.hooks} />
      <h2 className="font-serif text-3xl">Practice: data-tier classification</h2>
      <div className="whitespace-pre-wrap">{beat.scenario}</div>
      <p className="font-semibold">{beat.question}</p>
      <ul className="space-y-3">
        {beat.options.map((opt) => {
          const isSelected = opt.id === selectedOptionId;
          return (
            <li key={opt.id}>
              <button
                disabled={revealed}
                onClick={() => { onChoose(opt.id); setRevealed(true); }}
                className={`w-full text-left p-4 border rounded transition
                  ${isSelected
                    ? opt.isCorrect
                      ? 'border-[color:var(--color-sage)] bg-[color:var(--color-sage)]/10'
                      : 'border-[color:var(--color-error)] bg-[color:var(--color-error)]/5'
                    : 'border-[color:var(--color-ink)]/20 hover:border-[color:var(--color-cobalt)]'}
                  ${revealed && !isSelected ? 'opacity-50' : ''}`}
              >
                {opt.label}
              </button>
              {isSelected && revealed && (
                <div className="mt-2 p-3 bg-[color:var(--color-parch)] text-sm space-y-2">
                  <p>{opt.feedback}</p>
                  {opt.consequenceIfWrong && !opt.isCorrect && (
                    <p className="text-[color:var(--color-error)]">
                      <strong>Consequence: </strong>{opt.consequenceIfWrong}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {chosen && (
        <button
          onClick={onAdvance}
          className="px-6 py-3 bg-[color:var(--color-cobalt)] text-white rounded hover:opacity-90"
        >
          {chosen.isCorrect ? 'Continue to Apply →' : 'Try again from here — or continue anyway →'}
        </button>
      )}
    </section>
  );
}
