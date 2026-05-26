// ProgramModuleCard — single module row in the course-structure list.
// Renders as a Link when accessible, a plain div with aria-disabled when locked.

import Link from 'next/link';
import { ProgressDot, getModuleStatus, type LMSModule } from '@/components/lms';
import type { ExpandedModule } from '@content/courses/foundation-program';

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
    background: 'var(--ledger-paper)',
    border: '1px solid var(--ledger-rule)',
    borderRadius: 3,
    padding: '18px 22px',
    display: 'grid',
    gridTemplateColumns: '24px 56px 1fr auto auto',
    gap: 18,
    alignItems: 'center',
    opacity: locked ? 0.55 : 1,
    transition: 'border-color .15s, background .15s',
    textDecoration: 'none',
    color: 'inherit',
  };

  const interior = (
    <>
      <ProgressDot status={status} size={11} />
      <span
        style={{
          fontFamily: 'var(--ledger-mono)',
          fontSize: 11,
          color: 'var(--ledger-muted)',
          letterSpacing: '0.06em',
        }}
      >
        M{String(mod.num).padStart(2, '0')}
      </span>
      <div>
        <div
          style={{
            fontFamily: 'var(--ledger-serif)',
            fontSize: 19,
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color:
              status === 'current'
                ? 'var(--ledger-accent)'
                : 'var(--ledger-ink)',
          }}
        >
          {mod.title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'var(--ledger-slate)',
            marginTop: 3,
            lineHeight: 1.5,
          }}
        >
          {expanded?.goal ?? mod.output}
        </div>
      </div>
      <span
        style={{
          fontFamily: 'var(--ledger-mono)',
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--ledger-muted)',
        }}
      >
        {mod.mins} min
      </span>
      <span
        style={{
          fontFamily: 'var(--ledger-serif)',
          fontStyle: 'italic',
          fontSize: 18,
          color: locked
            ? 'var(--ledger-rule-strong)'
            : 'var(--ledger-ink)',
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
