'use client';

// SkillSubmittedPanel — success state for SkillBuilder after skill submission.
// Shows the ReadOnlyView of saved values plus a re-download button.
// Mockup chrome: emerald success accent, cream-2 confirmation surface.

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
  readonly successRef: RefObject<HTMLDivElement | null>;
  readonly onRedownload: () => void;
}

export function SkillSubmittedPanel({ values, successRef, onRedownload }: SkillSubmittedPanelProps) {
  return (
    <div ref={successRef} tabIndex={-1} className="focus:outline-none">
      <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-[color:var(--emerald-700)] bg-white p-4">
        <div>
          <p className="font-sans text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--emerald-700)] mb-1">
            Skill Saved
          </p>
          <p className="font-sans text-base leading-relaxed text-[color:var(--ink)]">
            Your skill file has been saved and downloaded. Use the button below to re-download at any
            time.
          </p>
        </div>
        <button
          type="button"
          onClick={onRedownload}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--emerald-700)] px-3 py-1.5 font-sans text-[12px] font-bold uppercase tracking-[0.16em] text-[color:var(--emerald-700)] hover:bg-[color:var(--emerald-50)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--emerald-700)] focus:ring-offset-1"
          aria-label="Re-download skill file"
        >
          <DownloadIcon />
          RE-DOWNLOAD .MD
        </button>
      </div>
      <ReadOnlyView values={values} />
    </div>
  );
}
