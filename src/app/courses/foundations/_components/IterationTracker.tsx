'use client';

// IterationTracker — M8 Activity 8.1 specialized component.
// Three-step visual flow: Stress Test, Diagnose, Revise.
// On submission, appends iteration notes to the M7 skill .md and downloads as v1.1.
// Falls back gracefully if M7 response is unavailable.
// A11Y-01: keyboard accessible (focus rings, focus managed to success region on submit).
// A11Y-02: error messages prefixed with "Error:" (not color-only).

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Activity } from '@content/courses/foundations';
import { StepHeader, ReadOnlyField, InteractiveField } from './IterationFields';
import {
  FIELDS,
  STEPS,
  getInitialValues,
  validateValues,
  downloadMarkdown,
  generateIteratedMarkdown,
  buildIteratedFilename,
} from './IterationTrackerData';

export interface IterationTrackerProps {
  readonly activity: Activity;
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponse?: Record<string, string> | null;
  readonly onSubmitSuccess?: (activityId: string) => void;
}

interface IterationState {
  values: Record<string, string>;
  errors: Record<string, string>;
  submitting: boolean;
  submitted: boolean;
  serverError: string | null;
  originalSkillMd: string | null;
  skillLoading: boolean;
}

export function IterationTracker({
  activity,
  enrollmentId,
  moduleNumber,
  existingResponse,
  onSubmitSuccess,
}: IterationTrackerProps) {
  const isReadOnly = existingResponse != null;

  const [state, setState] = useState<IterationState>({
    values: getInitialValues(existingResponse),
    errors: {},
    submitting: false,
    submitted: isReadOnly,
    serverError: null,
    originalSkillMd: null,
    skillLoading: true,
  });

  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.submitted && !isReadOnly && successRef.current) {
      successRef.current.focus();
    }
  }, [state.submitted, isReadOnly]);

  useEffect(() => {
    let cancelled = false;
    async function loadM7Skill() {
      try {
        const res = await fetch(
          `/api/courses/activity-response?enrollmentId=${encodeURIComponent(enrollmentId)}&activityId=7.1`,
        );
        if (res.ok) {
          const data = (await res.json()) as { response?: Record<string, string> };
          const mdContent = data.response?.['skill-md-content'] ?? null;
          if (!cancelled) setState((prev) => ({ ...prev, originalSkillMd: mdContent, skillLoading: false }));
        } else {
          if (!cancelled) setState((prev) => ({ ...prev, originalSkillMd: null, skillLoading: false }));
        }
      } catch {
        if (!cancelled) setState((prev) => ({ ...prev, originalSkillMd: null, skillLoading: false }));
      }
    }
    void loadM7Skill();
    return () => { cancelled = true; };
  }, [enrollmentId]);

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
      const errors = validateValues(state.values);
      if (Object.keys(errors).length > 0) {
        setState((prev) => ({ ...prev, errors }));
        return;
      }
      setState((prev) => ({ ...prev, submitting: true, serverError: null }));
      try {
        const res = await fetch('/api/courses/submit-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrollmentId, moduleNumber, activityId: activity.id, response: state.values }),
        });
        if (res.ok || res.status === 409) {
          if (state.originalSkillMd) {
            const iteratedMd = generateIteratedMarkdown(state.originalSkillMd, state.values);
            downloadMarkdown(iteratedMd, buildIteratedFilename(state.originalSkillMd));
          }
          setState((prev) => ({ ...prev, submitting: false, submitted: true, errors: {} }));
          onSubmitSuccess?.(activity.id);
          return;
        }
        const data = (await res.json()) as { error?: string; fieldErrors?: Record<string, string> };
        if (res.status === 400 && data.fieldErrors) {
          setState((prev) => ({ ...prev, submitting: false, errors: data.fieldErrors ?? {} }));
          return;
        }
        if (res.status === 401 || res.status === 403) {
          setState((prev) => ({ ...prev, submitting: false, serverError: 'Your session has expired. Please refresh the page and try again.' }));
          return;
        }
        setState((prev) => ({ ...prev, submitting: false, serverError: data.error ?? 'Submission failed. Please try again.' }));
      } catch {
        setState((prev) => ({ ...prev, submitting: false, serverError: 'Network error. Please check your connection and try again.' }));
      }
    },
    [activity.id, enrollmentId, moduleNumber, onSubmitSuccess, state.originalSkillMd, state.values],
  );

  const getFieldsForStep = (fieldIds: readonly string[]) =>
    FIELDS.filter((f) => fieldIds.includes(f.id));

  return (
    <div
      className="border border-[color:var(--color-parch-dark)] border-l-4 rounded-sm overflow-hidden bg-white/40 mb-8"
      style={{ borderLeftColor: 'var(--color-terra)' }}
    >
      <div className="px-6 pt-6 pb-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-1">
          Activity {activity.id}
        </p>
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-xl font-bold text-[color:var(--color-ink)] mb-2">{activity.title}</h3>
          {state.submitted && (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-[color:var(--color-sage)]/10 border border-[color:var(--color-sage)] rounded-sm font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-sage)]">
              Submitted
            </span>
          )}
        </div>
        <p className="text-sm font-sans text-[color:var(--color-slate)] leading-relaxed">{activity.description}</p>
      </div>

      <div className="border-t border-[color:var(--color-parch-dark)] px-6 py-6">
        {!state.submitted && (
          <div className="mb-6 p-4 bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-1">Before you begin</p>
            {state.skillLoading ? (
              <p className="text-sm font-sans text-[color:var(--color-slate)]">Loading your Module 7 skill...</p>
            ) : state.originalSkillMd ? (
              <p className="text-sm font-sans text-[color:var(--color-slate)] leading-relaxed">
                Your Module 7 skill file has been loaded. After submitting, an updated version (.md v1.1) with your iteration notes will download automatically.
              </p>
            ) : (
              <p className="text-sm font-sans text-[color:var(--color-slate)] leading-relaxed">
                Open your Module 7 skill .md file alongside this activity for reference. Your iteration notes will be saved. To export an updated skill file, apply the changes you document below to your Module 7 .md file manually.
              </p>
            )}
          </div>
        )}

        {state.submitted ? (
          <div ref={successRef} tabIndex={-1} aria-live="polite" aria-label="Iteration Tracker submitted successfully">
            {STEPS.map((step) => (
              <div key={step.id} className="mb-8 pl-4 border-l-2 border-[color:var(--color-parch-dark)]">
                <StepHeader number={step.number} label={step.label} description={step.description} />
                {getFieldsForStep(step.fieldIds).map((field) => (
                  <ReadOnlyField key={field.id} field={field} value={state.values[field.id] ?? ''} />
                ))}
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-[color:var(--color-parch-dark)]">
              <p className="text-xs font-mono text-[color:var(--color-slate)] uppercase tracking-widest mb-2">Iteration complete</p>
              <p className="text-sm font-sans text-[color:var(--color-slate)] leading-relaxed">
                Your iteration notes have been saved. If your Module 7 skill file was available, an updated .md file (v1.1) was downloaded with your revision notes prepended. Otherwise, apply the changes documented above to your Module 7 .md file manually.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate aria-label="Iteration Tracker form">
            {STEPS.map((step) => (
              <div key={step.id} className="mb-8 pl-4 border-l-2 border-[color:var(--color-parch-dark)]">
                <StepHeader number={step.number} label={step.label} description={step.description} />
                {getFieldsForStep(step.fieldIds).map((field) => (
                  <InteractiveField key={field.id} field={field} value={state.values[field.id] ?? ''} error={state.errors[field.id]} onChange={handleChange} />
                ))}
              </div>
            ))}
            {state.serverError && (
              <p className="mt-3 mb-3 text-sm font-sans text-[color:var(--color-error)] bg-[color:var(--color-error)]/5 border border-[color:var(--color-error)]/20 rounded-sm px-3 py-2" role="alert">
                {state.serverError}
              </p>
            )}
            <div className="mt-4 pt-4 border-t border-[color:var(--color-parch-dark)]">
              <p className="text-xs font-sans text-[color:var(--color-slate)] mb-3 leading-relaxed">
                Submitting will save your iteration notes.{state.originalSkillMd ? ' An updated .md file (v1.1) with your revision notes will also download automatically.' : ''}
              </p>
              <button
                type="submit"
                disabled={state.submitting}
                className="px-6 py-2.5 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] disabled:bg-[color:var(--color-parch-dark)] disabled:text-[color:var(--color-dust)] text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
                aria-label={state.submitting ? 'Saving iteration notes…' : 'Save iteration notes'}
              >
                {state.submitting ? 'Saving…' : 'Save Iteration Notes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
