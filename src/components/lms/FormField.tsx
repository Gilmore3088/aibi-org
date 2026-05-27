'use client';

// Shared LMS form field primitive — mockup design system (Wave 1, 2026-05-27).
// Renders a small-caps Inter kicker label, optional required marker, error
// message, and hint line. The input itself is supplied as children so callers
// can choose <input>, <textarea>, <select>, or a custom control.
//
// Returns mockup-token input styles. Was previously named `ledgerInputStyle`
// during the Ledger era; renamed to `mockupInputStyle` 2026-05-27.

import type { CSSProperties, ReactNode } from 'react';

interface BaseProps {
  readonly label: string;
  readonly htmlFor?: string;
  readonly required?: boolean;
  readonly error?: string;
  readonly hint?: string;
  readonly children: ReactNode;
}

const INTER_STACK =
  'var(--font-inter, Inter), ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const labelStyle: CSSProperties = {
  display: 'block',
  fontFamily: INTER_STACK,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.16em',
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
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: '0.01em',
  color: 'var(--slate-600)',
};

const errorStyle: CSSProperties = {
  marginTop: 6,
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.01em',
  color: 'var(--gold-deep)',
};

/**
 * Shared LMS form field wrapper. Renders an Inter small-caps kicker label
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
 * Standard mockup-system input style. Use on <input>, <textarea>, and
 * <select>. Returns Inter typography, ink/cream/gold tokens, 12px radius.
 */
export function mockupInputStyle({ invalid, multi }: InputStyleOptions = {}): CSSProperties {
  return {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    border: `1px solid ${invalid ? 'var(--gold-deep)' : 'var(--ink-a10)'}`,
    background: 'var(--cream)',
    fontFamily: INTER_STACK,
    fontSize: multi ? 13 : 14,
    fontWeight: 500,
    color: 'var(--ink)',
    resize: multi ? 'vertical' : undefined,
  };
}
