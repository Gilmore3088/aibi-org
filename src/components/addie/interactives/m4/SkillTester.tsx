'use client';

// SkillTester — Module 4.4 interactive widget.
//
// Lists the learner's saved skills (GET /api/addie/toolbox/items, then
// filtered to type='skill'), lets them pick one, fills the slot inputs,
// hits /api/skill/run with { skillId, inputs, provider }, renders the
// response, and lets the learner attach one-line guardrail notes that
// PATCH back into the skill's body_md (adding a `guardrails` field).
//
// Seed contract (see supabase/seed/m4_addie.sql, m4-4-test-refine):
//   preset_context_blocks[0] is `guardrails` — JSON array of
//     { id, prompt, why } items the learner walks at the end.

import { useEffect, useMemo, useState, useCallback } from 'react';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { LedgerInput } from '@/components/addie/shared/LedgerInput';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

interface PresetContextBlock {
  readonly id: string;
  readonly label: string;
  readonly body?: string;
}

interface GuardrailPrompt {
  readonly id: string;
  readonly prompt: string;
  readonly why: string;
}

export interface SkillTesterDescriptor {
  readonly preset_context_blocks: ReadonlyArray<PresetContextBlock>;
}

interface SavedSkillListItem {
  readonly id: string;
  readonly type: string;
  readonly title: string;
}

interface SkillBodyShape {
  readonly exerciseId: string;
  readonly fixedLeverSelections: Readonly<Record<string, string>>;
  readonly slotSchema: ReadonlyArray<{ key: string; label?: string }>;
  readonly presetIds?: ReadonlyArray<string>;
  readonly guardrails?: ReadonlyArray<{ id: string; prompt: string; note: string }>;
}

interface GuardrailNote {
  readonly id: string;
  readonly prompt: string;
  readonly note: string;
}

interface SkillTesterProps {
  readonly exerciseDescriptor: SkillTesterDescriptor;
  /** Endpoint to list+load skills. Defaults to /api/addie/toolbox/items. */
  readonly toolboxEndpoint?: string;
  /** Endpoint to run a skill. Defaults to /api/skill/run. */
  readonly runEndpoint?: string;
}

interface ListResponse {
  readonly items: ReadonlyArray<SavedSkillListItem>;
}

interface ItemResponse {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly latest?: { body_md: string; version: number } | null;
}

interface RunResponse {
  readonly sessionId?: string;
  readonly outputText?: string;
  readonly error?: string;
}

function parseGuardrails(d: SkillTesterDescriptor): GuardrailPrompt[] {
  const block = d.preset_context_blocks.find((b) => b.id === 'guardrails');
  if (!block?.body) return [];
  try {
    const raw = JSON.parse(block.body) as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter((g): g is GuardrailPrompt => {
      if (typeof g !== 'object' || g === null) return false;
      const obj = g as Record<string, unknown>;
      return (
        typeof obj.id === 'string' &&
        typeof obj.prompt === 'string' &&
        typeof obj.why === 'string'
      );
    });
  } catch {
    return [];
  }
}

function parseSkillBody(raw: string): SkillBodyShape | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return null;
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.exerciseId !== 'string' || !Array.isArray(obj.slotSchema)) return null;
    return parsed as SkillBodyShape;
  } catch {
    return null;
  }
}

export function SkillTester({
  exerciseDescriptor,
  toolboxEndpoint = '/api/addie/toolbox/items',
  runEndpoint = '/api/skill/run',
}: SkillTesterProps) {
  const guardrails = useMemo(() => parseGuardrails(exerciseDescriptor), [exerciseDescriptor]);

  const [skills, setSkills] = useState<SavedSkillListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [skillBody, setSkillBody] = useState<SkillBodyShape | null>(null);
  const [slotInputs, setSlotInputs] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<GuardrailNote[]>([]);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(toolboxEndpoint, { method: 'GET' });
        if (!res.ok) {
          if (!cancelled) setError(`Could not load Toolbox (${res.status})`);
          return;
        }
        const data = (await res.json()) as ListResponse;
        if (cancelled) return;
        const onlySkills = data.items.filter(
          (it) => it.type === 'skill' || it.type === 'skill_template'
        );
        setSkills(onlySkills);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load Toolbox');
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toolboxEndpoint]);

  const handleSelectSkill = useCallback(
    async (id: string) => {
      setSelectedSkillId(id);
      setSkillBody(null);
      setSlotInputs({});
      setOutput(null);
      setNotes([]);
      setNotesSaved(false);
      setError(null);
      try {
        const res = await fetch(`${toolboxEndpoint}/${id}`, { method: 'GET' });
        if (!res.ok) {
          setError(`Could not load skill (${res.status})`);
          return;
        }
        const item = (await res.json()) as ItemResponse;
        if (!item.latest) {
          setError('This skill has no saved body.');
          return;
        }
        const body = parseSkillBody(item.latest.body_md);
        if (!body) {
          setError('Skill body is not valid JSON.');
          return;
        }
        setSkillBody(body);
        const initial: Record<string, string> = {};
        for (const slot of body.slotSchema) initial[slot.key] = '';
        setSlotInputs(initial);
        if (body.guardrails) {
          setNotes(
            body.guardrails.map((g) => ({ id: g.id, prompt: g.prompt, note: g.note }))
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Load failed');
      }
    },
    [toolboxEndpoint]
  );

  const handleRun = useCallback(async () => {
    if (!selectedSkillId || !skillBody) return;
    setRunning(true);
    setOutput(null);
    setError(null);
    try {
      const res = await fetch(runEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ skillId: selectedSkillId, inputs: slotInputs }),
      });
      const data = (await res.json()) as RunResponse;
      if (!res.ok || data.error) {
        setError(data.error ?? `Run failed (${res.status})`);
        return;
      }
      setOutput(data.outputText ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Run failed');
    } finally {
      setRunning(false);
    }
  }, [selectedSkillId, skillBody, slotInputs, runEndpoint]);

  const updateNote = useCallback((id: string, prompt: string, note: string) => {
    setNotes((prev) => {
      const exists = prev.find((n) => n.id === id);
      if (exists) return prev.map((n) => (n.id === id ? { ...n, note } : n));
      return [...prev, { id, prompt, note }];
    });
    setNotesSaved(false);
  }, []);

  const handleSaveNotes = useCallback(async () => {
    if (!selectedSkillId || !skillBody) return;
    setSavingNotes(true);
    setError(null);
    try {
      const next: SkillBodyShape = {
        ...skillBody,
        guardrails: notes.filter((n) => n.note.trim() !== ''),
      };
      const res = await fetch(`${toolboxEndpoint}/${selectedSkillId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ body_md: JSON.stringify(next) }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `Save failed (${res.status})`);
        return;
      }
      setSkillBody(next);
      setNotesSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSavingNotes(false);
    }
  }, [selectedSkillId, skillBody, notes, toolboxEndpoint]);

  if (loadingList) {
    return (
      <LedgerCard variant="standard" className="p-6">
        <KickerLabel tone="muted">Loading your skills…</KickerLabel>
      </LedgerCard>
    );
  }

  if (skills.length === 0) {
    return (
      <LedgerCard variant="standard" className="p-6">
        <KickerLabel tone="muted">No skills saved yet</KickerLabel>
        <p className="mt-2 text-[var(--ledger-muted)]">
          Build a skill in Lesson 4.2 or 4.3 first, then come back here to test it.
        </p>
      </LedgerCard>
    );
  }

  return (
    <section aria-labelledby="skill-tester-heading" className="space-y-4">
      <KickerLabel tone="muted">Test, refine, guardrail-check</KickerLabel>

      <LedgerCard variant="standard" className="p-6">
        <h3
          id="skill-tester-heading"
          className="font-serif text-xl text-[var(--ledger-ink)]"
        >
          Pick a saved skill
        </h3>
        <div className="mt-4 space-y-2" role="radiogroup" aria-label="Your saved skills">
          {skills.map((skill) => {
            const selected = skill.id === selectedSkillId;
            return (
              <button
                key={skill.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => handleSelectSkill(skill.id)}
                className={`block w-full text-left p-3 rounded-[3px] border transition-colors duration-[120ms] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ledger-ink)] ${
                  selected
                    ? 'border-[var(--ledger-accent)] bg-[var(--ledger-paper)]'
                    : 'border-[var(--ledger-rule)] bg-[var(--ledger-paper)] hover:border-[var(--ledger-rule-strong)]'
                }`}
              >
                <KickerLabel tone={selected ? 'accent' : 'muted'}>{skill.type}</KickerLabel>
                <p className="mt-1 text-[var(--ledger-ink)]">{skill.title}</p>
              </button>
            );
          })}
        </div>
      </LedgerCard>

      {skillBody ? (
        <LedgerCard variant="standard" className="p-6">
          <h3 className="font-serif text-xl text-[var(--ledger-ink)]">Fill the inputs</h3>
          <p className="mt-2 text-sm text-[var(--ledger-muted)]">
            Use realistic synthetic material — public regulator text, a described
            situation, a generic vendor category. No customer identifiers, no
            MNPI, no internal supervisory content.
          </p>
          <div className="mt-4 space-y-4">
            {skillBody.slotSchema.map((slot) => (
              <LedgerInput
                key={slot.key}
                label={slot.label ?? slot.key}
                value={slotInputs[slot.key] ?? ''}
                onChange={(e) =>
                  setSlotInputs((prev) => ({ ...prev, [slot.key]: e.target.value }))
                }
              />
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <LedgerButton variant="primary" loading={running} onClick={handleRun}>
              Run skill
            </LedgerButton>
          </div>
        </LedgerCard>
      ) : null}

      {error ? (
        <LedgerCard variant="standard" className="p-4">
          <p role="alert" className="text-[var(--ledger-weak)] text-sm">
            {error}
          </p>
        </LedgerCard>
      ) : null}

      {output !== null ? (
        <LedgerCard variant="feature" className="p-6">
          <KickerLabel tone="accent">Model output</KickerLabel>
          <pre
            aria-live="polite"
            className="mt-3 whitespace-pre-wrap text-[var(--ledger-ink-2)] text-sm font-sans"
          >
            {output}
          </pre>
        </LedgerCard>
      ) : null}

      {output !== null && guardrails.length > 0 ? (
        <LedgerCard variant="standard" className="p-6">
          <h3 className="font-serif text-xl text-[var(--ledger-ink)]">Guardrail check</h3>
          <p className="mt-2 text-sm text-[var(--ledger-muted)]">
            One line per question. Notes attach to the skill so future-you knows
            what to watch for.
          </p>
          <div className="mt-4 space-y-4">
            {guardrails.map((g) => {
              const existing = notes.find((n) => n.id === g.id);
              return (
                <div
                  key={g.id}
                  className="p-4 rounded-[3px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)]"
                >
                  <KickerLabel tone="muted">{g.prompt}</KickerLabel>
                  <p className="mt-2 text-sm text-[var(--ledger-muted)]">{g.why}</p>
                  <div className="mt-3">
                    <LedgerInput
                      label="Your note"
                      value={existing?.note ?? ''}
                      onChange={(e) => updateNote(g.id, g.prompt, e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex items-center justify-end gap-3">
            {notesSaved ? (
              <KickerLabel tone="accent">Notes saved</KickerLabel>
            ) : null}
            <LedgerButton
              variant="primary"
              loading={savingNotes}
              onClick={handleSaveNotes}
            >
              Save guardrail notes
            </LedgerButton>
          </div>
        </LedgerCard>
      ) : null}
    </section>
  );
}
