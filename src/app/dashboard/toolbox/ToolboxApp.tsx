'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { TOOLBOX_TEMPLATES } from '@/content/toolbox/templates';
import { trackEvent } from '@/lib/analytics/plausible';
import { generateToolboxMarkdown } from '@/lib/toolbox/markdown';
import {
  isWorkflowSkill,
  type ToolboxKind,
  type ToolboxMessage,
  type ToolboxSkill,
  type ToolboxSkillTemplate,
  type ToolboxTemplateSkill,
  type ToolboxWorkflowSkill,
} from '@/lib/toolbox/types';
import { renderMarkdown } from '@/lib/sandbox/markdown-renderer';
import { KindPicker } from './_components/KindPicker';
import { ModelPicker, type ModelSelection } from './_components/ModelPicker';
import { SourceBacklink } from './_components/SourceBacklink';
import { TemplateBuilder } from './_components/TemplateBuilder';
import { useUsage } from './_components/UsageMeter';

type TabId = 'guide' | 'library' | 'build' | 'playground' | 'toolbox';

type ToolboxTier = 'full' | 'starter';

// Starter tier (granted by In-Depth Assessment purchase) sees only the
// read-only surfaces. Build / Playground / My Toolbox require save / API
// proxy access reserved for full-tier (AiBI-P / S / L / toolbox-only).
const STARTER_TABS: readonly TabId[] = ['guide', 'library'];

const TABS: readonly { id: TabId; label: string }[] = [
  { id: 'guide', label: 'Start Here' },
  { id: 'library', label: 'Library' },
  { id: 'build', label: 'Build' },
  { id: 'playground', label: 'Playground' },
  { id: 'toolbox', label: 'My Playbooks' },
];

const EMPTY_WORKFLOW_SKILL: ToolboxWorkflowSkill = {
  kind: 'workflow',
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

const EMPTY_TEMPLATE_SKILL: ToolboxTemplateSkill = {
  kind: 'template',
  id: '',
  cmd: '/new-template',
  name: 'New Prompt Template',
  dept: 'General',
  deptFull: 'General',
  difficulty: 'beginner',
  timeSaved: 'Varies',
  cadence: 'As needed',
  desc: 'A short prompt template with fillable variables.',
  owner: 'Role owner',
  maturity: 'draft',
  version: '1.0',
  systemPrompt:
    'You are a community-bank assistant. Use plain language at an 8th-grade reading level. ' +
    'Cite sources only when provided; never invent regulatory citations.',
  userPromptTemplate: 'Write a {{kind_of_output}} for {{recipient}}.\n\nContext:\n{{context}}',
  variables: [
    { name: 'kind_of_output', label: 'Kind of output', type: 'text', required: true },
    { name: 'recipient', label: 'Recipient', type: 'text', required: true },
    { name: 'context', label: 'Context', type: 'textarea', required: true },
  ],
  output: 'Markdown',
  tone: 'Professional',
  length: 'Concise',
};

function toSkill(template: ToolboxSkillTemplate): ToolboxWorkflowSkill {
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

interface ToolboxAppProps {
  readonly tier?: ToolboxTier;
}

export function ToolboxApp({ tier = 'full' }: ToolboxAppProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const visibleTabs = useMemo(
    () =>
      tier === 'starter'
        ? TABS.filter((t) => (STARTER_TABS as readonly TabId[]).includes(t.id))
        : TABS,
    [tier],
  );
  const currentTab = (searchParams.get('tab') as TabId | null) ?? 'guide';
  const safeTab = visibleTabs.some((tab) => tab.id === currentTab) ? currentTab : 'guide';

  const [skills, setSkills] = useState<ToolboxSkill[]>([]);
  const [librarySlugMap, setLibrarySlugMap] = useState<Record<string, string>>({});
  const [activeSkill, setActiveSkill] = useState<ToolboxSkill | null>(null);
  const [draftSkill, setDraftSkill] = useState<ToolboxWorkflowSkill>(EMPTY_WORKFLOW_SKILL);
  const [templateSkill, setTemplateSkill] = useState<ToolboxTemplateSkill>(EMPTY_TEMPLATE_SKILL);
  const [buildKind, setBuildKind] = useState<ToolboxKind | null>(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [messages, setMessages] = useState<ToolboxMessage[]>([]);
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [playgroundSaveState, setPlaygroundSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [notice, setNotice] = useState<string | null>(null);
  const [modelSelection, setModelSelection] = useState<ModelSelection>({
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
  });
  const threadRef = useRef<HTMLDivElement>(null);
  const { usage, refresh: refreshUsage } = useUsage();

  const setTab = useCallback((tab: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (searchParams.get('tab') === 'cookbook') {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', 'library');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  useEffect(() => {
    fetch('/api/toolbox/skills', { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data: { skills: ToolboxSkill[]; librarySlugMap?: Record<string, string> }) => {
        setSkills(data.skills ?? []);
        setLibrarySlugMap(data.librarySlugMap ?? {});
      })
      .catch(() => setNotice('Saved Playbook skills could not be loaded.'));
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
    if (isWorkflowSkill(skill)) {
      setDraftSkill(skill);
      setBuildKind('workflow');
      setInput(skill.samples[0]?.prompt ?? '');
    } else {
      setTemplateSkill(skill);
      setBuildKind('template');
      setInput('');
    }
    setMessages([]);
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
    if (isWorkflowSkill(saved)) {
      setDraftSkill(saved);
    } else {
      setTemplateSkill(saved);
    }
    setNotice('Skill saved to your Playbooks.');
    trackEvent('toolbox_skill_saved', { maturity: saved.maturity, source: saved.templateId ? 'template' : 'custom' });
    return saved;
  }

  async function deleteSkill(skillId: string) {
    if (!window.confirm('Delete this skill from your Playbooks?')) return;
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
      const res = await fetch('/api/toolbox/run/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: activeSkill,
          messages: nextMessages,
          provider: modelSelection.provider,
          model: modelSelection.model,
        }),
      });
      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => ({ error: 'Unknown error.' }));
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${json.error ?? res.statusText}` }]);
        setRunning(false);
        return;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line) continue;
          try {
            const obj = JSON.parse(line) as { type: string; text?: string };
            if (obj.type === 'text' && obj.text) {
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (!last || last.role !== 'assistant') return prev;
                return [...prev.slice(0, -1), { role: 'assistant', content: last.content + obj.text }];
              });
            } else if (obj.type === 'done') {
              refreshUsage();
            } else if (obj.type === 'error') {
              setMessages((prev) => [...prev, { role: 'assistant', content: 'Stream error. Please try again.' }]);
            }
          } catch {
            /* ignore malformed line */
          }
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `**API Error**\n\n${error instanceof Error ? error.message : 'Claude is temporarily unavailable.'}`,
        },
      ]);
    } finally {
      setRunning(false);
    }
  }

  async function handleSavePlayground() {
    if (!activeSkill || messages.length === 0 || playgroundSaveState === 'saving') return;
    setPlaygroundSaveState('saving');
    try {
      const res = await fetch('/api/toolbox/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: 'playground', payload: { skill: activeSkill, messages } }),
      });
      setPlaygroundSaveState(res.ok ? 'saved' : 'error');
    } catch {
      setPlaygroundSaveState('error');
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
      <nav className="sticky top-[81px] z-30 -mx-6 mb-8 flex items-center gap-1 overflow-x-auto border-b border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)]/95 px-6 backdrop-blur lg:-mx-10 lg:px-10" aria-label="Playbooks sections">
        {visibleTabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/dashboard/toolbox?tab=${tab.id}`}
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
        <Link
          href="/dashboard/toolbox/cookbook"
          className="whitespace-nowrap border-b-2 border-transparent px-4 py-4 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] transition-colors hover:text-[color:var(--color-ink)]"
        >
          Cookbook
        </Link>
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

      {safeTab === 'library' && (
        <section className="space-y-6">
          <FirstRunHint
            skills={skills}
            templates={TOOLBOX_TEMPLATES}
            onTry={(template) => loadSkill(toSkill(template), 'playground')}
          />
          <div className="flex flex-col gap-4 border-b border-[color:var(--color-ink)]/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
                Library
              </p>
              <h2 className="mt-2 font-serif text-4xl text-[color:var(--color-ink)]">
                Pre-built playbooks for common banking AI tasks.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--color-slate)]">
                Pick one, run it as-is in the Playground, or edit it for your institution.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">Role</span>
                <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="border border-[color:var(--color-ink)]/15 bg-white px-3 py-2 text-sm">
                  {roles.map((role) => <option key={role} value={role}>{role === 'all' ? 'All roles' : role}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">Difficulty</span>
                <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)} className="border border-[color:var(--color-ink)]/15 bg-white px-3 py-2 text-sm">
                  <option value="all">All levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
            </div>
          </div>
          {filteredTemplates.length === 0 ? (
            <div className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] px-6 py-10 text-center">
              <p className="font-serif text-2xl text-[color:var(--color-ink)]">No playbooks match these filters.</p>
              <p className="mt-2 text-sm text-[color:var(--color-slate)]">Try clearing the role or difficulty filter.</p>
              <button
                type="button"
                onClick={() => { setRoleFilter('all'); setDifficultyFilter('all'); }}
                className="mt-5 border border-[color:var(--color-ink)]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)]"
              >
                Show all playbooks
              </button>
            </div>
          ) : (
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
                    setBuildKind('workflow');
                    setTab('build');
                  }}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {safeTab === 'build' && buildKind === null && (
        <div className="mx-auto max-w-3xl py-6">
          <KindPicker value={null} onChange={(k) => setBuildKind(k)} />
        </div>
      )}

      {safeTab === 'build' && buildKind === 'workflow' && (
        <>
          <button
            type="button"
            onClick={() => setBuildKind(null)}
            className="mb-6 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] hover:text-[color:var(--color-terra)]"
          >
            ← Choose a different kind
          </button>
          <BuilderPanel
            skill={draftSkill}
            setSkill={setDraftSkill}
            onNew={() => setDraftSkill({ ...EMPTY_WORKFLOW_SKILL })}
            onSave={async () => {
              const saved = await saveSkill(draftSkill);
              if (saved) loadSkill(saved, 'playground');
            }}
          />
        </>
      )}

      {safeTab === 'build' && buildKind === 'template' && (
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => setBuildKind(null)}
            className="mb-6 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] hover:text-[color:var(--color-terra)]"
          >
            ← Choose a different kind
          </button>
          <TemplateBuilder skill={templateSkill} onChange={setTemplateSkill} />
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => setTemplateSkill({ ...EMPTY_TEMPLATE_SKILL })}
              className="border border-[color:var(--color-ink)]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest"
            >
              New template
            </button>
            <button
              type="button"
              onClick={async () => {
                const saved = await saveSkill(templateSkill);
                if (saved) loadSkill(saved, 'playground');
              }}
              className="bg-[color:var(--color-terra)] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]"
            >
              Save and test
            </button>
          </div>
        </div>
      )}

      {safeTab === 'playground' && (
        <PlaygroundPanel
          activeSkill={activeSkill}
          input={input}
          setInput={setInput}
          messages={messages}
          running={running}
          threadRef={threadRef}
          modelSelection={modelSelection}
          setModelSelection={setModelSelection}
          usage={usage}
          onRun={runSkill}
          onSave={() => activeSkill && saveSkill(activeSkill)}
          onExport={() => activeSkill && exportSkill(activeSkill)}
          onCopy={() => activeSkill && copySkill(activeSkill)}
          onEdit={() => activeSkill && loadSkill(activeSkill, 'build')}
          onBrowse={() => setTab('library')}
          onReset={() => setMessages([])}
          onSavePlayground={handleSavePlayground}
          playgroundSaveState={playgroundSaveState}
        />
      )}

      {safeTab === 'toolbox' && (
        <ToolboxPanel
          skills={skills}
          librarySlugMap={librarySlugMap}
          onRun={(skill) => loadSkill(skill, 'playground')}
          onEdit={(skill) => loadSkill(skill, 'build')}
          onExport={exportSkill}
          onDelete={deleteSkill}
          onBrowse={() => setTab('library')}
          onBuild={() => {
            setDraftSkill({ ...EMPTY_WORKFLOW_SKILL });
            setBuildKind(null);
            setTab('build');
          }}
        />
      )}
    </div>
  );
}

const FIRST_RUN_DISMISSED_KEY = 'aibi-toolbox-first-run-hint-dismissed';
const RECOMMENDED_STARTER_ID = 'exam-prep';

function FirstRunHint({
  skills,
  templates,
  onTry,
}: {
  readonly skills: readonly ToolboxSkill[];
  readonly templates: readonly ToolboxSkillTemplate[];
  readonly onTry: (template: ToolboxSkillTemplate) => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDismissed(window.localStorage.getItem(FIRST_RUN_DISMISSED_KEY) === 'true');
  }, []);

  // Only show for users who haven't saved any skills and haven't dismissed.
  if (dismissed || skills.length > 0) return null;

  const starter = templates.find((t) => t.id === RECOMMENDED_STARTER_ID) ?? templates[0];
  if (!starter) return null;

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FIRST_RUN_DISMISSED_KEY, 'true');
    }
    setDismissed(true);
  };

  return (
    <div className="border border-[color:var(--color-terra)]/30 bg-[color:var(--color-parch)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            New here? Start with this one.
          </p>
          <h3 className="mt-2 font-serif text-2xl text-[color:var(--color-ink)]">
            {starter.name}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--color-slate)]">
            {starter.desc} It runs in the Playground in under a minute against a
            fabricated scenario — no real data needed.
          </p>
          <button
            type="button"
            onClick={() => {
              onTry(starter);
              handleDismiss();
            }}
            className="mt-4 bg-[color:var(--color-terra)] px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]"
          >
            Try it now
          </button>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss tip"
          className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] hover:text-[color:var(--color-ink)]"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

function GuidePanel({ setTab }: { readonly savedCount: number; readonly setTab: (tab: TabId) => void }) {
  return (
    <section className="py-6">
      <h2 className="font-serif text-5xl leading-tight text-[color:var(--color-ink)]">
        Your space to experiment with banking AI.
      </h2>
      <p className="mt-5 text-base leading-relaxed text-[color:var(--color-slate)]">
        A safe sandbox to try AI on real banking work — without putting member data,
        regulator findings, or institutional decisions at risk. Run pre-built playbooks
        against fabricated scenarios, customize them for your institution, and save the
        ones you trust.
      </p>

      <dl className="mt-10 grid gap-6 border-t border-[color:var(--color-ink)]/10 pt-8 sm:grid-cols-2">
        <div>
          <dt className="font-serif text-xl text-[color:var(--color-ink)]">Library</dt>
          <dd className="mt-1 text-sm leading-relaxed text-[color:var(--color-slate)]">
            Fifteen pre-built playbooks for exam prep, SAR drafting, board memos, member complaints, and more.
          </dd>
        </div>
        <div>
          <dt className="font-serif text-xl text-[color:var(--color-ink)]">Playground</dt>
          <dd className="mt-1 text-sm leading-relaxed text-[color:var(--color-slate)]">
            Run any playbook against a fabricated scenario. Pick your model, watch the response stream, see the cost.
          </dd>
        </div>
        <div>
          <dt className="font-serif text-xl text-[color:var(--color-ink)]">Build</dt>
          <dd className="mt-1 text-sm leading-relaxed text-[color:var(--color-slate)]">
            Adapt a starter playbook for your workflow, or write a new one from scratch with versioning and guardrails built in.
          </dd>
        </div>
        <div>
          <dt className="font-serif text-xl text-[color:var(--color-ink)]">My Playbooks</dt>
          <dd className="mt-1 text-sm leading-relaxed text-[color:var(--color-slate)]">
            Your saved playbooks. Re-run, edit, or download as Markdown to share with your team.
          </dd>
        </div>
      </dl>

      <div className="mt-10 flex flex-wrap items-center gap-6">
        <button
          type="button"
          onClick={() => setTab('library')}
          className="bg-[color:var(--color-terra)] px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]"
        >
          Browse playbooks
        </button>
        <button
          type="button"
          onClick={() => setTab('build')}
          className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] hover:text-[color:var(--color-ink)]"
        >
          Or build your own →
        </button>
      </div>

      <aside className="mt-12 border-t border-[color:var(--color-ink)]/10 pt-8">
        <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
          New to this?
        </p>
        <p className="mt-3 font-serif text-2xl text-[color:var(--color-ink)]">
          See a worked example end-to-end.
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--color-slate)]">
          The Cookbook walks through how a real banker uses these tools on a real workflow — start to finish, with the prompts, the outputs, and the gotchas.
        </p>
        <Link
          href="/dashboard/toolbox/cookbook"
          className="mt-4 inline-block font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] border-b border-[color:var(--color-terra)] hover:text-[color:var(--color-ink)] hover:border-[color:var(--color-ink)]"
        >
          Read the Cookbook →
        </Link>
      </aside>
    </section>
  );
}

function TemplateCard({ template, onTry, onCustomize }: { readonly template: ToolboxSkillTemplate; readonly onTry: () => void; readonly onCustomize: () => void }) {
  const cadenceLabel = template.cadence?.toLowerCase().replace(/^per\s+/, '') ?? 'use';
  return (
    <article className="border border-[color:var(--color-ink)]/10 bg-white/45 p-5 transition-colors hover:border-[color:var(--color-terra)]/50">
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)]">{template.deptFull}</span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--color-slate)]">{template.difficulty}</span>
      </div>
      <h3 className="mt-4 font-serif text-2xl leading-tight text-[color:var(--color-ink)]">{template.name}</h3>
      <p className="mt-3 min-h-[64px] text-sm leading-relaxed text-[color:var(--color-slate)]">{template.desc}</p>
      <div className="mt-5 border-t border-[color:var(--color-ink)]/10 pt-4 text-[11px] text-[color:var(--color-slate)]">
        Saves {template.timeSaved} per {cadenceLabel}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={onTry} className="bg-[color:var(--color-terra)] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]">Run it now</button>
        <button type="button" onClick={onCustomize} className="border border-[color:var(--color-ink)]/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)]">Edit and run</button>
      </div>
    </article>
  );
}

function BuilderPanel({ skill, setSkill, onNew, onSave }: {
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
  readonly modelSelection: ModelSelection;
  readonly setModelSelection: (next: ModelSelection) => void;
  readonly usage: { todayCents: number; dailyCapCents: number } | null;
  readonly onRun: () => void;
  readonly onSave: () => void;
  readonly onExport: () => void;
  readonly onCopy: () => void;
  readonly onEdit: () => void;
  readonly onBrowse: () => void;
  readonly onReset: () => void;
  readonly onSavePlayground: () => void;
  readonly playgroundSaveState: 'idle' | 'saving' | 'saved' | 'error';
}) {
  if (!props.activeSkill) {
    return (
      <section className="mx-auto max-w-2xl py-20 text-center">
        <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
          Playground
        </p>
        <h2 className="mt-3 font-serif text-4xl text-[color:var(--color-ink)]">
          Try a playbook against a fabricated scenario.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[color:var(--color-slate)]">
          The Playground runs any playbook through your selected model
          (Claude, GPT, or Gemini) against test data you supply. <span className="text-[color:var(--color-ink)]">Never enter real member data here</span> — these
          requests leave our servers.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-slate)]">
          Pick a starter from the Library to see how it works.
        </p>
        <button type="button" onClick={props.onBrowse} className="mt-6 bg-[color:var(--color-terra)] px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]">Browse Library</button>
      </section>
    );
  }

  const providerLabel =
    props.modelSelection.provider === 'anthropic'
      ? 'Claude'
      : props.modelSelection.provider === 'openai'
        ? 'GPT'
        : 'Gemini';

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content).catch(() => {
      /* clipboard may be unavailable; user can still select-copy */
    });
  };

  const saveRunLabel =
    props.playgroundSaveState === 'saving'
      ? 'Saving…'
      : props.playgroundSaveState === 'saved'
        ? 'Saved'
        : props.playgroundSaveState === 'error'
          ? 'Save failed'
          : 'Save this run';

  return (
    <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="h-fit border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-5 lg:sticky lg:top-40">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)]">
          {props.activeSkill.deptFull || props.activeSkill.dept || 'Playbook'}
        </p>
        <h2 className="mt-2 font-serif text-3xl leading-tight">{props.activeSkill.name}</h2>
        <p className="mt-1 font-mono text-[10px] text-[color:var(--color-slate)]">{props.activeSkill.cmd}</p>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-slate)]">{props.activeSkill.desc || (isWorkflowSkill(props.activeSkill) ? props.activeSkill.purpose : '')}</p>
        <div className="mt-5 grid gap-2 border-t border-[color:var(--color-ink)]/10 pt-4 text-xs text-[color:var(--color-slate)]">
          <p><span className="text-[color:var(--color-ink)]">Owner:</span> {props.activeSkill.owner}</p>
          <p><span className="text-[color:var(--color-ink)]">Output:</span> {props.activeSkill.output}</p>
          <p><span className="text-[color:var(--color-ink)]">Maturity:</span> {props.activeSkill.maturity}</p>
        </div>
        <div className="mt-5 grid gap-3">
          <button type="button" onClick={props.onSave} className="bg-[color:var(--color-terra)] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]">
            Save playbook changes
          </button>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <button type="button" onClick={props.onEdit} className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] hover:text-[color:var(--color-ink)]">
              Edit in Builder
            </button>
            <button type="button" onClick={props.onExport} className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] hover:text-[color:var(--color-ink)]">
              Download .md
            </button>
            <button type="button" onClick={props.onCopy} className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] hover:text-[color:var(--color-ink)]">
              Copy Markdown
            </button>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        {/* Input panel — primary surface, always at top. Banker types here first. */}
        <div className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-4">
          {/* Compact meta strip: safety + model + usage in one row */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-ink)]/10 pb-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-error)]">
              Sandbox · No real member data
            </p>
            {props.usage && (
              <p className="font-mono text-[10px] tabular-nums text-[color:var(--color-slate)]">
                ${(props.usage.todayCents / 100).toFixed(2)} / ${(props.usage.dailyCapCents / 100).toFixed(2)} today
              </p>
            )}
          </div>

          {isWorkflowSkill(props.activeSkill) && props.activeSkill.samples.length > 0 && props.input.trim() === '' && props.messages.length === 0 && (
            <div className="mb-3">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
                Or try a sample scenario
              </p>
              <div className="flex flex-wrap gap-2">
                {props.activeSkill.samples.map((sample) => (
                  <button key={sample.title} type="button" onClick={() => props.setInput(sample.prompt)} className="border border-[color:var(--color-terra)]/40 bg-white px-3 py-1.5 text-xs text-[color:var(--color-ink)] hover:border-[color:var(--color-terra)] hover:bg-[color:var(--color-parch)]">
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative">
            <textarea
              value={props.input}
              onChange={(event) => props.setInput(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  event.preventDefault();
                  if (!props.running && props.input.trim()) props.onRun();
                }
              }}
              rows={props.messages.length === 0 ? 8 : 5}
              placeholder={`Paste a fabricated banking scenario here. Press ⌘ Enter to run with ${providerLabel}.`}
              className="w-full resize-y border border-[color:var(--color-ink)]/15 bg-white px-3 py-2 pr-36 text-sm leading-relaxed focus:border-[color:var(--color-terra)] focus:outline-none"
            />
            <button
              type="button"
              disabled={props.running || !props.input.trim()}
              onClick={props.onRun}
              className="absolute bottom-3 right-3 bg-[color:var(--color-terra)] px-5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-[color:var(--color-linen)] hover:bg-[color:var(--color-terra-light)] disabled:opacity-40"
            >
              {props.running ? `${providerLabel} running…` : `Run ⌘↵`}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[180px] max-w-xs">
              <ModelPicker value={props.modelSelection} onChange={props.setModelSelection} disabled={props.running} />
            </div>
            <div className="flex flex-wrap gap-4">
              {props.messages.length > 0 && (
                <button type="button" onClick={props.onReset} className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] hover:text-[color:var(--color-terra)]">
                  Reset
                </button>
              )}
              <button
                type="button"
                disabled={props.messages.length === 0 || props.playgroundSaveState === 'saving'}
                onClick={() => {
                  if (props.messages.length === 0) return;
                  props.onSavePlayground();
                }}
                className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] hover:text-[color:var(--color-ink)] disabled:opacity-30"
              >
                {saveRunLabel} →
              </button>
            </div>
          </div>
        </div>

        {/* Thread — only renders when there's something to show. No empty-state ghost. */}
        {(props.messages.length > 0 || props.running) && (
          <div ref={props.threadRef} className="mt-4 max-h-[640px] overflow-y-auto border border-[color:var(--color-ink)]/10 bg-white p-4">
            {props.messages.map((message, idx) => (
              <div key={idx} className={`group mb-4 border-l-2 p-3 ${message.role === 'user' ? 'border-[color:var(--color-cobalt)] bg-[color:var(--color-cobalt-pale)]/35' : 'border-[color:var(--color-terra)] bg-[color:var(--color-parch)]'}`}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
                    {message.role === 'user' ? 'You' : providerLabel}
                  </p>
                  {message.role === 'assistant' && message.content && (
                    <button
                      type="button"
                      onClick={() => copyMessage(message.content)}
                      className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[color:var(--color-terra)]"
                      aria-label="Copy response"
                    >
                      Copy
                    </button>
                  )}
                </div>
                <div className="text-sm leading-relaxed">{message.role === 'assistant' ? renderMarkdown(message.content) : <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>}</div>
              </div>
            ))}
            {props.running && <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)]">{providerLabel} is thinking…</p>}
          </div>
        )}
      </div>
    </section>
  );
}

function ToolboxPanel({ skills, librarySlugMap, onRun, onEdit, onExport, onDelete, onBrowse, onBuild }: {
  readonly skills: readonly ToolboxSkill[];
  readonly librarySlugMap: Readonly<Record<string, string>>;
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
        <p className="mt-3 text-sm text-[color:var(--color-slate)]">Start from a Library template or build the first custom skill for your recurring work.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={onBrowse} className="bg-[color:var(--color-terra)] px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]">Browse Library</button>
          <button type="button" onClick={onBuild} className="border border-[color:var(--color-ink)]/20 px-5 py-3 font-mono text-[10px] uppercase tracking-widest">Build from scratch</button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-end justify-between border-b border-[color:var(--color-ink)]/10 pb-5">
        <div>
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">My Playbooks</p>
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
            <p className="mt-3 min-h-[64px] text-sm leading-relaxed text-[color:var(--color-slate)]">{skill.desc || (isWorkflowSkill(skill) ? skill.purpose : '')}</p>
            <div className="mt-3">
              <SourceBacklink source={skill.source} sourceRef={skill.sourceRef} librarySlugMap={librarySlugMap} />
            </div>
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
