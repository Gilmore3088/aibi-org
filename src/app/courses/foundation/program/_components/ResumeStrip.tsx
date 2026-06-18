// ResumeStrip — dark "Resume / Start" banner showing the learner's
// current module with a primary CTA.

import { PrimaryButton } from '@/components/lms';
import type { LMSModule } from '@/components/lms';

const FONT_INTER =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

interface ResumeStripProps {
  readonly currentModule: LMSModule;
  readonly completedCount: number;
}

export function ResumeStrip({ currentModule, completedCount }: ResumeStripProps) {
  const verb = completedCount > 0 ? 'RESUME' : 'START';
  const label = completedCount > 0 ? 'Currently on' : 'Start with';

  return (
    <div
      style={{
        marginTop: 32,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 24,
        alignItems: 'center',
        background: 'var(--ink)',
        color: 'var(--cream)',
        padding: '24px 28px',
        borderRadius: 24,
        boxShadow: 'var(--shadow-feature)',
        fontFamily: FONT_INTER,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          style={{
            fontFamily: FONT_INTER,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--on-dark-65)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: FONT_INTER,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.16em',
            color: 'var(--gold-soft)',
            textTransform: 'uppercase',
          }}
        >
          Module {String(currentModule.num).padStart(2, '0')} &middot;{' '}
          {currentModule.mins} min
        </span>
      </div>
      <div>
        <h2
          style={{
            fontFamily: FONT_INTER,
            fontWeight: 700,
            fontSize: 26,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: 0,
            color: 'var(--cream)',
          }}
        >
          {currentModule.title}
        </h2>
        <p
          style={{
            margin: '6px 0 0',
            fontFamily: FONT_INTER,
            fontSize: 16,
            color: 'var(--on-dark-70)',
            lineHeight: 1.6,
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
          background: 'var(--gold)',
          color: 'var(--ink)',
          borderRadius: 12,
          fontFamily: FONT_INTER,
        }}
      >
        {verb}{' '}
        <span
          style={{
            fontFamily: FONT_INTER,
            fontWeight: 600,
            letterSpacing: 0,
            fontSize: 14,
            textTransform: 'none',
          }}
          aria-hidden="true"
        >
          →
        </span>
      </PrimaryButton>
    </div>
  );
}
