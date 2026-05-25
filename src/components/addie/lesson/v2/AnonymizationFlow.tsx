'use client';

// AnonymizationFlow — Screen 2 of the m0.2 redesign. The "core move"
// drill the entire PRD pivots on: tap each sensitive detail to strip
// it, then watch the safe situation + safe prompt reveal.
//
// PRD §10 Screen 2 contract:
//   - 4 sensitive tokens (Maria Lopez, account ending 4421, $128, Friday timing)
//   - Per-tap feedback ("Correct — real names stay out." etc.)
//   - "Safe situation" + copyable "Safe prompt" panels reveal once all
//     four are stripped
//   - "Same work. Safer input." closing line
//
// This is the visual that ought to live across the course. It is the one
// move the learner takes home from M0.

import { useCallback, useMemo, useState } from 'react';

interface Token {
  /** Display text */
  readonly text: string;
  /** When true, this token is sensitive; clicking it strips it. */
  readonly sensitive: boolean;
  /** Replacement text when stripped (e.g. "Maria Lopez" -> "[customer]") */
  readonly replacement: string;
  /** Feedback shown when the learner taps this token. */
  readonly feedback?: string;
}

const DEFAULT_TOKENS: ReadonlyArray<Token> = [
  { text: 'Maria Lopez', sensitive: true, replacement: '[customer]', feedback: 'Correct — real names stay out.' },
  { text: ', ', sensitive: false, replacement: '' },
  { text: 'account ending 4421', sensitive: true, replacement: '[account identifier removed]', feedback: 'Correct — account identifiers stay out.' },
  { text: ', called about a ', sensitive: false, replacement: '' },
  { text: '$128', sensitive: true, replacement: '[amount]', feedback: 'Correct — dollar amounts tied to a real account stay out.' },
  { text: ' overdraft fee and ', sensitive: false, replacement: '' },
  { text: 'wants a response by Friday', sensitive: true, replacement: '[needs a response]', feedback: 'Generalize the timing. Describe the situation, not the specific commitment.' },
  { text: '.', sensitive: false, replacement: '' },
];

const SAFE_SITUATION = 'A customer is upset about a fee and needs a clear, empathetic response.';
const SAFE_PROMPT = 'Draft a short, professional response to a customer who is upset about a fee. Do not include names, account numbers, or account-specific details.';

export function AnonymizationFlow() {
  const [stripped, setStripped] = useState<ReadonlySet<number>>(new Set());
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sensitiveCount = useMemo(
    () => DEFAULT_TOKENS.filter((t) => t.sensitive).length,
    [],
  );
  const remaining = useMemo(
    () => DEFAULT_TOKENS.filter((t, i) => t.sensitive && !stripped.has(i)).length,
    [stripped],
  );
  const allStripped = remaining === 0;

  const toggle = useCallback((i: number) => {
    const tok = DEFAULT_TOKENS[i];
    if (!tok.sensitive) return;
    setStripped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
        setLastFeedback(null);
      } else {
        next.add(i);
        setLastFeedback(tok.feedback ?? null);
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setStripped(new Set());
    setLastFeedback(null);
    setCopied(false);
  }, []);

  const stripAll = useCallback(() => {
    const sensitiveIndices = DEFAULT_TOKENS.map((t, i) => (t.sensitive ? i : -1)).filter(
      (i) => i >= 0,
    );
    setStripped(new Set(sensitiveIndices));
    setLastFeedback(null);
  }, []);

  const copySafePrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SAFE_PROMPT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable; silent */
    }
  }, []);

  // The displayed risky text (with strikes on stripped tokens).
  const renderedRisky = (
    <p className="font-serif text-[1.0625rem] leading-[1.7] text-[var(--ledger-ink)]">
      {DEFAULT_TOKENS.map((t, i) => {
        const isStripped = stripped.has(i);
        if (!t.sensitive) return <span key={i}>{t.text}</span>;
        return (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={
              'px-1.5 py-0.5 rounded-[2px] font-mono text-[0.95em] transition-colors duration-[120ms] ' +
              (isStripped
                ? 'bg-[color-mix(in_srgb,var(--ledger-ink)_8%,var(--ledger-paper))] text-[var(--ledger-muted)] line-through'
                : 'bg-[color-mix(in_srgb,var(--ledger-weak)_18%,var(--ledger-paper))] text-[var(--ledger-weak)] hover:bg-[color-mix(in_srgb,var(--ledger-weak)_28%,var(--ledger-paper))] cursor-pointer underline decoration-dotted underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[var(--ledger-accent)] focus:ring-offset-2')
            }
            aria-label={isStripped ? `${t.text} — stripped` : `Strip ${t.text}`}
            aria-pressed={isStripped}
          >
            {t.text}
          </button>
        );
      })}
    </p>
  );

  return (
    <div className="grid gap-4">
      {/* Panel 1 — Risky synthetic example with strippable tokens */}
      <article
        className={
          'rounded-[3px] border bg-[var(--ledger-paper)] px-6 py-5 transition-colors duration-[200ms] ' +
          (allStripped ? 'border-[var(--ledger-rule)]' : 'border-[var(--ledger-weak)]')
        }
      >
        <header className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
          <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-weak)]">
            Synthetic training example · no real customer data
          </div>
          <div className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)] tabular-nums">
            {remaining} of {sensitiveCount} sensitive details remaining
          </div>
        </header>
        {renderedRisky}
        <p className="mt-3 font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)]">
          {allStripped
            ? '✓ all sensitive details stripped'
            : 'Tap anything that should not go into public AI'}
        </p>
        {lastFeedback ? (
          <p
            className="mt-2 text-sm text-[var(--ledger-ink-2)]"
            role="status"
            aria-live="polite"
          >
            {lastFeedback}
          </p>
        ) : null}
      </article>

      {/* Arrow */}
      <div className="flex justify-center" aria-hidden="true">
        <div
          className={
            'font-mono text-[0.7rem] tracking-[0.16em] uppercase transition-colors duration-[200ms] ' +
            (allStripped ? 'text-[var(--ledger-accent)]' : 'text-[var(--ledger-muted)]')
          }
        >
          ↓ {allStripped ? 'safe situation' : 'strip + generalize'}
        </div>
      </div>

      {/* Panel 2 — Safe situation (reveals after all stripped) */}
      <article
        className={
          'rounded-[3px] border bg-[var(--ledger-paper)] px-6 py-5 transition-colors duration-[200ms] ' +
          (allStripped ? 'border-[var(--ledger-ink)]' : 'border-[var(--ledger-rule)] opacity-60')
        }
      >
        <header className="flex items-baseline justify-between mb-3">
          <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-ink)]">
            Safe situation
          </div>
        </header>
        <p className="font-serif text-[1.0625rem] leading-[1.7] text-[var(--ledger-ink)]">
          {allStripped ? (
            SAFE_SITUATION
          ) : (
            <span className="text-[var(--ledger-muted)]">
              Strip the details above to see the safe version.
            </span>
          )}
        </p>
      </article>

      {/* Arrow */}
      <div className="flex justify-center" aria-hidden="true">
        <div
          className={
            'font-mono text-[0.7rem] tracking-[0.16em] uppercase transition-colors duration-[200ms] ' +
            (allStripped ? 'text-[var(--ledger-accent)]' : 'text-[var(--ledger-muted)]')
          }
        >
          ↓ safe prompt
        </div>
      </div>

      {/* Panel 3 — Safe prompt (copyable, revealed once everything stripped) */}
      <article
        className={
          'rounded-[3px] border bg-[var(--ledger-paper)] px-6 py-5 transition-opacity duration-[200ms] ' +
          (allStripped ? 'border-[var(--ledger-ink)]' : 'border-[var(--ledger-rule)] opacity-50')
        }
      >
        <header className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
          <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)]">
            Safe prompt
          </div>
          {allStripped ? (
            <button
              type="button"
              onClick={copySafePrompt}
              className={
                'font-mono uppercase tracking-[0.14em] text-[0.6rem] px-3 py-1.5 rounded-[2px] transition-colors duration-[120ms] ' +
                (copied
                  ? 'bg-[var(--ledger-ink)] text-[var(--ledger-paper)]'
                  : 'border border-[var(--ledger-ink)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--ledger-accent)] focus:ring-offset-1')
              }
              aria-label="Copy the safe prompt"
            >
              {copied ? '✓ Copied' : 'Copy prompt'}
            </button>
          ) : null}
        </header>
        <p className="font-serif text-[1rem] leading-[1.65] text-[var(--ledger-ink-2)]">
          {allStripped ? (
            SAFE_PROMPT
          ) : (
            <span className="text-[var(--ledger-muted)]">
              The safe prompt appears once every sensitive detail is stripped.
            </span>
          )}
        </p>
        {allStripped ? (
          <p className="mt-4 font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)]">
            Same work. Safer input.
          </p>
        ) : null}
      </article>

      <div className="flex items-center gap-3 mt-1">
        {!allStripped ? (
          <button
            type="button"
            onClick={stripAll}
            className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
          >
            Strip all
          </button>
        ) : (
          <button
            type="button"
            onClick={reset}
            className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
