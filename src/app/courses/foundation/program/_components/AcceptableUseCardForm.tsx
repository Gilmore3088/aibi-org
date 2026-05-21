'use client';

// AcceptableUseCardForm — M5 Activity 5.2 specialized component.
// Renders the role-specific fields from activity.fields, validates minLength,
// submits to /api/courses/submit-activity, then offers a "Generate Acceptable
// Use Card" download. Field rendering uses the shared ActivityFields primitives
// so this form matches every other activity form; the outer card chrome
// (accent rail, header, submitted badge, download) is specific to this activity.
// A11Y-01: focus managed to success region. A11Y-02: "Error:"-prefixed messages.
// A11Y-05: download uses a plain <a href> anchor.

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Activity } from '@content/courses/foundation-program';
import {
  getInitialActivityValues,
  validateActivityFields,
} from '../_lib/activityFormHelpers';
import { ActivityReadOnlyField, ActivityInteractiveField } from './ActivityFields';

export interface AcceptableUseCardFormProps {
  readonly activity: Activity;
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponse?: Record<string, string> | null;
  readonly onSubmitSuccess?: (activityId: string) => void;
}

interface CardFormState {
  values: Record<string, string>;
  errors: Record<string, string>;
  submitting: boolean;
  submitted: boolean;
  serverError: string | null;
}

export function AcceptableUseCardForm({
  activity,
  enrollmentId,
  moduleNumber,
  existingResponse,
  onSubmitSuccess,
}: AcceptableUseCardFormProps) {
  const isReadOnly = existingResponse != null;

  const [state, setState] = useState<CardFormState>({
    values: getInitialActivityValues(activity.fields, existingResponse),
    errors: {},
    submitting: false,
    submitted: isReadOnly,
    serverError: null,
  });

  // A11Y-01: Move focus to success region after submission
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

      const errors = validateActivityFields(activity.fields, state.values);
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

        if (res.ok || res.status === 409) {
          setState((prev) => ({ ...prev, submitting: false, submitted: true, errors: {} }));
          onSubmitSuccess?.(activity.id);
          return;
        }

        const data = (await res.json()) as { error?: string; fieldErrors?: Record<string, string> };

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

  return (
    <div
      className="border border-[color:var(--ledger-parch)] border-l-4 rounded-sm p-6 bg-white/40 mb-8"
      style={{ borderLeftColor: 'var(--ledger-accent)' }}
    >
      {/* Activity header */}
      <div className="mb-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--ledger-accent)] mb-1">
          Activity {activity.id}
        </p>
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-xl font-bold text-[color:var(--ledger-ink)] mb-2">
            {activity.title}
          </h3>
          {state.submitted && (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-[color:var(--ledger-accent-2)]/10 border border-[color:var(--ledger-accent-2)] rounded-sm font-mono text-[10px] uppercase tracking-widest text-[color:var(--ledger-accent-2)]">
              Submitted
            </span>
          )}
        </div>
        <p className="text-sm font-sans text-[color:var(--ledger-muted)] leading-relaxed">
          {activity.description}
        </p>
      </div>

      {/* Read-only view after submission */}
      {state.submitted ? (
        <div
          ref={successRef}
          tabIndex={-1}
          aria-live="polite"
          aria-label="Acceptable Use Card submitted successfully"
        >
          <div style={{ display: 'grid', gap: 14 }}>
            {activity.fields.map((field) => (
              <ActivityReadOnlyField key={field.id} field={field} value={state.values[field.id] ?? ''} />
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[color:var(--ledger-parch)]">
            <p className="text-xs font-mono text-[color:var(--ledger-muted)] uppercase tracking-widest mb-2">
              Your artifact
            </p>
            <a
              href={`/api/courses/generate-acceptable-use-card?enrollmentId=${enrollmentId}`}
              className="inline-flex items-center gap-2 px-5 py-2 border border-[color:var(--ledger-accent)] text-[color:var(--ledger-accent)] hover:bg-[color:var(--ledger-accent)] hover:text-[color:var(--ledger-bg)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--ledger-accent)] focus:ring-offset-2"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Download Acceptable Use Card
            </a>
          </div>
        </div>
      ) : (
        // Interactive form
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gap: 14 }}>
            {activity.fields.map((field) => (
              <ActivityInteractiveField
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
              className="mt-3 mb-3 text-sm font-sans text-[color:var(--ledger-weak)] bg-[color:var(--ledger-weak)]/5 border border-[color:var(--ledger-weak)]/20 rounded-sm px-3 py-2"
              role="alert"
            >
              {state.serverError}
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-[color:var(--ledger-parch)]">
            <button
              type="submit"
              disabled={state.submitting}
              className="px-6 py-2.5 bg-[color:var(--ledger-accent)] hover:bg-[color:var(--ledger-accent-light)] disabled:bg-[color:var(--ledger-parch)] disabled:text-[color:var(--ledger-soft)] text-[color:var(--ledger-bg)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[color:var(--ledger-accent)] focus:ring-offset-2"
              aria-label={state.submitting ? 'Submitting card…' : 'Submit and build card'}
            >
              {state.submitting ? 'Submitting…' : 'Submit and Build Card'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
