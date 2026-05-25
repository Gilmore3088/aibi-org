'use client';

// WorkbenchPackArtifact — saved-state render of a Workbench Pack as a
// Toolbox card. Read-only display; the WorkbenchPackBuilder owns the
// edit path. Phase 3 F2 variant of ArtifactReviewShell.
//
// Renders all 7 pedagogical regions + governance metadata strip + the
// "Copy as Markdown" secondary action wired through packToMarkdown.
// Re-opening a saved Pack lands the learner here.

import { useCallback } from 'react';
import { ArtifactReviewShell } from './ArtifactReviewShell';
import {
  packToMarkdown,
  type WorkbenchPackContent,
} from '@/lib/addie/artifacts/workbench-pack';

interface WorkbenchPackArtifactProps {
  readonly pack: WorkbenchPackContent;
  readonly savedAt?: string; // ISO date for the footnote
}

export function WorkbenchPackArtifact({
  pack,
  savedAt,
}: WorkbenchPackArtifactProps) {
  const handleCopy = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(packToMarkdown(pack));
    } catch {
      /* swallow — UI shows nothing rather than crashing */
    }
  }, [pack]);

  return (
    <ArtifactReviewShell
      kicker={`Toolbox · Workbench Pack · v${pack.version}`}
      title="Source → Prompt → Output → Review → Improved → Confirm → Final"
      sub={`Use boundary: ${pack.useBoundary}${pack.approver ? ` · Approver: ${pack.approver}` : ''}`}
      content={<PackBody pack={pack} />}
      footnote={savedAt ? `Saved ${savedAt}` : undefined}
      secondaryAction={{ label: 'Copy as Markdown', onClick: handleCopy }}
    />
  );
}

function PackBody({ pack }: { readonly pack: WorkbenchPackContent }) {
  return (
    <div className="space-y-5">
      <Region label="01 · Source packet" body={pack.sourcePacket} />
      <Region label="02 · Prompt used" body={pack.promptUsed} mono />
      <Region label="03 · First output" body={pack.firstOutput} />
      <RegionTags label="04 · Review tags" tags={pack.reviewTags} />
      <Region label="05 · Improved output" body={pack.improvedOutput} />
      <RegionList label="06 · Questions to confirm" items={pack.questionsToConfirm} />
      <Region label="07 · Final work product" body={pack.finalWorkProduct} />
      {pack.validationNotes && (
        <div className="pt-4 mt-4 border-t border-[var(--ledger-rule)]">
          <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)] mb-1">
            Validation notes
          </div>
          <p className="font-sans text-[0.9rem] text-[var(--ledger-ink-2)] leading-[1.55]">
            {pack.validationNotes}
          </p>
        </div>
      )}
    </div>
  );
}

function Region({
  label,
  body,
  mono = false,
}: {
  readonly label: string;
  readonly body: string;
  readonly mono?: boolean;
}) {
  return (
    <section>
      <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-accent)] mb-1.5">
        {label}
      </div>
      <p
        className={
          (mono ? 'font-mono text-[0.85rem]' : 'font-sans text-[0.95rem]') +
          ' text-[var(--ledger-ink)] leading-[1.55] whitespace-pre-wrap'
        }
      >
        {body || <span className="text-[var(--ledger-muted)]">—</span>}
      </p>
    </section>
  );
}

function RegionTags({
  label,
  tags,
}: {
  readonly label: string;
  readonly tags: ReadonlyArray<string>;
}) {
  return (
    <section>
      <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-accent)] mb-1.5">
        {label}
      </div>
      {tags.length === 0 ? (
        <span className="text-[var(--ledger-muted)] text-[0.9rem]">—</span>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="font-mono uppercase tracking-[0.14em] text-[0.6rem] px-2 py-1 rounded-[2px] bg-[var(--ledger-tape)] text-[var(--ledger-ink-2)] border border-[var(--ledger-accent)]"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function RegionList({
  label,
  items,
}: {
  readonly label: string;
  readonly items: ReadonlyArray<string>;
}) {
  return (
    <section>
      <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-accent)] mb-1.5">
        {label}
      </div>
      {items.length === 0 ? (
        <span className="text-[var(--ledger-muted)] text-[0.9rem]">—</span>
      ) : (
        <ol className="list-decimal list-inside space-y-1 font-sans text-[0.9rem] text-[var(--ledger-ink)] leading-[1.5]">
          {items.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
      )}
    </section>
  );
}
