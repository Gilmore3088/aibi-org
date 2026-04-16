'use client';

// RubricForm — 5-dimension rubric scoring form for work product review.
// Dimensions: Accuracy, Completeness, Tone and Voice, Judgment, Skill Quality (each 1-4).
// Accuracy hard gate: score of 1 auto-fails regardless of total.
// Passing threshold: total >= 14 AND Accuracy >= 3.
// Feedback required (>=100 chars) for failing submissions.

import { useState, useId, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface RubricFormProps {
  readonly submissionId: string;
}

type DimensionScore = 1 | 2 | 3 | 4;

interface Scores {
  accuracy: DimensionScore | null;
  completeness: DimensionScore | null;
  tone_and_voice: DimensionScore | null;
  judgment: DimensionScore | null;
  skill_quality: DimensionScore | null;
}

const DIMENSIONS = [
  {
    key: 'accuracy' as const,
    label: 'Accuracy',
    description: 'Factual correctness of the AI output and the learner\'s edits. Banking regulations and product information must be correct.',
    labels: {
      1: 'Fundamental errors',
      2: 'Some inaccuracies',
      3: 'Mostly accurate',
      4: 'Fully accurate',
    },
  },
  {
    key: 'completeness' as const,
    label: 'Completeness',
    description: 'How thoroughly the learner addressed the task requirements and covered all necessary components.',
    labels: {
      1: 'Major gaps',
      2: 'Partial coverage',
      3: 'Mostly complete',
      4: 'Comprehensive',
    },
  },
  {
    key: 'tone_and_voice' as const,
    label: 'Tone and Voice',
    description: 'Professionalism, clarity, and appropriateness of language for a banking audience.',
    labels: {
      1: 'Unprofessional',
      2: 'Inconsistent',
      3: 'Appropriate',
      4: 'Publication-ready',
    },
  },
  {
    key: 'judgment' as const,
    label: 'Judgment',
    description: 'Quality of critical thinking, risk awareness, and decisions about what to keep or edit from the AI output.',
    labels: {
      1: 'No critical thinking',
      2: 'Minimal analysis',
      3: 'Good judgment',
      4: 'Excellent judgment',
    },
  },
  {
    key: 'skill_quality' as const,
    label: 'Skill Quality',
    description: 'Whether the skill file is well-formed, reusable, and demonstrates professional-grade prompt engineering.',
    labels: {
      1: 'Non-functional',
      2: 'Partially functional',
      3: 'Good quality',
      4: 'Excellent quality',
    },
  },
] as const;

const MIN_FEEDBACK_LENGTH = 100;

function isScoreComplete(scores: Scores): boolean {
  return (
    scores.accuracy !== null &&
    scores.completeness !== null &&
    scores.tone_and_voice !== null &&
    scores.judgment !== null &&
    scores.skill_quality !== null
  );
}

function calcTotal(scores: Scores): number {
  return (
    (scores.accuracy ?? 0) +
    (scores.completeness ?? 0) +
    (scores.tone_and_voice ?? 0) +
    (scores.judgment ?? 0) +
    (scores.skill_quality ?? 0)
  );
}

function determinePassing(scores: Scores): boolean {
  if (!isScoreComplete(scores)) return false;
  const total = calcTotal(scores);
  return total >= 14 && (scores.accuracy ?? 0) >= 3;
}

export function RubricForm({ submissionId }: RubricFormProps) {
  const router = useRouter();
  const baseId = useId();

  const [scores, setScores] = useState<Scores>({
    accuracy: null,
    completeness: null,
    tone_and_voice: null,
    judgment: null,
    skill_quality: null,
  });
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<{
    result: 'approved' | 'failed';
    total: number;
    accuracyGateFailed: boolean;
  } | null>(null);

  const allScored = isScoreComplete(scores);
  const total = calcTotal(scores);
  const isPassing = determinePassing(scores);
  const accuracyAutoFail = scores.accuracy === 1;
  const feedbackRequired = allScored && !isPassing;
  const feedbackValid = feedback.trim().length >= MIN_FEEDBACK_LENGTH;
  const canSubmit =
    allScored && (!feedbackRequired || feedbackValid) && !isSubmitting && submitResult === null;

  function handleScoreChange(
    dimension: keyof Scores,
    value: string,
  ) {
    const parsed = parseInt(value, 10) as DimensionScore;
    setScores((prev) => ({ ...prev, [dimension]: parsed }));
    setSubmitError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!canSubmit || !isScoreComplete(scores)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      submissionId,
      scores: {
        accuracy: scores.accuracy,
        completeness: scores.completeness,
        tone_and_voice: scores.tone_and_voice,
        judgment: scores.judgment,
        skill_quality: scores.skill_quality,
      },
      feedback: feedback.trim() || undefined,
    };

    try {
      const res = await fetch('/api/courses/review-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        const errorData = data as { error?: string };
        setSubmitError(errorData.error ?? 'Review submission failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const resultData = data as {
        result: 'approved' | 'failed';
        total: number;
        accuracyGateFailed: boolean;
      };
      setSubmitResult(resultData);
      setIsSubmitting(false);

      // Redirect to queue after 2 seconds
      setTimeout(() => {
        router.push('/admin/reviewer');
        router.refresh();
      }, 2000);
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  }

  if (submitResult !== null) {
    const approved = submitResult.result === 'approved';
    return (
      <div
        className="rounded border px-6 py-5"
        style={{
          borderColor: approved
            ? 'var(--color-sage, #4a6741)'
            : 'var(--color-error, #9b2226)',
          backgroundColor: approved ? '#f0f5ef' : '#fdf3f3',
        }}
      >
        <p
          className="font-sans text-base font-semibold"
          style={{ color: approved ? 'var(--color-sage, #4a6741)' : 'var(--color-error, #9b2226)' }}
        >
          {approved ? 'Review submitted — Submission approved' : 'Review submitted — Submission failed'}
        </p>
        <p className="mt-1 font-sans text-sm text-gray-600">
          Total: {submitResult.total}/20
          {submitResult.accuracyGateFailed && ' (Accuracy hard gate triggered)'}
        </p>
        <p className="mt-2 font-sans text-sm text-gray-500">Redirecting to queue&hellip;</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-8">
        {DIMENSIONS.map((dim) => {
          const groupId = `${baseId}-${dim.key}`;
          const currentScore = scores[dim.key];

          return (
            <fieldset key={dim.key} role="radiogroup" aria-labelledby={`${groupId}-label`}>
              <legend id={`${groupId}-label`} className="w-full">
                <span className="font-sans text-base font-semibold text-gray-900">
                  {dim.label}
                </span>
                <span className="ml-2 font-sans text-sm text-gray-500">
                  {dim.description}
                </span>
              </legend>

              {/* Accuracy hard gate warning */}
              {dim.key === 'accuracy' && accuracyAutoFail && (
                <p
                  className="mt-2 rounded px-3 py-2 font-sans text-sm font-medium"
                  style={{
                    color: 'var(--color-error, #9b2226)',
                    backgroundColor: '#fdf3f3',
                    border: '1px solid var(--color-error, #9b2226)',
                  }}
                  role="alert"
                >
                  Accuracy score of 1 will automatically fail this submission regardless of total score.
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-3">
                {([1, 2, 3, 4] as const).map((value) => {
                  const inputId = `${groupId}-${value}`;
                  const isSelected = currentScore === value;

                  return (
                    <label
                      key={value}
                      htmlFor={inputId}
                      className="flex cursor-pointer items-center gap-2 rounded border px-3 py-2 font-sans text-sm transition-colors"
                      style={{
                        borderColor: isSelected
                          ? 'var(--color-terra, #b5512e)'
                          : 'var(--color-gray-300, #d1d5db)',
                        backgroundColor: isSelected ? 'var(--color-terra-pale, #f0c4ab)' : 'white',
                        color: isSelected ? 'var(--color-ink, #1e1a14)' : 'var(--color-gray-700, #374151)',
                      }}
                    >
                      <input
                        type="radio"
                        id={inputId}
                        name={`${dim.key}-score`}
                        value={value}
                        checked={isSelected}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleScoreChange(dim.key, e.target.value)
                        }
                        className="sr-only"
                        aria-label={`${dim.label}: ${value} — ${dim.labels[value]}`}
                      />
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: isSelected
                            ? 'var(--color-terra, #b5512e)'
                            : '#e5e7eb',
                          color: isSelected ? 'white' : '#6b7280',
                        }}
                        aria-hidden="true"
                      >
                        {value}
                      </span>
                      <span>{dim.labels[value]}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>

      {/* Live score total */}
      <div
        className="mt-8 flex items-center justify-between rounded border px-4 py-3"
        style={{ backgroundColor: 'var(--color-parch, #f5f0e6)', borderColor: '#d6cfc4' }}
      >
        <span className="font-sans text-sm font-medium text-gray-700">Total Score</span>
        <span
          className="text-lg font-bold"
          style={{
            fontFamily: 'var(--font-dm-mono, monospace)',
            color:
              !allScored
                ? '#9ca3af'
                : isPassing
                ? 'var(--color-sage, #4a6741)'
                : 'var(--color-error, #9b2226)',
          }}
        >
          {allScored ? `${total} / 20` : '— / 20'}
        </span>
        {allScored && (
          <span
            className="font-sans text-sm font-medium"
            style={{
              color: isPassing
                ? 'var(--color-sage, #4a6741)'
                : 'var(--color-error, #9b2226)',
            }}
          >
            {isPassing ? 'Passing' : 'Failing'}
          </span>
        )}
      </div>

      {/* Feedback textarea */}
      <div className="mt-6">
        <label htmlFor={`${baseId}-feedback`} className="block font-sans text-sm font-semibold text-gray-900">
          Written Feedback
          {feedbackRequired && (
            <span
              className="ml-1 font-normal"
              style={{ color: 'var(--color-error, #9b2226)' }}
            >
              (required for failing submissions)
            </span>
          )}
          {!feedbackRequired && (
            <span className="ml-1 font-normal text-gray-500">(optional for passing submissions)</span>
          )}
        </label>
        <textarea
          id={`${baseId}-feedback`}
          value={feedback}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            setFeedback(e.target.value);
            setSubmitError(null);
          }}
          rows={5}
          placeholder="Identify specific dimensions that fell short and provide actionable guidance for resubmission."
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-sans text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          aria-required={feedbackRequired}
          aria-describedby={feedbackRequired ? `${baseId}-feedback-hint` : undefined}
        />
        {feedbackRequired && (
          <p
            id={`${baseId}-feedback-hint`}
            className="mt-1 font-sans text-xs"
            style={{
              color:
                feedback.trim().length >= MIN_FEEDBACK_LENGTH
                  ? 'var(--color-sage, #4a6741)'
                  : 'var(--color-error, #9b2226)',
            }}
          >
            {feedback.trim().length} / {MIN_FEEDBACK_LENGTH} characters minimum
          </p>
        )}
      </div>

      {/* Submit error */}
      {submitError && (
        <p
          className="mt-4 rounded border px-3 py-2 font-sans text-sm"
          style={{
            color: 'var(--color-error, #9b2226)',
            borderColor: 'var(--color-error, #9b2226)',
            backgroundColor: '#fdf3f3',
          }}
          role="alert"
        >
          {submitError}
        </p>
      )}

      {/* Action buttons */}
      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded px-6 py-2.5 font-sans text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-terra, #b5512e)' }}
        >
          {isSubmitting ? 'Submitting…' : 'Submit Review'}
        </button>
        <a
          href="/admin/reviewer"
          className="font-sans text-sm text-gray-500 underline underline-offset-2 hover:text-gray-700"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
