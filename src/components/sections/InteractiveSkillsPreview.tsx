'use client';

import Link from 'next/link';
import { useState } from 'react';
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
  readonly id: 'models' | 'prompts' | 'skills' | 'agents';
  readonly title: string;
  readonly subtitle: string;
};

const CAPABILITIES: readonly Capability[] = [
  {
    id: 'models',
    title: 'Models',
    subtitle:
      'ChatGPT, Claude, Microsoft Copilot, Google Gemini, NotebookLM, Perplexity. Match the model to the task — and know which data should never go near each one.',
  },
  {
    id: 'prompts',
    title: 'Prompts',
    subtitle:
      'A Prompt is a single, focused, reusable instruction template — copy, paste, edit. The course publishes a banking-specific library and teaches your team to grow it.',
  },
  {
    id: 'skills',
    title: 'Skills',
    subtitle:
      'A Skill is a packaged, named, reusable AI capability — invoked by slash command. The course teaches your team to build them, refine them, and ship them.',
  },
  {
    id: 'agents',
    title: 'Agents',
    subtitle:
      'An Agent is a multi-step workflow that chains Skills, decision logic, and human checkpoints. Map every step before you automate any of it.',
  },
] as const;

export interface InteractiveSkillsPreviewProps {
  readonly eyebrow?: string;
  readonly heading?: string;
  readonly subhead?: string;
}

export function InteractiveSkillsPreview({
  eyebrow = 'Inside the course',
  heading = 'Learn these capabilities in our Foundation course.',
  subhead = 'Models, prompts, skills, agents — and the judgment to use them inside a regulated institution.',
}: InteractiveSkillsPreviewProps = {}) {
  // Desktop-only state — drives the tab+panel layout at lg:+. The
  // mobile/tablet accordion below uses native <details> with no JS.
  const [activeId, setActiveId] = useState<Capability['id']>(CAPABILITIES[0].id);
  const active = CAPABILITIES.find((c) => c.id === activeId) ?? CAPABILITIES[0];

  return (
    <section className="px-s7 py-s12 md:py-s14 bg-linen border-y border-hairline">
      <div className="max-w-wide mx-auto">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-s6 mb-s10">
          <div className="max-w-narrow">
            <p className="font-serif-sc text-label-md uppercase tracking-widest text-gold mb-s4">
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
            className="inline-flex w-fit items-center font-serif-sc text-mono-sm uppercase tracking-widest text-gold border-b border-gold pb-[2px] hover:text-gold-2 hover:border-gold-2 transition-colors"
          >
            View the curriculum →
          </Link>
        </div>

        {/* MOBILE + TABLET (< lg / < 1024px) — vertical accordion.
            Each capability is a native <details> with its panel inline.
            No JS state, full keyboard a11y for free. Models open by default;
            multi-open allowed. */}
        <ul className="lg:hidden border-y border-hairline divide-y divide-hairline">
          {CAPABILITIES.map((cap, index) => (
            <li key={cap.id}>
              <details className="group" open={index === 0}>
                <summary
                  className="
                    cursor-pointer list-none px-s5 py-s5 md:px-s6 md:py-s6
                    grid grid-cols-[3rem_1fr_1.5rem] gap-s4 items-start
                    transition-colors hover:bg-parch/30 group-open:bg-parch/40
                    [&::-webkit-details-marker]:hidden
                  "
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-mono-sm tabular-nums pt-s1 text-ink/30 group-open:text-gold transition-colors"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="block min-w-0">
                    <span className="block font-serif text-display-sm md:text-display-md text-ink leading-tight">
                      {cap.title}
                    </span>
                    <span className="block font-serif italic text-body-sm leading-snug text-slate mt-s2">
                      {cap.subtitle}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-mono text-mono-md text-ink/40 group-open:text-gold pt-s1 transition-transform duration-medium group-open:rotate-90"
                  >
                    ›
                  </span>
                </summary>
                <div className="px-s5 md:px-s6 pt-s3 pb-s6">
                  {cap.id === 'models' && <PlatformsPanel />}
                  {cap.id === 'prompts' && <PromptsPanel />}
                  {cap.id === 'skills' && <SkillsPanel />}
                  {cap.id === 'agents' && <AgentsPanel />}
                </div>
              </details>
            </li>
          ))}
        </ul>

        {/* DESKTOP (lg:+ / ≥ 1024px) — editorial 2-col: tab rail on left,
            active panel on right. The rail shows all four capability titles
            at a glance with the active one's subtitle expanding inline. */}
        <div className="hidden lg:grid lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1fr)] gap-s8">
          <ul
            role="tablist"
            aria-label="Capability categories"
            className="border-y border-hairline divide-y divide-hairline"
          >
            {CAPABILITIES.map((cap, index) => {
              const isActive = cap.id === activeId;
              return (
                <li key={cap.id} role="presentation" className="relative">
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 -inset-y-px border border-gold"
                    />
                  )}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="capability-panel"
                    onClick={() => setActiveId(cap.id)}
                    className={`relative w-full text-left px-s6 py-s6 grid grid-cols-[3rem_1fr] gap-s4 transition-colors ${
                      isActive ? 'bg-parch/40' : 'hover:bg-parch/30'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`font-mono text-mono-sm tabular-nums pt-s1 transition-colors ${
                        isActive ? 'text-gold' : 'text-ink/30'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="block">
                      <span className="block font-serif text-display-md text-ink leading-tight">
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

          <div
            id="capability-panel"
            role="tabpanel"
            key={active.id}
            aria-live="polite"
            className="animate-[fadeIn_220ms_ease-out]"
          >
            {active.id === 'models' && <PlatformsPanel />}
            {active.id === 'prompts' && <PromptsPanel />}
            {active.id === 'skills' && <SkillsPanel />}
            {active.id === 'agents' && <AgentsPanel />}
          </div>
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
      <header className="px-s5 md:px-s6 py-s4 border-b border-hairline">
        <p className="font-serif-sc text-label-sm uppercase tracking-widest text-gold">
          Platforms we teach
        </p>
      </header>
      <dl className="divide-y divide-hairline">
        {grouped.map((group) => (
          <div
            key={group.category}
            className="grid grid-cols-1 gap-s2 sm:grid-cols-[7rem_1fr] sm:gap-s5 sm:items-baseline px-s5 md:px-s6 py-s4"
          >
            <dt className="font-mono text-label-md uppercase tracking-widest text-gold">
              {group.label}
            </dt>
            <dd className="font-serif text-body-lg text-ink leading-snug">
              {group.items.map((t, i) => (
                <span key={t.slug} className="sm:whitespace-nowrap">
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
      <header className="px-s5 md:px-s6 py-s4 border-b border-hairline">
        <p className="font-serif-sc text-label-sm uppercase tracking-widest text-gold">
          Flagship Skills
        </p>
      </header>
      <dl className="divide-y divide-hairline">
        {grouped.map((group) => (
          <div
            key={group.dept}
            className="grid grid-cols-1 gap-s2 sm:grid-cols-[6rem_1fr] sm:gap-s5 px-s5 md:px-s6 py-s4"
          >
            <dt className="font-mono text-label-md uppercase tracking-widest text-gold pt-s1">
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
      <header className="px-s5 md:px-s6 py-s4 border-b border-hairline">
        <p className="font-serif-sc text-label-sm uppercase tracking-widest text-gold">
          Flagship Agents
        </p>
      </header>
      <dl className="divide-y divide-hairline">
        {grouped.map((group) => (
          <div
            key={group.dept}
            className="grid grid-cols-1 gap-s2 sm:grid-cols-[6rem_1fr] sm:gap-s5 px-s5 md:px-s6 py-s4"
          >
            <dt className="font-mono text-label-md uppercase tracking-widest text-gold pt-s1">
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
      <header className="px-s5 md:px-s6 py-s4 border-b border-hairline">
        <p className="font-serif-sc text-label-sm uppercase tracking-widest text-gold">
          Flagship Prompts
        </p>
      </header>
      <dl className="divide-y divide-hairline">
        {grouped.map((group) => (
          <div
            key={group.role}
            className="grid grid-cols-1 gap-s2 sm:grid-cols-[6rem_1fr] sm:gap-s5 px-s5 md:px-s6 py-s4"
          >
            <dt className="font-mono text-label-md uppercase tracking-widest text-gold pt-s1">
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
