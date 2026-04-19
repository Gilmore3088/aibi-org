// PreviewSidebar — Desktop persistent left sidebar for the AiBI-S prototype
// Server Component: static for prototype, no interactivity needed
// Mirrors CourseSidebar but uses cobalt (AiBI-S brand) instead of terra

import Link from 'next/link';

const PHASES = [
  { label: 'Phase I — Foundation', description: 'Learn' },
  { label: 'Phase II — Application', description: 'Build' },
  { label: 'Phase III — Strategy', description: 'Strategize' },
] as const;

export function PreviewSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[color:var(--color-linen)] border-r border-[color:var(--color-cobalt)]/10 hidden lg:flex flex-col pt-4 z-30">
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
            <div className="text-[10px] uppercase font-mono tracking-[0.2em] text-[color:var(--color-cobalt)]/60">
              Prototype
            </div>
          </div>
        </div>
      </div>

      {/* Track: /Ops — unit list */}
      <nav className="flex-1 overflow-y-auto py-2" aria-label="Course units">
        <div className="mb-4">
          <div
            className="px-6 py-2 text-[10px] uppercase font-mono tracking-[0.2em] font-bold"
            style={{ color: 'var(--color-cobalt)' }}
          >
            AiBI-S / Ops Track
          </div>

          {/* Unit 1.1 */}
          <Link
            href="/aibi-s-preview/ops/unit/1.1"
            className="flex items-center gap-3 px-6 py-2.5 bg-[color:var(--color-parch)] hover:bg-[color:var(--color-parch-dark)] transition-colors"
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
              AI Governance Foundations
            </span>
          </Link>
        </div>

        {/* Phase progression */}
        <div className="mb-2">
          <div
            className="px-6 py-2 text-[10px] uppercase font-mono tracking-[0.2em] font-bold"
            style={{ color: 'var(--color-cobalt)' }}
          >
            Phase Progression
          </div>

          {PHASES.map((phase) => (
            <div
              key={phase.label}
              className="flex items-center gap-3 px-6 py-2.5"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: 'var(--color-cobalt)', opacity: 0.5 }}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[10px] text-[color:var(--color-ink)] leading-tight truncate">
                  {phase.label}
                </div>
                <div className="font-mono text-[9px] text-[color:var(--color-cobalt)]/50 uppercase tracking-wider">
                  {phase.description}
                </div>
              </div>
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
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          AiBI-S Cohort Landing
        </Link>
      </div>
    </aside>
  );
}
