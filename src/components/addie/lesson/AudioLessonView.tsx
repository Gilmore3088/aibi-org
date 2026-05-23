'use client';

// Audio modality — client component. Transcript is mandatory (a11y).

import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import type { LessonPayload } from './types';

interface AudioLessonViewProps {
  readonly payload: LessonPayload;
}

export function AudioLessonView({ payload }: AudioLessonViewProps) {
  const mediaRef = payload.variant?.media_ref ?? null;
  const transcript = payload.variant?.body_md ?? payload.lesson.body_md ?? '';
  return (
    <div>
      {mediaRef ? (
        <audio controls preload="metadata" className="w-full">
          <source src={mediaRef} />
          Sorry, your browser doesn&apos;t support embedded audio.
        </audio>
      ) : (
        <p className="text-[var(--ledger-muted)]">No audio has been published for this lesson yet.</p>
      )}
      <div className="mt-3 flex items-center gap-3">
        <KickerLabel tone="muted">{payload.lesson.duration_min} min</KickerLabel>
      </div>
      {transcript ? (
        <details open className="mt-4 border-l border-[var(--ledger-rule)] pl-4">
          <summary className="cursor-pointer font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">
            Transcript
          </summary>
          <div className="mt-3 whitespace-pre-wrap text-sm text-[var(--ledger-ink-2)]">
            {transcript}
          </div>
        </details>
      ) : null}
    </div>
  );
}
