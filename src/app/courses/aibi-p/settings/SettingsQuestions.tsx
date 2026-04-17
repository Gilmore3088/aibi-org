'use client';

// SettingsQuestions — The three question sections for OnboardingSettings.
// Renders M365, AI Subscriptions, and Primary Role selectors.

import type { OnboardingAnswers, LearnerRole } from '@/types/course';

const USES_M365_OPTIONS = [
  { value: 'yes' as const, label: 'Yes, we use M365' },
  { value: 'no' as const, label: 'Not currently' },
  { value: 'not_sure' as const, label: 'Not sure' },
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
  { value: 'free_tiers' as const, label: 'No, just free tiers' },
  { value: 'none' as const, label: 'None — no AI tools' },
] as const;

type ExclusiveValue = 'free_tiers' | 'none';

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

interface SettingsQuestionsProps {
  readonly uses_m365: OnboardingAnswers['uses_m365'] | null;
  readonly personal_ai_subscriptions: string[];
  readonly exclusive_selection: ExclusiveValue | null;
  readonly primary_role: LearnerRole | null;
  readonly onM365Select: (value: OnboardingAnswers['uses_m365']) => void;
  readonly onSubscriptionCheckbox: (label: string, checked: boolean) => void;
  readonly onExclusiveSelect: (value: ExclusiveValue) => void;
  readonly onRoleSelect: (value: LearnerRole) => void;
}

export function SettingsQuestions({
  uses_m365,
  personal_ai_subscriptions,
  exclusive_selection,
  primary_role,
  onM365Select,
  onSubscriptionCheckbox,
  onExclusiveSelect,
  onRoleSelect,
}: SettingsQuestionsProps) {
  return (
    <>
      {/* Question 1: M365 */}
      <section className="space-y-5">
        <div>
          <span
            className="block text-xs uppercase tracking-widest mb-2"
            style={{ fontFamily: "'DM Mono', monospace", color: 'var(--color-terra)' }}
          >
            Foundational Ecosystem
          </span>
          <h2
            className="text-xl font-bold leading-tight"
            style={{ fontFamily: "'Cormorant', serif", color: 'var(--color-ink)' }}
          >
            Does your institution use Microsoft 365?
          </h2>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          role="group"
          aria-label="Microsoft 365 usage"
        >
          {USES_M365_OPTIONS.map((opt) => {
            const isSelected = uses_m365 === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onM365Select(opt.value)}
                className="p-4 rounded-sm transition-all duration-200 text-left focus:outline-none focus-visible:ring-2"
                style={{
                  backgroundColor: isSelected ? 'var(--color-terra)' : 'var(--color-parch)',
                  border: isSelected ? '1.5px solid var(--color-terra)' : '1.5px solid transparent',
                  color: isSelected ? 'var(--color-linen)' : 'var(--color-ink)',
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ['--tw-ring-color' as any]: 'var(--color-terra)',
                }}
                aria-pressed={isSelected}
              >
                <span className="font-medium text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Question 2: AI Subscriptions */}
      <section className="space-y-5">
        <div>
          <span
            className="block text-xs uppercase tracking-widest mb-2"
            style={{ fontFamily: "'DM Mono', monospace", color: 'var(--color-terra)' }}
          >
            Personal Capability
          </span>
          <h2
            className="text-xl font-bold leading-tight"
            style={{ fontFamily: "'Cormorant', serif", color: 'var(--color-ink)' }}
          >
            Do you currently have any personal AI subscriptions?
          </h2>
        </div>
        <div className="space-y-3" role="group" aria-label="AI subscription options">
          <p
            className="text-xs uppercase tracking-widest"
            style={{ fontFamily: "'DM Mono', monospace", color: 'var(--color-ink)', opacity: 0.5 }}
          >
            Select all that apply
          </p>
          <div className="grid grid-cols-2 gap-3">
            {AI_SUBSCRIPTION_OPTIONS.map((label) => {
              const isChecked = personal_ai_subscriptions.includes(label);
              return (
                <label
                  key={label}
                  className="flex items-center gap-3 p-4 rounded-sm cursor-pointer transition-all duration-150"
                  style={{
                    backgroundColor: isChecked ? 'var(--color-terra-pale)' : 'var(--color-parch)',
                    border: isChecked ? '1.5px solid var(--color-terra)' : '1.5px solid transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => onSubscriptionCheckbox(label, e.target.checked)}
                    className="rounded-sm accent-[color:var(--color-terra)]"
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--color-ink)' }}
                  >
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
          <div className="pt-2 border-t" style={{ borderColor: 'rgba(181,81,46,0.1)' }}>
            <p
              className="text-xs uppercase tracking-widest mb-3"
              style={{ fontFamily: "'DM Mono', monospace", color: 'var(--color-ink)', opacity: 0.5 }}
            >
              Or select one
            </p>
            <div className="grid grid-cols-2 gap-3">
              {EXCLUSIVE_OPTIONS.map((opt) => {
                const isSelected = exclusive_selection === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onExclusiveSelect(opt.value)}
                    className="p-4 rounded-sm transition-all duration-150 text-left focus:outline-none focus-visible:ring-2"
                    style={{
                      backgroundColor: isSelected ? 'var(--color-terra)' : 'var(--color-parch)',
                      border: isSelected ? '1.5px solid var(--color-terra)' : '1.5px solid transparent',
                      color: isSelected ? 'var(--color-linen)' : 'var(--color-ink)',
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ['--tw-ring-color' as any]: 'var(--color-terra)',
                    }}
                    aria-pressed={isSelected}
                  >
                    <span className="text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Question 3: Primary Role */}
      <section className="space-y-5">
        <div>
          <span
            className="block text-xs uppercase tracking-widest mb-2"
            style={{ fontFamily: "'DM Mono', monospace", color: 'var(--color-terra)' }}
          >
            Persona Mapping
          </span>
          <h2
            className="text-xl font-bold leading-tight"
            style={{ fontFamily: "'Cormorant', serif", color: 'var(--color-ink)' }}
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
            const isSelected = primary_role === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onRoleSelect(opt.value)}
                className="py-4 px-3 rounded-sm font-medium text-sm transition-all duration-150 text-center focus:outline-none focus-visible:ring-2"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  backgroundColor: isSelected ? 'var(--color-terra)' : 'var(--color-parch)',
                  color: isSelected ? 'var(--color-linen)' : 'var(--color-ink)',
                  border: isSelected ? '1.5px solid var(--color-terra)' : '1.5px solid transparent',
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
    </>
  );
}
