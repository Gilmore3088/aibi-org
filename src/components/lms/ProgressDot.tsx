import type { ModuleStatus } from './types';

interface Props {
  readonly status: ModuleStatus;
  readonly size?: number;
}

// Decorative status dot with an accessible label. Bare <span> + aria-label
// is an axe-core "aria-prohibited-attr" violation in WCAG 2.1 — labels
// require a role. role="img" is the canonical choice for a visual glyph
// that conveys meaning.
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
        role="img"
        aria-label="Complete"
        style={{ ...common, background: 'var(--ink-2)' }}
      />
    );
  }
  if (status === 'current') {
    return (
      <span
        role="img"
        aria-label="Current"
        style={{
          ...common,
          background: 'var(--gold)',
          boxShadow: '0 0 0 4px rgba(200, 162, 74, 0.18)',
        }}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label="Locked"
      style={{
        ...common,
        border: '1.5px solid var(--ink-a10)',
        background: 'transparent',
      }}
    />
  );
}
