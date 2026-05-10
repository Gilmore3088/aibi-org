'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TOOLS, type CurriculumTool } from '@content/curriculum/tools';
import { AI_SKILLS, type AiSkillDept } from '@content/curriculum/ai-skills';
import { AI_AGENTS, type AiAgentDept } from '@content/curriculum/ai-agents';
import { AI_PROMPTS, type AiPromptRole } from '@content/curriculum/ai-prompts';

const PROMPT_ROLE_ORDER: readonly AiPromptRole[] = [
  'Lending',
  'Compliance',
  'Finance',
  'Executive',
  'IT',
  'Operations',
  'Marketing',
  'Retail',
];

const SKILL_DEPT_ORDER: readonly AiSkillDept[] = [
  'Lending',
  'Compliance',
  'Retail',
  'Executive',
  'Research',
];

const AGENT_DEPT_ORDER: readonly AiAgentDept[] = [
  'Lending',
  'Compliance',
  'Executive',
  'Strategy',
  'Retail',
  'Research',
];

const PLATFORM_CATEGORY_LABEL: Record<CurriculumTool['category'], string> = {
  'general-llm': 'General',
  'office-suite': 'Office',
  documents: 'Documents',
  research: 'Research',
};

const PLATFORM_CATEGORY_ORDER: readonly CurriculumTool['category'][] = [
  'general-llm',
  'office-suite',
  'documents',
  'research',
];

type Capability = {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly prompt: string;
  readonly output: readonly string[];
};

const CAPABILITIES: readonly Capability[] = [
  {
    id: 'models',
    title: 'Models',
    subtitle:
      'ChatGPT, Claude, Microsoft Copilot, Google Gemini, NotebookLM, Perplexity. Match the model to the task — and know which data should never go near each one.',
    prompt:
      'You are a community bank ops manager. Compare ChatGPT, Claude, Microsoft Copilot, Google Gemini, NotebookLM, and Perplexity for our team. For each: one task it does well, one weakness, one type of data we should never paste in. Return a six-row table.',
    output: [
      'ChatGPT (OpenAI) — best: rewriting policy in plain English · weak: live regulatory citations · never paste: PII, internal memos.',
      'Claude (Anthropic) — best: long-document analysis with citations · weak: real-time data · never paste: confidential examination findings.',
      'Microsoft Copilot — best: drafting Outlook replies inside the inbox · weak: long policy analysis · never paste: customer SSN, account numbers.',
      'Google Gemini — best: research and quick lookups inside Workspace · weak: deep policy reasoning · never paste: PII, internal data.',
      'NotebookLM (Google) — best: source-grounded Q&A across uploaded policies · weak: open-ended chat · never paste: PII before scrubbing.',
      'Perplexity — best: regulatory research with citations · weak: drafting structured outputs · never paste: client identifiers.',
    ],
  },
  {
    id: 'prompts',
    title: 'Prompts',
    subtitle:
      'A Prompt is a single, focused, reusable instruction template — copy, paste, edit. The course publishes a banking-specific library and teaches your team to grow it.',
    prompt: '',
    output: [],
  },
  {
    id: 'skills',
    title: 'Skills',
    subtitle:
      'A Skill is a packaged, named, reusable AI capability — invoked by slash command. The course teaches your team to build them, refine them, and ship them.',
    prompt:
      'Review this AI-drafted compliance response. Flag every regulatory citation, dollar threshold, deadline, and named person. For each, mark: ✓ verified against source, ⚠ likely correct but unverified, ✗ possible hallucination. Rewrite using only ✓ items.',
    output: [
      'Audit — 7 specific claims found:',
      '✓ Reg E §1005.11 dispute timeline (matches 12 CFR 1005.11)',
      '⚠ "60-day customer notification window" — likely correct, source not in context',
      '✗ "$150 ATM withdrawal limit per Regulation CC" — HALLUCINATION. Reg CC governs check holds, not ATM limits.',
      '✗ "Senior Examiner Marcia Whitfield" — HALLUCINATION. No examiner by that name in your context.',
      '✓ September 1 effective date (matches bulletin)',
      '⚠ Bank’s internal disclosure procedure — verify against current SOPs',
      '✓ Customer complaint escalation path (matches policy 4.2)',
      '',
      'Rewrite produced. 3 fewer claims; all verified.',
    ],
  },
  {
    id: 'agents',
    title: 'Agents',
    subtitle:
      'An Agent is a multi-step workflow that chains Skills, decision logic, and human checkpoints. Map every step before you automate any of it.',
    prompt: '',
    output: [],
  },
] as const;

export interface InteractiveSkillsPreviewProps {
  readonly eyebrow?: string;
  readonly heading?: string;
  readonly subhead?: string;
}

export function InteractiveSkillsPreview({
  eyebrow = 'Inside the course',
  heading = 'Learn these capabilities in AiBI-Foundation.',
  subhead = 'Models, prompts, skills, agents — and the judgment to use them inside a regulated institution.',
}: InteractiveSkillsPreviewProps = {}) {
  const [activeId, setActiveId] = useState<string>(CAPABILITIES[0].id);
  const [copied, setCopied] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);

  const active = CAPABILITIES.find((c) => c.id === activeId) ?? CAPABILITIES[0];
  const animationComplete = visibleLines >= active.output.length;

  useEffect(() => {
    setVisibleLines(0);
    const timers = active.output.map((_, index) =>
      window.setTimeout(() => setVisibleLines(index + 1), 360 + index * 320)
    );
    return () => timers.forEach(window.clearTimeout);
  }, [activeId, active.output]);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(active.prompt);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = active.prompt;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="px-s7 py-s12 md:py-s14 bg-linen border-y border-hairline">
      <div className="max-w-wide mx-auto">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-s6 mb-s10">
          <div className="max-w-narrow">
            <p className="font-serif-sc text-label-md uppercase tracking-widest text-terra mb-s4">
              {eyebrow}
            </p>
            <h2 className="font-serif text-display-md md:text-display-lg text-ink leading-tight">
              {heading}
            </h2>
            <p className="text-body-md text-ink/75 leading-relaxed mt-s4">
              {subhead}
            </p>
          </div>
          <Link
            href="/courses/foundation/program"
            className="inline-flex w-fit items-center font-serif-sc text-mono-sm uppercase tracking-widest text-terra border-b border-terra pb-[2px] hover:text-terra-light hover:border-terra-light transition-colors"
          >
            View the curriculum →
          </Link>
        </div>

        {/* 1×1 layout: vertical tab rail (left) + stacked panels (right) */}
        <div className="grid lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1fr)] gap-s6 lg:gap-s8">
          {/* Left rail — vertical capability list */}
          <ul
            role="tablist"
            aria-label="Capability categories"
            className="border-y border-hairline divide-y divide-hairline"
          >
            {CAPABILITIES.map((cap, index) => {
              const isActive = cap.id === activeId;
              return (
                <li key={cap.id} role="presentation" className="relative">
                  {/* Active terra outline overlay — sits on top, doesn't interfere with hairline divider */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 -inset-y-px border border-terra"
                    />
                  )}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="capability-panel"
                    onClick={() => setActiveId(cap.id)}
                    className={`relative w-full text-left px-s5 py-s5 md:px-s6 md:py-s6 grid grid-cols-[3rem_1fr] gap-s4 transition-colors ${
                      isActive ? 'bg-parch/40' : 'hover:bg-parch/30'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`font-mono text-mono-sm tabular-nums pt-s1 transition-colors ${
                        isActive ? 'text-terra' : 'text-ink/30'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="block">
                      <span className="block font-serif text-display-sm md:text-display-md text-ink leading-tight">
                        {cap.title}
                      </span>
                      <span
                        className={`block font-serif italic text-body-sm leading-snug overflow-hidden transition-all duration-300 ${
                          isActive
                            ? 'mt-s3 text-slate max-h-32 opacity-100'
                            : 'mt-0 max-h-0 opacity-0'
                        }`}
                      >
                        {cap.subtitle}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Right column — Models and Skills tabs render curriculum-data
              panels (no demo, just the list). Other tabs get the stacked
              Sample Prompt + AI-Assisted Result demo. */}
          {active.id === 'models' ? (
            <div
              id="capability-panel"
              role="tabpanel"
              key={active.id}
              aria-live="polite"
              className="animate-[fadeIn_220ms_ease-out]"
            >
              <PlatformsPanel />
            </div>
          ) : active.id === 'skills' ? (
            <div
              id="capability-panel"
              role="tabpanel"
              key={active.id}
              aria-live="polite"
              className="animate-[fadeIn_220ms_ease-out]"
            >
              <SkillsPanel />
            </div>
          ) : active.id === 'agents' ? (
            <div
              id="capability-panel"
              role="tabpanel"
              key={active.id}
              aria-live="polite"
              className="animate-[fadeIn_220ms_ease-out]"
            >
              <AgentsPanel />
            </div>
          ) : active.id === 'prompts' ? (
            <div
              id="capability-panel"
              role="tabpanel"
              key={active.id}
              aria-live="polite"
              className="animate-[fadeIn_220ms_ease-out]"
            >
              <PromptsPanel />
            </div>
          ) : (
            <div
              id="capability-panel"
              role="tabpanel"
              key={active.id}
              aria-live="polite"
              className="grid grid-rows-[auto_auto] gap-s5 lg:gap-s6 animate-[fadeIn_220ms_ease-out]"
            >
              {/* Sample Prompt panel */}
              <article className="bg-parch border border-hairline">
                <header className="flex items-center justify-between px-s5 md:px-s6 py-s4 border-b border-hairline">
                  <p className="font-serif-sc text-label-sm uppercase tracking-widest text-terra">
                    Sample prompt
                  </p>
                  <p className="font-mono text-mono-xs uppercase tracking-wider text-ink/40 tabular-nums">
                    {String(CAPABILITIES.findIndex((c) => c.id === active.id) + 1).padStart(2, '0')}
                    <span className="opacity-50"> / {String(CAPABILITIES.length).padStart(2, '0')}</span>
                  </p>
                </header>
                <div className="px-s5 md:px-s6 py-s5">
                  <p className="font-mono text-body-sm leading-relaxed text-ink/85">
                    {active.prompt}
                  </p>
                  <button
                    type="button"
                    onClick={copyPrompt}
                    className={`mt-s5 inline-flex items-center font-serif-sc text-mono-sm uppercase tracking-widest border-b pb-[2px] transition-colors ${
                      copied
                        ? 'text-ink border-ink'
                        : 'text-terra border-terra hover:text-terra-light hover:border-terra-light'
                    }`}
                  >
                    {copied ? 'Copied' : 'Copy prompt'}
                  </button>
                </div>
              </article>

              {/* AI-Assisted Result panel */}
              <article className="bg-parch border border-hairline">
                <header className="flex items-center justify-between px-s5 md:px-s6 py-s4 border-b border-hairline">
                  <p className="font-serif-sc text-label-sm uppercase tracking-widest text-terra">
                    AI-assisted result
                  </p>
                  {!animationComplete ? (
                    <span className="inline-flex items-center gap-1" aria-label="Generating">
                      <span className="h-1.5 w-1.5 rounded-full bg-terra/70 animate-pulse" />
                      <span className="h-1.5 w-1.5 rounded-full bg-terra/50 animate-pulse [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-terra/30 animate-pulse [animation-delay:240ms]" />
                    </span>
                  ) : (
                    <p className="font-mono text-mono-xs uppercase tracking-wider text-ink/40">
                      Verify before you ship
                    </p>
                  )}
                </header>
                <div className="px-s5 md:px-s6 py-s5 min-h-[12rem]">
                  <div className="space-y-s2">
                    {active.output.slice(0, visibleLines).map((line) => (
                      <p
                        key={line}
                        className="text-body-sm leading-relaxed text-ink/85 animate-[fadeInUp_240ms_ease-out]"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </article>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * <PlatformsPanel> — replaces the prompt + result demo on the Models tab.
 * A clean grouped reference of the six platforms taught in the curriculum,
 * grouped by category. No prompt, no AI demo — just a peek at what we use.
 */
function PlatformsPanel() {
  const grouped = PLATFORM_CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: PLATFORM_CATEGORY_LABEL[cat],
    items: TOOLS.filter((t) => t.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <article className="bg-parch border border-hairline">
      <header className="flex items-center justify-between px-s5 md:px-s6 py-s4 border-b border-hairline">
        <p className="font-serif-sc text-label-sm uppercase tracking-widest text-terra">
          Platforms we teach
        </p>
        <p className="font-mono text-mono-xs uppercase tracking-wider text-ink/40 tabular-nums">
          {String(TOOLS.length).padStart(2, '0')}
        </p>
      </header>
      <dl className="divide-y divide-hairline">
        {grouped.map((group) => (
          <div
            key={group.category}
            className="grid grid-cols-[7rem_1fr] gap-s5 px-s5 md:px-s6 py-s4 items-baseline"
          >
            <dt className="font-mono text-label-md uppercase tracking-widest text-terra">
              {group.label}
            </dt>
            <dd className="font-serif text-body-lg text-ink leading-snug">
              {group.items.map((t, i) => (
                <span key={t.slug} className="whitespace-nowrap">
                  {t.name}
                  <span className="font-mono text-label-sm uppercase tracking-widest text-slate ml-s2">
                    {t.vendor}
                  </span>
                  {i < group.items.length - 1 && (
                    <span aria-hidden="true" className="mx-s3 text-ink/30">·</span>
                  )}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

/**
 * <SkillsPanel> — replaces the prompt + result demo on the Skills tab.
 * Renders the flagship AI Skills (content/curriculum/ai-skills.ts) —
 * named, reusable capabilities invoked by slash command — grouped by
 * department. Not a list of curriculum learnings; a sample of the
 * Toolbox library a practitioner builds and ships from inside the
 * course.
 */
function SkillsPanel() {
  const grouped = SKILL_DEPT_ORDER.map((dept) => ({
    dept,
    items: AI_SKILLS.filter((s) => s.dept === dept),
  })).filter((g) => g.items.length > 0);

  return (
    <article className="bg-parch border border-hairline">
      <header className="flex items-center justify-between px-s5 md:px-s6 py-s4 border-b border-hairline">
        <p className="font-serif-sc text-label-sm uppercase tracking-widest text-terra">
          Flagship Skills
        </p>
        <p className="font-mono text-mono-xs uppercase tracking-wider text-ink/40 tabular-nums">
          {String(AI_SKILLS.length).padStart(2, '0')} of many
        </p>
      </header>
      <dl className="divide-y divide-hairline">
        {grouped.map((group) => (
          <div
            key={group.dept}
            className="grid grid-cols-[6rem_1fr] gap-s5 px-s5 md:px-s6 py-s4"
          >
            <dt className="font-mono text-label-md uppercase tracking-widest text-terra pt-s1">
              {group.dept}
            </dt>
            <dd>
              <ul className="space-y-s3">
                {group.items.map((skill) => (
                  <li key={skill.cmd}>
                    <p className="font-mono text-mono-sm tabular-nums text-ink">
                      {skill.cmd}
                    </p>
                    <p className="text-body-sm text-ink/75 leading-snug mt-[2px] max-w-[44ch]">
                      {skill.summary}
                    </p>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

/**
 * <AgentsPanel> — replaces the prompt + result demo on the Agents tab.
 * Renders the flagship AI Agents (content/curriculum/ai-agents.ts) —
 * multi-step workflows that chain Skills with human checkpoints —
 * grouped by department.
 */
function AgentsPanel() {
  const grouped = AGENT_DEPT_ORDER.map((dept) => ({
    dept,
    items: AI_AGENTS.filter((a) => a.dept === dept),
  })).filter((g) => g.items.length > 0);

  return (
    <article className="bg-parch border border-hairline">
      <header className="flex items-center justify-between px-s5 md:px-s6 py-s4 border-b border-hairline">
        <p className="font-serif-sc text-label-sm uppercase tracking-widest text-terra">
          Flagship Agents
        </p>
        <p className="font-mono text-mono-xs uppercase tracking-wider text-ink/40 tabular-nums">
          {String(AI_AGENTS.length).padStart(2, '0')} of many
        </p>
      </header>
      <dl className="divide-y divide-hairline">
        {grouped.map((group) => (
          <div
            key={group.dept}
            className="grid grid-cols-[6rem_1fr] gap-s5 px-s5 md:px-s6 py-s4"
          >
            <dt className="font-mono text-label-md uppercase tracking-widest text-terra pt-s1">
              {group.dept}
            </dt>
            <dd>
              <ul className="space-y-s3">
                {group.items.map((agent) => (
                  <li key={agent.cmd}>
                    <p className="font-mono text-mono-sm tabular-nums text-ink">
                      {agent.cmd}
                    </p>
                    <p className="text-body-sm text-ink/75 leading-snug mt-[2px] max-w-[44ch]">
                      {agent.summary}
                    </p>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

/**
 * <PromptsPanel> — replaces the prompt + result demo on the Prompts tab.
 * Renders flagship prompts (content/curriculum/ai-prompts.ts) — single,
 * reusable instruction templates from the course's prompt library —
 * grouped by role. Title + platform tag + summary. Full prompt text
 * stays in content/courses/foundation/program/prompt-library.ts.
 */
function PromptsPanel() {
  const grouped = PROMPT_ROLE_ORDER.map((role) => ({
    role,
    items: AI_PROMPTS.filter((p) => p.role === role),
  })).filter((g) => g.items.length > 0);

  return (
    <article className="bg-parch border border-hairline">
      <header className="flex items-center justify-between px-s5 md:px-s6 py-s4 border-b border-hairline">
        <p className="font-serif-sc text-label-sm uppercase tracking-widest text-terra">
          Flagship Prompts
        </p>
        <p className="font-mono text-mono-xs uppercase tracking-wider text-ink/40 tabular-nums">
          {String(AI_PROMPTS.length).padStart(2, '0')} of many
        </p>
      </header>
      <dl className="divide-y divide-hairline">
        {grouped.map((group) => (
          <div
            key={group.role}
            className="grid grid-cols-[6rem_1fr] gap-s5 px-s5 md:px-s6 py-s4"
          >
            <dt className="font-mono text-label-md uppercase tracking-widest text-terra pt-s1">
              {group.role}
            </dt>
            <dd>
              <ul className="space-y-s3">
                {group.items.map((prompt) => (
                  <li key={prompt.libraryId}>
                    <p className="font-serif text-body-md text-ink leading-snug">
                      {prompt.title}
                      <span className="ml-s2 font-mono text-label-sm uppercase tracking-widest text-slate">
                        {prompt.platform}
                      </span>
                    </p>
                    <p className="text-body-sm text-ink/75 leading-snug mt-[2px] max-w-[44ch]">
                      {prompt.summary}
                    </p>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
