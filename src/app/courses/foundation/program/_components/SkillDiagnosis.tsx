'use client';

// SkillDiagnosis — Module 6 Activity 6.1 orchestrator.
//
// Reads the activity definition from foundation-program content,
// renders the framed-callout chrome (header + weak-prompt blockquote),
// then routes to one of three child components based on submission
// state:
//   - Form (idle / editing)           → DiagnosisForm
//   - Read-only review (post-submit)  → DiagnosisReadOnly
//   - Earned artifact panel           → DiagnosisArtifactPanel
//
// Owns the submit handler and the DiagnosisState; everything else lives
// in the children. Split from a 422-line monolith per #245.
//
// Design vocabulary: cream surface with gold left-rule (the PDF
// principle callout pattern), ink type, gold-deep on-light kicker.
// A11Y-01/02/05 contracts preserved across the split.

import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import type { Activity } from '@content/courses/foundation-program';
import {
  WEAK_PROMPT,
  validateDiagnosis,
  type DiagnosisState,
} from '../_lib/skillDiagnosisData';
import { DiagnosisForm } from './skillDiagnosis/DiagnosisForm';
import { DiagnosisReadOnly } from './skillDiagnosis/DiagnosisReadOnly';
import { DiagnosisArtifactPanel } from './skillDiagnosis/DiagnosisArtifactPanel';

export interface SkillDiagnosisProps {
  readonly activity: Activity;
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponse?: Record<string, string> | null;
  readonly onSubmitSuccess?: (activityId: string) => void;
}

export function SkillDiagnosis({
  activity,
  enrollmentId,
  moduleNumber,
  existingResponse,
  onSubmitSuccess,
}: SkillDiagnosisProps) {
  const isReadOnly = existingResponse != null;

  const missingComponentField = activity.fields.find(
    (f) => f.id === 'missing-components',
  );
  const improvedSkillField = activity.fields.find(
    (f) => f.id === 'improved-skill',
  );

  const [state, setState] = useState<DiagnosisState>({
    missingComponent: existingResponse?.['missing-components'] ?? '',
    improvedSkill: existingResponse?.['improved-skill'] ?? '',
    errors: {},
    submitting: false,
    submitted: isReadOnly,
    serverError: null,
  });

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
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
          setState((prev) => ({
            ...prev,
            submitting: false,
            submitted: true,
            errors: {},
          }));
          onSubmitSuccess?.(activity.id);
          return;
        }

        const data = (await res.json()) as {
          error?: string;
          fieldErrors?: Record<string, string>;
        };

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
            serverError:
              'Your session has expired. Please refresh the page and try again.',
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
          serverError:
            'Network error. Please check your connection and try again.',
        }));
      }
    },
    [
      activity.id,
      enrollmentId,
      moduleNumber,
      onSubmitSuccess,
      state.missingComponent,
      state.improvedSkill,
    ],
  );

  const selectedOption =
    missingComponentField?.options?.find((o) => o.value === state.missingComponent)
      ?.label ?? state.missingComponent;

  return (
    <div
      className="mb-8 rounded-3xl border border-[color:var(--ink-a10)] border-l-4 bg-[color:var(--cream)] p-6 shadow-[var(--shadow-soft)]"
      style={{ borderLeftColor: 'var(--gold)' }}
    >
      {/* Activity header */}
      <div className="mb-5">
        <p className="font-sans text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold-deep)] mb-1">
          Activity {activity.id}
        </p>
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-sans text-xl font-bold text-[color:var(--ink)] mb-2">
            {activity.title}
          </h3>
          {state.submitted && (
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-[color:var(--emerald-700)] bg-white px-2.5 py-0.5 font-sans text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--emerald-700)]">
              Submitted
            </span>
          )}
        </div>
        <p className="font-sans text-base leading-relaxed text-[color:var(--slate-600)]">
          {activity.description}
        </p>
      </div>

      {/* Weak prompt callout */}
      <div className="mb-6 rounded-2xl border border-[color:var(--ink-a10)] bg-[color:var(--cream-2)] px-5 py-4">
        <p className="font-sans text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--slate-500)] mb-2">
          The prompt to evaluate
        </p>
        <blockquote className="border-l-2 border-[color:var(--gold)] pl-4 font-sans text-[17px] font-semibold leading-relaxed text-[color:var(--ink)]">
          {WEAK_PROMPT}
        </blockquote>
      </div>

      {state.submitted ? (
        <DiagnosisReadOnly
          missingComponentLabel={
            missingComponentField?.label ?? 'Missing component selected'
          }
          selectedOption={selectedOption}
          improvedSkillLabel={improvedSkillField?.label ?? 'Improved skill'}
          improvedSkill={state.improvedSkill}
          autoFocus={!isReadOnly}
        />
      ) : (
        <DiagnosisForm
          activity={activity}
          missingComponent={state.missingComponent}
          improvedSkill={state.improvedSkill}
          errors={state.errors}
          submitting={state.submitting}
          serverError={state.serverError}
          onMissingComponentChange={(value) =>
            setState((prev) => ({
              ...prev,
              missingComponent: value,
              errors: { ...prev.errors, 'missing-components': '' },
              serverError: null,
            }))
          }
          onImprovedSkillChange={(value) =>
            setState((prev) => ({
              ...prev,
              improvedSkill: value,
              errors: { ...prev.errors, 'improved-skill': '' },
              serverError: null,
            }))
          }
          onSubmit={handleSubmit}
        />
      )}

      {state.submitted && <DiagnosisArtifactPanel />}
    </div>
  );
}
