'use client';

// SandboxLessonView — wraps /api/sandbox/run. The exercise_id on the
// lesson points at an addie.exercises row (Wave 2b authors the row).
// The shell delivers a minimal lever-free run UI; Wave 2b can add
// lever-aware variants per exercise.

import { useState } from 'react';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { SaveAsArtifactButton } from './SaveAsArtifactButton';
import type { LessonPayload } from './types';

type Provider = 'anthropic' | 'openai' | 'google';

interface SandboxRunResult {
  sessionId: string;
  provider: Provider;
  outputText: string;
  tokensUsed: number;
  flagged: boolean;
}

interface SandboxLessonViewProps {
  readonly payload: LessonPayload;
  /** Optional override map of {leverKey: value} the lesson author chooses to expose. */
  readonly initialLevers?: Record<string, string>;
  /** Optional override map of {dataSlotKey: value}. */
  readonly initialDataSlots?: Record<string, string>;
  /** Optional fixed preset ids. */
  readonly presetIds?: string[];
}

const PROVIDERS: ReadonlyArray<{ id: Provider; label: string }> = [
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'google', label: 'Gemini' },
];

export function SandboxLessonView({
  payload,
  initialLevers = {},
  initialDataSlots = {},
  presetIds = [],
}: SandboxLessonViewProps) {
  const exerciseId = payload.lesson.exercise_id;
  const [provider, setProvider] = useState<Provider>('anthropic');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SandboxRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!exerciseId) {
    return (
      <p className="text-[var(--ledger-muted)]">
        This sandbox lesson has no exercise wired yet. Wave 2b will seed the addie.exercises row
        that drives this lever set.
      </p>
    );
  }

  async function run() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/sandbox/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId,
          leverSelections: initialLevers,
          dataSlotValues: initialDataSlots,
          presetIds,
          provider,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        setError(body.message ?? body.error ?? `HTTP ${res.status}`);
        return;
      }
      const data = (await res.json()) as SandboxRunResult;
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown');
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <KickerLabel tone="muted">Model</KickerLabel>
          <div role="radiogroup" aria-label="Model" className="mt-1 inline-flex border border-[var(--ledger-ink)] rounded-[2px]">
            {PROVIDERS.map((p) => {
              const active = provider === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setProvider(p.id)}
                  className={`px-3 py-2 text-xs font-mono uppercase tracking-[0.12em] ${
                    active
                      ? 'bg-[var(--ledger-ink)] text-[var(--ledger-paper)]'
                      : 'bg-[var(--ledger-paper)] text-[var(--ledger-ink)]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
        <LedgerButton onClick={run} loading={running} disabled={running}>
          Run
        </LedgerButton>
      </div>
      {error ? (
        <div role="alert" className="border-l-[2px] border-l-[var(--ledger-weak)] bg-[var(--ledger-paper)] px-3 py-2 text-sm text-[var(--ledger-weak)]">
          {error}
        </div>
      ) : null}
      {result ? (
        <LedgerCard className="p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <KickerLabel tone="muted">
              {result.provider} · {result.tokensUsed} tokens{result.flagged ? ' · flagged' : ''}
            </KickerLabel>
            <SaveAsArtifactButton
              type={payload.lesson.takeaway_artifact_type ?? 'starter_prompt_pack'}
              title={`${payload.lesson.title} — run`}
              body_md={`# ${payload.lesson.title}\n\nProvider: ${result.provider}\n\n${result.outputText}`}
              lesson_id={payload.lesson.id}
              track={payload.activeTrack ?? null}
            />
          </div>
          <pre className="whitespace-pre-wrap font-sans text-[var(--ledger-ink)] text-base leading-relaxed">
            {result.outputText}
          </pre>
        </LedgerCard>
      ) : null}
    </div>
  );
}
