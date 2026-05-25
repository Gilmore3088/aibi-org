'use client';

// LessonStepPlayer — the step-shell alternative to LessonPlayer.
//
// Same input contract (a LessonPayload + the route-pre-rendered beats as
// ReactNode props), but presents the lesson as discrete focused steps via
// LessonStepShell instead of a long vertical scroll.
//
// Selected per-lesson by the route layer at
// src/app/(addie)/foundation/[moduleId]/[lessonId]/page.tsx based on
// lesson.shell_kind === 'step'. Default 'legacy' keeps LessonPlayer.
//
// This is the Phase 1 plumbing component. Subsequent PRs migrate
// individual M0–M3 lessons by flipping their shell_kind in a seed update.

import { useMemo } from 'react';
import { LessonStepShell, type Step } from './v2/LessonStepShell';
import type { LessonPayload } from './types';

interface LessonStepPlayerProps {
  readonly payload: LessonPayload;
  /** Server-rendered LessonObjectiveBeat. Omitted if lesson has no objective_md. */
  readonly objectiveNode?: React.ReactNode;
  /** Server-rendered ModalityView (reading/video/audio/worksheet/interactive/sandbox). */
  readonly modalityNode: React.ReactNode;
  /** Optional embedded interactive — present when modality != interactive/worksheet AND lesson has exercise_id. */
  readonly exerciseNode?: React.ReactNode;
  /** Client KnowledgeCheck. */
  readonly knowledgeCheckNode: React.ReactNode;
  /** Client SaveTakeawayCTA. */
  readonly saveTakeawayNode: React.ReactNode;
  /** Server LessonTransferBeat. Omitted if lesson has no transfer_md. */
  readonly transferNode?: React.ReactNode;
  /** Server NextLessonCTA — terminal step. */
  readonly nextCTANode: React.ReactNode;
}

export function LessonStepPlayer({
  payload,
  objectiveNode,
  modalityNode,
  exerciseNode,
  knowledgeCheckNode,
  saveTakeawayNode,
  transferNode,
  nextCTANode,
}: LessonStepPlayerProps) {
  const { lesson, module, checks } = payload;

  const steps = useMemo<Step[]>(() => {
    const out: Step[] = [];

    if (objectiveNode) {
      out.push({
        id: 'objective',
        label: 'Objective',
        title: 'What you\'ll leave able to do',
        node: objectiveNode,
      });
    }

    out.push({
      id: 'content',
      label: 'Learn',
      title: lesson.title,
      node: modalityNode,
    });

    if (exerciseNode) {
      out.push({
        id: 'exercise',
        label: 'Try',
        title: 'Try it',
        node: exerciseNode,
      });
    }

    if (checks && checks.length > 0) {
      out.push({
        id: 'check',
        label: 'Check',
        title: 'Quick check',
        node: knowledgeCheckNode,
      });
    }

    out.push({
      id: 'save',
      label: 'Save',
      title: 'Save what you built',
      node: (
        <>
          {saveTakeawayNode}
          {transferNode ?? null}
        </>
      ),
    });

    out.push({
      id: 'next',
      label: 'Next',
      title: 'Where you\'re headed',
      node: nextCTANode,
      nextLabel: 'Finish lesson',
    });

    return out;
  }, [
    lesson.title,
    checks,
    objectiveNode,
    modalityNode,
    exerciseNode,
    knowledgeCheckNode,
    saveTakeawayNode,
    transferNode,
    nextCTANode,
  ]);

  // Compute the module label + lesson ordinal-of-total from the payload.
  // Falls back gracefully if module/lesson ordinals are missing.
  const moduleLabel = `MODULE ${module.ordinal ?? '?'} · ${(module.title ?? '').toUpperCase()}`;
  const lessonOrdinalOfTotal = lesson.ordinal
    ? `Lesson ${lesson.ordinal}`
    : 'Lesson';

  return (
    <LessonStepShell
      steps={steps}
      moduleLabel={moduleLabel}
      lessonOrdinalOfTotal={lessonOrdinalOfTotal}
      lessonTitle={lesson.title}
    />
  );
}
