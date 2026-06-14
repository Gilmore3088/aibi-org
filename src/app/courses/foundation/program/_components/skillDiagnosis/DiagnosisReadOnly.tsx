'use client';

// Read-only review of a submitted Skill Diagnosis. Renders the selected
// missing component and the learner's improved prompt in two cream
// info-cards. Manages its own focus when the parent indicates this is
// the immediate post-submit render (A11Y-01).

import { useEffect, useRef } from 'react';

interface DiagnosisReadOnlyProps {
  readonly missingComponentLabel: string;
  readonly selectedOption: string;
  readonly improvedSkillLabel: string;
  readonly improvedSkill: string;
  /**
   * When true (just submitted), the read-only region grabs focus on mount
   * so screen readers announce the success state. When the read-only view
   * renders because an existing response was hydrated, focus stays where
   * the learner placed it.
   */
  readonly autoFocus: boolean;
}

export function DiagnosisReadOnly({
  missingComponentLabel,
  selectedOption,
  improvedSkillLabel,
  improvedSkill,
  autoFocus,
}: DiagnosisReadOnlyProps) {
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && successRef.current) {
      successRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div
      ref={successRef}
      tabIndex={-1}
      aria-live="polite"
      aria-label="Skill Diagnosis submitted successfully"
      className="space-y-4"
    >
      <div>
        <p className="font-sans text-base font-semibold text-[color:var(--ink)] mb-1">
          {missingComponentLabel}
        </p>
        <div className="w-full rounded-xl border border-[color:var(--ink-a10)] bg-[color:var(--cream-2)] px-3 py-2 font-sans text-base text-[color:var(--ink)]">
          {selectedOption || (
            <span className="text-[color:var(--slate-500)]">No response</span>
          )}
        </div>
      </div>
      <div>
        <p className="font-sans text-base font-semibold text-[color:var(--ink)] mb-1">
          {improvedSkillLabel}
        </p>
        <div className="w-full rounded-xl border border-[color:var(--ink-a10)] bg-[color:var(--cream-2)] px-3 py-2 font-sans text-base text-[color:var(--ink)] min-h-[80px] whitespace-pre-wrap">
          {improvedSkill || (
            <span className="text-[color:var(--slate-500)]">No response</span>
          )}
        </div>
      </div>
    </div>
  );
}
