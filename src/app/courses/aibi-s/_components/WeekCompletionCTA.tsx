'use client';

// WeekCompletionCTA — shown after a learner marks a week complete in the AiBI-S course.
// W1-5: phase-specific encouragement messages.
// W6 (isLastWeek): prominent capstone submission CTA + JourneyBanner to AiBI-L.
// Cobalt accent throughout (Pillar B color discipline).
// A11Y-01: keyboard accessible links with visible focus rings.

import { JourneyBanner } from '@/components/JourneyBanner';

interface WeekCompletionCTAProps {
  readonly weekNumber: number;
  readonly isLastWeek: boolean;
}

function ArrowIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const ENCOURAGEMENT_BY_WEEK: Record<number, string> = {
  1: 'Foundation phase started. Your departmental AI workspace is configured and your work audit identified top automation candidates.',
  2: 'Foundation phase complete. You have a documented, governed AI workspace and a prioritized list of automation targets.',
  3: 'First Build phase started. Your first departmental automation is live and monitored.',
  4: 'First Build phase complete. Two automations deployed with measured time savings and documented governance.',
  5: 'Scale phase started. Your team is trained, governance is documented, and the automation playbook is ready for handoff.',
};

export function WeekCompletionCTA({ weekNumber, isLastWeek }: WeekCompletionCTAProps) {
  // W6 or final week — capstone submission CTA + JourneyBanner
  if (weekNumber === 6 || isLastWeek) {
    return (
      <>
        <div
          className="mt-8 p-6 bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] border-l-4 rounded-sm"
          style={{ borderLeftColor: 'var(--color-cobalt)' }}
          aria-label="Course complete -- next steps"
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cobalt)] mb-2">
            All weeks complete
          </p>
          <p className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-3">
            Ready for your capstone submission.
          </p>
          <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed mb-5">
            You have completed all six weeks of the AiBI-S course. Your final step is to submit
            a capstone process improvement package demonstrating the departmental AI transformation
            you have built, measured, and documented throughout this program.
          </p>
          <a
            href="/courses/aibi-s/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[color:var(--color-cobalt)] hover:opacity-90 text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2"
          >
            Begin Capstone Submission
            <ArrowIcon />
          </a>
          <p className="mt-3 font-mono text-[10px] text-[color:var(--color-slate)]">
            Full process improvement package required. Reviewed by instructor.
          </p>
        </div>

        {/* Cross-course journey banner -- continue to AiBI-L */}
        <div className="mt-6">
          <JourneyBanner from="aibi-s" />
        </div>
      </>
    );
  }

  // W1-5 — brief encouragement
  const message =
    ENCOURAGEMENT_BY_WEEK[weekNumber] ?? `Week ${weekNumber} complete. Keep going.`;

  return (
    <div
      className="mt-8 p-4 bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm"
      aria-label="Week complete"
    >
      <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed">{message}</p>
    </div>
  );
}
