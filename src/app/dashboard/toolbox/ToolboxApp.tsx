'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { TOOLBOX_TEMPLATES } from '@/content/toolbox/templates';
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
import type { ToolboxTier } from '@/lib/toolbox/access';
import { renderMarkdown } from '@/lib/sandbox/markdown-renderer';
import { KindPicker } from './_components/KindPicker';
import { ModelPicker, type ModelSelection } from './_components/ModelPicker';
import { TemplateBuilder } from './_components/TemplateBuilder';
import { ToolboxHomeV5 } from './_components/ToolboxHomeV5';
import { ToolboxQualityLadder } from './_components/ToolboxQualityLadder';
import { WelcomeOverlay, readOnboarded } from './_components/WelcomeOverlay';
import { useUsage } from './_components/UsageMeter';

type TabId = 'guide' | 'library' | 'build' | 'playground' | 'toolbox';

// All tabs in canonical order. Per #219, Starter-tier (In-Depth Assessment
// buyers) only sees the read-only tabs — Build + AiBI Lab are hidden.
const ALL_TABS: readonly { id: TabId; label: string; tiers: readonly ToolboxTier[] }[] = [
  { id: 'guide', label: 'Start Here', tiers: ['full', 'starter'] },
  { id: 'library', label: 'Library', tiers: ['full', 'starter'] },
  { id: 'build', label: 'Build', tiers: ['full'] },
  { id: 'playground', label: 'AiBI Lab', tiers: ['full'] },
  { id: 'toolbox', label: 'My Toolbox', tiers: ['full', 'starter'] },
];

function tabsForTier(tier: ToolboxTier): readonly { id: TabId; label: string }[] {
  return ALL_TABS.filter((t) => t.tiers.includes(tier)).map(({ id, label }) => ({ id, label }));
}

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
  /**
   * Entitlement tier resolved on the server (#219). Defaults to 'starter'
   * (fail-closed): if a caller forgets to pass the prop, the UI will hide
   * Build + AiBI Lab rather than silently un-gate them for a free user.
   * Mutating API endpoints are gated server-side regardless, so this is
   * defense-in-depth, not the only barrier.
   */
  readonly tier?: ToolboxTier;
}

export function ToolboxApp({ tier = 'starter' }: ToolboxAppProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get('tab') as TabId | null) ?? 'guide';
  const tabsForActiveTier = tabsForTier(tier);
  // If the URL points at a tab this tier can't see (e.g. ?tab=playground
  // on a Starter user), collapse back to 'guide' rather than rendering a
  // tab the user shouldn't reach.
  const safeTab = tabsForActiveTier.some((tab) => tab.id === currentTab) ? currentTab : 'guide';

  const [showWelcome, setShowWelcome] = useState(false);

  // Show welcome overlay once per browser, on first mount (#231 Slice 3).
  useEffect(() => {
    if (!readOnboarded()) setShowWelcome(true);
  }, []);

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
  // #8 layer 2 — typed-confirmation gate. Resets per session (sessionStorage).
  // Once a learner has typed the confirmation phrase in a given tab session,
  // they don't get re-prompted on subsequent runs in the same session.
  const [confirmedSession, setConfirmedSession] = useState(false);
  const [confirmGateOpen, setConfirmGateOpen] = useState(false);
  // #8 layer 3 — telemetered "send anyway" path. When the API returns a
  // pii_warning (HTTP 422 with kind:'pii_warning'), we surface the reason
  // and offer the override. Plausible fires on shown + send.
  const [piiWarning, setPiiWarning] = useState<{
    readonly reason: string;
    readonly pendingMessages: readonly ToolboxMessage[];
  } | null>(null);
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
      .catch(() => setNotice(
        'Saved assets are unavailable right now. Library and AiBI Lab still work; your saved items will reappear when the connection is restored.',
      ));
  }, []);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages]);

  // #8 layer 3 — Plausible event helper. Safe no-op when the script hasn't
  // loaded yet thanks to the deferred-queue pattern set up in layout.tsx.
  function firePlausible(event: string, props?: Record<string, string | number>) {
    if (typeof window !== 'undefined' && typeof (window as unknown as {
      plausible?: (e: string, opts?: { props?: Record<string, string | number> }) => void;
    }).plausible === 'function') {
      (window as unknown as {
        plausible: (e: string, opts?: { props?: Record<string, string | number> }) => void;
      }).plausible(event, props ? { props } : undefined);
    }
  }

  function confirmAndRun() {
    try {
      sessionStorage.setItem('toolbox-pii-confirmed', 'true');
    } catch {
      /* sessionStorage unavailable — accept the confirmation in-memory only */
    }
    setConfirmedSession(true);
    setConfirmGateOpen(false);
    firePlausible('playground_typed_confirm_accepted');
    void sendMessages(
      [...messages, { role: 'user' as const, content: input.trim() }],
      { confirmedFabricated: false },
    );
  }

  function overrideAndSend() {
    if (!piiWarning) return;
    const pending = piiWarning.pendingMessages;
    setPiiWarning(null);
    void sendMessages(pending, { confirmedFabricated: true });
  }

  function dismissPiiWarning() {
    if (!piiWarning) return;
    firePlausible('playground_pii_override_cancelled');
    setPiiWarning(null);
  }

  // #8 layer 2 — restore session-scoped confirmation on tab reload.
  useEffect(() => {
    try {
      if (sessionStorage.getItem('toolbox-pii-confirmed') === 'true') {
        setConfirmedSession(true);
      }
    } catch {
      /* sessionStorage unavailable (e.g. SSR or sandboxed iframe) — fail open */
    }
  }, []);

  const roles = useMemo(() => (
    ['all', ...Array.from(new Set(TOOLBOX_TEMPLATES.map((template) => template.deptFull)))]
  ), []);

  const filteredTemplates = useMemo(() => TOOLBOX_TEMPLATES.filter((template) => {
    const roleMatch = roleFilter === 'all' || template.deptFull === roleFilter;
    const difficultyMatch = difficultyFilter === 'all' || template.difficulty === difficultyFilter;
    return roleMatch && difficultyMatch;
  }), [difficultyFilter, roleFilter]);
  const recommendedStarter = useMemo(
    () => TOOLBOX_TEMPLATES.find((template) => template.id === RECOMMENDED_STARTER_ID) ?? TOOLBOX_TEMPLATES[0] ?? null,
    [],
  );

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
    setNotice('Skill saved to your Toolbox.');
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
    // #8 layer 2 — typed-confirmation gate on first free-form send per session.
    if (!confirmedSession) {
      setConfirmGateOpen(true);
      return;
    }
    await sendMessages(
      [...messages, { role: 'user' as const, content: input.trim() }],
      { confirmedFabricated: false },
    );
  }

  async function sendMessages(
    nextMessages: readonly ToolboxMessage[],
    opts: { readonly confirmedFabricated: boolean },
  ) {
    if (!activeSkill) return;
    setMessages([...nextMessages]);
    setInput('');
    setRunning(true);
    try {
      const res = await fetch('/api/toolbox/run/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: activeSkill,
          messages: nextMessages,
          provider: modelSelection.provider,
          model: modelSelection.model,
          confirmedFabricated: opts.confirmedFabricated,
        }),
      });
      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => ({ error: 'Unknown error.' }));
        // #8 layer 3 — pii_warning is a recoverable state with override path.
        if (res.status === 422 && (json as { kind?: string }).kind === 'pii_warning') {
          // Roll back the optimistic user message — the warning UI now owns
          // the decision; if the learner confirms, sendMessages reissues it.
          setMessages((prev) => prev.slice(0, -1));
          firePlausible('playground_pii_override_shown', { reason: String(json.error).slice(0, 60) });
          setPiiWarning({ reason: String(json.error), pendingMessages: nextMessages });
          setRunning(false);
          return;
        }
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${json.error ?? res.statusText}` }]);
        setRunning(false);
        return;
      }
      if (opts.confirmedFabricated) {
        firePlausible('playground_pii_override_send');
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
  }

  function copySkill(skill: ToolboxSkill) {
    navigator.clipboard.writeText(generateToolboxMarkdown(skill))
      .then(() => setNotice('Markdown copied.'))
      .catch(() => setNotice('Copy failed. Download the Markdown file instead.'));
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 lg:px-10">
      <nav className="sticky top-[81px] z-30 -mx-6 mb-8 flex items-center gap-1 overflow-x-auto border-b border-[color:var(--ink)]/10 bg-[color:var(--cream)] px-6 lg:-mx-10 lg:px-10" aria-label="Toolbox sections">
        {tabsForActiveTier.map((tab) => (
          <Link
            key={tab.id}
            href={`/dashboard/toolbox?tab=${tab.id}`}
            className={`whitespace-nowrap border-b-2 px-4 py-4 text-[10px] uppercase tracking-widest transition-colors ${
              safeTab === tab.id
                ? 'border-[color:var(--gold-deep)] text-[color:var(--gold-deep)]'
                : 'border-transparent text-[color:var(--slate-500)] hover:text-[color:var(--ink)]'
            }`}
          >
            {tab.label}
            {tab.id === 'toolbox' && skills.length > 0 ? ` (${skills.length})` : ''}
          </Link>
        ))}
        <Link
          href="/dashboard/toolbox/cookbook"
          className="whitespace-nowrap border-b-2 border-transparent px-4 py-4 text-[10px] uppercase tracking-widest text-[color:var(--slate-500)] transition-colors hover:text-[color:var(--ink)]"
        >
          Cookbook
        </Link>
      </nav>

      {notice && (
        <button
          type="button"
          onClick={() => setNotice(null)}
          role="status"
          aria-live="polite"
          className="mb-6 grid w-full gap-1 border border-[color:var(--gold-deep)]/25 bg-white px-4 py-3 text-left text-sm text-[color:var(--ink)] shadow-sm transition-colors hover:border-[color:var(--gold-deep)]/50"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
            Toolbox note
          </span>
          <span className="max-w-4xl font-semibold leading-relaxed text-[color:var(--slate-600)]">
            {notice}
          </span>
        </button>
      )}

      <WorkbenchPath
        activeTab={safeTab}
        tier={tier}
        savedCount={skills.length}
        activeSkillName={activeSkill?.name ?? null}
        onOpenLibrary={() => setTab('library')}
        onOpenPlayground={() => setTab('playground')}
        onOpenToolbox={() => setTab('toolbox')}
      />

      {safeTab === 'guide' && (
        <GuidePanel
          savedCount={skills.length}
          starter={recommendedStarter}
          tier={tier}
          setTab={setTab}
          onStartMission={() => {
            if (recommendedStarter && tier === 'full') {
              loadSkill(toSkill(recommendedStarter), 'playground');
              return;
            }
            setTab('library');
          }}
        />
      )}

      {safeTab === 'library' && (
        <section className="space-y-6">
          <FirstRunHint
            skills={skills}
            templates={TOOLBOX_TEMPLATES}
            onTry={(template) => loadSkill(toSkill(template), 'playground')}
          />
          <div className="flex flex-col gap-4 border-b border-[color:var(--ink)]/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
                Library
              </p>
              <h2 className="mt-2 text-4xl text-[color:var(--ink)]">
                Pre-built playbooks for common banking AI tasks.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--slate-500)]">
                Pick one, run it as-is in the AiBI Lab, or edit it for your institution.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-[color:var(--slate-500)]">Role</span>
                <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="border border-[color:var(--ink)]/15 bg-white px-3 py-2 text-sm">
                  {roles.map((role) => <option key={role} value={role}>{role === 'all' ? 'All roles' : role}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-[color:var(--slate-500)]">Difficulty</span>
                <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)} className="border border-[color:var(--ink)]/15 bg-white px-3 py-2 text-sm">
                  <option value="all">All levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
            </div>
          </div>
          {filteredTemplates.length === 0 ? (
            <div className="border border-[color:var(--ink)]/10 bg-[color:var(--cream)] px-6 py-10 text-center">
              <p className="text-2xl text-[color:var(--ink)]">No playbooks match these filters.</p>
              <p className="mt-2 text-sm text-[color:var(--slate-500)]">Try clearing the role or difficulty filter.</p>
              <button
                type="button"
                onClick={() => { setRoleFilter('all'); setDifficultyFilter('all'); }}
                className="mt-5 border border-[color:var(--ink)]/20 px-4 py-2 text-[10px] uppercase tracking-widest text-[color:var(--ink)] hover:border-[color:var(--gold-deep)] hover:text-[color:var(--gold-deep)]"
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
            className="mb-6 text-[10px] uppercase tracking-widest text-[color:var(--slate-500)] hover:text-[color:var(--gold-deep)]"
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
            className="mb-6 text-[10px] uppercase tracking-widest text-[color:var(--slate-500)] hover:text-[color:var(--gold-deep)]"
          >
            ← Choose a different kind
          </button>
          <TemplateBuilder skill={templateSkill} onChange={setTemplateSkill} />
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => setTemplateSkill({ ...EMPTY_TEMPLATE_SKILL })}
              className="border border-[color:var(--ink)]/20 px-4 py-2 text-[10px] uppercase tracking-widest"
            >
              New template
            </button>
            <button
              type="button"
              onClick={async () => {
                const saved = await saveSkill(templateSkill);
                if (saved) loadSkill(saved, 'playground');
              }}
              className="bg-[color:var(--gold-deep)] px-4 py-2 text-[10px] uppercase tracking-widest text-[color:var(--cream)]"
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
          piiWarning={piiWarning}
          onPiiOverride={overrideAndSend}
          onPiiDismiss={dismissPiiWarning}
          confirmGateOpen={confirmGateOpen}
          onConfirmGateAccept={confirmAndRun}
          onConfirmGateCancel={() => setConfirmGateOpen(false)}
        />
      )}

      {safeTab === 'toolbox' && (
        <ToolboxHomeV5
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

      {showWelcome && (
        <WelcomeOverlay
          tier={tier}
          onDismiss={() => setShowWelcome(false)}
          onOpenLibrary={() => setTab('library')}
        />
      )}
    </div>
  );
}

const FIRST_RUN_DISMISSED_KEY = 'aibi-toolbox-first-run-hint-dismissed';
const RECOMMENDED_STARTER_ID = 'exam-prep';

function WorkbenchPath({
  activeTab,
  tier,
  savedCount,
  activeSkillName,
  onOpenLibrary,
  onOpenPlayground,
  onOpenToolbox,
}: {
  readonly activeTab: TabId;
  readonly tier: ToolboxTier;
  readonly savedCount: number;
  readonly activeSkillName: string | null;
  readonly onOpenLibrary: () => void;
  readonly onOpenPlayground: () => void;
  readonly onOpenToolbox: () => void;
}) {
  const canRun = tier === 'full';
  const activeStep =
    activeTab === 'playground' && activeSkillName
      ? 'run'
      : activeTab === 'toolbox'
        ? 'save'
        : 'choose';
  const nextMove =
    activeTab === 'library'
      ? 'Run one starter with sample facts.'
      : activeTab === 'playground'
        ? activeSkillName
          ? 'Review the output, then save the trusted version.'
          : 'Choose a Library playbook first.'
        : activeTab === 'toolbox'
          ? savedCount > 0
            ? 'Re-run, export, or improve a saved asset.'
            : 'Start from the Library to save your first asset.'
          : 'Start in the Library.';

  const steps = [
    {
      id: 'choose',
      label: 'Choose',
      title: 'Library playbook',
      detail: 'Pick a banking-safe starter.',
      active: activeStep === 'choose',
      action: onOpenLibrary,
      disabled: false,
    },
    {
      id: 'run',
      label: 'Run',
      title: canRun ? 'AiBI Lab' : 'Preview only',
      detail: canRun
        ? activeSkillName
          ? `Testing: ${activeSkillName}`
          : 'Use sample facts only.'
        : 'Unlocks with Foundation.',
      active: activeStep === 'run',
      action: onOpenPlayground,
      disabled: !canRun,
    },
    {
      id: 'save',
      label: 'Save',
      title: 'My Toolbox',
      detail: savedCount > 0 ? `${savedCount} reusable asset${savedCount === 1 ? '' : 's'}` : 'Keep the trusted version.',
      active: activeStep === 'save',
      action: onOpenToolbox,
      disabled: false,
    },
  ] as const;

  return (
    <section
      aria-label="Toolbox workflow"
      className="mb-8 border-y border-[color:var(--ink-a10)] bg-white/55 py-4"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
            Current workflow
          </p>
          <p className="mt-1 text-lg font-bold leading-snug text-[color:var(--ink)]">
            {nextMove}
          </p>
        </div>
        <ol className="grid min-w-0 flex-1 gap-2 sm:grid-cols-3 lg:max-w-3xl">
          {steps.map((step, index) => (
            <li key={step.id}>
              <button
                type="button"
                onClick={step.action}
                disabled={step.disabled}
                aria-current={step.active ? 'step' : undefined}
                className={`grid h-full w-full grid-cols-[34px_minmax(0,1fr)] items-center gap-3 border px-3 py-3 text-left transition-colors ${
                  step.active
                    ? 'border-[color:var(--ink)] bg-[color:var(--ink)] text-white'
                    : 'border-[color:var(--ink-a10)] bg-[color:var(--cream)] text-[color:var(--ink)] hover:border-[color:var(--gold-deep)]'
                } ${step.disabled ? 'cursor-not-allowed opacity-55 hover:border-[color:var(--ink-a10)]' : ''}`}
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-[11px] font-black tabular-nums ${
                    step.active
                      ? 'bg-[color:var(--gold)] text-[color:var(--ink)]'
                      : 'bg-white text-[color:var(--gold-deep)]'
                  }`}
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-black uppercase tracking-[0.16em]">
                    {step.label}
                  </span>
                  <span className="mt-1 block truncate text-sm font-bold">
                    {step.title}
                  </span>
                  <span
                    className={`mt-0.5 block truncate text-xs font-semibold ${
                      step.active ? 'text-white/70' : 'text-[color:var(--slate-500)]'
                    }`}
                  >
                    {step.detail}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

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
    <div className="border border-[color:var(--gold-deep)]/30 bg-[color:var(--cream)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
            New here? Start with this one.
          </p>
          <h3 className="mt-2 text-2xl text-[color:var(--ink)]">
            {starter.name}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--slate-500)]">
            {starter.desc} It runs in the AiBI Lab in under a minute against a
            fabricated scenario — no real data needed.
          </p>
          <button
            type="button"
            onClick={() => {
              onTry(starter);
              handleDismiss();
            }}
            className="mt-4 bg-[color:var(--gold-deep)] px-5 py-2.5 text-[10px] uppercase tracking-widest text-[color:var(--cream)]"
          >
            Try it now
          </button>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss tip"
          className="text-[10px] uppercase tracking-widest text-[color:var(--slate-500)] hover:text-[color:var(--ink)]"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

function GuidePanel({
  savedCount,
  starter,
  tier,
  setTab,
  onStartMission,
}: {
  readonly savedCount: number;
  readonly starter: ToolboxSkillTemplate | null;
  readonly tier: ToolboxTier;
  readonly setTab: (tab: TabId) => void;
  readonly onStartMission: () => void;
}) {
  const canRun = tier === 'full';
  const missionSteps = [
    ['Load', starter?.name ?? 'Regulatory Exam Preparation'],
    ['Run', 'Use the built-in exam sample.'],
    ['Review', 'Mark one evidence gap or edit.'],
    ['Save', 'Keep the trusted version.'],
  ] as const;
  const proofPoints = [
    ['Library', 'Banking-safe starters'],
    ['AiBI Lab', 'Sample facts only'],
    ['My Toolbox', 'Reusable version'],
  ] as const;
  const workDestinations = [
    ['Foundation Packet', 'Module artifacts you submit as proof of learning.'],
    ['My Toolbox', 'Reusable prompts and playbooks after you test them.'],
  ] as const;

  return (
    <section className="py-6 text-[color:var(--ink)]" aria-labelledby="toolbox-guide-heading">
      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold-deep)]">
            Start here · First 10 minutes
          </p>
          <h1
            id="toolbox-guide-heading"
            className="mt-3 max-w-2xl text-4xl leading-[0.98] tracking-[-0.035em] text-[color:var(--ink)] md:text-6xl"
          >
            Run one workflow. Save one reusable asset.
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold leading-relaxed text-[color:var(--slate-600)]">
            The course builds judgment. The Toolbox turns inspected prompts and playbooks into assets you can run again.
          </p>
          <div className="mt-5 grid max-w-xl grid-cols-2 gap-2">
            {workDestinations.map(([label, body]) => (
              <div
                key={label}
                className="border border-[color:var(--ink-a10)] bg-white px-3 py-3 sm:px-4"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
                  {label}
                </p>
                <p className="mt-1 text-xs font-bold leading-snug text-[color:var(--ink)] sm:text-sm">
                  {body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStartMission}
              className="min-h-[44px] bg-[color:var(--gold-deep)] px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--cream)] transition-colors hover:bg-[color:var(--ink)]"
            >
              {canRun ? 'Start guided run' : 'Browse starters'}
            </button>
            <button
              type="button"
              onClick={() => setTab('toolbox')}
              className="min-h-[44px] border border-[color:var(--ink-a15)] px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--ink)] transition-colors hover:border-[color:var(--ink)]"
            >
              My Toolbox {savedCount > 0 ? `(${savedCount})` : ''}
            </button>
          </div>
        </div>

        <div className="border border-[color:var(--ink)] bg-white">
          <div className="grid gap-5 border-b border-[color:var(--ink-a10)] p-5 md:grid-cols-[minmax(0,1fr)_180px] md:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
                Guided mission
              </p>
              <h2 className="mt-2 text-3xl leading-tight tracking-[-0.03em] text-[color:var(--ink)]">
                {starter?.name ?? 'Regulatory Exam Preparation'}
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-[color:var(--slate-600)]">
                Start with a fabricated exam scenario, inspect the output, and save a reusable version.
              </p>
            </div>
            <div className="bg-[color:var(--ink)] px-4 py-3 text-[color:var(--cream)]">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--gold)]">
                Current proof
              </p>
              <p className="mt-1 text-3xl font-black leading-none tracking-[-0.03em]">
                {savedCount}
              </p>
              <p className="mt-1 text-xs font-bold text-white/70">
                saved asset{savedCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <ol className="grid grid-cols-2 gap-0 md:grid-cols-4">
            {missionSteps.map(([label, body], index) => (
              <li
                key={label}
                className="grid min-h-[104px] gap-2 border-b border-r border-[color:var(--ink-a10)] p-3 even:border-r-0 md:block md:min-h-[132px] md:border-b-0 md:border-r md:p-4 md:last:border-r-0"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--cream)] text-[11px] font-black tabular-nums text-[color:var(--gold-deep)] md:mb-4 md:h-9 md:w-9 md:text-xs">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
                    {label}
                  </span>
                  <span className="mt-1 block text-xs font-bold leading-snug text-[color:var(--ink)] md:mt-2 md:text-sm">
                    {body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <ToolboxQualityLadder className="mt-8" />

      <div className="mt-8 grid grid-cols-3 gap-2 border-y border-[color:var(--ink-a10)] py-5 md:gap-3">
        {proofPoints.map(([label, body]) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              if (label === 'Library') setTab('library');
              if (label === 'AiBI Lab') setTab(canRun ? 'playground' : 'library');
              if (label === 'My Toolbox') setTab('toolbox');
            }}
            className="min-h-[68px] border border-[color:var(--ink-a10)] bg-[color:var(--cream)] px-3 py-3 text-left transition-colors hover:border-[color:var(--gold-deep)] md:min-h-[88px] md:px-4"
          >
            <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-[color:var(--gold-deep)] md:text-[10px] md:tracking-[0.18em]">
              {label}
            </span>
            <span className="mt-1 block text-xs font-bold leading-snug text-[color:var(--slate-600)] md:mt-2 md:text-sm md:leading-relaxed">
              {body}
            </span>
          </button>
        ))}
      </div>

      <aside className="mt-6 border-l-4 border-[color:var(--gold)] bg-[color:var(--cream)] px-5 py-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
          Need an example?
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--slate-500)]">
          The Cookbook shows one complete workflow with the prompt, model output, review notes, and gotchas.
        </p>
        <Link
          href="/dashboard/toolbox/cookbook"
          className="mt-4 inline-block text-[10px] uppercase tracking-widest text-[color:var(--gold-deep)] border-b border-[color:var(--gold-deep)] hover:text-[color:var(--ink)] hover:border-[color:var(--ink)]"
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
    <article className="border border-[color:var(--ink)]/10 bg-white/45 p-5 transition-colors hover:border-[color:var(--gold-deep)]/50">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] uppercase tracking-widest text-[color:var(--gold-deep)]">{template.deptFull}</span>
        <span className="text-[9px] uppercase tracking-widest text-[color:var(--slate-500)]">{template.difficulty}</span>
      </div>
      <h3 className="mt-4 text-2xl leading-tight text-[color:var(--ink)]">{template.name}</h3>
      <p className="mt-3 min-h-[64px] text-sm leading-relaxed text-[color:var(--slate-500)]">{template.desc}</p>
      <div className="mt-5 border-t border-[color:var(--ink)]/10 pt-4 text-[11px] text-[color:var(--slate-500)]">
        Saves {template.timeSaved} per {cadenceLabel}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={onTry} className="bg-[color:var(--gold-deep)] px-3 py-2 text-[10px] uppercase tracking-widest text-[color:var(--cream)]">Run it now</button>
        <button type="button" onClick={onCustomize} className="border border-[color:var(--ink)]/20 px-3 py-2 text-[10px] uppercase tracking-widest text-[color:var(--ink)]">Edit and run</button>
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
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">Build</p>
        <h2 className="mt-2 text-4xl text-[color:var(--ink)]">Define the reusable workflow.</h2>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--slate-500)]">
          Keep the skill narrow, owned, versioned, and explicit about when a human must take over.
        </p>
        <div className="mt-6 flex gap-2">
          <button type="button" onClick={onNew} className="border border-[color:var(--ink)]/20 px-4 py-2 text-[10px] uppercase tracking-widest">New skill</button>
          <button type="button" onClick={onSave} className="bg-[color:var(--gold-deep)] px-4 py-2 text-[10px] uppercase tracking-widest text-[color:var(--cream)]">Save and test</button>
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
      <span className="text-[10px] uppercase tracking-widest text-[color:var(--slate-500)]">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="mt-2 w-full border border-[color:var(--ink)]/15 bg-white px-3 py-2 text-sm leading-relaxed" />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full border border-[color:var(--ink)]/15 bg-white px-3 py-2 text-sm" />
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
  // #8 PII safety props
  readonly piiWarning: { readonly reason: string; readonly pendingMessages: readonly ToolboxMessage[] } | null;
  readonly onPiiOverride: () => void;
  readonly onPiiDismiss: () => void;
  readonly confirmGateOpen: boolean;
  readonly onConfirmGateAccept: () => void;
  readonly onConfirmGateCancel: () => void;
}) {
  if (!props.activeSkill) {
    // Empty state still gets layer 4 (the persistent disclaimer banner)
    // — the warning has to ride along with the AiBI Lab tab even before
    // a playbook is loaded, otherwise the banner only appears once the
    // user has already engaged and the surface is no longer "blank."
    return (
      <section className="space-y-4">
        <div
          role="note"
          aria-label="AiBI Lab data-handling notice"
          className="flex flex-wrap items-center justify-between gap-3 border border-[color:var(--ink)]/30 bg-[color:var(--cream)] px-4 py-3"
        >
          <p className="text-[11px] uppercase tracking-widest text-[color:var(--ink)]">
            Sandbox · Never enter real member, account, or institution-confidential data
          </p>
          <p className="text-[10px] tracking-wide text-[color:var(--slate-500)]">
            Requests leave our servers. Use fabricated examples only.
          </p>
        </div>
        <div className="mx-auto max-w-2xl py-20 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
            AiBI Lab
          </p>
          <h2 className="mt-3 text-4xl text-[color:var(--ink)]">
            Try a playbook against a fabricated scenario.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[color:var(--slate-500)]">
            The AiBI Lab runs any playbook through your selected model
            (Claude, GPT, or Gemini) against test data you supply.{' '}
            <span className="text-[color:var(--ink)]">Never enter real member data here</span> — these
            requests leave our servers.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--slate-500)]">
            Pick a starter from the Library to see how it works.
          </p>
          <button type="button" onClick={props.onBrowse} className="mt-6 bg-[color:var(--gold-deep)] px-5 py-3 text-[10px] uppercase tracking-widest text-[color:var(--cream)]">Browse Library</button>
        </div>
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
    <section className="space-y-4">
      {/*
        #8 layer 4 — persistent disclaimer banner. Always visible at the top
        of the AiBI Lab tab, regardless of which playbook is active. Uses
        oxblood-on-parchment so it reads as a regulatory notice, not a
        marketing badge.
      */}
      <div
        role="note"
        aria-label="AiBI Lab data-handling notice"
        className="flex flex-wrap items-center justify-between gap-3 border border-[color:var(--ink)]/30 bg-[color:var(--cream)] px-4 py-3"
      >
        <p className="text-[11px] uppercase tracking-widest text-[color:var(--ink)]">
          Sandbox · Never enter real member, account, or institution-confidential data
        </p>
        <p className="text-[10px] tracking-wide text-[color:var(--slate-500)]">
          Requests leave our servers. Use fabricated examples only.
        </p>
      </div>

      {/* #8 layer 2 — typed-confirmation gate, first send per session. */}
      {props.confirmGateOpen && (
        <TypedConfirmGate
          onConfirm={props.onConfirmGateAccept}
          onCancel={props.onConfirmGateCancel}
        />
      )}

      {/* #8 layer 3 — telemetered "send anyway" path on PII detection. */}
      {props.piiWarning && (
        <PiiOverrideBanner
          reason={props.piiWarning.reason}
          onOverride={props.onPiiOverride}
          onDismiss={props.onPiiDismiss}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="h-fit border border-[color:var(--ink)]/10 bg-[color:var(--cream)] p-5 lg:sticky lg:top-40">
        <p className="text-[10px] uppercase tracking-widest text-[color:var(--gold-deep)]">
          {props.activeSkill.deptFull || props.activeSkill.dept || 'Playbook'}
        </p>
        <h2 className="mt-2 text-3xl leading-tight">{props.activeSkill.name}</h2>
        <p className="mt-1 text-[10px] text-[color:var(--slate-500)]">{props.activeSkill.cmd}</p>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--slate-500)]">{props.activeSkill.desc || (isWorkflowSkill(props.activeSkill) ? props.activeSkill.purpose : '')}</p>
        <div className="mt-5 grid gap-2 border-t border-[color:var(--ink)]/10 pt-4 text-xs text-[color:var(--slate-500)]">
          <p><span className="text-[color:var(--ink)]">Owner:</span> {props.activeSkill.owner}</p>
          <p><span className="text-[color:var(--ink)]">Output:</span> {props.activeSkill.output}</p>
          <p><span className="text-[color:var(--ink)]">Maturity:</span> {props.activeSkill.maturity}</p>
        </div>
        <div className="mt-5 grid gap-3">
          <button type="button" onClick={props.onSave} className="bg-[color:var(--gold-deep)] px-3 py-2 text-[10px] uppercase tracking-widest text-[color:var(--cream)]">
            Save playbook changes
          </button>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <button type="button" onClick={props.onEdit} className="text-[10px] uppercase tracking-widest text-[color:var(--gold-deep)] hover:text-[color:var(--ink)]">
              Edit in Builder
            </button>
            <button type="button" onClick={props.onExport} className="text-[10px] uppercase tracking-widest text-[color:var(--gold-deep)] hover:text-[color:var(--ink)]">
              Download .md
            </button>
            <button type="button" onClick={props.onCopy} className="text-[10px] uppercase tracking-widest text-[color:var(--gold-deep)] hover:text-[color:var(--ink)]">
              Copy Markdown
            </button>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        {/* Input panel — primary surface, always at top. Banker types here first. */}
        <div className="border border-[color:var(--ink)]/10 bg-[color:var(--cream)] p-4">
          {/* Compact meta strip: safety + model + usage in one row */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--ink)]/10 pb-3">
            <p className="text-[10px] uppercase tracking-widest text-[color:var(--ink)]">
              Sandbox · No real member data
            </p>
            {props.usage && (
              <p className="text-[10px] tabular-nums text-[color:var(--slate-500)]">
                ${(props.usage.todayCents / 100).toFixed(2)} / ${(props.usage.dailyCapCents / 100).toFixed(2)} today
              </p>
            )}
          </div>

          {isWorkflowSkill(props.activeSkill) && props.activeSkill.samples.length > 0 && props.input.trim() === '' && props.messages.length === 0 && (
            <div className="mb-3">
              <p className="mb-2 text-[10px] uppercase tracking-widest text-[color:var(--slate-500)]">
                Or try a sample scenario
              </p>
              <div className="flex flex-wrap gap-2">
                {props.activeSkill.samples.map((sample) => (
                  <button key={sample.title} type="button" onClick={() => props.setInput(sample.prompt)} className="border border-[color:var(--gold-deep)]/40 bg-white px-3 py-1.5 text-xs text-[color:var(--ink)] hover:border-[color:var(--gold-deep)] hover:bg-[color:var(--cream)]">
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative">
            <textarea
              aria-label="Prompt input"
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
              className="w-full resize-y border border-[color:var(--ink)]/15 bg-white px-3 py-2 pr-36 text-sm leading-relaxed focus:border-[color:var(--gold-deep)] focus:outline-none"
            />
            <button
              type="button"
              disabled={props.running || !props.input.trim()}
              onClick={props.onRun}
              className="absolute bottom-3 right-3 bg-[color:var(--gold-deep)] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--cream)] hover:bg-[color:var(--gold-deep)] disabled:opacity-40"
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
                <button type="button" onClick={props.onReset} className="text-[10px] uppercase tracking-widest text-[color:var(--slate-500)] hover:text-[color:var(--gold-deep)]">
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
                className="text-[10px] uppercase tracking-widest text-[color:var(--gold-deep)] hover:text-[color:var(--ink)] disabled:opacity-30"
              >
                {saveRunLabel} →
              </button>
            </div>
          </div>
        </div>

        {/* Thread — only renders when there's something to show. No empty-state ghost. */}
        {(props.messages.length > 0 || props.running) && (
          <div ref={props.threadRef} className="mt-4 max-h-[640px] overflow-y-auto border border-[color:var(--ink)]/10 bg-white p-4">
            {props.messages.map((message, idx) => (
              <div key={idx} className={`group mb-4 border-l-2 p-3 ${message.role === 'user' ? 'border-[color:var(--gold-deep)] bg-[color:var(--cream-2)]/35' : 'border-[color:var(--gold-deep)] bg-[color:var(--cream)]'}`}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-[10px] uppercase tracking-widest text-[color:var(--slate-500)]">
                    {message.role === 'user' ? 'You' : providerLabel}
                  </p>
                  {message.role === 'assistant' && message.content && (
                    <button
                      type="button"
                      onClick={() => copyMessage(message.content)}
                      className="text-[10px] uppercase tracking-widest text-[color:var(--slate-500)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[color:var(--gold-deep)]"
                      aria-label="Copy response"
                    >
                      Copy
                    </button>
                  )}
                </div>
                <div className="text-sm leading-relaxed">{message.role === 'assistant' ? renderMarkdown(message.content) : <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>}</div>
              </div>
            ))}
            {props.running && <p className="text-[10px] uppercase tracking-widest text-[color:var(--gold-deep)]">{providerLabel} is thinking…</p>}
          </div>
        )}
      </div>
      </div>
    </section>
  );
}

function TypedConfirmGate(props: {
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}) {
  const [typed, setTyped] = useState('');
  const REQUIRED = 'I confirm this is fabricated data';
  const matches = typed.trim().toLowerCase() === REQUIRED.toLowerCase();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pii-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--ink)]/40 px-4"
    >
      <div className="w-full max-w-lg border border-[color:var(--ink)]/15 bg-white p-6">
        <p className="text-[10px] uppercase tracking-widest text-[color:var(--ink)]">
          Sandbox confirmation
        </p>
        <h3
          id="pii-confirm-title"
          className="mt-2 text-2xl leading-tight text-[color:var(--ink)]"
        >
          Before your first run this session
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--slate-500)]">
          The AiBI Lab sends your input to a third-party model provider.
          Real member data, account numbers, or institution-confidential
          material must never leave your institution this way. Confirm you
          are using fabricated data by typing the phrase below.
        </p>
        <p id="pii-confirm-phrase" className="mt-4 text-xs text-[color:var(--ink)]">
          {REQUIRED}
        </p>
        <input
          type="text"
          aria-label="Confirmation phrase"
          aria-describedby="pii-confirm-phrase"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Type the phrase exactly"
          className="mt-2 w-full border border-[color:var(--ink)]/20 bg-white px-3 py-2 text-sm focus:border-[color:var(--gold-deep)] focus:outline-none"
          autoFocus
        />
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={props.onCancel}
            className="text-[10px] uppercase tracking-widest text-[color:var(--slate-500)] hover:text-[color:var(--ink)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!matches}
            onClick={props.onConfirm}
            className="bg-[color:var(--gold-deep)] px-4 py-2 text-[10px] uppercase tracking-widest text-[color:var(--cream)] disabled:opacity-40"
          >
            Confirm &amp; run
          </button>
        </div>
      </div>
    </div>
  );
}

function PiiOverrideBanner(props: {
  readonly reason: string;
  readonly onOverride: () => void;
  readonly onDismiss: () => void;
}) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="border border-[color:var(--ink)]/40 bg-white p-4"
    >
      <p className="text-[10px] uppercase tracking-widest text-[color:var(--ink)]">
        Possible real-member data detected
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink)]">{props.reason}</p>
      <p className="mt-2 text-xs leading-relaxed text-[color:var(--slate-500)]">
        If this is a fabricated scenario you can send anyway. The override is
        logged so the team can see how often the detector fires on
        intentional test data.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={props.onOverride}
          className="border border-[color:var(--ink)]/60 px-3 py-1.5 text-[10px] uppercase tracking-widest text-[color:var(--ink)] hover:bg-[color:var(--ink)]/10"
        >
          Send anyway · fabricated
        </button>
        <button
          type="button"
          onClick={props.onDismiss}
          className="text-[10px] uppercase tracking-widest text-[color:var(--slate-500)] hover:text-[color:var(--ink)]"
        >
          Edit my input
        </button>
      </div>
    </div>
  );
}

// ToolboxPanel was the legacy "My Toolbox" tab render — replaced by
// ToolboxHomeV5 (Ledger refresh, v5 layout). Kept removed here so the
// dead code doesn't drift; see PR for #183.
