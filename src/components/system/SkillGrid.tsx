/**
 * <SkillGrid> — verb-stated skills as a chip grid.
 *
 * Replaces the paragraph-with-note list of skills. Each chip is a single
 * verb phrase in serif on parch with a mono module backreference below.
 * Reads as a "skills you'll leave with" plate at a glance.
 */

import { SKILLS, type CurriculumSkill } from "@content/curriculum/skills";
import { cn } from "@/lib/utils/cn";

export interface SkillGridProps {
  readonly skills?: readonly CurriculumSkill[];
  readonly className?: string;
}

export function SkillGrid({ skills = SKILLS, className }: SkillGridProps) {
  return (
    <div
      className={cn(
        "grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border border-strong",
        className
      )}
      role="list"
      aria-label="Skills practitioners leave with"
    >
      {skills.map((skill, idx) => (
        <article
          key={skill.slug}
          role="listitem"
          className="bg-parch px-s5 py-s5 grid grid-rows-[auto_1fr_auto] gap-s2"
        >
          <p className="font-mono text-mono-sm tabular-nums text-terra">
            {String(idx + 1).padStart(2, "0")}
          </p>
          <p className="font-serif text-body-lg md:text-display-xs leading-snug text-ink">
            {skill.verb}
          </p>
          <p className="font-mono text-label-sm uppercase tracking-widest text-dust pt-s3 border-t border-hairline">
            Modules{" "}
            {skill.modules.map((m) => String(m).padStart(2, "0")).join(" · ")}
          </p>
        </article>
      ))}
    </div>
  );
}
