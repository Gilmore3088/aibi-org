'use client';

// ModuleNavigation — client component managing next module gating.
// moduleComplete tracks whether save-progress has been called for this module.

import Link from 'next/link';

export interface ModuleNavigationProps {
  readonly moduleNumber: number;
  readonly isLastModule: boolean;
  readonly moduleComplete: boolean;
}

export function ModuleNavigation({
  moduleNumber,
  isLastModule,
  moduleComplete,
}: ModuleNavigationProps) {
  return (
    <div className="flex items-center justify-between mt-16 pt-8 border-t border-[color:var(--color-parch-dark)]">
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/courses/foundations"
          className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-slate)] hover:text-[color:var(--color-ink)] transition-colors"
        >
          Back to Overview
        </Link>
        <Link
          href="/dashboard/toolbox?tab=library"
          className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-terra)] hover:text-[color:var(--color-ink)] transition-colors"
        >
          Open Toolbox
        </Link>
      </div>

      {!isLastModule && (
        moduleComplete ? (
          <Link
            href={`/courses/foundations/${moduleNumber + 1}`}
            className="inline-flex items-center gap-2 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] px-6 py-2.5 rounded-sm font-mono text-[11px] uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
          >
            Next Module
            <svg
              className="w-3 h-3"
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
          </Link>
        ) : (
          <span
            className="inline-flex items-center gap-2 bg-[color:var(--color-parch-dark)] text-[color:var(--color-slate)] px-6 py-2.5 rounded-sm font-mono text-[11px] uppercase tracking-widest cursor-not-allowed"
            role="button"
            aria-disabled="true"
            aria-label="Complete all activities to unlock the next module"
            title="Complete all activities to unlock"
          >
            Next Module
            <svg
              className="w-3 h-3"
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
          </span>
        )
      )}

      {isLastModule && (
        <span className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-slate)]">
          Course Complete
        </span>
      )}
    </div>
  );
}
