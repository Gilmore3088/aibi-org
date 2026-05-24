'use client';

// Audio modality — client component. Transcript is mandatory (a11y).
// Uses LessonBody for the transcript prose. When no audio is published
// (i.e. before the operator records M1.3's five role-specific audios),
// the transcript is the primary content with a "audio coming" pill.

import { LessonBody } from './LessonBody';
import type { LessonPayload } from './types';

interface AudioLessonViewProps {
  readonly payload: LessonPayload;
}

export function AudioLessonView({ payload }: AudioLessonViewProps) {
  const mediaRef = payload.variant?.media_ref ?? null;
  const body = payload.variant?.body_md ?? payload.lesson.body_md ?? '';
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <span
          className="addie-chip"
          data-tone={mediaRef ? undefined : 'accent'}
        >
          {mediaRef ? 'Audio · ' : 'Audio coming · '} {payload.lesson.duration_min} min
        </span>
        {payload.activeTrack ? (
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ledger-muted)]">
            For: {payload.activeTrack.replace(/-/g, ' ')}
          </span>
        ) : null}
      </div>
      {mediaRef ? (
        <audio controls preload="metadata" className="w-full mb-4">
          <source src={mediaRef} />
          Sorry, your browser doesn&apos;t support embedded audio.
        </audio>
      ) : null}
      {body ? <LessonBody body={body} /> : (
        <p className="text-[var(--ledger-muted)]">
          No transcript has been published for this lesson yet.
        </p>
      )}
    </div>
  );
}
