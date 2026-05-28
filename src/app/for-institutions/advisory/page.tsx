// /for-institutions/advisory — Advisory engagement landing page.
//
// 2026-05-27: Ported to the mockup design system. Institutional, calm,
// fractional-CAIO-grade voice. Per-tier accent colors from
// content/advisory/v1.ts are deliberately ignored — the mockup system
// uses a single accent (gold). All three tiers carry the same accent
// treatment and rely on labels + structure for differentiation.

import Link from 'next/link';
import type { Metadata } from 'next';
import { advisoryTiers } from '@content/advisory/v1';
import { BriefingButton } from '@/components/analytics/BriefingButton';
import { SiteHeader } from '@/components/mockup';

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
    <>
      <SiteHeader
        activePath="/for-institutions"
        cta={{ label: 'Book a briefing', href: '/for-institutions/advisory' }}
      />
      <main style={{ background: 'var(--cream)', color: 'var(--ink)' }}>
        {/* Hero */}
      <section className="px-6 pt-14 pb-10 md:pt-20 md:pb-14">
        <div className="max-w-4xl mx-auto">
          <p
            className="mb-4"
            style={{
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
            }}
          >
            <Link
              href="/for-institutions"
              style={{ color: 'var(--slate-500)', textDecoration: 'none' }}
              className="hover:!text-[color:var(--gold-deep)] transition-colors"
            >
              For institutions
            </Link>
            <span className="mx-2" aria-hidden="true">·</span>
            Advisory
          </p>
          <h1
            className="mb-6"
            style={{
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              color: 'var(--ink)',
            }}
          >
            Coaching for institutions in the program.
          </h1>
          <p
            className="max-w-2xl"
            style={{
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: 18,
              fontWeight: 400,
              lineHeight: 1.55,
              color: 'var(--slate-600)',
            }}
          >
            Certification is the product. Advisory is a complement for
            institutions that want a coach embedded alongside the cohort.
            We don’t build AI for you — we coach your team while
            they build it themselves.
          </p>
        </div>
      </section>

      {/* Three advisory shapes */}
      <section
        aria-labelledby="advisory-tiers-heading"
        className="px-6 py-14 md:py-20"
        style={{
          borderTop: '1px solid var(--ink-a10)',
          background: 'var(--cream-2)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 max-w-2xl">
            <p
              className="mb-3"
              style={{
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
              }}
            >
              Advisory shapes
            </p>
            <h2
              id="advisory-tiers-heading"
              style={{
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(28px, 3.6vw, 40px)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: 'var(--ink)',
              }}
            >
              Three ways we coach alongside a cohort.
            </h2>
          </div>

          <div className="space-y-6">
            {advisoryTiers.map((tier) => (
              <article
                key={tier.id}
                style={{
                  borderRadius: 24,
                  border: '1px solid var(--ink-a10)',
                  overflow: 'hidden',
                  background: 'var(--cream)',
                  boxShadow: 'var(--shadow-soft)',
                  display: 'flex',
                }}
              >
                <div
                  style={{ width: 6, flexShrink: 0, background: 'var(--gold)' }}
                  aria-hidden="true"
                />
                <div className="flex-1 p-6 md:p-8">
                  <div className="flex items-center flex-wrap gap-3 mb-3">
                    <span
                      style={{
                        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'var(--gold-deep)',
                      }}
                    >
                      {tier.scaleLabel}
                    </span>
                  </div>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                      fontWeight: 700,
                      fontSize: 'clamp(22px, 2.6vw, 30px)',
                      lineHeight: 1.15,
                      letterSpacing: '-0.015em',
                      color: 'var(--ink)',
                    }}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className="mb-4"
                    style={{
                      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: 1.5,
                      color: 'var(--slate-600)',
                    }}
                  >
                    {tier.tagline}
                  </p>
                  <p
                    className="mb-5 max-w-2xl"
                    style={{
                      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                      fontSize: 14.5,
                      fontWeight: 400,
                      lineHeight: 1.6,
                      color: 'var(--slate-600)',
                    }}
                  >
                    {tier.summary}
                  </p>

                  <dl className="grid sm:grid-cols-3 gap-x-6 gap-y-3 mb-2">
                    <DLBlock label="Best for" value={tier.bestFor} />
                    <DLBlock label="Format" value={tier.format} />
                    <DLBlock label="Duration" value={tier.duration} />
                  </dl>
                </div>
              </article>
            ))}
          </div>

          <p
            className="mt-8"
            style={{
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
            }}
          >
            Pricing scoped per engagement during the Executive Briefing.
          </p>
        </div>
      </section>

      {/* What we don't do */}
      <section
        aria-labelledby="clarity-heading"
        className="px-6 py-14 md:py-20"
        style={{ borderTop: '1px solid var(--ink-a10)' }}
      >
        <div className="max-w-3xl mx-auto">
          <p
            className="mb-3"
            style={{
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
            }}
          >
            Clarity
          </p>
          <h2
            id="clarity-heading"
            className="mb-6"
            style={{
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(28px, 3.6vw, 40px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
            }}
          >
            What we don’t do.
          </h2>
          <ul className="space-y-3">
            {notWhatWeDo.map((line) => (
              <li
                key={line}
                style={{
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                  fontSize: 16,
                  fontWeight: 500,
                  lineHeight: 1.6,
                  color: 'var(--slate-600)',
                  paddingLeft: 20,
                  position: 'relative',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '0.75rem',
                    width: 12,
                    height: 1,
                    background: 'var(--gold)',
                  }}
                />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section
        className="px-6 py-14 md:py-20"
        style={{ borderTop: '1px solid var(--ink-a10)' }}
      >
        <div
          className="max-w-3xl mx-auto p-10 md:p-14 text-center"
          style={{
            background: 'var(--ink)',
            color: 'var(--cream)',
            borderRadius: 32,
            boxShadow: 'var(--shadow-feature)',
          }}
        >
          <p
            className="mb-3"
            style={{
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--gold-soft)',
            }}
          >
            Every advisory engagement starts here
          </p>
          <h2
            className="mb-4"
            style={{
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(28px, 3.6vw, 40px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--cream)',
            }}
          >
            Book a free Executive Briefing.
          </h2>
          <p
            className="max-w-xl mx-auto mb-6"
            style={{
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.6,
              color: 'var(--on-dark-80)',
            }}
          >
            We’ll map what you’re trying to accomplish to the
            right certification track and the right advisory shape —
            or tell you plainly that you don’t need advisory at all.
          </p>
          <BriefingButton
            href={CALENDLY_URL}
            source="services"
            className="aibi-advisory-cta"
          >
            BOOK AN EXECUTIVE BRIEFING
          </BriefingButton>
          <style>{`
            .aibi-advisory-cta {
              display: inline-block;
              padding: 14px 28px;
              background: var(--gold);
              color: var(--ink);
              font-family: Inter, ui-sans-serif, system-ui, sans-serif;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.14em;
              border-radius: 12px;
              text-decoration: none;
              transition: background 120ms cubic-bezier(0.4, 0, 0.2, 1);
            }
            .aibi-advisory-cta:hover { background: var(--gold-2); }
            .aibi-advisory-cta:active { transform: scale(0.98); }
          `}</style>
        </div>
      </section>
      </main>
    </>
  );
}

function DLBlock({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <dt
        style={{
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--slate-500)',
          marginBottom: 4,
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.5,
          color: 'var(--slate-600)',
        }}
      >
        {value}
      </dd>
    </div>
  );
}
