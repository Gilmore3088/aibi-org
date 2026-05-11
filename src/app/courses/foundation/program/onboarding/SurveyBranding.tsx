'use client';

// SurveyBranding — Left column of the OnboardingSurvey two-column layout.
// Displays the credential callout, step counter, and progress bar.

const TOTAL_STEPS = 3;

const STEP_LABELS = [
  'Infrastructure Assessment',
  'Personal Capability',
  'Persona Mapping',
] as const;

interface SurveyBrandingProps {
  readonly step: number;
}

export function SurveyBranding({ step }: SurveyBrandingProps) {
  const progressPercent = Math.round(((step - 1) / TOTAL_STEPS) * 100);
  const stepLabel = STEP_LABELS[step - 1];

  return (
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
          To personalize your journey through the AiBI-Foundation curriculum, we
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
          <div
            className="flex-1 h-px relative overflow-hidden"
            style={{ backgroundColor: 'rgba(181,81,46,0.15)' }}
          >
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
          &ldquo;The AiBI-Foundation certification bridges the gap
          between institutional legacy and generative futures.&rdquo;
        </p>
      </div>
    </div>
  );
}
