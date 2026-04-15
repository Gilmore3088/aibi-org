import { serviceTiers } from '@content/services/v1';

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ??
  'https://calendly.com/aibi/executive-briefing';

interface ServiceTierCardsProps {
  readonly showHeader?: boolean;
}

export function ServiceTierCards({ showHeader = false }: ServiceTierCardsProps) {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        {showHeader && (
          <div className="text-center mb-16">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
              Engagement tiers
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] max-w-2xl mx-auto leading-tight">
              Three ways we work with community banks.
            </h2>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {serviceTiers.map((tier) => (
            <article
              key={tier.id}
              className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 p-8 flex flex-col"
            >
              <p
                className="font-mono text-[10px] uppercase tracking-[0.2em] mb-4"
                style={{ color: tier.accent }}
              >
                {tier.phaseLabel}
              </p>
              <h3 className="font-serif text-2xl md:text-[1.65rem] text-[color:var(--color-ink)] leading-tight mb-4">
                {tier.name}
              </h3>
              <div className="space-y-1 mb-5 font-mono text-xs text-[color:var(--color-ink)]/60">
                <p>{tier.priceRange}</p>
                <p>{tier.duration}</p>
              </div>
              <p className="text-[color:var(--color-ink)]/75 leading-relaxed mb-6 flex-1 text-sm">
                {tier.summary}
              </p>
              <ul className="space-y-2 mb-6">
                {tier.included.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-[color:var(--color-ink)]/80 leading-snug pl-4 relative"
                  >
                    <span
                      className="absolute left-0 top-2 w-2 h-[1px]"
                      style={{ background: tier.accent }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center px-6 py-3 border text-sm font-sans font-medium tracking-wide transition-colors"
                style={{
                  borderColor: tier.accent,
                  color: tier.accent,
                }}
              >
                Request Executive Briefing
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
