'use client';

// ModuleNavigation — bottom-of-module nav. Mockup chrome: gold primary CTA on
// ink fill, slate text links, lock state uses cream-2 + slate. moduleComplete
// gates the Next Module link.

import Link from 'next/link';

export interface ModuleNavigationProps {
  readonly moduleNumber: number;
  readonly isLastModule: boolean;
  readonly moduleComplete: boolean;
}

const linkStyle: React.CSSProperties = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  transition: 'color var(--t-fast) var(--ease)',
};

const ctaBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 22px',
  borderRadius: 12,
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  transition: 'background var(--t-fast) var(--ease), color var(--t-fast) var(--ease)',
};

function ArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="12"
      height="12"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function ModuleNavigation({
  moduleNumber,
  isLastModule,
  moduleComplete,
}: ModuleNavigationProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginTop: 64,
        paddingTop: 32,
        borderTop: '1px solid var(--ink-a10)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
        <Link
          href="/courses/foundation/program"
          style={{ ...linkStyle, color: 'var(--slate-500)' }}
        >
          Back to overview
        </Link>
        <Link
          href="/dashboard/toolbox?tab=library"
          style={{ ...linkStyle, color: 'var(--gold-deep)' }}
        >
          Open Toolbox
        </Link>
      </div>

      {!isLastModule && (
        moduleComplete ? (
          <Link
            href={`/courses/foundation/program/${moduleNumber + 1}`}
            style={{
              ...ctaBase,
              background: 'var(--gold)',
              color: 'var(--ink)',
            }}
          >
            Next module
            <ArrowIcon />
          </Link>
        ) : (
          <span
            role="button"
            aria-disabled="true"
            aria-label="Complete all activities to open the next module"
            title="Complete all activities to open the next module"
            style={{
              ...ctaBase,
              background: 'var(--cream-2)',
              color: 'var(--slate-500)',
              cursor: 'not-allowed',
            }}
          >
            Next module
            <LockIcon />
          </span>
        )
      )}

      {isLastModule && (
        <span
          style={{
            ...linkStyle,
            color: 'var(--slate-500)',
          }}
        >
          Course complete
        </span>
      )}
    </div>
  );
}
