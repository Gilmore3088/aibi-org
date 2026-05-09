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
      'Customer is upset about a $35 NSF fee. Need to respond without promising a refund or admitting fault.',
    prompt:
      'You are a community bank customer service officer. Draft a 3-paragraph response to the email below. Constraints: empathetic tone, do not promise a refund, do not admit bank error, do not cite specific regulations. Structure: (1) acknowledge the frustration without apology, (2) state what you can do (review account activity together by phone), (3) provide a callback path. Close with the rep\'s direct line. Flag for supervisor review if the customer mentions legal action, ADA, or fair lending.\n\nCUSTOMER EMAIL:\n[paste here]',
    output: [
      'Dear [CUSTOMER NAME],',
      'I appreciate you taking the time to write — fees are frustrating, and I want to make sure I understand what happened on your account.',
      'I can\'t reverse the charge by email, but I can pull up the activity around the date in question and walk you through it. That conversation usually surfaces options.',
      'Please call me at (555) 555-0142, weekdays 9–5, or reply with a window that works and I will call you. Asking for me directly will route the call right through.',
      '— [REP NAME], [TITLE]',
    ],
    cta: 'Copy prompt',
  },
  {
    id: 'policies',
    title: 'Summarize policies',
    before:
      'A 12-page CIP procedure update needs to become a one-page branch-ready quick reference.',
    prompt:
      'You are a compliance translator for a community bank. Summarize the policy below for frontline branch staff. Keep regulatory citations verbatim — do not paraphrase any section reference. Output exactly four sections in this order: REQUIRED ACTIONS (numbered, imperative voice, max 5), THIS REPLACES (bullet what changes from prior version), ESCALATE TO SUPERVISOR (bullet trigger conditions), QUESTIONS TO ASK CUSTOMER (bullet, plain language). Hard cap: 250 words total. If any required field is unclear, write "TBD: [field] — confirm with Compliance" rather than guessing.\n\nPOLICY:\n[paste here]',
    output: [
      'REQUIRED ACTIONS',
      '1. Verify government-issued ID matches the application before account opening.',
      '2. Run OFAC + 314(a) check on every new signer (12 CFR 1020.220).',
      '3. Capture beneficial ownership for non-personal accounts ≥25%.',
      '4. Document any exception with the dual-control approval form.',
      'THIS REPLACES',
      '· Single-step OFAC check (now run again at first deposit)',
      'ESCALATE TO SUPERVISOR',
      '· ID expired or non-photo · address mismatch with credit bureau · cash deposit ≥ $10K at opening',
    ],
    cta: 'Copy prompt',
  },
  {
    id: 'review',
    title: 'Review AI safely',
    before:
      'An AI tool gave a confident answer about overdraft policy. Need to verify before sending it to a customer.',
    prompt:
      'You are a model-risk reviewer at a community bank. Review the AI response below before it reaches a customer or examiner. Output exactly three sections: VERIFIED (claims backed by named source — list each), NEEDS REVIEW (claims plausible but unsourced — list each + what would verify), UNSUPPORTED (do-not-send claims — list each + why). Specifically flag: dollar figures, regulatory citations, effective dates, percentages, "all" or "every" claims, and any claim about competitor banks. Do not rewrite the response — annotate only. End with a one-line GO / HOLD recommendation.\n\nAI RESPONSE:\n[paste here]',
    output: [
      'VERIFIED',
      '· Reg E error-resolution timeline (10 business days) — 12 CFR 1005.11',
      'NEEDS REVIEW',
      '· "Most community banks waive the first NSF fee" — no source. Verify against ICBA 2025 fee survey before sending.',
      '· Effective date "January 2026" — confirm with internal policy log.',
      'UNSUPPORTED',
      '· "All banks are required to refund overdrafts under $5" — false. Do not send.',
      'HOLD — three claims need verification before customer reply.',
    ],
    cta: 'Copy prompt',
  },
  {
    id: 'prompts',
    title: 'Build reusable prompts',
    before:
      'You rewrite the weekly fraud-review summary every Friday. Time to turn it into a saved skill.',
    prompt:
      'You are a prompt engineer for a community bank operations team. Turn the recurring task below into a reusable prompt that any teammate can run. Output the prompt using these exact section headers: ROLE, TASK, INPUTS (bracketed placeholders), CONSTRAINTS (named, including any banking-specific guardrails — no PII pasting, human review threshold, refusal trigger), OUTPUT FORMAT (sections + length cap), REVIEW (who signs off + what they check). End with VERSION (date + author initials) so the team can track changes.\n\nRECURRING TASK:\n[paste here]',
    output: [
      'ROLE: Fraud-ops analyst summarizing weekly exception report.',
      'TASK: Convert raw [FRAUD_LOG_CSV] into Friday memo for [BRANCH_MANAGER].',
      'INPUTS: [FRAUD_LOG_CSV] · [WEEK_RANGE] · [PRIOR_WEEK_BASELINE]',
      'CONSTRAINTS:',
      '· Strip account numbers and SSNs before processing — do not paste PII.',
      '· Flag any case ≥ $10K for human review before sending.',
      '· Refuse if log contains an active investigation marker.',
      'OUTPUT FORMAT: 3 sections (Top 3 by dollar volume · Pattern shifts vs prior week · Items needing escalation). Hard cap 300 words.',
      'REVIEW: Branch manager sign-off; checks dollar accuracy + escalation column.',
      'VERSION: 2026-05-08 · [INITIALS]',
    ],
    cta: 'Copy prompt',
  },
  {
    id: 'hours',
    title: 'Save hours every week',
    before:
      'Weekly ops meeting notes are messy and no one knows decisions, owners, or next steps.',
    prompt:
      'You are an operations lead capturing decisions from the meeting transcript below. Output exactly four sections in this order: DECISIONS (what was agreed, present tense), ACTION ITEMS (owner — task — deadline, one per line), OPEN QUESTIONS (unresolved items needing follow-up), PARKING LOT (out-of-scope items raised). Do not invent missing owners or deadlines — write "TBD: owner needed" or "TBD: deadline needed" so the gap is visible. If a decision was made without a clear owner, list it under OPEN QUESTIONS with the prompt "who owns this?". End with NEXT MEETING: [date if mentioned].\n\nMEETING NOTES:\n[paste here]',
    output: [
      'DECISIONS',
      '· Move to monthly checklist refresh starting June.',
      '· Add dual-control on wire approvals over $25K.',
      'ACTION ITEMS',
      '· Operations — update checklist template — Friday 5/16',
      '· Branch managers — confirm team training completion — TBD: deadline needed',
      '· Compliance — review wire policy draft — Tuesday 5/13',
      'OPEN QUESTIONS',
      '· Who owns ongoing exception tracking after the rollout?',
      'PARKING LOT',
      '· Vendor evaluation for new core integration (defer to Q3 review)',
      'NEXT MEETING: Friday 5/16, 10am.',
    ],
    cta: 'Copy prompt',
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
              AiBI-Practitioner.
            </p>
          </div>
          <Link
            href="/courses/aibi-p"
            className="inline-flex w-fit items-center justify-center px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
          >
            Explore the Practitioner Course
          </Link>
        </div>

        <div className="mt-12 grid gap-px bg-[color:var(--color-ink)]/10 border border-[color:var(--color-ink)]/10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Left column: 5-skill accordion. Each row expands to reveal the
              "Before" framing inline; the right column then becomes the
              focused stage for the prompt + AI-assisted result. */}
          <ul role="tablist" aria-label="Banking skills" className="bg-[color:var(--color-parch)]">
            {SKILLS.map((skill, index) => {
              const isActive = skill.id === activeSkillId;
              return (
                <li
                  key={skill.id}
                  className={`border-b border-[color:var(--color-ink)]/10 last:border-b-0 ${
                    isActive ? 'bg-[color:var(--color-linen)]' : ''
                  }`}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`skill-panel-${skill.id}`}
                    id={`skill-tab-${skill.id}`}
                    onClick={() => setActiveSkillId(skill.id)}
                    className="group flex w-full items-start gap-5 p-6 md:p-7 text-left transition-colors hover:bg-[color:var(--color-linen)]"
                  >
                    <span
                      aria-hidden="true"
                      className={`font-mono text-sm tabular-nums shrink-0 mt-1 ${
                        isActive
                          ? 'text-[color:var(--color-terra)]'
                          : 'text-[color:var(--color-ink)]/35'
                      }`}
                    >
                      / {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span
                        className={`block font-serif text-xl md:text-2xl leading-tight transition-colors ${
                          isActive
                            ? 'text-[color:var(--color-ink)]'
                            : 'text-[color:var(--color-ink)]/85 group-hover:text-[color:var(--color-ink)]'
                        }`}
                      >
                        {skill.title}
                      </span>
                      {isActive && (
                        <span
                          className="mt-3 block font-serif italic text-base leading-snug text-[color:var(--color-ink)]/70 animate-[fadeIn_220ms_ease-out]"
                        >
                          {skill.before}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Right column: prompt (top) + AI-assisted result (bottom). */}
          <div
            key={activeSkill.id}
            role="tabpanel"
            id={`skill-panel-${activeSkill.id}`}
            aria-labelledby={`skill-tab-${activeSkill.id}`}
            className="grid gap-px bg-[color:var(--color-ink)]/10 grid-rows-[auto_auto] animate-[fadeIn_220ms_ease-out]"
          >
            <PreviewPanel label="Sample prompt">
              <p className="font-mono text-sm leading-relaxed text-[color:var(--color-ink)]/80">
                {activeSkill.prompt}
              </p>
              <button
                type="button"
                onClick={() => copyPrompt(activeSkill)}
                className={`mt-5 inline-flex items-center font-mono text-[10px] font-semibold uppercase tracking-[0.18em] border-b pb-0.5 transition-all ${
                  animationComplete
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-1 pointer-events-none'
                } ${
                  copiedSkillId === activeSkill.id
                    ? 'border-[color:var(--color-terra)] text-[color:var(--color-terra)]'
                    : 'border-[color:var(--color-terra)] text-[color:var(--color-terra)] hover:opacity-70'
                }`}
              >
                {copiedSkillId === activeSkill.id ? '✓ Copied' : activeSkill.cta}
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
        </div>

        <div className="mt-7 flex flex-col gap-4 border-t border-[color:var(--color-ink)]/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-xl text-[color:var(--color-ink)] leading-snug">
            These are the kinds of practical reps included in AiBI-Practitioner.
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
