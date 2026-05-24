'use client';

// ProblemFrame — Module 5.2 worksheet. Non-LLM.
// Reads a five-question schema from the exercise descriptor's
// preset_context_blocks (block id = "frame_schema", body = JSON
// {fields: [{key,label,help,placeholder}, ...]}). Renders one textarea
// per field, checks PII on each, and saves a markdown rendering as a
// Toolbox item of type 'problem_backlog'.
//
// Embedded SaveAsArtifactButton handles the POST to /api/addie/toolbox/items;
// paid-gating is enforced server-side via the exercise.entitlement column +
// RLS. This widget trusts the page that mounts it has already gated entry.

import { useCallback, useMemo, useState } from 'react';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { detectPII, PIIWarning } from '@/components/addie/shared/PIIWarning';
import { SaveAsArtifactButton } from '@/components/addie/lesson/SaveAsArtifactButton';
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

export interface ProblemFrameField {
  readonly key: string;
  readonly label: string;
  readonly help?: string;
  readonly placeholder?: string;
}

export interface ProblemFrameProps {
  readonly exerciseDescriptor: ExerciseDescriptor;
  readonly track?: Track | null;
  readonly lessonId?: string;
}

function isField(value: unknown): value is ProblemFrameField {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.key === 'string' && typeof v.label === 'string';
}

function parseSchema(descriptor: ExerciseDescriptor): ProblemFrameField[] {
  const block = descriptor.preset_context_blocks?.find(
    (b) => b.id === 'frame_schema',
  );
  if (!block?.body) return [];
  try {
    const parsed: unknown = JSON.parse(block.body);
    if (typeof parsed !== 'object' || parsed === null) return [];
    const p = parsed as Record<string, unknown>;
    if (!Array.isArray(p.fields)) return [];
    return p.fields.filter(isField);
  } catch {
    return [];
  }
}

function renderMarkdown(
  fields: ReadonlyArray<ProblemFrameField>,
  answers: Readonly<Record<string, string>>,
): string {
  const today = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    '# Problem Frame',
    '',
    `_Drafted ${today} · Lesson 5.2 · Module 5_`,
    '',
  ];
  for (const f of fields) {
    const v = (answers[f.key] ?? '').trim();
    if (!v) continue;
    lines.push(`## ${f.label}`, '', v, '');
  }
  return lines.join('\n');
}

export function ProblemFrame({
  exerciseDescriptor,
  track = null,
  lessonId = 'm5.2',
}: ProblemFrameProps) {
  const fields = useMemo(() => parseSchema(exerciseDescriptor), [exerciseDescriptor]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const update = useCallback((key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const hasPII = useMemo(
    () => Object.values(answers).some((v) => detectPII(v)),
    [answers],
  );
  const filledCount = fields.filter(
    (f) => (answers[f.key] ?? '').trim().length > 0,
  ).length;
  const allFilled = fields.length > 0 && filledCount === fields.length;

  const markdown = useMemo(
    () => renderMarkdown(fields, answers),
    [fields, answers],
  );

  if (fields.length === 0) {
    return (
      <LedgerCard variant="recessed" className="p-5">
        <p className="text-sm text-[var(--ledger-muted)]">
          No problem-frame schema seeded for this exercise.
        </p>
      </LedgerCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <KickerLabel tone="muted">Problem frame · 5 questions</KickerLabel>
        <span className="font-mono text-xs text-[var(--ledger-muted)] tabular-nums">
          {filledCount}/{fields.length}
        </span>
      </div>

      <LedgerCard variant="standard" className="p-5 space-y-5">
        {fields.map((field) => {
          const fieldId = `m5-2-${field.key}`;
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
                rows={3}
                placeholder={field.placeholder}
                value={answers[field.key] ?? ''}
                onChange={(e) => update(field.key, e.target.value)}
                aria-describedby={field.help ? `${fieldId}-help` : undefined}
                className={
                  'block w-full bg-[var(--ledger-paper)] border border-[var(--ledger-rule-strong)] ' +
                  'rounded-[2px] px-3 py-2 text-[var(--ledger-ink)] ' +
                  'placeholder:text-[var(--ledger-muted)] ' +
                  'transition-colors duration-[120ms] ease-[cubic-bezier(0.4,0,0.2,1)] ' +
                  'focus:outline-none focus:border-[var(--ledger-ink)] ' +
                  'focus:border-l-[2px] focus:border-l-[var(--ledger-accent)]'
                }
              />
              {field.help ? (
                <p
                  id={`${fieldId}-help`}
                  className="mt-2 text-sm text-[var(--ledger-muted)]"
                >
                  {field.help}
                </p>
              ) : null}
            </div>
          );
        })}
        <PIIWarning visible={hasPII} />
      </LedgerCard>

      <div className="flex items-center gap-3">
        <SaveAsArtifactButton
          type="problem_backlog"
          title="Problem Frame — Lesson 5.2"
          body_md={markdown}
          lesson_id={lessonId}
          track={track}
          disabled={!allFilled || hasPII}
          disabledReason={
            hasPII
              ? 'Remove customer data first'
              : 'Fill every question before saving'
          }
        />
      </div>
    </div>
  );
}
