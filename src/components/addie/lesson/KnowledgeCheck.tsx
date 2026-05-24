'use client';

// KnowledgeCheck — 2-3 items per lesson, inline at lesson end.
// Selection commits immediately, feedback inline. Server is authoritative
// on correctness (POST /api/addie/checks/respond).

import { useState } from 'react';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import type { KnowledgeCheckRow } from './types';

interface KnowledgeCheckProps {
  readonly checks: ReadonlyArray<KnowledgeCheckRow>;
}

interface Verdict {
  correct: boolean;
  explanation: string | null;
  correct_option_id: string;
  selected: string;
}

export function KnowledgeCheck({ checks }: KnowledgeCheckProps) {
  if (checks.length === 0) return null;
  // Audit A13 (2026-05-24): split orientation items out into a separate
  // group below the construct checks. Construct items are the scored
  // mastery signal; orientation items are UI / policy housekeeping that
  // happen to be in MC form. Keeping them visually distinct preserves
  // the mastery validity Pair 3 (Lena) flagged.
  const constructs = checks.filter((c) => c.kind !== 'orientation');
  const orientation = checks.filter((c) => c.kind === 'orientation');
  return (
    <section className="mt-10">
      {constructs.length > 0 ? (
        <>
          <KickerLabel tone="muted">Check</KickerLabel>
          <h2 className="font-serif text-2xl text-[var(--ledger-ink)] mt-1 mb-4">
            A quick check
          </h2>
          <div className="grid gap-4">
            {constructs.map((c) => (
              <KnowledgeCheckItem key={c.id} item={c} />
            ))}
          </div>
        </>
      ) : null}
      {orientation.length > 0 ? (
        <div className={constructs.length > 0 ? 'mt-10 pt-6 border-t border-[var(--ledger-rule)]' : ''}>
          <KickerLabel tone="muted">Housekeeping</KickerLabel>
          <h3 className="font-serif text-xl text-[var(--ledger-ink)] mt-1 mb-2">
            Course-mechanics check
          </h3>
          <p className="text-sm text-[var(--ledger-muted)] mb-4 max-w-prose">
            These are about how the course works, not about today&apos;s lesson.
            They are not scored against your mastery.
          </p>
          <div className="grid gap-4">
            {orientation.map((c) => (
              <KnowledgeCheckItem key={c.id} item={c} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function KnowledgeCheckItem({ item }: { item: KnowledgeCheckRow }) {
  const [pending, setPending] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(optionId: string) {
    if (verdict || pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/addie/checks/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ check_id: item.id, selected_option: optionId }),
      });
      if (!res.ok) {
        setError(`HTTP ${res.status}`);
        return;
      }
      const data = (await res.json()) as Omit<Verdict, 'selected'>;
      setVerdict({ ...data, selected: optionId });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown');
    } finally {
      setPending(false);
    }
  }

  const kcState = verdict ? (verdict.correct ? 'correct' : 'wrong') : undefined;

  return (
    <LedgerCard className="p-5" data-kc-state={kcState}>
      <p className="font-serif text-lg text-[var(--ledger-ink)] mb-3">{item.prompt}</p>
      <div role="radiogroup" aria-label="Choose one" className="grid gap-2">
        {item.options.map((opt) => {
          const picked = verdict?.selected === opt.id;
          const isCorrect = verdict && opt.id === verdict.correct_option_id;
          const showRight = verdict && isCorrect;
          const showWrong = verdict && picked && !isCorrect;
          const cls = showRight
            ? 'border-[var(--ledger-accent)] bg-[color-mix(in_srgb,var(--ledger-accent)_8%,var(--ledger-paper))]'
            : showWrong
              ? 'border-[var(--ledger-weak)] bg-[var(--ledger-paper)]'
              : 'border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] hover:border-[var(--ledger-ink)]';
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={picked || false}
              disabled={pending || !!verdict}
              onClick={() => pick(opt.id)}
              className={`text-left border rounded-[2px] px-3 py-2 transition-colors duration-[120ms] ${cls} disabled:cursor-default`}
            >
              <span className="text-[var(--ledger-ink)]">{opt.label}</span>
              {showRight ? (
                <span className="ml-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ledger-accent)]">
                  ✓ Correct
                </span>
              ) : null}
              {showWrong ? (
                <span className="ml-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ledger-weak)]">
                  Not quite
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {verdict?.explanation ? (
        <p className="mt-3 text-sm text-[var(--ledger-ink-2)] border-l-2 border-[var(--ledger-accent)] pl-3">
          {verdict.explanation}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-[var(--ledger-weak)]">
          {error}
        </p>
      ) : null}
    </LedgerCard>
  );
}
