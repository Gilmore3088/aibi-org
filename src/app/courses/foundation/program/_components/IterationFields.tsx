'use client';

// IterationFields — ReadOnlyField, InteractiveField, and StepHeader
// sub-components extracted from IterationTracker.tsx.

interface FieldDef {
  id: string;
  label: string;
  type: 'textarea' | 'radio';
  minLength?: number;
  placeholder?: string;
  options?: ReadonlyArray<{ value: string; label: string }>;
}

export type { FieldDef };

interface StepHeaderProps {
  readonly number: number;
  readonly label: string;
  readonly description: string;
}

export function StepHeader({ number, label, description }: StepHeaderProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-sans text-sm font-bold text-[color:var(--ink)]"
          style={{ backgroundColor: 'var(--gold)' }}
          aria-hidden="true"
        >
          {number}
        </div>
        <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-[color:var(--gold-deep)]">
          Step {number}: {label}
        </p>
      </div>
      <p className="text-xs font-sans text-[color:var(--slate-600)] leading-relaxed ml-10">
        {description}
      </p>
    </div>
  );
}

interface ReadOnlyFieldProps {
  readonly field: FieldDef;
  readonly value: string;
}

export function ReadOnlyField({ field, value }: ReadOnlyFieldProps) {
  if (field.type === 'radio') {
    const selectedOption = (field.options ?? []).find((o) => o.value === value);
    return (
      <div className="mb-5">
        <p className="font-sans text-sm font-semibold text-[color:var(--ink)] mb-1">
          {field.label}
        </p>
        <div className="w-full border border-[color:var(--ink-a10)] rounded-lg px-3 py-2 text-sm font-sans bg-[color:var(--cream-2)] text-[color:var(--ink)]">
          {selectedOption?.label ?? (
            <span className="text-[color:var(--slate-500)]">No response</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <p className="font-sans text-sm font-semibold text-[color:var(--ink)] mb-1">
        {field.label}
      </p>
      <div className="w-full border border-[color:var(--ink-a10)] rounded-lg px-3 py-2 text-sm font-sans bg-[color:var(--cream-2)] text-[color:var(--ink)] min-h-[80px] whitespace-pre-wrap">
        {value || <span className="text-[color:var(--slate-500)]">No response</span>}
      </div>
    </div>
  );
}

interface InteractiveFieldProps {
  readonly field: FieldDef;
  readonly value: string;
  readonly error?: string;
  readonly onChange: (fieldId: string, value: string) => void;
}

export function InteractiveField({ field, value, error, onChange }: InteractiveFieldProps) {
  const hintId = field.minLength ? `${field.id}-hint` : undefined;
  const errorId = error ? `${field.id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const hasError = Boolean(error);

  const baseInputClass =
    'w-full border rounded-lg px-3 py-2 text-sm font-sans bg-white text-[color:var(--ink)] placeholder:text-[color:var(--slate-400)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:border-[color:var(--gold)] transition-shadow';
  const borderClass = hasError
    ? 'border-[color:var(--gold-deep)]'
    : 'border-[color:var(--ink-a10)]';

  if (field.type === 'radio') {
    return (
      <div className="mb-5">
        <fieldset>
          <legend className="block font-sans text-sm font-semibold text-[color:var(--ink)] mb-1">
            {field.label}
            <span className="ml-1 text-[color:var(--gold-deep)] text-xs" aria-label="required">
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
                  className="w-4 h-4 accent-[color:var(--gold)] focus:ring-2 focus:ring-[color:var(--gold)]"
                />
                <span className="text-sm font-sans text-[color:var(--ink)]">{opt.label}</span>
              </label>
            ))}
          </div>
          {hasError && (
            <p
              id={errorId}
              className="mt-1 text-[color:var(--gold-deep)] font-sans text-xs"
              role="alert"
            >
              Error: {error}
            </p>
          )}
        </fieldset>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <label
        htmlFor={field.id}
        className="block font-sans text-sm font-semibold text-[color:var(--ink)] mb-1"
      >
        {field.label}
        <span className="ml-1 text-[color:var(--gold-deep)] text-xs" aria-label="required">
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
          className="mt-1 text-[color:var(--gold-deep)] font-sans text-xs"
          role="alert"
        >
          Error: {error}
        </p>
      )}
      {field.minLength && (
        <p id={hintId} className="mt-1 text-[11px] font-sans text-[color:var(--slate-500)]">
          {value.length}/{field.minLength} characters
        </p>
      )}
    </div>
  );
}
