// UnitHeader — full-width cobalt band at the top of each AiBI-S unit page
// Server Component: mirrors ModuleHeader's visual pattern with AiBI-S cobalt branding

const PHASE_NAMES = { 1: 'Foundation', 2: 'Application', 3: 'Strategy' } as const;

export interface UnitHeaderProps {
  readonly trackCode: string;
  readonly phase: 1 | 2 | 3;
  readonly phaseName: string;
  readonly unitId: string;
  readonly title: string;
  readonly summary: string;
  readonly pillarLetter: 'A' | 'B' | 'C';
  readonly frameworks: readonly string[];
  readonly dataTiers: readonly number[];
}

export function UnitHeader({
  trackCode,
  phase,
  phaseName,
  unitId,
  title,
  summary,
  pillarLetter,
  frameworks,
  dataTiers,
}: UnitHeaderProps) {
  const trackLabel = `AiBI-S / ${trackCode.charAt(0).toUpperCase() + trackCode.slice(1)} Track`;
  const phaseLabel = `Phase ${['I', 'II', 'III'][phase - 1]} — ${phaseName || PHASE_NAMES[phase]}`;

  return (
    <header className="w-full" style={{ backgroundColor: 'var(--color-cobalt)' }}>
      {/* Main band */}
      <div className="px-8 lg:px-16 py-6">
        {/* Eyebrow: unit / track / phase */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/60">
            Unit {unitId}
          </span>
          <span className="font-mono text-[11px] text-white/30" aria-hidden="true">·</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/60">
            {trackLabel}
          </span>
          <span className="font-mono text-[11px] text-white/30" aria-hidden="true">·</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/60">
            {phaseLabel}
          </span>
        </div>

        {/* Unit title */}
        <h1 className="font-serif italic text-3xl lg:text-4xl text-white leading-tight mb-3">
          {title}
        </h1>

        {/* Summary */}
        <p className="font-sans text-sm text-white/75 leading-relaxed max-w-2xl mb-4">
          {summary}
        </p>

        {/* Meta pills row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pillar pill */}
          <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-white/80 border border-white/20 rounded-sm">
            Pillar {pillarLetter}
          </span>

          {/* Framework pills */}
          {frameworks.map((fw) => (
            <span
              key={fw}
              className="inline-flex items-center px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-white/60 border border-white/10 rounded-sm"
            >
              {fw}
            </span>
          ))}

          {/* Data tier pills */}
          {dataTiers.map((tier) => (
            <span
              key={tier}
              className="inline-flex items-center px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-white/60 border border-white/10 rounded-sm"
            >
              Tier {tier}
            </span>
          ))}
        </div>
      </div>

      {/* Subtle bottom divider */}
      <div className="h-px bg-white/10" />
    </header>
  );
}
