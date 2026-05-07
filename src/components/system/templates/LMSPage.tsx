/**
 * <LMSPage> — module/lesson interior of any program.
 *
 * 3-rail layout:
 *   - ProgressStrip dark course bar at the top
 *   - ModuleNavigator on the left
 *   - Lesson body in the middle (children)
 *   - LessonResources on the right
 *
 * The lesson body itself is content (children) rendered by the page; the
 * template provides the chrome and the rails.
 */

import type { ReactNode } from "react";
import { ProgressStrip, type ProgressStripProps } from "../lms/ProgressStrip";
import { ModuleNavigator, type ModuleNavigatorProps } from "../lms/ModuleNavigator";
import { LessonResources, type LessonResourcesProps } from "../lms/LessonResources";
import { cn } from "@/lib/utils/cn";

export interface LMSPageProps {
  readonly progress: ProgressStripProps;
  readonly modules: ModuleNavigatorProps["modules"];
  readonly resources?: Omit<LessonResourcesProps, "className">;
  readonly children: ReactNode;
  readonly className?: string;
}

export function LMSPage({ progress, modules, resources, children, className }: LMSPageProps) {
  return (
    <main className={className}>
      <ProgressStrip {...progress} />
      <div className="grid lg:grid-cols-[280px_1fr_280px] min-h-[60vh] border-b border-hairline">
        <ModuleNavigator modules={modules} className="hidden lg:block" />
        <article className="bg-linen p-s9">{children}</article>
        {resources ? (
          <LessonResources {...resources} className="hidden lg:block" />
        ) : (
          <div className="hidden lg:block bg-linen border-l border-hairline" aria-hidden="true" />
        )}
      </div>
    </main>
  );
}

/**
 * <LMSPage.Lesson> — convenience subcomponent for lesson content.
 *
 * Provides breadcrumb, title, meta pills, and slot for lesson body. Use it
 * inside the LMSPage children for a consistent lesson layout.
 */
LMSPage.Lesson = function Lesson({
  breadcrumb,
  title,
  meta,
  children,
}: {
  readonly breadcrumb: ReactNode;
  readonly title: string;
  readonly meta?: readonly string[];
  readonly children: ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-mono-sm tabular-nums text-slate mb-s4">{breadcrumb}</p>
      <h1 className="font-serif text-display-md text-ink leading-tight tracking-tightish">
        {title}
      </h1>
      {meta && meta.length > 0 && (
        <div className="mt-s4 flex flex-wrap gap-s2">
          {meta.map((m) => (
            <span
              key={m}
              className={cn(
                "border border-hairline px-s3 py-[2px] font-mono text-label-md text-slate"
              )}
            >
              {m}
            </span>
          ))}
        </div>
      )}
      <div className="mt-s8 prose prose-aibi max-w-none">{children}</div>
    </div>
  );
};
