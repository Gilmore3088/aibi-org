'use client';

// SurveyBranding — Left column of the OnboardingSurvey two-column layout.
// Displays the credential callout, step counter, and progress bar.
//
// 2026-05-27: ported to mockup design system (Inter, ink/cream/gold).

const TOTAL_STEPS = 3;

const STEP_LABELS = [
  'Infrastructure',
  'Personal capability',
  'Persona mapping',
] as const;

const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

interface SurveyBrandingProps {
  readonly step: number;
}

export function SurveyBranding({ step }: SurveyBrandingProps) {
  const progressPercent = Math.round(((step - 1) / TOTAL_STEPS) * 100);
  const stepLabel = STEP_LABELS[step - 1];

  return (
    <div className="lg:col-span-5 flex flex-col" style={{ gap: 40 }}>
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
          Onboarding · Record 1.4
        </span>
        <h1
          style={{
            fontFamily: INTER_STACK,
            fontSize: 44,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          A short read of your context
        </h1>
        <p
          style={{
            marginTop: 18,
            fontFamily: INTER_STACK,
            fontSize: 16,
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'var(--slate-600)',
            maxWidth: 420,
          }}
        >
          Three questions so we can tune the AiBI-Foundation curriculum to your
          institution and your role. About a minute.
        </p>
      </div>

      {/* Step progress indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: INTER_STACK,
              fontSize: 13,
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              border: '1px solid var(--gold)',
              color: 'var(--gold-deep)',
              background: 'var(--cream)',
              flexShrink: 0,
            }}
          >
            {String(step).padStart(2, '0')}
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
          <div
            style={{
              fontFamily: INTER_STACK,
              fontSize: 13,
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--slate-400)',
              flexShrink: 0,
            }}
          >
            {String(TOTAL_STEPS).padStart(2, '0')}
          </div>
        </div>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--slate-500)',
            margin: 0,
          }}
        >
          Current phase: {stepLabel}
        </p>
      </div>

      {/* Credential callout */}
      <div
        style={{
          padding: 28,
          borderRadius: 16,
          background: 'var(--cream-2)',
          border: '1px solid var(--ink-a10)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--gold-deep)',
            margin: 0,
            marginBottom: 10,
          }}
        >
          What you&rsquo;re entering
        </p>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 16,
            fontWeight: 500,
            lineHeight: 1.55,
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          The AiBI-Foundation course meets community bankers where they work —
          inside the policies, tools, and risk posture you already live with.
        </p>
      </div>
    </div>
  );
}
