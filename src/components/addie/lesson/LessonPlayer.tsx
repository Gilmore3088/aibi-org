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
import { EmbeddedExercise } from './EmbeddedExercise';
import { SaveTakeawayCTA } from './SaveTakeawayCTA';
import { TrackPickerInline } from './TrackPickerInline';
import { LessonStickyNav } from './LessonStickyNav';
import type { LessonPayload } from './types';

interface LessonPlayerProps {
  readonly payload: LessonPayload;
  /** When true, render the SandboxABLessonView for sandbox lessons (M3.5, M4.x). */
  readonly preferAb?: boolean;
}

export function LessonPlayer({
  payload,
  preferAb: preferAbProp,
}: LessonPlayerProps) {
  // M3.2 is the A/B sandbox; M3.5 + sandbox lessons default to single mode.
  const preferAb = preferAbProp ?? payload.lesson.id === 'm3.2';
  const { lesson, module, checks, siblings } = payload;
  const nextHref = siblings?.next
    ? `/foundation/${siblings.next.moduleId}/${siblings.next.id}`
    : null;
  const prevHref = siblings?.prev
    ? `/foundation/${siblings.prev.moduleId}/${siblings.prev.id}`
    : null;
  const crossesModule = siblings?.next?.moduleId !== module.id;

  // Embed the matching interactive when modality is something else and
  // the lesson has an exercise_id. The interactive + worksheet modalities
  // already render their widget as the primary view — skip embed there.
  const embedExercise =
    !!payload.interactiveExercise &&
    payload.lesson.modality !== 'interactive' &&
    payload.lesson.modality !== 'worksheet';

  // M0.1 carries the track picker per Screen Inventory §3.4.
  const showTrackPicker = lesson.id === 'm0.1';

  return (
    <article className="max-w-3xl">
      <LessonShellHeader
        lesson={lesson}
        module={module}
        activeTrack={payload.activeTrack ?? null}
      />
      <ModalityView payload={payload} preferAb={preferAb} />
      {showTrackPicker ? (
        <TrackPickerInline initial={payload.activeTrack ?? null} />
      ) : null}
      {embedExercise ? <EmbeddedExercise payload={payload} /> : null}
      <KnowledgeCheck checks={checks} />
      <SaveTakeawayCTA
        lessonId={lesson.id}
        artifactType={lesson.takeaway_artifact_type}
        moduleTier={module.tier}
      />
      <NextLessonCTA
        nextHref={nextHref}
        nextLabel={siblings?.next?.title}
        nextCrossesModule={crossesModule}
        endOfCourse={!siblings?.next}
        gateNext={payload.gateNext ?? false}
      />
      <LessonStickyNav
        prevHref={prevHref}
        prevLabel={siblings?.prev?.title ?? null}
        nextHref={nextHref}
        nextLabel={siblings?.next?.title ?? null}
        gateNext={payload.gateNext ?? false}
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
