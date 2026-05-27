'use client';

// ActivityForm — interactive activity form for enrolled learners.
// Submits free-text / form-type activities to /api/courses/submit-activity.
// Field renderers live in ActivityFields.tsx; download in ArtifactDownload.tsx.
//
// A11Y-01: focus managed to success region on submit.
// A11Y-02: text error messages with "Error:" prefix (not color-only).
// A11Y-05: artifact download uses a plain <a href download> anchor.

import React, { useState, useCallback, useRef, useEffect, type CSSProperties } from 'react';
import type { Activity } from '@content/courses/foundation-program';
import { ActivityWorkspace } from '@/components/lms';
import {
  getInitialActivityValues,
  validateActivityFields,
} from '../_lib/activityFormHelpers';
import { ActivityReadOnlyField, ActivityInteractiveField } from './ActivityFields';
import { ArtifactDownload } from './ArtifactDownload';

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

const buttonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight: 700,
  padding: '12px 20px',
  borderRadius: 12,
  cursor: 'pointer',
  border: 'none',
  background: 'var(--ink)',
  color: 'var(--cream)',
  transition: 'background var(--t-fast) var(--ease)',
};

const disabledButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: 'var(--slate-200)',
  color: 'var(--slate-500)',
  cursor: 'not-allowed',
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
    values: getInitialActivityValues(activity.fields, existingResponse),
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
            <ActivityReadOnlyField key={field.id} field={field} value={state.values[field.id] ?? ''} />
          ))}
        </div>
      ) : (
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
              style={{
                marginTop: 14,
                padding: '10px 12px',
                borderLeft: '2px solid var(--gold-deep)',
                background: 'var(--cream-2)',
                color: 'var(--ink)',
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: 13,
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
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
              borderTop: '1px solid var(--ink-a10)',
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

      {showArtifactDownload && activity.artifactId && (
        <ArtifactDownload artifactId={activity.artifactId} moduleNumber={moduleNumber} />
      )}
    </ActivityWorkspace>
  );
}
