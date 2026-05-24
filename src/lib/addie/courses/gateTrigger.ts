// gateTrigger — single, testable predicate for "should we redirect to
// /foundation/gate right now?".
//
// CONTRACT
// --------
// The three-way gate (PRD §6.4) fires once, after the learner finishes
// the LAST FREE LESSON in the course — which is Module 3 Lesson 5
// (m3.5, the branched "Real use cases" sandbox).
//
// "Finished" for the purpose of the gate means:
//   - the learner has completed the lesson body and any interactive
//     element on it (interpretation: completion is signalled by the
//     lesson page's own "mark complete" pulse, which the course
//     player wires into `completionState.completedLessonIds`).
//
// shouldTriggerGate() is intentionally pure. The lesson page calls it
// after the player emits its completion event for the current lesson;
// if it returns true, the page calls router.push('/foundation/gate').
// The orchestrator wires the call site in a later pass — this helper
// is shipped now so siblings can lean on a stable predicate.
//
// IMPORTANT — what this function does NOT decide:
//   - It does not check whether the learner has already paid or
//     entered an email at the gate. Those checks live in the gate
//     page itself; if the learner has already converted, the gate
//     short-circuits to "continue to Module 4". We always *send* the
//     learner to the gate on first m3.5 completion; the gate decides
//     whether to dwell or pass through.
//   - It does not handle the "upgrade from a capped Toolbox" entry
//     point. That path links to /foundation/gate directly (see
//     SaveAsArtifactButton.tsx).

/** Stable IDs of the trigger module and lesson — single source of truth. */
export const GATE_TRIGGER_MODULE_ID = 'm3';
export const GATE_TRIGGER_LESSON_ID = 'm3.5';

/**
 * Snapshot of the learner's completion state. Kept narrow so the lesson
 * page can synthesize it from whatever store the course player uses —
 * currently a Supabase-backed `lesson_completions` table written by the
 * player after a "mark complete" pulse.
 */
export interface CompletionState {
  /** Set of lesson ids the learner has completed in this course. */
  readonly completedLessonIds: ReadonlySet<string> | ReadonlyArray<string>;
}

/**
 * Returns true if completing (moduleId, lessonId) should redirect the
 * learner to the three-way gate. The current trigger condition is:
 *   - moduleId === 'm3' AND lessonId === 'm3.5' AND the completion state
 *     already contains m3.5 (i.e. we are firing in response to the
 *     player marking m3.5 complete).
 *
 * Returns false otherwise. The lesson page is expected to call this
 * synchronously inside the player's onComplete callback for the lesson.
 */
export function shouldTriggerGate(
  moduleId: string,
  lessonId: string,
  completionState: CompletionState
): boolean {
  if (moduleId !== GATE_TRIGGER_MODULE_ID) return false;
  if (lessonId !== GATE_TRIGGER_LESSON_ID) return false;
  const completed = completionState.completedLessonIds;
  if (completed instanceof Set) {
    return (completed as ReadonlySet<string>).has(GATE_TRIGGER_LESSON_ID);
  }
  return (completed as ReadonlyArray<string>).includes(GATE_TRIGGER_LESSON_ID);
}
