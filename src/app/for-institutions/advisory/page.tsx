import Link from 'next/link';
import type { Metadata } from 'next';
import { advisoryTiers } from '@content/advisory/v1';
import { BriefingButton } from '@/components/analytics/BriefingButton';

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
    <main className="bg-[color:var(--cream)]">
      {/* Hero — dark navy marquee with pill-chip kicker */}
      <section className="px-6 pt-14 pb-14 md:pt-20 md:pb-20">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-[32px] p-10 md:p-14"
            style={{
              background: 'var(--ink)',
              color: '#fff',
              boxShadow: 'var(--shadow-hero)',
            }}
          >
            <p className="text-[11px] uppercase tracking-[0.2em] mb-5">
              <Link
                href="/for-institutions"
                className="hover:opacity-100 transition-opacity"
                style={{ color: 'var(--gold-soft)', opacity: 0.75 }}
              >
                For institutions
              </Link>
              <span className="mx-2" aria-hidden="true" style={{ color: 'var(--on-dark-50)' }}>·</span>
              <span style={{ color: 'var(--gold-soft)' }}>Advisory</span>
            </p>

            <span
              className="inline-flex items-center rounded-full px-3.5 py-1.5 mb-6 text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ background: 'var(--gold-a20)', color: 'var(--gold-soft)' }}
            >
              Coaching · Optional complement to certification
            </span>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl leading-[1.04] tracking-tight font-bold mb-6"
              style={{ color: '#fff' }}
            >
              Coaching for institutions in the program.
            </h1>

            <p
              className="text-lg leading-relaxed max-w-2xl"
              style={{ color: 'var(--on-dark-80)' }}
            >
              Certification is the product. Advisory is a complement for
              institutions that want a coach embedded alongside the cohort.
              We don’t build AI for you — we coach your team while they build
              it themselves.
            </p>
          </div>
        </div>
      </section>

      {/* Three advisory shapes — cream-2 section, white cards */}
      <section
        aria-labelledby="advisory-tiers-heading"
        className="px-6 py-14 md:py-20 border-t"
        style={{
          borderColor: 'var(--ink-a10)',
          background: 'var(--cream-2)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 max-w-2xl">
            <span
              className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: 'var(--gold-deep)' }}
            >
              Advisory shapes
            </span>
            <h2
              id="advisory-tiers-heading"
              className="text-3xl md:text-4xl leading-tight tracking-tight font-bold"
              style={{ color: 'var(--ink)' }}
            >
              Three ways we coach alongside a cohort.
            </h2>
          </div>

          <div className="space-y-5">
            {advisoryTiers.map((tier) => (
              <article
                key={tier.id}
                className="rounded-2xl overflow-hidden border"
                style={{
                  borderColor: 'var(--ink-a10)',
                  background: '#FFFFFF',
                  boxShadow: 'var(--shadow-soft)',
                }}
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
                        className="inline-flex items-center rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em]"
                        style={{ background: 'var(--gold-a10)', color: 'var(--gold-deep)' }}
                      >
                        {tier.scaleLabel}
                      </span>
                    </div>
                    <h3
                      className="text-2xl md:text-3xl leading-tight tracking-tight font-bold mb-2"
                      style={{ color: 'var(--ink)' }}
                    >
                      {tier.name}
                    </h3>
                    <p
                      className="text-base leading-relaxed mb-4 font-semibold"
                      style={{ color: 'var(--slate-600)' }}
                    >
                      {tier.tagline}
                    </p>
                    <p
                      className="text-sm leading-relaxed mb-6 max-w-2xl"
                      style={{ color: 'var(--slate-600)' }}
                    >
                      {tier.summary}
                    </p>

                    <dl className="grid sm:grid-cols-3 gap-x-6 gap-y-3">
                      <div>
                        <dt
                          className="text-[10px] uppercase tracking-[0.18em] font-bold mb-1"
                          style={{ color: 'var(--gold-deep)' }}
                        >
                          Best for
                        </dt>
                        <dd
                          className="text-xs leading-snug"
                          style={{ color: 'var(--ink)' }}
                        >
                          {tier.bestFor}
                        </dd>
                      </div>
                      <div>
                        <dt
                          className="text-[10px] uppercase tracking-[0.18em] font-bold mb-1"
                          style={{ color: 'var(--gold-deep)' }}
                        >
                          Format
                        </dt>
                        <dd
                          className="text-xs leading-snug"
                          style={{ color: 'var(--ink)' }}
                        >
                          {tier.format}
                        </dd>
                      </div>
                      <div>
                        <dt
                          className="text-[10px] uppercase tracking-[0.18em] font-bold mb-1"
                          style={{ color: 'var(--gold-deep)' }}
                        >
                          Duration
                        </dt>
                        <dd
                          className="text-xs leading-snug tabular-nums"
                          style={{ color: 'var(--ink)' }}
                        >
                          {tier.duration}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p
            className="text-[11px] uppercase tracking-[0.18em] font-semibold mt-8"
            style={{ color: 'var(--slate-500)' }}
          >
            Pricing scoped per engagement during the Executive Briefing.
          </p>
        </div>
      </section>

      {/* What we don't do — clean editorial section */}
      <section
        aria-labelledby="clarity-heading"
        className="px-6 py-14 md:py-20 border-t"
        style={{ borderColor: 'var(--ink-a10)' }}
      >
        <div className="max-w-3xl mx-auto">
          <span
            className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: 'var(--gold-deep)' }}
          >
            Clarity
          </span>
          <h2
            id="clarity-heading"
            className="text-3xl md:text-4xl leading-tight tracking-tight font-bold mb-8"
            style={{ color: 'var(--ink)' }}
          >
            What we don’t do.
          </h2>
          <ul className="space-y-3">
            {notWhatWeDo.map((line) => (
              <li
                key={line}
                className="text-base leading-relaxed pl-6 relative"
                style={{ color: 'var(--ink)' }}
              >
                <span
                  className="absolute left-0 top-[0.7rem] w-3.5 h-[2px] rounded-full"
                  style={{ background: 'var(--gold)' }}
                  aria-hidden="true"
                />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA — dark navy hero card */}
      <section
        className="px-6 py-14 md:py-20 border-t"
        style={{ borderColor: 'var(--ink-a10)' }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-[32px] p-10 md:p-14 text-center"
            style={{
              background: 'var(--ink)',
              color: '#fff',
              boxShadow: 'var(--shadow-hero)',
            }}
          >
            <span
              className="inline-flex items-center rounded-full px-3.5 py-1.5 mb-5 text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ background: 'var(--gold-a20)', color: 'var(--gold-soft)' }}
            >
              Every advisory engagement starts here
            </span>
            <h2
              className="text-3xl md:text-4xl leading-tight tracking-tight font-bold mb-4"
              style={{ color: '#fff' }}
            >
              Book a free Executive Briefing.
            </h2>
            <p
              className="max-w-xl mx-auto mb-7 leading-relaxed"
              style={{ color: 'var(--on-dark-80)' }}
            >
              We’ll map what you’re trying to accomplish to the right
              certification track and the right advisory shape — or tell you
              plainly that you don’t need advisory at all.
            </p>
            <BriefingButton
              href={CALENDLY_URL}
              source="services"
              className="inline-block px-8 py-4 text-[12px] font-bold uppercase tracking-[0.16em] rounded-xl transition-all bg-[color:var(--gold)] text-[color:var(--ink)] hover:bg-[color:var(--gold-2)]"
            >
              Book an Executive Briefing
            </BriefingButton>
          </div>
        </div>
      </section>
    </main>
  );
}
