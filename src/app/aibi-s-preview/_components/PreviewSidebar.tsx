// PreviewSidebar — Desktop persistent left sidebar for the AiBI-S prototype
// Server Component: no interactivity needed, rendered once per layout
// Mirrors CourseSidebar exactly — cobalt substituted for terra throughout

import Link from 'next/link';

const PHASES = [
  { label: 'Phase I — Foundation' },
  { label: 'Phase II — First Build' },
  { label: 'Phase III — Scale' },
] as const;

export function PreviewSidebar() {
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
              Prototype
            </div>
          </div>
        </div>
      </div>

      {/* Unit navigation grouped by track */}
      <nav className="flex-1 overflow-y-auto py-2" aria-label="Course units">
        {/* Track: /Ops */}
        <div className="mb-1">
          <div
            className="px-6 py-2 text-[10px] uppercase font-mono tracking-[0.2em] font-bold"
            style={{ color: 'var(--color-cobalt)' }}
          >
            /Ops Track
          </div>

          {/* Unit 1.1 — current */}
          <Link
            href="/aibi-s-preview/ops/unit/1.1"
            className="flex items-center gap-3 px-6 py-2.5 bg-[color:var(--color-parch-dark)] font-bold transition-colors"
            aria-current="page"
          >
            <span
              className="font-mono text-[10px] w-5 font-bold"
              style={{ color: 'var(--color-cobalt)' }}
              aria-hidden="true"
            >
              1.1
            </span>
            <span className="font-serif text-xs text-[color:var(--color-cobalt)] flex-1 leading-tight">
              From Personal Skills to Institutional Assets
            </span>
          </Link>
        </div>

        {/* Phase Progression — styled like pillar group headers */}
        <div className="mb-1">
          <div
            className="px-6 py-2 text-[10px] uppercase font-mono tracking-[0.2em] font-bold"
            style={{ color: 'var(--color-cobalt)' }}
          >
            Phase Progression
          </div>

          {PHASES.map((phase) => (
            <div
              key={phase.label}
              className="flex items-center gap-3 px-6 py-2.5 opacity-40 cursor-not-allowed"
            >
              <span
                className="font-mono text-[10px] w-5 text-[color:var(--color-slate)]"
                aria-hidden="true"
              >
                —
              </span>
              <span className="font-serif text-xs text-[color:var(--color-ink)] flex-1 leading-tight">
                {phase.label}
              </span>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer: cross-course nav */}
      <div className="p-6 border-t border-[color:var(--color-cobalt)]/10 space-y-3">
        <Link
          href="/courses/aibi-p"
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-sm border border-[color:var(--color-cobalt)]/30 hover:bg-[color:var(--color-parch)] transition-colors text-[10px] uppercase tracking-widest font-mono text-[color:var(--color-cobalt)]"
        >
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
          AiBI-P
        </Link>
        <Link
          href="/courses/aibi-s"
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
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Cohort Landing
        </Link>
      </div>
    </aside>
  );
}
