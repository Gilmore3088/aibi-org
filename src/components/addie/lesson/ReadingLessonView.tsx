// Reading modality — server component.
// Renders body_md via the LessonBody markdown subset renderer.

import { LessonBody } from './LessonBody';
import type { LessonPayload } from './types';

interface ReadingLessonViewProps {
  readonly payload: LessonPayload;
}

export function ReadingLessonView({ payload }: ReadingLessonViewProps) {
  const body = payload.variant?.body_md ?? payload.lesson.body_md ?? '';
  if (!body) {
    return (
      <p className="text-[var(--ledger-muted)]">
        No content has been published for this lesson yet.
      </p>
    );
  }
  return <LessonBody body={body} />;
}
