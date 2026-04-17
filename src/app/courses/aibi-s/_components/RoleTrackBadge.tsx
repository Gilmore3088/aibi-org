// RoleTrackBadge — Displays the learner's role track designation
// Server Component: no interactivity needed
// Each track uses cobalt as the base with a distinct secondary color for the accent stripe

import { ROLE_TRACK_META } from '@content/courses/aibi-s';
import type { RoleTrack } from '@content/courses/aibi-s';

interface RoleTrackBadgeProps {
  readonly track: RoleTrack;
  readonly size?: 'sm' | 'md';
}

// Track-specific accent colors that sit alongside cobalt
const TRACK_ACCENT: Record<RoleTrack, string> = {
  operations: 'var(--color-terra)',
  lending:    'var(--color-sage)',
  compliance: 'var(--color-cobalt)',
  finance:    'var(--color-terra)',
  retail:     'var(--color-sage)',
} as const;

export function RoleTrackBadge({ track, size = 'md' }: RoleTrackBadgeProps) {
  const meta = ROLE_TRACK_META[track];
  const accentColor = TRACK_ACCENT[track];

  const isSm = size === 'sm';

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-sm border border-[color:var(--color-cobalt)]/20 bg-[color:var(--color-parch)] ${
        isSm ? 'px-2.5 py-1' : 'px-3 py-1.5'
      }`}
      aria-label={`Role track: AiBI-S${meta.code}`}
    >
      {/* Accent stripe */}
      <span
        className={`shrink-0 rounded-sm ${isSm ? 'w-1 h-3' : 'w-1 h-4'}`}
        style={{ backgroundColor: accentColor }}
        aria-hidden="true"
      />

      <span className={`font-mono uppercase tracking-[0.15em] text-[color:var(--color-cobalt)] ${isSm ? 'text-[9px]' : 'text-[10px]'}`}>
        AiBI-S{meta.code}
      </span>

      <span
        className={`font-serif text-[color:var(--color-slate)] ${isSm ? 'text-[10px]' : 'text-xs'}`}
        aria-hidden="true"
      >
        {meta.label}
      </span>
    </div>
  );
}
