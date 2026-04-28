'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { TOOLBOX_TEMPLATES } from '@/content/toolbox/templates';
import { trackEvent } from '@/lib/analytics/plausible';
import { generateToolboxMarkdown } from '@/lib/toolbox/markdown';
import type { ToolboxMessage, ToolboxSkill, ToolboxSkillTemplate } from '@/lib/toolbox/types';
import { renderMarkdown } from '@/lib/sandbox/markdown-renderer';

type TabId = 'guide' | 'cookbook' | 'build' | 'playground' | 'toolbox';

const TABS: readonly { id: TabId; label: string }[] = [
  { id: 'guide', label: 'Start Here' },
  { id: 'cookbook', label: 'Cookbook' },
  { id: 'build', label: 'Build' },
  { id: 'playground', label: 'Playground' },
  { id: 'toolbox', label: 'My Toolbox' },
];

const EMPTY_SKILL: ToolboxSkill = {
  id: '',
  cmd: '/new-skill',
  name: 'New Banking Skill',
  dept: 'General',
  deptFull: 'General',
  difficulty: 'beginner',
  timeSaved: 'Varies',
  cadence: 'As needed',
  desc: '',
  purpose: '',
  success: '',
  files: [],
  connectors: [],
  questions: '',
  steps: ['Review the provided context.', 'Draft the requested output.', 'Flag gaps and review items.'],
  output: 'Markdown (.md)',
  tone: 'Professional',
  length: 'Concise',
  guardrails: ['Never make final decisions', 'Flag missing data', 'Cite only provided sources'],
  customGuard: '',
  owner: 'Role owner',
  maturity: 'draft',
  version: '1.0',
  samples: [],
};

function toSkill(template: ToolboxSkillTemplate): ToolboxSkill {
  return {
    ...template,
    id: '',
    templateId: template.id,
    version: '1.0',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
  };
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slugFromCommand(cmd: string): string {
  return cmd.replace(/^\//, '').replace(/[^a-z0-9-]+/gi, '-').toLowerCase() || 'skill';
}

export function ToolboxApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get('tab') as TabId | null) ?? 'guide';
  const safeTab = TABS.some((tab) => tab.id === currentTab) ? currentTab : 'guide';

  const [skills, setSkills] = useState<ToolboxSkill[]>([]);
  const [activeSkill, setActiveSkill] = useState<ToolboxSkill | null>(null);
  const [draftSkill, setDraftSkill] = useState<ToolboxSkill>(EMPTY_SKILL);
  const [roleFilter, setRoleFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [messages, setMessages] = useState<ToolboxMessage[]>([]);
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  const setTab = useCallback((tab: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    fetch('/api/toolbox/skills', { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data: { skills: ToolboxSkill[] }) => setSkills(data.skills ?? []))
      .catch(() => setNotice('Saved Toolbox skills could not be loaded.'));
  }, []);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages]);

  const roles = useMemo(() => (
    ['all', ...Array.from(new Set(TOOLBOX_TEMPLATES.map((template) => template.deptFull)))]
  ), []);

  const filteredTemplates = useMemo(() => TOOLBOX_TEMPLATES.filter((template) => {
    const roleMatch = roleFilter === 'all' || template.deptFull === roleFilter;
    const difficultyMatch = difficultyFilter === 'all' || template.difficulty === difficultyFilter;
    return roleMatch && difficultyMatch;
  }), [difficultyFilter, roleFilter]);

  function loadSkill(skill: ToolboxSkill, tab: TabId = 'playground') {
    setActiveSkill(skill);
    setDraftSkill(skill);
    setMessages([]);
    setInput(skill.samples[0]?.prompt ?? '');
    setTab(tab);
  }

  async function saveSkill(skill: ToolboxSkill) {
    const existing = skill.id && skills.some((saved) => saved.id === skill.id);
    const res = await fetch(existing ? `/api/toolbox/skills/${skill.id}` : '/api/toolbox/skills', {
      method: existing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skill }),
    });
    const data = await res.json();
    if (!res.ok) {
      setNotice(data.error ?? 'Could not save skill.');
      return null;
    }
    const saved = data.skill as ToolboxSkill;
    setSkills((prev) => existing
      ? prev.map((item) => item.id === saved.id ? saved : item)
      : [saved, ...prev]);
    setActiveSkill(saved);
    setDraftSkill(saved);
    setNotice('Skill saved to your Toolbox.');
    trackEvent('toolbox_skill_saved', { maturity: saved.maturity, source: saved.templateId ? 'template' : 'custom' });
    return saved;
  }

  async function deleteSkill(skillId: string) {
    if (!window.confirm('Delete this skill from your Toolbox?')) return;
    const res = await fetch(`/api/toolbox/skills/${skillId}`, { method: 'DELETE' });
    if (!res.ok) {
      setNotice('Could not delete skill.');
      return;
    }
    setSkills((prev) => prev.filter((skill) => skill.id !== skillId));
    if (activeSkill?.id === skillId) setActiveSkill(null);
    setNotice('Skill deleted.');
  }

  async function runSkill() {
    if (!activeSkill || !input.trim()) return;
    const nextMessages = [...messages, { role: 'user' as const, content: input.trim() }];
    setMessages(nextMessages);
    setInput('');
    setRunning(true);
    trackEvent('toolbox_scenario_run', { source: activeSkill.templateId ? 'template' : 'custom' });
    try {
      const res = await fetch('/api/toolbox/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: activeSkill, messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Claude run failed.');
      setMessages([...nextMessages, { role: 'assistant', content: data.text }]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: `**API Error**\n\n${error instanceof Error ? error.message : 'Claude is temporarily unavailable.'}`,
        },
      ]);
    } finally {
      setRunning(false);
    }
  }

  function exportSkill(skill: ToolboxSkill) {
    downloadText(`${slugFromCommand(skill.cmd)}.md`, generateToolboxMarkdown(skill));
    trackEvent('toolbox_skill_exported', { maturity: skill.maturity });
  }

  function copySkill(skill: ToolboxSkill) {
    navigator.clipboard.writeText(generateToolboxMarkdown(skill))
      .then(() => setNotice('Markdown copied.'))
      .catch(() => setNotice('Copy failed. Download the Markdown file instead.'));
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 lg:px-10">
      <nav className="sticky top-[81px] z-30 -mx-6 mb-8 border-b border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)]/95 px-6 backdrop-blur lg:-mx-10 lg:px-10" aria-label="Toolbox sections">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              href={`/toolbox?tab=${tab.id}`}
              className={`whitespace-nowrap border-b-2 px-4 py-4 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                safeTab === tab.id
                  ? 'border-[color:var(--color-terra)] text-[color:var(--color-terra)]'
                  : 'border-transparent text-[color:var(--color-slate)] hover:text-[color:var(--color-ink)]'
              }`}
            >
              {tab.label}
              {tab.id === 'toolbox' && skills.length > 0 ? ` (${skills.length})` : ''}
            </Link>
          ))}
        </div>
      </nav>

      {notice && (
        <button
          type="button"
          onClick={() => setNotice(null)}
          className="mb-6 w-full border border-[color:var(--color-terra)]/25 bg-[color:var(--color-parch)] px-4 py-3 text-left text-sm text-[color:var(--color-ink)]"
        >
          {notice}
        </button>
      )}

      {safeTab === 'guide' && (
        <GuidePanel savedCount={skills.length} setTab={setTab} />
      )}

      {safeTab === 'cookbook' && (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 border-b border-[color:var(--color-ink)]/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
                Cookbook
              </p>
              <h2 className="mt-2 font-serif text-4xl text-[color:var(--color-ink)]">
                Fifteen tested banking skill starters.
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="border border-[color:var(--color-ink)]/15 bg-white px-3 py-2 text-sm">
                {roles.map((role) => <option key={role} value={role}>{role === 'all' ? 'All roles' : role}</option>)}
              </select>
              <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)} className="border border-[color:var(--color-ink)]/15 bg-white px-3 py-2 text-sm">
                <option value="all">All levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onTry={() => loadSkill(toSkill(template), 'playground')}
                onCustomize={() => {
                  const skill = toSkill(template);
                  setDraftSkill(skill);
                  setActiveSkill(skill);
                  setTab('build');
                }}
              />
            ))}
          </div>
        </section>
      )}

      {safeTab === 'build' && (
        <BuilderPanel
          skill={draftSkill}
          setSkill={setDraftSkill}
          onNew={() => setDraftSkill({ ...EMPTY_SKILL })}
          onSave={async () => {
            const saved = await saveSkill(draftSkill);
            if (saved) loadSkill(saved, 'playground');
          }}
        />
      )}

      {safeTab === 'playground' && (
        <PlaygroundPanel
          activeSkill={activeSkill}
          input={input}
          setInput={setInput}
          messages={messages}
          running={running}
          threadRef={threadRef}
          onRun={runSkill}
          onSave={() => activeSkill && saveSkill(activeSkill)}
          onExport={() => activeSkill && exportSkill(activeSkill)}
          onCopy={() => activeSkill && copySkill(activeSkill)}
          onEdit={() => activeSkill && loadSkill(activeSkill, 'build')}
          onBrowse={() => setTab('cookbook')}
          onReset={() => setMessages([])}
        />
      )}

      {safeTab === 'toolbox' && (
        <ToolboxPanel
          skills={skills}
          onRun={(skill) => loadSkill(skill, 'playground')}
          onEdit={(skill) => loadSkill(skill, 'build')}
          onExport={exportSkill}
          onDelete={deleteSkill}
          onBrowse={() => setTab('cookbook')}
          onBuild={() => {
            setDraftSkill({ ...EMPTY_SKILL });
            setTab('build');
          }}
        />
      )}
    </div>
  );
}

function GuidePanel({ savedCount, setTab }: { readonly savedCount: number; readonly setTab: (tab: TabId) => void }) {
  return (
    <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
          Operating Model
        </p>
        <h2 className="mt-3 font-serif text-5xl leading-tight text-[color:var(--color-ink)]">
          A useful prompt is improvisation. A useful skill is engineering.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-[color:var(--color-slate)]">
          Skills are reusable Markdown instruction files with an owner, version, required questions, workflow, output rules, and escalation triggers.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={() => setTab('cookbook')} className="bg-[color:var(--color-terra)] px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]">
            Browse Cookbook
          </button>
          <button type="button" onClick={() => setTab('build')} className="border border-[color:var(--color-ink)]/25 px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)]">
            Build from scratch
          </button>
        </div>
      </div>
      <div className="border-l border-[color:var(--color-ink)]/10 pl-8">
        {[
          ['i.', 'Start Here', 'Understand the skill model and safety rules.'],
          ['ii.', 'Cookbook', 'Load one of 15 banking templates.'],
          ['iii.', 'Build', 'Adapt a skill for your recurring workflow.'],
          ['iv.', 'Playground', 'Run fabricated scenarios against Claude.'],
          ['v.', 'My Toolbox', `${savedCount} saved skill${savedCount === 1 ? '' : 's'} in your account.`],
        ].map(([num, title, body]) => (
          <div key={title} className="grid grid-cols-[44px_1fr] gap-4 border-b border-[color:var(--color-ink)]/10 py-5">
            <p className="font-serif text-2xl italic text-[color:var(--color-terra)]">{num}</p>
            <div>
              <h3 className="font-serif text-2xl text-[color:var(--color-ink)]">{title}</h3>
              <p className="mt-1 text-sm text-[color:var(--color-slate)]">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TemplateCard({ template, onTry, onCustomize }: { readonly template: ToolboxSkillTemplate; readonly onTry: () => void; readonly onCustomize: () => void }) {
  return (
    <article className="border border-[color:var(--color-ink)]/10 bg-white/45 p-5 transition-colors hover:border-[color:var(--color-terra)]/50">
      <div className="flex items-start justify-between gap-3">
        <span className="bg-[color:var(--color-parch)] px-2 py-1 font-mono text-[11px] text-[color:var(--color-terra)]">{template.cmd}</span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--color-slate)]">{template.difficulty}</span>
      </div>
      <h3 className="mt-4 font-serif text-2xl leading-tight text-[color:var(--color-ink)]">{template.name}</h3>
      <p className="mt-3 min-h-[64px] text-sm leading-relaxed text-[color:var(--color-slate)]">{template.desc}</p>
      <div className="mt-5 flex items-center justify-between border-t border-[color:var(--color-ink)]/10 pt-4 text-[11px] text-[color:var(--color-slate)]">
        <span>{template.deptFull}</span>
        <span>{template.timeSaved}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={onTry} className="bg-[color:var(--color-terra)] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]">Try</button>
        <button type="button" onClick={onCustomize} className="border border-[color:var(--color-ink)]/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)]">Customize</button>
      </div>
    </article>
  );
}

function BuilderPanel({ skill, setSkill, onNew, onSave }: {
  readonly skill: ToolboxSkill;
  readonly setSkill: (skill: ToolboxSkill) => void;
  readonly onNew: () => void;
  readonly onSave: () => void;
}) {
  const update = (patch: Partial<ToolboxSkill>) => setSkill({ ...skill, ...patch, modified: new Date().toISOString() });
  const updateLines = (key: 'files' | 'connectors' | 'steps' | 'guardrails', value: string) => update({ [key]: value.split('\n').map((line) => line.trim()).filter(Boolean) } as Partial<ToolboxSkill>);

  return (
    <section className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
      <div>
        <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">Build</p>
        <h2 className="mt-2 font-serif text-4xl text-[color:var(--color-ink)]">Define the reusable workflow.</h2>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-slate)]">
          Keep the skill narrow, owned, versioned, and explicit about when a human must take over.
        </p>
        <div className="mt-6 flex gap-2">
          <button type="button" onClick={onNew} className="border border-[color:var(--color-ink)]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest">New skill</button>
          <button type="button" onClick={onSave} className="bg-[color:var(--color-terra)] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]">Save and test</button>
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
      <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="mt-2 w-full border border-[color:var(--color-ink)]/15 bg-white px-3 py-2 text-sm leading-relaxed" />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full border border-[color:var(--color-ink)]/15 bg-white px-3 py-2 text-sm" />
      )}
    </label>
  );
}

function PlaygroundPanel(props: {
  readonly activeSkill: ToolboxSkill | null;
  readonly input: string;
  readonly setInput: (value: string) => void;
  readonly messages: readonly ToolboxMessage[];
  readonly running: boolean;
  readonly threadRef: RefObject<HTMLDivElement>;
  readonly onRun: () => void;
  readonly onSave: () => void;
  readonly onExport: () => void;
  readonly onCopy: () => void;
  readonly onEdit: () => void;
  readonly onBrowse: () => void;
  readonly onReset: () => void;
}) {
  if (!props.activeSkill) {
    return (
      <section className="mx-auto max-w-2xl py-20 text-center">
        <h2 className="font-serif text-4xl text-[color:var(--color-ink)]">Pick a skill to test.</h2>
        <p className="mt-3 text-sm text-[color:var(--color-slate)]">Load a Cookbook template or reopen a saved skill from your Toolbox.</p>
        <button type="button" onClick={props.onBrowse} className="mt-6 bg-[color:var(--color-terra)] px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]">Browse Cookbook</button>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="h-fit border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-5 lg:sticky lg:top-40">
        <p className="inline-block bg-white px-2 py-1 font-mono text-[11px] text-[color:var(--color-terra)]">{props.activeSkill.cmd}</p>
        <h2 className="mt-4 font-serif text-3xl leading-tight">{props.activeSkill.name}</h2>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-slate)]">{props.activeSkill.desc || props.activeSkill.purpose}</p>
        <div className="mt-5 grid gap-3 border-t border-[color:var(--color-ink)]/10 pt-4 text-xs text-[color:var(--color-slate)]">
          <p><strong className="text-[color:var(--color-ink)]">Owner:</strong> {props.activeSkill.owner}</p>
          <p><strong className="text-[color:var(--color-ink)]">Output:</strong> {props.activeSkill.output}</p>
          <p><strong className="text-[color:var(--color-ink)]">Maturity:</strong> {props.activeSkill.maturity}</p>
        </div>
        <div className="mt-5 grid gap-2">
          <button type="button" onClick={props.onSave} className="bg-[color:var(--color-terra)] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]">Save to Toolbox</button>
          <button type="button" onClick={props.onEdit} className="border border-[color:var(--color-ink)]/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest">Edit in Builder</button>
          <button type="button" onClick={props.onExport} className="border border-[color:var(--color-ink)]/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest">Download .md</button>
          <button type="button" onClick={props.onCopy} className="border border-[color:var(--color-ink)]/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest">Copy Markdown</button>
        </div>
      </aside>
      <div className="min-w-0">
        <div ref={props.threadRef} className="min-h-[420px] max-h-[620px] overflow-y-auto border border-[color:var(--color-ink)]/10 bg-white p-4">
          {props.messages.length === 0 ? (
            <div className="flex h-[380px] items-center justify-center text-center text-sm text-[color:var(--color-slate)]">
              Run a fabricated scenario or type your own test prompt. Do not enter real member data.
            </div>
          ) : props.messages.map((message, idx) => (
            <div key={idx} className={`mb-4 border-l-2 p-3 ${message.role === 'user' ? 'border-[color:var(--color-cobalt)] bg-[color:var(--color-cobalt-pale)]/35' : 'border-[color:var(--color-terra)] bg-[color:var(--color-parch)]'}`}>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">{message.role === 'user' ? 'You' : 'Claude'}</p>
              <div className="text-sm leading-relaxed">{message.role === 'assistant' ? renderMarkdown(message.content) : <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>}</div>
            </div>
          ))}
          {props.running && <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)]">Claude is thinking...</p>}
        </div>
        {props.activeSkill.samples.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {props.activeSkill.samples.map((sample) => (
              <button key={sample.title} type="button" onClick={() => props.setInput(sample.prompt)} className="border border-[color:var(--color-ink)]/15 px-3 py-1.5 text-xs text-[color:var(--color-ink)] hover:border-[color:var(--color-terra)]">
                {sample.title}
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-3">
          <textarea value={props.input} onChange={(event) => props.setInput(event.target.value)} rows={5} placeholder="Type a test prompt..." className="w-full resize-y border border-[color:var(--color-ink)]/10 bg-white px-3 py-2 text-sm" />
          <div className="mt-3 flex flex-wrap justify-between gap-3">
            <button type="button" onClick={props.onReset} className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">Reset conversation</button>
            <button type="button" disabled={props.running || !props.input.trim()} onClick={props.onRun} className="bg-[color:var(--color-terra)] px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)] disabled:opacity-50">Run with Claude</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolboxPanel({ skills, onRun, onEdit, onExport, onDelete, onBrowse, onBuild }: {
  readonly skills: readonly ToolboxSkill[];
  readonly onRun: (skill: ToolboxSkill) => void;
  readonly onEdit: (skill: ToolboxSkill) => void;
  readonly onExport: (skill: ToolboxSkill) => void;
  readonly onDelete: (id: string) => void;
  readonly onBrowse: () => void;
  readonly onBuild: () => void;
}) {
  if (skills.length === 0) {
    return (
      <section className="mx-auto max-w-2xl py-20 text-center">
        <h2 className="font-serif text-4xl text-[color:var(--color-ink)]">Your toolbox is empty.</h2>
        <p className="mt-3 text-sm text-[color:var(--color-slate)]">Start from a Cookbook template or build the first custom skill for your recurring work.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={onBrowse} className="bg-[color:var(--color-terra)] px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]">Browse Cookbook</button>
          <button type="button" onClick={onBuild} className="border border-[color:var(--color-ink)]/20 px-5 py-3 font-mono text-[10px] uppercase tracking-widest">Build from scratch</button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-end justify-between border-b border-[color:var(--color-ink)]/10 pb-5">
        <div>
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">My Toolbox</p>
          <h2 className="mt-2 font-serif text-4xl">{skills.length} saved skill{skills.length === 1 ? '' : 's'}</h2>
        </div>
        <button type="button" onClick={onBuild} className="border border-[color:var(--color-ink)]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest">New skill</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {skills.map((skill) => (
          <article key={skill.id} className="border border-[color:var(--color-ink)]/10 bg-white/45 p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="bg-[color:var(--color-parch)] px-2 py-1 font-mono text-[11px] text-[color:var(--color-terra)]">{skill.cmd}</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--color-slate)]">{skill.maturity}</span>
            </div>
            <h3 className="mt-4 font-serif text-2xl leading-tight">{skill.name}</h3>
            <p className="mt-3 min-h-[64px] text-sm leading-relaxed text-[color:var(--color-slate)]">{skill.desc || skill.purpose}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => onRun(skill)} className="bg-[color:var(--color-terra)] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]">Run</button>
              <button type="button" onClick={() => onEdit(skill)} className="border border-[color:var(--color-ink)]/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest">Edit</button>
              <button type="button" onClick={() => onExport(skill)} className="border border-[color:var(--color-ink)]/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest">Download</button>
              <button type="button" onClick={() => onDelete(skill.id)} className="border border-[color:var(--color-error)]/30 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-error)]">Delete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
