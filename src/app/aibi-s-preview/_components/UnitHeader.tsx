// UnitHeader — compact sticky cobalt header band
// Server Component: mirrors ModuleHeader exactly — cobalt substituted for pillar color

const PHASE_ROMAN = ['I', 'II', 'III'] as const;

export interface UnitHeaderProps {
  readonly unitId: string;
  readonly trackCode: string;
  readonly phase: 1 | 2 | 3;
  readonly phaseName: string;
  readonly title: string;
  readonly estimatedMinutes: number;
  readonly keyOutput: string;
}

export function UnitHeader({
  unitId,
  trackCode,
  phase,
  phaseName,
  title,
  estimatedMinutes,
  keyOutput,
}: UnitHeaderProps) {
  const trackLabel = `/${trackCode.charAt(0).toUpperCase() + trackCode.slice(1)} Track`;
  const phaseLabel = `Phase ${PHASE_ROMAN[phase - 1]} — ${phaseName}`;

  return (
    <header
      className="sticky top-[70px] z-40 w-full px-8 py-4"
      style={{ backgroundColor: 'var(--color-cobalt)' }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">
            Unit {unitId} · {trackLabel} · {phaseLabel}
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
        </div>
      </div>
    </header>
  );
}
