// WeekSidebar — Desktop persistent left sidebar for AiBI-S
// Server Component: no interactivity needed, rendered once per layout
// Cobalt accent color throughout (AiBI-S uses --color-cobalt, not terra)

import Link from 'next/link';
import { weeks, PHASE_META } from '@content/courses/aibi-s';
import type { Phase } from '@content/courses/aibi-s';

interface WeekSidebarProps {
  readonly completedWeeks: readonly number[];
  readonly currentWeek: number;
}

const PHASE_ORDER: Phase[] = ['foundation', 'first-build', 'scale-and-orchestrate'];

function getWeekStatus(
  weekNumber: number,
  completedWeeks: readonly number[],
  currentWeek: number,
): 'completed' | 'current' | 'locked' {
  if (completedWeeks.includes(weekNumber)) return 'completed';
  if (weekNumber === currentWeek) return 'current';
  return 'locked';
}

export function WeekSidebar({ completedWeeks, currentWeek }: WeekSidebarProps) {
  const weeksByPhase = PHASE_ORDER.map((phase) => ({
    phase,
    meta: PHASE_META[phase],
    items: weeks.filter((w) => w.phase === phase),
  }));

  return (
    <aside
      className="fixed left-0 top-0 h-full w-72 bg-[color:var(--color-linen)] border-r border-[color:var(--color-cobalt)]/10 hidden lg:flex flex-col pt-16 z-40"
      aria-label="Course weeks"
    >
      {/* Brand area */}
      <div className="px-6 py-5 border-b border-[color:var(--color-cobalt)]/10">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="h-9 w-9 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold text-[color:var(--color-cobalt)]"
            style={{ border: '1.5px solid var(--color-cobalt)' }}
          >
            Ai
          </div>
          <div>
            <div className="text-[color:var(--color-ink)] font-bold text-sm font-serif leading-tight">
              AiBI-S
            </div>
            <div className="text-[10px] uppercase font-mono tracking-[0.2em] text-[color:var(--color-slate)]">
              Banking AI Specialist
            </div>
          </div>
        </div>
      </div>

      {/* Week navigation grouped by phase */}
      <nav className="flex-1 overflow-y-auto py-2" aria-label="Course weeks">
        {weeksByPhase.map(({ phase, meta, items }) => (
          <div key={phase} className="mb-1">
            {/* Phase heading */}
            <div
              className="px-6 py-2 text-[10px] uppercase font-mono tracking-[0.2em] font-bold"
              style={{ color: meta.colorVar }}
            >
              {meta.label}
            </div>

            {/* Week links */}
            {items.map((week) => {
              const status = getWeekStatus(week.number, completedWeeks, currentWeek);
              const formattedNumber = `W${week.number}`;

              if (status === 'locked') {
                return (
                  <div
                    key={week.number}
                    className="flex items-center gap-3 px-6 py-2.5 opacity-40 cursor-not-allowed"
                    aria-label={`Week ${week.number}: ${week.title} — locked`}
                  >
                    <span
                      className="font-mono text-[10px] w-6 text-[color:var(--color-slate)] shrink-0"
                      aria-hidden="true"
                    >
                      {formattedNumber}
                    </span>
                    <span className="font-serif text-xs text-[color:var(--color-ink)] flex-1 leading-tight">
                      {week.title}
                    </span>
                    <svg
                      className="w-3 h-3 text-[color:var(--color-dust)] shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                );
              }

              if (status === 'current') {
                return (
                  <Link
                    key={week.number}
                    href={`/courses/aibi-s/${week.number}`}
                    className="flex items-center gap-3 px-6 py-2.5 bg-[color:var(--color-parch-dark)] font-bold transition-colors"
                    aria-current="page"
                  >
                    <span
                      className="font-mono text-[10px] w-6 font-bold text-[color:var(--color-cobalt)] shrink-0"
                      aria-hidden="true"
                    >
                      {formattedNumber}
                    </span>
                    <span className="font-serif text-xs text-[color:var(--color-cobalt)] flex-1 leading-tight">
                      {week.title}
                    </span>
                    <span className="sr-only">(current week)</span>
                  </Link>
                );
              }

              // completed
              return (
                <Link
                  key={week.number}
                  href={`/courses/aibi-s/${week.number}`}
                  className="flex items-center gap-3 px-6 py-2.5 hover:bg-[color:var(--color-parch)] transition-colors"
                >
                  <span
                    className="font-mono text-[10px] w-6 text-[color:var(--color-slate)] shrink-0"
                    aria-hidden="true"
                  >
                    {formattedNumber}
                  </span>
                  <span className="font-serif text-xs text-[color:var(--color-ink)] flex-1 leading-tight">
                    {week.title}
                  </span>
                  <svg
                    className="w-3 h-3 shrink-0 text-[color:var(--color-cobalt)]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-label="Completed"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer: Resume + Submit */}
      <div className="p-6 border-t border-[color:var(--color-cobalt)]/10 space-y-3">
        <Link
          href={`/courses/aibi-s/${currentWeek}`}
          className="w-full bg-[color:var(--color-cobalt)] hover:opacity-90 text-[color:var(--color-linen)] py-3 px-4 rounded-sm font-bold transition-opacity flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2"
        >
          Continue Week {currentWeek}
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
        <Link
          href="/courses/aibi-s/submit"
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-sm border border-[color:var(--color-cobalt)]/30 hover:bg-[color:var(--color-parch)] transition-colors text-[10px] uppercase tracking-widest font-mono text-[color:var(--color-cobalt)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2"
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
              clipRule="evenodd"
            />
          </svg>
          Submit Capstone
        </Link>
      </div>
    </aside>
  );
}
