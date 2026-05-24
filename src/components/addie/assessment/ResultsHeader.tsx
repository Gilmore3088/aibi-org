// ResultsHeader — title strip for a saved Readiness Briefing.
// Three CTAs: Print (window.print), Take it again (link to runner on main),
// and a stub "Save to Toolbox" that opens an explainer modal. The Toolbox
// integration for assessment results is deferred to the team admin work.

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

export interface ResultsHeaderProps {
  readonly created_at: string;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function ResultsHeader({ created_at }: ResultsHeaderProps) {
  const [showToolboxNote, setShowToolboxNote] = useState(false);

  function handlePrint(): void {
    if (typeof window !== 'undefined') window.print();
  }

  return (
    <header className="border-b border-[var(--ledger-rule)] pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <KickerLabel tone="accent">In-Depth Readiness Assessment</KickerLabel>
          <h1 className="font-serif text-3xl text-[var(--ledger-ink)] sm:text-4xl">
            Your Readiness Briefing
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--ledger-muted)]">
            Dated {formatDate(created_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <LedgerButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={handlePrint}
          >
            Print
          </LedgerButton>
          <LedgerButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowToolboxNote(true)}
          >
            Save to Toolbox
          </LedgerButton>
          <Link href="/assessment/in-depth">
            <LedgerButton type="button" variant="primary" size="sm">
              Take it again
            </LedgerButton>
          </Link>
        </div>
      </div>

      {showToolboxNote ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="toolbox-note-title"
          className="mt-4 rounded-[3px] border border-[var(--ledger-rule)] bg-[var(--ledger-tape)] p-4 print:hidden"
        >
          <h2
            id="toolbox-note-title"
            className="font-serif text-lg text-[var(--ledger-ink)]"
          >
            Toolbox saving for assessment results is coming
          </h2>
          <p className="mt-2 text-sm text-[var(--ledger-ink-2)]">
            Saving a Readiness Briefing into your Toolbox as a versioned
            artifact ships with the team admin work. For now, use Print
            to keep a copy, or revisit this page from your dashboard.
          </p>
          <div className="mt-3">
            <LedgerButton
              type="button"
              variant="tertiary"
              size="sm"
              onClick={() => setShowToolboxNote(false)}
            >
              Dismiss
            </LedgerButton>
          </div>
        </div>
      ) : null}
    </header>
  );
}
