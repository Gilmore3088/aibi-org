'use client';

// WorkProductFields — TextAreaField component and validation utilities
// extracted from WorkProductForm.tsx.

export interface FormValues {
  inputText: string;
  rawOutputText: string;
  editedOutputText: string;
  annotationText: string;
}

export interface FormErrors {
  skillFile?: string;
  inputText?: string;
  rawOutputText?: string;
  editedOutputText?: string;
  annotationText?: string;
}

export const MIN_INPUT_TEXT = 50;
export const MIN_RAW_OUTPUT_TEXT = 50;
export const MIN_EDITED_OUTPUT_TEXT = 100;
export const MIN_ANNOTATION_TEXT = 50;

export function validateValues(values: FormValues, skillFilePath: string | null): FormErrors {
  const errors: FormErrors = {};

  if (!skillFilePath) {
    errors.skillFile = 'Upload your skill .md file before submitting.';
  }
  if (values.inputText.trim().length === 0) {
    errors.inputText = 'Input text is required.';
  } else if (values.inputText.length < MIN_INPUT_TEXT) {
    errors.inputText = `Must be at least ${MIN_INPUT_TEXT} characters (currently ${values.inputText.length}).`;
  }
  if (values.rawOutputText.trim().length === 0) {
    errors.rawOutputText = 'Raw AI output is required.';
  } else if (values.rawOutputText.length < MIN_RAW_OUTPUT_TEXT) {
    errors.rawOutputText = `Must be at least ${MIN_RAW_OUTPUT_TEXT} characters (currently ${values.rawOutputText.length}).`;
  }
  if (values.editedOutputText.trim().length === 0) {
    errors.editedOutputText = 'Edited output and annotation is required.';
  } else if (values.editedOutputText.length < MIN_EDITED_OUTPUT_TEXT) {
    errors.editedOutputText = `Must be at least ${MIN_EDITED_OUTPUT_TEXT} characters (currently ${values.editedOutputText.length}).`;
  }
  if (values.annotationText.trim().length === 0) {
    errors.annotationText = 'Annotation is required.';
  } else if (values.annotationText.length < MIN_ANNOTATION_TEXT) {
    errors.annotationText = `Must be at least ${MIN_ANNOTATION_TEXT} characters (currently ${values.annotationText.length}).`;
  }

  return errors;
}

export function isFormValid(values: FormValues, skillFilePath: string | null): boolean {
  return Object.keys(validateValues(values, skillFilePath)).length === 0;
}

const baseTextAreaClass =
  'w-full border rounded-lg px-3 py-2 text-base font-sans bg-white text-[color:var(--ink)] placeholder:text-[color:var(--slate-400)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:border-[color:var(--gold)] transition-shadow resize-y';

function errorBorderClass(hasError: boolean): string {
  return hasError
    ? 'border-[color:var(--gold-deep)]'
    : 'border-[color:var(--ink-a10)]';
}

export interface TextAreaFieldProps {
  readonly id: string;
  readonly label: string;
  readonly placeholder: string;
  readonly value: string;
  readonly error?: string;
  readonly minLength: number;
  readonly rows?: number;
  readonly onChange: (value: string) => void;
}

export function TextAreaField({
  id,
  label,
  placeholder,
  value,
  error,
  minLength,
  rows = 5,
  onChange,
}: TextAreaFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = `${id}-hint`;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const hasError = Boolean(error);

  return (
    <div className="mb-6">
      <label
        htmlFor={id}
        className="block font-sans text-base font-semibold text-[color:var(--ink)] mb-1"
      >
        {label}
        <span className="ml-1 text-[color:var(--gold-deep)] text-sm" aria-label="required">
          *
        </span>
      </label>
      <textarea
        id={id}
        name={id}
        placeholder={placeholder}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={`${baseTextAreaClass} ${errorBorderClass(hasError)}`}
        aria-describedby={describedBy}
        aria-invalid={hasError}
        aria-required
      />
      <p id={hintId} className="mt-1 text-[11px] font-sans text-[color:var(--slate-500)]">
        {value.length}/{minLength} characters minimum
      </p>
      {hasError && (
        <p
          id={errorId}
          className="mt-1 text-[color:var(--gold-deep)] font-sans text-sm"
          role="alert"
        >
          Error: {error}
        </p>
      )}
    </div>
  );
}
