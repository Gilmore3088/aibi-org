'use client';

// Video modality — client component. Captions track is a hard requirement
// (Design System §9 + the non-negotiable accessibility rule). The
// media_ref points at a public video URL; captions live next to it at
// `<media_ref>.vtt` by convention.

import { useRef } from 'react';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import type { LessonPayload } from './types';

interface VideoLessonViewProps {
  readonly payload: LessonPayload;
}

export function VideoLessonView({ payload }: VideoLessonViewProps) {
  const mediaRef = payload.variant?.media_ref ?? null;
  const ref = useRef<HTMLVideoElement | null>(null);
  if (!mediaRef) {
    return (
      <p className="text-[var(--ledger-muted)]">No video has been published for this lesson yet.</p>
    );
  }
  const vtt = `${mediaRef.replace(/\.[a-z0-9]+$/i, '')}.vtt`;
  return (
    <figure>
      <video
        ref={ref}
        controls
        preload="metadata"
        className="w-full max-w-4xl bg-[var(--ledger-ink)] rounded-[3px]"
        crossOrigin="anonymous"
      >
        <source src={mediaRef} />
        <track kind="captions" src={vtt} srcLang="en" label="English" default />
        Sorry, your browser doesn&apos;t support embedded video.
      </video>
      <figcaption className="mt-3 flex items-center justify-between gap-3">
        <KickerLabel tone="muted">{payload.lesson.duration_min} min · captions enabled</KickerLabel>
      </figcaption>
      {payload.lesson.body_md ? (
        <details className="mt-4 border-l border-[var(--ledger-rule)] pl-4">
          <summary className="cursor-pointer font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">
            Transcript
          </summary>
          <div className="mt-3 whitespace-pre-wrap text-sm text-[var(--ledger-ink-2)]">
            {payload.variant?.body_md ?? payload.lesson.body_md}
          </div>
        </details>
      ) : null}
    </figure>
  );
}
