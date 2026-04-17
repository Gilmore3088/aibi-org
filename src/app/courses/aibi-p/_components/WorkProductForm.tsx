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
import { SkillFileUpload } from './SkillFileUpload';
import { ResubmissionBanner } from './ResubmissionBanner';
import {
  TextAreaField,
  validateValues,
  isFormValid,
  type FormValues,
  type FormErrors,
  MIN_INPUT_TEXT,
  MIN_RAW_OUTPUT_TEXT,
  MIN_EDITED_OUTPUT_TEXT,
  MIN_ANNOTATION_TEXT,
} from './WorkProductFields';

export interface WorkProductFormProps {
  readonly enrollmentId: string;
  readonly isResubmission?: boolean;
  readonly reviewFeedback?: string | null;
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
  const [skillFilePath, setSkillFilePath] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const successRef = useRef<HTMLDivElement>(null);

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

  const handleFileUploaded = useCallback((path: string) => {
    setSkillFilePath(path);
    setErrors((prev) => ({ ...prev, skillFile: undefined }));
    setServerError(null);
  }, []);

  const handleFileError = useCallback((message: string) => {
    setErrors((prev) => ({ ...prev, skillFile: message }));
  }, []);

  const handleFileReset = useCallback(() => {
    setSkillFilePath(null);
    setErrors((prev) => ({ ...prev, skillFile: undefined }));
    setServerError(null);
  }, []);

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
        const data = (await res.json()) as { error?: string; fieldErrors?: Record<string, string> };
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
      {isResubmission && <ResubmissionBanner reviewFeedback={reviewFeedback} />}

      <form onSubmit={handleSubmit} noValidate>
        <SkillFileUpload
          enrollmentId={enrollmentId}
          error={errors.skillFile}
          onUploaded={handleFileUploaded}
          onError={handleFileError}
          onReset={handleFileReset}
        />
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
            {submitting ? 'Submitting…' : isResubmission ? 'Submit Resubmission' : 'Submit Work Product'}
          </button>
          {!isValid && !submitting && (
            <p className="mt-2 text-[11px] font-mono text-[color:var(--color-dust)]">
              Complete all required fields to enable submission.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
