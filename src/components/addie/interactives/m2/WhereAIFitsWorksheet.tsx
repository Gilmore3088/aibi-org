'use client';

// WhereAIFitsWorksheet — Module 2, Lesson 2.4 interactive.
// Branched worksheet: reads a per-track schema from the exercise's
// preset_context_blocks (one block per track, body = a stringified JSON
// {track, fields[]}). The widget picks the block matching the learner's
// track and renders a labeled textarea per field. On submit it emits a
// Toolbox-saveable object.
//
// NOTE on artifact_type: the Foundation enum (migration 00038) does not
// include a "worksheet" or "where_ai_fits" artifact type. The track row
// for this lesson is therefore typed as 'first_conversation' as a stub
// — this worksheet's real payload is the seed for the M3 Starter Prompt
// Pack, which IS in the enum. Update both this widget and the seed when
// the enum is widened.

import { useCallback, useMemo, useState } from 'react';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import type { Track } from '@/components/addie/lesson/types';

interface PresetContextBlock {
  readonly id: string;
  readonly label: string;
  readonly body?: string;
}

interface ExerciseDescriptor {
  readonly id: string;
  readonly preset_context_blocks?: ReadonlyArray<PresetContextBlock>;
}

export interface WorksheetField {
  readonly key: string;
  readonly label: string;
  readonly placeholder?: string;
}

interface WorksheetSchema {
  readonly track: Track;
  readonly fields: ReadonlyArray<WorksheetField>;
}

export interface WhereAIFitsValue {
  readonly track: Track;
  readonly answers: Readonly<Record<string, string>>;
}

export interface WhereAIFitsWorksheetProps {
  readonly exerciseDescriptor: ExerciseDescriptor;
  readonly track: Track | null;
  readonly onSave?: (value: WhereAIFitsValue) => void;
}

const TRACK_TO_BLOCK_ID: Readonly<Record<Track, string>> = {
  risk_compliance: 'schema_risk_compliance',
  customer_facing: 'schema_customer_facing',
  back_office: 'schema_back_office',
  technical: 'schema_technical',
  leadership: 'schema_leadership',
};

const TRACK_LABEL: Readonly<Record<Track, string>> = {
  risk_compliance: 'Risk & Compliance',
  customer_facing: 'Customer-Facing',
  back_office: 'Back-Office Process',
  technical: 'Technical',
  leadership: 'Leadership',
};

function isField(value: unknown): value is WorksheetField {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.key === 'string' && typeof v.label === 'string';
}

function isTrack(value: unknown): value is Track {
  return (
    value === 'risk_compliance' ||
    value === 'customer_facing' ||
    value === 'back_office' ||
    value === 'technical' ||
    value === 'leadership'
  );
}

function parseSchema(
  descriptor: ExerciseDescriptor,
  track: Track,
): WorksheetSchema | null {
  const blockId = TRACK_TO_BLOCK_ID[track];
  const block = descriptor.preset_context_blocks?.find((b) => b.id === blockId);
  const raw = block?.body;
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const p = parsed as Record<string, unknown>;
    if (!isTrack(p.track)) return null;
    if (!Array.isArray(p.fields)) return null;
    const fields = p.fields.filter(isField);
    if (fields.length === 0) return null;
    return { track: p.track, fields };
  } catch {
    return null;
  }
}

export function WhereAIFitsWorksheet({
  exerciseDescriptor,
  track,
  onSave,
}: WhereAIFitsWorksheetProps) {
  const schema = useMemo(
    () => (track ? parseSchema(exerciseDescriptor, track) : null),
    [exerciseDescriptor, track],
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const update = useCallback((key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!schema) return;
    onSave?.({ track: schema.track, answers });
    setSaved(true);
  }, [answers, onSave, schema]);

  if (!track) {
    return (
      <LedgerCard variant="recessed" className="p-5">
        <p className="text-sm text-[var(--ledger-muted)]">
          Pick a role track in Module 0 to see this worksheet.
        </p>
      </LedgerCard>
    );
  }

  if (!schema) {
    return (
      <LedgerCard variant="recessed" className="p-5">
        <p className="text-sm text-[var(--ledger-muted)]">
          No worksheet template available for this track yet.
        </p>
      </LedgerCard>
    );
  }

  const filledCount = schema.fields.filter(
    (f) => (answers[f.key] ?? '').trim().length > 0,
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <KickerLabel tone="muted">
          Track · {TRACK_LABEL[schema.track]}
        </KickerLabel>
        <span className="font-mono text-xs text-[var(--ledger-muted)] tabular-nums">
          {filledCount}/{schema.fields.length}
        </span>
      </div>

      <LedgerCard variant="standard" className="p-5 space-y-5">
        {schema.fields.map((field) => {
          const fieldId = `m2-4-${field.key}`;
          return (
            <div key={field.key}>
              <label
                htmlFor={fieldId}
                className="block font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ledger-ink-2)] mb-2"
              >
                {field.label}
              </label>
              <textarea
                id={fieldId}
                rows={2}
                placeholder={field.placeholder}
                value={answers[field.key] ?? ''}
                onChange={(e) => update(field.key, e.target.value)}
                className={
                  'block w-full bg-[var(--ledger-paper)] border border-[var(--ledger-rule-strong)] ' +
                  'rounded-[2px] px-3 py-2 text-[var(--ledger-ink)] ' +
                  'placeholder:text-[var(--ledger-muted)] ' +
                  'transition-colors duration-[120ms] ease-[cubic-bezier(0.4,0,0.2,1)] ' +
                  'focus:outline-none focus:border-[var(--ledger-ink)] ' +
                  'focus:border-l-[2px] focus:border-l-[var(--ledger-accent)]'
                }
              />
            </div>
          );
        })}
      </LedgerCard>

      <div className="flex items-center gap-3">
        <LedgerButton
          onClick={handleSave}
          disabled={filledCount === 0}
          aria-label="Save worksheet to Toolbox"
        >
          Save to Toolbox
        </LedgerButton>
        {saved ? (
          <span
            role="status"
            aria-live="polite"
            className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ledger-ink-2)]"
          >
            Saved
          </span>
        ) : null}
      </div>
    </div>
  );
}
