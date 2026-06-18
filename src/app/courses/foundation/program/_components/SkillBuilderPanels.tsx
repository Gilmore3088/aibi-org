'use client';

// SkillBuilderPanels — RTFCPanel, StarterSelector, FormField, ReadOnlyView
// sub-components extracted from SkillBuilder.tsx.
// Mockup chrome: cream surface, ink type, gold accent on emphasis, slate metadata.

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

const eyebrowClass =
  'font-sans text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold-deep)]';

export function RTFCPanel() {
  return (
    <div className="h-full rounded-2xl border border-[color:var(--ink-a10)] bg-[color:var(--cream-2)] p-6">
      <p className={`${eyebrowClass} mb-3`}>RTFC Framework</p>
      <h3 className="font-sans text-lg font-bold leading-snug text-[color:var(--ink)] mb-1">
        The Four Components of a Banking AI Skill
      </h3>
      <p className="font-sans text-sm leading-relaxed text-[color:var(--slate-600)] mb-6">
        Every field in the builder maps to a component of the RTFC Framework. Completing all four
        produces a skill file you can deploy immediately in any AI platform.
      </p>

      <div className="space-y-5">
        {RTFC_COMPONENTS.map((item) => (
          <div key={item.letter} className="flex gap-3">
            <div
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-sans text-sm font-bold text-[color:var(--ink)] bg-[color:var(--gold)]"
              aria-hidden="true"
            >
              {item.letter}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-base font-semibold text-[color:var(--ink)] mb-1">
                {item.label}
              </p>
              <p className="font-sans text-sm leading-relaxed text-[color:var(--slate-600)]">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-[color:var(--ink-a10)]">
        <p className="font-sans text-sm leading-relaxed text-[color:var(--slate-600)]">
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
    <div className="mb-6 rounded-2xl border border-[color:var(--ink-a10)] bg-[color:var(--cream-2)] p-4">
      <p className="font-sans text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--slate-500)] mb-2">
        Skill Starters
      </p>
      <p className="font-sans text-sm leading-relaxed text-[color:var(--slate-600)] mb-3">
        Select a pre-built skill for your role to auto-fill all fields. Edit freely once loaded.
      </p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Skill starter options">
        {starters.map((starter) => {
          const active = selectedId === starter.id;
          return (
            <button
              key={starter.id}
              type="button"
              onClick={() => onSelect(active ? null : starter)}
              className={`px-3 py-1.5 text-[12px] font-sans font-semibold uppercase tracking-[0.16em] rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:ring-offset-1 ${
                active
                  ? 'bg-[color:var(--gold)] text-[color:var(--ink)] border-[color:var(--gold)]'
                  : 'bg-white text-[color:var(--ink)] border-[color:var(--ink-a10)] hover:border-[color:var(--gold)] hover:text-[color:var(--gold-deep)]'
              }`}
              aria-pressed={active}
            >
              {starter.name}
            </button>
          );
        })}
        {selectedId && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="px-3 py-1.5 text-[12px] font-sans font-semibold uppercase tracking-[0.16em] rounded-full border border-[color:var(--ink-a10)] text-[color:var(--slate-500)] hover:text-[color:var(--ink)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:ring-offset-1"
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
    'w-full rounded-xl border px-3 py-2 text-base font-sans bg-white text-[color:var(--ink)] placeholder:text-[color:var(--slate-400)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] transition-shadow';
  const borderClass = hasError ? 'border-red-700' : 'border-[color:var(--ink-a10)]';

  return (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="block font-sans text-base font-semibold text-[color:var(--ink)] mb-1"
      >
        {label}
        <span className="ml-1 text-red-700 text-sm" aria-label="required">
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
        <p id={errorId} className="mt-1 font-sans text-sm text-red-700" role="alert">
          Error: {error}
        </p>
      )}

      {type === 'textarea' && minLength && (
        <p id={hintId} className="mt-1 font-sans text-[11px] text-[color:var(--slate-500)]">
          {value.length}/{minLength} characters
        </p>
      )}
      {type !== 'textarea' && type !== 'select' && minLength && (
        <p id={hintId} className="mt-1 font-sans text-[11px] text-[color:var(--slate-500)]">
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
          <p className="font-sans text-base font-semibold text-[color:var(--ink)] mb-1">
            {field.label}
          </p>
          <div className="w-full rounded-xl border border-[color:var(--ink-a10)] bg-[color:var(--cream-2)] px-3 py-2 text-base font-sans text-[color:var(--ink)] min-h-[40px] whitespace-pre-wrap">
            {field.value || (
              <span className="text-[color:var(--slate-500)]">No response</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
