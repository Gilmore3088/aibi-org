import Link from 'next/link';

const MOCKUP_FONT = 'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

interface SavedArtifactSectionProps {
  readonly moduleNum: number;
  readonly totalModules: number;
  readonly isAlreadyCompleted: boolean;
  readonly artifactLabel: string;
}

export function SavedArtifactSection({
  moduleNum,
  totalModules,
  isAlreadyCompleted,
  artifactLabel,
}: SavedArtifactSectionProps) {
  return (
    <section id="st-saved" aria-labelledby="st-saved-h" style={{ scrollMarginTop: 160, paddingTop: 48 }}>
      <h2
        id="st-saved-h"
        style={{
          fontFamily: MOCKUP_FONT,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--gold-deep)',
          margin: '0 0 12px',
        }}
      >
        Saved to your Foundation Packet
      </h2>
      <div
        style={{
          padding: '20px 22px',
          background: 'white',
          border: '1px solid var(--ink-a10, rgba(7,26,47,0.10))',
          borderLeft: `4px solid ${isAlreadyCompleted ? 'var(--emerald-700)' : 'var(--gold)'}`,
          borderRadius: 16,
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '0 0 8px' }}>
          <span
            style={{
              fontFamily: MOCKUP_FONT,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
            }}
          >
            Packet item {moduleNum} of {totalModules}
          </span>
          <span
            style={{
              fontFamily: MOCKUP_FONT,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: isAlreadyCompleted ? 'var(--emerald-700)' : 'var(--gold-deep)',
              background: isAlreadyCompleted ? 'rgba(4,120,87,0.10)' : 'var(--gold-a20)',
              borderRadius: 999,
              padding: '3px 10px',
            }}
          >
            {isAlreadyCompleted ? 'Saved' : 'Not yet saved'}
          </span>
        </div>
        <p
          style={{
            fontFamily: MOCKUP_FONT,
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--ink)',
            margin: '0 0 6px',
            lineHeight: 1.5,
          }}
        >
          {artifactLabel}
        </p>
        <p
          style={{
            fontFamily: MOCKUP_FONT,
            fontSize: 14,
            color: 'var(--slate-600)',
            margin: '0 0 14px',
            lineHeight: 1.55,
          }}
        >
          {isAlreadyCompleted
            ? 'Saved to your Foundation Packet. Open the Submit step above to review or revise it.'
            : 'Complete the Submit step above and this artifact lands in your Foundation Packet — one of the twelve work products you finish the course with.'}
        </p>
        <Link
          href="/courses/foundation/program"
          style={{
            fontFamily: MOCKUP_FONT,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: 'var(--ink)',
            textDecoration: 'none',
          }}
        >
          View your Foundation Packet →
        </Link>
      </div>
    </section>
  );
}
