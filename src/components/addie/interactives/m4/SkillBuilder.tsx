'use client';

// SkillBuilder — Module 4.2 and 4.3 interactive widget.
//
// Renders a multi-step form that produces a Toolbox `skill` or
// `skill_template` artifact whose body_md is a JSON-encoded skill body
// matching the live sandbox-service contract:
//   { exerciseId, fixedLeverSelections, slotSchema, presetIds? }
//
// Seed contract (see supabase/seed/m4_addie.sql):
//   preset_context_blocks[0] is `builder_sources` — JSON array of source
//     exercises the learner can pick from. Each entry has
//     { exercise_id, label, leversAvailable[], suggestedSlots[] }.
//   preset_context_blocks[1] (optional, only on m4-3-role-skill) is
//     `track_defaults` — JSON object keyed by track id with
//     { sourceExerciseId, lockedLevers, slots, suggestedTitle }.
//
// In role-skill mode (m4.3) the widget pre-selects from the track defaults
// for the active learner track. The learner can still override any choice.

import { useMemo, useState, useCallback } from 'react';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { LedgerInput } from '@/components/addie/shared/LedgerInput';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import type { Track } from '@/components/addie/lesson/types';

interface PresetContextBlock {
  readonly id: string;
  readonly label: string;
  readonly body?: string;
}

interface LeverOption {
  readonly id: string;
  readonly label: string;
}

interface LeverDescriptor {
  readonly key: string;
  readonly label: string;
  readonly options: ReadonlyArray<LeverOption>;
}

interface SlotDescriptor {
  readonly key: string;
  readonly label: string;
  readonly help?: string;
}

interface SourceExercise {
  readonly exercise_id: string;
  readonly label: string;
  readonly leversAvailable: ReadonlyArray<LeverDescriptor>;
  readonly suggestedSlots: ReadonlyArray<SlotDescriptor>;
}

interface TrackDefault {
  readonly sourceExerciseId: string;
  readonly lockedLevers: Readonly<Record<string, string>>;
  readonly slots: ReadonlyArray<SlotDescriptor>;
  readonly suggestedTitle: string;
}

export interface SkillBuilderDescriptor {
  readonly preset_context_blocks: ReadonlyArray<PresetContextBlock>;
}

export type BuilderMode = 'template' | 'role-skill';

export interface SkillBuilderProps {
  readonly exerciseDescriptor: SkillBuilderDescriptor;
  readonly mode?: BuilderMode;
  readonly track?: Track | null;
  /** Called after a successful save. */
  readonly onSaved?: (id: string) => void;
  /** Optional override for the create endpoint — defaults to /api/addie/toolbox/items. */
  readonly createEndpoint?: string;
}

interface LeverSelection {
  readonly leverKey: string;
  /** Option id, or null for "let learner choose at run time." */
  readonly value: string | null;
}

interface SlotInput {
  readonly key: string;
  readonly label: string;
  readonly help: string;
}

interface ParsedDescriptor {
  readonly sources: ReadonlyArray<SourceExercise>;
  readonly trackDefaults: Readonly<Record<string, TrackDefault>>;
}

const MAX_SLOTS = 3;
const MIN_SLOTS = 1;

function parseDescriptor(d: SkillBuilderDescriptor): ParsedDescriptor {
  const sourcesBlock = d.preset_context_blocks.find((b) => b.id === 'builder_sources');
  const trackBlock = d.preset_context_blocks.find((b) => b.id === 'track_defaults');

  let sources: SourceExercise[] = [];
  if (sourcesBlock?.body) {
    try {
      const raw = JSON.parse(sourcesBlock.body) as unknown;
      if (Array.isArray(raw)) {
        sources = raw.filter((s): s is SourceExercise => {
          if (typeof s !== 'object' || s === null) return false;
          const obj = s as Record<string, unknown>;
          return (
            typeof obj.exercise_id === 'string' &&
            typeof obj.label === 'string' &&
            Array.isArray(obj.leversAvailable) &&
            Array.isArray(obj.suggestedSlots)
          );
        });
      }
    } catch {
      sources = [];
    }
  }

  let trackDefaults: Record<string, TrackDefault> = {};
  if (trackBlock?.body) {
    try {
      const raw = JSON.parse(trackBlock.body) as unknown;
      if (raw && typeof raw === 'object') {
        trackDefaults = raw as Record<string, TrackDefault>;
      }
    } catch {
      trackDefaults = {};
    }
  }

  return { sources, trackDefaults };
}

function buildInitialSlots(slots: ReadonlyArray<SlotDescriptor>): SlotInput[] {
  if (slots.length === 0) {
    return [{ key: 'input_1', label: 'Input', help: '' }];
  }
  return slots.slice(0, MAX_SLOTS).map((s) => ({
    key: s.key,
    label: s.label,
    help: s.help ?? '',
  }));
}

export function SkillBuilder({
  exerciseDescriptor,
  mode = 'template',
  track = null,
  onSaved,
  createEndpoint = '/api/addie/toolbox/items',
}: SkillBuilderProps) {
  const { sources, trackDefaults } = useMemo(
    () => parseDescriptor(exerciseDescriptor),
    [exerciseDescriptor]
  );

  const trackDefault: TrackDefault | null =
    mode === 'role-skill' && track && trackDefaults[track] ? trackDefaults[track] : null;

  const initialSource =
    sources.find((s) => s.exercise_id === trackDefault?.sourceExerciseId) ?? sources[0] ?? null;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [sourceId, setSourceId] = useState<string | null>(initialSource?.exercise_id ?? null);
  const [leverSelections, setLeverSelections] = useState<LeverSelection[]>(() => {
    if (!initialSource) return [];
    return initialSource.leversAvailable.map((lever) => ({
      leverKey: lever.key,
      value: trackDefault?.lockedLevers?.[lever.key] ?? null,
    }));
  });
  const [slots, setSlots] = useState<SlotInput[]>(() =>
    buildInitialSlots(trackDefault?.slots ?? initialSource?.suggestedSlots ?? [])
  );
  const [title, setTitle] = useState<string>(trackDefault?.suggestedTitle ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSource: SourceExercise | null = useMemo(
    () => sources.find((s) => s.exercise_id === sourceId) ?? null,
    [sources, sourceId]
  );

  const handleSourceChange = useCallback(
    (newSourceId: string) => {
      setSourceId(newSourceId);
      const src = sources.find((s) => s.exercise_id === newSourceId);
      if (!src) return;
      setLeverSelections(
        src.leversAvailable.map((lever) => ({ leverKey: lever.key, value: null }))
      );
      setSlots(buildInitialSlots(src.suggestedSlots));
    },
    [sources]
  );

  const updateLever = useCallback((leverKey: string, value: string | null) => {
    setLeverSelections((prev) =>
      prev.map((sel) => (sel.leverKey === leverKey ? { ...sel, value } : sel))
    );
  }, []);

  const updateSlot = useCallback((index: number, patch: Partial<SlotInput>) => {
    setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  }, []);

  const addSlot = useCallback(() => {
    setSlots((prev) => {
      if (prev.length >= MAX_SLOTS) return prev;
      return [...prev, { key: `input_${prev.length + 1}`, label: '', help: '' }];
    });
  }, []);

  const removeSlot = useCallback((index: number) => {
    setSlots((prev) => {
      if (prev.length <= MIN_SLOTS) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const skillBody = useMemo(() => {
    if (!activeSource) return null;
    const fixedLeverSelections: Record<string, string> = {};
    for (const sel of leverSelections) {
      if (sel.value !== null && sel.value !== '') {
        fixedLeverSelections[sel.leverKey] = sel.value;
      }
    }
    const slotSchema = slots
      .filter((s) => s.key.trim() !== '' && s.label.trim() !== '')
      .map((s) => ({ key: s.key.trim(), label: s.label.trim() }));
    return {
      exerciseId: activeSource.exercise_id,
      fixedLeverSelections,
      slotSchema,
    };
  }, [activeSource, leverSelections, slots]);

  const validationError = useMemo(() => {
    if (!activeSource) return 'Pick a source exercise.';
    if (!title.trim()) return 'Name your skill.';
    if (!skillBody || skillBody.slotSchema.length < MIN_SLOTS) {
      return 'At least one input slot needs a key and a label.';
    }
    return null;
  }, [activeSource, title, skillBody]);

  const handleSave = useCallback(async () => {
    if (validationError || !skillBody) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const artifactType = mode === 'role-skill' ? 'skill' : 'skill_template';
      const res = await fetch(createEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          type: artifactType,
          title: title.trim(),
          body_md: JSON.stringify(skillBody),
          track,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `Save failed (${res.status})`);
        return;
      }
      const data = (await res.json()) as { id: string };
      onSaved?.(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [validationError, skillBody, mode, title, track, createEndpoint, onSaved]);

  if (sources.length === 0) {
    return (
      <LedgerCard variant="standard" className="p-6">
        <KickerLabel tone="muted">Skill builder</KickerLabel>
        <p className="mt-2 text-[var(--ledger-muted)]">
          No source exercises have been seeded. Check m4-2 / m4-3 preset_context_blocks.
        </p>
      </LedgerCard>
    );
  }

  return (
    <section aria-labelledby="skill-builder-heading" className="space-y-4">
      <header className="flex items-baseline justify-between">
        <KickerLabel tone="muted">Step {step} of 4</KickerLabel>
        <KickerLabel tone="muted">
          {mode === 'role-skill' ? 'Role skill' : 'Skill template'}
        </KickerLabel>
      </header>

      <LedgerCard variant="standard" className="p-6">
        <h3
          id="skill-builder-heading"
          className="font-serif text-xl text-[var(--ledger-ink)]"
        >
          {step === 1 && 'Pick a source exercise'}
          {step === 2 && 'Lock the choices'}
          {step === 3 && 'Name your input slots'}
          {step === 4 && 'Review and save'}
        </h3>

        {step === 1 ? (
          <div className="mt-5 space-y-3" role="radiogroup" aria-label="Source exercise">
            {sources.map((src) => {
              const selected = src.exercise_id === sourceId;
              return (
                <button
                  key={src.exercise_id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => handleSourceChange(src.exercise_id)}
                  className={`block w-full text-left p-4 rounded-[3px] border transition-colors duration-[120ms] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ledger-ink)] ${
                    selected
                      ? 'border-[var(--ledger-accent)] bg-[var(--ledger-paper)]'
                      : 'border-[var(--ledger-rule)] bg-[var(--ledger-paper)] hover:border-[var(--ledger-rule-strong)]'
                  }`}
                >
                  <KickerLabel tone={selected ? 'accent' : 'muted'}>
                    {src.exercise_id}
                  </KickerLabel>
                  <p className="mt-1 text-[var(--ledger-ink)]">{src.label}</p>
                </button>
              );
            })}
          </div>
        ) : null}

        {step === 2 && activeSource ? (
          <div className="mt-5 space-y-5">
            {activeSource.leversAvailable.length === 0 ? (
              <p className="text-[var(--ledger-muted)]">
                This source has no controls to lock. Move on.
              </p>
            ) : (
              activeSource.leversAvailable.map((lever) => {
                const sel = leverSelections.find((s) => s.leverKey === lever.key);
                const currentValue = sel?.value ?? '';
                const selectId = `lever-${lever.key}`;
                return (
                  <div key={lever.key}>
                    <label
                      htmlFor={selectId}
                      className="block font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ledger-ink-2)] mb-2"
                    >
                      {lever.label}
                    </label>
                    <select
                      id={selectId}
                      value={currentValue}
                      onChange={(e) =>
                        updateLever(lever.key, e.target.value === '' ? null : e.target.value)
                      }
                      className="block w-full bg-[var(--ledger-paper)] border border-[var(--ledger-rule-strong)] rounded-[2px] px-3 py-2 min-h-[44px] text-[var(--ledger-ink)] focus:outline-none focus:border-[var(--ledger-ink)]"
                    >
                      <option value="">Let me choose at run time</option>
                      {lever.options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })
            )}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-5 space-y-5">
            {slots.map((slot, i) => (
              <div
                key={i}
                className="p-4 rounded-[3px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] space-y-3"
              >
                <div className="flex items-baseline justify-between">
                  <KickerLabel tone="muted">Slot {i + 1}</KickerLabel>
                  {slots.length > MIN_SLOTS ? (
                    <button
                      type="button"
                      onClick={() => removeSlot(i)}
                      className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ledger-weak)] hover:underline"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <LedgerInput
                  label="Slot key"
                  value={slot.key}
                  onChange={(e) => updateSlot(i, { key: e.target.value })}
                  help="Short snake_case identifier, e.g. rule_excerpt."
                />
                <LedgerInput
                  label="Label"
                  value={slot.label}
                  onChange={(e) => updateSlot(i, { label: e.target.value })}
                  help="What future-you will see when running this skill."
                />
                <LedgerInput
                  label="Help"
                  value={slot.help}
                  onChange={(e) => updateSlot(i, { help: e.target.value })}
                  help="One line: what to paste in. Remind yourself: no PII."
                />
              </div>
            ))}
            {slots.length < MAX_SLOTS ? (
              <LedgerButton variant="secondary" size="sm" onClick={addSlot}>
                Add slot
              </LedgerButton>
            ) : null}
          </div>
        ) : null}

        {step === 4 && skillBody ? (
          <div className="mt-5 space-y-5">
            <LedgerInput
              label="Skill name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              help="What you will recognize this skill as in your Toolbox."
            />
            <div>
              <KickerLabel tone="muted">Skill JSON preview</KickerLabel>
              <pre className="mt-2 p-3 rounded-[2px] bg-[var(--ledger-parch)] text-[var(--ledger-ink-2)] text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(skillBody, null, 2)}
              </pre>
            </div>
            {error ? (
              <p role="alert" className="text-[var(--ledger-weak)] text-sm">
                {error}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          <LedgerButton
            variant="tertiary"
            disabled={step === 1}
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s))}
          >
            Back
          </LedgerButton>
          {step < 4 ? (
            <LedgerButton
              variant="primary"
              disabled={step === 1 && !sourceId}
              onClick={() => setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s))}
            >
              Next
            </LedgerButton>
          ) : (
            <LedgerButton
              variant="primary"
              loading={saving}
              disabled={validationError !== null || saving}
              onClick={handleSave}
            >
              Save skill
            </LedgerButton>
          )}
        </div>
      </LedgerCard>
    </section>
  );
}
