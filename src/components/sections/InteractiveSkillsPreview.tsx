'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

type Capability = {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly prompt: string;
  readonly output: readonly string[];
};

const CAPABILITIES: readonly Capability[] = [
  {
    id: 'tools',
    title: 'Tools',
    subtitle: 'The platforms — Copilot, ChatGPT, Claude, NotebookLM, Perplexity. Match the tool to the task.',
    prompt:
      'Compare Microsoft Copilot, ChatGPT, and Claude for a community bank operations team. For each: one task it does well, one it does poorly, and one type of data that should never be pasted in. Return a three-row table.',
    output: [
      'Copilot — best: drafting Outlook replies inside the inbox. Weak: long policy analysis. Never paste: customer SSN, account numbers.',
      'ChatGPT — best: rewriting policy in plain English. Weak: live regulatory citations. Never paste: PII, internal memos.',
      'Claude — best: long-document analysis with citations. Weak: real-time data. Never paste: confidential examination findings.',
    ],
  },
  {
    id: 'prompts',
    title: 'Prompts',
    subtitle: 'Reusable patterns — turn a recurring task into a portable prompt the whole team can run.',
    prompt:
      'Turn this recurring task into a reusable prompt. Include role, audience, output format, and review checkpoints so any teammate can run it.',
    output: [
      'Reusable prompt:',
      'You are a banking operations assistant.',
      'Summarize [REPORT] for [AUDIENCE].',
      'Output a table: changes, risks, follow-up items.',
      'Flag anything that needs supervisor review.',
    ],
  },
  {
    id: 'skills',
    title: 'Skills',
    subtitle: 'Verify before you trust — recognize hallucinations, separate verified facts from assumptions.',
    prompt:
      'Review this AI-generated response. Identify unsupported claims, mark anything that needs verification against the source, and rewrite using only verified facts.',
    output: [
      'Needs review:',
      '— Specific regulatory citation (verify section)',
      '— Effective date (cited as 2024 — confirm)',
      '— Claim that all community banks under $10B are exempt (overbroad)',
    ],
  },
  {
    id: 'agents',
    title: 'Agents',
    subtitle: 'Workflow thinking — map every step, every decision, every human checkpoint before automating.',
    prompt:
      'Map this workflow before automating. List every step, every decision, every human checkpoint. Mark which steps AI can draft and which require a human signoff.',
    output: [
      'Step 1 — Vendor questionnaire intake. AI: summarize. Human signoff: no.',
      'Step 2 — Initial risk classification. AI: draft. Human signoff: REQUIRED (model risk officer).',
      'Step 3 — Compliance mapping (SR 11-7, TPRM). AI: cross-reference. Human signoff: REQUIRED.',
      'Step 4 — Final approval. Human only. AI not in the loop.',
    ],
  },
  {
    id: 'more',
    title: 'More',
    subtitle: 'The SAFE rule, document workflows, role-specific use cases, and the broader judgment to hold it together.',
    prompt:
      'Apply the SAFE rule to this customer email before any AI use. Classify what is sensitive, what is fine to paste, and what should be redacted before drafting a response.',
    output: [
      'S — Sensitive: customer name, account number, wire amount → redact',
      'A — Approved tools only: Copilot inside the bank’s M365 tenant; not personal ChatGPT',
      'F — Facts to verify: dispute deadline, Regulation E timeline',
      'E — Escalate: ops manager + compliance before sending',
    ],
  },
] as const;

export interface InteractiveSkillsPreviewProps {
  readonly eyebrow?: string;
  readonly heading?: string;
  readonly subhead?: string;
}

export function InteractiveSkillsPreview({
  eyebrow = 'Inside the course',
  heading = 'Learn these capabilities in AiBI-Practitioner.',
  subhead = 'Tools, prompts, skills, agents — and the judgment to use them inside a regulated institution.',
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
            href="/courses/aibi-p"
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

          {/* Right column — stacked Sample Prompt + AI-Assisted Result */}
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
        </div>
      </div>
    </section>
  );
}
