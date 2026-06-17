'use client';

// OnboardingSettings — pre-populated form for updating onboarding answers.
// Submits to /api/courses/save-onboarding (overwrites onboarding_answers).
//
// 2026-05-27 (audit §13): redesigned to lead with what the learner CAN
// change — a "Your current setup" summary card with the active values
// and a short note on how each affects the experience — followed by the
// edit panel that reuses SettingsQuestions. Account/sign-out lives in a
// small footer panel. Low-density utility surface; copy stays short.

import React, { useState, useCallback, useEffect, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { OnboardingAnswers, LearnerRole } from '@/types/course';
import { SettingsQuestions } from './SettingsQuestions';
import { signOutAction } from '@/app/auth/actions';

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

const ROLE_LABEL: Record<LearnerRole, string> = {
  lending: 'Lending',
  operations: 'Operations',
  compliance: 'Compliance',
  finance: 'Finance',
  marketing: 'Marketing',
  it: 'IT',
  retail: 'Retail',
  executive: 'Executive',
  other: 'Other',
};

const M365_LABEL: Record<OnboardingAnswers['uses_m365'], string> = {
  yes: 'Yes — your institution uses M365',
  no: 'Not currently',
  not_sure: 'Not sure',
};

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
  // Detect the exclusive sentinel encoded in personal_ai_subscriptions
  // on submit. 'free_tiers' and 'none' are mutually exclusive with any
  // known-subscription label, so we read the first one we find. Fixes
  // the issue where re-opening the settings page lost the original
  // "Free tiers" / "None" selection because exclusive_selection was
  // never persisted, only the empty knownSubs array was.
  const exclusive: ExclusiveValue | null =
    subscriptions.includes('free_tiers')
      ? 'free_tiers'
      : subscriptions.includes('none')
        ? 'none'
        : null;

  return {
    uses_m365: answers.uses_m365,
    personal_ai_subscriptions: knownSubs,
    exclusive_selection: exclusive,
    primary_role: answers.primary_role,
  };
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const kickerStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const summaryCardStyle: CSSProperties = {
  background: 'var(--cream)',
  border: '1px solid var(--ink-a10)',
  borderRadius: 24,
  padding: '24px 26px',
  boxShadow: 'var(--shadow-soft)',
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
};

const summaryRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(140px, 180px) 1fr',
  gap: 16,
  alignItems: 'baseline',
  padding: '12px 0',
  borderTop: '1px solid var(--ink-a10)',
};

const summaryLabelStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  margin: 0,
};

const summaryValueStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 16,
  fontWeight: 600,
  color: 'var(--ink)',
  margin: 0,
  lineHeight: 1.4,
};

const summaryNoteStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 16,
  fontWeight: 400,
  color: 'var(--slate-600)',
  margin: '4px 0 0',
  lineHeight: 1.6,
};

const editPanelStyle: CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid var(--ink-a10)',
  borderRadius: 24,
  padding: '28px 28px 32px',
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
};

const accountFooterStyle: CSSProperties = {
  background: 'var(--cream)',
  border: '1px solid var(--ink-a10)',
  borderRadius: 16,
  padding: '18px 22px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
};

const primaryButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  padding: '12px 26px',
  borderRadius: 12,
  background: 'var(--gold)',
  color: 'var(--ink)',
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  border: '1px solid var(--gold)',
  cursor: 'pointer',
  transition: 'background var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease)',
};

const backLinkStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  textDecoration: 'none',
};

const signOutLinkStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--ink)',
  textDecoration: 'none',
};

// ---------------------------------------------------------------------------
// Helpers — render current values for the summary card
// ---------------------------------------------------------------------------

function describeSubscriptions(subs: readonly string[]): string {
  if (subs.length === 0) return 'No paid AI subscriptions on file';
  return subs.join(' · ');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OnboardingSettings({ enrollmentId, currentAnswers }: OnboardingSettingsProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => deriveInitialFormState(currentAnswers));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

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

    // Persist the exclusive selection as a sentinel inside
    // personal_ai_subscriptions. The two modes are mutually exclusive,
    // so on submit we either store the named subscriptions OR the
    // single sentinel ('free_tiers' / 'none'). deriveInitialFormState()
    // round-trips this back to exclusive_selection on next load.
    const persistedSubscriptions: readonly string[] = form.exclusive_selection
      ? [form.exclusive_selection]
      : form.personal_ai_subscriptions;

    const answers: OnboardingAnswers = {
      uses_m365: form.uses_m365,
      personal_ai_subscriptions: persistedSubscriptions,
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

  // ---- Current values for the summary card (from saved answers, not form) ----
  const savedRole = currentAnswers?.primary_role ?? null;
  const savedM365 = currentAnswers?.uses_m365 ?? null;
  const savedSubs = currentAnswers?.personal_ai_subscriptions ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* Page heading — compact, utility-grade */}
      <header>
        <p style={kickerStyle}>Settings</p>
        <h1
          style={{
            fontFamily: INTER_STACK,
            fontSize: 36,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: '12px 0 8px',
          }}
        >
          Your profile
        </h1>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 16,
            lineHeight: 1.6,
            color: 'var(--slate-600)',
            margin: 0,
            maxWidth: '60ch',
          }}
        >
          The course personalises examples, role paths, and recommended skills
          from these answers. Update them whenever your work shifts.
        </p>
      </header>

      {/* Your current setup — leads with what's active */}
      <section style={summaryCardStyle} aria-labelledby="current-setup-heading">
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <h2
            id="current-setup-heading"
            style={{
              fontFamily: INTER_STACK,
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--ink)',
              margin: 0,
            }}
          >
            Your current setup
          </h2>
          {currentAnswers && (
            <a
              href="#edit"
              style={{
                fontFamily: INTER_STACK,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ink)',
                textDecoration: 'none',
              }}
            >
              Edit below ↓
            </a>
          )}
        </div>

        {!currentAnswers ? (
          <p
            style={{
              fontFamily: INTER_STACK,
              fontSize: 16,
              lineHeight: 1.6,
              color: 'var(--slate-600)',
              margin: 0,
            }}
          >
            You have not completed onboarding yet. Answer the questions below
            to personalise the course.
          </p>
        ) : (
          <>
            <div style={{ ...summaryRowStyle, borderTop: 'none', paddingTop: 0 }}>
              <p style={summaryLabelStyle}>Primary role</p>
              <div>
                <p style={summaryValueStyle}>
                  {savedRole ? ROLE_LABEL[savedRole] : '—'}
                </p>
                <p style={summaryNoteStyle}>
                  Steers the role path, sandbox scenarios, and which skills
                  surface first.
                </p>
              </div>
            </div>

            <div style={summaryRowStyle}>
              <p style={summaryLabelStyle}>Microsoft 365</p>
              <div>
                <p style={summaryValueStyle}>
                  {savedM365 ? M365_LABEL[savedM365] : '—'}
                </p>
                <p style={summaryNoteStyle}>
                  Determines whether Module 7 examples lead with Copilot or a
                  standalone tool.
                </p>
              </div>
            </div>

            <div style={summaryRowStyle}>
              <p style={summaryLabelStyle}>AI subscriptions</p>
              <div>
                <p style={summaryValueStyle}>{describeSubscriptions(savedSubs)}</p>
                <p style={summaryNoteStyle}>
                  Sandbox prompts default to a tool you already have access to.
                </p>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Edit panel */}
      <section id="edit" style={editPanelStyle} aria-labelledby="edit-heading">
        <div>
          <p style={kickerStyle}>Edit</p>
          <h2
            id="edit-heading"
            style={{
              fontFamily: INTER_STACK,
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--ink)',
              margin: '8px 0 6px',
              lineHeight: 1.2,
            }}
          >
            Change any answer
          </h2>
          <p
            style={{
              fontFamily: INTER_STACK,
              fontSize: 16,
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
          style={{ display: 'flex', flexDirection: 'column', gap: 36 }}
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
                fontSize: 16,
                lineHeight: 1.6,
                fontWeight: 600,
                transition: 'opacity var(--t-med) var(--ease)',
              }}
            >
              Profile saved successfully.
            </div>
          )}

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
      </section>

      {/* Account footer — small, utility */}
      <section style={accountFooterStyle} aria-label="Account">
        <div>
          <p style={kickerStyle}>Account</p>
          <p
            style={{
              fontFamily: INTER_STACK,
              fontSize: 16,
              lineHeight: 1.6,
              color: 'var(--slate-600)',
              margin: '6px 0 0',
            }}
          >
            Manage your sign-in session or contact support if your enrolment
            email changes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a
            href="mailto:hello@aibankinginstitute.com"
            style={signOutLinkStyle}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Change email
          </a>
          <button
            type="button"
            onClick={() => signOutAction()}
            style={signOutLinkStyle}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Sign out
          </button>
        </div>
      </section>
    </div>
  );
}
