import type { ArtifactFirstMeta } from '@content/courses/foundation-program';
import { eyebrowStyle } from './shared';

export function PacketContinuityPanel({
  current,
  previous,
  next,
  moduleNumber,
}: {
  readonly current: ArtifactFirstMeta | undefined;
  readonly previous: ArtifactFirstMeta | undefined;
  readonly next: ArtifactFirstMeta | undefined;
  readonly moduleNumber: number;
}) {
  const items = [
    {
      label: moduleNumber === 1 ? 'Start with work' : 'Remember',
      title: previous ? `Module ${previous.module}: ${previous.saved}` : 'One real task from this week',
      body: previous
        ? 'Before the lab, recall what you saved and name one rule you still need to apply.'
        : 'Choose a realistic, non-sensitive task so the course starts from work you actually recognize.',
    },
    {
      label: 'Build today',
      title: current?.saved ?? 'This module artifact',
      body: current
        ? current.mustProve
        : 'Produce one inspected artifact before moving to the next module.',
    },
    {
      label: next ? 'Carry forward' : 'Use after course',
      title: next ? `Module ${next.module}: ${next.saved}` : 'Your complete Foundation Packet',
      body: next
        ? 'The artifact you save here becomes context for the next module, not a one-off exercise.'
        : 'Use the packet as evidence of safe, reviewable AI practice in your role.',
    },
  ] as const;

  return (
    <details
      aria-labelledby={`m${moduleNumber}-continuity-heading`}
      data-testid="foundation-packet-continuity"
      style={{
        border: '1px solid var(--ink-a10)',
        borderRadius: 18,
        background: 'var(--cream)',
        overflow: 'hidden',
      }}
    >
      <summary
        style={{
          padding: '18px clamp(20px, 2.6vw, 26px)',
          display: 'flex',
          gap: 16,
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          cursor: 'pointer',
          listStyle: 'none',
        }}
      >
        <div>
          <p style={{ ...eyebrowStyle, marginBottom: 8 }}>Packet connection</p>
          <h3
            id={`m${moduleNumber}-continuity-heading`}
            style={{
              margin: 0,
              color: 'var(--ink)',
              fontSize: 'clamp(1.25rem, 2vw, 1.625rem)',
              lineHeight: 1.12,
              letterSpacing: '-0.01em',
              fontWeight: 850,
            }}
          >
            Need the course thread? Open the packet context.
          </h3>
        </div>
        <span
          style={{
            color: 'var(--slate-500)',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Optional
        </span>
      </summary>

      <div
        className="foundation-continuity__grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.label}
            style={{
              padding: 'clamp(18px, 2.4vw, 24px)',
              borderLeft: index === 0 ? 'none' : '1px solid var(--ink-a10)',
              background: index === 1 ? '#fff' : 'transparent',
            }}
          >
            <p style={{ ...eyebrowStyle, color: index === 1 ? 'var(--gold-deep)' : 'var(--slate-500)', marginBottom: 10 }}>
              {item.label}
            </p>
            <h4
              style={{
                margin: '0 0 8px',
                color: 'var(--ink)',
                fontSize: '1rem',
                lineHeight: 1.25,
                fontWeight: 850,
                letterSpacing: '-0.01em',
              }}
            >
              {item.title}
            </h4>
            <p style={{ margin: 0, color: 'var(--slate-600)', fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 600 }}>
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}
