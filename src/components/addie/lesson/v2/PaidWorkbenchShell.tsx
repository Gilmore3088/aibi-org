'use client';

// PaidWorkbenchShell — Phase 2 E2 (2026-05-25). The three-pane
// workbench layout the recovery plan specs for M4+:
//
//   Desktop (≥ lg):
//     ┌────────────────┬─────────────────────────┬────────────────┐
//     │ SOURCE         │ CONTROLS                │ OUTPUT         │
//     │ (left pane)    │ (centre pane)           │ (right pane)   │
//     │ what you're    │ prompt + tags + improved│ first output / │
//     │ working from   │ + questions + final     │ improved /     │
//     │                │                         │ final preview  │
//     └────────────────┴─────────────────────────┴────────────────┘
//     [ review bar — save | copy-md | governance toggle ]
//
//   Mobile (< lg):
//     stacks vertically — Source → Controls → Output → Review bar.
//
// Visual idiom matches LessonStepShell — mono-uppercase region kickers
// (tracking 0.18em), hairline rules between panes, parchment surface
// for the inputs, paper surface for the outputs, accent gold on
// active controls and the save bar.

import type { ReactNode } from 'react';

interface PaidWorkbenchShellProps {
  /** Lesson kicker (e.g. "MODULE 4 · LESSON 2"). Mono caps. */
  readonly kicker: string;
  /** Lesson title. Newsreader display scale. */
  readonly title: string;
  /** Optional one-line lede under the title. */
  readonly lede?: string;
  /** Left pane — the source the learner is working from. */
  readonly sourceNode: ReactNode;
  /** Centre pane — controls (prompt + tags + improved + questions + final). */
  readonly controlsNode: ReactNode;
  /** Right pane — current output / preview state. */
  readonly outputNode: ReactNode;
  /** Bottom review bar — Save / Copy-as-Markdown / governance toggle. */
  readonly reviewBarNode: ReactNode;
}

export function PaidWorkbenchShell({
  kicker,
  title,
  lede,
  sourceNode,
  controlsNode,
  outputNode,
  reviewBarNode,
}: PaidWorkbenchShellProps) {
  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <header className="mb-6 pb-4 border-b border-[var(--ledger-rule-strong)]">
        <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-muted)] mb-1.5">
          {kicker}
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl leading-tight text-[var(--ledger-ink)]">
          {title}
        </h1>
        {lede && (
          <p className="mt-2 font-sans text-[0.95rem] text-[var(--ledger-ink-2)] max-w-[64ch]">
            {lede}
          </p>
        )}
      </header>

      {/* Three-pane grid — stacks on mobile, side-by-side at lg */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-px bg-[var(--ledger-rule-strong)] border border-[var(--ledger-rule-strong)]">
        <Pane label="01 · Source" tone="parch">
          {sourceNode}
        </Pane>
        <Pane label="02 · Controls" tone="paper">
          {controlsNode}
        </Pane>
        <Pane label="03 · Output" tone="parch">
          {outputNode}
        </Pane>
      </div>

      {/* Review bar — sticky on desktop, inline on mobile */}
      <div className="mt-px bg-[var(--ledger-ink)] text-[var(--ledger-paper)] px-4 sm:px-6 py-4 border border-t-0 border-[var(--ledger-rule-strong)]">
        {reviewBarNode}
      </div>
    </div>
  );
}

function Pane({
  label,
  tone,
  children,
}: {
  readonly label: string;
  readonly tone: 'parch' | 'paper';
  readonly children: ReactNode;
}) {
  const bg =
    tone === 'parch' ? 'bg-[var(--ledger-parch)]' : 'bg-[var(--ledger-paper)]';
  return (
    <section className={`${bg} p-4 sm:p-5 min-h-[420px] flex flex-col`}>
      <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)] mb-3 pb-2 border-b border-[var(--ledger-rule)]">
        {label}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}
