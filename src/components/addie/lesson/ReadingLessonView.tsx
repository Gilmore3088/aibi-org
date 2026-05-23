// Reading modality — server component; renders body_md as a simple
// pre-formatted Newsreader block. Real MDX/markdown rendering can be
// layered in later; for the player shell, preserving line breaks is enough.

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
  return (
    <article className="prose max-w-prose font-serif text-[var(--ledger-ink)] text-lg leading-relaxed">
      {body.split(/\n{2,}/).map((p, i) => (
        <p key={i} className="mb-4 whitespace-pre-wrap">
          {p}
        </p>
      ))}
    </article>
  );
}
