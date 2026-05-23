'use client';

// InteractiveLessonView — dispatches on lesson.exercise_id to a concrete
// interactive (track picker, off-limits sorter, AI Toolkit Map, etc.).
// Wave 2a ships the dispatch shell + a generic fallback. Wave 2b agents
// register their interactives by importing this file and extending the map.

import type { LessonPayload } from './types';

interface InteractiveLessonViewProps {
  readonly payload: LessonPayload;
}

// Registry pattern: Wave 2b agents add entries keyed by exercise_id.
// Until then, the generic fallback renders the body_md as a labelled note.
export function InteractiveLessonView({ payload }: InteractiveLessonViewProps) {
  const body = payload.variant?.body_md ?? payload.lesson.body_md ?? '';
  return (
    <div>
      <p className="text-sm text-[var(--ledger-muted)] mb-3">
        Interactive (exercise: {payload.lesson.exercise_id ?? '—'}). The concrete interactive widget
        for this exercise will be wired in Wave 2b.
      </p>
      {body ? (
        <div className="whitespace-pre-wrap font-serif text-[var(--ledger-ink)]">{body}</div>
      ) : null}
    </div>
  );
}
