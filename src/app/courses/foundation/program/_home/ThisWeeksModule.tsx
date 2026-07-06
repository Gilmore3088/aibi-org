// ThisWeeksModule — the current module with the four Foundation phases
// (Understand / Try / Build / Save) and each task's completion state +
// time estimate.
//
// Audit §2 item 3. The Foundation module data shape doesn't expose
// per-sub-task completion yet, so the rows are derived from
// the module's total minute budget. When the
// sub-task tracking lands in Supabase the row state swaps in.

import Link from 'next/link';
import type { LMSModule } from '@/components/lms';
import { getArtifactFirst } from '@content/courses/foundation-program';
import { getFoundationLabBrief } from '@content/courses/foundation-program/lab-first';

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
  const learnMin = Math.max(2, Math.round(total * 0.2));
  const tryMin = Math.max(2, Math.round(total * 0.3));
  const buildMin = Math.max(2, Math.round(total * 0.3));
  const saveMin = Math.max(1, total - learnMin - tryMin - buildMin);
  const brief = getFoundationLabBrief(mod.num);
  const artifact = getArtifactFirst(mod.num);

  if (isCompleted) {
    return [
      { label: 'Understand', description: brief?.outcome ?? 'Artifact brief', minutes: learnMin, state: 'done' },
      { label: 'Try', description: brief?.labTask ?? 'Dataset-backed practice', minutes: tryMin, state: 'done' },
      { label: 'Build', description: artifact ? `Built ${artifact.saved}` : 'Built work product', minutes: buildMin, state: 'done' },
      { label: 'Save', description: artifact ? `Saved ${artifact.saved}` : 'Saved to packet', minutes: saveMin, state: 'done' },
    ];
  }

  // Until per-sub-task state is persisted, avoid pretending the learner has
  // completed a step. The card orients the next action without false precision.
  return [
    { label: 'Understand', description: brief?.outcome ?? 'Artifact brief', minutes: learnMin, state: 'in-progress' },
    { label: 'Try', description: brief?.labTask ?? 'Dataset-backed practice', minutes: tryMin, state: 'pending' },
    { label: 'Build', description: artifact ? `Build ${artifact.saved}` : 'Build work product', minutes: buildMin, state: 'pending' },
    { label: 'Save', description: artifact ? `Save ${artifact.saved}` : 'Save to packet', minutes: saveMin, state: 'pending' },
  ];
}

function StateMark({ state }: { readonly state: SubTaskState }) {
  if (state === 'done') {
    return (
      <span
        role="img"
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
          fontSize: '0.8125rem',
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
        role="img"
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
      role="img"
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
  const brief = getFoundationLabBrief(currentModule.num);
  const artifact = getArtifactFirst(currentModule.num);

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
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          This module
        </span>
        <span
          style={{
            fontSize: '0.75rem',
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
            fontSize: 'clamp(1.625rem, 2.8vw, 2rem)',
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
            fontSize: '1.0625rem',
            lineHeight: 1.6,
            color: 'var(--slate-600)',
            maxWidth: '64ch',
          }}
        >
          {currentModule.goal}
        </p>

        {brief && (
          <div
            className="this-week-module__learning-loop"
            aria-label="Module learning loop"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 10,
              margin: '0 0 18px',
            }}
          >
            {[
              ['Understand', brief.learningLoop.recallPrompt],
              ['Try', brief.learningLoop.deliberatePractice],
              ['Build', artifact?.mustProve ?? brief.learningLoop.feedbackCue],
            ].map(([label, body]) => (
              <div
                key={label}
                className="this-week-module__loop-card"
                style={{
                  border: '1px solid var(--ink-a10)',
                  borderRadius: 14,
                  background: 'var(--cream)',
                  padding: '12px 14px',
                }}
              >
                <p
                  style={{
                    margin: '0 0 6px',
                    color: 'var(--gold-deep)',
                    fontSize: '0.625rem',
                    fontWeight: 850,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: 'var(--ink)',
                    fontSize: '0.8125rem',
                    lineHeight: 1.35,
                    fontWeight: 700,
                  }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        )}

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
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  letterSpacing: '-0.005em',
                }}
              >
                {task.label}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--slate-600)',
                  marginTop: 3,
                  lineHeight: 1.35,
                }}
                className="this-week-module__task-description"
              >
                {task.description}
              </div>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
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
              fontSize: '0.8125rem',
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
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 760px) {
              .this-week-module__learning-loop {
                grid-template-columns: 1fr !important;
                gap: 8px !important;
              }
              .this-week-module__loop-card {
                display: grid !important;
                grid-template-columns: 76px minmax(0, 1fr) !important;
                gap: 10px !important;
                align-items: start !important;
                padding: 10px 12px !important;
              }
              .this-week-module__loop-card p:last-child,
              .this-week-module__task-description {
                display: -webkit-box !important;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
            }
          `,
        }}
      />
    </section>
  );
}
