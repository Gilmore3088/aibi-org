// ProgramModuleCard — single module row in the course-structure list.
// Renders as a Link when accessible, a plain div with aria-disabled when locked.

import Link from 'next/link';
import { ProgressDot, getModuleStatus, type LMSModule } from '@/components/lms';
import type { ExpandedModule } from '@content/courses/foundation-program';

const FONT_INTER =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

interface ProgramModuleCardProps {
  readonly module: LMSModule;
  readonly expanded: ExpandedModule | undefined;
  readonly completedModules: readonly number[];
  readonly currentModule: number;
}

export function ProgramModuleCard({
  module: mod,
  expanded,
  completedModules,
  currentModule,
}: ProgramModuleCardProps) {
  const status = getModuleStatus(mod.num, completedModules, currentModule);
  const locked = status === 'locked';
  const href = `/courses/foundation/program/${mod.num}`;

  const cardStyle: React.CSSProperties = {
    textAlign: 'left',
    background: '#FFFFFF',
    border: '1px solid var(--ink-a10)',
    borderRadius: 16,
    padding: '18px 22px',
    display: 'grid',
    gridTemplateColumns: '24px 56px 1fr auto auto',
    gap: 18,
    alignItems: 'center',
    opacity: locked ? 0.55 : 1,
    transition: 'border-color .15s, background .15s, box-shadow .15s',
    textDecoration: 'none',
    color: 'inherit',
    fontFamily: FONT_INTER,
    boxShadow: locked ? 'none' : 'var(--shadow-soft)',
  };

  const interior = (
    <>
      <ProgressDot status={status} size={11} />
      <span
        style={{
          fontFamily: FONT_INTER,
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--slate-500)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        M{String(mod.num).padStart(2, '0')}
      </span>
      <div>
        <div
          style={{
            fontFamily: FONT_INTER,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: status === 'current' ? 'var(--gold-deep)' : 'var(--ink)',
          }}
        >
          {mod.title}
        </div>
        <div
          style={{
            fontFamily: FONT_INTER,
            fontSize: 16,
            color: 'var(--slate-600)',
            marginTop: 4,
            lineHeight: 1.6,
          }}
        >
          {expanded?.goal ?? mod.output}
        </div>
      </div>
      <span
        style={{
          fontFamily: FONT_INTER,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--slate-500)',
        }}
      >
        {mod.mins} min
      </span>
      <span
        aria-hidden="true"
        style={{
          fontFamily: FONT_INTER,
          fontSize: 18,
          fontWeight: 600,
          color: locked ? 'var(--slate-400)' : 'var(--ink)',
        }}
      >
        {locked ? '·' : '→'}
      </span>
    </>
  );

  if (locked) {
    return (
      <div
        style={{ ...cardStyle, cursor: 'not-allowed' }}
        aria-disabled
        title="Complete the previous module to open"
      >
        {interior}
      </div>
    );
  }

  return (
    <Link href={href} style={cardStyle}>
      {interior}
    </Link>
  );
}
