import { serviceTiers } from '@content/services/v1';

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ??
  'https://calendly.com/aibi/executive-briefing';

interface ServiceTierCardsProps {
  readonly showHeader?: boolean;
}

export function ServiceTierCards({ showHeader = false }: ServiceTierCardsProps) {
  return (
    <section className="px-6 py-14 md:py-20 bg-[color:var(--color-parch)]">
      <div className="max-w-5xl mx-auto">
        {showHeader && (
          <div className="mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
              Consulting
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight max-w-2xl">
              We meet you where you are.
            </h2>
            <p className="text-base text-[color:var(--color-ink)]/75 mt-4 max-w-xl leading-relaxed">
              Every engagement starts with a free Executive Briefing.
              What comes next depends on what you need.
            </p>
          </div>
        )}

        {/* Stacked timeline layout — not a 3-card grid */}
        <div className="space-y-0">
          {serviceTiers.map((tier, idx) => (
            <div
              key={tier.id}
              className="flex gap-6 md:gap-8"
            >
              {/* Timeline track */}
              <div className="flex flex-col items-center shrink-0 w-8">
                <div
                  className="w-3 h-3 rounded-full border-2 shrink-0"
                  style={{ borderColor: tier.accent, backgroundColor: idx === 0 ? tier.accent : 'transparent' }}
                />
                {idx < serviceTiers.length - 1 && (
                  <div className="w-px flex-1 bg-[color:var(--color-ink)]/10" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-12">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
                  <h3
                    className="font-serif text-xl md:text-2xl text-[color:var(--color-ink)] leading-tight"
                  >
                    {tier.name}
                  </h3>
                  <span className="font-mono text-xs tabular-nums text-[color:var(--color-slate)]">
                    {tier.priceRange}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-slate)]">
                    {tier.duration}
                  </span>
                </div>

                <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed mb-4 max-w-xl">
                  {tier.summary}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {tier.included.slice(0, 4).map((item) => (
                    <span
                      key={item}
                      className="font-mono text-[9px] uppercase tracking-wider px-2 py-1 rounded-[2px] border border-[color:var(--color-ink)]/10 text-[color:var(--color-ink)]/70"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-serif-sc text-[11px] uppercase tracking-[0.18em] border-b pb-0.5 hover:opacity-70 transition-opacity"
                  style={{ color: tier.accent, borderColor: tier.accent }}
                >
                  Learn more
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
