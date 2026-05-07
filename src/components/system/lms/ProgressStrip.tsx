/**
 * <ProgressStrip> — dark course-bar at the top of LMS surfaces.
 *
 * Three slots: course title (left), progress percentage with mono fill bar
 * (center), resume link (right). Sits directly under the SiteNav.
 *
 * Variants for non-LMS contexts (DiagnosticPage uses a parch variant via
 * the DiagnosticProgressStrip equivalent — kept separate by intent).
 */

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export interface ProgressStripProps {
  readonly courseTitle: string;
  readonly designation?: string;
  readonly completed: number;
  readonly total: number;
  readonly resumeHref?: string;
  readonly resumeLabel?: string;
  readonly className?: string;
}

export function ProgressStrip({
  courseTitle,
  designation,
  completed,
  total,
  resumeHref,
  resumeLabel = "Resume where you left off",
  className,
}: ProgressStripProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={cn("bg-ink text-bone px-s7 py-s4 border-b border-strong", className)}>
      <div className="max-w-wide mx-auto grid gap-s4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div>
          <p className="font-serif text-body-md md:text-body-lg text-bone">{courseTitle}</p>
          {designation && (
            <p className="font-mono text-label-md uppercase tracking-widest text-cream/80 mt-s1">
              {designation}
            </p>
          )}
        </div>
        <div className="text-center">
          <p
            className="font-mono text-mono-sm tabular-nums text-bone"
            aria-live="polite"
          >
            {pct}% complete · {completed} of {total} modules
          </p>
          <div
            className="w-full md:w-[280px] mx-auto mt-s2 h-[3px] bg-cream/20"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={completed}
            aria-label={`Course progress: ${pct}%`}
          >
            <span
              className="block h-full bg-terra transition-[width] duration-slow"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        {resumeHref && (
          <div className="md:text-right">
            <Link
              href={resumeHref}
              className="font-sans text-body-sm text-amber-light border-b border-amber-light pb-[1px] hover:text-bone hover:border-bone transition-colors duration-fast"
            >
              {resumeLabel} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
