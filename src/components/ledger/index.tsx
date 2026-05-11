'use client';

import Link from 'next/link';
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

import './ledger.css';

// Wrapper that opts a subtree into the Ledger token + base-style scope.
// Pages that want their entire body in Ledger style use <LedgerSurface>;
// individual islands (e.g. a card on a legacy page) can use <LedgerScope>.
export function LedgerScope({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`ledger ${className}`.trim()}>{children}</div>;
}

// Full-page Ledger surface: header lockup + main column + footer.
// Used by /auth/* and any other chromeless redesigned page.
export function LedgerSurface({
  brandLine1 = 'The AI Banking',
  brandLine2 = 'Institute',
  brandHref = '/',
  headerRight,
  footer,
  children,
}: {
  brandLine1?: string;
  brandLine2?: string;
  brandHref?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="ledger ledger-surface">
      <header className="ledger-surface__header">
        <Link
          href={brandHref}
          aria-label="The AI Banking Institute"
          className="ledger-lockup ledger-lockup--lg"
        >
          <span className="l1">{brandLine1}</span>
          <span className="l2">{brandLine2}</span>
        </Link>
        {headerRight}
      </header>
      <main className="ledger-surface__main">{children}</main>
      {footer ? (
        <footer className="ledger-surface__footer">{footer}</footer>
      ) : (
        <footer className="ledger-surface__footer">
          <span>© {new Date().getFullYear()} The AI Banking Institute</span>
          <span>Editorial · Ledger</span>
        </footer>
      )}
    </div>
  );
}

// LedgerArticle — eyebrow + h1 + prose body. Wraps content in .ledger so
// the Ledger tokens are in scope. Designed for legal pages, marketing
// inner pages, and any long-form content. Does NOT add a page header
// (use LedgerSurface for that); these pages keep the global site chrome.
export function LedgerArticle({
  eyebrow,
  title,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <LedgerScope>
      <article className="ledger-article">
        <header className="ledger-article__head">
          <LedgerEyebrow>{eyebrow}</LedgerEyebrow>
          <LedgerH1>{title}</LedgerH1>
        </header>
        <div className="ledger-prose">{children}</div>
      </article>
    </LedgerScope>
  );
}

export function LedgerEyebrow({ children }: { children: ReactNode }) {
  return <p className="ledger-eyebrow">{children}</p>;
}

export function LedgerH1({ children }: { children: ReactNode }) {
  return <h1 className="ledger-h1">{children}</h1>;
}
export function LedgerH2({ children }: { children: ReactNode }) {
  return <h2 className="ledger-h2">{children}</h2>;
}
export function LedgerH3({ children }: { children: ReactNode }) {
  return <h3 className="ledger-h3">{children}</h3>;
}
export function LedgerLede({ children }: { children: ReactNode }) {
  return <p className="ledger-lede">{children}</p>;
}

export function LedgerCard({
  variant = 'paper',
  className = '',
  children,
}: {
  variant?: 'paper' | 'strong' | 'ink';
  className?: string;
  children: ReactNode;
}) {
  const variantClass =
    variant === 'strong' ? 'ledger-card--strong' : variant === 'ink' ? 'ledger-card--ink' : '';
  return <div className={`ledger-card ${variantClass} ${className}`.trim()}>{children}</div>;
}

export function LedgerAlert({
  variant = 'info',
  children,
}: {
  variant?: 'error' | 'info';
  children: ReactNode;
}) {
  return (
    <div role="alert" className={`ledger-alert ledger-alert--${variant}`}>
      {children}
    </div>
  );
}

type FieldProps = {
  label: ReactNode;
  trailing?: ReactNode;
};

// Label + input. `trailing` lets you put e.g. a "Forgot?" link next to the label.
export const LedgerField = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & FieldProps
>(function LedgerField({ label, trailing, id, ...inputProps }, ref) {
  const inputId = id ?? `ledger-field-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className={`ledger-field${trailing ? ' ledger-field--inline' : ''}`}>
      <div className={trailing ? 'flex items-baseline justify-between' : ''}>
        <label htmlFor={inputId}>{label}</label>
        {trailing}
      </div>
      <input ref={ref} id={inputId} {...inputProps} />
    </div>
  );
});

export const LedgerTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { label: ReactNode }
>(function LedgerTextarea({ label, id, ...textareaProps }, ref) {
  const inputId = id ?? `ledger-textarea-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className="ledger-field">
      <label htmlFor={inputId}>{label}</label>
      <textarea ref={ref} id={inputId} {...textareaProps} />
    </div>
  );
});

export const LedgerSelect = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { label: ReactNode; children: ReactNode }
>(function LedgerSelect({ label, id, children, ...selectProps }, ref) {
  const inputId = id ?? `ledger-select-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className="ledger-field">
      <label htmlFor={inputId}>{label}</label>
      <select ref={ref} id={inputId} {...selectProps}>
        {children}
      </select>
    </div>
  );
});

type ButtonVariant = 'primary' | 'accent' | 'ghost';
export const LedgerButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; block?: boolean }
>(function LedgerButton({ variant = 'primary', block, className = '', children, ...buttonProps }, ref) {
  return (
    <button
      ref={ref}
      className={`ledger-btn ledger-btn--${variant}${block ? ' ledger-btn--block' : ''} ${className}`.trim()}
      {...buttonProps}
    >
      {children}
    </button>
  );
});

// Segmented two/three-way toggle. Items pass {value,label} pairs.
export function LedgerToggle<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (next: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="ledger-toggle" role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
