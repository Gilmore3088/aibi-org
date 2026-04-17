// ModuleMapItem — single row in the 9-module course map
// Server Component: pure display

import Link from 'next/link';
import type { Module } from '@content/courses/aibi-p';
import { PILLAR_META } from '@content/courses/aibi-p';

export type ModuleStatus = 'completed' | 'current' | 'locked';

interface ModuleMapItemProps {
  readonly module: Module;
  readonly status: ModuleStatus;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function ModuleMapItem({ module: mod, status }: ModuleMapItemProps) {
  const formattedNumber = String(mod.number).padStart(2, '0');
  const pillarMeta = PILLAR_META[mod.pillar];
  const isLocked = status === 'locked';

  const content = (
    <>
      {/* Module number */}
      <div
        className="font-mono text-sm font-bold mt-1 w-6 shrink-0"
        style={{ color: isLocked ? 'var(--color-dust)' : pillarMeta.colorVar }}
        aria-hidden="true"
      >
        {formattedNumber}
      </div>

      {/* Module content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h4 className="font-serif font-bold text-[color:var(--color-ink)] mb-2 leading-tight">
          {mod.title}
        </h4>

        {/* Key output */}
        <p className="font-mono text-[10px] text-[color:var(--color-dust)] mb-2 uppercase tracking-wider leading-relaxed">
          {mod.keyOutput}
        </p>

        {/* Progress bar */}
        <div className="h-px w-full bg-[color:var(--color-terra)]/10 relative overflow-hidden mb-2">
          {status === 'completed' && (
            <div
              className="absolute left-0 top-0 h-full"
              style={{ width: '100%', backgroundColor: pillarMeta.colorVar }}
            />
          )}
          {status === 'current' && (
            <div
              className="absolute left-0 top-0 h-[1.5px]"
              style={{ width: '33%', backgroundColor: pillarMeta.colorVar }}
            />
          )}
        </div>

        {/* Status text */}
        {status === 'completed' && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-dust)]">
            Completed · {formatMinutes(mod.estimatedMinutes)}
          </p>
        )}
        {status === 'current' && (
          <p
            className="font-mono text-[10px] uppercase tracking-widest font-bold"
            style={{ color: pillarMeta.colorVar }}
          >
            In Progress
          </p>
        )}
        {status === 'locked' && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-dust)]">
            Locked · {formatMinutes(mod.estimatedMinutes)}
          </p>
        )}
      </div>
    </>
  );

  if (isLocked) {
    return (
      <div className="flex gap-4 items-start opacity-40">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/courses/aibi-p/${mod.number}`}
      className="flex gap-4 items-start group hover:translate-x-1 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2 rounded-sm"
    >
      {content}
    </Link>
  );
}
