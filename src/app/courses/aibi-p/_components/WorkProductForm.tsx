'use client';

// WorkProductForm — Four-item work product submission form.
//
// Upload pattern (avoids Vercel 4.5MB body limit):
//   1. On file select → POST ?action=presign to get a Supabase presigned URL.
//   2. PUT file bytes directly to Supabase Storage using the signed URL.
//   3. On form submit → POST with text fields + storage path (not the file bytes).
//
// A11Y: All fields have associated <label>, error messages linked via aria-describedby,
// focus rings on all interactive elements, success region receives focus on submit.
//
// Resubmission mode: when isResubmission=true, shows reviewer feedback above the form.

import React, { useState, useCallback, useRef, useEffect } from 'react';

export interface WorkProductFormProps {
  readonly enrollmentId: string;
  readonly isResubmission?: boolean;
  readonly reviewFeedback?: string | null;
}

type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

interface FormValues {
  inputText: string;
  rawOutputText: string;
  editedOutputText: string;
  annotationText: string;
}

interface FormErrors {
  skillFile?: string;
  inputText?: string;
  rawOutputText?: string;
  editedOutputText?: string;
  annotationText?: string;
}

const MIN_INPUT_TEXT = 50;
const MIN_RAW_OUTPUT_TEXT = 50;
const MIN_EDITED_OUTPUT_TEXT = 100;
const MIN_ANNOTATION_TEXT = 50;

function validateValues(values: FormValues, skillFilePath: string | null): FormErrors {
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

function isFormValid(values: FormValues, skillFilePath: string | null): boolean {
  return Object.keys(validateValues(values, skillFilePath)).length === 0;
}

const baseTextAreaClass =
  'w-full border rounded-sm px-3 py-2 text-sm font-sans bg-white text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] transition-shadow resize-y';

function errorBorderClass(hasError: boolean): string {
  return hasError
    ? 'border-[color:var(--color-error)]'
    : 'border-[color:var(--color-parch-dark)]';
}

interface TextAreaFieldProps {
  readonly id: string;
  readonly label: string;
  readonly placeholder: string;
  readonly value: string;
  readonly error?: string;
  readonly minLength: number;
  readonly rows?: number;
  readonly onChange: (value: string) => void;
}

function TextAreaField({
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
        className="block font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1"
      >
        {label}
        <span className="ml-1 text-[color:var(--color-error)] text-xs" aria-label="required">
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
      <p id={hintId} className="mt-1 text-[11px] font-mono text-[color:var(--color-dust)]">
        {value.length}/{minLength} characters minimum
      </p>
      {hasError && (
        <p
          id={errorId}
          className="mt-1 text-[color:var(--color-error)] font-mono text-xs"
          role="alert"
        >
          Error: {error}
        </p>
      )}
    </div>
  );
}

export function WorkProductForm({
  enrollmentId,
  isResubmission = false,
  reviewFeedback = null,
}: WorkProductFormProps) {
  const [values, setValues] = useState<FormValues>({
    inputText: '',
    rawOutputText: '',
    editedOutputText: '',
    annotationText: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [skillFilePath, setSkillFilePath] = useState<string | null>(null);
  const [skillFileUrl, setSkillFileUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const successRef = useRef<HTMLDivElement>(null);

  // Move focus to success region on submit
  useEffect(() => {
    if (submitted && successRef.current) {
      successRef.current.focus();
    }
  }, [submitted]);

  const handleFieldChange = useCallback(
    (field: keyof FormValues) => (value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setServerError(null);
    },
    [],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadStatus('uploading');
      setUploadedFilename(file.name);
      setSkillFilePath(null);
      setSkillFileUrl(null);
      setErrors((prev) => ({ ...prev, skillFile: undefined }));
      setServerError(null);

      try {
        // Step 1: Get presigned upload URL
        const presignRes = await fetch('/api/courses/submit-work-product?action=presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrollmentId, filename: file.name }),
        });

        if (!presignRes.ok) {
          const data = (await presignRes.json()) as { error?: string };
          throw new Error(data.error ?? 'Failed to generate upload URL.');
        }

        const { signedUrl, path } = (await presignRes.json()) as {
          signedUrl: string;
          path: string;
        };

        // Step 2: Upload directly to Supabase Storage
        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error('File upload to storage failed. Please try again.');
        }

        setSkillFilePath(path);
        setSkillFileUrl(signedUrl);
        setUploadStatus('uploaded');
      } catch (err) {
        setUploadStatus('error');
        const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
        setErrors((prev) => ({ ...prev, skillFile: message }));
      }
    },
    [enrollmentId],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validateValues(values, skillFilePath);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setSubmitting(true);
      setServerError(null);

      try {
        const res = await fetch('/api/courses/submit-work-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollmentId,
            skillFileUrl: skillFilePath,
            inputText: values.inputText,
            rawOutputText: values.rawOutputText,
            editedOutputText: values.editedOutputText,
            annotationText: values.annotationText,
            isResubmission,
          }),
        });

        if (res.ok || res.status === 201) {
          setSubmitting(false);
          setSubmitted(true);
          return;
        }

        const data = (await res.json()) as {
          error?: string;
          fieldErrors?: Record<string, string>;
        };

        if (res.status === 400 && data.fieldErrors) {
          setErrors(data.fieldErrors as FormErrors);
          setSubmitting(false);
          return;
        }

        if (res.status === 401 || res.status === 403) {
          setServerError('Your session has expired. Please refresh the page and try again.');
          setSubmitting(false);
          return;
        }

        if (res.status === 409) {
          setServerError(data.error ?? 'A submission already exists for this enrollment.');
          setSubmitting(false);
          return;
        }

        setServerError(data.error ?? 'Submission failed. Please try again.');
        setSubmitting(false);
      } catch {
        setServerError('Network error. Please check your connection and try again.');
        setSubmitting(false);
      }
    },
    [enrollmentId, isResubmission, skillFilePath, values],
  );

  // Success state
  if (submitted) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        aria-live="polite"
        className="border border-[color:var(--color-parch-dark)] border-l-4 rounded-sm p-6 bg-[color:var(--color-parch)] focus:outline-none"
        style={{ borderLeftColor: 'var(--color-sage)' }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-sage)] mb-2">
          Submitted
        </p>
        <p className="font-sans text-base font-semibold text-[color:var(--color-ink)] mb-2">
          Your work product has been submitted.
        </p>
        <p className="font-sans text-sm text-[color:var(--color-dust)]">
          You will receive feedback within five business days.
        </p>
      </div>
    );
  }

  const isValid = isFormValid(values, skillFilePath);

  return (
    <div>
      {/* Resubmission feedback banner */}
      {isResubmission && reviewFeedback && (
        <div
          className="mb-8 border border-[color:var(--color-cobalt)] rounded-sm p-5 bg-[color:var(--color-parch)]"
          role="region"
          aria-label="Reviewer feedback"
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cobalt)] mb-2">
            Reviewer Feedback
          </p>
          <p className="font-sans text-sm text-[color:var(--color-ink)] whitespace-pre-wrap leading-relaxed">
            {reviewFeedback}
          </p>
        </div>
      )}

      {isResubmission && (
        <div className="mb-6">
          <p className="font-sans text-sm text-[color:var(--color-dust)] italic">
            Address the reviewer&#39;s feedback above, then resubmit your updated work product below.
            You may resubmit once.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* Skill file upload */}
        <div className="mb-6">
          <label
            htmlFor="skill-file"
            className="block font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-1"
          >
            Skill File (.md or .txt)
            <span className="ml-1 text-[color:var(--color-error)] text-xs" aria-label="required">
              *
            </span>
          </label>
          <p className="font-sans text-xs text-[color:var(--color-dust)] mb-2">
            Upload the completed skill template you built during the course.
          </p>

          <input
            id="skill-file"
            type="file"
            accept=".md,.txt"
            onChange={handleFileChange}
            disabled={uploadStatus === 'uploading'}
            aria-describedby={errors.skillFile ? 'skill-file-error' : 'skill-file-hint'}
            aria-invalid={Boolean(errors.skillFile)}
            className="block w-full text-sm font-sans text-[color:var(--color-ink)] file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border file:border-[color:var(--color-terra)] file:text-[11px] file:font-mono file:uppercase file:tracking-widest file:text-[color:var(--color-terra)] file:bg-transparent hover:file:bg-[color:var(--color-terra)] hover:file:text-[color:var(--color-linen)] file:cursor-pointer file:transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2 rounded-sm"
          />

          <p id="skill-file-hint" className="mt-1 text-[11px] font-mono text-[color:var(--color-dust)]">
            Accepted formats: .md, .txt
          </p>

          {uploadStatus === 'uploading' && (
            <p className="mt-2 text-[11px] font-mono text-[color:var(--color-dust)]" aria-live="polite">
              Uploading{uploadedFilename ? ` ${uploadedFilename}` : ''}…
            </p>
          )}

          {uploadStatus === 'uploaded' && uploadedFilename && (
            <p
              className="mt-2 text-[11px] font-mono text-[color:var(--color-sage)]"
              aria-live="polite"
            >
              Uploaded: {uploadedFilename}
            </p>
          )}

          {uploadStatus === 'error' && errors.skillFile && (
            <p
              id="skill-file-error"
              className="mt-1 text-[color:var(--color-error)] font-mono text-xs"
              role="alert"
            >
              Error: {errors.skillFile}
            </p>
          )}
        </div>

        {/* Input text */}
        <TextAreaField
          id="input-text"
          label="Input Used (redacted of sensitive data)"
          placeholder="Paste the input you provided to the AI tool. Replace any sensitive data with [REDACTED]."
          value={values.inputText}
          error={errors.inputText}
          minLength={MIN_INPUT_TEXT}
          rows={5}
          onChange={handleFieldChange('inputText')}
        />

        {/* Raw AI output */}
        <TextAreaField
          id="raw-output-text"
          label="Raw AI Output (unedited)"
          placeholder="Paste the complete, unedited output from the AI tool."
          value={values.rawOutputText}
          error={errors.rawOutputText}
          minLength={MIN_RAW_OUTPUT_TEXT}
          rows={6}
          onChange={handleFieldChange('rawOutputText')}
        />

        {/* Edited output + annotation */}
        <TextAreaField
          id="edited-output-text"
          label="Final Edited Output and Annotation"
          placeholder="Paste your edited version of the output, followed by a 4-6 sentence annotation covering: hallucination patterns found, what was verified, and one improvement for next iteration."
          value={values.editedOutputText}
          error={errors.editedOutputText}
          minLength={MIN_EDITED_OUTPUT_TEXT}
          rows={7}
          onChange={handleFieldChange('editedOutputText')}
        />

        {/* Annotation text */}
        <TextAreaField
          id="annotation-text"
          label="Annotation (separate field)"
          placeholder="4-6 sentences: hallucination patterns found, what you verified, and one improvement for your next AI interaction."
          value={values.annotationText}
          error={errors.annotationText}
          minLength={MIN_ANNOTATION_TEXT}
          rows={4}
          onChange={handleFieldChange('annotationText')}
        />

        {/* Server error */}
        {serverError && (
          <p
            className="mt-3 mb-3 text-sm font-sans text-[color:var(--color-error)] bg-[color:var(--color-error)]/5 border border-[color:var(--color-error)]/20 rounded-sm px-3 py-2"
            role="alert"
          >
            {serverError}
          </p>
        )}

        <div className="mt-6 pt-6 border-t border-[color:var(--color-parch-dark)]">
          <button
            type="submit"
            disabled={submitting || !isValid}
            aria-disabled={submitting || !isValid}
            className="px-8 py-3 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] disabled:bg-[color:var(--color-parch-dark)] disabled:text-[color:var(--color-dust)] text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
            aria-label={submitting ? 'Submitting work product…' : 'Submit work product'}
          >
            {submitting
              ? 'Submitting…'
              : isResubmission
              ? 'Submit Resubmission'
              : 'Submit Work Product'}
          </button>
          {!isValid && !submitting && (
            <p className="mt-2 text-[11px] font-mono text-[color:var(--color-dust)]">
              Complete all required fields to enable submission.
            </p>
          )}
        </div>
      </form>

      {/* Upload note */}
      {skillFileUrl && (
        <p className="mt-4 text-[11px] font-mono text-[color:var(--color-dust)]">
          Note: The signed upload URL is used for transfer only; your file is stored securely in private storage.
        </p>
      )}
    </div>
  );
}
