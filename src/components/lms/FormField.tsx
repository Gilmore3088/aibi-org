'use client';

import type { CSSProperties, ReactNode } from 'react';

interface BaseProps {
  readonly label: string;
  readonly htmlFor?: string;
  readonly required?: boolean;
  readonly error?: string;
  readonly hint?: string;
  readonly children: ReactNode;
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: 9.5,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  marginBottom: 6,
};

const requiredMarkStyle: CSSProperties = {
  marginLeft: 6,
  color: 'var(--gold-deep)',
};

const hintStyle: CSSProperties = {
  marginTop: 6,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: 10,
  letterSpacing: '0.04em',
  color: 'var(--slate-600)',
};

const errorStyle: CSSProperties = {
  marginTop: 6,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: 10.5,
  letterSpacing: '0.04em',
  color: 'var(--gold-deep)',
};

/**
 * Ledger-styled form field wrapper. Renders a mono uppercase kicker label
 * plus optional required marker, error message, and hint line. The actual
 * input is supplied as children so callers can choose <input>, <textarea>,
 * <select>, or a custom control.
 */
export function FormField({ label, htmlFor, required, error, hint, children }: BaseProps) {
  return (
    <div>
      <label htmlFor={htmlFor} style={labelStyle}>
        {label}
        {required && (
          <span style={requiredMarkStyle} aria-label="required">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p style={errorStyle} role="alert">
          Error: {error}
        </p>
      ) : hint ? (
        <p style={hintStyle}>{hint}</p>
      ) : null}
    </div>
  );
}

interface InputStyleOptions {
  readonly invalid?: boolean;
  readonly multi?: boolean;
}

/**
 * Standard Ledger input style — matches the prototype's FormField input
 * styling. Use on <input>, <textarea>, and <select>.
 */
export function ledgerInputStyle({ invalid, multi }: InputStyleOptions = {}): CSSProperties {
  return {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 2,
    border: `1px solid ${invalid ? 'var(--gold-deep)' : 'var(--ink-a10)'}`,
    background: 'var(--cream)',
    fontFamily: multi ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' : 'var(--font-inter, Inter, ui-sans-serif, system-ui, sans-serif)',
    fontSize: multi ? 12.5 : 13.5,
    color: 'var(--ink)',
    resize: multi ? 'vertical' : undefined,
  };
}
