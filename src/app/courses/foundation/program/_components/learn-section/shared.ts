import type { CSSProperties } from 'react';

export const FONT_INTER = 'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

export const eyebrowStyle: CSSProperties = {
  fontFamily: FONT_INTER,
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

export function dispatchLearningSignal(
  moduleNumber: number,
  signal: string,
  active: boolean,
  extraDetail?: Record<string, unknown>,
) {
  window.dispatchEvent(
    new CustomEvent('foundation-learning-signal-updated', {
      detail: { moduleNumber, signal, active, ...extraDetail },
    }),
  );
}
