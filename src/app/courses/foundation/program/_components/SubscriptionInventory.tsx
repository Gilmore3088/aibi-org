'use client';

// SubscriptionInventory — M2 Activity 2.1 specialized component.
// Renders a 7-platform × 4-option radio grid for learners to audit their AI toolkit.
// On mobile (390px), each platform stacks vertically for readability.
// A11Y-01: keyboard accessible radio groups. A11Y-02: text error messages (not color-only).
// After successful submit, renders in read-only mode.
//
// Ported to mockup design system 2026-05-27 (Inter, ink/cream/gold).

import React, { useState, useCallback } from 'react';
import type { Activity } from '@content/courses/foundation-program';

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

const KICKER: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
};

const ERROR_RED = '#B91C1C';

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
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--ink-a10)',
        borderLeft: '4px solid var(--gold)',
        borderRadius: 'var(--r-lg)',
        padding: 24,
        marginBottom: 32,
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      {/* Activity header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ ...KICKER, color: 'var(--gold-deep)', margin: '0 0 4px' }}>
          Activity {activity.id}
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--ink)',
              letterSpacing: '-0.01em',
              margin: '0 0 8px',
            }}
          >
            {activity.title}
          </h3>
          {state.submitted && (
            <span
              style={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                background: 'var(--emerald-50)',
                border: '1px solid var(--emerald-700)',
                borderRadius: 999,
                ...KICKER,
                color: 'var(--emerald-700)',
              }}
            >
              Submitted
            </span>
          )}
        </div>
        <p style={{ fontSize: 14, color: 'var(--slate-600)', lineHeight: 1.6, margin: 0 }}>
          {activity.description}
        </p>
      </div>

      {state.submitted ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activity.fields.map((field, idx) => {
            const value = state.selections[field.id] ?? '';
            const selectedOption = field.options?.find((o) => o.value === value);
            const isLast = idx === activity.fields.length - 1;
            return (
              <div
                key={field.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  padding: '12px 0',
                  borderBottom: isLast ? 'none' : '1px solid var(--ink-a10)',
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--ink)',
                  }}
                >
                  {PLATFORM_LABELS[field.id] ?? field.label}
                </span>
                <span style={{ fontSize: 14, color: 'var(--slate-600)' }}>
                  {selectedOption?.label ?? getAccessLabel(field.id, value) ?? 'No selection'}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {activity.fields.map((field) => (
              <fieldset
                key={field.id}
                style={{ border: 0, margin: 0, padding: 0 }}
              >
                <legend
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--ink)',
                    marginBottom: 8,
                    padding: 0,
                  }}
                >
                  {PLATFORM_LABELS[field.id] ?? field.label}
                  <span
                    style={{ marginLeft: 4, color: ERROR_RED, fontSize: 12 }}
                    aria-label="required"
                  >
                    *
                  </span>
                </legend>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  {(field.options ?? []).map((opt) => {
                    const isSelected = state.selections[field.id] === opt.value;
                    return (
                      <label
                        key={opt.value}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: 'pointer',
                          padding: '8px 12px',
                          borderRadius: 'var(--r-md)',
                          border: `1px solid ${
                            isSelected ? 'var(--gold)' : 'var(--ink-a10)'
                          }`,
                          background: isSelected ? 'var(--gold-a10)' : '#FFFFFF',
                          transition: 'border-color .12s, background .12s',
                        }}
                      >
                        <input
                          type="radio"
                          name={field.id}
                          value={opt.value}
                          checked={isSelected}
                          onChange={() => handleSelect(field.id, opt.value)}
                          style={{
                            width: 16,
                            height: 16,
                            accentColor: 'var(--gold)',
                          }}
                          aria-label={`${PLATFORM_LABELS[field.id] ?? field.label}: ${opt.label}`}
                        />
                        <span style={{ fontSize: 14, color: 'var(--ink)' }}>
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
              style={{
                marginTop: 16,
                fontSize: 14,
                color: ERROR_RED,
                background: '#FEF2F2',
                border: `1px solid ${ERROR_RED}33`,
                borderRadius: 'var(--r-md)',
                padding: '8px 12px',
              }}
              role="alert"
            >
              Error: {state.validationError}
            </p>
          )}

          {state.serverError && (
            <p
              style={{
                marginTop: 16,
                fontSize: 14,
                color: ERROR_RED,
                background: '#FEF2F2',
                border: `1px solid ${ERROR_RED}33`,
                borderRadius: 'var(--r-md)',
                padding: '8px 12px',
              }}
              role="alert"
            >
              Error: {state.serverError}
            </p>
          )}

          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: '1px solid var(--ink-a10)',
            }}
          >
            <button
              type="submit"
              disabled={state.submitting}
              style={{
                padding: '12px 24px',
                background: state.submitting ? 'var(--slate-400)' : 'var(--ink)',
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                borderRadius: 'var(--r-md)',
                border: 'none',
                cursor: state.submitting ? 'not-allowed' : 'pointer',
                opacity: state.submitting ? 0.7 : 1,
              }}
              aria-label={state.submitting ? 'Submitting inventory' : 'Submit inventory'}
            >
              {state.submitting ? 'Submitting...' : 'Submit Inventory'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
