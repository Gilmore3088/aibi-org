// LedgerCard — Foundation Course primitive card. Design System §5.3.
// Standard | Feature (hero, gets --ledger-shadow) | Recessed (parch — no body text) | Tape (callout).

import type { HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'standard' | 'feature' | 'recessed' | 'tape';

interface LedgerCardProps extends HTMLAttributes<HTMLDivElement> {
  readonly variant?: CardVariant;
  readonly selected?: boolean;
  readonly children: ReactNode;
}

const VARIANTS: Record<CardVariant, string> = {
  standard:
    'bg-[var(--ledger-paper)] border border-[var(--ledger-rule)] rounded-[3px] ' +
    'hover:border-[var(--ledger-rule-strong)] transition-colors duration-[120ms]',
  feature:
    'bg-[var(--ledger-paper)] border border-[var(--ledger-rule)] rounded-[4px] ' +
    'shadow-[var(--ledger-shadow)] hover:border-[var(--ledger-rule-strong)] transition-colors duration-[120ms]',
  recessed: 'bg-[var(--ledger-parch)] border border-[var(--ledger-rule)] rounded-[3px]',
  tape: 'bg-[var(--ledger-tape)] border border-[var(--ledger-rule)] rounded-[3px]',
};

export function LedgerCard({
  variant = 'standard',
  selected = false,
  children,
  className = '',
  ...rest
}: LedgerCardProps) {
  const selectedRule = selected ? 'border-l-[2px] border-l-[var(--ledger-ink)]' : '';
  return (
    <div
      className={`${VARIANTS[variant]} ${selectedRule} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
