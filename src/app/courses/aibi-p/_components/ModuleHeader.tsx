// ModuleHeader — full-width pillar-colored header band
// Server Component: no interactivity needed

import { PILLAR_META } from '@content/courses/aibi-p';
import type { Pillar } from '@content/courses/aibi-p';

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
      className="w-full px-8 py-8 lg:py-10"
      style={{ backgroundColor: meta.colorVar }}
    >
      {/* Accent line */}
      <div
        className="w-8 h-px mb-4 bg-white/40"
        aria-hidden="true"
      />

      {/* Module number */}
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70 mb-3">
        Module {formattedNumber}
      </div>

      {/* Title */}
      <h1 className="font-serif italic text-3xl lg:text-4xl text-white leading-tight mb-4">
        {title}
      </h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="font-mono text-[11px] tracking-widest text-white/70 uppercase">
          <span className="text-white/50 mr-1">Time</span>
          {estimatedMinutes} min
        </div>
        <div className="font-mono text-[11px] tracking-widest text-white/70 uppercase">
          <span className="text-white/50 mr-1">Output</span>
          {keyOutput}
        </div>
        <div className="font-mono text-[11px] tracking-widest text-white/70 uppercase">
          <span className="text-white/50 mr-1">Pillar</span>
          {meta.label}
        </div>
      </div>
    </header>
  );
}
