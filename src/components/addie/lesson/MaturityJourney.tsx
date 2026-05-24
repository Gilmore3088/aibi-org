'use client';

// MaturityJourney — the persistent 5-stage transformation arc.
//
// Vision doc: AiBI_Transformation_Vision.md. The states ARE the curriculum;
// the modules are the substrate. Every lesson page surfaces this so the
// learner always knows which state they're in and what the next state
// requires.
//
// State derivation is intentionally simple v1: it reads the learner's
// progress (lessons completed + artifacts saved) from /api/addie/maturity
// — falls back to "Aware" when no signal exists. Future: pull weekly-
// return streak, team-rollup roles, etc.

import { useEffect, useState } from 'react';

type Stage = 'aware' | 'experimenting' | 'operationalizing' | 'leading';

interface MaturitySnapshot {
  readonly stage: Stage;
  readonly lessonsCompleted: number;
  readonly artifactsSaved: number;
}

const STAGES: ReadonlyArray<{ key: Stage; label: string; verb: string; require: string }> = [
  { key: 'aware',             label: 'Aware',            verb: 'You can name what gen AI is and what the line is.',     require: 'Module 0 complete' },
  { key: 'experimenting',     label: 'Experimenting',    verb: 'You can use AI safely, every day, on real work.',        require: 'Modules 1–3 complete + 3 saves' },
  { key: 'operationalizing',  label: 'Operationalizing', verb: 'You built reusable skills your team can rely on.',       require: 'Module 4 complete + a working Skill saved' },
  { key: 'leading',           label: 'Leading',          verb: 'You ship prototypes that change how your team works.',   require: 'Module 5 complete + a Prototype saved' },
];

interface MaturityJourneyProps {
  /** Render style — full bar in dashboard contexts, compact strip everywhere else. */
  readonly variant?: 'compact' | 'full';
}

// SVG marks replace the ✓ ◉ ○ Unicode glyphs. Brand voice bans emoji-as-
// decoration; these are inline SVGs sized 10×10 that read as ledger marks.
function StageMark({ state }: { state: 'done' | 'current' | 'upcoming' }) {
  if (state === 'done') {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="text-[var(--ledger-ink-2)] shrink-0">
        <path d="M2 5l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (state === 'current') {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="text-[var(--ledger-accent)] shrink-0">
        <circle cx="5" cy="5" r="3.5" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="text-[var(--ledger-rule-strong)] shrink-0">
      <circle cx="5" cy="5" r="3.5" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function deriveStage(lessonsCompleted: number, artifactsSaved: number): Stage {
  if (lessonsCompleted >= 22 && artifactsSaved >= 6) return 'leading';
  if (lessonsCompleted >= 14 && artifactsSaved >= 4) return 'operationalizing';
  if (lessonsCompleted >= 2 && artifactsSaved >= 1) return 'experimenting';
  return 'aware';
}

export function MaturityJourney({ variant = 'compact' }: MaturityJourneyProps) {
  const [snap, setSnap] = useState<MaturitySnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/addie/maturity', { cache: 'no-store' });
        if (!res.ok) {
          if (!cancelled) setSnap({ stage: 'aware', lessonsCompleted: 0, artifactsSaved: 0 });
          return;
        }
        const data = (await res.json()) as { lessonsCompleted?: number; artifactsSaved?: number };
        const lc = data.lessonsCompleted ?? 0;
        const as = data.artifactsSaved ?? 0;
        if (!cancelled) setSnap({ stage: deriveStage(lc, as), lessonsCompleted: lc, artifactsSaved: as });
      } catch {
        if (!cancelled) setSnap({ stage: 'aware', lessonsCompleted: 0, artifactsSaved: 0 });
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (!snap) {
    // Render an inert skeleton so the lesson layout doesn't jitter.
    return <div className={variant === 'full' ? 'h-20' : 'h-9'} aria-hidden="true" />;
  }

  const currentIdx = STAGES.findIndex((s) => s.key === snap.stage);

  if (variant === 'compact') {
    return (
      <div
        className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)] py-2 px-3 sm:px-4 border-b border-[var(--ledger-rule)] bg-[var(--ledger-paper)]"
        aria-label={`Your progress: ${STAGES[currentIdx].label} stage`}
      >
        <div className="max-w-[1800px] mx-auto flex items-center gap-2 flex-wrap">
          <span className="text-[var(--ledger-accent)] font-semibold">Your progress</span>
          <span className="text-[var(--ledger-rule-strong)]" aria-hidden="true">·</span>
          {STAGES.map((s, i) => {
            const isCurrent = i === currentIdx;
            const isDone = i < currentIdx;
            return (
              <span key={s.key} className="flex items-center gap-1.5">
                {i > 0 ? (
                  <svg
                    width="10"
                    height="8"
                    viewBox="0 0 10 8"
                    aria-hidden="true"
                    className="text-[var(--ledger-rule-strong)] shrink-0"
                  >
                    <path d="M0 4h8M6 1l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1" />
                  </svg>
                ) : null}
                <StageMark state={isDone ? 'done' : isCurrent ? 'current' : 'upcoming'} />
                <span
                  className={
                    'tabular-nums ' +
                    (isCurrent
                      ? 'text-[var(--ledger-ink)] font-semibold border-b border-[var(--ledger-accent)] pb-px'
                      : isDone
                        ? 'text-[var(--ledger-ink-2)]'
                        : 'text-[var(--ledger-muted)]')
                  }
                >
                  {s.label}
                </span>
              </span>
            );
          })}
          <span aria-hidden="true" className="ml-auto text-[var(--ledger-muted)] tabular-nums">
            {snap.lessonsCompleted} lessons · {snap.artifactsSaved} artifacts
          </span>
        </div>
      </div>
    );
  }

  // Full variant — used on /dashboard and /foundation home
  return (
    <section
      className="rounded-[4px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] px-6 py-5"
      aria-label="Your progress"
    >
      <header className="flex items-baseline justify-between mb-4 gap-4">
        <div>
          <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)] mb-1">
            Your progress
          </div>
          <h3 className="font-serif text-xl text-[var(--ledger-ink)]">
            You are <span className="text-[var(--ledger-accent)]">{STAGES[currentIdx].label.toLowerCase()}</span> with AI.
          </h3>
          <p className="font-serif text-[0.95rem] text-[var(--ledger-ink-2)] mt-1">
            {STAGES[currentIdx].verb}
          </p>
        </div>
        <div className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)] tabular-nums text-right shrink-0">
          {snap.lessonsCompleted} lessons<br />
          {snap.artifactsSaved} artifacts
        </div>
      </header>
      <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${STAGES.length}, minmax(0, 1fr))` }}>
        {STAGES.map((s, i) => {
          const isCurrent = i === currentIdx;
          const isDone = i < currentIdx;
          return (
            <li key={s.key} className="flex flex-col gap-1.5 min-w-0">
              <div
                className={
                  'h-1 w-full ' +
                  (isDone
                    ? 'bg-[var(--ledger-ink)]'
                    : isCurrent
                      ? 'bg-[var(--ledger-accent)]'
                      : 'bg-[var(--ledger-rule)]')
                }
              />
              <div
                className={
                  'font-mono uppercase tracking-[0.16em] text-[0.6rem] ' +
                  (isCurrent ? 'text-[var(--ledger-accent)] font-semibold' : isDone ? 'text-[var(--ledger-ink-2)]' : 'text-[var(--ledger-muted)]')
                }
              >
                {String(i + 1).padStart(2, '0')} · {s.label}
              </div>
              <div className={'text-[0.7rem] leading-snug ' + (isCurrent ? 'text-[var(--ledger-ink-2)]' : 'text-[var(--ledger-muted)]')}>
                {s.require}
              </div>
            </li>
          );
        })}
      </ol>
      {currentIdx < STAGES.length - 1 ? (
        <footer className="mt-4 pt-3 border-t border-[var(--ledger-rule)] flex items-baseline justify-between gap-3">
          <span className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)]">
            Next stage · {STAGES[currentIdx + 1].label}
          </span>
          <span className="font-serif text-[0.85rem] text-[var(--ledger-ink-2)] text-right">
            {STAGES[currentIdx + 1].require}
          </span>
        </footer>
      ) : (
        <footer className="mt-4 pt-3 border-t border-[var(--ledger-rule)]">
          <span className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-accent)]">
            You have completed the Foundation arc.
          </span>
        </footer>
      )}
    </section>
  );
}
