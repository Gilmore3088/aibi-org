'use client';

// M4PaidWorkbench — hybrid wrapper that mounts WorkbenchPackBuilder
// inside PaidWorkbenchShell with derived Source + Output previews on
// the flanking panes.
//
// Open item #5 from the 2026-05-25 foundation UX recovery handoff.
// The Builder is intentionally not split into three sub-components
// (would touch too many surfaces and break the Save flow that #4 just
// landed). Instead, the centre pane hosts the Builder unchanged; the
// left and right panes render read-only previews driven by the
// Builder's onChange snapshot. The review bar shows live completion
// status — the actual Save button stays inside the Builder form so
// keyboard-submit (Enter) still works.

import { useState } from 'react';
import { PaidWorkbenchShell } from './PaidWorkbenchShell';
import { WorkbenchPackBuilder } from '@/components/addie/interactives/m4/WorkbenchPackBuilder';
import {
  isPackComplete,
  type WorkbenchPackContent,
} from '@/lib/addie/artifacts/workbench-pack';

interface M4PaidWorkbenchProps {
  readonly kicker: string;
  readonly title: string;
  readonly lede?: string;
  readonly initialSourcePacket?: string;
  readonly reviewTagSuggestions?: ReadonlyArray<string>;
  readonly onSavePack: (pack: WorkbenchPackContent) => Promise<void>;
}

export function M4PaidWorkbench({
  kicker,
  title,
  lede,
  initialSourcePacket = '',
  reviewTagSuggestions,
  onSavePack,
}: M4PaidWorkbenchProps) {
  const [snapshot, setSnapshot] = useState<WorkbenchPackContent | null>(null);
  const complete = snapshot ? isPackComplete(snapshot) : false;
  const filled = snapshot ? countFilledRegions(snapshot) : 0;

  return (
    <PaidWorkbenchShell
      kicker={kicker}
      title={title}
      lede={lede}
      sourceNode={<SourcePreview text={snapshot?.sourcePacket ?? initialSourcePacket} />}
      controlsNode={
        <WorkbenchPackBuilder
          initialSourcePacket={initialSourcePacket}
          reviewTagSuggestions={reviewTagSuggestions}
          onSave={onSavePack}
          onChange={setSnapshot}
        />
      }
      outputNode={<OutputPreview pack={snapshot} />}
      reviewBarNode={<ReviewBar filled={filled} complete={complete} pack={snapshot} />}
    />
  );
}

function SourcePreview({ text }: { readonly text: string }) {
  if (!text.trim()) {
    return (
      <p className="font-sans text-[0.875rem] text-[var(--ledger-muted)] italic">
        Region 01 (centre) populates this preview.
      </p>
    );
  }
  return (
    <div className="font-sans text-[0.875rem] leading-[1.55] text-[var(--ledger-ink-2)] whitespace-pre-wrap">
      {text}
    </div>
  );
}

function OutputPreview({ pack }: { readonly pack: WorkbenchPackContent | null }) {
  const sections: ReadonlyArray<{ label: string; text: string }> = [
    { label: 'First output', text: pack?.firstOutput ?? '' },
    { label: 'Improved output', text: pack?.improvedOutput ?? '' },
    { label: 'Final work product', text: pack?.finalWorkProduct ?? '' },
  ];
  const anyContent = sections.some((s) => s.text.trim().length > 0);
  if (!anyContent) {
    return (
      <p className="font-sans text-[0.875rem] text-[var(--ledger-muted)] italic">
        Regions 03 / 05 / 07 populate this preview.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      {sections.map((s) =>
        s.text.trim() ? (
          <div key={s.label}>
            <div className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)] mb-1">
              {s.label}
            </div>
            <div className="font-sans text-[0.875rem] leading-[1.55] text-[var(--ledger-ink-2)] whitespace-pre-wrap">
              {s.text}
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}

function ReviewBar({
  filled,
  complete,
  pack,
}: {
  readonly filled: number;
  readonly complete: boolean;
  readonly pack: WorkbenchPackContent | null;
}) {
  const boundary = pack?.useBoundary ?? 'personal sandbox';
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <span className="font-mono uppercase tracking-[0.16em] text-[0.7rem]">
          {filled} / 7 regions filled
        </span>
        <span
          className={
            'font-mono uppercase tracking-[0.16em] text-[0.7rem] ' +
            (complete ? 'text-[var(--ledger-accent)]' : 'text-[var(--ledger-soft)]')
          }
        >
          {complete ? '✓ ready to save' : 'incomplete'}
        </span>
      </div>
      <span className="font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-soft)]">
        Use boundary · {boundary}
      </span>
    </div>
  );
}

function countFilledRegions(pack: WorkbenchPackContent): number {
  let n = 0;
  if (pack.sourcePacket.trim()) n++;
  if (pack.promptUsed.trim()) n++;
  if (pack.firstOutput.trim()) n++;
  if (pack.reviewTags.length > 0) n++;
  if (pack.improvedOutput.trim()) n++;
  if (pack.questionsToConfirm.some((q) => q.trim().length > 0)) n++;
  if (pack.finalWorkProduct.trim()) n++;
  return n;
}
