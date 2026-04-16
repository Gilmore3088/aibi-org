// PillarCard — displays a single learning pillar with status
// Server Component: pure display

import type { Pillar } from '@content/courses/aibi-p';

export type PillarStatus = 'completed' | 'in-progress' | 'locked';

interface PillarCardProps {
  readonly pillar: Pillar;
  readonly label: string;
  readonly colorVar: string;
  readonly description: string;
  readonly moduleCount: number;
  readonly status: PillarStatus;
}

const PILLAR_ICONS: Record<Pillar, React.ReactElement> = {
  awareness: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  understanding: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  creation: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  application: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

function StatusBadge({ status, colorVar }: { status: PillarStatus; colorVar: string }) {
  if (status === 'locked') {
    return (
      <span className="font-mono text-[9px] uppercase tracking-wider text-[color:var(--color-dust)]">
        Locked
      </span>
    );
  }

  if (status === 'completed') {
    return (
      <span
        className="font-mono text-[9px] uppercase tracking-wider font-bold"
        style={{ color: colorVar }}
      >
        Completed
      </span>
    );
  }

  return (
    <span
      className="font-mono text-[9px] uppercase tracking-wider font-bold"
      style={{ color: colorVar }}
    >
      In Progress
    </span>
  );
}

export function PillarCard({
  pillar,
  label,
  colorVar,
  description,
  moduleCount,
  status,
}: PillarCardProps) {
  return (
    <div className="group bg-[color:var(--color-parch)] p-8 hover:bg-[color:var(--color-parch-dark)] transition-colors duration-300">
      {/* Icon with pillar-colored border */}
      <div
        className="w-10 h-10 rounded-sm flex items-center justify-center mb-8"
        style={{ border: '1.5px solid var(--color-terra)', color: colorVar }}
        aria-hidden="true"
      >
        {PILLAR_ICONS[pillar]}
      </div>

      {/* Pillar name */}
      <h3 className="font-serif text-xl font-bold mb-3 text-[color:var(--color-ink)]">
        {label}
      </h3>

      {/* Description */}
      <p className="text-xs text-[color:var(--color-slate)] leading-relaxed mb-4">
        {description}
      </p>

      {/* Module count */}
      <p className="font-mono text-[9px] text-[color:var(--color-dust)] mb-4 uppercase tracking-wider">
        {moduleCount} {moduleCount === 1 ? 'module' : 'modules'}
      </p>

      {/* Status badge */}
      <StatusBadge status={status} colorVar={colorVar} />
    </div>
  );
}
