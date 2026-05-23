// LedgerButton — Foundation Course primitive button. Design System §5.1.
// Mono caps for primary CTAs, 2px radius, no shadow, no scale-on-hover.

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface LedgerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: Variant;
  readonly size?: Size;
  readonly loading?: boolean;
  readonly children: ReactNode;
}

const BASE =
  'inline-flex items-center justify-center gap-2 font-mono font-semibold uppercase tracking-[0.12em] ' +
  'transition-colors duration-[120ms] ease-[cubic-bezier(0.4,0,0.2,1)] ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-[var(--ledger-ink)] disabled:opacity-50 disabled:cursor-not-allowed';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-[var(--ledger-ink)] text-[var(--ledger-paper)] border border-[var(--ledger-ink)] ' +
    'hover:bg-[var(--ledger-ink-2)] hover:border-[var(--ledger-ink-2)]',
  secondary:
    'bg-[var(--ledger-paper)] text-[var(--ledger-ink)] border border-[var(--ledger-ink)] ' +
    'hover:border-[var(--ledger-ink-2)]',
  tertiary:
    'bg-transparent text-[var(--ledger-ink)] border border-transparent ' +
    'hover:underline underline-offset-4',
  destructive:
    'bg-[var(--ledger-weak)] text-[var(--ledger-paper)] border border-[var(--ledger-weak)] ' +
    'hover:opacity-90',
};

const SIZES: Record<Size, string> = {
  sm: 'text-[0.7rem] px-3 py-1.5 rounded-[2px] min-h-[36px]',
  md: 'text-xs px-4 py-2 rounded-[2px] min-h-[44px]',
  lg: 'text-sm px-6 py-3 rounded-[2px] min-h-[48px]',
};

export function LedgerButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  type = 'button',
  ...rest
}: LedgerButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span aria-live="polite" className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-3 w-3 border-2 border-current border-r-transparent rounded-full animate-spin"
          />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
