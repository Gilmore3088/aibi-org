'use client';

// ActivityFormShell — renders activity fields as non-submitting form shells
// Client Component: needs 'use client' for form rendering context (no submission logic)
// SHELL only — no form submission. Activity interactivity is Phase 5-6 per CONTEXT.md

import type { Activity, ActivityField } from '@content/courses/aibi-p';

interface ActivityFormShellProps {
  readonly activity: Activity;
}

function renderField(field: ActivityField) {
  const labelEl = (
    <label
      htmlFor={field.id}
      className="block font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1"
    >
      {field.label}
      {field.required && (
        <span className="ml-1 text-[color:var(--color-error)] text-xs" aria-label="required">
          *
        </span>
      )}
    </label>
  );

  let input: React.ReactNode;

  switch (field.type) {
    case 'textarea':
      input = (
        <textarea
          id={field.id}
          name={field.id}
          placeholder={field.placeholder}
          rows={4}
          disabled
          className="w-full border border-[color:var(--color-parch-dark)] rounded-sm px-3 py-2 text-sm font-sans bg-[color:var(--color-parch)] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)] resize-y opacity-70 cursor-not-allowed focus:outline-none"
          aria-describedby={field.minLength ? `${field.id}-hint` : undefined}
        />
      );
      break;

    case 'radio':
      input = (
        <fieldset className="mt-1">
          <legend className="sr-only">{field.label}</legend>
          <div className="space-y-2">
            {(field.options ?? []).map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 cursor-not-allowed opacity-70"
              >
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  disabled
                  className="w-4 h-4 accent-[color:var(--color-terra)]"
                />
                <span className="text-sm font-sans text-[color:var(--color-ink)]">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      );
      break;

    case 'select':
      input = (
        <select
          id={field.id}
          name={field.id}
          disabled
          className="w-full border border-[color:var(--color-parch-dark)] rounded-sm px-3 py-2 text-sm font-sans bg-[color:var(--color-parch)] text-[color:var(--color-ink)] opacity-70 cursor-not-allowed focus:outline-none"
        >
          <option value="">{field.placeholder ?? 'Select an option'}</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
      break;

    case 'file':
      input = (
        <input
          type="file"
          id={field.id}
          name={field.id}
          disabled
          className="block w-full text-sm font-sans text-[color:var(--color-dust)] opacity-70 cursor-not-allowed"
        />
      );
      break;

    default: // text
      input = (
        <input
          type="text"
          id={field.id}
          name={field.id}
          placeholder={field.placeholder}
          disabled
          className="w-full border border-[color:var(--color-parch-dark)] rounded-sm px-3 py-2 text-sm font-sans bg-[color:var(--color-parch)] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)] opacity-70 cursor-not-allowed focus:outline-none"
        />
      );
  }

  return (
    <div key={field.id} className="mb-5">
      {field.type !== 'radio' && labelEl}
      {input}
      {field.minLength && (
        <p id={`${field.id}-hint`} className="mt-1 text-[11px] font-mono text-[color:var(--color-dust)]">
          Minimum {field.minLength} characters
        </p>
      )}
    </div>
  );
}

export function ActivityFormShell({ activity }: ActivityFormShellProps) {
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
        <h3 className="font-serif text-xl font-bold text-[color:var(--color-ink)] mb-2">
          {activity.title}
        </h3>
        <p className="text-sm font-sans text-[color:var(--color-dust)] leading-relaxed">
          {activity.description}
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-1">
        {activity.fields.map((field) => renderField(field))}
      </div>

      {/* Disabled submit */}
      <div className="mt-4 pt-4 border-t border-[color:var(--color-parch-dark)]">
        <button
          type="button"
          disabled
          className="px-6 py-2.5 bg-[color:var(--color-parch-dark)] text-[color:var(--color-dust)] text-[11px] font-mono uppercase tracking-widest rounded-sm cursor-not-allowed opacity-60"
          aria-label="Activity submission available when enrolled"
        >
          Activity submission available when enrolled
        </button>
      </div>
    </div>
  );
}
