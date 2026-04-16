import Link from 'next/link';

// Data from: Evident AI Index — Key Findings Report, October 2025
// Published by Evident Insights. Benchmarks 50 of the largest global banks
// on Talent (45%), Innovation (30%), Leadership (15%), Transparency (10%).

const GAP_STATS = [
  {
    figure: '2.3×',
    label: 'faster AI maturity growth at top-10 banks vs. the rest of the industry',
  },
  {
    figure: '+25%',
    label: 'year-over-year AI talent expansion at the top 50 global banks',
  },
  {
    figure: '+7.0',
    label: 'point gain for the top-10 YoY vs. only +1.3 for the bottom-10',
  },
  {
    figure: '2×',
    label: 'documented AI use cases at top-10 banks compared to the wider Index',
  },
] as const;

export function WideningGap() {
  return (
    <section className="px-6 py-20 md:py-28 border-y border-[color:var(--color-ink)]/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-5 gap-12 md:gap-16 items-start">
          <div className="md:col-span-2">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
              The widening gap
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
              The AI maturity gap is not closing. It is widening.
            </h2>
            <p className="text-lg text-[color:var(--color-ink)]/75 mt-6 leading-relaxed">
              JPMorganChase, Capital One, and the rest of the global top-10 are
              not just ahead. According to the October 2025 Evident AI Index,
              they are accelerating away from the rest of the industry 2.3
              times faster, year over year.
            </p>
            <p className="text-lg text-[color:var(--color-ink)]/75 mt-4 leading-relaxed">
              Community banks cannot hire their way to parity. The top 50 are
              absorbing the AI talent pipeline. What community institutions
              <em> can</em> do is move faster, stay closer to their members, and
              deploy AI where a $20B bank cannot &mdash; inside the Tuesday
              morning workflow of a five-person operations team.
            </p>
            <p className="text-lg text-[color:var(--color-ink)]/75 mt-4 leading-relaxed">
              AiBI is how that happens.
            </p>
            <Link
              href="/resources/the-widening-ai-gap"
              className="inline-block mt-8 font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] border-b border-[color:var(--color-terra)] pb-1 hover:text-[color:var(--color-terra-light)] hover:border-[color:var(--color-terra-light)] transition-colors"
            >
              Read the full analysis &rarr;
            </Link>
          </div>

          <dl className="md:col-span-3 grid sm:grid-cols-2 gap-6 md:gap-8">
            {GAP_STATS.map((stat) => (
              <div
                key={stat.label}
                className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-6"
              >
                <dt className="font-mono text-5xl md:text-6xl text-[color:var(--color-terra)] leading-none">
                  {stat.figure}
                </dt>
                <dd className="text-sm text-[color:var(--color-ink)]/75 mt-4 leading-relaxed">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="font-mono text-[10px] text-[color:var(--color-ink)]/40 mt-10 text-center">
          Source: Evident AI Index &mdash; Key Findings Report, October 2025 &middot;
          Evident Insights Ltd &middot; n=50 banks
        </p>
      </div>
    </section>
  );
}
