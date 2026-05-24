'use client';

// AnonymizationFlow — Screen 2 of the m0.2 redesign. The hero visual
// the user called for: "Real details → strip → safe version → ask AI →
// useful help." Three panels, animated reveal, tap each sensitive
// detail to strip it.
//
// This is the visual that ought to live across the course. It's the one
// move the learner takes home from M0.

import { useCallback, useMemo, useState } from 'react';

interface Token {
  /** Display text */
  text: string;
  /** When true, this token is sensitive; clicking it strips it. */
  sensitive: boolean;
  /** Replacement text when stripped (e.g. "Maria Lopez" -> "[customer]") */
  replacement: string;
}

const DEFAULT_TOKENS: Token[] = [
  { text: 'Maria Lopez', sensitive: true, replacement: '[customer]' },
  { text: 'at account ending', sensitive: false, replacement: '' },
  { text: '4421', sensitive: true, replacement: '[account]' },
  { text: 'is upset about a $35 overdraft fee from last Tuesday', sensitive: false, replacement: '' },
];

export function AnonymizationFlow() {
  const [stripped, setStripped] = useState<ReadonlySet<number>>(new Set());
  const sensitiveCount = useMemo(() => DEFAULT_TOKENS.filter((t) => t.sensitive).length, []);
  const remaining = useMemo(
    () => DEFAULT_TOKENS.filter((t, i) => t.sensitive && !stripped.has(i)).length,
    [stripped],
  );
  const allStripped = remaining === 0;

  const toggle = useCallback((i: number) => {
    setStripped((prev) => {
      if (!DEFAULT_TOKENS[i].sensitive) return prev;
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const reset = useCallback(() => setStripped(new Set()), []);

  const safePrompt = useMemo(() => {
    return DEFAULT_TOKENS.map((t, i) => {
      if (t.sensitive && stripped.has(i)) return t.replacement;
      return t.text;
    })
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, [stripped]);

  return (
    <div className="grid gap-4">
      {/* Panel 1 — Real data, with strippable tokens */}
      <article className={`rounded-[5px] border ${allStripped ? 'border-[var(--ledger-rule)]' : 'border-[var(--ledger-weak)]'} bg-[var(--ledger-paper)] px-6 py-5 transition-colors duration-[200ms]`}>
        <header className="flex items-baseline justify-between mb-3">
          <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-weak)]">
            Step 1 · Real details
          </div>
          <div className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)] tabular-nums">
            {remaining} of {sensitiveCount} sensitive details remaining
          </div>
        </header>
        <p className="font-serif text-[1.0625rem] leading-[1.7] text-[var(--ledger-ink)]">
          {DEFAULT_TOKENS.map((t, i) => {
            const isStripped = stripped.has(i);
            if (!t.sensitive) {
              return <span key={i}>{i === 0 ? '' : ' '}{t.text}</span>;
            }
            return (
              <span key={i}>
                {i === 0 ? '' : ' '}
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className={
                    'px-1.5 py-0.5 rounded-[2px] font-mono text-[0.95em] transition-colors duration-[120ms] ' +
                    (isStripped
                      ? 'bg-[color-mix(in_srgb,var(--ledger-ink)_8%,var(--ledger-paper))] text-[var(--ledger-muted)] line-through'
                      : 'bg-[color-mix(in_srgb,var(--ledger-weak)_18%,var(--ledger-paper))] text-[var(--ledger-weak)] hover:bg-[color-mix(in_srgb,var(--ledger-weak)_28%,var(--ledger-paper))] cursor-pointer underline decoration-dotted underline-offset-4')
                  }
                  aria-label={isStripped ? `${t.text} — stripped` : `Strip ${t.text}`}
                  aria-pressed={isStripped}
                >
                  {t.text}
                </button>
              </span>
            );
          })}
        </p>
        <p className="mt-3 font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)]">
          {allStripped ? '✓ all sensitive details stripped' : 'Click each highlighted detail to strip it'}
        </p>
      </article>

      {/* Arrow */}
      <div className="flex justify-center" aria-hidden="true">
        <div className={`font-mono text-[0.7rem] tracking-[0.16em] uppercase ${allStripped ? 'text-[var(--ledger-accent)]' : 'text-[var(--ledger-muted)]'} transition-colors duration-[200ms]`}>
          ↓ {allStripped ? 'safe' : 'strip + generalize'}
        </div>
      </div>

      {/* Panel 2 — Safe version (live reflects strippings) */}
      <article className={`rounded-[5px] border ${allStripped ? 'border-[var(--ledger-ink)]' : 'border-[var(--ledger-rule)]'} bg-[var(--ledger-paper)] px-6 py-5 transition-colors duration-[200ms]`}>
        <header className="flex items-baseline justify-between mb-3">
          <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-ink)]">
            Step 2 · Safe version
          </div>
          {allStripped ? (
            <div className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-accent)]">
              ↓ ready to send
            </div>
          ) : null}
        </header>
        <p className="font-serif text-[1.0625rem] leading-[1.7] text-[var(--ledger-ink)]">
          {safePrompt || <span className="text-[var(--ledger-muted)]">Strip the details above to see the safe version</span>}
        </p>
      </article>

      {/* Arrow */}
      <div className="flex justify-center" aria-hidden="true">
        <div className={`font-mono text-[0.7rem] tracking-[0.16em] uppercase ${allStripped ? 'text-[var(--ledger-accent)]' : 'text-[var(--ledger-muted)]'} transition-colors duration-[200ms]`}>
          ↓ ask AI
        </div>
      </div>

      {/* Panel 3 — Useful help (synthetic preview) */}
      <article className={`rounded-[5px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] px-6 py-5 ${allStripped ? '' : 'opacity-60'} transition-opacity duration-[200ms]`}>
        <header className="flex items-baseline justify-between mb-3">
          <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)]">
            Step 3 · Useful help
          </div>
          <div className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)]">
            Example AI response
          </div>
        </header>
        <p className="font-serif text-[1rem] leading-[1.65] text-[var(--ledger-ink-2)]">
          Draft a calm, empathetic reply that acknowledges the customer&apos;s frustration, briefly explains how overdraft fees work at the institution level, and offers two concrete next steps — a fee-review request and a call with a branch banker. Keep it under 120 words, friendly but professional. End with a clear way to escalate if the customer is still unsatisfied.
        </p>
      </article>

      {!allStripped ? (
        <button
          type="button"
          onClick={() => setStripped(new Set(DEFAULT_TOKENS.map((_, i) => i).filter((i) => DEFAULT_TOKENS[i].sensitive)))}
          className="self-start font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)] mt-1"
        >
          Strip all
        </button>
      ) : (
        <button
          type="button"
          onClick={reset}
          className="self-start font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)] mt-1"
        >
          Reset
        </button>
      )}
    </div>
  );
}
