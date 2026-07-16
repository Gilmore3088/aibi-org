'use client';

import type { ToolboxWorkflowSkill } from '@/lib/toolbox/types';

export function BuilderPanel({ skill, setSkill, onNew, onSave }: {
  readonly skill: ToolboxWorkflowSkill;
  readonly setSkill: (skill: ToolboxWorkflowSkill) => void;
  readonly onNew: () => void;
  readonly onSave: () => void;
}) {
  const update = (patch: Partial<ToolboxWorkflowSkill>) => setSkill({ ...skill, ...patch, modified: new Date().toISOString() });
  const updateLines = (key: 'files' | 'connectors' | 'steps' | 'guardrails', value: string) => update({ [key]: value.split('\n').map((line) => line.trim()).filter(Boolean) } as Partial<ToolboxWorkflowSkill>);

  return (
    <section className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
      <div>
        <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">Build</p>
        <h2 className="mt-2 text-4xl text-[color:var(--ink)]">Define the reusable workflow.</h2>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--slate-500)]">
          Keep the skill narrow, owned, versioned, and explicit about when a human must take over.
        </p>
        <div className="mt-6 flex gap-2">
          <button type="button" onClick={onNew} className="border border-[color:var(--ink)]/20 px-4 py-2 text-[0.625rem] uppercase tracking-widest">New skill</button>
          <button type="button" onClick={onSave} className="bg-[color:var(--gold-deep)] px-4 py-2 text-[0.625rem] uppercase tracking-widest text-[color:var(--cream)]">Save and test</button>
        </div>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Trigger" value={skill.cmd} onChange={(value) => update({ cmd: value.startsWith('/') ? value : `/${value}` })} />
          <Field label="Skill name" value={skill.name} onChange={(value) => update({ name: value })} />
          <Field label="Owner role" value={skill.owner} onChange={(value) => update({ owner: value })} />
          <Field label="Version" value={skill.version} onChange={(value) => update({ version: value })} />
        </div>
        <Field label="Purpose" value={skill.purpose} onChange={(value) => update({ purpose: value, desc: skill.desc || value })} textarea />
        <Field label="Definition of done" value={skill.success} onChange={(value) => update({ success: value })} textarea />
        <Field label="Required questions" value={skill.questions} onChange={(value) => update({ questions: value })} textarea />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Files / folders" value={skill.files.join('\n')} onChange={(value) => updateLines('files', value)} textarea />
          <Field label="Workflow steps" value={skill.steps.join('\n')} onChange={(value) => updateLines('steps', value)} textarea />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Output" value={skill.output} onChange={(value) => update({ output: value })} />
          <Field label="Tone" value={skill.tone} onChange={(value) => update({ tone: value })} />
          <Field label="Length" value={skill.length} onChange={(value) => update({ length: value })} />
        </div>
        <Field label="Hard rules / guardrails" value={skill.guardrails.join('\n')} onChange={(value) => updateLines('guardrails', value)} textarea />
        <Field label="Custom escalation rule" value={skill.customGuard} onChange={(value) => update({ customGuard: value })} textarea />
      </div>
    </section>
  );
}

function Field({ label, value, onChange, textarea = false }: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-500)]">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="mt-2 w-full border border-[color:var(--ink)]/15 bg-white px-3 py-2 text-sm leading-relaxed" />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full border border-[color:var(--ink)]/15 bg-white px-3 py-2 text-sm" />
      )}
    </label>
  );
}
