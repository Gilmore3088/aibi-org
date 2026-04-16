interface Metric {
  readonly label: string;
  readonly sublabel: string;
  readonly description: string;
  readonly accent: string;
}

const METRICS: readonly Metric[] = [
  {
    label: 'Hours Saved / Month',
    sublabel: 'Labor recaptured',
    description:
      'Total staff hours reclaimed through AI automation across departments. Measured monthly, reported cumulatively.',
    accent: 'var(--color-sage)',
  },
  {
    label: 'NIE Reduced',
    sublabel: 'Dollar impact',
    description:
      'Non-interest expense reduction as a direct result of workflow automation. Mapped to specific processes.',
    accent: 'var(--color-terra)',
  },
  {
    label: 'Automations Deployed',
    sublabel: 'Live workflows',
    description:
      'AI-powered workflows actively replacing manual, repetitive tasks in daily operations.',
    accent: 'var(--color-cobalt)',
  },
  {
    label: 'Staff AI Adoption',
    sublabel: 'Capability building',
    description:
      'Percentage of staff who have completed AI proficiency training and are actively using AI tools weekly.',
    accent: 'var(--color-ink)',
  },
];

export function TransformationScoreboard() {
  return (
    <section className="px-6 py-14 md:py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            Transformation scoreboard
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
            We measure your transformation.<br />
            <span className="text-[color:var(--color-terra)]">Not our effort.</span>
          </h2>
          <p className="text-lg text-[color:var(--color-ink)]/75 mt-5 max-w-2xl mx-auto leading-relaxed">
            Every engagement produces a monthly scoreboard that tracks
            transformation progress, not activity logs. Your board sees
            outcomes. Your examiners see governance. Your staff see results.
          </p>
        </div>

        {/* Static dashboard mockup */}
        <div className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-8 md:p-10">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[color:var(--color-ink)]/10">
            <p className="font-mono text-sm text-[color:var(--color-ink)]/80">
              AI Transformation Dashboard
            </p>
            <p className="font-mono text-[10px] text-[color:var(--color-ink)]/45">
              Sample report &middot; illustrative only
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {METRICS.map((metric) => (
              <div key={metric.label} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: metric.accent }}
                  />
                  <span className="font-mono text-xs text-[color:var(--color-ink)]/60">
                    {metric.sublabel}
                  </span>
                </div>
                <h3 className="font-serif text-lg text-[color:var(--color-ink)] leading-tight">
                  {metric.label}
                </h3>
                <p className="text-xs text-[color:var(--color-ink)]/65 leading-relaxed">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-10 pt-4 border-t border-[color:var(--color-ink)]/10 text-[10px] font-mono text-[color:var(--color-ink)]/45">
            <span>Updated monthly with impact report delivery</span>
            <span className="text-[color:var(--color-terra)]">Tracking active</span>
          </div>
        </div>
      </div>
    </section>
  );
}
