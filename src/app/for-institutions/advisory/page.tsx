import Link from 'next/link';
import type { Metadata } from 'next';
import { advisoryTiers } from '@content/advisory/v1';

export const metadata: Metadata = {
  title: 'Advisory | For Institutions · The AI Banking Institute',
  description:
    'Optional coaching engagements that pair with certification. Three advisory shapes — Pilot, Program, and Leadership — designed to coach your team while they build AI capability themselves. The AI Banking Institute does not build AI for your institution.',
};

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ??
  'https://calendly.com/aibi/executive-briefing';

const notWhatWeDo: readonly string[] = [
  'We don’t build AI systems inside your institution.',
  'We don’t take over vendor selection for you.',
  'We don’t write your policies — though we’ll review them.',
  'We don’t replace internal capability. We build it.',
];

export default function AdvisoryPage() {
  return (
    <main>
      {/* Hero */}
      <section className="px-6 pt-14 pb-10 md:pt-20 md:pb-14">
        <div className="max-w-4xl mx-auto">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-4">
            <Link
              href="/for-institutions"
              className="hover:text-[color:var(--color-terra)] transition-colors"
            >
              For institutions
            </Link>
            <span className="mx-2" aria-hidden="true">·</span>
            Advisory
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight mb-6">
            Coaching for institutions in the program.
          </h1>
          <p className="text-lg text-[color:var(--color-ink)]/75 max-w-2xl leading-relaxed">
            Certification is the product. Advisory is a complement for
            institutions that want a coach embedded alongside the cohort.
            We don’t build AI for you — we coach your team while they build
            it themselves.
          </p>
        </div>
      </section>

      {/* Three advisory shapes */}
      <section
        aria-labelledby="advisory-tiers-heading"
        className="px-6 py-14 md:py-20 border-t border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 max-w-2xl">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
              Advisory shapes
            </p>
            <h2
              id="advisory-tiers-heading"
              className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight"
            >
              Three ways we coach alongside a cohort.
            </h2>
          </div>

          <div className="space-y-6">
            {advisoryTiers.map((tier) => (
              <article
                key={tier.id}
                className="rounded-[3px] border border-[color:var(--color-ink)]/10 overflow-hidden bg-[color:var(--color-linen)]"
              >
                <div className="flex">
                  <div
                    className="w-1.5 shrink-0"
                    style={{ backgroundColor: tier.accent }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 p-6 md:p-8">
                    <div className="flex items-center flex-wrap gap-3 mb-3">
                      <span
                        className="font-serif-sc text-[11px] uppercase tracking-[0.2em]"
                        style={{ color: tier.accent }}
                      >
                        {tier.scaleLabel}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight mb-2">
                      {tier.name}
                    </h3>
                    <p className="font-serif italic text-sm text-[color:var(--color-slate)] leading-relaxed mb-4">
                      {tier.tagline}
                    </p>
                    <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed mb-5 max-w-2xl">
                      {tier.summary}
                    </p>

                    <dl className="grid sm:grid-cols-3 gap-x-6 gap-y-3 mb-2">
                      <div>
                        <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/50 mb-1">
                          Best for
                        </dt>
                        <dd className="text-xs text-[color:var(--color-ink)]/75 leading-snug">
                          {tier.bestFor}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/50 mb-1">
                          Format
                        </dt>
                        <dd className="text-xs text-[color:var(--color-ink)]/75 leading-snug">
                          {tier.format}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/50 mb-1">
                          Duration
                        </dt>
                        <dd className="text-xs text-[color:var(--color-ink)]/75 leading-snug tabular-nums">
                          {tier.duration}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/50 mt-8">
            Pricing scoped per engagement during the Executive Briefing.
          </p>
        </div>
      </section>

      {/* What we don't do */}
      <section
        aria-labelledby="clarity-heading"
        className="px-6 py-14 md:py-20 border-t border-[color:var(--color-ink)]/10"
      >
        <div className="max-w-3xl mx-auto">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-3">
            Clarity
          </p>
          <h2
            id="clarity-heading"
            className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight mb-6"
          >
            What we don’t do.
          </h2>
          <ul className="space-y-3">
            {notWhatWeDo.map((line) => (
              <li
                key={line}
                className="text-base text-[color:var(--color-ink)]/80 leading-relaxed pl-5 relative"
              >
                <span
                  className="absolute left-0 top-[0.7rem] w-3 h-[1px] bg-[color:var(--color-terra)]"
                  aria-hidden="true"
                />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-14 md:py-20 border-t border-[color:var(--color-ink)]/10">
        <div className="max-w-3xl mx-auto bg-[color:var(--color-ink)] text-[color:var(--color-linen)] p-10 md:p-14 text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra-pale)] mb-3">
            Every advisory engagement starts here
          </p>
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Book a free Executive Briefing.
          </h2>
          <p className="text-[color:var(--color-linen)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
            We’ll map what you’re trying to accomplish to the right
            certification track and the right advisory shape — or tell you
            plainly that you don’t need advisory at all.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
          >
            Book an Executive Briefing
          </a>
        </div>
      </section>
    </main>
  );
}
