// ModalityView — dispatches a LessonPayload to the right view component
// based on lesson.modality. Used by both LessonPlayer (legacy long-scroll)
// and the new LessonStepPlayer (Phase 1 Guided Lesson Shell).
//
// Extracted from LessonPlayer 2026-05-25 so the step-shell route branch
// can pre-render the modality view as a ReactNode and pass it into the
// client-side LessonStepPlayer adapter.

import { ReadingLessonView } from './ReadingLessonView';
import { VideoLessonView } from './VideoLessonView';
import { AudioLessonView } from './AudioLessonView';
import { WorksheetLessonView } from './WorksheetLessonView';
import { InteractiveLessonView } from './InteractiveLessonView';
import { SandboxLessonView } from './SandboxLessonView';
import { SandboxABLessonView } from './SandboxABLessonView';
import type { LessonPayload } from './types';

interface ModalityViewProps {
  readonly payload: LessonPayload;
  readonly preferAb?: boolean;
}

export function ModalityView({ payload, preferAb: preferAbProp }: ModalityViewProps) {
  const preferAb = preferAbProp ?? payload.lesson.id === 'm3.2';

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
