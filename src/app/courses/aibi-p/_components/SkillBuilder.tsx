'use client';

// SkillBuilder — M7 Activity 7.1 specialized component.
// Two-column layout: RTFC Framework explanation (left), 5-field skill builder form (right).
// Role-specific placeholders and pre-built skill starters based on learnerRole prop.
// On submission, generates and downloads a .md file named [Role]-[Task]-Skill-v1.md.
// Generated .md content is also stored in the activity response for profile re-download (ARTF-04).
//
// A11Y-01: keyboard accessible (focus rings, focus managed to success region on submit).
// A11Y-02: error messages prefixed with "Error:" (not color-only).
// Layout: two-column on lg breakpoint, single-column on mobile.

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Activity } from '@content/courses/aibi-p';
import type { LearnerRole } from '@/types/course';
import {
  getRolePlaceholders,
  getRoleSkillStarters,
  FORMAT_OPTIONS,
  type SkillStarter,
} from '../_lib/skillBuilderData';
import { RTFCPanel, StarterSelector, FormField } from './SkillBuilderPanels';
import { SkillSubmittedPanel } from './SkillSubmittedPanel';
import {
  FIELD_IDS,
  generateSkillMarkdown,
  downloadMarkdown,
  buildFilename,
  validateFields,
} from './SkillBuilderUtils';

export interface SkillBuilderProps {
  readonly activity: Activity;
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponse?: Record<string, string> | null;
  readonly onSubmitSuccess?: (activityId: string) => void;
  readonly learnerRole: LearnerRole;
}

interface BuilderState {
  values: Record<string, string>;
  errors: Record<string, string>;
  submitting: boolean;
  submitted: boolean;
  serverError: string | null;
  selectedStarterId: string;
}

export function SkillBuilder({
  activity,
  enrollmentId,
  moduleNumber,
  existingResponse,
  onSubmitSuccess,
  learnerRole,
}: SkillBuilderProps) {
  const isReadOnly = existingResponse != null;
  const placeholders = getRolePlaceholders(learnerRole);
  const starters = getRoleSkillStarters(learnerRole);

  const [state, setState] = useState<BuilderState>({
    values: {
      [FIELD_IDS.role]: existingResponse?.[FIELD_IDS.role] ?? '',
      [FIELD_IDS.context]: existingResponse?.[FIELD_IDS.context] ?? '',
      [FIELD_IDS.task]: existingResponse?.[FIELD_IDS.task] ?? '',
      [FIELD_IDS.format]: existingResponse?.[FIELD_IDS.format] ?? '',
      [FIELD_IDS.constraint]: existingResponse?.[FIELD_IDS.constraint] ?? '',
      [FIELD_IDS.mdContent]: existingResponse?.[FIELD_IDS.mdContent] ?? '',
    },
    errors: {},
    submitting: false,
    submitted: isReadOnly,
    serverError: null,
    selectedStarterId: '',
  });

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

  const handleStarterSelect = useCallback((starter: SkillStarter | null) => {
    if (!starter) {
      setState((prev) => ({ ...prev, selectedStarterId: '' }));
      return;
    }
    setState((prev) => ({
      ...prev,
      selectedStarterId: starter.id,
      values: {
        ...prev.values,
        [FIELD_IDS.role]: starter.role,
        [FIELD_IDS.context]: starter.context,
        [FIELD_IDS.task]: starter.task,
        [FIELD_IDS.format]: starter.format,
        [FIELD_IDS.constraint]: starter.constraints,
      },
      errors: {},
      serverError: null,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const errors = validateFields(state.values);
      if (Object.keys(errors).length > 0) {
        setState((prev) => ({ ...prev, errors }));
        return;
      }

      setState((prev) => ({ ...prev, submitting: true, serverError: null }));

      const mdContent = generateSkillMarkdown(state.values);
      const filename = buildFilename(state.values);
      const responseWithMd = { ...state.values, [FIELD_IDS.mdContent]: mdContent };

      try {
        const res = await fetch('/api/courses/submit-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollmentId,
            moduleNumber,
            activityId: activity.id,
            response: responseWithMd,
          }),
        });

        if (res.ok || res.status === 409) {
          downloadMarkdown(mdContent, filename);
          setState((prev) => ({
            ...prev,
            submitting: false,
            submitted: true,
            errors: {},
            values: { ...prev.values, [FIELD_IDS.mdContent]: mdContent },
          }));
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
    [activity.id, enrollmentId, moduleNumber, onSubmitSuccess, state.values],
  );

  const handleRedownload = useCallback(() => {
    const mdContent =
      state.values[FIELD_IDS.mdContent] || generateSkillMarkdown(state.values);
    downloadMarkdown(mdContent, buildFilename(state.values));
  }, [state.values]);

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

      <div className="border-t border-[color:var(--color-parch-dark)]">
        <div className="lg:grid lg:grid-cols-[280px_1fr]">
          <div className="hidden lg:block border-r border-[color:var(--color-parch-dark)] p-6">
            <RTFCPanel />
          </div>

          <div className="p-6">
            {state.submitted ? (
              <SkillSubmittedPanel
                values={state.values}
                successRef={successRef}
                onRedownload={handleRedownload}
              />
            ) : (
              <>
                <StarterSelector
                  starters={starters}
                  selectedId={state.selectedStarterId}
                  onSelect={handleStarterSelect}
                />
                <div className="lg:hidden mb-6 p-4 bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-2">
                    RTFC Framework
                  </p>
                  <p className="text-xs font-sans text-[color:var(--color-dust)] leading-relaxed">
                    Complete all four components: Role, Task, Format, and Constraints. Each field
                    maps to a component of the RTFC Framework taught in Module 6.
                  </p>
                </div>
                <form onSubmit={handleSubmit} noValidate aria-label="Skill builder form">
                  <FormField id={FIELD_IDS.role} label="Role" type="text"
                    value={state.values[FIELD_IDS.role] ?? ''} error={state.errors[FIELD_IDS.role]}
                    placeholder={placeholders.role} minLength={20} onChange={handleChange} />
                  <FormField id={FIELD_IDS.context} label="Context" type="textarea"
                    value={state.values[FIELD_IDS.context] ?? ''} error={state.errors[FIELD_IDS.context]}
                    placeholder={placeholders.context} minLength={20} onChange={handleChange} />
                  <FormField id={FIELD_IDS.task} label="Task" type="textarea"
                    value={state.values[FIELD_IDS.task] ?? ''} error={state.errors[FIELD_IDS.task]}
                    placeholder={placeholders.task} minLength={30} onChange={handleChange} />
                  <FormField id={FIELD_IDS.format} label="Format" type="select"
                    value={state.values[FIELD_IDS.format] ?? ''} error={state.errors[FIELD_IDS.format]}
                    options={FORMAT_OPTIONS} onChange={handleChange} />
                  <FormField id={FIELD_IDS.constraint} label="Constraints" type="textarea"
                    value={state.values[FIELD_IDS.constraint] ?? ''} error={state.errors[FIELD_IDS.constraint]}
                    placeholder={placeholders.constraints} minLength={30} onChange={handleChange} />
                  {state.serverError && (
                    <p className="mt-3 mb-3 text-sm font-sans text-[color:var(--color-error)] bg-[color:var(--color-error)]/5 border border-[color:var(--color-error)]/20 rounded-sm px-3 py-2" role="alert">
                      {state.serverError}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-[color:var(--color-parch-dark)]">
                    <p className="text-xs font-sans text-[color:var(--color-dust)] mb-3 leading-relaxed">
                      Submitting will save your skill and automatically download a .md file to your
                      device for deployment in your AI platform.
                    </p>
                    <button type="submit" disabled={state.submitting}
                      className="px-6 py-2.5 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] disabled:bg-[color:var(--color-parch-dark)] disabled:text-[color:var(--color-dust)] text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
                      aria-label={state.submitting ? 'Building and saving skill…' : 'Save skill and download .md file'}>
                      {state.submitting ? 'Building Skill…' : 'Save Skill and Download'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
