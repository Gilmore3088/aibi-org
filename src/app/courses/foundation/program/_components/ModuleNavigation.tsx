'use client';

// ModuleNavigation — bottom-of-module nav. Mockup chrome: gold primary CTA on
// ink fill, slate text links, lock state uses cream-2 + slate. moduleComplete
// gates the Next Module link.

import Link from 'next/link';
import {
  getArtifactFirst,
  modules,
} from '@content/courses/foundation-program';

export interface ModuleNavigationProps {
  readonly moduleNumber: number;
  readonly isLastModule: boolean;
  readonly moduleComplete: boolean;
}

const linkStyle: React.CSSProperties = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  transition: 'color var(--t-fast) var(--ease)',
};

const learningCtaBase: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: 16,
  minWidth: 'min(100%, 360px)',
  maxWidth: 520,
  padding: '14px 18px',
  borderRadius: 16,
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  textDecoration: 'none',
};

const learningCtaMeta: React.CSSProperties = {
  margin: 0,
  fontSize: 10,
  fontWeight: 850,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
};

const learningCtaTitle: React.CSSProperties = {
  display: 'block',
  marginTop: 4,
  fontSize: 16,
  fontWeight: 850,
  letterSpacing: '-0.01em',
  lineHeight: 1.2,
};

const learningCtaSub: React.CSSProperties = {
  display: 'block',
  marginTop: 4,
  fontSize: 12,
  fontWeight: 650,
  lineHeight: 1.35,
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
  const nextModule = modules.find((mod) => mod.number === moduleNumber + 1);
  const currentArtifact = getArtifactFirst(moduleNumber);
  const nextModuleLabel = nextModule
    ? `Module ${String(nextModule.number).padStart(2, '0')} · ${nextModule.title}`
    : 'Next module';
  const replayLabel = currentArtifact
    ? `Recall ${currentArtifact.saved} before the next lab.`
    : 'Recall the rule before the next lab.';

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
              ...learningCtaBase,
              background: 'var(--gold)',
              color: 'var(--ink)',
              boxShadow: 'var(--shadow-soft)',
            }}
            aria-label={`Continue to ${nextModuleLabel}`}
          >
            <span>
              <span style={{ ...learningCtaMeta, color: 'rgba(7,26,47,0.72)' }}>
                Replay, then continue
              </span>
              <span style={learningCtaTitle}>{nextModuleLabel}</span>
              <span style={{ ...learningCtaSub, color: 'rgba(7,26,47,0.76)' }}>
                {replayLabel}
              </span>
            </span>
            <ArrowIcon />
          </Link>
        ) : (
          <span
            role="button"
            aria-disabled="true"
            aria-label="Add the module review note and transfer plan to unlock the next module"
            title="Add the module review note and transfer plan to unlock the next module"
            style={{
              ...learningCtaBase,
              background: 'var(--cream-2)',
              color: 'var(--slate-500)',
              border: '1px solid var(--ink-a10)',
              cursor: 'not-allowed',
            }}
          >
            <span>
              <span style={{ ...learningCtaMeta, color: 'var(--slate-500)' }}>
                Finish this module
              </span>
              <span style={{ ...learningCtaTitle, color: 'var(--ink)' }}>
                Add review + transfer
              </span>
              <span style={{ ...learningCtaSub, color: 'var(--slate-500)' }}>
                Save the judgment note and first real use before moving on.
              </span>
            </span>
            <LockIcon />
          </span>
        )
      )}

      {isLastModule && (
        <Link
          href="/courses/foundation/program/toolkit"
          style={{
            ...learningCtaBase,
            background: 'var(--ink)',
            color: '#fff',
            boxShadow: 'var(--shadow-soft)',
          }}
          aria-label="Open My Foundation Packet"
        >
          <span>
            <span style={{ ...learningCtaMeta, color: 'var(--gold)' }}>
              Course complete
            </span>
            <span style={learningCtaTitle}>Open My Foundation Packet</span>
            <span style={{ ...learningCtaSub, color: 'rgba(255,255,255,0.72)' }}>
              Review the artifacts before submission or sharing.
            </span>
          </span>
          <ArrowIcon />
        </Link>
      )}
    </div>
  );
}
