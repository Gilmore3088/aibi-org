'use client';

// Worksheet modality — form-style prompts. Wave 2a delivers a generic
// "fill the slots → render markdown → save" worksheet. Wave 2b registered
// the M2.4 WhereAIFitsWorksheet; this view dispatches to it when the
// exercise_id matches, falling back to the generic 3-slot worksheet.

import { useMemo, useState } from 'react';
import { LedgerInput } from '@/components/addie/shared/LedgerInput';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { SaveAsArtifactButton } from './SaveAsArtifactButton';
import { detectPII, PIIWarning } from '@/components/addie/shared/PIIWarning';
import { WhereAIFitsWorksheet } from '@/components/addie/interactives/m2/WhereAIFitsWorksheet';
import type { LessonPayload } from './types';

interface WorksheetSlot {
  readonly key: string;
  readonly label: string;
  readonly help?: string;
}

const FALLBACK_SLOTS: ReadonlyArray<WorksheetSlot> = [
  { key: 'context', label: 'Your context', help: 'One sentence about the situation.' },
  { key: 'goal', label: 'What you want', help: 'The change you are trying to produce.' },
  { key: 'constraint', label: 'A constraint', help: 'A rule or limit that matters.' },
];

interface WorksheetLessonViewProps {
  readonly payload: LessonPayload;
}

export function WorksheetLessonView({ payload }: WorksheetLessonViewProps) {
  // Per-exercise worksheet widgets registered in Wave 2b.
  if (
    payload.lesson.exercise_id === 'm2-4-where-ai-fits-worksheet' &&
    payload.interactiveExercise
  ) {
    return (
      <WhereAIFitsWorksheet
        exerciseDescriptor={payload.interactiveExercise}
        track={payload.activeTrack ?? null}
      />
    );
  }

  const slots = FALLBACK_SLOTS;
  const [values, setValues] = useState<Record<string, string>>({});

  const hasPII = useMemo(
    () => Object.values(values).some((v) => detectPII(v)),
    [values],
  );
  const allFilled = slots.every((s) => (values[s.key] ?? '').trim().length > 0);

  const md = useMemo(() => {
    const lines = [`# ${payload.lesson.title}`, ''];
    for (const s of slots) {
      const v = (values[s.key] ?? '').trim();
      if (!v) continue;
      lines.push(`## ${s.label}`, '', v, '');
    }
    return lines.join('\n');
  }, [slots, values, payload.lesson.title]);

  return (
    <div>
      <KickerLabel tone="muted">Worksheet · Do beat</KickerLabel>
      <div className="mt-4 grid gap-4">
        {slots.map((s) => (
          <LedgerInput
            key={s.key}
            label={s.label}
            help={s.help}
            value={values[s.key] ?? ''}
            onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
            maxLength={500}
          />
        ))}
        <PIIWarning visible={hasPII} />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <SaveAsArtifactButton
          type={payload.lesson.takeaway_artifact_type ?? 'starter_prompt_pack'}
          title={payload.lesson.title}
          body_md={md}
          lesson_id={payload.lesson.id}
          track={payload.activeTrack ?? null}
          disabled={!allFilled || hasPII}
          disabledReason={
            hasPII ? 'Remove customer data first' : 'Fill every slot before saving'
          }
        />
      </div>
    </div>
  );
}
