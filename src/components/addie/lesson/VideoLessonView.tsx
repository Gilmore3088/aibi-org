'use client';

// Video modality — client component. Captions track is a hard
// requirement (Design System §9). The media_ref points at a public
// video URL; captions live next to it at `<media_ref>.vtt` by
// convention.
//
// Until the operator-recorded videos exist (Tier 4 punch list), the
// body_md acts as the primary read-along content rendered via
// LessonBody. The "video pending" pill makes the temporary state
// honest without making the lesson empty.

import { useRef } from 'react';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LessonBody } from './LessonBody';
import { ModuleIllustration } from '@/components/addie/illustrations/ModuleIllustration';
import type { LessonPayload } from './types';

interface VideoLessonViewProps {
  readonly payload: LessonPayload;
}

export function VideoLessonView({ payload }: VideoLessonViewProps) {
  const mediaRef = payload.variant?.media_ref ?? null;
  const ref = useRef<HTMLVideoElement | null>(null);
  const body = payload.variant?.body_md ?? payload.lesson.body_md ?? '';
  const moduleKey = payload.module.id as 'm0' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

  if (!mediaRef) {
    return (
      <div>
        {/* Placeholder hero — uses the module illustration on a parchment
            field so the lesson has visual presence even before the
            recorded video lands. */}
        <div
          role="img"
          aria-label="Video lesson placeholder"
          className="relative w-full rounded-[4px] border border-[var(--ledger-rule)] bg-[var(--ledger-parch)] overflow-hidden"
        >
          <div className="aspect-[16/8] flex items-center justify-center px-8">
            <div className="w-full max-w-md text-[var(--ledger-muted)]">
              <ModuleIllustration module={moduleKey} />
            </div>
          </div>
          <div className="absolute top-3 left-3">
            <span className="addie-chip" data-tone="accent">Video coming · read below</span>
          </div>
          <div className="absolute bottom-3 right-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ledger-muted)]">
            {payload.lesson.duration_min} min
          </div>
        </div>
        <div className="mt-8">
          <LessonBody body={body} />
        </div>
      </div>
    );
  }

  const vtt = `${mediaRef.replace(/\.[a-z0-9]+$/i, '')}.vtt`;
  return (
    <figure>
      <video
        ref={ref}
        controls
        preload="metadata"
        className="w-full max-w-4xl bg-[var(--ledger-ink)] rounded-[4px]"
        crossOrigin="anonymous"
      >
        <source src={mediaRef} />
        <track kind="captions" src={vtt} srcLang="en" label="English" default />
        Sorry, your browser doesn&apos;t support embedded video.
      </video>
      <figcaption className="mt-3 flex items-center justify-between gap-3">
        <KickerLabel tone="muted">{payload.lesson.duration_min} min · captions enabled</KickerLabel>
      </figcaption>
      {body ? (
        <details className="mt-6 border-l border-[var(--ledger-rule)] pl-4">
          <summary className="cursor-pointer font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">
            Transcript
          </summary>
          <div className="mt-4">
            <LessonBody body={body} />
          </div>
        </details>
      ) : null}
    </figure>
  );
}
