// ThisWeeksModule — the current module with its three sub-tasks
// (Learn it / Try it / Use it) and each task's completion state +
// time estimate.
//
// Audit §2 item 3. The Foundation module data shape doesn't expose
// per-sub-task completion yet, so the three rows are derived from
// the module's total minute budget (split 25/40/35 — a reasonable
// approximation of the Takeaway/Sandbox/Submit pacing). When the
// sub-task tracking lands in Supabase the row state swaps in.

import Link from 'next/link';
import type { LMSModule } from '@/components/lms';

const FONT_INTER =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

interface ThisWeeksModuleProps {
  readonly currentModule: LMSModule;
  readonly isCompleted: boolean;
}

type SubTaskState = 'done' | 'in-progress' | 'pending';

interface SubTask {
  readonly label: string;
  readonly description: string;
  readonly minutes: number;
  readonly state: SubTaskState;
}

function buildSubTasks(mod: LMSModule, isCompleted: boolean): readonly SubTask[] {
  const total = mod.mins;
  const learnMin = Math.max(8, Math.round(total * 0.25));
  const tryMin = Math.max(10, Math.round(total * 0.4));
  const useMin = Math.max(8, total - learnMin - tryMin);

  if (isCompleted) {
    return [
      { label: 'Learn it', description: 'Key takeaway', minutes: learnMin, state: 'done' },
      { label: 'Try it', description: 'Sandbox scenario', minutes: tryMin, state: 'done' },
      { label: 'Use it', description: 'Submit your work', minutes: useMin, state: 'done' },
    ];
  }

  // TODO: wire real sub-task completion state from Supabase activity log.
  // Placeholder — assume the learner is partway through "Try it".
  return [
    { label: 'Learn it', description: 'Key takeaway', minutes: learnMin, state: 'done' },
    { label: 'Try it', description: 'Sandbox scenario', minutes: tryMin, state: 'in-progress' },
    { label: 'Use it', description: 'Submit your work', minutes: useMin, state: 'pending' },
  ];
}

function StateMark({ state }: { readonly state: SubTaskState }) {
  if (state === 'done') {
    return (
      <span
        aria-label="Completed"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          borderRadius: 999,
          background: 'var(--emerald-700)',
          color: 'var(--cream)',
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        ✓
      </span>
    );
  }
  if (state === 'in-progress') {
    return (
      <span
        aria-label="In progress"
        style={{
          display: 'inline-block',
          width: 14,
          height: 14,
          borderRadius: 999,
          background: 'var(--gold)',
          boxShadow: '0 0 0 4px var(--gold-a20)',
        }}
      />
    );
  }
  return (
    <span
      aria-label="Pending"
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        borderRadius: 999,
        border: '1.5px solid var(--slate-400)',
        background: 'transparent',
      }}
    />
  );
}

export function ThisWeeksModule({ currentModule, isCompleted }: ThisWeeksModuleProps) {
  const tasks = buildSubTasks(currentModule, isCompleted);
  const href = `/courses/foundation/program/${currentModule.num}`;

  return (
    <section
      style={{
        marginBottom: 40,
        background: '#FFFFFF',
        border: '1px solid var(--slate-200)',
        borderRadius: 28,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-hero)',
        fontFamily: FONT_INTER,
      }}
      aria-labelledby="this-weeks-heading"
    >
      {/* Dark navy header band — kicker pill chip + module meta */}
      <div
        style={{
          background: 'var(--ink)',
          color: '#fff',
          padding: 'clamp(18px, 2.4vw, 22px) clamp(20px, 3vw, 28px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 14px',
            borderRadius: 999,
            background: 'var(--gold-a20)',
            color: 'var(--gold-soft)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          This module
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--gold-soft)',
          }}
        >
          Module {String(currentModule.num).padStart(2, '0')} &middot; {currentModule.mins} min
        </span>
      </div>

      {/* White body — title, goal, sub-tasks, CTA */}
      <div style={{ padding: 'clamp(24px, 3vw, 32px)' }}>
        <h2
          id="this-weeks-heading"
          style={{
            margin: '0 0 10px',
            fontSize: 'clamp(26px, 2.8vw, 32px)',
            fontWeight: 700,
            letterSpacing: '-0.015em',
            color: 'var(--ink)',
            lineHeight: 1.15,
          }}
        >
          {currentModule.title}
        </h2>
        <p
          style={{
            margin: '0 0 28px',
            fontSize: 17,
            lineHeight: 1.6,
            color: 'var(--slate-600)',
            maxWidth: '64ch',
          }}
        >
          {currentModule.goal}
        </p>

        <ol
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gap: 10,
        }}
      >
        {tasks.map((task) => (
          <li
            key={task.label}
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              alignItems: 'center',
              gap: 16,
              padding: '14px 16px',
              borderRadius: 16,
              background: task.state === 'done' ? 'var(--cream)' : 'var(--cream-2)',
              border: '1px solid var(--slate-200)',
            }}
          >
            <StateMark state={task.state} />
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--ink)',
                  letterSpacing: '-0.005em',
                }}
              >
                {task.label}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: 'var(--slate-600)',
                  marginTop: 3,
                }}
              >
                {task.description}
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--slate-500)',
                whiteSpace: 'nowrap',
              }}
            >
              {task.minutes} min
            </span>
          </li>
        ))}
      </ol>

        <div style={{ marginTop: 24 }}>
          <Link
            href={href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 26px',
              borderRadius: 12,
              background: 'var(--gold)',
              color: 'var(--ink)',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Open module
            <span aria-hidden="true" style={{ fontWeight: 700, letterSpacing: 0 }}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
