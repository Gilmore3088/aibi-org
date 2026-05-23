// KickerLabel — mono caps tracked label. Design System §3 (text-meta).

import type { HTMLAttributes, ReactNode } from 'react';

interface KickerLabelProps extends HTMLAttributes<HTMLSpanElement> {
  readonly children: ReactNode;
  readonly tone?: 'ink' | 'muted' | 'accent';
}

const TONES = {
  ink: 'text-[var(--ledger-ink)]',
  muted: 'text-[var(--ledger-muted)]',
  accent: 'text-[var(--ledger-accent)]',
} as const;

export function KickerLabel({
  children,
  tone = 'muted',
  className = '',
  ...rest
}: KickerLabelProps) {
  return (
    <span
      className={`font-mono font-semibold text-[0.7rem] uppercase tracking-[0.18em] ${TONES[tone]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
