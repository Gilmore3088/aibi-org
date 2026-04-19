// CourseSidebar — Desktop persistent left sidebar
// Server Component: no interactivity needed, rendered once per layout

import Link from 'next/link';

interface CourseSidebarProps {
  readonly completedModules: readonly number[];
  readonly currentModule: number;
}

// Inline AiBI-S data (replaces @content/courses/aibi-p imports)
interface PrototypeUnit {
  readonly number: number;
  readonly slug: string;
  readonly title: string;
  readonly href: string;
  readonly phaseIndex: 0 | 1 | 2;
  readonly isLive: boolean;
}

const PROTOTYPE_UNITS: readonly PrototypeUnit[] = [
  { number: 1.1, slug: '1.1', title: 'From Personal Skills to Institutional Assets', href: '/aibi-s-preview/ops/unit/1.1', phaseIndex: 0, isLive: true },
  { number: 1.2, slug: '1.2', title: 'Work Decomposition for Banking Workflows',     href: '#', phaseIndex: 0, isLive: false },
  { number: 2.1, slug: '2.1', title: 'Build Your First Departmental Automation',      href: '#', phaseIndex: 1, isLive: false },
  { number: 2.2, slug: '2.2', title: 'Measure and Evaluate',                           href: '#', phaseIndex: 1, isLive: false },
  { number: 3.1, slug: '3.1', title: 'Build Your Departmental Skill Library',          href: '#', phaseIndex: 2, isLive: false },
  { number: 3.2, slug: '3.2', title: 'Capstone and Certification',                     href: '#', phaseIndex: 2, isLive: false },
];

const PROTOTYPE_PHASES = [
  { label: 'Phase I — Foundation', color: 'var(--color-cobalt)' },
  { label: 'Phase II — First Build', color: 'var(--color-cobalt)' },
  { label: 'Phase III — Scale', color: 'var(--color-cobalt)' },
];

function getModuleStatus(
  moduleNumber: number,
  completedModules: readonly number[],
  currentModule: number,
): 'completed' | 'current' | 'locked' {
  if (completedModules.includes(moduleNumber)) return 'completed';
  if (moduleNumber === currentModule) return 'current';
  return 'locked';
}

export function CourseSidebar({ completedModules, currentModule }: CourseSidebarProps) {
  const unitsByPhase = PROTOTYPE_PHASES.map((phase, i) => ({
    phase,
    items: PROTOTYPE_UNITS.filter((u) => u.phaseIndex === i),
  }));

  return (
    <aside className="fixed left-0 top-[70px] h-[calc(100vh-70px)] w-72 bg-[color:var(--color-linen)] border-r border-[color:var(--color-cobalt)]/10 hidden lg:flex flex-col pt-4 z-30">
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

      {/* Module navigation grouped by phase */}
      <nav className="flex-1 overflow-y-auto py-2" aria-label="Course modules">
        {unitsByPhase.map(({ phase, items }) => (
          <div key={phase.label} className="mb-1">
            {/* Phase heading */}
            <div
              className="px-6 py-2 text-[10px] uppercase font-mono tracking-[0.2em] font-bold"
              style={{ color: phase.color }}
            >
              {phase.label}
            </div>

            {/* Unit links */}
            {items.map((mod) => {
              const status = getModuleStatus(mod.number, completedModules, currentModule);
              const formattedNumber = String(mod.number).padStart(2, '0');

              if (status === 'locked') {
                return (
                  <div
                    key={mod.slug}
                    className="flex items-center gap-3 px-6 py-2.5 opacity-40 cursor-not-allowed"
                    aria-label={`Module ${mod.number}: ${mod.title} — locked`}
                  >
                    <span
                      className="font-mono text-[10px] w-5 text-[color:var(--color-slate)]"
                      aria-hidden="true"
                    >
                      {formattedNumber}
                    </span>
                    <span className="font-serif text-xs text-[color:var(--color-ink)] flex-1 leading-tight">
                      {mod.title}
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
                    key={mod.slug}
                    href={mod.href}
                    className="flex items-center gap-3 px-6 py-2.5 bg-[color:var(--color-parch-dark)] font-bold transition-colors"
                    aria-current="page"
                  >
                    <span
                      className="font-mono text-[10px] w-5 font-bold"
                      style={{ color: phase.color }}
                      aria-hidden="true"
                    >
                      {formattedNumber}
                    </span>
                    <span className="font-serif text-xs text-[color:var(--color-cobalt)] flex-1 leading-tight">
                      {mod.title}
                    </span>
                    <span className="sr-only">(current module)</span>
                  </Link>
                );
              }

              // completed
              return (
                <Link
                  key={mod.slug}
                  href={mod.href}
                  className="flex items-center gap-3 px-6 py-2.5 hover:bg-[color:var(--color-parch)] transition-colors"
                >
                  <span
                    className="font-mono text-[10px] w-5 text-[color:var(--color-slate)]"
                    aria-hidden="true"
                  >
                    {formattedNumber}
                  </span>
                  <span className="font-serif text-xs text-[color:var(--color-ink)] flex-1 leading-tight">
                    {mod.title}
                  </span>
                  <svg
                    className="w-3 h-3 shrink-0"
                    style={{ color: phase.color }}
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

      {/* Footer: My Toolkit + Resume + Settings */}
      <div className="p-6 border-t border-[color:var(--color-cobalt)]/10 space-y-3">
        <Link
          href="/aibi-s-preview/toolkit"
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-sm border border-[color:var(--color-cobalt)]/30 hover:bg-[color:var(--color-parch)] transition-colors text-[10px] uppercase tracking-widest font-mono text-[color:var(--color-cobalt)]"
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          My Toolkit
        </Link>
        <Link
          href="/aibi-s-preview/gallery"
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-sm border border-[color:var(--color-cobalt)]/30 hover:bg-[color:var(--color-parch)] transition-colors text-[10px] uppercase tracking-widest font-mono text-[color:var(--color-cobalt)]"
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
          </svg>
          Output Gallery
        </Link>
        <Link
          href={`/aibi-s-preview/ops/unit/1.1`}
          className="w-full bg-[color:var(--color-cobalt)] hover:bg-[color:var(--color-cobalt)] text-[color:var(--color-linen)] py-3 px-4 rounded-sm font-bold transition-colors flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-mono"
        >
          Resume
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
          href="/aibi-s-preview/quick-wins"
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-sm transition-colors text-[10px] uppercase tracking-widest font-mono hover:bg-[color:var(--color-parch)]"
          style={{ color: 'var(--color-ink)', opacity: 0.6 }}
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
              clipRule="evenodd"
            />
          </svg>
          Quick Wins
        </Link>
        <Link
          href="/aibi-s-preview/settings"
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-sm transition-colors text-[10px] uppercase tracking-widest font-mono hover:bg-[color:var(--color-parch)]"
          style={{ color: 'var(--color-ink)', opacity: 0.5 }}
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
          Settings
        </Link>
      </div>
    </aside>
  );
}
