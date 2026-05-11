import type { ModuleStatus } from './types';

interface Props {
  readonly status: ModuleStatus;
  readonly size?: number;
}

export function ProgressDot({ status, size = 10 }: Props) {
  const common = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'inline-block',
    flex: 'none' as const,
  };
  if (status === 'completed') {
    return (
      <span
        style={{ ...common, background: 'var(--ledger-accent-2)' }}
        aria-label="Complete"
      />
    );
  }
  if (status === 'current') {
    return (
      <span
        style={{
          ...common,
          background: 'var(--ledger-accent)',
          boxShadow: '0 0 0 4px var(--ledger-accent-soft)',
        }}
        aria-label="Current"
      />
    );
  }
  return (
    <span
      style={{
        ...common,
        border: '1.5px solid var(--ledger-rule-strong)',
        background: 'transparent',
      }}
      aria-label="Locked"
    />
  );
}
