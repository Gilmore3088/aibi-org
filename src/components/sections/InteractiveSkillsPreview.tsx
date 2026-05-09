'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

type Capability = {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly before: string;
  readonly prompt: string;
  readonly output: readonly string[];
};

const CAPABILITIES: readonly Capability[] = [
  {
    id: 'tools',
    title: 'Tools',
    subtitle: 'The platforms',
    before:
      'Microsoft Copilot is rolled out bank-wide. Staff do not know when to use it vs ChatGPT vs Claude.',
    prompt:
      'Compare Microsoft Copilot, ChatGPT, and Claude for a community bank operations team. For each: one task it does well, one it does poorly, one type of data that should never be pasted in. Three-row table.',
    output: [
      'Copilot — best: drafting Outlook replies inside the inbox. Weak: long policy analysis. Never paste: customer SSN, account numbers.',
      'ChatGPT — best: rewriting policy in plain English. Weak: live regulatory citations. Never paste: PII, internal memos.',
      'Claude — best: long-document analysis with citations. Weak: real-time data. Never paste: confidential examination findings.',
    ],
  },
  {
    id: 'prompts',
    title: 'Prompts',
    subtitle: 'Reusable patterns',
    before:
      'You repeat the same weekly reporting task and rewrite the instructions every time.',
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
    subtitle: 'Verify before you trust',
    before:
      'AI gave a confident answer about a regulatory citation. Some of it might be wrong.',
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
    subtitle: 'Workflow thinking',
    before:
      'You want to automate vendor risk reviews. Each touches three systems and two compliance frameworks.',
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
    subtitle: 'The SAFE rule',
    before:
      'A customer just emailed asking to dispute a wire transfer. You are tempted to paste it into ChatGPT.',
    prompt:
      'Apply the SAFE rule to this email before any AI use. Classify what is sensitive, what is fine to paste, and what should be redacted before drafting a response.',
    output: [
      'S — Sensitive: customer name, account number, wire amount → redact',
      'A — Approved tools only: Copilot inside the bank’s M365 tenant; not personal ChatGPT',
      'F — Facts to verify: dispute deadline, Regulation E timeline',
      'E — Escalate: ops manager + compliance before sending',
    ],
  },
] as const;

export interface InteractiveSkillsPreviewProps {
  /** Section eyebrow above the heading. Defaults to "Inside the course". */
  readonly eyebrow?: string;
  /** Main heading. Defaults to a homepage-friendly framing. */
  readonly heading?: string;
  /** Subhead below the heading. Defaults to a one-liner. */
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
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-s6">
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
            className="inline-flex w-fit items-center gap-s2 font-serif-sc text-mono-sm uppercase tracking-widest text-terra border-b border-terra pb-[2px] hover:text-terra-light hover:border-terra-light transition-colors"
          >
            View the curriculum →
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-s10 overflow-x-auto border-y border-hairline">
          <div
            role="tablist"
            aria-label="Capability categories"
            className="grid min-w-[760px] grid-cols-5 gap-px bg-hairline"
          >
            {CAPABILITIES.map((cap, index) => {
              const isActive = cap.id === activeId;
              return (
                <button
                  key={cap.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${cap.id}`}
                  onClick={() => setActiveId(cap.id)}
                  className={`group min-h-[120px] bg-linen p-s5 text-left transition-colors hover:bg-parch ${
                    isActive ? 'shadow-[inset_0_2px_0_var(--color-terra)]' : ''
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`font-mono text-mono-sm tabular-nums ${
                      isActive ? 'text-terra' : 'text-ink/35'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="mt-s4 block font-serif text-display-xs text-ink leading-tight">
                    {cap.title}
                  </span>
                  <span className="mt-s1 block font-serif italic text-body-sm text-ink/60 leading-snug">
                    {cap.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panels */}
        <div
          id={`panel-${active.id}`}
          role="tabpanel"
          key={active.id}
          className="mt-s8 grid gap-px bg-hairline border border-hairline lg:grid-cols-[0.8fr_1fr_1fr] animate-[fadeIn_220ms_ease-out]"
        >
          <PreviewPanel label="Before">
            <p className="font-serif text-display-xs leading-snug text-ink">
              {active.before}
            </p>
          </PreviewPanel>

          <PreviewPanel label="Sample prompt">
            <p className="font-mono text-body-sm leading-relaxed text-ink/85">
              {active.prompt}
            </p>
            <button
              type="button"
              onClick={copyPrompt}
              className={`mt-s5 inline-flex items-center font-serif-sc text-mono-sm uppercase tracking-widest border-b pb-[2px] transition-colors ${
                animationComplete
                  ? 'opacity-100'
                  : 'opacity-0 pointer-events-none'
              } ${
                copied
                  ? 'text-ink border-ink'
                  : 'text-terra border-terra hover:text-terra-light hover:border-terra-light'
              }`}
            >
              {copied ? 'Copied' : 'Copy prompt'}
            </button>
          </PreviewPanel>

          <PreviewPanel label="AI-assisted result">
            <div className="min-h-[170px]">
              {!animationComplete && (
                <div className="inline-flex gap-1 py-1" aria-label="Generating">
                  <span className="h-1.5 w-1.5 rounded-full bg-terra/70 animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-terra/50 animate-pulse [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-terra/30 animate-pulse [animation-delay:240ms]" />
                </div>
              )}
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
          </PreviewPanel>
        </div>
      </div>
    </section>
  );
}

function PreviewPanel({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="bg-parch p-s5 md:p-s6">
      <p className="font-serif-sc text-label-sm uppercase tracking-widest text-terra mb-s4">
        {label}
      </p>
      {children}
    </div>
  );
}
