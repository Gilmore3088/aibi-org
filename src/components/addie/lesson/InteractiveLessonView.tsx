'use client';

// InteractiveLessonView — dispatches on lesson.exercise_id to a concrete
// non-LLM widget. Wave 2b registered four widgets: M0 OffLimitsSorter,
// M1 ToolLandscapeMatrix, M3 SpotTheViolation, plus the M2.4 worksheet
// (handled by WorksheetLessonView via its own dispatch).
//
// Sandbox lessons (modality='sandbox') do NOT pass through here — they go
// to SandboxLessonView / SandboxABLessonView, which call /api/sandbox/run.

import type { LessonPayload } from './types';
import { OffLimitsSorter } from '@/components/addie/interactives/m0/OffLimitsSorter';
import { ToolLandscapeMatrix } from '@/components/addie/interactives/m1/ToolLandscapeMatrix';
import { SpotTheViolation } from '@/components/addie/interactives/m3/SpotTheViolation';

interface InteractiveLessonViewProps {
  readonly payload: LessonPayload;
}

export function InteractiveLessonView({ payload }: InteractiveLessonViewProps) {
  const exerciseId = payload.lesson.exercise_id;
  const descriptor = payload.interactiveExercise ?? null;
  const track = payload.activeTrack ?? null;

  if (exerciseId && descriptor) {
    switch (exerciseId) {
      case 'm0-2-off-limits-sorter':
        return <OffLimitsSorter exerciseDescriptor={descriptor} track={track} />;
      case 'm1-2-tool-landscape':
        return <ToolLandscapeMatrix exerciseDescriptor={descriptor} />;
      case 'm3-4-spot-the-violation':
        return <SpotTheViolation exerciseDescriptor={descriptor} />;
      default:
        break;
    }
  }

  // Fallback: render the lesson body as a note so the lesson is still readable
  // when an exercise isn't yet wired (rare — content gaps surface here).
  const body = payload.variant?.body_md ?? payload.lesson.body_md ?? '';
  return (
    <div>
      <p className="text-sm text-[var(--ledger-muted)] mb-3">
        Interactive (exercise: {exerciseId ?? '—'}). Widget not registered.
      </p>
      {body ? (
        <div className="whitespace-pre-wrap font-serif text-[var(--ledger-ink)]">{body}</div>
      ) : null}
    </div>
  );
}
