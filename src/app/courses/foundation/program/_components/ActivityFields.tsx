'use client';

// Shared activity field renderers used by ActivityForm and
// AcceptableUseCardForm. Both consume the shared <FormField> wrapper +
// mockupInputStyle so every activity form looks and behaves identically
// (radio / select / textarea / text), with consistent label, error, and
// hint treatment plus A11Y wiring.

import type { CSSProperties } from 'react';
import type { ActivityField } from '@content/courses/foundation-program';
import { FormField, mockupInputStyle } from '@/components/lms';

const INTER_STACK = 'Inter, ui-sans-serif, system-ui, sans-serif';
const MONO_STACK = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

const readOnlyValueStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--ink-a10)',
  background: 'var(--cream-2)',
  fontFamily: INTER_STACK,
  fontSize: 16,
  lineHeight: 1.6,
  color: 'var(--ink)',
  minHeight: 36,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
};

export function ActivityReadOnlyField({
  field,
  value,
}: {
  readonly field: ActivityField;
  readonly value: string;
}) {
  if (field.type === 'radio') {
    return (
      <FormField label={field.label}>
        <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(field.options ?? []).map((opt) => (
            <label
              key={opt.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: INTER_STACK,
                fontSize: 16,
                lineHeight: 1.6,
                color: 'var(--ink)',
              }}
            >
              <input
                type="radio"
                name={`readonly-${field.id}`}
                value={opt.value}
                checked={value === opt.value}
                readOnly
                disabled
              />
              {opt.label}
            </label>
          ))}
        </div>
      </FormField>
    );
  }

  const display =
    field.type === 'select'
      ? ((field.options ?? []).find((o) => o.value === value)?.label ?? value)
      : value;

  return (
    <FormField label={field.label}>
      <div
        style={{
          ...readOnlyValueStyle,
          minHeight: field.type === 'textarea' ? 80 : 36,
          fontFamily: field.type === 'textarea' ? MONO_STACK : INTER_STACK,
          fontSize: 16,
        }}
      >
        {display || (
          <span style={{ color: 'var(--slate-500)' }}>No response</span>
        )}
      </div>
    </FormField>
  );
}

export function ActivityInteractiveField({
  field,
  value,
  error,
  onChange,
}: {
  readonly field: ActivityField;
  readonly value: string;
  readonly error?: string;
  readonly onChange: (fieldId: string, value: string) => void;
}) {
  const hasError = Boolean(error);
  const hint =
    field.type === 'textarea' && field.minLength
      ? `${value.length}/${field.minLength} characters`
      : field.minLength
        ? `Minimum ${field.minLength} characters`
        : undefined;

  if (field.type === 'radio') {
    return (
      <FormField label={field.label} required={field.required} error={error} hint={hint}>
        <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(field.options ?? []).map((opt) => (
            <label
              key={opt.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontFamily: INTER_STACK,
                fontSize: 16,
                lineHeight: 1.6,
                color: 'var(--ink)',
              }}
            >
              <input
                type="radio"
                name={field.id}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(field.id, opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </FormField>
    );
  }

  if (field.type === 'select') {
    return (
      <FormField label={field.label} htmlFor={field.id} required={field.required} error={error} hint={hint}>
        <select
          id={field.id}
          name={field.id}
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
          style={mockupInputStyle({ invalid: hasError })}
          aria-invalid={hasError}
          aria-required={field.required}
        >
          <option value="">{field.placeholder ?? 'Select an option'}</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FormField>
    );
  }

  if (field.type === 'textarea') {
    return (
      <FormField label={field.label} htmlFor={field.id} required={field.required} error={error} hint={hint}>
        <textarea
          id={field.id}
          name={field.id}
          placeholder={field.placeholder}
          value={value}
          rows={4}
          onChange={(e) => onChange(field.id, e.target.value)}
          style={mockupInputStyle({ invalid: hasError, multi: true })}
          aria-invalid={hasError}
          aria-required={field.required}
        />
      </FormField>
    );
  }

  return (
    <FormField label={field.label} htmlFor={field.id} required={field.required} error={error} hint={hint}>
      <input
        type="text"
        id={field.id}
        name={field.id}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(field.id, e.target.value)}
        style={mockupInputStyle({ invalid: hasError })}
        aria-invalid={hasError}
        aria-required={field.required}
      />
    </FormField>
  );
}
