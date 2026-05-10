'use client';

// OnboardingSettings — pre-populated form for updating onboarding answers.
// Reuses the same three-question structure as OnboardingSurvey.tsx.
// Submits to /api/courses/save-onboarding (overwrites onboarding_answers).
// Keyboard accessible: all form elements reachable via Tab, selectable via Enter/Space.

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { OnboardingAnswers, LearnerRole } from '@/types/course';
import { SettingsQuestions } from './SettingsQuestions';

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
      <div className="mb-10">
        <h1
          className="text-4xl font-bold leading-tight mb-3"
          style={{
            fontFamily: "'Cormorant', serif",
            color: 'var(--color-ink)',
            letterSpacing: '-0.02em',
          }}
        >
          Update Your Profile
        </h1>
        <p
          className="text-sm"
          style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--color-ink)', opacity: 0.6 }}
        >
          Changes take effect on your next page load.
        </p>
      </div>

      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-12">
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
            className="px-5 py-4 rounded-sm text-sm"
            role="alert"
            style={{
              backgroundColor: 'rgba(155,34,38,0.08)',
              border: '1px solid var(--color-error)',
              color: 'var(--color-error)',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Save confirmation */}
        {savedMessage && (
          <div
            className="px-5 py-4 rounded-sm text-sm transition-opacity duration-500"
            role="status"
            aria-live="polite"
            style={{
              backgroundColor: 'rgba(74,103,65,0.08)',
              border: '1px solid var(--color-sage)',
              color: 'var(--color-sage)',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Profile saved successfully.
          </div>
        )}

        {/* Footer actions */}
        <div
          className="flex items-center justify-between pt-8"
          style={{ borderTop: '1px solid rgba(181,81,46,0.1)' }}
        >
          <Link
            href="/courses/foundations"
            className="font-mono text-[11px] uppercase tracking-widest transition-colors focus:outline-none focus-visible:ring-2"
            style={{
              color: 'var(--color-ink)',
              opacity: 0.55,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ['--tw-ring-color' as any]: 'var(--color-terra)',
            }}
          >
            &larr; Back to Course
          </Link>

          <button
            type="submit"
            disabled={!canSave || isSubmitting}
            className="px-8 py-3 rounded-sm uppercase tracking-wider text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              backgroundColor: 'var(--color-terra)',
              color: 'var(--color-linen)',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ['--tw-ring-color' as any]: 'var(--color-terra)',
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
