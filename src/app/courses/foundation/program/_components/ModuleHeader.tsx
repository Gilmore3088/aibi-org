// ModuleHeader — compact sticky header band on the mockup ink surface.
// Server Component: no interactivity needed.
// Pillar color discipline retired — pillar label stays as content frame,
// surface is ink + gold accent for uniformity across modules.

import { PILLAR_META } from '@content/courses/foundation-program';
import type { Pillar } from '@content/courses/foundation-program';

interface ModuleHeaderProps {
  readonly moduleNumber: number;
  readonly title: string;
  readonly pillar: Pillar;
  readonly estimatedMinutes: number;
  readonly keyOutput: string;
}

export function ModuleHeader({
  moduleNumber,
  title,
  pillar,
  estimatedMinutes,
  keyOutput,
}: ModuleHeaderProps) {
  const meta = PILLAR_META[pillar];
  const formattedNumber = String(moduleNumber).padStart(2, '0');

  return (
    <header
      className="sticky top-[70px] z-40 w-full px-8 py-5"
      style={{
        background: 'var(--ink)',
        borderBottom: '1px solid var(--on-dark-10)',
      }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex items-baseline gap-3">
          <span
            style={{
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--gold-soft)',
            }}
          >
            Module {formattedNumber}
          </span>
          <h1
            style={{
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: 'clamp(20px, 2.4vw, 28px)',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: 'var(--cream)',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {[`${estimatedMinutes} min`, keyOutput, meta.label].map((label) => (
            <span
              key={label}
              style={{
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--on-dark-65)',
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      <p
        style={{
          marginTop: 10,
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--on-dark-65)',
        }}
      >
        SAFE: Strip sensitive data · Ask clearly · Fact-check outputs · Escalate risky decisions
      </p>
    </header>
  );
}
