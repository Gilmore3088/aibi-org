// StickyResumeBar — the first viewport of the /program home.
//
// Audit §2 item 1. Dark navy, sticky to the top of the main column.
// Shows: kicker (CONTINUE / START), module number + title, progress dots
// (▣ completed · ◐ current · ▢ locked), a last-activity blurb, an
// estimated time-remaining blurb, and a gold "CONTINUE →" CTA.
//
// For brand-new learners (no completed modules) the bar reshapes to
// "START MODULE 1" but keeps the same visual silhouette so the page
// doesn't shift between the two states.

import { PrimaryButton, type LMSModule } from '@/components/lms';

const FONT_INTER =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

interface StickyResumeBarProps {
  readonly currentModule: LMSModule;
  readonly completedModules: readonly number[];
  readonly totalModules: number;
  readonly lastActivityLabel?: string | null;
}

const DOT_BASE: React.CSSProperties = {
  display: 'inline-block',
  width: 10,
  height: 10,
  borderRadius: 999,
  border: '1px solid var(--on-dark-30, rgba(247,243,234,0.3))',
};

function ProgressDot({ state }: { readonly state: 'completed' | 'current' | 'locked' }) {
  const style: React.CSSProperties =
    state === 'completed'
      ? { ...DOT_BASE, background: 'var(--gold)', borderColor: 'var(--gold)' }
      : state === 'current'
        ? {
            ...DOT_BASE,
            background: 'var(--gold-soft)',
            borderColor: 'var(--gold-soft)',
            boxShadow: '0 0 0 3px rgba(230, 211, 155, 0.18)',
          }
        : { ...DOT_BASE };
  return <span aria-hidden="true" style={style} />;
}

export function StickyResumeBar({
  currentModule,
  completedModules,
  totalModules,
  lastActivityLabel,
}: StickyResumeBarProps) {
  const completedCount = completedModules.length;
  const isNewLearner = completedCount === 0;
  const kicker = isNewLearner ? 'START HERE' : 'CONTINUE';
  const ctaLabel = isNewLearner ? 'START MODULE 1' : 'CONTINUE';
  const titlePrefix = isNewLearner
    ? `Module 01: ${currentModule.title}`
    : `Module ${String(currentModule.num).padStart(2, '0')}: ${currentModule.title}`;
  const lastActivity =
    lastActivityLabel ??
    (isNewLearner
      ? 'Your work starts in the Takeaway section.'
      : 'Pick back up where you left off.');
  const remainingLabel = `About ${currentModule.mins} min in this module`;

  const dots = Array.from({ length: totalModules }, (_, i) => {
    const num = i + 1;
    if (completedModules.includes(num)) return 'completed' as const;
    if (num === currentModule.num) return 'current' as const;
    return 'locked' as const;
  });

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        marginBottom: 40,
        background: 'var(--ink)',
        color: 'var(--cream)',
        padding: 'clamp(24px, 2.6vw, 32px) clamp(24px, 2.8vw, 36px)',
        borderRadius: 24,
        boxShadow: 'var(--shadow-feature)',
        fontFamily: FONT_INTER,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--gold-soft)',
              marginBottom: 10,
            }}
          >
            {kicker}
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(26px, 2.6vw, 30px)',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              lineHeight: 1.18,
              color: 'var(--cream)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {titlePrefix}
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 14,
              flexWrap: 'wrap',
            }}
            aria-label={`Progress: ${completedCount} of ${totalModules} complete`}
          >
            {dots.map((state, i) => (
              <ProgressDot key={i} state={state} />
            ))}
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--on-dark-65, rgba(247,243,234,0.65))',
                marginLeft: 6,
              }}
            >
              {completedCount}/{totalModules} complete
            </span>
          </div>
          <p
            style={{
              margin: '16px 0 0',
              fontSize: 15,
              lineHeight: 1.6,
              color: 'var(--on-dark-70, rgba(247,243,234,0.7))',
              maxWidth: '64ch',
            }}
          >
            <span style={{ color: 'var(--on-dark-70, rgba(247,243,234,0.7))' }}>
              {lastActivity}
            </span>
            <span aria-hidden="true" style={{ margin: '0 8px', opacity: 0.5 }}>
              ·
            </span>
            <span>{remainingLabel}</span>
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
            whiteSpace: 'nowrap',
          }}
        >
          {ctaLabel}{' '}
          <span
            aria-hidden="true"
            style={{
              fontWeight: 600,
              letterSpacing: 0,
              fontSize: 14,
              textTransform: 'none',
            }}
          >
            →
          </span>
        </PrimaryButton>
      </div>
    </div>
  );
}
