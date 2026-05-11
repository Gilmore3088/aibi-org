'use client';

// SkillDiagnosis — M6 Activity 6.1 specialized component.
// Renders a "weak prompt" callout, a component-selection dropdown, and an improvement textarea.
// On submission, calls /api/courses/submit-activity.
// On completion, shows the Skill Template Library download (PDF + five .md templates).
//
// A11Y-01: keyboard accessible (focus rings, focus managed to success region on submit).
// A11Y-02: error messages prefixed with "Error:" (not color-only).
// A11Y-05: artifact download uses plain <a href> anchors (no JS required).

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Activity } from '@content/courses/foundation-program';

export interface SkillDiagnosisProps {
  readonly activity: Activity;
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponse?: Record<string, string> | null;
  readonly onSubmitSuccess?: (activityId: string) => void;
}

interface DiagnosisState {
  missingComponent: string;
  improvedSkill: string;
  errors: Record<string, string>;
  submitting: boolean;
  submitted: boolean;
  serverError: string | null;
}

const WEAK_PROMPT =
  '"Check this quarterly statement for errors and tell me if the portfolio looks healthy compared to last year. Write it in an email."';

const TEMPLATE_FILES: ReadonlyArray<{ readonly name: string; readonly label: string }> = [
  { name: 'meeting-summary.md', label: 'Meeting Summary' },
  { name: 'regulatory-research.md', label: 'Regulatory Research' },
  { name: 'loan-pipeline.md', label: 'Loan Pipeline Report' },
  { name: 'exception-report.md', label: 'Exception Report' },
  { name: 'marketing-content.md', label: 'Marketing Content' },
];

const MIN_LENGTH = 100;

function validateDiagnosis(
  missingComponent: string,
  improvedSkill: string,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!missingComponent) {
    errors['missing-components'] = 'Please select a missing component.';
  }
  if (improvedSkill.trim().length === 0) {
    errors['improved-skill'] = 'Improved skill is required.';
  } else if (improvedSkill.length < MIN_LENGTH) {
    errors['improved-skill'] =
      `Must be at least ${MIN_LENGTH} characters (currently ${improvedSkill.length}).`;
  }
  return errors;
}

export function SkillDiagnosis({
  activity,
  enrollmentId,
  moduleNumber,
  existingResponse,
  onSubmitSuccess,
}: SkillDiagnosisProps) {
  const isReadOnly = existingResponse != null;

  const missingComponentField = activity.fields.find((f) => f.id === 'missing-components');
  const improvedSkillField = activity.fields.find((f) => f.id === 'improved-skill');

  const [state, setState] = useState<DiagnosisState>({
    missingComponent: existingResponse?.['missing-components'] ?? '',
    improvedSkill: existingResponse?.['improved-skill'] ?? '',
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const errors = validateDiagnosis(state.missingComponent, state.improvedSkill);
      if (Object.keys(errors).length > 0) {
        setState((prev) => ({ ...prev, errors }));
        return;
      }

      setState((prev) => ({ ...prev, submitting: true, serverError: null }));

      const response = {
        'missing-components': state.missingComponent,
        'improved-skill': state.improvedSkill,
      };

      try {
        const res = await fetch('/api/courses/submit-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollmentId,
            moduleNumber,
            activityId: activity.id,
            response,
          }),
        });

        if (res.ok || res.status === 409) {
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
    [activity.id, enrollmentId, moduleNumber, onSubmitSuccess, state.missingComponent, state.improvedSkill],
  );

  const selectedOption =
    missingComponentField?.options?.find((o) => o.value === state.missingComponent)?.label ??
    state.missingComponent;

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
        <p className="text-sm font-sans text-[color:var(--color-slate)] leading-relaxed">
          {activity.description}
        </p>
      </div>

      {/* Weak prompt callout */}
      <div className="mb-6 rounded-sm border border-[color:var(--color-parch-dark)] bg-[color:var(--color-parch)] px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-2">
          The prompt to evaluate
        </p>
        <blockquote className="font-serif text-[17px] text-[color:var(--color-ink)] leading-relaxed italic border-l-2 border-[color:var(--color-terra)] pl-4">
          {WEAK_PROMPT}
        </blockquote>
      </div>

      {/* Submitted read-only view */}
      {state.submitted ? (
        <div
          ref={successRef}
          tabIndex={-1}
          aria-live="polite"
          aria-label="Skill Diagnosis submitted successfully"
          className="space-y-4"
        >
          <div>
            <p className="font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1">
              {missingComponentField?.label ?? 'Missing component selected'}
            </p>
            <div className="w-full border border-[color:var(--color-parch-dark)] rounded-sm px-3 py-2 text-sm font-sans bg-[color:var(--color-parch)] text-[color:var(--color-ink)]">
              {selectedOption || <span className="text-[color:var(--color-slate)]">No response</span>}
            </div>
          </div>
          <div>
            <p className="font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1">
              {improvedSkillField?.label ?? 'Improved skill'}
            </p>
            <div className="w-full border border-[color:var(--color-parch-dark)] rounded-sm px-3 py-2 text-sm font-sans bg-[color:var(--color-parch)] text-[color:var(--color-ink)] min-h-[80px] whitespace-pre-wrap">
              {state.improvedSkill || (
                <span className="text-[color:var(--color-slate)]">No response</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {/* Component selection */}
          <div className="mb-5">
            <label
              htmlFor="missing-components"
              className="block font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1"
            >
              {missingComponentField?.label ?? 'Which component is most critically missing?'}
              <span className="ml-1 text-[color:var(--color-error)] text-xs" aria-label="required">
                *
              </span>
            </label>
            <select
              id="missing-components"
              name="missing-components"
              value={state.missingComponent}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  missingComponent: e.target.value,
                  errors: { ...prev.errors, 'missing-components': '' },
                  serverError: null,
                }))
              }
              className={`w-full border rounded-sm px-3 py-2 text-sm font-sans bg-white text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] transition-shadow ${
                state.errors['missing-components']
                  ? 'border-[color:var(--color-error)]'
                  : 'border-[color:var(--color-parch-dark)]'
              }`}
              aria-required="true"
              aria-invalid={Boolean(state.errors['missing-components'])}
              aria-describedby={
                state.errors['missing-components'] ? 'missing-components-error' : undefined
              }
            >
              <option value="">Select the most critically missing component</option>
              {(missingComponentField?.options ?? []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {state.errors['missing-components'] && (
              <p
                id="missing-components-error"
                className="mt-1 text-[color:var(--color-error)] font-mono text-xs"
                role="alert"
              >
                Error: {state.errors['missing-components']}
              </p>
            )}
          </div>

          {/* Improved skill textarea */}
          <div className="mb-5">
            <label
              htmlFor="improved-skill"
              className="block font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1"
            >
              {improvedSkillField?.label ?? 'Write an improved version of this skill'}
              <span className="ml-1 text-[color:var(--color-error)] text-xs" aria-label="required">
                *
              </span>
            </label>
            <textarea
              id="improved-skill"
              name="improved-skill"
              value={state.improvedSkill}
              rows={6}
              placeholder={improvedSkillField?.placeholder ?? 'Start with a Role definition ("You are a...")…'}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  improvedSkill: e.target.value,
                  errors: { ...prev.errors, 'improved-skill': '' },
                  serverError: null,
                }))
              }
              className={`w-full border rounded-sm px-3 py-2 text-sm font-sans bg-white text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] transition-shadow resize-y ${
                state.errors['improved-skill']
                  ? 'border-[color:var(--color-error)]'
                  : 'border-[color:var(--color-parch-dark)]'
              }`}
              aria-required="true"
              aria-invalid={Boolean(state.errors['improved-skill'])}
              aria-describedby={[
                'improved-skill-hint',
                state.errors['improved-skill'] ? 'improved-skill-error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
            {state.errors['improved-skill'] && (
              <p
                id="improved-skill-error"
                className="mt-1 text-[color:var(--color-error)] font-mono text-xs"
                role="alert"
              >
                Error: {state.errors['improved-skill']}
              </p>
            )}
            <p id="improved-skill-hint" className="mt-1 text-[11px] font-mono text-[color:var(--color-slate)]">
              {state.improvedSkill.length}/{MIN_LENGTH} characters
            </p>
          </div>

          {state.serverError && (
            <p
              className="mt-3 mb-3 text-sm font-sans text-[color:var(--color-error)] bg-[color:var(--color-error)]/5 border border-[color:var(--color-error)]/20 rounded-sm px-3 py-2"
              role="alert"
            >
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

      {/* Artifact downloads — shown after successful submission */}
      {state.submitted && (
        <div className="mt-6 pt-5 border-t border-[color:var(--color-parch-dark)]">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-1">
            Your artifact is ready
          </p>
          <h4 className="font-serif text-base font-bold text-[color:var(--color-ink)] mb-1">
            Skill Template Library
          </h4>
          <p className="text-sm font-sans text-[color:var(--color-slate)] mb-4 leading-relaxed">
            Five institution-grade banking AI skills across Operations, Compliance, Lending, and
            Marketing — formatted for immediate deployment in ChatGPT, Claude, or Gemini.
          </p>

          <div className="flex flex-wrap gap-3">
            {/* PDF download */}
            <a
              href="/api/courses/artifacts/skill-template-library"
              className="inline-flex items-center gap-2 px-5 py-2 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
              aria-label="Download Skill Template Library PDF"
            >
              <DownloadIcon />
              Download PDF
            </a>
          </div>

          {/* Individual .md template links */}
          <div className="mt-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-3">
              Individual skill templates (.md)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {TEMPLATE_FILES.map((file) => (
                <a
                  key={file.name}
                  href={`/artifacts/skill-templates/${file.name}`}
                  download={file.name}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[color:var(--color-terra)] text-[color:var(--color-terra)] hover:bg-[color:var(--color-terra)] hover:text-[color:var(--color-linen)] text-[11px] font-mono rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
                  aria-label={`Download ${file.label} skill template`}
                >
                  <DownloadIcon />
                  {file.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 shrink-0"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}
