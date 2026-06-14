// PillarCard — displays a single learning pillar with status.
// Server Component, pure display. Pillar color discipline retired — all
// pillars share the mockup gold/ink/slate palette. Pillar identity carried
// by icon + label only.

import type { Pillar } from '@content/courses/foundation-program';

export type PillarStatus = 'completed' | 'in-progress' | 'locked';

interface PillarCardProps {
  readonly pillar: Pillar;
  readonly label: string;
  // colorVar is accepted for API compatibility but no longer drives chrome.
  readonly colorVar: string;
  readonly description: string;
  readonly moduleCount: number;
  readonly status: PillarStatus;
}

const PILLAR_ICONS: Record<Pillar, React.ReactElement> = {
  awareness: (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  understanding: (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  creation: (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  application: (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

const statusLabel: React.CSSProperties = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
};

function StatusBadge({ status }: { status: PillarStatus }) {
  if (status === 'locked') {
    return <span style={{ ...statusLabel, color: 'var(--slate-400)' }}>Locked</span>;
  }
  if (status === 'completed') {
    return <span style={{ ...statusLabel, color: 'var(--emerald-700)' }}>Completed</span>;
  }
  return <span style={{ ...statusLabel, color: 'var(--gold-deep)' }}>In progress</span>;
}

export function PillarCard({
  pillar,
  label,
  description,
  moduleCount,
  status,
}: PillarCardProps) {
  return (
    <div
      style={{
        background: 'var(--cream)',
        border: '1px solid var(--ink-a10)',
        borderRadius: 24,
        padding: 32,
        boxShadow: 'var(--shadow-soft)',
        transition: 'border-color var(--t-fast) var(--ease), box-shadow var(--t-med) var(--ease)',
      }}
    >
      {/* Icon — uniform gold-on-ink lockup */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'var(--ink)',
          color: 'var(--gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
        aria-hidden="true"
      >
        {PILLAR_ICONS[pillar]}
      </div>

      <h3
        style={{
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: 'var(--ink)',
          margin: '0 0 12px',
        }}
      >
        {label}
      </h3>

      <p
        style={{
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontSize: 16,
          color: 'var(--slate-600)',
          lineHeight: 1.6,
          margin: '0 0 16px',
        }}
      >
        {description}
      </p>

      <p
        style={{
          ...statusLabel,
          color: 'var(--slate-500)',
          margin: '0 0 12px',
        }}
      >
        {moduleCount} {moduleCount === 1 ? 'module' : 'modules'}
      </p>

      <StatusBadge status={status} />
    </div>
  );
}
