'use client';

// ArtifactReviewShell — Phase 3 F1 (2026-05-25). Generalized typed
// shell for the "saved Toolbox card" moments across the course.
// Lifts the visual idiom from DataDisciplineCardArtifact (border-2
// ink frame, ledger-shadow, mono-caps kicker, Newsreader title,
// hairline rules) into a reusable container so subsequent artifact
// variants (Workbench Pack, Prompt Moves Card, Compliance Review)
// inherit the same Ledger aesthetic without re-implementing.
//
// The shell owns: outer frame, header (kicker + title + optional sub),
// content slot, save button + saved state, and the consistent
// editorial chrome. Variants pass their own content node and provide
// kicker/title/save metadata.

import { useCallback, useState, type ReactNode } from 'react';

export interface ArtifactReviewShellProps {
  /** Mono-caps kicker (e.g. "Toolbox · Workbench Pack"). */
  readonly kicker: string;
  /** Newsreader title — the artifact's name to the learner. */
  readonly title: string;
  /** Optional one-line sub under the title. */
  readonly sub?: string;
  /** The artifact's content (variant-specific structured body). */
  readonly content: ReactNode;
  /** Optional footnote / source attribution under the card. */
  readonly footnote?: ReactNode;
  /** Save handler. Returns a promise; the shell tracks saving + saved state. */
  readonly onSave?: () => Promise<void> | void;
  /** Save-button label. Defaults to "Save to Toolbox". */
  readonly saveLabel?: string;
  /** Optional pre-save validation gate (e.g., isPackComplete). */
  readonly canSave?: boolean;
  /** Optional secondary action — e.g., "Copy as Markdown". */
  readonly secondaryAction?: {
    readonly label: string;
    readonly onClick: () => void | Promise<void>;
  };
}

export function ArtifactReviewShell({
  kicker,
  title,
  sub,
  content,
  footnote,
  onSave,
  saveLabel = 'Save to Toolbox',
  canSave = true,
  secondaryAction,
}: ArtifactReviewShellProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    if (saved || saving || !canSave || !onSave) return;
    setSaving(true);
    setError(null);
    try {
      await onSave();
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [saved, saving, canSave, onSave]);

  return (
    <div className="space-y-5">
      <article className="rounded-[6px] border-2 border-[var(--ledger-ink)] bg-[var(--ledger-paper)] shadow-[var(--ledger-shadow)] overflow-hidden">
        <header className="px-6 sm:px-8 pt-6 pb-4 border-b border-[var(--ledger-rule)]">
          <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)] mb-2">
            {kicker}
          </div>
          <h3 className="font-serif text-[1.5rem] text-[var(--ledger-ink)] leading-tight">
            {title}
          </h3>
          {sub && (
            <p className="mt-1.5 font-sans text-[0.9rem] text-[var(--ledger-ink-2)]">
              {sub}
            </p>
          )}
        </header>

        <div className="px-6 sm:px-8 py-5">{content}</div>

        {footnote && (
          <footer className="px-6 sm:px-8 py-3 border-t border-[var(--ledger-rule)] font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)]">
            {footnote}
          </footer>
        )}
      </article>

      {/* Actions row */}
      <div className="flex flex-wrap items-center gap-3">
        {onSave && (
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || saved || saving}
            className={
              'px-5 py-2 font-mono uppercase tracking-[0.16em] text-[0.7rem] rounded-[2px] transition-colors ' +
              (saved
                ? 'bg-[var(--ledger-accent)] text-[var(--ledger-paper)]'
                : canSave
                  ? 'bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)]'
                  : 'bg-[var(--ledger-rule-strong)] text-[var(--ledger-muted)] cursor-not-allowed')
            }
          >
            {saved ? '✓ Saved' : saving ? 'Saving…' : saveLabel}
          </button>
        )}
        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="px-5 py-2 font-mono uppercase tracking-[0.16em] text-[0.7rem] rounded-[2px] bg-transparent text-[var(--ledger-ink)] border border-[var(--ledger-ink)] hover:bg-[var(--ledger-ink)] hover:text-[var(--ledger-paper)] transition-colors"
          >
            {secondaryAction.label}
          </button>
        )}
        {error && (
          <span
            role="alert"
            className="font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-weak)] self-center"
          >
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
