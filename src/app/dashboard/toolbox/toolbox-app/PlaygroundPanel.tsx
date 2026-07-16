'use client';

import { type RefObject } from 'react';
import { isWorkflowSkill, type ToolboxMessage, type ToolboxSkill } from '@/lib/toolbox/types';
import { renderMarkdown } from '@/lib/sandbox/markdown-renderer';
import { ModelPicker, type ModelSelection } from '../_components/ModelPicker';
import { TypedConfirmGate } from './TypedConfirmGate';
import { PiiOverrideBanner } from './PiiOverrideBanner';

export function PlaygroundPanel(props: {
  readonly activeSkill: ToolboxSkill | null;
  readonly input: string;
  readonly setInput: (value: string) => void;
  readonly messages: readonly ToolboxMessage[];
  readonly running: boolean;
  readonly threadRef: RefObject<HTMLDivElement | null>;
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
          <p className="text-[0.6875rem] uppercase tracking-widest text-[color:var(--ink)]">
            Sandbox · Never enter real member, account, or institution-confidential data
          </p>
          <p className="text-[0.625rem] tracking-wide text-[color:var(--slate-500)]">
            Requests leave our servers. Use fabricated examples only.
          </p>
        </div>
        <div className="mx-auto max-w-2xl py-20 text-center">
          <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
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
          <button type="button" onClick={props.onBrowse} className="mt-6 bg-[color:var(--gold-deep)] px-5 py-3 text-[0.625rem] uppercase tracking-widest text-[color:var(--cream)]">Browse Library</button>
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
        <p className="text-[0.6875rem] uppercase tracking-widest text-[color:var(--ink)]">
          Sandbox · Never enter real member, account, or institution-confidential data
        </p>
        <p className="text-[0.625rem] tracking-wide text-[color:var(--slate-500)]">
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
        <p className="text-[0.625rem] uppercase tracking-widest text-[color:var(--gold-deep)]">
          {props.activeSkill.deptFull || props.activeSkill.dept || 'Playbook'}
        </p>
        <h2 className="mt-2 text-3xl leading-tight">{props.activeSkill.name}</h2>
        <p className="mt-1 text-[0.625rem] text-[color:var(--slate-500)]">{props.activeSkill.cmd}</p>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--slate-500)]">{props.activeSkill.desc || (isWorkflowSkill(props.activeSkill) ? props.activeSkill.purpose : '')}</p>
        <div className="mt-5 grid gap-2 border-t border-[color:var(--ink)]/10 pt-4 text-xs text-[color:var(--slate-500)]">
          <p><span className="text-[color:var(--ink)]">Owner:</span> {props.activeSkill.owner}</p>
          <p><span className="text-[color:var(--ink)]">Output:</span> {props.activeSkill.output}</p>
          <p><span className="text-[color:var(--ink)]">Maturity:</span> {props.activeSkill.maturity}</p>
        </div>
        <div className="mt-5 grid gap-3">
          <button type="button" onClick={props.onSave} className="bg-[color:var(--gold-deep)] px-3 py-2 text-[0.625rem] uppercase tracking-widest text-[color:var(--cream)]">
            Save playbook changes
          </button>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <button type="button" onClick={props.onEdit} className="text-[0.625rem] uppercase tracking-widest text-[color:var(--gold-deep)] hover:text-[color:var(--ink)]">
              Edit in Builder
            </button>
            <button type="button" onClick={props.onExport} className="text-[0.625rem] uppercase tracking-widest text-[color:var(--gold-deep)] hover:text-[color:var(--ink)]">
              Download .md
            </button>
            <button type="button" onClick={props.onCopy} className="text-[0.625rem] uppercase tracking-widest text-[color:var(--gold-deep)] hover:text-[color:var(--ink)]">
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
            <p className="text-[0.625rem] uppercase tracking-widest text-[color:var(--ink)]">
              Sandbox · No real member data
            </p>
            {props.usage && (
              <p className="text-[0.625rem] tabular-nums text-[color:var(--slate-500)]">
                ${(props.usage.todayCents / 100).toFixed(2)} / ${(props.usage.dailyCapCents / 100).toFixed(2)} today
              </p>
            )}
          </div>

          {isWorkflowSkill(props.activeSkill) && props.activeSkill.samples.length > 0 && props.input.trim() === '' && props.messages.length === 0 && (
            <div className="mb-3">
              <p className="mb-2 text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-500)]">
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
              className="absolute bottom-3 right-3 bg-[color:var(--gold-deep)] px-5 py-2.5 text-[0.625rem] font-semibold uppercase tracking-widest text-[color:var(--cream)] hover:bg-[color:var(--gold-deep)] disabled:opacity-40"
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
                <button type="button" onClick={props.onReset} className="text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-500)] hover:text-[color:var(--gold-deep)]">
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
                className="text-[0.625rem] uppercase tracking-widest text-[color:var(--gold-deep)] hover:text-[color:var(--ink)] disabled:opacity-30"
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
                  <p className="text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-500)]">
                    {message.role === 'user' ? 'You' : providerLabel}
                  </p>
                  {message.role === 'assistant' && message.content && (
                    <button
                      type="button"
                      onClick={() => copyMessage(message.content)}
                      className="text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-500)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[color:var(--gold-deep)]"
                      aria-label="Copy response"
                    >
                      Copy
                    </button>
                  )}
                </div>
                <div className="text-sm leading-relaxed">{message.role === 'assistant' ? renderMarkdown(message.content) : <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>}</div>
              </div>
            ))}
            {props.running && <p className="text-[0.625rem] uppercase tracking-widest text-[color:var(--gold-deep)]">{providerLabel} is thinking…</p>}
          </div>
        )}
      </div>
      </div>
    </section>
  );
}
