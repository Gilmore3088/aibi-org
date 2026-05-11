import { LMS_PILLARS, type LMSPillar } from './types';

interface Props {
  readonly pillarId: LMSPillar['id'];
  readonly size?: 'sm' | 'lg';
}

export function PillarTag({ pillarId, size = 'sm' }: Props) {
  const pillar = LMS_PILLARS.find((p) => p.id === pillarId);
  if (!pillar) return null;
  const big = size === 'lg';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          width: big ? 9 : 7,
          height: big ? 9 : 7,
          borderRadius: 1,
          background: pillar.color,
          display: 'inline-block',
        }}
      />
      <span
        style={{
          fontFamily: 'var(--ledger-mono)',
          fontSize: big ? 10.5 : 9.5,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: pillar.color,
          fontWeight: 600,
        }}
      >
        {pillar.label}
      </span>
    </span>
  );
}
