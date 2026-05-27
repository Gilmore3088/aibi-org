// ModuleMapItem — single row in the 9-module course map.
// Server Component, pure display. Mockup chrome: ink text, gold accent for
// progress + current state, slate for locked. Pillar color discipline retired.

import Link from 'next/link';
import type { Module } from '@content/courses/foundation-program';

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

const metaStyle: React.CSSProperties = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
};

export function ModuleMapItem({ module: mod, status }: ModuleMapItemProps) {
  const formattedNumber = String(mod.number).padStart(2, '0');
  const isLocked = status === 'locked';
  const isCurrent = status === 'current';
  const isComplete = status === 'completed';

  const numberColor = isLocked
    ? 'var(--slate-400)'
    : isCurrent
      ? 'var(--gold-deep)'
      : 'var(--ink)';

  const content = (
    <>
      {/* Module number */}
      <div
        style={{
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontSize: 14,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          marginTop: 2,
          width: 28,
          flexShrink: 0,
          color: numberColor,
        }}
        aria-hidden="true"
      >
        {formattedNumber}
      </div>

      {/* Module content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4
          style={{
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--ink)',
            marginBottom: 8,
            lineHeight: 1.3,
          }}
        >
          {mod.title}
        </h4>

        <p
          style={{
            ...metaStyle,
            color: 'var(--slate-500)',
            margin: '0 0 10px',
            lineHeight: 1.5,
          }}
        >
          {mod.keyOutput}
        </p>

        {/* Progress bar */}
        <div
          style={{
            height: 2,
            width: '100%',
            background: 'var(--ink-a10)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: 8,
            borderRadius: 999,
          }}
        >
          {isComplete && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: '100%',
                background: 'var(--gold)',
              }}
            />
          )}
          {isCurrent && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: '33%',
                background: 'var(--gold)',
              }}
            />
          )}
        </div>

        {isComplete && (
          <p style={{ ...metaStyle, color: 'var(--slate-500)', margin: 0 }}>
            Completed · {formatMinutes(mod.estimatedMinutes)}
          </p>
        )}
        {isCurrent && (
          <p style={{ ...metaStyle, color: 'var(--gold-deep)', fontWeight: 700, margin: 0 }}>
            In progress
          </p>
        )}
        {isLocked && (
          <p style={{ ...metaStyle, color: 'var(--slate-400)', margin: 0 }}>
            Locked · {formatMinutes(mod.estimatedMinutes)}
          </p>
        )}
      </div>
    </>
  );

  if (isLocked) {
    return (
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start',
          opacity: 0.45,
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/courses/foundation/program/${mod.number}`}
      className="group"
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform var(--t-fast) var(--ease)',
      }}
    >
      {content}
    </Link>
  );
}
