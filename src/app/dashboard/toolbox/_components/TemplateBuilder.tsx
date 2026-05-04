'use client';

import { useMemo } from 'react';
import type { ToolboxTemplateSkill, ToolboxVariable } from '@/lib/toolbox/types';

interface TemplateBuilderProps {
  readonly skill: ToolboxTemplateSkill;
  readonly onChange: (next: ToolboxTemplateSkill) => void;
}

function renderPreview(template: string, vars: readonly ToolboxVariable[]): string {
  let out = template;
  for (const v of vars) {
    const placeholder = v.placeholder ?? `<${v.label}>`;
    out = out.replace(new RegExp(`{{\\s*${v.name}\\s*}}`, 'g'), placeholder);
  }
  return out;
}

export function TemplateBuilder({ skill, onChange }: TemplateBuilderProps) {
  const preview = useMemo(
    () => renderPreview(skill.userPromptTemplate, skill.variables),
    [skill.userPromptTemplate, skill.variables],
  );

  function update<K extends keyof ToolboxTemplateSkill>(
    key: K,
    value: ToolboxTemplateSkill[K],
  ) {
    onChange({ ...skill, [key]: value });
  }

  function setVariable(idx: number, next: Partial<ToolboxVariable>) {
    const variables = skill.variables.map((v, i) =>
      i === idx ? ({ ...v, ...next } as ToolboxVariable) : v,
    );
    update('variables', variables);
  }

  function addVariable() {
    update('variables', [
      ...skill.variables,
      { name: 'new_variable', label: 'New Variable', type: 'text', required: false } as ToolboxVariable,
    ]);
  }

  function removeVariable(idx: number) {
    update('variables', skill.variables.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-8">
      <Section label="Title" hint="A short, descriptive name learners will see in the Library.">
        <input
          type="text"
          value={skill.name}
          onChange={(e) => update('name', e.target.value)}
          className="w-full rounded-[2px] border border-[color:var(--color-ink)]/20 px-3 py-2 font-sans text-sm"
        />
      </Section>

      <Section
        label="Description"
        hint="When to use this template — one sentence."
      >
        <input
          type="text"
          value={skill.desc}
          onChange={(e) => update('desc', e.target.value)}
          className="w-full rounded-[2px] border border-[color:var(--color-ink)]/20 px-3 py-2 font-sans text-sm"
        />
      </Section>

      <Section
        label="System Prompt"
        hint="The role, context, and rules. 100–300 words. This is where most of the teaching happens."
      >
        <textarea
          value={skill.systemPrompt}
          onChange={(e) => update('systemPrompt', e.target.value)}
          rows={8}
          className="w-full rounded-[2px] border border-[color:var(--color-ink)]/20 px-3 py-2 font-mono text-xs"
        />
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-slate)]">
          {skill.systemPrompt.length} chars · min 20
        </p>
      </Section>

      <Section
        label="User Prompt Template"
        hint="The fill-in request. Use {{variable_name}} for blanks the learner will fill in."
      >
        <textarea
          value={skill.userPromptTemplate}
          onChange={(e) => update('userPromptTemplate', e.target.value)}
          rows={4}
          className="w-full rounded-[2px] border border-[color:var(--color-ink)]/20 px-3 py-2 font-mono text-xs"
        />
      </Section>

      <Section
        label="Variables"
        hint="Each {{variable}} in the template above should be defined here so the Skill Builder can render the right input control."
      >
        <ul className="space-y-3">
          {skill.variables.map((v, i) => (
            <li
              key={i}
              className="grid gap-2 rounded-[2px] border border-[color:var(--color-ink)]/15 p-3 md:grid-cols-[1.5fr_1.5fr_1fr_auto_auto]"
            >
              <input
                aria-label="Variable name"
                value={v.name}
                onChange={(e) => setVariable(i, { name: e.target.value })}
                className="rounded-[2px] border border-[color:var(--color-ink)]/15 px-2 py-1 font-mono text-xs"
                placeholder="snake_case_name"
              />
              <input
                aria-label="Variable label"
                value={v.label}
                onChange={(e) => setVariable(i, { label: e.target.value })}
                className="rounded-[2px] border border-[color:var(--color-ink)]/15 px-2 py-1 font-sans text-xs"
                placeholder="Display label"
              />
              <select
                aria-label="Variable type"
                value={v.type}
                onChange={(e) =>
                  setVariable(i, { type: e.target.value as ToolboxVariable['type'] })
                }
                className="rounded-[2px] border border-[color:var(--color-ink)]/15 px-2 py-1 font-mono text-xs"
              >
                <option value="text">text</option>
                <option value="textarea">textarea</option>
                <option value="number">number</option>
                <option value="select">select</option>
              </select>
              <label className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em]">
                <input
                  type="checkbox"
                  checked={v.required}
                  onChange={(e) => setVariable(i, { required: e.target.checked })}
                />
                Req
              </label>
              <button
                type="button"
                onClick={() => removeVariable(i)}
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-error)]"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={addVariable}
          className="mt-3 inline-flex items-center rounded-[2px] border border-[color:var(--color-ink)]/20 px-3 py-1 font-sans text-[11px] uppercase tracking-[1.2px] text-[color:var(--color-ink)] hover:border-[color:var(--color-terra)]"
        >
          + Add variable
        </button>
      </Section>

      <Section
        label="Preview"
        hint="Variables substituted with their placeholder text or label. This is what the LLM will see when the learner runs the skill."
      >
        <pre className="whitespace-pre-wrap rounded-[2px] bg-[color:var(--color-parch)] p-3 font-mono text-xs">
          {preview}
        </pre>
      </Section>
    </div>
  );
}

function Section({
  label,
  hint,
  children,
}: {
  readonly label: string;
  readonly hint: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section>
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        {label}
      </p>
      <p className="mt-1 text-xs text-[color:var(--color-slate)]">{hint}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}
