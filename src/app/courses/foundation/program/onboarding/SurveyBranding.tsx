'use client';

// SurveyBranding — Left column of the OnboardingSurvey two-column layout.
// Leads with the value of answering (three questions, two minutes, what it
// produces), keeps the step progress bar, and renders the live
// StartingPointPreview that populates as the learner answers.
//
// 2026-05-27 redesign (audit §5): the static credential callout was replaced
// by a live "Your personalized starting point" card. The lede was rewritten
// to lead with what answers produce, not what answers are about.

import type { OnboardingAnswers, LearnerRole } from '@/types/course';
import { StartingPointPreview } from './_local/StartingPointPreview';

const TOTAL_STEPS = 3;

const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

interface SurveyBrandingProps {
  readonly step: number;
  readonly uses_m365: OnboardingAnswers['uses_m365'] | null;
  readonly personal_ai_subscriptions: string[];
  readonly exclusive_selection: 'free_tiers' | 'none' | null;
  readonly primary_role: LearnerRole | null;
}

export function SurveyBranding({
  step,
  uses_m365,
  personal_ai_subscriptions,
  exclusive_selection,
  primary_role,
}: SurveyBrandingProps) {
  const progressPercent = Math.round(((step - 1) / TOTAL_STEPS) * 100);

  return (
    <div className="lg:col-span-5 flex flex-col" style={{ gap: 32 }}>
      <div>
        <span
          style={{
            display: 'block',
            fontFamily: INTER_STACK,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--gold-deep)',
            marginBottom: 16,
          }}
        >
          Three questions · Two minutes
        </span>
        <h1
          style={{
            fontFamily: INTER_STACK,
            fontSize: 40,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          Tune the course to your work.
        </h1>
        <p
          style={{
            marginTop: 16,
            fontFamily: INTER_STACK,
            fontSize: 16,
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'var(--slate-600)',
            maxWidth: 420,
          }}
        >
          We use your answers to surface the modules and prompts that fit your
          role. Your starting point fills in on the right as you go.
        </p>
      </div>

      {/* Step progress indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              fontFamily: INTER_STACK,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
              fontVariantNumeric: 'tabular-nums',
              flexShrink: 0,
            }}
          >
            Step {String(step).padStart(2, '0')} / {String(TOTAL_STEPS).padStart(2, '0')}
          </div>
          <div
            style={{
              flex: 1,
              height: 4,
              borderRadius: 999,
              background: 'var(--ink-a10)',
              overflow: 'hidden',
              position: 'relative',
            }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                width: `${progressPercent}%`,
                background: 'var(--gold)',
                transition: 'width var(--t-med) var(--ease)',
              }}
            />
          </div>
        </div>
      </div>

      <StartingPointPreview
        uses_m365={uses_m365}
        personal_ai_subscriptions={personal_ai_subscriptions}
        exclusive_selection={exclusive_selection}
        primary_role={primary_role}
      />
    </div>
  );
}
