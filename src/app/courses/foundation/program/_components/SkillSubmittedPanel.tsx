'use client';

// SkillSubmittedPanel — success state for SkillBuilder after skill submission.
// Shows the ReadOnlyView of saved values plus a re-download button.

import type { RefObject } from 'react';
import { ReadOnlyView } from './SkillBuilderPanels';

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

interface SkillSubmittedPanelProps {
  readonly values: Record<string, string>;
  readonly successRef: RefObject<HTMLDivElement>;
  readonly onRedownload: () => void;
}

export function SkillSubmittedPanel({ values, successRef, onRedownload }: SkillSubmittedPanelProps) {
  return (
    <div ref={successRef} tabIndex={-1} className="focus:outline-none">
      <div className="mb-5 p-4 bg-[color:var(--color-sage)]/10 border border-[color:var(--color-sage)] rounded-sm flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-sage)] mb-1">
            Skill Saved
          </p>
          <p className="text-sm font-sans text-[color:var(--color-ink)] leading-relaxed">
            Your skill file has been saved and downloaded. Use the button below to re-download at any
            time.
          </p>
        </div>
        <button
          type="button"
          onClick={onRedownload}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono rounded-sm border border-[color:var(--color-sage)] text-[color:var(--color-sage)] hover:bg-[color:var(--color-sage)]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-1"
          aria-label="Re-download skill file"
        >
          <DownloadIcon />
          Re-download .md
        </button>
      </div>
      <ReadOnlyView values={values} />
    </div>
  );
}
