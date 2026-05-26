'use client';

// WorkbenchPackBuilder — M4's primary Pack-producing interactive.
//
// Phase 2 of the 2026-05-25 recovery plan (Decision #2). Replaces the
// SkillBuilder / SkillTester arc that previously saved three separate
// artifact rows. Now a single Pack row carries:
//   1. Source packet            (the synthetic banking material the learner started from)
//   2. Prompt used              (the prompt as sent)
//   3. First output             (raw model output)
//   4. Review tags              (banker-context flags applied to first output)
//   5. Improved output          (output after re-prompting based on review tags)
//   6. Questions to confirm     (the M4.4 four-question guardrail check)
//   7. Final work product       (send-ready)
// + governance metadata: version, approver (null → personal use),
//   useBoundary, validationNotes.
//
// One controlled form, seven labelled regions. Save writes a single
// addie.toolbox_items row with type='workbench_pack' and the Pack
// content as JSON. Copy-to-Markdown affordance covers Branch Mgr Devon's
// recipe-vs-kitchen finding (a learner exports the Pack and runs it
// outside the Toolbox in their bank's sanctioned AI tool).
//
// Wiring into M4 lessons is a follow-up PR.

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  packToMarkdown,
  isPackComplete,
  type WorkbenchPackContent,
} from '@/lib/addie/artifacts/workbench-pack';

interface WorkbenchPackBuilderProps {
  /** Synthetic source the learner is working from. Pre-loaded per lab. */
  readonly initialSourcePacket?: string;
  /** Pre-suggested review-tag chips for the M4 lab variant. */
  readonly reviewTagSuggestions?: ReadonlyArray<string>;
  /** Called when the learner clicks "Save Pack" with a complete Pack. */
  readonly onSave?: (pack: WorkbenchPackContent) => void | Promise<void>;
  /**
   * Called on every state change with the current Pack snapshot. Used by
   * PaidWorkbenchShell wrappers to render derived Source / Output previews
   * outside the form (#5, 2026-05-25 hybrid).
   */
  readonly onChange?: (pack: WorkbenchPackContent) => void;
}

const DEFAULT_GUARDRAIL_QUESTIONS: ReadonlyArray<string> = [
  'Does the output cite anything outside the source packet?',
  'Comfortable sending as-is?',
  'Where does it need a human pass?',
  'One input pattern that would break this Pack?',
];

const DEFAULT_TAG_SUGGESTIONS: ReadonlyArray<string> = [
  'fabricated citation',
  'tone off for member-facing',
  'too long',
  'missing constraint',
  'MNPI risk',
  'invented number',
];

export function WorkbenchPackBuilder({
  initialSourcePacket = '',
  reviewTagSuggestions = DEFAULT_TAG_SUGGESTIONS,
  onSave,
  onChange,
}: WorkbenchPackBuilderProps) {
  const [sourcePacket, setSourcePacket] = useState(initialSourcePacket);
  const [promptUsed, setPromptUsed] = useState('');
  const [firstOutput, setFirstOutput] = useState('');
  const [reviewTags, setReviewTags] = useState<ReadonlyArray<string>>([]);
  const [improvedOutput, setImprovedOutput] = useState('');
  const [questionsToConfirm, setQuestionsToConfirm] = useState<ReadonlyArray<string>>(
    DEFAULT_GUARDRAIL_QUESTIONS,
  );
  const [finalWorkProduct, setFinalWorkProduct] = useState('');
  const [useBoundary, setUseBoundary] = useState<WorkbenchPackContent['useBoundary']>('personal sandbox');
  const [validationNotes, setValidationNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const pack = useMemo<WorkbenchPackContent>(
    () => ({
      sourcePacket,
      promptUsed,
      firstOutput,
      reviewTags,
      improvedOutput,
      questionsToConfirm,
      finalWorkProduct,
      version: 1,
      approver: null,
      useBoundary,
      validationNotes,
    }),
    [
      sourcePacket,
      promptUsed,
      firstOutput,
      reviewTags,
      improvedOutput,
      questionsToConfirm,
      finalWorkProduct,
      useBoundary,
      validationNotes,
    ],
  );

  const complete = useMemo(() => isPackComplete(pack), [pack]);

  useEffect(() => {
    if (onChange) onChange(pack);
  }, [pack, onChange]);

  const toggleTag = useCallback((tag: string) => {
    setReviewTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const handleCopy = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(packToMarkdown(pack));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [pack]);

  const handleSave = useCallback(async () => {
    if (!complete || !onSave) return;
    setSaveStatus('saving');
    try {
      await onSave(pack);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, [complete, pack, onSave]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
      className="space-y-6"
      aria-label="Workbench Pack builder"
    >
      <Region label="01 · Source packet" hint="Synthetic banking material. Public, anonymized, or generic.">
        <textarea
          value={sourcePacket}
          onChange={(e) => setSourcePacket(e.target.value)}
          rows={4}
          className={textareaClass}
          placeholder="A draft adverse-action letter. A vendor proposal stripped of identifiers. A public reg excerpt."
        />
      </Region>

      <Region label="02 · Prompt used" hint="As you sent it — role, task, context, format.">
        <textarea
          value={promptUsed}
          onChange={(e) => setPromptUsed(e.target.value)}
          rows={4}
          className={`${textareaClass} font-mono text-[0.875rem]`}
          placeholder="You are a compliance analyst at a community bank. Tighten the following adverse-action letter..."
        />
      </Region>

      <Region label="03 · First output" hint="Raw output from the model.">
        <textarea
          value={firstOutput}
          onChange={(e) => setFirstOutput(e.target.value)}
          rows={5}
          className={textareaClass}
        />
      </Region>

      <Region label="04 · Review tags" hint="Banker-context flags. Click to apply.">
        <div className="flex flex-wrap gap-2">
          {reviewTagSuggestions.map((tag) => {
            const on = reviewTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={on}
                className={
                  'font-mono uppercase tracking-[0.14em] text-[0.65rem] px-3 py-1.5 rounded-[2px] border transition-colors ' +
                  (on
                    ? 'bg-[var(--ledger-ink)] text-[var(--ledger-paper)] border-[var(--ledger-ink)]'
                    : 'bg-transparent text-[var(--ledger-ink-2)] border-[var(--ledger-rule-strong)] hover:border-[var(--ledger-ink)]')
                }
              >
                {tag}
              </button>
            );
          })}
        </div>
      </Region>

      <Region label="05 · Improved output" hint="After re-prompting with the review tags applied.">
        <textarea
          value={improvedOutput}
          onChange={(e) => setImprovedOutput(e.target.value)}
          rows={5}
          className={textareaClass}
        />
      </Region>

      <Region label="06 · Questions to confirm" hint="The M4.4 four-question guardrail check. Edit per Pack.">
        <ol className="space-y-2 list-decimal list-inside">
          {questionsToConfirm.map((q, i) => (
            <li key={i}>
              <input
                type="text"
                value={q}
                onChange={(e) => {
                  const next = [...questionsToConfirm];
                  next[i] = e.target.value;
                  setQuestionsToConfirm(next);
                }}
                className="w-[calc(100%-2rem)] ml-2 px-2 py-1 bg-[var(--ledger-bg)] border border-[var(--ledger-rule)] rounded-[2px] font-sans text-[0.95rem]"
              />
            </li>
          ))}
        </ol>
      </Region>

      <Region label="07 · Final work product" hint="Send-ready. What you'd actually use Monday morning.">
        <textarea
          value={finalWorkProduct}
          onChange={(e) => setFinalWorkProduct(e.target.value)}
          rows={5}
          className={textareaClass}
        />
      </Region>

      {/* Governance metadata — collapsible, default closed in a follow-up */}
      <fieldset className="border-l-2 border-[var(--ledger-accent)] pl-4 py-2 mt-8">
        <legend className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)]">
          Governance · SR 11-7 metadata
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <label className="block">
            <span className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)] block mb-1">
              Use boundary
            </span>
            <select
              value={useBoundary}
              onChange={(e) =>
                setUseBoundary(e.target.value as WorkbenchPackContent['useBoundary'])
              }
              className="w-full px-2 py-1 bg-[var(--ledger-bg)] border border-[var(--ledger-rule-strong)] rounded-[2px] font-sans text-[0.9rem]"
            >
              <option value="personal sandbox">personal sandbox</option>
              <option value="named-task production">named-task production</option>
            </select>
          </label>
          <label className="block">
            <span className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)] block mb-1">
              Validation notes
            </span>
            <textarea
              value={validationNotes}
              onChange={(e) => setValidationNotes(e.target.value)}
              rows={2}
              className={textareaClass}
              placeholder="Two clean runs on different synthetic inputs."
            />
          </label>
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--ledger-rule)]">
        <button
          type="submit"
          disabled={!complete || saveStatus === 'saving'}
          className={
            'px-5 py-2 font-mono uppercase tracking-[0.16em] text-[0.7rem] rounded-[2px] transition-colors ' +
            (complete
              ? 'bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)]'
              : 'bg-[var(--ledger-rule-strong)] text-[var(--ledger-muted)] cursor-not-allowed')
          }
        >
          {saveStatus === 'saving' ? 'Saving…' : 'Save Pack'}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="px-5 py-2 font-mono uppercase tracking-[0.16em] text-[0.7rem] rounded-[2px] bg-transparent text-[var(--ledger-ink)] border border-[var(--ledger-ink)] hover:bg-[var(--ledger-ink)] hover:text-[var(--ledger-paper)] transition-colors"
        >
          Copy as Markdown
        </button>
        {saveStatus === 'saved' && (
          <span
            className="font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-accent)] self-center"
            role="status"
          >
            ✓ Done
          </span>
        )}
        {saveStatus === 'error' && (
          <span
            className="font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-weak)] self-center"
            role="alert"
          >
            Save failed — try again
          </span>
        )}
      </div>
    </form>
  );
}

const textareaClass =
  'w-full px-3 py-2 bg-[var(--ledger-bg)] border border-[var(--ledger-rule-strong)] rounded-[2px] font-sans text-[0.95rem] leading-[1.55] text-[var(--ledger-ink)] focus:outline-none focus:border-[var(--ledger-accent)] focus:ring-1 focus:ring-[var(--ledger-accent)]';

function Region({
  label,
  hint,
  children,
}: {
  readonly label: string;
  readonly hint?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-2">
        <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)]">
          {label}
        </div>
        {hint && (
          <div className="font-sans text-[0.8125rem] text-[var(--ledger-muted)]">
            {hint}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}
