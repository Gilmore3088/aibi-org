'use client';

// The editable form for Module 6 Activity 6.1. Component-selection
// dropdown + improved-prompt textarea + submit button. The orchestrator
// owns the async submit handler so the form stays focused on render +
// input + client-side validation feedback.

import type { FormEvent } from 'react';
import type { Activity } from '@content/courses/foundation-program';
import { MIN_IMPROVED_SKILL_LENGTH } from '../../_lib/skillDiagnosisData';

interface DiagnosisFormProps {
  readonly activity: Activity;
  readonly missingComponent: string;
  readonly improvedSkill: string;
  readonly errors: Record<string, string>;
  readonly submitting: boolean;
  readonly serverError: string | null;
  readonly onMissingComponentChange: (value: string) => void;
  readonly onImprovedSkillChange: (value: string) => void;
  readonly onSubmit: (e: FormEvent) => void;
}

export function DiagnosisForm({
  activity,
  missingComponent,
  improvedSkill,
  errors,
  submitting,
  serverError,
  onMissingComponentChange,
  onImprovedSkillChange,
  onSubmit,
}: DiagnosisFormProps) {
  const missingComponentField = activity.fields.find(
    (f) => f.id === 'missing-components',
  );
  const improvedSkillField = activity.fields.find(
    (f) => f.id === 'improved-skill',
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Component selection */}
      <div className="mb-5">
        <label
          htmlFor="missing-components"
          className="block font-sans text-base font-semibold text-[color:var(--ink)] mb-1"
        >
          {missingComponentField?.label ??
            'Which component is most critically missing?'}
          <span className="ml-1 text-red-700 text-sm" aria-label="required">
            *
          </span>
        </label>
        <select
          id="missing-components"
          name="missing-components"
          value={missingComponent}
          onChange={(e) => onMissingComponentChange(e.target.value)}
          className={`w-full rounded-xl border px-3 py-2 font-sans text-base bg-white text-[color:var(--ink)] placeholder:text-[color:var(--slate-400)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] transition-shadow ${
            errors['missing-components']
              ? 'border-red-700'
              : 'border-[color:var(--ink-a10)]'
          }`}
          aria-required="true"
          aria-invalid={Boolean(errors['missing-components'])}
          aria-describedby={
            errors['missing-components']
              ? 'missing-components-error'
              : undefined
          }
        >
          <option value="">Select the most critically missing component</option>
          {(missingComponentField?.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors['missing-components'] && (
          <p
            id="missing-components-error"
            className="mt-1 font-sans text-sm text-red-700"
            role="alert"
          >
            Error: {errors['missing-components']}
          </p>
        )}
      </div>

      {/* Improved skill textarea */}
      <div className="mb-5">
        <label
          htmlFor="improved-skill"
          className="block font-sans text-base font-semibold text-[color:var(--ink)] mb-1"
        >
          {improvedSkillField?.label ?? 'Write an improved version of this skill'}
          <span className="ml-1 text-red-700 text-sm" aria-label="required">
            *
          </span>
        </label>
        <textarea
          id="improved-skill"
          name="improved-skill"
          value={improvedSkill}
          rows={6}
          placeholder={
            improvedSkillField?.placeholder ??
            'Start with a Role definition ("You are a...")…'
          }
          onChange={(e) => onImprovedSkillChange(e.target.value)}
          className={`w-full rounded-xl border px-3 py-2 font-sans text-base bg-white text-[color:var(--ink)] placeholder:text-[color:var(--slate-400)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] transition-shadow resize-y ${
            errors['improved-skill']
              ? 'border-red-700'
              : 'border-[color:var(--ink-a10)]'
          }`}
          aria-required="true"
          aria-invalid={Boolean(errors['improved-skill'])}
          aria-describedby={[
            'improved-skill-hint',
            errors['improved-skill'] ? 'improved-skill-error' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        {errors['improved-skill'] && (
          <p
            id="improved-skill-error"
            className="mt-1 font-sans text-sm text-red-700"
            role="alert"
          >
            Error: {errors['improved-skill']}
          </p>
        )}
        <p
          id="improved-skill-hint"
          className="mt-1 font-sans text-[11px] text-[color:var(--slate-500)]"
        >
          {improvedSkill.length}/{MIN_IMPROVED_SKILL_LENGTH} characters
        </p>
      </div>

      {serverError && (
        <p
          className="mt-3 mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 font-sans text-base text-red-700"
          role="alert"
        >
          {serverError}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-[color:var(--ink-a10)]">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-xl bg-[color:var(--ink)] hover:bg-[color:var(--ink-2)] disabled:bg-[color:var(--slate-200)] disabled:text-[color:var(--slate-500)] text-[color:var(--gold-soft)] hover:text-[color:var(--gold)] text-[12px] font-sans font-bold uppercase tracking-[0.22em] transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:ring-offset-2"
          aria-label={submitting ? 'Submitting activity' : 'Submit activity'}
        >
          {submitting ? 'SUBMITTING' : 'SUBMIT ACTIVITY'}
        </button>
      </div>
    </form>
  );
}
