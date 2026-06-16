import type { CSSProperties } from 'react';
import { PillarTag } from '@/components/lms';
import type { LMSPillar } from '@/components/lms';
import type { ModuleStatus } from '../../_lib/courseProgress';

const MOCKUP_FONT = 'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const KICKER_STYLE: CSSProperties = {
  fontFamily: MOCKUP_FONT,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
};

const META_STYLE: CSSProperties = {
  fontFamily: MOCKUP_FONT,
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: '0.04em',
  color: 'var(--slate-500)',
};

interface ModuleHeaderCardProps {
  readonly moduleNumber: number;
  readonly titleMain: string;
  readonly titleTail: string | null;
  readonly keyOutput: string;
  readonly goalLine: string;
  readonly estimatedMinutes: number;
  readonly pillarId: LMSPillar['id'];
  readonly status: ModuleStatus;
  readonly statusLabel: string;
}

export function ModuleHeaderCard({
  moduleNumber,
  titleMain,
  titleTail,
  keyOutput,
  goalLine,
  estimatedMinutes,
  pillarId,
  status,
  statusLabel,
}: ModuleHeaderCardProps) {
  return (
    <header
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--slate-200)',
        borderRadius: 28,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-hero)',
      }}
    >
      {/* Dark navy band */}
      <div
        style={{
          background: 'var(--ink)',
          color: '#fff',
          padding: 'clamp(18px, 2.4vw, 22px) clamp(20px, 3vw, 28px)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <PillarTag pillarId={pillarId} />
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 14px',
            borderRadius: 999,
            background: 'var(--gold-a20)',
            color: 'var(--gold-soft)',
            fontFamily: MOCKUP_FONT,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          Module {String(moduleNumber).padStart(2, '0')} · {titleMain}
          {titleTail ? ` — ${titleTail}` : ''}
        </span>
        <span style={{ flex: 1, minWidth: 12 }} />
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: MOCKUP_FONT,
            color: status === 'locked' ? 'var(--on-dark-50)' : 'var(--gold-soft)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            fontSize: 12,
            whiteSpace: 'nowrap',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: status === 'current' || status === 'completed' ? 'var(--gold)' : 'transparent',
              border: status === 'locked' ? '1.5px solid var(--on-dark-50)' : 'none',
              boxShadow: status === 'current' ? '0 0 0 4px var(--gold-a20)' : 'none',
              display: 'inline-block',
              flex: 'none',
            }}
          />
          {statusLabel}
        </span>
      </div>

      {/* White body */}
      <div style={{ padding: 'clamp(28px, 3.4vw, 40px)' }}>
        <p style={{ ...KICKER_STYLE, margin: '0 0 8px' }}>You walk away with</p>
        <h1
          style={{
            fontFamily: MOCKUP_FONT,
            fontWeight: 700,
            fontSize: 'clamp(32px, 4.2vw, 48px)',
            lineHeight: 1.06,
            letterSpacing: '-0.025em',
            margin: '0 0 14px',
            color: 'var(--ink)',
          }}
        >
          {keyOutput}
        </h1>
        <p
          style={{
            fontFamily: MOCKUP_FONT,
            fontSize: 17,
            lineHeight: 1.6,
            color: 'var(--slate-600)',
            margin: '0 0 18px',
            maxWidth: '72ch',
            fontWeight: 400,
          }}
        >
          {goalLine}
        </p>
        <div
          aria-label="Module loop"
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
            fontFamily: MOCKUP_FONT,
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--slate-600)',
            letterSpacing: '0.04em',
          }}
        >
          <span style={META_STYLE}>{estimatedMinutes} min total</span>
          <span style={{ color: 'var(--slate-400)' }}>·</span>
          <span>Learn it</span>
          <span style={{ color: 'var(--slate-400)' }}>→</span>
          <span>Try it</span>
          <span style={{ color: 'var(--slate-400)' }}>→</span>
          <span>Use it</span>
          <span style={{ color: 'var(--slate-400)' }}>→</span>
          <span>Save it</span>
        </div>
      </div>
    </header>
  );
}
