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
      ? 'Saving…'
      : state === 'saved'
        ? 'Saved to Playbooks'
        : state === 'error'
          ? 'Save failed'
          : 'Save to my Playbooks';

  return (
    <article className="border border-[color:var(--color-ink)]/15 bg-[color:var(--color-parch)] p-6">
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        Step {index} · {snap.kind ? snap.name ?? step.skill_slug : step.skill_slug}
      </p>
      <p className="mt-3 leading-relaxed text-[color:var(--color-ink)]">{step.narrative}</p>

      <section className="mt-5 border-t border-[color:var(--color-ink)]/10 pt-5">
        {snap.kind === 'template' && (
          <>
            <h3 className="font-serif-sc text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
              System prompt
            </h3>
            <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-[color:var(--color-ink)]">
              {snap.systemPrompt}
            </pre>
            <h3 className="mt-4 font-serif-sc text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
              User template
            </h3>
            <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-[color:var(--color-ink)]">
              {snap.userPromptTemplate}
            </pre>
          </>
        )}
        {snap.kind === 'workflow' && (
          <>
            <h3 className="font-serif-sc text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
              Purpose
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--color-ink)]">
              {snap.purpose}
            </p>
            {snap.steps && snap.steps.length > 0 ? (
              <>
                <h3 className="mt-4 font-serif-sc text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
                  Steps
                </h3>
                <ol className="mt-2 list-decimal pl-5 text-[13px] text-[color:var(--color-ink)]">
                  {snap.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </>
            ) : null}
            {snap.guardrails && snap.guardrails.length > 0 ? (
              <>
                <h3 className="mt-4 font-serif-sc text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
                  Guardrails
                </h3>
                <ul className="mt-2 list-disc pl-5 text-[13px] text-[color:var(--color-ink)]">
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
        <p className="mt-5 border-l-4 border-[color:var(--color-terra)] pl-4 text-sm text-[color:var(--color-slate)]">
          <strong>Note:</strong> {step.notes}
        </p>
      ) : null}

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={!librarySkillId || state === 'saving'}
          className="bg-[color:var(--color-terra)] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)] disabled:opacity-50"
        >
          {buttonLabel}
        </button>
      </div>
    </article>
  );
}
