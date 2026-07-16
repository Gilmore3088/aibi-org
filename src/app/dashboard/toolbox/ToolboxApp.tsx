'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TOOLBOX_TEMPLATES } from '@/content/toolbox/templates';
import { generateToolboxMarkdown } from '@/lib/toolbox/markdown';
import {
  isWorkflowSkill,
  type ToolboxKind,
  type ToolboxMessage,
  type ToolboxSkill,
  type ToolboxTemplateSkill,
  type ToolboxWorkflowSkill,
} from '@/lib/toolbox/types';
import type { ToolboxTier } from '@/lib/toolbox/access';
import { KindPicker } from './_components/KindPicker';
import { type ModelSelection } from './_components/ModelPicker';
import { TemplateBuilder } from './_components/TemplateBuilder';
import { ToolboxHomeV5 } from './_components/ToolboxHomeV5';
import { WelcomeOverlay, readOnboarded } from './_components/WelcomeOverlay';
import { useUsage } from './_components/UsageMeter';
import type { TabId } from './toolbox-app/types';
import {
  EMPTY_TEMPLATE_SKILL,
  EMPTY_WORKFLOW_SKILL,
  RECOMMENDED_STARTER_ID,
} from './toolbox-app/constants';
import { downloadText, firePlausible, slugFromCommand, toSkill } from './toolbox-app/helpers';
import { WorkbenchPath } from './toolbox-app/WorkbenchPath';
import { GuidePanel } from './toolbox-app/GuidePanel';
import { LibraryPanel } from './toolbox-app/LibraryPanel';
import { BuilderPanel } from './toolbox-app/BuilderPanel';
import { PlaygroundPanel } from './toolbox-app/PlaygroundPanel';

// All tabs in canonical order. Every paid Toolbox buyer can build, run, and
// save; the starter/full tier only preserves the entitlement source.
export const TOOLBOX_TABS: readonly { id: TabId; label: string; tiers: readonly ToolboxTier[] }[] = [
  { id: 'guide', label: 'Start Here', tiers: ['full', 'starter'] },
  { id: 'library', label: 'Library', tiers: ['full', 'starter'] },
  { id: 'build', label: 'Build', tiers: ['full', 'starter'] },
  { id: 'playground', label: 'AiBI Lab', tiers: ['full', 'starter'] },
  { id: 'toolbox', label: 'My Toolbox', tiers: ['full', 'starter'] },
];

export function tabsForTier(tier: ToolboxTier): readonly { id: TabId; label: string }[] {
  return TOOLBOX_TABS.filter((t) => t.tiers.includes(tier)).map(({ id, label }) => ({ id, label }));
}

interface ToolboxAppProps {
  /**
   * Entitlement tier resolved on the server. The page only renders this app
   * after paid access is confirmed; API endpoints remain the write/run gate.
   */
  readonly tier?: ToolboxTier;
}

export function ToolboxApp({ tier = 'starter' }: ToolboxAppProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get('tab') as TabId | null) ?? 'guide';
  const tabsForActiveTier = tabsForTier(tier);
  // If a future tier removes a tab, collapse the URL back to 'guide' rather
  // than rendering a surface the entitlement should not reach.
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
            className={`whitespace-nowrap border-b-2 px-4 py-4 text-[0.625rem] uppercase tracking-widest transition-colors ${
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
          className="whitespace-nowrap border-b-2 border-transparent px-4 py-4 text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-500)] transition-colors hover:text-[color:var(--ink)]"
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
          <span className="text-[0.625rem] font-black uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
            Toolbox note
          </span>
          <span className="max-w-4xl font-semibold leading-relaxed text-[color:var(--slate-600)]">
            {notice}
          </span>
        </button>
      )}

      <WorkbenchPath
        activeTab={safeTab}
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
          setTab={setTab}
          onStartMission={() => {
            if (recommendedStarter) {
              loadSkill(toSkill(recommendedStarter), 'playground');
              return;
            }
            setTab('library');
          }}
        />
      )}

      {safeTab === 'library' && (
        <LibraryPanel
          skills={skills}
          templates={TOOLBOX_TEMPLATES}
          roles={roles}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          difficultyFilter={difficultyFilter}
          setDifficultyFilter={setDifficultyFilter}
          filteredTemplates={filteredTemplates}
          onTry={(template) => loadSkill(toSkill(template), 'playground')}
          onCustomize={(template) => {
            const skill = toSkill(template);
            setDraftSkill(skill);
            setActiveSkill(skill);
            setBuildKind('workflow');
            setTab('build');
          }}
        />
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
            className="mb-6 text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-500)] hover:text-[color:var(--gold-deep)]"
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
            className="mb-6 text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-500)] hover:text-[color:var(--gold-deep)]"
          >
            ← Choose a different kind
          </button>
          <TemplateBuilder skill={templateSkill} onChange={setTemplateSkill} />
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => setTemplateSkill({ ...EMPTY_TEMPLATE_SKILL })}
              className="border border-[color:var(--ink)]/20 px-4 py-2 text-[0.625rem] uppercase tracking-widest"
            >
              New template
            </button>
            <button
              type="button"
              onClick={async () => {
                const saved = await saveSkill(templateSkill);
                if (saved) loadSkill(saved, 'playground');
              }}
              className="bg-[color:var(--gold-deep)] px-4 py-2 text-[0.625rem] uppercase tracking-widest text-[color:var(--cream)]"
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
