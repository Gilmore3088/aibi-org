'use client';

// OffLimitsSorter — Module 0, Lesson 2 interactive.
// Learner sorts realistic banking items into Off-limits / Allowed /
// Needs review, with immediate feedback per item. Track-aware: only
// items tagged 'all' or the learner's track are surfaced.

import { useCallback, useMemo, useState } from 'react';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import type { Track } from '@/components/addie/lesson/types';

export type OffLimitsCategory = 'off_limits' | 'allowed' | 'depends_on_review';

export interface SortableItem {
  readonly id: string;
  readonly label: string;
  readonly category: OffLimitsCategory;
  readonly track: Track | 'all';
}

interface PresetContextBlock {
  readonly id: string;
  readonly label: string;
  readonly body?: string;
}

interface ExerciseDescriptor {
  readonly id: string;
  readonly preset_context_blocks?: ReadonlyArray<PresetContextBlock>;
}

export interface OffLimitsSorterProps {
  readonly exerciseDescriptor: ExerciseDescriptor;
  readonly track: Track | null;
  readonly onComplete?: (score: { correct: number; total: number }) => void;
}

interface CategoryDef {
  readonly id: OffLimitsCategory;
  readonly label: string;
}

const CATEGORIES: ReadonlyArray<CategoryDef> = [
  { id: 'off_limits', label: 'Off-limits' },
  { id: 'allowed', label: 'Allowed' },
  { id: 'depends_on_review', label: 'Needs review' },
];

function parseItems(descriptor: ExerciseDescriptor): ReadonlyArray<SortableItem> {
  const block = descriptor.preset_context_blocks?.find((b) => b.id === 'items');
  const raw = block?.body;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSortableItem);
  } catch {
    return [];
  }
}

function isSortableItem(value: unknown): value is SortableItem {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.label === 'string' &&
    (v.category === 'off_limits' ||
      v.category === 'allowed' ||
      v.category === 'depends_on_review') &&
    typeof v.track === 'string'
  );
}

interface FeedbackState {
  readonly itemId: string;
  readonly chosen: OffLimitsCategory;
  readonly correct: boolean;
}

const CATEGORY_LABELS: Record<OffLimitsCategory, string> = {
  off_limits: 'Off-limits',
  allowed: 'Allowed',
  depends_on_review: 'Needs review',
};

export function OffLimitsSorter({
  exerciseDescriptor,
  track,
  onComplete,
}: OffLimitsSorterProps) {
  const allItems = useMemo(() => parseItems(exerciseDescriptor), [exerciseDescriptor]);

  const items = useMemo(
    () =>
      allItems.filter((it) => it.track === 'all' || (track !== null && it.track === track)),
    [allItems, track],
  );

  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [focusedCategory, setFocusedCategory] = useState<number>(0);
  const [done, setDone] = useState(false);

  const current = items[index];

  const advance = useCallback(() => {
    setFeedback(null);
    if (index + 1 >= items.length) {
      setDone(true);
      onComplete?.(score);
      return;
    }
    setIndex((i) => i + 1);
    setFocusedCategory(0);
  }, [index, items.length, onComplete, score]);

  const submit = useCallback(
    (chosen: OffLimitsCategory) => {
      if (!current || feedback) return;
      const correct = chosen === current.category;
      const nextScore = {
        correct: score.correct + (correct ? 1 : 0),
        total: score.total + 1,
      };
      setScore(nextScore);
      setFeedback({ itemId: current.id, chosen, correct });
    },
    [current, feedback, score],
  );

  if (items.length === 0) {
    return (
      <LedgerCard variant="recessed" className="p-5">
        <p className="text-sm text-[var(--ledger-muted)]">
          No items available for this track yet.
        </p>
      </LedgerCard>
    );
  }

  if (done || !current) {
    return (
      <LedgerCard variant="feature" className="p-6">
        <KickerLabel tone="accent">Complete</KickerLabel>
        <h3 className="mt-2 font-serif text-2xl text-[var(--ledger-ink)]">
          You sorted {score.total} items.
        </h3>
        <p className="mt-2 text-[var(--ledger-ink-2)]">
          {score.correct} of {score.total} correct. The pattern matters more than
          the score: describe the situation, not the person.
        </p>
      </LedgerCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <KickerLabel tone="muted">
          Item {index + 1} of {items.length}
        </KickerLabel>
        <span className="font-mono text-xs text-[var(--ledger-muted)] tabular-nums">
          {score.correct}/{score.total}
        </span>
      </div>

      <LedgerCard variant="standard" className="p-5">
        <p className="font-serif text-lg text-[var(--ledger-ink)]">{current.label}</p>
      </LedgerCard>

      <div
        role="radiogroup"
        aria-label="Choose a category"
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        onKeyDown={(e) => {
          if (feedback) return;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedCategory((c) => (c + 1) % CATEGORIES.length);
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedCategory((c) => (c - 1 + CATEGORIES.length) % CATEGORIES.length);
          } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const c = CATEGORIES[focusedCategory];
            if (c) submit(c.id);
          }
        }}
      >
        {CATEGORIES.map((cat, i) => {
          const isFocused = focusedCategory === i;
          const chosen = feedback?.chosen === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="radio"
              aria-checked={chosen ?? false}
              tabIndex={isFocused ? 0 : -1}
              disabled={feedback !== null}
              onClick={() => submit(cat.id)}
              onFocus={() => setFocusedCategory(i)}
              className={
                'rounded-[2px] border px-4 py-3 ' +
                'font-mono text-xs uppercase tracking-[0.18em] ' +
                'transition-colors duration-[120ms] ' +
                // A12 rework (Wave D critique 2026-05-24): button resting
                // border was --ledger-rule (~1.4:1) — fails 1.4.11. Swap
                // resting + hover to --ledger-rule-strong / --ledger-ink.
                'border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] ' +
                'text-[var(--ledger-ink)] ' +
                'hover:border-[var(--ledger-ink)] ' +
                'focus:outline-none focus:ring-2 focus:ring-[var(--ledger-accent)] focus:ring-offset-2 ' +
                'disabled:cursor-not-allowed disabled:opacity-70'
              }
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {feedback ? (
        <LedgerCard
          variant={feedback.correct ? 'tape' : 'standard'}
          className="p-4"
          aria-live="polite"
        >
          <p
            className="font-mono text-xs uppercase tracking-[0.18em]"
            style={{
              color: feedback.correct
                ? 'var(--ledger-ink)'
                : 'var(--ledger-weak)',
            }}
          >
            {feedback.correct ? 'Correct' : 'Incorrect'}
          </p>
          <p className="mt-2 text-sm text-[var(--ledger-ink-2)]">
            You picked {CATEGORY_LABELS[feedback.chosen]}. The right answer is{' '}
            {CATEGORY_LABELS[current.category]}.
          </p>
          <button
            type="button"
            onClick={advance}
            className={
              'mt-3 rounded-[2px] border border-[var(--ledger-ink)] ' +
              'bg-[var(--ledger-ink)] px-4 py-2 ' +
              'font-mono text-xs uppercase tracking-[0.18em] text-[var(--ledger-paper)] ' +
              'transition-colors duration-[120ms] hover:bg-[var(--ledger-ink-2)] ' +
              'focus:outline-none focus:ring-2 focus:ring-[var(--ledger-accent)] focus:ring-offset-2'
            }
          >
            {index + 1 >= items.length ? 'Finish' : 'Next item'}
          </button>
        </LedgerCard>
      ) : null}
    </div>
  );
}
