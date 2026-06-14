'use client';

// StartingPointPreview — live "your personalized starting point" card
// that populates as the learner answers the 3-step survey. Replaces the
// static credential callout in SurveyBranding (audit §5).
//
// Reads the same form state that drives the survey form on the right. As
// each question is answered, one line fills in. The empty state names the
// slot the answer will fill, so the learner sees what they're producing.

import type { CSSProperties } from 'react';
import type { OnboardingAnswers, LearnerRole } from '@/types/course';

const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const ROLE_LABELS: Record<LearnerRole, string> = {
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

const M365_LABELS: Record<NonNullable<OnboardingAnswers['uses_m365']>, string> = {
  yes: 'Microsoft 365 is in play',
  no: 'No Microsoft 365 in your stack',
  not_sure: 'Microsoft 365 — to be confirmed',
};

const FIRST_PROMPT_BY_ROLE: Partial<Record<LearnerRole, string>> = {
  lending: 'Draft a credit-memo summary from raw notes',
  operations: 'Rewrite a rushed internal note as a clear bulletin',
  compliance: 'Summarize a policy change for branch staff',
  finance: 'Turn a quarterly variance into a board talking point',
  marketing: 'Tighten a deposit-promo email to under 120 words',
  it: 'Draft an outage update for the staff portal',
  retail: 'Reframe a product disclosure for new account openings',
  executive: 'Draft a one-page board update from meeting notes',
  other: 'Rewrite a rushed internal note as a clear bulletin',
};

interface StartingPointPreviewProps {
  readonly uses_m365: OnboardingAnswers['uses_m365'] | null;
  readonly personal_ai_subscriptions: string[];
  readonly exclusive_selection: 'free_tiers' | 'none' | null;
  readonly primary_role: LearnerRole | null;
}

const rowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '14px 1fr',
  gap: 12,
  alignItems: 'baseline',
  paddingBottom: 12,
  borderBottom: '1px solid var(--ink-a10)',
};

const labelStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  margin: 0,
};

const valueStyle = (filled: boolean): CSSProperties => ({
  fontFamily: INTER_STACK,
  fontSize: 16,
  fontWeight: filled ? 600 : 500,
  lineHeight: 1.6,
  color: filled ? 'var(--ink)' : 'var(--slate-400)',
  margin: '2px 0 0',
});

function Dot({ filled }: { filled: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 10,
        height: 10,
        marginTop: 6,
        borderRadius: 999,
        background: filled ? 'var(--gold)' : 'transparent',
        border: `1px solid ${filled ? 'var(--gold)' : 'var(--slate-400)'}`,
        display: 'inline-block',
      }}
    />
  );
}

export function StartingPointPreview({
  uses_m365,
  personal_ai_subscriptions,
  exclusive_selection,
  primary_role,
}: StartingPointPreviewProps) {
  const m365Filled = uses_m365 !== null;
  const subsFilled =
    personal_ai_subscriptions.length > 0 || exclusive_selection !== null;
  const roleFilled = primary_role !== null;

  const subsValue = (() => {
    if (personal_ai_subscriptions.length > 0) {
      return personal_ai_subscriptions.join(', ');
    }
    if (exclusive_selection === 'free_tiers') return 'Free tiers only';
    if (exclusive_selection === 'none') return 'No AI tools yet';
    return 'Your AI tools today';
  })();

  const m365Value = m365Filled
    ? M365_LABELS[uses_m365!]
    : 'Your institution’s software stack';

  const roleValue = roleFilled
    ? ROLE_LABELS[primary_role!]
    : 'Your primary role';

  const firstPromptCopy = roleFilled
    ? FIRST_PROMPT_BY_ROLE[primary_role!] ??
      'Rewrite a rushed internal note as a clear bulletin'
    : 'A first banker prompt tuned to your role';

  return (
    <aside
      aria-label="Your personalized starting point"
      style={{
        padding: 24,
        borderRadius: 16,
        background: 'var(--cream-2)',
        border: '1px solid var(--ink-a10)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <p
        style={{
          fontFamily: INTER_STACK,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--gold-deep)',
          margin: '0 0 16px',
        }}
      >
        Your personalized starting point
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={rowStyle}>
          <Dot filled={m365Filled} />
          <div>
            <p style={labelStyle}>Institution stack</p>
            <p style={valueStyle(m365Filled)}>{m365Value}</p>
          </div>
        </div>

        <div style={rowStyle}>
          <Dot filled={subsFilled} />
          <div>
            <p style={labelStyle}>AI tools today</p>
            <p style={valueStyle(subsFilled)}>{subsValue}</p>
          </div>
        </div>

        <div style={{ ...rowStyle, borderBottom: 'none', paddingBottom: 0 }}>
          <Dot filled={roleFilled} />
          <div>
            <p style={labelStyle}>Primary role</p>
            <p style={valueStyle(roleFilled)}>{roleValue}</p>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 22,
          padding: '14px 16px',
          borderRadius: 12,
          background: '#FFFFFF',
          border: `1px solid ${roleFilled ? 'var(--gold)' : 'var(--ink-a10)'}`,
        }}
      >
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--gold-deep)',
            margin: '0 0 6px',
          }}
        >
          First prompt you&rsquo;ll save
        </p>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 1.6,
            color: roleFilled ? 'var(--ink)' : 'var(--slate-500)',
            margin: 0,
          }}
        >
          {firstPromptCopy}
        </p>
      </div>
    </aside>
  );
}
