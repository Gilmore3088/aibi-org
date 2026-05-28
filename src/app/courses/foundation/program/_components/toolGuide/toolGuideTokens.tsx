// Shared text styles + a small SectionLabel primitive for the
// ToolGuide accordion contents.

import type { CSSProperties } from 'react';

export const COPY_RESET_MS = 2000;

export const KICKER: CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
};

export const MONO_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

export function SectionLabel({ children }: { readonly children: React.ReactNode }) {
  return (
    <p style={{ ...KICKER, color: 'var(--slate-500)', margin: '0 0 4px' }}>{children}</p>
  );
}

export function Bullet({ colorVar }: { readonly colorVar: string }) {
  return (
    <span
      style={{
        marginTop: 7,
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: colorVar,
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  );
}
