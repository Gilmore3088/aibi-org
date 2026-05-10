// ModuleHeader — compact sticky pillar-colored header band
// Server Component: no interactivity needed

import { PILLAR_META } from '@content/courses/foundation-program';
import type { Pillar } from '@content/courses/foundation-program';

interface ModuleHeaderProps {
  readonly moduleNumber: number;
  readonly title: string;
  readonly pillar: Pillar;
  readonly estimatedMinutes: number;
  readonly keyOutput: string;
}

export function ModuleHeader({
  moduleNumber,
  title,
  pillar,
  estimatedMinutes,
  keyOutput,
}: ModuleHeaderProps) {
  const meta = PILLAR_META[pillar];
  const formattedNumber = String(moduleNumber).padStart(2, '0');

  return (
    <header
      className="sticky top-[70px] z-40 w-full px-8 py-4"
      style={{ backgroundColor: meta.colorVar }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">
            Module {formattedNumber}
          </span>
          <h1 className="font-serif italic text-2xl lg:text-3xl text-white leading-tight">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <span className="font-mono text-[10px] tracking-widest text-white/60 uppercase">
            {estimatedMinutes} min
          </span>
          <span className="font-mono text-[10px] tracking-widest text-white/60 uppercase">
            {keyOutput}
          </span>
          <span className="font-mono text-[10px] tracking-widest text-white/60 uppercase">
            {meta.label}
          </span>
        </div>
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/65">
        SAFE: Strip sensitive data · Ask clearly · Fact-check outputs · Escalate risky decisions
      </p>
    </header>
  );
}
