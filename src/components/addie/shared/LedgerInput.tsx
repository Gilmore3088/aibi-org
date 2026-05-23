// LedgerInput — Foundation Course primitive input. Design System §5.2.
// Label always present above the input; help/error below; gold left-rule on focus.

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react';

interface LedgerInputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: ReactNode;
  readonly help?: ReactNode;
  readonly error?: string | null;
}

const BASE_INPUT =
  'block w-full bg-[var(--ledger-paper)] border border-[var(--ledger-rule-strong)] ' +
  'rounded-[2px] px-3 py-2 min-h-[44px] text-[var(--ledger-ink)] ' +
  'placeholder:text-[var(--ledger-muted)] ' +
  'transition-colors duration-[120ms] ease-[cubic-bezier(0.4,0,0.2,1)] ' +
  'focus:outline-none focus:border-[var(--ledger-ink)] ' +
  'focus:border-l-[2px] focus:border-l-[var(--ledger-accent)] ' +
  'disabled:bg-[var(--ledger-parch)] disabled:text-[var(--ledger-muted)] disabled:cursor-not-allowed';

const ERROR_INPUT = 'border-[var(--ledger-weak)] focus:border-[var(--ledger-weak)] focus:border-l-[var(--ledger-weak)]';

export const LedgerInput = forwardRef<HTMLInputElement, LedgerInputProps>(
  function LedgerInput({ label, help, error, id, className = '', ...rest }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helpId = help ? `${inputId}-help` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={className}>
        <label
          htmlFor={inputId}
          className="block font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ledger-ink-2)] mb-2"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${BASE_INPUT} ${error ? ERROR_INPUT : ''}`}
          {...rest}
        />
        {help && !error ? (
          <p id={helpId} className="mt-2 text-sm text-[var(--ledger-muted)]">
            {help}
          </p>
        ) : null}
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="mt-2 text-sm text-[var(--ledger-weak)]"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
