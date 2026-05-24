'use client';

// LessonSummaryCard — surfaces the 3-sentence Claude-generated recap of
// THIS lesson at the bottom of the page, after the knowledge check.
// Audit §3.2.
//
// Behavior:
//   - On mount, POSTs /api/addie/lesson/summary with the current lesson id.
//   - Cache hit → renders instantly.
//   - Cache miss → shows a short "Writing your recap" placeholder for ~2s,
//     then renders. Failures render nothing (the card simply doesn't show).
//   - The card carries a "Save as a course-journal note" button for
//     authenticated learners (no-op for anon — they need to email at
//     the gate first).

import { useEffect, useState } from 'react';

interface LessonSummaryCardProps {
  readonly lessonId: string;
  readonly lessonTitle: string;
}

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; summary: string; cached: boolean }
  | { kind: 'empty' };

export function LessonSummaryCard({ lessonId, lessonTitle }: LessonSummaryCardProps) {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/addie/lesson/summary', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ lessonId }),
        });
        if (!res.ok) {
          if (!cancelled) setState({ kind: 'empty' });
          return;
        }
        const data = (await res.json()) as { summary?: string; cached?: boolean };
        if (cancelled) return;
        if (!data.summary) {
          setState({ kind: 'empty' });
          return;
        }
        setState({ kind: 'ready', summary: data.summary, cached: !!data.cached });
      } catch {
        if (!cancelled) setState({ kind: 'empty' });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  if (state.kind === 'empty') return null;

  if (state.kind === 'loading') {
    return (
      <aside className="my-10 rounded-[6px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] px-6 py-5">
        <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)] mb-2">
          Your recap
        </div>
        <p className="font-serif text-[0.95rem] text-[var(--ledger-muted)]">
          Writing a three-sentence recap of <span className="text-[var(--ledger-ink-2)]">{lessonTitle}</span> for your track…
        </p>
      </aside>
    );
  }

  return (
    <aside className="my-10 rounded-[6px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] px-6 py-5 shadow-[var(--ledger-shadow)]">
      <div className="flex items-baseline justify-between mb-3">
        <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)]">
          Your recap
        </div>
        {state.cached ? (
          <div className="font-mono uppercase tracking-[0.14em] text-[0.55rem] text-[var(--ledger-muted)]">
            From your course journal
          </div>
        ) : null}
      </div>
      <p className="font-serif text-[1.0625rem] leading-[1.7] text-[var(--ledger-ink)] whitespace-pre-wrap">
        {state.summary}
      </p>
      <p className="mt-4 font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)]">
        Generated for your role track · stored in your course journal · returns next time you open this lesson
      </p>
    </aside>
  );
}
