'use client';

// SurveyStepContent — The three survey step question panels for OnboardingSurvey.
// Renders the appropriate question section based on the current step.
//
// 2026-05-27: ported to mockup design system (Inter, ink/cream/gold).

import type { CSSProperties } from 'react';
import type { OnboardingAnswers, LearnerRole } from '@/types/course';
import {
  USES_M365_OPTIONS,
  AI_SUBSCRIPTION_OPTIONS,
  EXCLUSIVE_OPTIONS,
  ROLE_OPTIONS,
} from './SurveyQuestionOptions';

const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

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
  fontSize: 24,
  fontWeight: 700,
  lineHeight: 1.25,
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

const contextStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 16,
  fontWeight: 400,
  lineHeight: 1.6,
  color: 'var(--slate-600)',
  margin: '8px 0 0',
  maxWidth: '52ch',
};

function optionButtonStyle(isSelected: boolean): CSSProperties {
  return {
    padding: '18px 20px',
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

interface SurveyStepContentProps {
  readonly step: number;
  readonly uses_m365: OnboardingAnswers['uses_m365'] | null;
  readonly personal_ai_subscriptions: string[];
  readonly exclusive_selection: 'free_tiers' | 'none' | null;
  readonly primary_role: LearnerRole | null;
  readonly onM365Select: (value: OnboardingAnswers['uses_m365']) => void;
  readonly onSubscriptionCheckbox: (label: string, checked: boolean) => void;
  readonly onExclusiveSelect: (value: 'free_tiers' | 'none') => void;
  readonly onRoleSelect: (value: LearnerRole) => void;
}

export function SurveyStepContent({
  step,
  uses_m365,
  personal_ai_subscriptions,
  exclusive_selection,
  primary_role,
  onM365Select,
  onSubscriptionCheckbox,
  onExclusiveSelect,
  onRoleSelect,
}: SurveyStepContentProps) {
  return (
    <>
      {step === 1 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <span style={eyebrowStyle}>Question 1 of 3</span>
            <h2 style={questionTitleStyle}>Does your institution run on Microsoft 365?</h2>
            <p style={contextStyle}>
              Decides whether we surface Copilot patterns or stick to neutral
              tooling.
            </p>
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
      )}

      {step === 2 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <span style={eyebrowStyle}>Question 2 of 3</span>
            <h2 style={questionTitleStyle}>
              Which AI tools do you use today?
            </h2>
            <p style={contextStyle}>
              Sets the baseline. We won&rsquo;t teach what you already do.
            </p>
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
                paddingTop: 16,
                marginTop: 4,
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
      )}

      {step === 3 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <span style={eyebrowStyle}>Question 3 of 3</span>
            <h2 style={questionTitleStyle}>What&rsquo;s your primary role?</h2>
            <p style={contextStyle}>
              Determines the first prompt you save and the scenarios you see in
              Modules 4 through 8.
            </p>
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
      )}
    </>
  );
}
