// LessonPlayer — server component. Dispatches on lesson.modality to the
// right view (server or client island as appropriate), then renders the
// knowledge-check block + next-lesson CTA.
//
// This is the keystone of Wave 2a. Wave 2b content scaffolding seeds rows
// against `LessonPayload` (see ./types.ts) — the schema is the contract.

import { LessonShellHeader } from './LessonShellHeader';
import { ReadingLessonView } from './ReadingLessonView';
import { VideoLessonView } from './VideoLessonView';
import { AudioLessonView } from './AudioLessonView';
import { WorksheetLessonView } from './WorksheetLessonView';
import { InteractiveLessonView } from './InteractiveLessonView';
import { SandboxLessonView } from './SandboxLessonView';
import { SandboxABLessonView } from './SandboxABLessonView';
import { KnowledgeCheck } from './KnowledgeCheck';
import { NextLessonCTA } from './NextLessonCTA';
import type { LessonPayload } from './types';

interface LessonPlayerProps {
  readonly payload: LessonPayload;
  /** When true, render the SandboxABLessonView for sandbox lessons (M3.5, M4.x). */
  readonly preferAb?: boolean;
}

export function LessonPlayer({ payload, preferAb = false }: LessonPlayerProps) {
  const { lesson, module, checks, siblings } = payload;
  const nextHref = siblings?.next
    ? `/foundation/${module.id}/${siblings.next.id}`
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <LessonShellHeader
        lesson={lesson}
        module={module}
        activeTrack={payload.activeTrack ?? null}
      />
      <ModalityView payload={payload} preferAb={preferAb} />
      <KnowledgeCheck checks={checks} />
      <NextLessonCTA
        nextHref={nextHref}
        nextLabel={siblings?.next?.title}
        endOfCourse={!siblings?.next}
      />
    </article>
  );
}

function ModalityView({
  payload,
  preferAb,
}: {
  readonly payload: LessonPayload;
  readonly preferAb: boolean;
}) {
  switch (payload.lesson.modality) {
    case 'reading':
      return <ReadingLessonView payload={payload} />;
    case 'video':
      return <VideoLessonView payload={payload} />;
    case 'audio':
      return <AudioLessonView payload={payload} />;
    case 'worksheet':
      return <WorksheetLessonView payload={payload} />;
    case 'interactive':
      return <InteractiveLessonView payload={payload} />;
    case 'sandbox':
      return preferAb ? (
        <SandboxABLessonView payload={payload} />
      ) : (
        <SandboxLessonView payload={payload} />
      );
    default:
      return (
        <p className="text-[var(--ledger-muted)]">
          Unsupported modality: {payload.lesson.modality}
        </p>
      );
  }
}
