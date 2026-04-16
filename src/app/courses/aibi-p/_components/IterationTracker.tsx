'use client';

// IterationTracker — M8 Activity 8.1 specialized component.
// Three-step visual flow: Stress Test, Diagnose, Revise.
// On submission, appends iteration notes to the M7 skill .md and downloads as v1.1.
// Falls back gracefully if M7 response is unavailable.
// A11Y-01: keyboard accessible (focus rings, focus managed to success region on submit).
// A11Y-02: error messages prefixed with "Error:" (not color-only).

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Activity } from '@content/courses/aibi-p';

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

const FIELD_IDS = {
  testInput1: 'test-input-1',
  outputAssessment1: 'output-assessment-1',
  testInput2: 'test-input-2',
  outputAssessment2: 'output-assessment-2',
  revisionNotes: 'revision-notes',
  sharingLadderLevel: 'sharing-ladder-level',
} as const;

const SHARING_LADDER_OPTIONS = [
  { value: 'personal', label: 'Personal — still in testing, not ready to share' },
  { value: 'team', label: 'Team — ready to share with my immediate team for peer review' },
  { value: 'institution', label: 'Institution — polished enough for institution-wide distribution' },
  { value: 'not-sure', label: 'Not sure — needs one more iteration' },
] as const;

const STEPS = [
  {
    number: 1,
    id: 'stress-test',
    label: 'Stress Test',
    description:
      'Run your skill against two real work inputs — not ideal examples, but messy or edge-case inputs from your actual workflow. Observe the outputs carefully.',
    fieldIds: [FIELD_IDS.testInput1, FIELD_IDS.testInput2],
  },
  {
    number: 2,
    id: 'diagnose',
    label: 'Diagnose',
    description:
      'Categorize each failure or unexpected output by RTFC component — Role, Task, Format, or Constraint. This prevents patching symptoms instead of root causes.',
    fieldIds: [FIELD_IDS.outputAssessment1, FIELD_IDS.outputAssessment2],
  },
  {
    number: 3,
    id: 'revise',
    label: 'Revise and Version',
    description:
      'Make targeted revisions and document what changed and why. Then identify where your iterated skill sits on the Sharing Ladder.',
    fieldIds: [FIELD_IDS.revisionNotes, FIELD_IDS.sharingLadderLevel],
  },
] as const;

interface FieldDef {
  id: string;
  label: string;
  type: 'textarea' | 'radio';
  minLength?: number;
  placeholder?: string;
  options?: ReadonlyArray<{ value: string; label: string }>;
}

const FIELDS: FieldDef[] = [
  {
    id: FIELD_IDS.testInput1,
    label:
      'Describe the first real input you tested your skill against (do not include Tier 3 data — describe the type and general content)',
    type: 'textarea',
    minLength: 20,
    placeholder:
      'e.g., A loan document package with incomplete collateral documentation and an unusual property type. Three items were missing from the standard checklist.',
  },
  {
    id: FIELD_IDS.outputAssessment1,
    label: 'How did the skill perform on input 1? What worked well? What failed?',
    type: 'textarea',
    minLength: 30,
    placeholder:
      'Describe what the AI produced. Did it follow the Role, Task, Format, and Constraints? Were there unexpected outputs? Which component failed if something went wrong?',
  },
  {
    id: FIELD_IDS.testInput2,
    label:
      'Describe the second real input you tested (edge case or challenging scenario)',
    type: 'textarea',
    minLength: 20,
    placeholder:
      'e.g., A more complex or unusual version of the same task type. The edge case is where skills most often break.',
  },
  {
    id: FIELD_IDS.outputAssessment2,
    label: 'How did the skill perform on input 2? Did the edge case reveal any failures?',
    type: 'textarea',
    minLength: 30,
    placeholder:
      'Describe the output and any failures. Edge cases often reveal constraint gaps — what should have been prevented but was not?',
  },
  {
    id: FIELD_IDS.revisionNotes,
    label:
      'What changes did you make to improve the skill? Describe the revision and the component it addressed.',
    type: 'textarea',
    minLength: 30,
    placeholder:
      'e.g., "Added a Constraint: Never produce output in paragraph form — always use the specified table format." or "Strengthened the Role: Added specific expertise in [topic] to improve the quality of [specific output type]."',
  },
  {
    id: FIELD_IDS.sharingLadderLevel,
    label:
      'Where does this skill sit on the Sharing Ladder? Is it ready to share with your team, or still in personal sandbox testing?',
    type: 'radio',
    options: SHARING_LADDER_OPTIONS,
  },
];

function getInitialValues(
  existingResponse?: Record<string, string> | null,
): Record<string, string> {
  const initial: Record<string, string> = {};
  for (const field of FIELDS) {
    initial[field.id] = existingResponse?.[field.id] ?? '';
  }
  return initial;
}

function validateValues(values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of FIELDS) {
    const value = values[field.id] ?? '';
    if (field.type === 'radio') {
      if (!value) {
        errors[field.id] = `${field.label} is required.`;
      }
    } else {
      if (!value.trim()) {
        errors[field.id] = `This field is required.`;
      } else if (field.minLength && value.length < field.minLength) {
        errors[field.id] = `Must be at least ${field.minLength} characters (currently ${value.length}).`;
      }
    }
  }

  return errors;
}

function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateIteratedMarkdown(
  originalMd: string,
  values: Record<string, string>,
): string {
  const revisionNotes = values[FIELD_IDS.revisionNotes] ?? '';
  const sharingLevel = values[FIELD_IDS.sharingLadderLevel] ?? '';

  const iterationHeader =
    `<!-- Iteration Log -->\n` +
    `<!-- Version: 1.1 -->\n` +
    `<!-- Changes: ${revisionNotes.replace(/\n/g, ' ')} -->\n` +
    `<!-- Sharing Level: ${sharingLevel} -->\n\n`;

  // Bump version number in the original content if present
  const bumpedOriginal = originalMd.replace(/# (.+) - v1\.0/, '# $1 - v1.1');

  return iterationHeader + bumpedOriginal;
}

function buildIteratedFilename(originalMd: string): string {
  // Extract title from first heading in the original .md
  const match = /^# (.+?) - v1/m.exec(originalMd);
  if (match) {
    return (
      match[1]
        .trim()
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 60) + '-v1.1.md'
    );
  }
  return 'Banking-AI-Skill-v1.1.md';
}

function StepHeader({
  number,
  label,
  description,
}: {
  readonly number: number;
  readonly label: string;
  readonly description: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="flex-shrink-0 w-7 h-7 rounded-sm flex items-center justify-center font-mono text-sm font-bold text-[color:var(--color-linen)]"
          style={{ backgroundColor: 'var(--color-terra)' }}
          aria-hidden="true"
        >
          {number}
        </div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-terra)]">
          Step {number}: {label}
        </p>
      </div>
      <p className="text-xs font-sans text-[color:var(--color-dust)] leading-relaxed ml-10">
        {description}
      </p>
    </div>
  );
}

function ReadOnlyField({ field, value }: { readonly field: FieldDef; readonly value: string }) {
  if (field.type === 'radio') {
    const selectedOption = (field.options ?? []).find((o) => o.value === value);
    return (
      <div className="mb-5">
        <p className="font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1">
          {field.label}
        </p>
        <div className="w-full border border-[color:var(--color-parch-dark)] rounded-sm px-3 py-2 text-sm font-sans bg-[color:var(--color-parch)] text-[color:var(--color-ink)]">
          {selectedOption?.label ?? (
            <span className="text-[color:var(--color-dust)] italic">No response</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <p className="font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1">
        {field.label}
      </p>
      <div className="w-full border border-[color:var(--color-parch-dark)] rounded-sm px-3 py-2 text-sm font-sans bg-[color:var(--color-parch)] text-[color:var(--color-ink)] min-h-[80px] whitespace-pre-wrap">
        {value || <span className="text-[color:var(--color-dust)] italic">No response</span>}
      </div>
    </div>
  );
}

function InteractiveField({
  field,
  value,
  error,
  onChange,
}: {
  readonly field: FieldDef;
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

  if (field.type === 'radio') {
    return (
      <div className="mb-5">
        <fieldset>
          <legend className="block font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1">
            {field.label}
            <span className="ml-1 text-[color:var(--color-error)] text-xs" aria-label="required">
              *
            </span>
          </legend>
          <div className="space-y-2" role="radiogroup" aria-describedby={errorId}>
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
            <p
              id={errorId}
              className="mt-1 text-[color:var(--color-error)] font-mono text-xs"
              role="alert"
            >
              Error: {error}
            </p>
          )}
        </fieldset>
      </div>
    );
  }

  // textarea
  return (
    <div className="mb-5">
      <label
        htmlFor={field.id}
        className="block font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1"
      >
        {field.label}
        <span className="ml-1 text-[color:var(--color-error)] text-xs" aria-label="required">
          *
        </span>
      </label>
      <textarea
        id={field.id}
        name={field.id}
        rows={4}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(field.id, e.target.value)}
        className={`${baseInputClass} ${borderClass} resize-y`}
        aria-describedby={describedBy}
        aria-invalid={hasError}
        aria-required="true"
      />
      {hasError && (
        <p
          id={errorId}
          className="mt-1 text-[color:var(--color-error)] font-mono text-xs"
          role="alert"
        >
          Error: {error}
        </p>
      )}
      {field.minLength && (
        <p id={hintId} className="mt-1 text-[11px] font-mono text-[color:var(--color-dust)]">
          {value.length}/{field.minLength} characters
        </p>
      )}
    </div>
  );
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

  // A11Y-01: Move focus to success region after submission
  useEffect(() => {
    if (state.submitted && !isReadOnly && successRef.current) {
      successRef.current.focus();
    }
  }, [state.submitted, isReadOnly]);

  // Fetch M7 Activity 7.1 response for the original skill .md
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
          if (!cancelled) {
            setState((prev) => ({ ...prev, originalSkillMd: mdContent, skillLoading: false }));
          }
        } else {
          if (!cancelled) {
            setState((prev) => ({ ...prev, originalSkillMd: null, skillLoading: false }));
          }
        }
      } catch {
        if (!cancelled) {
          setState((prev) => ({ ...prev, originalSkillMd: null, skillLoading: false }));
        }
      }
    }

    void loadM7Skill();
    return () => {
      cancelled = true;
    };
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
          body: JSON.stringify({
            enrollmentId,
            moduleNumber,
            activityId: activity.id,
            response: state.values,
          }),
        });

        if (res.ok || res.status === 409) {
          // Trigger .md download if M7 skill data is available
          if (state.originalSkillMd) {
            const iteratedMd = generateIteratedMarkdown(state.originalSkillMd, state.values);
            const filename = buildIteratedFilename(state.originalSkillMd);
            downloadMarkdown(iteratedMd, filename);
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
    [activity.id, enrollmentId, moduleNumber, onSubmitSuccess, state.originalSkillMd, state.values],
  );

  // Group fields by step for visual layout
  const getFieldsForStep = (fieldIds: readonly string[]) =>
    FIELDS.filter((f) => fieldIds.includes(f.id));

  return (
    <div
      className="border border-[color:var(--color-parch-dark)] border-l-4 rounded-sm overflow-hidden bg-white/40 mb-8"
      style={{ borderLeftColor: 'var(--color-terra)' }}
    >
      {/* Activity header */}
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

      <div className="border-t border-[color:var(--color-parch-dark)] px-6 py-6">
        {/* M7 skill reference note */}
        {!state.submitted && (
          <div className="mb-6 p-4 bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-dust)] mb-1">
              Before you begin
            </p>
            {state.skillLoading ? (
              <p className="text-sm font-sans text-[color:var(--color-dust)]">
                Loading your Module 7 skill...
              </p>
            ) : state.originalSkillMd ? (
              <p className="text-sm font-sans text-[color:var(--color-dust)] leading-relaxed">
                Your Module 7 skill file has been loaded. After submitting, an updated version
                (.md v1.1) with your iteration notes will download automatically.
              </p>
            ) : (
              <p className="text-sm font-sans text-[color:var(--color-dust)] leading-relaxed">
                Open your Module 7 skill .md file alongside this activity for reference.
                Your iteration notes will be saved. To export an updated skill file, apply
                the changes you document below to your Module 7 .md file manually.
              </p>
            )}
          </div>
        )}

        {state.submitted ? (
          <div
            ref={successRef}
            tabIndex={-1}
            aria-live="polite"
            aria-label="Iteration Tracker submitted successfully"
          >
            {STEPS.map((step) => (
              <div
                key={step.id}
                className="mb-8 pl-4 border-l-2 border-[color:var(--color-parch-dark)]"
              >
                <StepHeader
                  number={step.number}
                  label={step.label}
                  description={step.description}
                />
                {getFieldsForStep(step.fieldIds).map((field) => (
                  <ReadOnlyField
                    key={field.id}
                    field={field}
                    value={state.values[field.id] ?? ''}
                  />
                ))}
              </div>
            ))}

            {/* Completion note */}
            <div className="mt-4 pt-4 border-t border-[color:var(--color-parch-dark)]">
              <p className="text-xs font-mono text-[color:var(--color-dust)] uppercase tracking-widest mb-2">
                Iteration complete
              </p>
              <p className="text-sm font-sans text-[color:var(--color-dust)] leading-relaxed">
                Your iteration notes have been saved. If your Module 7 skill file was available,
                an updated .md file (v1.1) was downloaded with your revision notes prepended.
                Otherwise, apply the changes documented above to your Module 7 .md file manually.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate aria-label="Iteration Tracker form">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className="mb-8 pl-4 border-l-2 border-[color:var(--color-parch-dark)]"
              >
                <StepHeader
                  number={step.number}
                  label={step.label}
                  description={step.description}
                />
                {getFieldsForStep(step.fieldIds).map((field) => (
                  <InteractiveField
                    key={field.id}
                    field={field}
                    value={state.values[field.id] ?? ''}
                    error={state.errors[field.id]}
                    onChange={handleChange}
                  />
                ))}
              </div>
            ))}

            {state.serverError && (
              <p
                className="mt-3 mb-3 text-sm font-sans text-[color:var(--color-error)] bg-[color:var(--color-error)]/5 border border-[color:var(--color-error)]/20 rounded-sm px-3 py-2"
                role="alert"
              >
                {state.serverError}
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-[color:var(--color-parch-dark)]">
              <p className="text-xs font-sans text-[color:var(--color-dust)] mb-3 leading-relaxed">
                Submitting will save your iteration notes.
                {state.originalSkillMd
                  ? ' An updated .md file (v1.1) with your revision notes will also download automatically.'
                  : ''}
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
