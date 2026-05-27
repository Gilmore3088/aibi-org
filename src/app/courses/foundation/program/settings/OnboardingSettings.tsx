'use client';

// OnboardingSettings — pre-populated form for updating onboarding answers.
// Reuses the same three-question structure as OnboardingSurvey.tsx.
// Submits to /api/courses/save-onboarding (overwrites onboarding_answers).
// Keyboard accessible: all form elements reachable via Tab, selectable via Enter/Space.
//
// 2026-05-27: ported to mockup design system (Inter, ink/cream/gold).

import React, { useState, useCallback, useEffect, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { OnboardingAnswers, LearnerRole } from '@/types/course';
import { SettingsQuestions } from './SettingsQuestions';

const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const AI_SUBSCRIPTION_OPTIONS = [
  'ChatGPT Plus',
  'Claude Pro',
  'Perplexity Pro',
  'Google Gemini',
  'Microsoft Copilot Pro',
  'Other',
] as const;

type ExclusiveValue = 'free_tiers' | 'none';

const KNOWN_SUBSCRIPTIONS = new Set<string>(AI_SUBSCRIPTION_OPTIONS);

interface OnboardingSettingsProps {
  readonly enrollmentId: string;
  readonly currentAnswers: OnboardingAnswers | null;
}

interface FormState {
  uses_m365: OnboardingAnswers['uses_m365'] | null;
  personal_ai_subscriptions: string[];
  exclusive_selection: ExclusiveValue | null;
  primary_role: LearnerRole | null;
}

function deriveInitialFormState(answers: OnboardingAnswers | null): FormState {
  if (!answers) {
    return {
      uses_m365: null,
      personal_ai_subscriptions: [],
      exclusive_selection: null,
      primary_role: null,
    };
  }

  const subscriptions = answers.personal_ai_subscriptions as string[];
  const knownSubs = subscriptions.filter((s) => KNOWN_SUBSCRIPTIONS.has(s));
  const hasExclusive = knownSubs.length === 0 && subscriptions.length === 0;

  // Cannot distinguish 'free_tiers' from 'none' from an empty array;
  // default to null for exclusive_selection when pre-populating.
  return {
    uses_m365: answers.uses_m365,
    personal_ai_subscriptions: knownSubs,
    exclusive_selection: hasExclusive ? null : null,
    primary_role: answers.primary_role,
  };
}

const primaryButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  padding: '12px 26px',
  borderRadius: 12,
  background: 'var(--ink)',
  color: 'var(--cream)',
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  border: '1px solid var(--ink)',
  cursor: 'pointer',
  transition: 'background var(--t-fast) var(--ease)',
};

const backLinkStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  textDecoration: 'none',
};

export function OnboardingSettings({ enrollmentId, currentAnswers }: OnboardingSettingsProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => deriveInitialFormState(currentAnswers));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  // Fade out the "Saved" confirmation after 2 seconds
  useEffect(() => {
    if (!savedMessage) return;
    const timer = setTimeout(() => setSavedMessage(false), 2000);
    return () => clearTimeout(timer);
  }, [savedMessage]);

  const handleM365Select = useCallback((value: OnboardingAnswers['uses_m365']) => {
    setForm((prev) => ({ ...prev, uses_m365: value }));
  }, []);

  const handleSubscriptionCheckbox = useCallback((label: string, checked: boolean) => {
    setForm((prev) => {
      const next = checked
        ? [...prev.personal_ai_subscriptions, label]
        : prev.personal_ai_subscriptions.filter((s) => s !== label);
      return { ...prev, personal_ai_subscriptions: next, exclusive_selection: null };
    });
  }, []);

  const handleExclusiveSelect = useCallback((value: ExclusiveValue) => {
    setForm((prev) => ({
      ...prev,
      personal_ai_subscriptions: [],
      exclusive_selection: prev.exclusive_selection === value ? null : value,
    }));
  }, []);

  const handleRoleSelect = useCallback((value: LearnerRole) => {
    setForm((prev) => ({ ...prev, primary_role: value }));
  }, []);

  const canSave =
    form.uses_m365 !== null &&
    (form.personal_ai_subscriptions.length > 0 || form.exclusive_selection !== null) &&
    form.primary_role !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.uses_m365 || !form.primary_role) return;

    const answers: OnboardingAnswers = {
      uses_m365: form.uses_m365,
      personal_ai_subscriptions: form.personal_ai_subscriptions,
      primary_role: form.primary_role,
    };

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/courses/save-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, answers }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? 'Failed to save your settings. Please try again.');
      }

      setSavedMessage(true);
      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Page heading */}
      <div style={{ marginBottom: 36 }}>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--gold-deep)',
            margin: 0,
            marginBottom: 10,
          }}
        >
          Settings
        </p>
        <h1
          style={{
            fontFamily: INTER_STACK,
            fontSize: 36,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: 0,
            marginBottom: 10,
          }}
        >
          Update your profile
        </h1>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'var(--slate-600)',
            margin: 0,
          }}
        >
          Changes take effect on your next page load.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 40 }}
      >
        <SettingsQuestions
          uses_m365={form.uses_m365}
          personal_ai_subscriptions={form.personal_ai_subscriptions}
          exclusive_selection={form.exclusive_selection}
          primary_role={form.primary_role}
          onM365Select={handleM365Select}
          onSubscriptionCheckbox={handleSubscriptionCheckbox}
          onExclusiveSelect={handleExclusiveSelect}
          onRoleSelect={handleRoleSelect}
        />

        {/* Error message */}
        {errorMessage && (
          <div
            role="alert"
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              background: 'var(--cream-2)',
              border: '1px solid var(--gold-deep)',
              color: 'var(--gold-deep)',
              fontFamily: INTER_STACK,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Save confirmation */}
        {savedMessage && (
          <div
            role="status"
            aria-live="polite"
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              background: 'var(--emerald-50, #ECFDF5)',
              border: '1px solid var(--emerald-700)',
              color: 'var(--emerald-800)',
              fontFamily: INTER_STACK,
              fontSize: 13,
              fontWeight: 600,
              transition: 'opacity var(--t-med) var(--ease)',
            }}
          >
            Profile saved successfully.
          </div>
        )}

        {/* Footer actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 24,
            borderTop: '1px solid var(--ink-a10)',
          }}
        >
          <Link
            href="/courses/foundation/program"
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={backLinkStyle}
          >
            &larr; Back to course
          </Link>

          <button
            type="submit"
            disabled={!canSave || isSubmitting}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              ...primaryButtonStyle,
              opacity: !canSave || isSubmitting ? 0.4 : 1,
              cursor: !canSave || isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
