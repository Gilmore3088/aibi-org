'use client';

// ActivityForm — Interactive activity form that replaces ActivityFormShell for enrolled learners.
// Handles free-text and form-type activities with submission to /api/courses/submit-activity.
// A11Y-01: keyboard accessible (focus rings, focus managed to success region on submit).
// A11Y-02: text error messages with "Error:" prefix (not color-only).
// A11Y-05: artifact download uses plain <a href download> anchor (no JS required).

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Activity, ActivityField } from '@content/courses/aibi-p';

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

function ReadOnlyField({
  field,
  value,
}: {
  readonly field: ActivityField;
  readonly value: string;
}) {
  return (
    <div className="mb-5">
      {field.type !== 'radio' && (
        <label className="block font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1">
          {field.label}
        </label>
      )}
      {field.type === 'textarea' ? (
        <div className="w-full border border-[color:var(--color-parch-dark)] rounded-sm px-3 py-2 text-sm font-sans bg-[color:var(--color-parch)] text-[color:var(--color-ink)] min-h-[80px] whitespace-pre-wrap">
          {value || <span className="text-[color:var(--color-dust)] italic">No response</span>}
        </div>
      ) : field.type === 'radio' ? (
        <fieldset className="mt-1">
          <legend className="block font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1">
            {field.label}
          </legend>
          <div className="space-y-2">
            {(field.options ?? []).map((opt) => (
              <label key={opt.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`readonly-${field.id}`}
                  value={opt.value}
                  checked={value === opt.value}
                  readOnly
                  disabled
                  className="w-4 h-4 accent-[color:var(--color-terra)]"
                />
                <span className="text-sm font-sans text-[color:var(--color-ink)]">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : field.type === 'select' ? (
        <div className="w-full border border-[color:var(--color-parch-dark)] rounded-sm px-3 py-2 text-sm font-sans bg-[color:var(--color-parch)] text-[color:var(--color-ink)]">
          {(field.options ?? []).find((o) => o.value === value)?.label ?? value}
        </div>
      ) : (
        <div className="w-full border border-[color:var(--color-parch-dark)] rounded-sm px-3 py-2 text-sm font-sans bg-[color:var(--color-parch)] text-[color:var(--color-ink)]">
          {value || <span className="text-[color:var(--color-dust)] italic">No response</span>}
        </div>
      )}
    </div>
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
  const hintId = field.minLength ? `${field.id}-hint` : undefined;
  const errorId = error ? `${field.id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const hasError = Boolean(error);

  const baseInputClass =
    'w-full border rounded-sm px-3 py-2 text-sm font-sans bg-white text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] transition-shadow';
  const borderClass = hasError
    ? 'border-[color:var(--color-error)]'
    : 'border-[color:var(--color-parch-dark)]';

  const labelEl = (
    <label
      htmlFor={field.id}
      className="block font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1"
    >
      {field.label}
      {field.required && (
        <span className="ml-1 text-[color:var(--color-error)] text-xs" aria-label="required">
          *
        </span>
      )}
    </label>
  );

  let input: React.ReactNode;

  switch (field.type) {
    case 'textarea':
      input = (
        <textarea
          id={field.id}
          name={field.id}
          placeholder={field.placeholder}
          value={value}
          rows={4}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={`${baseInputClass} ${borderClass} resize-y`}
          aria-describedby={describedBy}
          aria-invalid={hasError}
          aria-required={field.required}
        />
      );
      break;

    case 'radio':
      return (
        <div className="mb-5">
          <fieldset>
            <legend className="block font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1">
              {field.label}
              {field.required && (
                <span className="ml-1 text-[color:var(--color-error)] text-xs" aria-label="required">
                  *
                </span>
              )}
            </legend>
            <div className="space-y-2" role="radiogroup" aria-describedby={describedBy}>
              {(field.options ?? []).map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value={opt.value}
                    checked={value === opt.value}
                    onChange={() => onChange(field.id, opt.value)}
                    className="w-4 h-4 accent-[color:var(--color-terra)] focus:ring-2 focus:ring-[color:var(--color-terra)]"
                  />
                  <span className="text-sm font-sans text-[color:var(--color-ink)]">{opt.label}</span>
                </label>
              ))}
            </div>
            {hasError && (
              <p id={errorId} className="mt-1 text-[color:var(--color-error)] font-mono text-xs" role="alert">
                Error: {error}
              </p>
            )}
            {field.minLength && (
              <p id={hintId} className="mt-1 text-[11px] font-mono text-[color:var(--color-dust)]">
                Minimum {field.minLength} characters
              </p>
            )}
          </fieldset>
        </div>
      );

    case 'select':
      input = (
        <select
          id={field.id}
          name={field.id}
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={`${baseInputClass} ${borderClass}`}
          aria-describedby={describedBy}
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
      );
      break;

    default: // text
      input = (
        <input
          type="text"
          id={field.id}
          name={field.id}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={`${baseInputClass} ${borderClass}`}
          aria-describedby={describedBy}
          aria-invalid={hasError}
          aria-required={field.required}
        />
      );
  }

  return (
    <div className="mb-5">
      {labelEl}
      {input}
      {hasError && (
        <p id={errorId} className="mt-1 text-[color:var(--color-error)] font-mono text-xs" role="alert">
          Error: {error}
        </p>
      )}
      {field.type === 'textarea' && field.minLength && (
        <p id={hintId} className="mt-1 text-[11px] font-mono text-[color:var(--color-dust)]">
          {value.length}/{field.minLength} characters
        </p>
      )}
      {field.type !== 'textarea' && field.minLength && (
        <p id={hintId} className="mt-1 text-[11px] font-mono text-[color:var(--color-dust)]">
          Minimum {field.minLength} characters
        </p>
      )}
    </div>
  );
}

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
      // Clear field error on change
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
          // Already submitted — treat as success
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
    <div
      className="border border-[color:var(--color-parch-dark)] border-l-4 rounded-sm p-6 bg-white/40 mb-8"
      style={{ borderLeftColor: 'var(--color-terra)' }}
    >
      {/* Activity header */}
      <div className="mb-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-1">
          Activity {activity.id}
        </p>
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-xl font-bold text-[color:var(--color-ink)] mb-2">
            {activity.title}
          </h3>
          {state.submitted && (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-[color:var(--color-sage)]/10 border border-[color:var(--color-sage)] rounded-sm font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-sage)]">
              Submitted
            </span>
          )}
        </div>
        <p className="text-sm font-sans text-[color:var(--color-dust)] leading-relaxed">
          {activity.description}
        </p>
      </div>

      {/* Fields */}
      {state.submitted ? (
        <div
          className="space-y-1"
          ref={successRef}
          tabIndex={-1}
          aria-live="polite"
          aria-label="Activity submitted successfully"
        >
          {activity.fields.map((field) => (
            <ReadOnlyField key={field.id} field={field} value={state.values[field.id] ?? ''} />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-1">
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
            <p className="mt-3 mb-3 text-sm font-sans text-[color:var(--color-error)] bg-[color:var(--color-error)]/5 border border-[color:var(--color-error)]/20 rounded-sm px-3 py-2" role="alert">
              {state.serverError}
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-[color:var(--color-parch-dark)]">
            <button
              type="submit"
              disabled={state.submitting}
              className="px-6 py-2.5 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] disabled:bg-[color:var(--color-parch-dark)] disabled:text-[color:var(--color-dust)] text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
              aria-label={state.submitting ? 'Submitting activity…' : 'Submit activity'}
            >
              {state.submitting ? 'Submitting…' : 'Submit Activity'}
            </button>
          </div>
        </form>
      )}

      {/* Artifact download — shown after successful submission */}
      {showArtifactDownload && (
        <div className="mt-6 pt-4 border-t border-[color:var(--color-parch-dark)]">
          <p className="text-xs font-mono text-[color:var(--color-dust)] uppercase tracking-widest mb-2">
            Your artifact is ready
          </p>
          <a
            href={`/public/artifacts/${activity.artifactId}.pdf`}
            download
            className="inline-flex items-center gap-2 px-5 py-2 border border-[color:var(--color-terra)] text-[color:var(--color-terra)] hover:bg-[color:var(--color-terra)] hover:text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Download {activity.artifactId?.replace(/-/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </a>
        </div>
      )}
    </div>
  );
}
