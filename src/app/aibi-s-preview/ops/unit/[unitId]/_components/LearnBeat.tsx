'use client';

import type { LearnBeatContent } from '../../../../../../../lib/aibi-s/types';
import { FrameworkHooks } from './FrameworkHooks';

export function LearnBeat({
  beat,
  onAdvance,
}: {
  readonly beat: LearnBeatContent;
  readonly onAdvance: () => void;
}) {
  return (
    <section className="space-y-6">
      <FrameworkHooks hooks={beat.hooks} />
      <h2 className="font-serif text-3xl">{beat.title}</h2>
      <div className="prose prose-slate max-w-none whitespace-pre-wrap">{beat.body}</div>
      {beat.workedExample && (
        <aside className="border-l-2 border-[color:var(--color-cobalt)] pl-4 bg-[color:var(--color-parch)] p-4 whitespace-pre-wrap">
          {beat.workedExample}
        </aside>
      )}
      <button
        onClick={onAdvance}
        className="px-6 py-3 bg-[color:var(--color-cobalt)] text-white rounded hover:opacity-90"
      >
        Continue to Practice →
      </button>
    </section>
  );
}
