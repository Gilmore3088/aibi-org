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

const FIELD_IDS = {
  role: 'skill-role',
  context: 'skill-context',
  task: 'skill-task',
  format: 'skill-format',
  constraint: 'skill-constraint',
  mdContent: 'skill-md-content',
} as const;

const RTFC_COMPONENTS = [
  {
    letter: 'R',
    label: 'Role',
    description:
      'Define the specific expert persona the AI must adopt. The Role sets vocabulary, assumptions, and reasoning depth. Start with "You are a [specific expertise]..."',
  },
  {
    letter: 'T',
    label: 'Task',
    description:
      'State the objective explicitly and completely. Use action verbs: Analyze, Extract, Draft, Identify, Flag. Avoid vague language like "help" or "review."',
  },
  {
    letter: 'F',
    label: 'Format',
    description:
      'Define the output structure. Name the format and specify its structure. A Markdown table, numbered list, or two-column format will produce different usable outputs.',
  },
  {
    letter: 'C',
    label: 'Constraints',
    description:
      'List the guardrails. Write as "never" or "always" statements. These prevent the AI from producing outputs that are unusable or inappropriate for banking contexts.',
  },
] as const;

function sanitizeFilename(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40);
}

function generateSkillMarkdown(values: Record<string, string>): string {
  const formatLabel =
    FORMAT_OPTIONS.find((o) => o.value === values[FIELD_IDS.format])?.label ??
    values[FIELD_IDS.format] ??
    '';

  const roleWords = (values[FIELD_IDS.role] ?? '').split(' ').slice(0, 8).join(' ');
  const title = roleWords ? `${roleWords} Skill` : 'Banking AI Skill';

  return (
    `# ${title} - v1.0\n\n` +
    `## Role\n${values[FIELD_IDS.role] ?? ''}\n\n` +
    `## Context\n${values[FIELD_IDS.context] ?? ''}\n\n` +
    `## Task\n${values[FIELD_IDS.task] ?? ''}\n\n` +
    `## Format\n${formatLabel}\n\n` +
    `## Constraints\n${values[FIELD_IDS.constraint] ?? ''}\n`
  );
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

function buildFilename(values: Record<string, string>): string {
  const roleRaw = values[FIELD_IDS.role] ?? '';
  const taskRaw = values[FIELD_IDS.task] ?? '';

  // Extract role keyword: first two significant words after "You are a"
  const roleWords = roleRaw
    .replace(/^you are a\s+/i, '')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 2)
    .join('-');

  // Extract task keyword: first significant verb-noun pair
  const taskWords = taskRaw
    .replace(/^analyze|^review|^produce|^draft/i, '')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 2)
    .join('-');

  const rolePart = sanitizeFilename(roleWords) || 'Banking';
  const taskPart = sanitizeFilename(taskWords) || 'Skill';

  return `${rolePart}-${taskPart}-Skill-v1.md`;
}

function validateFields(values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values[FIELD_IDS.role]?.trim()) {
    errors[FIELD_IDS.role] = 'Role is required.';
  } else if ((values[FIELD_IDS.role]?.length ?? 0) < 20) {
    errors[FIELD_IDS.role] = `Must be at least 20 characters (currently ${values[FIELD_IDS.role]?.length ?? 0}).`;
  }

  if (!values[FIELD_IDS.context]?.trim()) {
    errors[FIELD_IDS.context] = 'Context is required.';
  } else if ((values[FIELD_IDS.context]?.length ?? 0) < 20) {
    errors[FIELD_IDS.context] = `Must be at least 20 characters (currently ${values[FIELD_IDS.context]?.length ?? 0}).`;
  }

  if (!values[FIELD_IDS.task]?.trim()) {
    errors[FIELD_IDS.task] = 'Task is required.';
  } else if ((values[FIELD_IDS.task]?.length ?? 0) < 30) {
    errors[FIELD_IDS.task] = `Must be at least 30 characters (currently ${values[FIELD_IDS.task]?.length ?? 0}).`;
  }

  if (!values[FIELD_IDS.format]) {
    errors[FIELD_IDS.format] = 'Please select a Format.';
  }

  if (!values[FIELD_IDS.constraint]?.trim()) {
    errors[FIELD_IDS.constraint] = 'Constraints are required.';
  } else if ((values[FIELD_IDS.constraint]?.length ?? 0) < 30) {
    errors[FIELD_IDS.constraint] = `Must be at least 30 characters (currently ${values[FIELD_IDS.constraint]?.length ?? 0}).`;
  }

  return errors;
}

function RTFCPanel() {
  return (
    <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm p-6 h-full">
      <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-3">
        RTFC Framework
      </p>
      <h3 className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-1 leading-snug">
        The Four Components of a Banking AI Skill
      </h3>
      <p className="text-xs font-sans text-[color:var(--color-dust)] mb-6 leading-relaxed">
        Every field in the builder maps to a component of the RTFC Framework. Completing all four
        produces a skill file you can deploy immediately in any AI platform.
      </p>

      <div className="space-y-5">
        {RTFC_COMPONENTS.map((item) => (
          <div key={item.letter} className="flex gap-3">
            <div
              className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center font-mono text-sm font-bold text-[color:var(--color-linen)] transition-colors"
              style={{ backgroundColor: 'var(--color-terra)' }}
              aria-hidden="true"
            >
              {item.letter}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1">
                {item.label}
              </p>
              <p className="text-xs font-sans text-[color:var(--color-dust)] leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-[color:var(--color-parch-dark)]">
        <p className="text-xs font-sans text-[color:var(--color-dust)] leading-relaxed">
          Context is embedded in your Role field. Adding institutional context directly to the Role
          definition produces a more coherent skill than separating it into a dedicated Context field.
        </p>
      </div>
    </div>
  );
}

function StarterSelector({
  starters,
  selectedId,
  onSelect,
}: {
  readonly starters: readonly SkillStarter[];
  readonly selectedId: string;
  readonly onSelect: (starter: SkillStarter | null) => void;
}) {
  return (
    <div className="mb-6 p-4 bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm">
      <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-dust)] mb-2">
        Skill Starters
      </p>
      <p className="text-xs font-sans text-[color:var(--color-dust)] mb-3 leading-relaxed">
        Select a pre-built skill for your role to auto-fill all fields. Edit freely once loaded.
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Skill starter options"
      >
        {starters.map((starter) => (
          <button
            key={starter.id}
            type="button"
            onClick={() => onSelect(selectedId === starter.id ? null : starter)}
            className={`px-3 py-1.5 text-[11px] font-mono rounded-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-1 ${
              selectedId === starter.id
                ? 'bg-[color:var(--color-terra)] text-[color:var(--color-linen)] border-[color:var(--color-terra)]'
                : 'bg-white text-[color:var(--color-ink)] border-[color:var(--color-parch-dark)] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)]'
            }`}
            aria-pressed={selectedId === starter.id}
          >
            {starter.name}
          </button>
        ))}
        {selectedId && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="px-3 py-1.5 text-[11px] font-mono rounded-sm border border-[color:var(--color-parch-dark)] text-[color:var(--color-dust)] hover:text-[color:var(--color-ink)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-1"
            aria-label="Clear starter selection"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function FormField({
  id,
  label,
  type,
  value,
  error,
  placeholder,
  minLength,
  options,
  onChange,
}: {
  readonly id: string;
  readonly label: string;
  readonly type: 'text' | 'textarea' | 'select';
  readonly value: string;
  readonly error?: string;
  readonly placeholder?: string;
  readonly minLength?: number;
  readonly options?: ReadonlyArray<{ readonly value: string; readonly label: string }>;
  readonly onChange: (id: string, value: string) => void;
}) {
  const hintId = minLength ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const hasError = Boolean(error);

  const baseClass =
    'w-full border rounded-sm px-3 py-2 text-sm font-sans bg-white text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] transition-shadow';
  const borderClass = hasError
    ? 'border-[color:var(--color-error)]'
    : 'border-[color:var(--color-parch-dark)]';

  return (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="block font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1"
      >
        {label}
        <span className="ml-1 text-[color:var(--color-error)] text-xs" aria-label="required">
          *
        </span>
      </label>

      {type === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          rows={4}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(id, e.target.value)}
          className={`${baseClass} ${borderClass} resize-y`}
          aria-describedby={describedBy}
          aria-invalid={hasError}
          aria-required="true"
        />
      ) : type === 'select' ? (
        <select
          id={id}
          name={id}
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className={`${baseClass} ${borderClass}`}
          aria-describedby={describedBy}
          aria-invalid={hasError}
          aria-required="true"
        >
          <option value="">Select output format</option>
          {(options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          id={id}
          name={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(id, e.target.value)}
          className={`${baseClass} ${borderClass}`}
          aria-describedby={describedBy}
          aria-invalid={hasError}
          aria-required="true"
        />
      )}

      {hasError && (
        <p
          id={errorId}
          className="mt-1 text-[color:var(--color-error)] font-mono text-xs"
          role="alert"
        >
          Error: {error}
        </p>
      )}

      {type === 'textarea' && minLength && (
        <p id={hintId} className="mt-1 text-[11px] font-mono text-[color:var(--color-dust)]">
          {value.length}/{minLength} characters
        </p>
      )}
      {type !== 'textarea' && type !== 'select' && minLength && (
        <p id={hintId} className="mt-1 text-[11px] font-mono text-[color:var(--color-dust)]">
          Minimum {minLength} characters
        </p>
      )}
    </div>
  );
}

function ReadOnlyView({ values }: { readonly values: Record<string, string> }) {
  const formatLabel =
    FORMAT_OPTIONS.find((o) => o.value === values[FIELD_IDS.format])?.label ??
    values[FIELD_IDS.format] ??
    '';

  const fields = [
    { label: 'Role', value: values[FIELD_IDS.role] ?? '' },
    { label: 'Context', value: values[FIELD_IDS.context] ?? '' },
    { label: 'Task', value: values[FIELD_IDS.task] ?? '' },
    { label: 'Format', value: formatLabel },
    { label: 'Constraints', value: values[FIELD_IDS.constraint] ?? '' },
  ];

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.label}>
          <p className="font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1">
            {field.label}
          </p>
          <div className="w-full border border-[color:var(--color-parch-dark)] rounded-sm px-3 py-2 text-sm font-sans bg-[color:var(--color-parch)] text-[color:var(--color-ink)] min-h-[40px] whitespace-pre-wrap">
            {field.value || (
              <span className="text-[color:var(--color-dust)] italic">No response</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
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

  const handleStarterSelect = useCallback(
    (starter: SkillStarter | null) => {
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
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const errors = validateFields(state.values);
      if (Object.keys(errors).length > 0) {
        setState((prev) => ({ ...prev, errors }));
        return;
      }

      setState((prev) => ({ ...prev, submitting: true, serverError: null }));

      // Generate the .md content before submission so it can be stored
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
          // Trigger .md download client-side
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
    const filename = buildFilename(state.values);
    downloadMarkdown(mdContent, filename);
  }, [state.values]);

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

      {/* Two-column layout: RTFC panel + form/read-only */}
      <div className="border-t border-[color:var(--color-parch-dark)]">
        <div className="lg:grid lg:grid-cols-[280px_1fr]">
          {/* Left: RTFC Framework panel */}
          <div className="hidden lg:block border-r border-[color:var(--color-parch-dark)] p-6">
            <RTFCPanel />
          </div>

          {/* Right: Form or read-only view */}
          <div className="p-6">
            {state.submitted ? (
              <div
                ref={successRef}
                tabIndex={-1}
                aria-live="polite"
                aria-label="Skill Builder submitted successfully"
              >
                <ReadOnlyView values={state.values} />

                {/* Re-download button */}
                <div className="mt-6 pt-4 border-t border-[color:var(--color-parch-dark)]">
                  <p className="text-xs font-mono text-[color:var(--color-dust)] uppercase tracking-widest mb-2">
                    Your skill file
                  </p>
                  <p className="text-sm font-sans text-[color:var(--color-dust)] mb-3 leading-relaxed">
                    Your skill has been saved. Download it again to deploy in your AI platform.
                  </p>
                  <button
                    type="button"
                    onClick={handleRedownload}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
                    aria-label="Re-download your skill file"
                  >
                    <DownloadIcon />
                    Re-download Skill File
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Skill Starters */}
                <StarterSelector
                  starters={starters}
                  selectedId={state.selectedStarterId}
                  onSelect={handleStarterSelect}
                />

                {/* Mobile RTFC explainer */}
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
                  <FormField
                    id={FIELD_IDS.role}
                    label="Role"
                    type="text"
                    value={state.values[FIELD_IDS.role] ?? ''}
                    error={state.errors[FIELD_IDS.role]}
                    placeholder={placeholders.role}
                    minLength={20}
                    onChange={handleChange}
                  />

                  <FormField
                    id={FIELD_IDS.context}
                    label="Context"
                    type="textarea"
                    value={state.values[FIELD_IDS.context] ?? ''}
                    error={state.errors[FIELD_IDS.context]}
                    placeholder={placeholders.context}
                    minLength={20}
                    onChange={handleChange}
                  />

                  <FormField
                    id={FIELD_IDS.task}
                    label="Task"
                    type="textarea"
                    value={state.values[FIELD_IDS.task] ?? ''}
                    error={state.errors[FIELD_IDS.task]}
                    placeholder={placeholders.task}
                    minLength={30}
                    onChange={handleChange}
                  />

                  <FormField
                    id={FIELD_IDS.format}
                    label="Format"
                    type="select"
                    value={state.values[FIELD_IDS.format] ?? ''}
                    error={state.errors[FIELD_IDS.format]}
                    options={FORMAT_OPTIONS}
                    onChange={handleChange}
                  />

                  <FormField
                    id={FIELD_IDS.constraint}
                    label="Constraints"
                    type="textarea"
                    value={state.values[FIELD_IDS.constraint] ?? ''}
                    error={state.errors[FIELD_IDS.constraint]}
                    placeholder={placeholders.constraints}
                    minLength={30}
                    onChange={handleChange}
                  />

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
                      Submitting will save your skill and automatically download a .md file to your
                      device for deployment in your AI platform.
                    </p>
                    <button
                      type="submit"
                      disabled={state.submitting}
                      className="px-6 py-2.5 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] disabled:bg-[color:var(--color-parch-dark)] disabled:text-[color:var(--color-dust)] text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
                      aria-label={
                        state.submitting
                          ? 'Building and saving skill…'
                          : 'Save skill and download .md file'
                      }
                    >
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
