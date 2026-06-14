'use client';

// ONBD-01, ONBD-02: Three-question onboarding survey.
// Two-column layout on lg (left: branding/progress, right: form).
// Submits to /api/courses/save-onboarding, then routes to Module 1.
//
// 2026-04-29: prefixed with the WelcomeFirstPrompt module — a first-prompt-
// in-90-seconds value moment. Banker sees real AI output before the form.
// localStorage flag prevents the welcome from re-showing on refresh.
//
// 2026-05-27: ported to mockup design system (Inter, ink/cream/gold).

import { useState, useCallback, useEffect, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import type { OnboardingAnswers, LearnerRole } from '@/types/course';
import { SurveyBranding } from './SurveyBranding';
import { SurveyStepContent } from './SurveyStepContent';
import { WelcomeFirstPrompt } from './WelcomeFirstPrompt';
import { migrateStorageKey } from '@/lib/storage/migrate';

const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

// localStorage key — namespaced by enrollment to support multiple bankers
// sharing a browser (rare, but possible at a branch).
const WELCOME_DONE_KEY = (enrollmentId: string) =>
  `foundations-welcome-done-${enrollmentId}`;
const LEGACY_WELCOME_DONE_KEY = (enrollmentId: string) =>
  `aibi-p-welcome-done-${enrollmentId}`;

const TOTAL_STEPS = 3;

interface OnboardingSurveyProps {
  readonly enrollmentId: string;
}

interface FormState {
  uses_m365: OnboardingAnswers['uses_m365'] | null;
  personal_ai_subscriptions: string[];
  exclusive_selection: 'free_tiers' | 'none' | null;
  primary_role: LearnerRole | null;
}

const INITIAL_FORM_STATE: FormState = {
  uses_m365: null,
  personal_ai_subscriptions: [],
  exclusive_selection: null,
  primary_role: null,
};

const primaryButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  padding: '14px 28px',
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

const secondaryButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '8px 4px',
  transition: 'color var(--t-fast) var(--ease)',
};

export function OnboardingSurvey({ enrollmentId }: OnboardingSurveyProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Welcome moment runs once per enrollment. Default to 'unknown' to avoid
  // SSR flash; on mount we read localStorage and pick 'welcome' or 'survey'.
  const [welcomePhase, setWelcomePhase] = useState<'welcome' | 'survey' | 'unknown'>(
    'unknown',
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    migrateStorageKey(
      window.localStorage,
      LEGACY_WELCOME_DONE_KEY(enrollmentId),
      WELCOME_DONE_KEY(enrollmentId),
    );
    const done = window.localStorage.getItem(WELCOME_DONE_KEY(enrollmentId));
    setWelcomePhase(done === 'true' ? 'survey' : 'welcome');
  }, [enrollmentId]);

  const handleWelcomeContinue = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(WELCOME_DONE_KEY(enrollmentId), 'true');
    }
    setWelcomePhase('survey');
  }, [enrollmentId]);

  const handleM365Select = useCallback(
    (value: OnboardingAnswers['uses_m365']) => {
      setForm((prev) => ({ ...prev, uses_m365: value }));
    },
    [],
  );

  const handleSubscriptionCheckbox = useCallback((label: string, checked: boolean) => {
    setForm((prev) => {
      const next = checked
        ? [...prev.personal_ai_subscriptions, label]
        : prev.personal_ai_subscriptions.filter((s) => s !== label);
      return { ...prev, personal_ai_subscriptions: next, exclusive_selection: null };
    });
  }, []);

  const handleExclusiveSelect = useCallback((value: 'free_tiers' | 'none') => {
    setForm((prev) => ({
      ...prev,
      personal_ai_subscriptions: [],
      exclusive_selection: prev.exclusive_selection === value ? null : value,
    }));
  }, []);

  const handleRoleSelect = useCallback((value: LearnerRole) => {
    setForm((prev) => ({ ...prev, primary_role: value }));
  }, []);

  const canAdvance = (() => {
    if (step === 1) return form.uses_m365 !== null;
    if (step === 2)
      return (
        form.personal_ai_subscriptions.length > 0 || form.exclusive_selection !== null
      );
    if (step === 3) return form.primary_role !== null;
    return false;
  })();

  const handleNext = () => {
    if (step < TOTAL_STEPS && canAdvance) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!form.uses_m365 || !form.primary_role) return;

    const subscriptions: string[] =
      form.personal_ai_subscriptions.length > 0 ? form.personal_ai_subscriptions : [];

    const answers: OnboardingAnswers = {
      uses_m365: form.uses_m365,
      personal_ai_subscriptions: subscriptions,
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
        throw new Error(data.error ?? 'Failed to save your responses. Please try again.');
      }

      router.push('/courses/foundation/program/1');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (welcomePhase === 'unknown') {
    // Pre-mount; render nothing to avoid SSR flashing the survey before the
    // welcome decision is read from localStorage.
    return null;
  }

  if (welcomePhase === 'welcome') {
    return <WelcomeFirstPrompt onContinue={handleWelcomeContinue} />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-20"
      style={{ background: 'var(--cream)' }}
    >
      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          <SurveyBranding
            step={step}
            uses_m365={form.uses_m365}
            personal_ai_subscriptions={form.personal_ai_subscriptions}
            exclusive_selection={form.exclusive_selection}
            primary_role={form.primary_role}
          />

          {/* Right column: survey form */}
          <div
            className="lg:col-span-7"
            style={{
              padding: 40,
              borderRadius: 24,
              background: '#FFFFFF',
              border: '1px solid var(--ink-a10)',
              boxShadow: 'var(--shadow-feature)',
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (step === TOTAL_STEPS) {
                  void handleSubmit();
                } else {
                  handleNext();
                }
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 40 }}
            >
              <SurveyStepContent
                step={step}
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
                    fontSize: 16,
                    lineHeight: 1.6,
                    fontWeight: 600,
                  }}
                >
                  {errorMessage}
                </div>
              )}

              {/* Navigation */}
              <div
                style={{
                  paddingTop: 24,
                  borderTop: '1px solid var(--ink-a10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={secondaryButtonStyle}
                  >
                    &larr; PREVIOUS
                  </button>
                ) : (
                  <span />
                )}

                {step < TOTAL_STEPS ? (
                  <button
                    type="submit"
                    disabled={!canAdvance}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{
                      ...primaryButtonStyle,
                      opacity: canAdvance ? 1 : 0.4,
                      cursor: canAdvance ? 'pointer' : 'not-allowed',
                    }}
                  >
                    CONTINUE &rarr;
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!canAdvance || isSubmitting}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{
                      ...primaryButtonStyle,
                      opacity: !canAdvance || isSubmitting ? 0.4 : 1,
                      cursor: !canAdvance || isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isSubmitting ? 'SAVING…' : 'START MODULE 1 →'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
