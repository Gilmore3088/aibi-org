'use client';

// SandboxABLessonView — A/B compare for m3.2 and other ab-mode exercises.
// Two configuration cards side by side, each with its own lever controls;
// a single shared data-slot input (most A/B exercises in this course pin
// the data and vary the levers, which is the pedagogical point); a single
// Run-both button that POSTs to /api/sandbox/ab; two output panels with
// a word-level diff highlight so the learner SEES what each lever combo
// changed. The "Save winner" CTA picks the focused panel's output and
// drops it into the Toolbox tagged with which lever combo produced it.

import { useEffect, useMemo, useState } from 'react';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { detectPII } from '@/components/addie/shared/PIIWarning';
import { SaveAsArtifactButton } from './SaveAsArtifactButton';
import { LeverControls } from './sandbox/LeverControls';
import { DataSlotInputs } from './sandbox/DataSlotInputs';
import { PresetPicker } from './sandbox/PresetPicker';
import { toFriendlyError, type FriendlyError } from './sandbox/sandboxErrors';
import { diffWords } from './sandbox/wordDiff';
import type { LessonPayload, SandboxLeverDescriptor } from './types';

interface AbResultRow {
  outputText: string;
  tokensUsed: number;
  flagged: boolean;
  provider: string;
  sessionId: string;
}

interface AbApiResponse {
  results: ReadonlyArray<{
    config: {
      leverSelections: Record<string, string>;
      dataSlotValues: Record<string, string>;
      presetIds: string[];
    };
    sessionId: string;
    outputText: string;
    tokensUsed: number;
    flagged: boolean;
    provider: string;
  }>;
}

interface SandboxABLessonViewProps {
  readonly payload: LessonPayload;
}

// Pick distinct default lever combos for A and B so the first run shows
// a meaningful contrast. We rotate each lever's option index by the
// column index, falling back to the first option.
function defaultLeverValuesFor(
  levers: ReadonlyArray<SandboxLeverDescriptor>,
  column: number,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of levers) {
    if (l.options.length === 0) continue;
    const idx = Math.min(column, l.options.length - 1);
    out[l.key] = l.options[idx].id;
  }
  return out;
}

export function SandboxABLessonView({ payload }: SandboxABLessonViewProps) {
  const exercise = payload.interactiveExercise;
  const exerciseId = payload.lesson.exercise_id;

  const levers = useMemo(() => exercise?.levers ?? [], [exercise]);
  const slots = useMemo(() => exercise?.data_slots ?? [], [exercise]);
  const presets = exercise?.preset_context_blocks ?? [];

  const [leverA, setLeverA] = useState<Record<string, string>>({});
  const [leverB, setLeverB] = useState<Record<string, string>>({});
  const [slotValues, setSlotValues] = useState<Record<string, string>>({});
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<AbResultRow[] | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [error, setError] = useState<FriendlyError | null>(null);
  const [focused, setFocused] = useState<0 | 1>(0);

  useEffect(() => {
    if (levers.length === 0) return;
    setLeverA((prev) =>
      Object.keys(prev).length > 0 ? prev : defaultLeverValuesFor(levers, 0),
    );
    setLeverB((prev) =>
      Object.keys(prev).length > 0 ? prev : defaultLeverValuesFor(levers, 1),
    );
  }, [levers]);

  const requiredSlotsFilled = useMemo(
    () =>
      slots.every(
        (s) => !s.required || (slotValues[s.key] ?? '').trim().length > 0,
      ),
    [slots, slotValues],
  );
  const piiBlocked = useMemo(
    () => Object.values(slotValues).some((v) => v && detectPII(v)),
    [slotValues],
  );
  const overLimit = useMemo(
    () =>
      slots.some(
        (s) => (slotValues[s.key]?.length ?? 0) > s.maxChars,
      ),
    [slots, slotValues],
  );

  if (!exerciseId || !exercise) {
    return (
      <p className="text-[var(--ledger-muted)]">
        This sandbox lesson has no exercise wired yet.
      </p>
    );
  }

  const canRun = !running && requiredSlotsFilled && !piiBlocked && !overLimit;

  function handlePresetSelect(id: string, body: string | undefined) {
    setSelectedPresets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    if (body && slots.length === 1) {
      const k = slots[0].key;
      setSlotValues((prev) => ({ ...prev, [k]: body }));
    }
  }

  async function runBoth() {
    setRunning(true);
    setError(null);
    setResults(null);
    setLatencyMs(null);
    const t0 = performance.now();
    try {
      const res = await fetch('/api/sandbox/ab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId,
          configs: [
            {
              leverSelections: leverA,
              dataSlotValues: slotValues,
              presetIds: selectedPresets,
            },
            {
              leverSelections: leverB,
              dataSlotValues: slotValues,
              presetIds: selectedPresets,
            },
          ],
        }),
      });
      const elapsed = Math.round(performance.now() - t0);
      setLatencyMs(elapsed);
      if (!res.ok) {
        const body = (await res
          .json()
          .catch(() => ({}))) as { error?: string; message?: string };
        setError(toFriendlyError(res.status, body.error, body.message));
        return;
      }
      const data = (await res.json()) as AbApiResponse;
      setResults(
        data.results.map((r) => ({
          outputText: r.outputText,
          tokensUsed: r.tokensUsed,
          flagged: r.flagged,
          provider: r.provider,
          sessionId: r.sessionId,
        })),
      );
    } catch (e) {
      setError(
        toFriendlyError(
          0,
          undefined,
          e instanceof Error ? e.message : 'unknown',
        ),
      );
    } finally {
      setRunning(false);
    }
  }

  const diff = results
    ? diffWords(results[0].outputText, results[1].outputText)
    : null;

  function labelForLevers(values: Record<string, string>): string {
    return levers
      .map((l) => {
        const opt = l.options.find((o) => o.id === values[l.key]);
        return opt ? `${l.label}: ${opt.label}` : null;
      })
      .filter(Boolean)
      .join(' · ');
  }

  return (
    <section
      data-testid="sandbox-ab-lesson-view"
      className="addie-course-surface mt-6"
      aria-label="Sandbox A/B compare"
    >
      <LedgerCard variant="feature" className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <KickerLabel tone="accent">Compare two prompts</KickerLabel>
          <KickerLabel tone="muted">Same data · different levers</KickerLabel>
        </div>
        {exercise.task_scaffold ? (
          <p className="font-serif text-lg leading-relaxed text-[var(--ledger-ink)] mb-5">
            {exercise.task_scaffold}
          </p>
        ) : null}

        {presets.length > 0 ? (
          <div className="mb-5">
            <PresetPicker
              presets={presets}
              selected={selectedPresets}
              onSelect={handlePresetSelect}
              title="Starter material"
              idScope="ab-shared"
            />
          </div>
        ) : null}

        {slots.length > 0 ? (
          <div className="mb-5">
            <DataSlotInputs
              slots={slots}
              values={slotValues}
              onChange={(k, v) => setSlotValues((prev) => ({ ...prev, [k]: v }))}
              idScope="ab-shared"
              disabled={running}
            />
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <ConfigCard
            label="A"
            levers={levers}
            values={leverA}
            onChange={(k, v) => setLeverA((prev) => ({ ...prev, [k]: v }))}
            running={running}
          />
          <ConfigCard
            label="B"
            levers={levers}
            values={leverB}
            onChange={(k, v) => setLeverB((prev) => ({ ...prev, [k]: v }))}
            running={running}
          />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <LedgerButton
            onClick={runBoth}
            loading={running}
            disabled={!canRun}
            size="md"
          >
            {running ? 'Running both' : 'Run both'}
          </LedgerButton>
          {!requiredSlotsFilled ? (
            <span className="text-sm text-[var(--ledger-muted)]">
              Fill the shared input above to compare.
            </span>
          ) : piiBlocked ? (
            <span className="text-sm text-[var(--ledger-weak)]">
              Remove the flagged pattern, then run.
            </span>
          ) : null}
        </div>
      </LedgerCard>

      {error ? (
        <div
          role="alert"
          data-testid="sandbox-error"
          className="mt-4 border-l-[3px] border-l-[var(--ledger-weak)] bg-[var(--ledger-paper)] px-4 py-3"
        >
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ledger-ink-2)]">
            {error.title}
          </p>
          <p className="mt-1 text-sm text-[var(--ledger-ink)]">{error.detail}</p>
        </div>
      ) : null}

      {results && diff ? (
        <>
          <div className="mt-5 grid gap-4 md:grid-cols-2" data-testid="sandbox-ab-output">
            <OutputColumn
              label="A"
              result={results[0]}
              tokens={diff.left}
              latencyMs={latencyMs}
              focused={focused === 0}
              onFocus={() => setFocused(0)}
            />
            <OutputColumn
              label="B"
              result={results[1]}
              tokens={diff.right}
              latencyMs={latencyMs}
              focused={focused === 1}
              onFocus={() => setFocused(1)}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SaveAsArtifactButton
              type={payload.lesson.takeaway_artifact_type ?? 'starter_prompt_pack'}
              title={`${payload.lesson.title} — winner (${focused === 0 ? 'A' : 'B'})`}
              body_md={`# ${payload.lesson.title}\n\n_Winner: ${
                focused === 0 ? 'A' : 'B'
              } · ${labelForLevers(focused === 0 ? leverA : leverB)}_\n\n${
                results[focused].outputText
              }`}
              lesson_id={payload.lesson.id}
              track={payload.activeTrack ?? null}
            />
            <span className="text-xs text-[var(--ledger-muted)]">
              Highlighted words show what each version produced uniquely.
              Click a panel to mark it as the winner, then save.
            </span>
          </div>
        </>
      ) : null}
    </section>
  );
}

function ConfigCard({
  label,
  levers,
  values,
  onChange,
  running,
}: {
  readonly label: string;
  readonly levers: ReadonlyArray<SandboxLeverDescriptor>;
  readonly values: Record<string, string>;
  readonly onChange: (key: string, value: string) => void;
  readonly running: boolean;
}) {
  return (
    <LedgerCard variant="recessed" className="p-4">
      <div className="flex items-center justify-between mb-3">
        <KickerLabel tone="accent">Version {label}</KickerLabel>
      </div>
      <LeverControls
        levers={levers}
        values={values}
        onChange={onChange}
        idScope={label.toLowerCase()}
        disabled={running}
      />
    </LedgerCard>
  );
}

function OutputColumn({
  label,
  result,
  tokens,
  latencyMs,
  focused,
  onFocus,
}: {
  readonly label: string;
  readonly result: AbResultRow;
  readonly tokens: ReadonlyArray<{ text: string; tag: 'same' | 'unique' }>;
  readonly latencyMs: number | null;
  readonly focused: boolean;
  readonly onFocus: () => void;
}) {
  return (
    <LedgerCard
      variant="standard"
      selected={focused}
      className={`p-4 cursor-pointer ${
        focused ? '' : 'opacity-95 hover:opacity-100'
      }`}
      onClick={onFocus}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFocus();
        }
      }}
      aria-pressed={focused}
      aria-label={`Version ${label} output ${focused ? 'selected' : 'not selected'}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3 border-b border-[var(--ledger-rule)] pb-2.5">
        <KickerLabel tone="accent">Version {label}</KickerLabel>
        <KickerLabel tone="muted">
          <span className="tabular-nums">
            {result.provider.toUpperCase()} ·{' '}
            {result.tokensUsed.toLocaleString()} tok
            {latencyMs !== null ? ` · ${latencyMs} ms` : ''}
            {result.flagged ? ' · flagged' : ''}
          </span>
        </KickerLabel>
      </div>
      <div className="font-serif text-[15px] leading-relaxed text-[var(--ledger-ink)] whitespace-pre-wrap">
        {tokens.map((t, i) =>
          t.tag === 'unique' ? (
            <mark
              key={i}
              className="bg-[var(--ledger-accent-a06,rgba(124,88,20,0.10))] text-[var(--ledger-ink)] px-[2px]"
            >
              {t.text}
            </mark>
          ) : (
            <span key={i}>{t.text}</span>
          ),
        )}
      </div>
    </LedgerCard>
  );
}
