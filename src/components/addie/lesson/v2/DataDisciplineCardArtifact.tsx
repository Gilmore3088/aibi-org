'use client';

// DataDisciplineCardArtifact — Screen 5 of the m0.2 redesign.
// The saved Toolbox card the learner takes to Monday morning. Not a
// "saved" toast; the actual reference page they can re-open. Per the
// user's critique: the artifact must be substantively useful.

import { useCallback, useState } from 'react';

interface DataDisciplineCardArtifactProps {
  readonly trackLabel: string;          // "Risk & Compliance" / etc.
  readonly trackOffLimits: readonly string[];
  readonly onSave?: () => Promise<void> | void;
}

export function DataDisciplineCardArtifact({
  trackLabel,
  trackOffLimits,
  onSave,
}: DataDisciplineCardArtifactProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      await onSave?.();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }, [saved, saving, onSave]);

  return (
    <div className="space-y-5">
      {/* The Card — designed to be screenshotted, printed, re-opened */}
      <article className="rounded-[6px] border-2 border-[var(--ledger-ink)] bg-[var(--ledger-paper)] shadow-[var(--ledger-shadow)] overflow-hidden">
        <header className="px-6 sm:px-8 pt-6 pb-4 border-b border-[var(--ledger-rule)]">
          <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)] mb-2">
            Toolbox · Data Discipline Card
          </div>
          <h3 className="font-serif text-[1.5rem] text-[var(--ledger-ink)] leading-tight">
            The one rule + the move that keeps you working
          </h3>
        </header>

        <div className="px-6 sm:px-8 py-5 space-y-5">
          <section>
            <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)] mb-1">
              The rule
            </div>
            <p className="font-serif text-[1.0625rem] leading-[1.6] text-[var(--ledger-ink)]">
              Never put customer, member, account, or confidential bank data into a public AI tool.
            </p>
          </section>

          <section>
            <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)] mb-1">
              The move
            </div>
            <p className="font-serif text-[1.0625rem] leading-[1.6] text-[var(--ledger-ink)]">
              Describe the situation, not the person.
            </p>
          </section>

          <section>
            <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)] mb-2">
              The pattern
            </div>
            <p className="font-mono text-[0.85rem] text-[var(--ledger-ink-2)] mb-3">
              Real detail → safe situation → AI prompt
            </p>
            <ol className="space-y-1.5 font-serif text-[0.95rem] text-[var(--ledger-ink-2)]">
              <li>1. <strong className="font-semibold text-[var(--ledger-ink)]">Strip</strong> names, account numbers, SSNs, balances, real loan details.</li>
              <li>2. <strong className="font-semibold text-[var(--ledger-ink)]">Generalize</strong> to "a customer", "an account", "an unsecured loan".</li>
              <li>3. <strong className="font-semibold text-[var(--ledger-ink)]">Ask</strong> for help with the situation, not the person.</li>
            </ol>
          </section>

          <section>
            <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)] mb-2">
              Examples
            </div>
            <ul className="space-y-1 font-mono text-[0.8rem] text-[var(--ledger-ink-2)]">
              <li>Customer name → [customer]</li>
              <li>Account number → [account identifier removed]</li>
              <li>Loan file → [loan file, no borrower details]</li>
              <li>Complaint → [anonymized service scenario]</li>
              <li>Dollar amount tied to a real account → [generalized amount or remove]</li>
            </ul>
          </section>

          <section className="grid sm:grid-cols-3 gap-4">
            <div>
              <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-accent-2)] mb-1.5">
                Allowed
              </div>
              <ul className="space-y-1 font-serif text-[0.85rem] text-[var(--ledger-ink-2)]">
                <li>Public information</li>
                <li>Made-up examples</li>
                <li>Training examples</li>
                <li>Fully anonymized situations</li>
              </ul>
            </div>
            <div>
              <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-accent)] mb-1.5">
                Needs Review
              </div>
              <ul className="space-y-1 font-serif text-[0.85rem] text-[var(--ledger-ink-2)]">
                <li>Internal reports</li>
                <li>Meeting notes</li>
                <li>Internal procedures</li>
                <li>Redacted sensitive narratives</li>
                <li>Anything confidential even without customer names</li>
              </ul>
            </div>
            <div>
              <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-weak)] mb-1.5">
                Keep Out
              </div>
              <ul className="space-y-1 font-serif text-[0.85rem] text-[var(--ledger-ink-2)]">
                <li>Names tied to accounts</li>
                <li>Account numbers</li>
                <li>Card numbers</li>
                <li>SSNs / tax IDs</li>
                <li>Customer financials</li>
                <li>Confidential non-public bank information</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)] mb-2">
              Off-limits in your world · {trackLabel}
            </div>
            <ul className="space-y-1 font-serif text-[0.95rem] text-[var(--ledger-ink-2)]">
              {trackOffLimits.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[var(--ledger-weak)] shrink-0" aria-hidden>×</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[4px] bg-[var(--ledger-tape)] border border-[var(--ledger-rule)] px-4 py-3">
            <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)] mb-1">
              When in doubt
            </div>
            <p className="font-serif text-[0.95rem] leading-snug text-[var(--ledger-ink)]">
              Redact more, use approved tools, or ask your manager / compliance team.
            </p>
          </section>
        </div>

        <footer className="px-6 sm:px-8 py-3 border-t border-[var(--ledger-rule)] bg-[var(--ledger-parch)] flex items-baseline justify-between">
          <span className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)]">
            AiBI Foundation · M0.2 takeaway
          </span>
          <span className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)]">
            v1
          </span>
        </footer>
      </article>

      {/* Save action — the artifact is the value; saving is the side effect */}
      <div className="flex items-center justify-between gap-3">
        <p className="font-serif text-[0.95rem] text-[var(--ledger-muted)] max-w-[40ch]">
          {saved
            ? "Saved to your Toolbox. You can open it from any lesson, print it, or paste it into your team's runbook."
            : "Save this card to your Toolbox. It's the first habit in your kit — printable, copyable, available from any lesson."}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || saved}
          className={
            'shrink-0 px-5 py-2.5 rounded-[2px] font-mono uppercase tracking-[0.16em] text-[0.7rem] transition-colors duration-[120ms] ' +
            (saved
              ? 'bg-[color-mix(in_srgb,var(--ledger-ink)_8%,var(--ledger-paper))] text-[var(--ledger-muted)] cursor-default'
              : 'bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)]')
          }
        >
          {saving ? 'Saving…' : saved ? '✓ Saved to Toolbox' : 'Save to Toolbox'}
        </button>
      </div>
    </div>
  );
}
