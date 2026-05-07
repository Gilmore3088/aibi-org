/**
 * <ModuleNavigator> — left rail of the LMS view.
 *
 * Lists all modules with their state: complete (checkmark, sage), current
 * (terra arrow + expanded sub-lessons), upcoming (faint dot), locked (lock
 * glyph, opacity 55).
 *
 * Click on accessible modules navigates; locked rows are non-interactive.
 */

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export type ModuleState = "complete" | "current" | "upcoming" | "locked";

export interface ModuleEntry {
  readonly number: number;
  readonly title: string;
  readonly href?: string;
  readonly state: ModuleState;
  readonly minutesLabel?: string;
  /** Optional sub-lessons rendered when state === "current". */
  readonly lessons?: readonly LessonEntry[];
}

export interface LessonEntry {
  readonly id: string;
  readonly title: string;
  readonly state: "complete" | "current" | "upcoming";
  readonly href?: string;
}

export interface ModuleNavigatorProps {
  readonly modules: readonly ModuleEntry[];
  readonly className?: string;
}

const STATE_TEXT: Record<ModuleState, string> = {
  complete: "✓ done",
  current: "in progress",
  upcoming: "",
  locked: "locked",
};

export function ModuleNavigator({ modules, className }: ModuleNavigatorProps) {
  return (
    <aside
      className={cn("bg-parch border-r border-hairline py-s5", className)}
      aria-label="Course modules"
    >
      <p className="px-s6 pb-s3 font-mono text-label-sm uppercase tracking-widest text-slate border-b border-hairline">
        Curriculum · {modules.length} modules
      </p>
      <ol>
        {modules.map((mod) => (
          <li
            key={mod.number}
            className={cn(
              "border-b border-hairline",
              mod.state === "current" && "bg-linen border-l-2 border-l-terra"
            )}
          >
            <ModuleHead module={mod} />
            {mod.state === "current" && mod.lessons && mod.lessons.length > 0 && (
              <ul className="px-s6 pb-s4 pl-s12">
                {mod.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className={cn(
                      "py-s2 grid grid-cols-[16px_1fr] gap-s2 text-body-sm",
                      lesson.state === "current" && "text-ink font-medium"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "font-mono text-label-sm",
                        lesson.state === "complete"
                          ? "text-success"
                          : lesson.state === "current"
                            ? "text-terra"
                            : "text-dust"
                      )}
                    >
                      {lesson.state === "complete" ? "✓" : lesson.state === "current" ? "→" : "·"}
                    </span>
                    {lesson.href && lesson.state !== "current" ? (
                      <Link href={lesson.href} className="hover:text-terra">
                        {lesson.title}
                      </Link>
                    ) : (
                      <span>{lesson.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </aside>
  );
}

function ModuleHead({ module: mod }: { readonly module: ModuleEntry }) {
  const inner = (
    <div
      className={cn(
        "px-s6 py-s3 grid grid-cols-[24px_1fr_auto] gap-s3 items-center text-body-sm",
        mod.state === "locked" && "opacity-55 cursor-not-allowed",
        mod.state !== "locked" && mod.state !== "current" && "hover:bg-parch-dark"
      )}
    >
      <span className="font-mono text-mono-sm tabular-nums text-terra">
        {String(mod.number).padStart(2, "0")}
      </span>
      <span className="font-serif text-body-md leading-snug">
        {mod.title}
        {mod.state === "locked" && (
          <span aria-hidden="true" className="ml-s1 text-label-sm opacity-60">
            🔒
          </span>
        )}
      </span>
      <span
        className={cn(
          "font-mono text-label-sm tabular-nums",
          mod.state === "complete" ? "text-success" : "text-slate"
        )}
      >
        {STATE_TEXT[mod.state] || mod.minutesLabel || ""}
      </span>
    </div>
  );

  if (mod.href && mod.state !== "locked") {
    return (
      <Link href={mod.href} className="block">
        {inner}
      </Link>
    );
  }
  return <div>{inner}</div>;
}
