'use client';

// SubscriptionInventory — M2 Activity 2.1 specialized component.
// Renders a 7-platform × 4-option radio grid for learners to audit their AI toolkit.
// On mobile (390px), each platform stacks vertically for readability.
// A11Y-01: keyboard accessible radio groups. A11Y-02: text error messages (not color-only).
// After successful submit, renders in read-only mode.

import React, { useState, useCallback } from 'react';
import type { Activity } from '@content/courses/aibi-p';

export interface SubscriptionInventoryProps {
  readonly activity: Activity;
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponse?: Record<string, string> | null;
  readonly onSubmitSuccess?: (activityId: string) => void;
}

interface InventoryState {
  selections: Record<string, string>;
  submitting: boolean;
  submitted: boolean;
  serverError: string | null;
  validationError: string | null;
}

// Map field ID -> display label for the column headers and row labels
const PLATFORM_LABELS: Record<string, string> = {
  'chatgpt-access':       'ChatGPT (OpenAI)',
  'claude-access':        'Claude (Anthropic)',
  'gemini-access':        'Gemini (Google)',
  'copilot-access':       'Microsoft 365 Copilot',
  'perplexity-access':    'Perplexity',
  'notebooklm-access':    'NotebookLM (Google)',
  'copilot-free-access':  'Microsoft Copilot (Free)',
};

function getAccessLabel(fieldId: string, value: string): string {
  const field = fieldId;
  // For display in read-only mode, map value back to human-readable label
  if (field === 'copilot-access') {
    const labels: Record<string, string> = {
      'institutional':    'Institutional license (IT-provisioned)',
      'not-provisioned':  'Not provisioned for me',
      'not-sure':         'Not sure',
      'none':             'Institution does not have it',
    };
    return labels[value] ?? value;
  }
  const labels: Record<string, string> = {
    'free':     'Free tier',
    'paid':     'Paid subscription',
    'not-sure': 'Not sure',
    'none':     'Not using',
    'institutional':   'Institutional license (IT-provisioned)',
    'not-provisioned': 'Not provisioned for me',
  };
  return labels[value] ?? value;
}

export function SubscriptionInventory({
  activity,
  enrollmentId,
  moduleNumber,
  existingResponse,
  onSubmitSuccess,
}: SubscriptionInventoryProps) {
  const isReadOnly = existingResponse != null;

  const [state, setState] = useState<InventoryState>({
    selections: existingResponse ?? {},
    submitting: false,
    submitted: isReadOnly,
    serverError: null,
    validationError: null,
  });

  const handleSelect = useCallback((fieldId: string, value: string) => {
    setState((prev) => ({
      ...prev,
      selections: { ...prev.selections, [fieldId]: value },
      validationError: null,
      serverError: null,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate all fields have a selection
      const missingFields = activity.fields.filter(
        (f) => !state.selections[f.id],
      );
      if (missingFields.length > 0) {
        setState((prev) => ({
          ...prev,
          validationError: `Please make a selection for all ${activity.fields.length} platforms before submitting.`,
        }));
        return;
      }

      setState((prev) => ({ ...prev, submitting: true, serverError: null, validationError: null }));

      try {
        const res = await fetch('/api/courses/submit-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollmentId,
            moduleNumber,
            activityId: activity.id,
            response: state.selections,
          }),
        });

        if (res.ok || res.status === 409) {
          setState((prev) => ({ ...prev, submitting: false, submitted: true }));
          onSubmitSuccess?.(activity.id);
          return;
        }

        const data = (await res.json()) as { error?: string };

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
    [activity.fields, activity.id, enrollmentId, moduleNumber, onSubmitSuccess, state.selections],
  );

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

      {state.submitted ? (
        // Read-only display after submission
        <div className="space-y-4">
          {activity.fields.map((field) => {
            const value = state.selections[field.id] ?? '';
            const selectedOption = field.options?.find((o) => o.value === value);
            return (
              <div
                key={field.id}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-[color:var(--color-parch-dark)] last:border-0"
              >
                <span className="font-sans text-sm font-semibold text-[color:var(--color-ink)] sm:w-52 shrink-0">
                  {PLATFORM_LABELS[field.id] ?? field.label}
                </span>
                <span className="font-sans text-sm text-[color:var(--color-dust)]">
                  {selectedOption?.label ?? getAccessLabel(field.id, value) ?? (
                    <em>No selection</em>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        // Interactive radio grid
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            {activity.fields.map((field) => (
              <fieldset key={field.id} className="border-0 m-0 p-0">
                <legend className="font-sans text-sm font-semibold text-[color:var(--color-ink)] mb-2">
                  {PLATFORM_LABELS[field.id] ?? field.label}
                  <span className="ml-1 text-[color:var(--color-error)] text-xs" aria-label="required">
                    *
                  </span>
                </legend>

                {/* Options — wrap on mobile, row on sm+ */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4">
                  {(field.options ?? []).map((opt) => {
                    const isSelected = state.selections[field.id] === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={[
                          'flex items-center gap-2 cursor-pointer px-3 py-2 rounded-sm border transition-colors',
                          isSelected
                            ? 'border-[color:var(--color-terra)] bg-[color:var(--color-terra)]/5'
                            : 'border-[color:var(--color-parch-dark)] hover:border-[color:var(--color-terra)]/40',
                        ].join(' ')}
                      >
                        <input
                          type="radio"
                          name={field.id}
                          value={opt.value}
                          checked={isSelected}
                          onChange={() => handleSelect(field.id, opt.value)}
                          className="w-4 h-4 accent-[color:var(--color-terra)] focus:ring-2 focus:ring-[color:var(--color-terra)]"
                          aria-label={`${PLATFORM_LABELS[field.id] ?? field.label}: ${opt.label}`}
                        />
                        <span className="text-sm font-sans text-[color:var(--color-ink)]">
                          {opt.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {state.validationError && (
            <p
              className="mt-4 text-sm font-sans text-[color:var(--color-error)] bg-[color:var(--color-error)]/5 border border-[color:var(--color-error)]/20 rounded-sm px-3 py-2"
              role="alert"
            >
              {state.validationError}
            </p>
          )}

          {state.serverError && (
            <p
              className="mt-4 text-sm font-sans text-[color:var(--color-error)] bg-[color:var(--color-error)]/5 border border-[color:var(--color-error)]/20 rounded-sm px-3 py-2"
              role="alert"
            >
              {state.serverError}
            </p>
          )}

          <div className="mt-6 pt-4 border-t border-[color:var(--color-parch-dark)]">
            <button
              type="submit"
              disabled={state.submitting}
              className="px-6 py-2.5 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] disabled:bg-[color:var(--color-parch-dark)] disabled:text-[color:var(--color-dust)] text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
              aria-label={state.submitting ? 'Submitting inventory…' : 'Submit inventory'}
            >
              {state.submitting ? 'Submitting…' : 'Submit Inventory'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
