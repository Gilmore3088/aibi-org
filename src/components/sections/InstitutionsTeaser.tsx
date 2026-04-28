import Link from 'next/link';
import { enrollmentTiers } from '@content/institutions/v1';

// Homepage teaser for /for-institutions. Compact three-column summary that
// points into the full page. Tiers come from the same content source as the
// full page so the homepage and destination page never drift.

export function InstitutionsTeaser() {
  return (
    <section
      aria-labelledby="institutions-teaser-heading"
      className="px-6 py-14 md:py-20 bg-[color:var(--color-parch)]"
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            For institutions
          </p>
          <h2
            id="institutions-teaser-heading"
            className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight"
          >
            Buying for your team?
          </h2>
          <p className="text-base text-[color:var(--color-ink)]/75 mt-4 max-w-xl leading-relaxed">
            Enroll one banker, a whole department, or build institution-wide
            capability. Advisory coaching available if you want a coach
            alongside the cohort — never to replace your team.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {enrollmentTiers.map((tier) => (
            <article
              key={tier.id}
              className="bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 flex flex-col"
            >
              <span
                className="font-serif-sc text-[11px] uppercase tracking-[0.2em] mb-3"
                style={{ color: tier.accent }}
              >
                {tier.scaleLabel}
              </span>
              <h3 className="font-serif text-xl text-[color:var(--color-ink)] leading-tight mb-3">
                {tier.name}
              </h3>
              <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
                {tier.tagline}
              </p>
            </article>
          ))}
        </div>

        <Link
          href="/for-institutions"
          className="inline-block font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] border-b border-[color:var(--color-terra)] pb-0.5 hover:opacity-70 transition-opacity"
        >
          See how it works
        </Link>
      </div>
    </section>
  );
}
