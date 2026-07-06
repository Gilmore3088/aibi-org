// src/app/dashboard/toolbox/cookbook/_components/RecipeStep.tsx
//
// Plan G — Task 5. Client component that renders a single recipe step:
// narrative, kind-aware Skill snapshot (template vs workflow), per-step
// notes, and a "Save to my Toolbox" button. The save button POSTs to
// /api/toolbox/save with origin='library' plus a recipeSourceRef override
// so the saved row records its recipe provenance instead of the bare
// library provenance. (Task 6 teaches the route to honor the override.)

'use client';

import { useState } from 'react';
import type { RecipeStep as RecipeStepData } from '@/lib/toolbox/recipes';

interface Props {
  readonly index: number;
  readonly recipeSlug: string;
  readonly step: RecipeStepData;
  readonly librarySkillId: string | undefined;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface TemplateSnapshot {
  readonly kind: 'template';
  readonly name?: string;
  readonly systemPrompt?: string;
  readonly userPromptTemplate?: string;
}

interface WorkflowSnapshot {
  readonly kind: 'workflow';
  readonly name?: string;
  readonly purpose?: string;
  readonly steps?: readonly string[];
  readonly guardrails?: readonly string[];
}

type Snapshot = TemplateSnapshot | WorkflowSnapshot | { readonly kind?: undefined };

function asSnapshot(value: Record<string, unknown> | null): Snapshot {
  if (!value) return {};
  return value as unknown as Snapshot;
}

export function RecipeStep({ index, recipeSlug, step, librarySkillId }: Props) {
  const [state, setState] = useState<SaveState>('idle');
  const snap = asSnapshot(step.skillSnapshot);

  async function handleSave() {
    if (!librarySkillId) {
      setState('error');
      return;
    }
    setState('saving');
    try {
      const res = await fetch('/api/toolbox/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: 'library',
          payload: {
            librarySkillId,
            versionId: step.skill_version_id,
            recipeSourceRef: `cookbook:${recipeSlug}#step-${index}`,
          },
        }),
      });
      setState(res.ok ? 'saved' : 'error');
    } catch {
      setState('error');
    }
  }

  const buttonLabel =
    state === 'saving'
      ? 'SAVING…'
      : state === 'saved'
        ? 'SAVED TO TOOLBOX'
        : state === 'error'
          ? 'SAVE FAILED'
          : 'SAVE TO MY TOOLBOX';

  const buttonClass =
    state === 'saved'
      ? 'rounded-[12px] bg-[color:var(--emerald-700)] px-5 py-2.5 text-[0.6875rem] font-semibold uppercase tracking-[1.2px] text-white disabled:opacity-60'
      : 'rounded-[12px] bg-[color:var(--ink)] px-5 py-2.5 text-[0.6875rem] font-semibold uppercase tracking-[1.2px] text-white transition-colors hover:bg-[color:var(--ink-2)] disabled:opacity-60';

  return (
    <article className="rounded-[24px] border border-[color:var(--ink-a15)] bg-white p-6 shadow-[var(--shadow-soft)]">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
        Step {index} · {snap.kind ? snap.name ?? step.skill_slug : step.skill_slug}
      </p>
      <p className="mt-3 text-base leading-relaxed text-[color:var(--ink)]">{step.narrative}</p>

      <section className="mt-5 border-t border-[color:var(--ink-a10)] pt-5">
        {snap.kind === 'template' && (
          <>
            <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--slate-500)]">
              System prompt
            </h3>
            <pre className="mt-2 whitespace-pre-wrap break-words rounded-[12px] bg-[color:var(--cream)] p-3 font-mono text-[0.75rem] leading-relaxed text-[color:var(--ink)]">
              {snap.systemPrompt}
            </pre>
            <h3 className="mt-4 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--slate-500)]">
              User template
            </h3>
            <pre className="mt-2 whitespace-pre-wrap break-words rounded-[12px] bg-[color:var(--cream)] p-3 font-mono text-[0.75rem] leading-relaxed text-[color:var(--ink)]">
              {snap.userPromptTemplate}
            </pre>
          </>
        )}
        {snap.kind === 'workflow' && (
          <>
            <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--slate-500)]">
              Purpose
            </h3>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-[color:var(--ink)]">
              {snap.purpose}
            </p>
            {snap.steps && snap.steps.length > 0 ? (
              <>
                <h3 className="mt-4 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--slate-500)]">
                  Steps
                </h3>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-[0.8125rem] leading-relaxed text-[color:var(--ink)]">
                  {snap.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </>
            ) : null}
            {snap.guardrails && snap.guardrails.length > 0 ? (
              <>
                <h3 className="mt-4 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--slate-500)]">
                  Guardrails
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.8125rem] leading-relaxed text-[color:var(--ink)]">
                  {snap.guardrails.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </>
        )}
      </section>

      {step.notes ? (
        <p className="mt-5 rounded-[12px] border-l-4 border-[color:var(--gold)] bg-[color:var(--cream-2)] py-3 pl-4 pr-4 text-sm text-[color:var(--slate-600)]">
          <strong className="font-semibold text-[color:var(--ink)]">Note:</strong> {step.notes}
        </p>
      ) : null}

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={!librarySkillId || state === 'saving' || state === 'saved'}
          className={buttonClass}
        >
          {buttonLabel}
        </button>
      </div>
    </article>
  );
}
