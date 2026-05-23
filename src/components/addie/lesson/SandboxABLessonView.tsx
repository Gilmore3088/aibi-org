'use client';

// SandboxABLessonView — wraps /api/sandbox/ab. Compares 2–3 configurations
// of the same exercise. Wave 2b authors per-exercise lever payloads; the
// shell ships with a fallback "two empty configs" smoke that proves the
// loop end-to-end against any exercise.

import { useState } from 'react';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { SaveAsArtifactButton } from './SaveAsArtifactButton';
import type { LessonPayload } from './types';

interface AbConfig {
  leverSelections: Record<string, string>;
  dataSlotValues: Record<string, string>;
  presetIds: string[];
}

interface AbConfigResult extends AbConfig {
  outputText: string;
  tokensUsed: number;
  flagged: boolean;
  provider: string;
  sessionId: string;
  label?: string;
}

interface SandboxABLessonViewProps {
  readonly payload: LessonPayload;
  readonly configs?: ReadonlyArray<AbConfig & { label?: string }>;
}

const FALLBACK_CONFIGS: ReadonlyArray<AbConfig & { label: string }> = [
  { label: 'A', leverSelections: {}, dataSlotValues: {}, presetIds: [] },
  { label: 'B', leverSelections: {}, dataSlotValues: {}, presetIds: [] },
];

export function SandboxABLessonView({ payload, configs }: SandboxABLessonViewProps) {
  const exerciseId = payload.lesson.exercise_id;
  const cfgs = configs ?? FALLBACK_CONFIGS;
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<AbConfigResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!exerciseId) {
    return <p className="text-[var(--ledger-muted)]">No exercise wired yet.</p>;
  }

  async function run() {
    setRunning(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch('/api/sandbox/ab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId,
          configs: cfgs.map(({ leverSelections, dataSlotValues, presetIds }) => ({
            leverSelections,
            dataSlotValues,
            presetIds,
          })),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        setError(body.message ?? body.error ?? `HTTP ${res.status}`);
        return;
      }
      const data = (await res.json()) as {
        results: Array<{
          config: AbConfig;
          outputText: string;
          tokensUsed: number;
          flagged: boolean;
          provider: string;
          sessionId: string;
        }>;
      };
      setResults(
        data.results.map((r, i) => ({
          ...r.config,
          outputText: r.outputText,
          tokensUsed: r.tokensUsed,
          flagged: r.flagged,
          provider: r.provider,
          sessionId: r.sessionId,
          label: cfgs[i]?.label ?? String.fromCharCode(65 + i),
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown');
    } finally {
      setRunning(false);
    }
  }

  const combinedMd =
    results
      ?.map((r) => `## ${r.label}\n\nProvider: ${r.provider}\n\n${r.outputText}`)
      .join('\n\n---\n\n') ?? '';

  return (
    <div>
      <LedgerButton onClick={run} loading={running} disabled={running}>
        Compare {cfgs.length} versions
      </LedgerButton>
      {error ? (
        <div role="alert" className="mt-3 border-l-[2px] border-l-[var(--ledger-weak)] bg-[var(--ledger-paper)] px-3 py-2 text-sm text-[var(--ledger-weak)]">
          {error}
        </div>
      ) : null}
      {results ? (
        <>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {results.map((r) => (
              <LedgerCard key={r.sessionId} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <KickerLabel tone="accent">{r.label}</KickerLabel>
                  <KickerLabel tone="muted">
                    {r.provider} · {r.tokensUsed} tok
                  </KickerLabel>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-[var(--ledger-ink)] text-base leading-relaxed">
                  {r.outputText}
                </pre>
              </LedgerCard>
            ))}
          </div>
          <div className="mt-4">
            <SaveAsArtifactButton
              type={payload.lesson.takeaway_artifact_type ?? 'starter_prompt_pack'}
              title={`${payload.lesson.title} — comparison`}
              body_md={`# ${payload.lesson.title}\n\n${combinedMd}`}
              lesson_id={payload.lesson.id}
              track={payload.activeTrack ?? null}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
