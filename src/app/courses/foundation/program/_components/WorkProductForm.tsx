'use client';

// WorkProductForm — one final-packet work product with four required parts.
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
import Link from 'next/link';
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

interface SubmitSuccess {
  readonly message?: string;
  readonly certificateId?: string;
  readonly verifyUrl?: string;
  readonly certificateUrl?: string;
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
  const [submitSuccess, setSubmitSuccess] = useState<SubmitSuccess | null>(null);
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
          const data = (await res.json().catch(() => ({}))) as SubmitSuccess;
          setSubmitSuccess(data);
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
        className="border border-[color:var(--ink-a10)] border-l-4 rounded-2xl p-6 bg-[color:var(--cream)] shadow-[var(--shadow-soft)] focus:outline-none"
        style={{ borderLeftColor: 'var(--emerald-700)' }}
      >
        <p className="font-sans text-[0.6875rem] font-bold uppercase tracking-widest text-[color:var(--emerald-700)] mb-2">
          Submitted
        </p>
        <p className="font-sans text-base font-semibold text-[color:var(--ink)] mb-2">
          Your work product has been approved.
        </p>
        <p className="font-sans text-base text-[color:var(--slate-600)]">
          Your AiBI-Foundation certificate is ready now.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={submitSuccess?.certificateUrl ?? '/courses/foundation/program/certificate'}
            className="inline-flex items-center rounded-xl bg-[color:var(--ink)] px-5 py-3 font-sans text-[0.6875rem] font-bold uppercase tracking-widest text-[color:var(--cream)] transition-colors hover:bg-[color:var(--ink-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:ring-offset-2"
          >
            View certificate
          </Link>
          {submitSuccess?.verifyUrl ? (
            <Link
              href={submitSuccess.verifyUrl}
              className="inline-flex items-center rounded-xl border border-[color:var(--ink-a10)] bg-white px-5 py-3 font-sans text-[0.6875rem] font-bold uppercase tracking-widest text-[color:var(--ink)] transition-colors hover:border-[color:var(--gold)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:ring-offset-2"
            >
              Public verify page
            </Link>
          ) : null}
        </div>
        {submitSuccess?.certificateId ? (
          <p className="mt-3 font-sans text-xs text-[color:var(--slate-500)]">
            Certificate ID: {submitSuccess.certificateId}
          </p>
        ) : null}
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
          label="The Prompt You Used (redacted of sensitive data)"
          placeholder="Paste the prompt you gave the AI tool. Replace any sensitive data with [REDACTED]."
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
          label="Your Edited Output"
          placeholder="Paste your edited, ready-to-use version of the AI output."
          value={values.editedOutputText}
          error={errors.editedOutputText}
          minLength={MIN_EDITED_OUTPUT_TEXT}
          rows={7}
          onChange={handleFieldChange('editedOutputText')}
        />
        <TextAreaField
          id="annotation-text"
          label="Your Annotation"
          placeholder="4-6 sentences: hallucination patterns found, what you verified, and one improvement for your next AI interaction."
          value={values.annotationText}
          error={errors.annotationText}
          minLength={MIN_ANNOTATION_TEXT}
          rows={4}
          onChange={handleFieldChange('annotationText')}
        />

        {serverError && (
          <p
            className="mt-3 mb-3 text-sm font-sans text-[color:var(--ink)] bg-[color:var(--cream-2)] border-l-2 border-[color:var(--gold-deep)] rounded-r-lg px-3 py-2"
            role="alert"
          >
            {serverError}
          </p>
        )}

        <div className="mt-6 pt-6 border-t border-[color:var(--ink-a10)]">
          <button
            type="submit"
            disabled={submitting || !isValid}
            aria-disabled={submitting || !isValid}
            className="px-8 py-3 bg-[color:var(--ink)] hover:bg-[color:var(--ink-2)] disabled:bg-[color:var(--slate-200)] disabled:text-[color:var(--slate-500)] text-[color:var(--cream)] text-[0.6875rem] font-sans font-bold uppercase tracking-widest rounded-xl transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:ring-offset-2"
            aria-label={submitting ? 'Submitting work product…' : 'Submit work product'}
          >
            {submitting ? 'SUBMITTING…' : isResubmission ? 'SUBMIT RESUBMISSION' : 'SUBMIT WORK PRODUCT'}
          </button>
          {!isValid && !submitting && (
            <p className="mt-2 text-[0.6875rem] font-sans text-[color:var(--slate-500)]">
              Complete all required fields to enable submission.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
