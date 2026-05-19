// ResumeStrip — dark "Resume / Start" banner showing the learner's
// current module with a primary CTA.

import { PrimaryButton } from '@/components/lms';
import type { LMSModule } from '@/components/lms';

interface ResumeStripProps {
  readonly currentModule: LMSModule;
  readonly completedCount: number;
}

export function ResumeStrip({ currentModule, completedCount }: ResumeStripProps) {
  const verb = completedCount > 0 ? 'Resume' : 'Start';
  const label = completedCount > 0 ? 'Currently on' : 'Start with';

  return (
    <div
      style={{
        marginTop: 32,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 24,
        alignItems: 'center',
        background: 'var(--ledger-ink)',
        color: 'var(--ledger-paper)',
        padding: '22px 26px',
        borderRadius: 2,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          style={{
            fontFamily: 'var(--ledger-mono)',
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(244,241,231,0.6)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'var(--ledger-mono)',
            fontSize: 11,
            letterSpacing: '0.16em',
            color: 'var(--ledger-accent-light)',
          }}
        >
          Module {String(currentModule.num).padStart(2, '0')} &middot;{' '}
          {currentModule.mins} min
        </span>
      </div>
      <div>
        <h2
          style={{
            fontFamily: 'var(--ledger-serif)',
            fontWeight: 500,
            fontSize: 26,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: 0,
            color: 'var(--ledger-paper)',
          }}
        >
          {currentModule.title}
        </h2>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: 13,
            color: 'rgba(244,241,231,0.72)',
            lineHeight: 1.5,
            maxWidth: '62ch',
          }}
        >
          {currentModule.goal}
        </p>
      </div>
      <PrimaryButton
        as="a"
        href={`/courses/foundation/program/${currentModule.num}`}
        style={{
          background: 'var(--ledger-accent)',
          color: 'var(--ledger-paper)',
        }}
      >
        {verb}{' '}
        <span
          style={{
            fontFamily: 'var(--ledger-serif)',
            fontStyle: 'italic',
            textTransform: 'none',
            letterSpacing: 0,
            fontSize: 14,
          }}
        >
          →
        </span>
      </PrimaryButton>
    </div>
  );
}
