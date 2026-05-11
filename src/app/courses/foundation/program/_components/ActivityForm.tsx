'use client';

// ActivityForm — Interactive activity form that replaces ActivityFormShell for enrolled learners.
// Handles free-text and form-type activities with submission to /api/courses/submit-activity.
//
// LMS reskin (PR 3 of 7): renders inside <ActivityWorkspace> with <FormField>
// primitives from src/components/lms/. All submission, validation, error
// handling, focus management, and artifact download behavior is preserved
// unchanged — only the visual chrome moves to the Ledger system.
//
// A11Y-01: keyboard accessible (focus rings, focus managed to success region on submit).
// A11Y-02: text error messages with "Error:" prefix (not color-only).
// A11Y-05: artifact download uses plain <a href download> anchor (no JS required).

import React, { useState, useCallback, useRef, useEffect, type CSSProperties } from 'react';
import type { Activity, ActivityField } from '@content/courses/foundation-program';
import { ActivityWorkspace, FormField, ledgerInputStyle } from '@/components/lms';

export interface ActivityFormProps {
  readonly activity: Activity;
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponse?: Record<string, string> | null;
  readonly onSubmitSuccess?: (activityId: string) => void;
}

interface FormState {
  values: Record<string, string>;
  errors: Record<string, string>;
  submitting: boolean;
  submitted: boolean;
  serverError: string | null;
}

function getInitialValues(
  fields: readonly ActivityField[],
  existingResponse?: Record<string, string> | null,
): Record<string, string> {
  const initial: Record<string, string> = {};
  for (const field of fields) {
    initial[field.id] = existingResponse?.[field.id] ?? '';
  }
  return initial;
}

function validateForm(
  fields: readonly ActivityField[],
  values: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const value = values[field.id] ?? '';
    if (field.required && value.trim().length === 0) {
      errors[field.id] = `${field.label} is required.`;
      continue;
    }
    if (field.minLength && value.length < field.minLength) {
      errors[field.id] =
        `Must be at least ${field.minLength} characters (currently ${value.length}).`;
    }
  }
  return errors;
}

const readOnlyValueStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 2,
  border: '1px solid var(--ledger-rule)',
  background: 'var(--ledger-parch)',
  fontFamily: 'var(--ledger-sans)',
  fontSize: 13.5,
  color: 'var(--ledger-ink)',
  minHeight: 36,
  whiteSpace: 'pre-wrap',
};

function ReadOnlyField({
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
                fontFamily: 'var(--ledger-sans)',
                fontSize: 13.5,
                color: 'var(--ledger-ink)',
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
          fontFamily:
            field.type === 'textarea' ? 'var(--ledger-mono)' : 'var(--ledger-sans)',
          fontSize: field.type === 'textarea' ? 12.5 : 13.5,
        }}
      >
        {display || (
          <span style={{ color: 'var(--ledger-muted)' }}>No response</span>
        )}
      </div>
    </FormField>
  );
}

function InteractiveField({
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
                fontFamily: 'var(--ledger-sans)',
                fontSize: 13.5,
                color: 'var(--ledger-ink)',
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
          style={ledgerInputStyle({ invalid: hasError })}
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
          style={ledgerInputStyle({ invalid: hasError, multi: true })}
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
        style={ledgerInputStyle({ invalid: hasError })}
        aria-invalid={hasError}
        aria-required={field.required}
      />
    </FormField>
  );
}

const buttonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  fontFamily: 'var(--ledger-mono)',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight: 600,
  padding: '12px 20px',
  borderRadius: 2,
  cursor: 'pointer',
  border: 'none',
  background: 'var(--ledger-ink)',
  color: 'var(--ledger-paper)',
  transition: 'background .18s ease',
};

const disabledButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: 'var(--ledger-rule-strong)',
  color: 'var(--ledger-paper)',
  cursor: 'not-allowed',
};

const downloadLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  fontFamily: 'var(--ledger-mono)',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight: 600,
  padding: '10px 18px',
  borderRadius: 2,
  border: '1px solid var(--ledger-rule-strong)',
  color: 'var(--ledger-ink)',
  textDecoration: 'none',
};

export function ActivityForm({
  activity,
  enrollmentId,
  moduleNumber,
  existingResponse,
  onSubmitSuccess,
}: ActivityFormProps) {
  const isReadOnly = existingResponse != null;

  const [state, setState] = useState<FormState>({
    values: getInitialValues(activity.fields, existingResponse),
    errors: {},
    submitting: false,
    submitted: isReadOnly,
    serverError: null,
  });

  // A11Y-01: Move focus to success region after submission so keyboard/SR users know outcome
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.submitted && !isReadOnly && successRef.current) {
      successRef.current.focus();
    }
  }, [state.submitted, isReadOnly]);

  const handleChange = useCallback((fieldId: string, value: string) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [fieldId]: value },
      errors: { ...prev.errors, [fieldId]: '' },
      serverError: null,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const errors = validateForm(activity.fields, state.values);
      if (Object.keys(errors).length > 0) {
        setState((prev) => ({ ...prev, errors }));
        return;
      }

      setState((prev) => ({ ...prev, submitting: true, serverError: null }));

      try {
        const res = await fetch('/api/courses/submit-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollmentId,
            moduleNumber,
            activityId: activity.id,
            response: state.values,
          }),
        });

        if (res.ok) {
          setState((prev) => ({ ...prev, submitting: false, submitted: true, errors: {} }));
          onSubmitSuccess?.(activity.id);
          return;
        }

        const data = (await res.json()) as { error?: string; fieldErrors?: Record<string, string> };

        if (res.status === 409) {
          setState((prev) => ({ ...prev, submitting: false, submitted: true }));
          onSubmitSuccess?.(activity.id);
          return;
        }

        if (res.status === 400 && data.fieldErrors) {
          setState((prev) => ({
            ...prev,
            submitting: false,
            errors: data.fieldErrors ?? {},
          }));
          return;
        }

        if (res.status === 401 || res.status === 403) {
          setState((prev) => ({
            ...prev,
            submitting: false,
            serverError: 'Your session has expired. Please refresh the page and try again.',
          }));
          return;
        }

        setState((prev) => ({
          ...prev,
          submitting: false,
          serverError: data.error ?? 'Submission failed. Please try again.',
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          submitting: false,
          serverError: 'Network error. Please check your connection and try again.',
        }));
      }
    },
    [activity.fields, activity.id, enrollmentId, moduleNumber, onSubmitSuccess, state.values],
  );

  const showArtifactDownload =
    state.submitted &&
    activity.completionTrigger === 'artifact-download' &&
    activity.artifactId;

  return (
    <ActivityWorkspace
      activityId={activity.id}
      title={activity.title}
      lead={activity.description}
      submitted={state.submitted}
    >
      {state.submitted ? (
        <div
          ref={successRef}
          tabIndex={-1}
          aria-live="polite"
          aria-label="Activity submitted successfully"
          style={{ display: 'grid', gap: 14 }}
        >
          {activity.fields.map((field) => (
            <ReadOnlyField key={field.id} field={field} value={state.values[field.id] ?? ''} />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gap: 14 }}>
            {activity.fields.map((field) => (
              <InteractiveField
                key={field.id}
                field={field}
                value={state.values[field.id] ?? ''}
                error={state.errors[field.id]}
                onChange={handleChange}
              />
            ))}
          </div>

          {state.serverError && (
            <p
              style={{
                marginTop: 14,
                padding: '10px 12px',
                borderLeft: '2px solid var(--ledger-weak)',
                background: 'rgba(142,59,42,0.06)',
                color: 'var(--ledger-ink)',
                fontFamily: 'var(--ledger-sans)',
                fontSize: 13,
              }}
              role="alert"
            >
              {state.serverError}
            </p>
          )}

          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: '1px solid var(--ledger-rule)',
            }}
          >
            <button
              type="submit"
              disabled={state.submitting}
              style={state.submitting ? disabledButtonStyle : buttonStyle}
              aria-label={state.submitting ? 'Submitting activity…' : 'Submit activity'}
            >
              {state.submitting ? 'Submitting…' : 'Submit Activity'}
            </button>
          </div>
        </form>
      )}

      {showArtifactDownload && (
        <div
          style={{
            marginTop: 22,
            paddingTop: 16,
            borderTop: '1px solid var(--ledger-rule)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--ledger-mono)',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ledger-muted)',
              margin: '0 0 10px',
            }}
          >
            Your artifact is ready
          </p>
          <a
            href={
              activity.artifactId?.startsWith('aibi-p-m')
                ? `/api/courses/generate-module-artifact?module=${moduleNumber}`
                : `/artifacts/${activity.artifactId}.pdf`
            }
            download
            style={downloadLinkStyle}
          >
            ↓ Download{' '}
            {activity.artifactId
              ?.replace(/-/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </a>
        </div>
      )}
    </ActivityWorkspace>
  );
}
