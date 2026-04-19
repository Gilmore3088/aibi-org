// CourseItemHeader — pillar/section-colored sticky band atop item pages
// Server Component: no interactivity needed

import type { ResolvedCourseItem, ResolvedCourseSection, CourseConfig } from './types';

interface CourseItemHeaderProps {
  readonly item: ResolvedCourseItem;
  readonly section: ResolvedCourseSection;
  readonly config: CourseConfig;
  readonly estimatedMinutes?: number;
  readonly keyOutput?: string;
}

function formatItemNumber(number: string | number): string {
  if (typeof number === 'number') return String(number).padStart(2, '0');
  return number;
}

export function CourseItemHeader({
  item,
  section,
  config,
  estimatedMinutes,
  keyOutput,
}: CourseItemHeaderProps) {
  const colorVar = section.colorVar ?? config.brand.accentColorVar;
  const formattedNumber = formatItemNumber(item.number);
  const itemLabel = config.terminology.itemLabel.toUpperCase();

  return (
    <header
      className="sticky top-[70px] z-40 w-full px-8 py-4"
      style={{ backgroundColor: colorVar }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">
            {itemLabel} {formattedNumber}
          </span>
          <h1 className="font-serif italic text-2xl lg:text-3xl text-white leading-tight">
            {item.title}
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {estimatedMinutes !== undefined && (
            <span className="font-mono text-[10px] tracking-widest text-white/60 uppercase">
              {estimatedMinutes} min
            </span>
          )}
          {keyOutput !== undefined && (
            <span className="font-mono text-[10px] tracking-widest text-white/60 uppercase">
              {keyOutput}
            </span>
          )}
          <span className="font-mono text-[10px] tracking-widest text-white/60 uppercase">
            {section.label}
          </span>
        </div>
      </div>
    </header>
  );
}
