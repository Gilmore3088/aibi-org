'use client';

// ONBD-01, ONBD-02: Three-question onboarding survey.
// Two-column layout on lg (left: branding/progress, right: form).
// Submits to /api/courses/save-onboarding, then routes to Module 1.

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { OnboardingAnswers, LearnerRole } from '@/types/course';

const USES_M365_OPTIONS = [
  { value: 'yes' as const, label: 'Yes, we use M365' },
  { value: 'no' as const, label: 'Not currently' },
  { value: 'not_sure' as const, label: "Not sure" },
] satisfies { value: OnboardingAnswers['uses_m365']; label: string }[];

const AI_SUBSCRIPTION_OPTIONS = [
  'ChatGPT Plus',
  'Claude Pro',
  'Perplexity Pro',
  'Google Gemini',
  'Microsoft Copilot Pro',
  'Other',
] as const;

const EXCLUSIVE_OPTIONS = [
  { value: 'free_tiers', label: 'No, just free tiers' },
  { value: 'none', label: 'None — no AI tools' },
] as const;

const ROLE_OPTIONS: { value: LearnerRole; label: string }[] = [
  { value: 'lending', label: 'Lending' },
  { value: 'operations', label: 'Operations' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'it', label: 'IT' },
  { value: 'retail', label: 'Retail' },
  { value: 'executive', label: 'Executive' },
  { value: 'other', label: 'Other' },
];

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

export function OnboardingSurvey({ enrollmentId }: OnboardingSurveyProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const progressPercent = Math.round(((step - 1) / TOTAL_STEPS) * 100);

  const handleM365Select = useCallback(
    (value: OnboardingAnswers['uses_m365']) => {
      setForm((prev) => ({ ...prev, uses_m365: value }));
    },
    []
  );

  const handleSubscriptionCheckbox = useCallback((label: string, checked: boolean) => {
    setForm((prev) => {
      const next = checked
        ? [...prev.personal_ai_subscriptions, label]
        : prev.personal_ai_subscriptions.filter((s) => s !== label);
      return { ...prev, personal_ai_subscriptions: next, exclusive_selection: null };
    });
  }, []);

  const handleExclusiveSelect = useCallback(
    (value: 'free_tiers' | 'none') => {
      setForm((prev) => ({
        ...prev,
        personal_ai_subscriptions: [],
        exclusive_selection: prev.exclusive_selection === value ? null : value,
      }));
    },
    []
  );

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
      form.personal_ai_subscriptions.length > 0
        ? form.personal_ai_subscriptions
        : [];

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

      router.push('/courses/aibi-p/1');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabel = ['Infrastructure Assessment', 'Personal Capability', 'Persona Mapping'][
    step - 1
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* Left column: branding and progress */}
          <div className="lg:col-span-5 flex flex-col space-y-12">
            <div>
              <span
                className="text-xs font-bold tracking-widest uppercase mb-4 block"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  color: 'var(--color-terra)',
                }}
              >
                Institutional Record 1.4
              </span>
              <h1
                className="text-5xl font-extrabold leading-none"
                style={{
                  fontFamily: "'Cormorant', serif",
                  color: 'var(--color-ink)',
                  letterSpacing: '-0.02em',
                }}
              >
                Curation of{' '}
                <span
                  className="italic"
                  style={{ color: 'var(--color-terra)' }}
                >
                  Context
                </span>
              </h1>
              <p
                className="mt-6 text-base leading-relaxed max-w-sm"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: 'var(--color-ink)',
                  opacity: 0.7,
                }}
              >
                To personalize your journey through the AiBI-P curriculum, we
                need a brief read of your current professional environment.
              </p>
            </div>

            {/* Step progress indicator */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    border: '1px solid var(--color-terra)',
                    color: 'var(--color-terra)',
                    backgroundColor: 'var(--color-linen)',
                  }}
                >
                  {String(step).padStart(2, '0')}
                </div>
                <div className="flex-1 h-px relative overflow-hidden" style={{ backgroundColor: 'rgba(181,81,46,0.15)' }}>
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: 'var(--color-terra)',
                    }}
                  />
                </div>
                <div
                  className="text-sm flex-shrink-0"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    color: 'var(--color-ink)',
                    opacity: 0.4,
                  }}
                >
                  {String(TOTAL_STEPS).padStart(2, '0')}
                </div>
              </div>
              <p
                className="text-xs font-medium uppercase tracking-tighter"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  color: 'var(--color-ink)',
                  opacity: 0.6,
                }}
              >
                Current Phase: {stepLabel}
              </p>
            </div>

            {/* Credential callout */}
            <div
              className="p-8 rounded-sm"
              style={{
                backgroundColor: 'var(--color-parch)',
                border: '1px solid rgba(181,81,46,0.15)',
              }}
            >
              <p
                className="text-base italic leading-relaxed"
                style={{
                  fontFamily: "'Cormorant', serif",
                  color: 'var(--color-ink)',
                  opacity: 0.75,
                }}
              >
                "The Banking AI Practitioner certification bridges the gap
                between institutional legacy and generative futures."
              </p>
            </div>
          </div>

          {/* Right column: survey form */}
          <div
            className="lg:col-span-7 p-10 lg:p-16 rounded-sm"
            style={{
              backgroundColor: 'white',
              border: '1px solid rgba(181,81,46,0.1)',
              boxShadow: '20px 0 40px rgba(30,26,20,0.02)',
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
              className="space-y-12"
            >

              {/* ---- Question 1: M365 ---- */}
              {step === 1 && (
                <section className="space-y-6">
                  <div>
                    <span
                      className="block text-xs uppercase tracking-widest mb-2"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        color: 'var(--color-terra)',
                      }}
                    >
                      Foundational Ecosystem
                    </span>
                    <h2
                      className="text-2xl font-bold leading-tight"
                      style={{
                        fontFamily: "'Cormorant', serif",
                        color: 'var(--color-ink)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      Does your institution use Microsoft 365?
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="group" aria-label="Microsoft 365 usage">
                    {USES_M365_OPTIONS.map((opt) => {
                      const isSelected = form.uses_m365 === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleM365Select(opt.value)}
                          className="flex items-center justify-between p-5 rounded-sm transition-all duration-200 text-left focus:outline-none focus-visible:ring-2"
                          style={{
                            backgroundColor: isSelected
                              ? 'var(--color-terra)'
                              : 'var(--color-parch)',
                            border: isSelected
                              ? '1.5px solid var(--color-terra)'
                              : '1.5px solid transparent',
                            color: isSelected ? 'var(--color-linen)' : 'var(--color-ink)',
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            ['--tw-ring-color' as any]: 'var(--color-terra)',
                          }}
                          aria-pressed={isSelected}
                        >
                          <span
                            className="font-medium text-sm"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          >
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ---- Question 2: AI Subscriptions ---- */}
              {step === 2 && (
                <section className="space-y-6">
                  <div>
                    <span
                      className="block text-xs uppercase tracking-widest mb-2"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        color: 'var(--color-terra)',
                      }}
                    >
                      Personal Capability
                    </span>
                    <h2
                      className="text-2xl font-bold leading-tight"
                      style={{
                        fontFamily: "'Cormorant', serif",
                        color: 'var(--color-ink)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      Do you currently have any personal AI subscriptions?
                    </h2>
                  </div>

                  <div className="space-y-3" role="group" aria-label="AI subscription options">
                    <p
                      className="text-xs uppercase tracking-widest"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        color: 'var(--color-ink)',
                        opacity: 0.5,
                      }}
                    >
                      Select all that apply
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {AI_SUBSCRIPTION_OPTIONS.map((label) => {
                        const isChecked = form.personal_ai_subscriptions.includes(label);
                        return (
                          <label
                            key={label}
                            className="flex items-center gap-3 p-4 rounded-sm cursor-pointer transition-all duration-150"
                            style={{
                              backgroundColor: isChecked
                                ? 'var(--color-terra-pale)'
                                : 'var(--color-parch)',
                              border: isChecked
                                ? '1.5px solid var(--color-terra)'
                                : '1.5px solid transparent',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                handleSubscriptionCheckbox(label, e.target.checked)
                              }
                              className="rounded-sm accent-[color:var(--color-terra)]"
                            />
                            <span
                              className="text-sm font-medium"
                              style={{
                                fontFamily: "'DM Sans', sans-serif",
                                color: 'var(--color-ink)',
                              }}
                            >
                              {label}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    <div
                      className="pt-2 border-t"
                      style={{ borderColor: 'rgba(181,81,46,0.1)' }}
                    >
                      <p
                        className="text-xs uppercase tracking-widest mb-3"
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          color: 'var(--color-ink)',
                          opacity: 0.5,
                        }}
                      >
                        Or select one
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {EXCLUSIVE_OPTIONS.map((opt) => {
                          const isSelected = form.exclusive_selection === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleExclusiveSelect(opt.value)}
                              className="flex items-center justify-between p-4 rounded-sm transition-all duration-150 text-left focus:outline-none focus-visible:ring-2"
                              style={{
                                backgroundColor: isSelected
                                  ? 'var(--color-terra)'
                                  : 'var(--color-parch)',
                                border: isSelected
                                  ? '1.5px solid var(--color-terra)'
                                  : '1.5px solid transparent',
                                color: isSelected ? 'var(--color-linen)' : 'var(--color-ink)',
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                ['--tw-ring-color' as any]: 'var(--color-terra)',
                              }}
                              aria-pressed={isSelected}
                            >
                              <span
                                className="text-sm font-medium"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              >
                                {opt.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ---- Question 3: Primary Role ---- */}
              {step === 3 && (
                <section className="space-y-6">
                  <div>
                    <span
                      className="block text-xs uppercase tracking-widest mb-2"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        color: 'var(--color-terra)',
                      }}
                    >
                      Persona Mapping
                    </span>
                    <h2
                      className="text-2xl font-bold leading-tight"
                      style={{
                        fontFamily: "'Cormorant', serif",
                        color: 'var(--color-ink)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      What is your primary role at your institution?
                    </h2>
                  </div>
                  <div
                    className="grid grid-cols-2 md:grid-cols-3 gap-3"
                    role="group"
                    aria-label="Primary role selection"
                  >
                    {ROLE_OPTIONS.map((opt) => {
                      const isSelected = form.primary_role === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleRoleSelect(opt.value)}
                          className="py-4 px-3 rounded-sm font-medium text-sm transition-all duration-150 text-center focus:outline-none focus-visible:ring-2"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            backgroundColor: isSelected
                              ? 'var(--color-terra)'
                              : 'var(--color-parch)',
                            color: isSelected ? 'var(--color-linen)' : 'var(--color-ink)',
                            border: isSelected
                              ? '1.5px solid var(--color-terra)'
                              : '1.5px solid transparent',
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            ['--tw-ring-color' as any]: 'var(--color-terra)',
                          }}
                          aria-pressed={isSelected}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

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

              {/* Navigation */}
              <div
                className="pt-8 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(181,81,46,0.1)' }}
              >
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 font-medium text-sm transition-colors focus:outline-none focus-visible:ring-2"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: 'var(--color-ink)',
                      opacity: 0.6,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ['--tw-ring-color' as any]: 'var(--color-terra)',
                    }}
                  >
                    &larr; Previous
                  </button>
                ) : (
                  <span />
                )}

                {step < TOTAL_STEPS ? (
                  <button
                    type="submit"
                    disabled={!canAdvance}
                    className="flex items-center gap-3 px-10 py-4 rounded-sm uppercase tracking-wider text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      backgroundColor: 'var(--color-terra)',
                      color: 'var(--color-linen)',
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ['--tw-ring-color' as any]: 'var(--color-terra)',
                    }}
                  >
                    Continue &rarr;
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!canAdvance || isSubmitting}
                    className="flex items-center gap-3 px-10 py-4 rounded-sm uppercase tracking-wider text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      backgroundColor: 'var(--color-terra)',
                      color: 'var(--color-linen)',
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ['--tw-ring-color' as any]: 'var(--color-terra)',
                    }}
                  >
                    {isSubmitting ? 'Saving...' : <>Begin Your Journey &rarr;</>}
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
