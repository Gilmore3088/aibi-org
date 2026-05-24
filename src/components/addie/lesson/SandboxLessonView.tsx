'use client';

// SandboxLessonView — bounded prompt-builder for single-mode exercises
// (M2.3, M3.5, and any other single-mode sandbox lesson). Renders the
// exercise's preset prompts, lever toggles, data-slot inputs (with a
// client-side PII pre-flight), and a Run button that POSTs to
// /api/sandbox/run. The model output renders inline as a continuous
// markdown-ish response with a mono-caps metadata strip and a save-to-
// Toolbox affordance.
//
// system_prompt and lever_directives never reach this component — only
// the client-safe descriptors carried on payload.interactiveExercise.

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
import type { LessonPayload } from './types';

type Provider = 'anthropic' | 'openai' | 'google';

interface SandboxRunResult {
  sessionId: string;
  provider: Provider;
  outputText: string;
  tokensUsed: number;
  flagged: boolean;
}

const PROVIDERS: ReadonlyArray<{ id: Provider; label: string }> = [
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'google', label: 'Gemini' },
];

interface SandboxLessonViewProps {
  readonly payload: LessonPayload;
}

export function SandboxLessonView({ payload }: SandboxLessonViewProps) {
  const exercise = payload.interactiveExercise;
  const exerciseId = payload.lesson.exercise_id;

  const allowProviderSwitch = exercise?.allow_provider_switch ?? true;
  const defaultProvider: Provider = exercise?.default_provider ?? 'anthropic';

  const [provider, setProvider] = useState<Provider>(defaultProvider);
  const [leverValues, setLeverValues] = useState<Record<string, string>>({});
  const [slotValues, setSlotValues] = useState<Record<string, string>>({});
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SandboxRunResult | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [error, setError] = useState<FriendlyError | null>(null);

  // Pre-select the first option for each lever so the Run button gives
  // a useful response on the very first click — the author has chosen
  // sensible defaults via option ordering.
  useEffect(() => {
    if (!exercise?.levers) return;
    setLeverValues((prev) => {
      const next = { ...prev };
      for (const l of exercise.levers ?? []) {
        if (!next[l.key] && l.options.length > 0) {
          next[l.key] = l.options[0].id;
        }
      }
      return next;
    });
  }, [exercise]);

  const requiredSlotsFilled = useMemo(() => {
    if (!exercise?.data_slots) return true;
    return (exercise.data_slots ?? []).every(
      (s) => !s.required || (slotValues[s.key] ?? '').trim().length > 0,
    );
  }, [exercise, slotValues]);

  const piiBlocked = useMemo(
    () => Object.values(slotValues).some((v) => v && detectPII(v)),
    [slotValues],
  );

  const overLimit = useMemo(() => {
    if (!exercise?.data_slots) return false;
    return (exercise.data_slots ?? []).some(
      (s) => (slotValues[s.key]?.length ?? 0) > s.maxChars,
    );
  }, [exercise, slotValues]);

  if (!exerciseId || !exercise) {
    return (
      <p className="text-[var(--ledger-muted)]">
        This sandbox lesson has no exercise wired yet.
      </p>
    );
  }

  const canRun =
    !running && requiredSlotsFilled && !piiBlocked && !overLimit;

  function handlePresetSelect(id: string, body: string | undefined) {
    setSelectedPresets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    // Convenience: if the preset carries a body and the exercise has
    // exactly one data slot, pre-fill it. Saves a copy-paste step.
    const slots = exercise?.data_slots ?? [];
    if (body && slots.length === 1) {
      const k = slots[0].key;
      setSlotValues((prev) => ({ ...prev, [k]: body }));
    }
  }

  async function run() {
    setRunning(true);
    setError(null);
    setResult(null);
    setLatencyMs(null);
    const t0 = performance.now();
    try {
      const res = await fetch('/api/sandbox/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId,
          leverSelections: leverValues,
          dataSlotValues: slotValues,
          presetIds: selectedPresets,
          provider,
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
      const data = (await res.json()) as SandboxRunResult;
      setResult(data);
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

  const presets = exercise.preset_context_blocks ?? [];
  const levers = exercise.levers ?? [];
  const slots = exercise.data_slots ?? [];

  return (
    <section
      data-testid="sandbox-lesson-view"
      className="addie-course-surface mt-6"
      aria-label="Sandbox workbench"
    >
      <LedgerCard variant="feature" className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <KickerLabel tone="accent">Bounded Sandbox</KickerLabel>
          <KickerLabel tone="muted">No customer data</KickerLabel>
        </div>
        {exercise.task_scaffold ? (
          <p className="font-serif text-lg leading-relaxed text-[var(--ledger-ink)] mb-5">
            {exercise.task_scaffold}
          </p>
        ) : null}

        <div className="flex flex-col gap-5">
          {presets.length > 0 ? (
            <PresetPicker
              presets={presets}
              selected={selectedPresets}
              onSelect={handlePresetSelect}
              title={presets.length > 1 ? 'Pick a starter' : 'Starter (optional)'}
            />
          ) : null}

          {levers.length > 0 ? (
            <LeverControls
              levers={levers}
              values={leverValues}
              onChange={(k, v) => setLeverValues((prev) => ({ ...prev, [k]: v }))}
              disabled={running}
            />
          ) : null}

          {slots.length > 0 ? (
            <DataSlotInputs
              slots={slots}
              values={slotValues}
              onChange={(k, v) => setSlotValues((prev) => ({ ...prev, [k]: v }))}
              disabled={running}
            />
          ) : null}

          {allowProviderSwitch ? (
            <div>
              <KickerLabel tone="muted" id="sandbox-model-label">
                Model
              </KickerLabel>
              <div
                role="radiogroup"
                aria-labelledby="sandbox-model-label"
                className="mt-2 inline-flex border border-[var(--ledger-ink)] rounded-[2px] overflow-hidden"
              >
                {PROVIDERS.map((p) => {
                  const active = provider === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={running}
                      onClick={() => setProvider(p.id)}
                      className={`min-h-[44px] px-4 py-2 text-xs font-mono uppercase tracking-[0.12em] transition-colors ${
                        active
                          ? 'bg-[var(--ledger-ink)] text-[var(--ledger-paper)]'
                          : 'bg-[var(--ledger-paper)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-parch)]'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <LedgerButton
              onClick={run}
              loading={running}
              disabled={!canRun}
              size="md"
            >
              {running ? 'Running' : 'Run sandbox'}
            </LedgerButton>
            {!requiredSlotsFilled ? (
              <span className="text-sm text-[var(--ledger-muted)]">
                Fill the required field above to run.
              </span>
            ) : piiBlocked ? (
              <span className="text-sm text-[var(--ledger-weak)]">
                Remove the flagged pattern, then run.
              </span>
            ) : null}
          </div>
        </div>
      </LedgerCard>

      {error ? <ErrorPanel error={error} /> : null}

      {result ? (
        <OutputPanel
          result={result}
          latencyMs={latencyMs}
          payload={payload}
        />
      ) : null}
    </section>
  );
}

function ErrorPanel({ error }: { readonly error: FriendlyError }) {
  const border =
    error.tone === 'error'
      ? 'border-l-[var(--ledger-weak)]'
      : error.tone === 'warning'
        ? 'border-l-[var(--ledger-accent)]'
        : 'border-l-[var(--ledger-accent-2)]';
  return (
    <div
      role="alert"
      data-testid="sandbox-error"
      className={`mt-4 border-l-[3px] ${border} bg-[var(--ledger-paper)] px-4 py-3`}
    >
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ledger-ink-2)]">
        {error.title}
      </p>
      <p className="mt-1 text-sm text-[var(--ledger-ink)]">{error.detail}</p>
    </div>
  );
}

function OutputPanel({
  result,
  latencyMs,
  payload,
}: {
  readonly result: SandboxRunResult;
  readonly latencyMs: number | null;
  readonly payload: LessonPayload;
}) {
  return (
    <LedgerCard variant="standard" className="mt-5 p-5 sm:p-6" data-testid="sandbox-output">
      <div className="flex items-center justify-between gap-3 mb-3 border-b border-[var(--ledger-rule)] pb-3">
        <KickerLabel tone="accent">Model output</KickerLabel>
        <KickerLabel tone="muted">
          <span className="tabular-nums">
            {result.provider.toUpperCase()} ·{' '}
            {result.tokensUsed.toLocaleString()} tok
            {latencyMs !== null ? ` · ${latencyMs} ms` : ''}
            {result.flagged ? ' · flagged' : ''}
          </span>
        </KickerLabel>
      </div>
      <div className="font-serif text-base leading-relaxed text-[var(--ledger-ink)] whitespace-pre-wrap">
        {result.outputText}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <SaveAsArtifactButton
          type={payload.lesson.takeaway_artifact_type ?? 'starter_prompt_pack'}
          title={`${payload.lesson.title} — sandbox run`}
          body_md={`# ${payload.lesson.title}\n\n_Model: ${result.provider} · ${result.tokensUsed} tokens_\n\n${result.outputText}`}
          lesson_id={payload.lesson.id}
          track={payload.activeTrack ?? null}
        />
        <span className="text-xs text-[var(--ledger-muted)]">
          Save this output to your Toolbox to keep it.
        </span>
      </div>
    </LedgerCard>
  );
}
