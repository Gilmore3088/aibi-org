import Link from 'next/link';
import type { Metadata } from 'next';
import { enrollmentTiers } from '@content/institutions/v1';

export const metadata: Metadata = {
  title: 'For Institutions | The AI Banking Institute',
  description:
    'Certify your team in AI proficiency at the scale that fits — individual enrollment, team cohorts, or an institution-wide capability program. The AI Banking Institute builds the people who build AI inside community banks and credit unions.',
};

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ??
  'https://calendly.com/aibi/executive-briefing';

interface SampleResource {
  readonly title: string;
  readonly description: string;
  readonly cta: string;
  readonly href: string;
  readonly available: boolean;
  readonly external?: boolean;
}

const sampleLibrary: readonly SampleResource[] = [
  {
    title: 'Safe AI Use Guide',
    description:
      'Six chapters on acceptable use, vendor evaluation, SR 11-7 mapping, shadow-AI discovery, and examiner readiness. The governance brief we hand every cohort.',
    cta: 'Download the guide',
    href: '/security',
    available: true,
  },
  {
    title: 'AI Readiness Assessment',
    description:
      'Eight questions, three minutes. The same instrument we use to scope a team cohort. Take it yourself to see what we measure.',
    cta: 'Take the assessment',
    href: '/assessment',
    available: true,
  },
  {
    title: 'Sample exam question',
    description:
      'See a real Practitioner exam item with the scoring rubric. Judgment under constraint, not multiple choice.',
    cta: 'View sample question',
    href: '/education#certifications',
    available: true,
  },
  {
    title: 'Sample curriculum module',
    description:
      'A full Practitioner module — readings, exercises, assessment — shared openly so you can evaluate depth before committing a team.',
    cta: 'Coming soon',
    href: '#',
    available: false,
  },
  {
    title: 'Cohort kickoff agenda',
    description:
      'The first meeting: structure, artifacts, questions for the executive sponsor, and what the internal champion owns. Everything you need to run one yourself.',
    cta: 'Coming soon',
    href: '#',
    available: false,
  },
  {
    title: 'Efficiency ratio workbook',
    description:
      'Model your institution’s automation ceiling with your own FTE, cost, and hours estimates. Same math we walk through in an Executive Briefing.',
    cta: 'Coming soon',
    href: '#',
    available: false,
  },
];

export default function ForInstitutionsPage() {
  return (
    <main>
      {/* Hero */}
      <section className="px-6 pt-14 pb-10 md:pt-20 md:pb-14">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            For institutions
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            Turn your bankers into<br />
            <span className="text-[color:var(--color-terra)]">
              your builders.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[color:var(--color-ink)]/75 max-w-2xl mx-auto leading-relaxed">
            The AI Banking Institute is an education company. We don’t build AI
            for your institution — we build the people who will. Three ways to
            enroll, one free briefing to find the right fit.
          </p>
        </div>
      </section>

      {/* Enrollment tiers */}
      <section
        aria-labelledby="enrollment-heading"
        className="px-6 py-14 md:py-20 border-t border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 max-w-2xl">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
              Enrollment · Pick your scale
            </p>
            <h2
              id="enrollment-heading"
              className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight mb-3"
            >
              Start with one banker or every banker.
            </h2>
            <p className="text-base text-[color:var(--color-ink)]/75 leading-relaxed">
              Every tier uses the same curriculum. What changes is scale,
              pacing, and the amount of support wrapped around the cohort.
            </p>
          </div>

          <div className="space-y-6">
            {enrollmentTiers.map((tier) => {
              const ctaHref =
                tier.cta.href === 'calendly' ? CALENDLY_URL : tier.cta.href;
              const isExternal = ctaHref.startsWith('http');
              return (
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
                      <ul className="space-y-1.5 mb-6">
                        {tier.included.map((item) => (
                          <li
                            key={item}
                            className="text-sm text-[color:var(--color-ink)]/75 leading-snug pl-4 relative"
                          >
                            <span
                              className="absolute left-0 top-2 w-2 h-[1px]"
                              style={{ background: tier.accent }}
                              aria-hidden="true"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                      {isExternal ? (
                        <a
                          href={ctaHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block font-serif-sc text-[11px] uppercase tracking-[0.18em] border-b pb-0.5 hover:opacity-70 transition-opacity"
                          style={{ color: tier.accent, borderColor: tier.accent }}
                        >
                          {tier.cta.label}
                        </a>
                      ) : (
                        <Link
                          href={ctaHref}
                          className="inline-block font-serif-sc text-[11px] uppercase tracking-[0.18em] border-b pb-0.5 hover:opacity-70 transition-opacity"
                          style={{ color: tier.accent, borderColor: tier.accent }}
                        >
                          {tier.cta.label}
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Free self-serve sample library */}
      <section
        aria-labelledby="samples-heading"
        className="px-6 py-14 md:py-20 border-t border-[color:var(--color-ink)]/10"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 max-w-2xl">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-3">
              Samples · Free
            </p>
            <h2
              id="samples-heading"
              className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight mb-3"
            >
              See how we think before you spend a dollar.
            </h2>
            <p className="text-base text-[color:var(--color-slate)] leading-relaxed">
              We’d rather give you the method and earn the engagement than sell
              you a deck. Everything below is free.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleLibrary.map((resource) => {
              const card = (
                <article
                  className={`h-full bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 flex flex-col ${
                    resource.available
                      ? 'hover:border-[color:var(--color-terra)]/40 transition-colors'
                      : 'opacity-70'
                  }`}
                >
                  <h3 className="font-serif text-lg text-[color:var(--color-ink)] leading-tight mb-3">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed flex-1 mb-5">
                    {resource.description}
                  </p>
                  <span
                    className={`font-serif-sc text-[11px] uppercase tracking-[0.18em] border-b pb-0.5 self-start ${
                      resource.available
                        ? 'text-[color:var(--color-terra)] border-[color:var(--color-terra)]'
                        : 'text-[color:var(--color-ink)]/40 border-[color:var(--color-ink)]/20'
                    }`}
                  >
                    {resource.cta}
                  </span>
                </article>
              );

              return resource.available ? (
                <Link
                  key={resource.title}
                  href={resource.href}
                  className="block"
                >
                  {card}
                </Link>
              ) : (
                <div key={resource.title}>{card}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advisory — quiet secondary option */}
      <section
        aria-labelledby="advisory-heading"
        className="px-6 py-14 md:py-20 border-t border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]"
      >
        <div className="max-w-3xl mx-auto">
          <div className="rounded-[3px] border border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)] p-8 md:p-10">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-3">
              Advisory · Optional
            </p>
            <h2
              id="advisory-heading"
              className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight mb-4"
            >
              Want a coach alongside the cohort?
            </h2>
            <p className="text-base text-[color:var(--color-ink)]/75 leading-relaxed mb-6">
              Some institutions want hands-on coaching while their team is in
              the program. We offer three advisory engagements that pair with
              certification — never replace it. Your bankers are always the
              builders. We’re the coach.
            </p>
            <Link
              href="/for-institutions/advisory"
              className="inline-block font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] border-b border-[color:var(--color-terra)] pb-0.5 hover:opacity-70 transition-opacity"
            >
              See advisory options
            </Link>
          </div>
        </div>
      </section>

      {/* Closing Executive Briefing CTA */}
      <section id="inquiry" className="px-6 py-14 md:py-20">
        <div className="max-w-3xl mx-auto bg-[color:var(--color-ink)] text-[color:var(--color-linen)] p-10 md:p-14 text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra-pale)] mb-3">
            Not sure which fits?
          </p>
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Start with a free Executive Briefing.
          </h2>
          <p className="text-[color:var(--color-linen)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
            Thirty minutes. We’ll ask about your team, your timeline, and what
            you’re trying to build, then recommend the right starting point. No
            pitch, no obligation.
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
