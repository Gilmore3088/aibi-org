'use client';

// SkillBuilderPanels — RTFCPanel, StarterSelector, FormField, ReadOnlyView
// sub-components extracted from SkillBuilder.tsx.

import type { SkillStarter } from '../_lib/skillBuilderData';
import { FORMAT_OPTIONS } from '../_lib/skillBuilderData';

const FIELD_IDS = {
  role: 'skill-role',
  context: 'skill-context',
  task: 'skill-task',
  format: 'skill-format',
  constraint: 'skill-constraint',
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

export function RTFCPanel() {
  return (
    <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm p-6 h-full">
      <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-3">
        RTFC Framework
      </p>
      <h3 className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-1 leading-snug">
        The Four Components of a Banking AI Skill
      </h3>
      <p className="text-xs font-sans text-[color:var(--color-slate)] mb-6 leading-relaxed">
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
              <p className="text-xs font-sans text-[color:var(--color-slate)] leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-[color:var(--color-parch-dark)]">
        <p className="text-xs font-sans text-[color:var(--color-slate)] leading-relaxed">
          Context is embedded in your Role field. Adding institutional context directly to the Role
          definition produces a more coherent skill than separating it into a dedicated Context field.
        </p>
      </div>
    </div>
  );
}

interface StarterSelectorProps {
  readonly starters: readonly SkillStarter[];
  readonly selectedId: string;
  readonly onSelect: (starter: SkillStarter | null) => void;
}

export function StarterSelector({ starters, selectedId, onSelect }: StarterSelectorProps) {
  return (
    <div className="mb-6 p-4 bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm">
      <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-2">
        Skill Starters
      </p>
      <p className="text-xs font-sans text-[color:var(--color-slate)] mb-3 leading-relaxed">
        Select a pre-built skill for your role to auto-fill all fields. Edit freely once loaded.
      </p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Skill starter options">
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
            className="px-3 py-1.5 text-[11px] font-mono rounded-sm border border-[color:var(--color-parch-dark)] text-[color:var(--color-slate)] hover:text-[color:var(--color-ink)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-1"
            aria-label="Clear starter selection"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

interface FormFieldProps {
  readonly id: string;
  readonly label: string;
  readonly type: 'text' | 'textarea' | 'select';
  readonly value: string;
  readonly error?: string;
  readonly placeholder?: string;
  readonly minLength?: number;
  readonly options?: ReadonlyArray<{ readonly value: string; readonly label: string }>;
  readonly onChange: (id: string, value: string) => void;
}

export function FormField({
  id,
  label,
  type,
  value,
  error,
  placeholder,
  minLength,
  options,
  onChange,
}: FormFieldProps) {
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
        <p id={hintId} className="mt-1 text-[11px] font-mono text-[color:var(--color-slate)]">
          {value.length}/{minLength} characters
        </p>
      )}
      {type !== 'textarea' && type !== 'select' && minLength && (
        <p id={hintId} className="mt-1 text-[11px] font-mono text-[color:var(--color-slate)]">
          Minimum {minLength} characters
        </p>
      )}
    </div>
  );
}

interface ReadOnlyViewProps {
  readonly values: Record<string, string>;
}

export function ReadOnlyView({ values }: ReadOnlyViewProps) {
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
              <span className="text-[color:var(--color-slate)]">No response</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

