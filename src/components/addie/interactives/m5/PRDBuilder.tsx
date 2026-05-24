'use client';

// PRDBuilder — Module 5.3 interactive. Non-LLM.
// Reads a section schema from the exercise descriptor's
// preset_context_blocks (block id = "prd_schema", body = JSON
// {sections: [{key,label,help,placeholder}, ...]}). Renders one textarea
// per section with help text and saves a full markdown PRD as a Toolbox
// item of type 'prd'.
//
// Output is the document a learner pastes verbatim into a Lesson 5.4
// prototyping tool — Lovable, Replit, Claude Code, or v0.

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

export interface PRDSection {
  readonly key: string;
  readonly label: string;
  readonly help?: string;
  readonly placeholder?: string;
}

export interface PRDBuilderProps {
  readonly exerciseDescriptor: ExerciseDescriptor;
  readonly track?: Track | null;
  readonly lessonId?: string;
}

function isSection(value: unknown): value is PRDSection {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.key === 'string' && typeof v.label === 'string';
}

function parseSchema(descriptor: ExerciseDescriptor): PRDSection[] {
  const block = descriptor.preset_context_blocks?.find(
    (b) => b.id === 'prd_schema',
  );
  if (!block?.body) return [];
  try {
    const parsed: unknown = JSON.parse(block.body);
    if (typeof parsed !== 'object' || parsed === null) return [];
    const p = parsed as Record<string, unknown>;
    if (!Array.isArray(p.sections)) return [];
    return p.sections.filter(isSection);
  } catch {
    return [];
  }
}

function renderMarkdown(
  sections: ReadonlyArray<PRDSection>,
  answers: Readonly<Record<string, string>>,
): string {
  const today = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    '# Lightweight PRD',
    '',
    `_Drafted ${today} · Lesson 5.3 · Module 5_`,
    '',
  ];
  for (const s of sections) {
    const v = (answers[s.key] ?? '').trim();
    if (!v) continue;
    lines.push(`## ${s.label}`, '', v, '');
  }
  return lines.join('\n');
}

export function PRDBuilder({
  exerciseDescriptor,
  track = null,
  lessonId = 'm5.3',
}: PRDBuilderProps) {
  const sections = useMemo(() => parseSchema(exerciseDescriptor), [exerciseDescriptor]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const update = useCallback((key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const hasPII = useMemo(
    () => Object.values(answers).some((v) => detectPII(v)),
    [answers],
  );
  const filledCount = sections.filter(
    (s) => (answers[s.key] ?? '').trim().length > 0,
  ).length;
  // PRDs ship even with a couple of sections rough — require a working
  // majority (>=6 of 9) rather than every box filled.
  const minRequired = Math.max(1, Math.ceil(sections.length * 0.66));
  const enoughFilled = filledCount >= minRequired;

  const markdown = useMemo(
    () => renderMarkdown(sections, answers),
    [sections, answers],
  );

  if (sections.length === 0) {
    return (
      <LedgerCard variant="recessed" className="p-5">
        <p className="text-sm text-[var(--ledger-muted)]">
          No PRD schema seeded for this exercise.
        </p>
      </LedgerCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <KickerLabel tone="muted">PRD · {sections.length} sections</KickerLabel>
        <span className="font-mono text-xs text-[var(--ledger-muted)] tabular-nums">
          {filledCount}/{sections.length}
        </span>
      </div>

      <LedgerCard variant="standard" className="p-5 space-y-6">
        {sections.map((section) => {
          const fieldId = `m5-3-${section.key}`;
          return (
            <div key={section.key}>
              <label
                htmlFor={fieldId}
                className="block font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ledger-ink-2)] mb-2"
              >
                {section.label}
              </label>
              <textarea
                id={fieldId}
                rows={3}
                placeholder={section.placeholder}
                value={answers[section.key] ?? ''}
                onChange={(e) => update(section.key, e.target.value)}
                aria-describedby={section.help ? `${fieldId}-help` : undefined}
                className={
                  'block w-full bg-[var(--ledger-paper)] border border-[var(--ledger-rule-strong)] ' +
                  'rounded-[2px] px-3 py-2 text-[var(--ledger-ink)] ' +
                  'placeholder:text-[var(--ledger-muted)] ' +
                  'transition-colors duration-[120ms] ease-[cubic-bezier(0.4,0,0.2,1)] ' +
                  'focus:outline-none focus:border-[var(--ledger-ink)] ' +
                  'focus:border-l-[2px] focus:border-l-[var(--ledger-accent)]'
                }
              />
              {section.help ? (
                <p
                  id={`${fieldId}-help`}
                  className="mt-2 text-sm text-[var(--ledger-muted)]"
                >
                  {section.help}
                </p>
              ) : null}
            </div>
          );
        })}
        <PIIWarning visible={hasPII} />
      </LedgerCard>

      <div className="flex items-center gap-3">
        <SaveAsArtifactButton
          type="prd"
          title="Lightweight PRD — Lesson 5.3"
          body_md={markdown}
          lesson_id={lessonId}
          track={track}
          disabled={!enoughFilled || hasPII}
          disabledReason={
            hasPII
              ? 'Remove customer data first'
              : `Fill at least ${minRequired} of ${sections.length} sections before saving`
          }
        />
      </div>
    </div>
  );
}
