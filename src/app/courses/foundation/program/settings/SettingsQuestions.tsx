'use client';

// SettingsQuestions — The three question sections for OnboardingSettings.
// Renders M365, AI Subscriptions, and Primary Role selectors.
//
// 2026-05-27: ported to mockup design system (Inter, ink/cream/gold).

import type { CSSProperties } from 'react';
import type { OnboardingAnswers, LearnerRole } from '@/types/course';

const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

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

const eyebrowStyle: CSSProperties = {
  display: 'block',
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  marginBottom: 10,
};

const questionTitleStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 20,
  fontWeight: 700,
  lineHeight: 1.3,
  letterSpacing: '-0.01em',
  color: 'var(--ink)',
  margin: 0,
};

const helperStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  margin: 0,
};

function optionButtonStyle(isSelected: boolean): CSSProperties {
  return {
    padding: '14px 16px',
    borderRadius: 12,
    background: isSelected ? 'var(--ink)' : 'var(--cream)',
    border: `1px solid ${isSelected ? 'var(--ink)' : 'var(--ink-a10)'}`,
    color: isSelected ? 'var(--cream)' : 'var(--ink)',
    fontFamily: INTER_STACK,
    fontSize: 16,
    fontWeight: 600,
    textAlign: 'left',
    cursor: 'pointer',
    transition:
      'background var(--t-fast) var(--ease), color var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease)',
    boxShadow: isSelected ? 'var(--shadow-soft)' : 'none',
  };
}

function checkboxRowStyle(isChecked: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    borderRadius: 12,
    cursor: 'pointer',
    background: isChecked ? 'var(--cream-2)' : 'var(--cream)',
    border: `1px solid ${isChecked ? 'var(--gold)' : 'var(--ink-a10)'}`,
    transition: 'background var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease)',
  };
}

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
      <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <span style={eyebrowStyle}>Foundational ecosystem</span>
          <h2 style={questionTitleStyle}>Does your institution use Microsoft 365?</h2>
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
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={optionButtonStyle(isSelected)}
                aria-pressed={isSelected}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Question 2: AI Subscriptions */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <span style={eyebrowStyle}>Personal capability</span>
          <h2 style={questionTitleStyle}>
            Do you currently have any personal AI subscriptions?
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} role="group" aria-label="AI subscription options">
          <p style={helperStyle}>Select all that apply</p>
          <div className="grid grid-cols-2 gap-3">
            {AI_SUBSCRIPTION_OPTIONS.map((label) => {
              const isChecked = personal_ai_subscriptions.includes(label);
              return (
                <label key={label} style={checkboxRowStyle(isChecked)}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => onSubscriptionCheckbox(label, e.target.checked)}
                    style={{ accentColor: 'var(--gold)' }}
                  />
                  <span
                    style={{
                      fontFamily: INTER_STACK,
                      fontSize: 16,
                      fontWeight: 500,
                      color: 'var(--ink)',
                    }}
                  >
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
          <div
            style={{
              paddingTop: 14,
              borderTop: '1px solid var(--ink-a10)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <p style={helperStyle}>Or select one</p>
            <div className="grid grid-cols-2 gap-3">
              {EXCLUSIVE_OPTIONS.map((opt) => {
                const isSelected = exclusive_selection === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onExclusiveSelect(opt.value)}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={optionButtonStyle(isSelected)}
                    aria-pressed={isSelected}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Question 3: Primary Role */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <span style={eyebrowStyle}>Persona mapping</span>
          <h2 style={questionTitleStyle}>What is your primary role at your institution?</h2>
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
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ ...optionButtonStyle(isSelected), textAlign: 'center' }}
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
