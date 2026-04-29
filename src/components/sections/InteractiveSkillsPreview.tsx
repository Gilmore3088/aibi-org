'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

type SkillPreview = {
  readonly id: string;
  readonly title: string;
  readonly before: string;
  readonly prompt: string;
  readonly output: readonly string[];
  readonly cta: string;
};

const SKILLS: readonly SkillPreview[] = [
  {
    id: 'emails',
    title: 'Write better emails',
    before:
      'Customer is upset about a fee. Need to respond without promising a refund.',
    prompt:
      'Draft a professional response to a customer upset about a fee. Keep the tone empathetic, do not promise a refund, and offer to review the account by phone.',
    output: [
      'Thanks for reaching out.',
      'I understand why this fee is frustrating.',
      'I would be happy to review the account activity with you and walk through what happened.',
      'Please call me at [PHONE] or reply with a convenient time.',
    ],
    cta: 'Copy sample prompt',
  },
  {
    id: 'policies',
    title: 'Summarize policies',
    before:
      'A five-page procedure needs to become branch-ready instructions.',
    prompt:
      'Summarize this policy for frontline banking staff. Separate required actions, background context, and items that need supervisor review.',
    output: [
      'Required actions:',
      '1. Use the updated checklist for every new account.',
      '2. Confirm documentation before account opening.',
      '3. Escalate exceptions to Operations.',
    ],
    cta: 'Copy sample prompt',
  },
  {
    id: 'review',
    title: 'Review AI safely',
    before:
      'AI gave a confident answer, but some claims may be unsupported.',
    prompt:
      'Review this AI-generated response. Identify unsupported claims, mark anything that needs review, and rewrite using only verified facts.',
    output: [
      'Needs review:',
      '- Specific regulatory citation',
      '- Effective date',
      '- Claim that all community banks are exempt',
    ],
    cta: 'Copy sample prompt',
  },
  {
    id: 'prompts',
    title: 'Build reusable prompts',
    before:
      'You repeat the same weekly reporting task and keep rewriting the instructions.',
    prompt:
      'Turn this recurring task into a reusable prompt with role, task, audience, output format, and review constraints.',
    output: [
      'Reusable prompt:',
      'You are a banking operations assistant.',
      'Summarize [REPORT] for [AUDIENCE] in a table with key changes, risks, and follow-up items.',
    ],
    cta: 'Copy sample prompt',
  },
  {
    id: 'hours',
    title: 'Save hours every week',
    before:
      'Meeting notes are messy and no one knows the decisions, owners, or next steps.',
    prompt:
      'Turn these meeting notes into decisions, action items, owners, deadlines, and open questions. Do not invent missing owners or dates.',
    output: [
      'Action items:',
      '- Operations: update checklist by Friday',
      '- Branch managers: confirm team review',
      '- Open question: who owns exception tracking?',
    ],
    cta: 'Copy sample prompt',
  },
] as const;

export function InteractiveSkillsPreview() {
  const [activeSkillId, setActiveSkillId] = useState<string>(SKILLS[0].id);
  const [copiedSkillId, setCopiedSkillId] = useState<string | null>(null);
  const [visibleLines, setVisibleLines] = useState(0);

  const activeSkill = SKILLS.find((skill) => skill.id === activeSkillId) ?? SKILLS[0];
  const animationComplete = visibleLines >= activeSkill.output.length;

  useEffect(() => {
    setVisibleLines(0);
    const timers = activeSkill.output.map((_, index) =>
      window.setTimeout(() => {
        setVisibleLines(index + 1);
      }, 420 + index * 360)
    );

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [activeSkillId, activeSkill.output]);

  async function copyPrompt(skill: SkillPreview) {
    try {
      await navigator.clipboard.writeText(skill.prompt);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = skill.prompt;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopiedSkillId(skill.id);
    window.setTimeout(() => setCopiedSkillId(null), 1800);
  }

  return (
    <section className="px-6 py-14 md:py-20 bg-[color:var(--color-linen)] border-b border-[color:var(--color-ink)]/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-3xl">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
              Skills preview
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
              Practical reps, not abstract AI theory.
            </h2>
            <p className="text-base text-[color:var(--color-ink)]/70 leading-relaxed mt-5 max-w-xl">
              Preview the kinds of banking tasks learners practice inside
              AiBI-P.
            </p>
          </div>
          <Link
            href="/courses/aibi-p"
            className="inline-flex w-fit items-center justify-center px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
          >
            Explore the Practitioner Course
          </Link>
        </div>

        <div className="mt-10 overflow-x-auto border-y border-[color:var(--color-ink)]/10">
          <div className="grid min-w-[760px] grid-cols-5 gap-px bg-[color:var(--color-ink)]/10">
            {SKILLS.map((skill, index) => {
              const isActive = skill.id === activeSkillId;
              return (
                <button
                  key={skill.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveSkillId(skill.id)}
                  className={`group min-h-[132px] bg-[color:var(--color-linen)] p-5 text-left transition-all hover:bg-[color:var(--color-parch)] ${
                    isActive
                      ? 'shadow-[inset_0_3px_0_var(--color-terra)]'
                      : 'shadow-[inset_0_0_0_transparent]'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`font-mono text-sm transition-transform duration-200 group-hover:translate-x-1 ${
                      isActive
                        ? 'text-[color:var(--color-terra)]'
                        : 'text-[color:var(--color-ink)]/35'
                    }`}
                  >
                    / {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="mt-6 block font-serif text-2xl text-[color:var(--color-ink)] leading-tight transition-transform duration-200 group-hover:translate-x-1">
                    {skill.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          key={activeSkill.id}
          className="mt-8 grid gap-px bg-[color:var(--color-ink)]/10 border border-[color:var(--color-ink)]/10 lg:grid-cols-[0.8fr_1fr_1fr] animate-[fadeIn_220ms_ease-out]"
        >
          <PreviewPanel label="Before">
            <p className="font-serif text-2xl leading-snug text-[color:var(--color-ink)]">
              {activeSkill.before}
            </p>
          </PreviewPanel>

          <PreviewPanel label="Sample prompt">
            <p className="font-mono text-sm leading-relaxed text-[color:var(--color-ink)]/80">
              {activeSkill.prompt}
            </p>
            <button
              type="button"
              onClick={() => copyPrompt(activeSkill)}
              className={`mt-6 inline-flex items-center justify-center px-5 py-3 border font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] transition-all ${
                animationComplete
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2 pointer-events-none'
              } ${
                copiedSkillId === activeSkill.id
                  ? 'bg-[color:var(--color-terra)] border-[color:var(--color-terra)] text-[color:var(--color-linen)]'
                  : 'border-[color:var(--color-terra)] text-[color:var(--color-terra)] hover:bg-[color:var(--color-terra)] hover:text-[color:var(--color-linen)]'
              }`}
            >
              {copiedSkillId === activeSkill.id ? 'Prompt Copied' : activeSkill.cta}
            </button>
          </PreviewPanel>

          <PreviewPanel label="AI-assisted result">
            <div className="min-h-[174px]">
              {!animationComplete ? (
                <div className="inline-flex gap-1 py-1" aria-label="AI is typing">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-terra)]/70 animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-terra)]/50 animate-pulse [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-terra)]/30 animate-pulse [animation-delay:240ms]" />
                </div>
              ) : null}
              <div className="space-y-2">
                {activeSkill.output.slice(0, visibleLines).map((line) => (
                  <p
                    key={line}
                    className="text-sm leading-relaxed text-[color:var(--color-ink)]/80 animate-[fadeInUp_240ms_ease-out]"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </PreviewPanel>
        </div>

        <div className="mt-7 flex flex-col gap-4 border-t border-[color:var(--color-ink)]/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-xl text-[color:var(--color-ink)] leading-snug">
            These are the kinds of practical reps included in AiBI-P.
          </p>
          <Link
            href="/courses/aibi-p"
            className="inline-flex w-fit items-center justify-center px-6 py-3 border border-[color:var(--color-ink)]/25 text-[color:var(--color-ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] transition-colors"
          >
            Try this in the Practitioner Course
          </Link>
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
    <div className="bg-[color:var(--color-parch)] p-5 md:p-6">
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
        {label}
      </p>
      {children}
    </div>
  );
}
