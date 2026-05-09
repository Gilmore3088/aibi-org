import type { Metadata } from "next";
import { MarketingPage } from "@/components/system/templates";
import {
  Section,
  SectionHeader,
  PillarCard,
  Cta,
} from "@/components/system";
import { enrollmentTiers } from "@content/institutions/v1";
import { CTAS } from "@content/copy";
import type { Pillar } from "@/lib/design-system/tokens";

export const metadata: Metadata = {
  title: "For Institutions | The AI Banking Institute",
  description:
    "Three ways to bring AiBI capability into your bank — without buying a platform. Coached cohort · institution-wide program · leadership advisory.",
};

const TIER_PILLAR: Record<typeof enrollmentTiers[number]["id"], Pillar> = {
  individual: "application",
  team: "understanding",
  "institution-wide": "awareness",
};

export default function ForInstitutionsPage() {
  return (
    <MarketingPage
      hero={{
        eyebrow: "For Banks & Credit Unions",
        title: (
          <>
            Capability, <em className="text-terra">not a platform.</em>
          </>
        ),
        lede: (
          <span className="font-serif italic">
            An education engagement for community banks and credit unions.
            No software seats. No vendor lock-in.
          </span>
        ),
        primaryCta: CTAS.beginAssessment,
        secondaryCta: CTAS.requestPilot,
        divider: "hairline",
      }}
    >
      {/* Value prop band — what your institution actually gets.
          Contained to max-w-wide so it matches the rest of the page. */}
      <div className="px-s7 py-s8">
        <div className="mx-auto max-w-wide grid sm:grid-cols-2 lg:grid-cols-4 bg-parch-dark border border-strong">
          {[
          {
            label: "Practitioner output",
            value: "3 reviewed artifacts / banker",
            desc: "Real workflows your examiners can see, your peers can review, your bank can ship.",
            glyph: (
              <svg viewBox="0 0 36 36" aria-hidden="true" stroke="currentColor" strokeWidth="1.25" fill="none" className="w-9 h-9">
                <rect x="4" y="14" width="20" height="14" />
                <rect x="8" y="10" width="20" height="14" />
                <rect x="12" y="6" width="20" height="14" />
                <path d="M16 13 L19 16 L26 9" strokeWidth="1.75" strokeLinecap="square" />
              </svg>
            ),
          },
          {
            label: "Readiness baseline",
            value: "Institutional diagnostic",
            desc: "8 dimensions, regulator-aligned, run before and after the engagement.",
            glyph: (
              <svg viewBox="0 0 36 36" aria-hidden="true" className="w-9 h-9">
                <g stroke="currentColor" strokeWidth="0.75" opacity="0.55">
                  <line x1="18" y1="18" x2="18" y2="4" />
                  <line x1="18" y1="18" x2="28" y2="8" />
                  <line x1="18" y1="18" x2="32" y2="18" />
                  <line x1="18" y1="18" x2="28" y2="28" />
                  <line x1="18" y1="18" x2="18" y2="32" />
                  <line x1="18" y1="18" x2="8" y2="28" />
                  <line x1="18" y1="18" x2="4" y2="18" />
                  <line x1="18" y1="18" x2="8" y2="8" />
                </g>
                <polygon
                  points="18,4 28,8 32,18 28,28 18,32 8,28 4,18 8,8"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  fill="none"
                />
                <circle cx="18" cy="18" r="1.75" fill="currentColor" />
              </svg>
            ),
          },
          {
            label: "Governance posture",
            value: "Inventory + policy stack",
            desc: "The artifact examiners ask for, drafted by the people who will maintain it.",
            glyph: (
              <svg viewBox="0 0 36 36" aria-hidden="true" stroke="currentColor" strokeWidth="1.25" fill="none" className="w-9 h-9">
                <rect x="5" y="22" width="26" height="7" />
                <rect x="5" y="14" width="26" height="7" />
                <rect x="5" y="6" width="26" height="7" />
                <rect x="8" y="8.5" width="3" height="2" fill="currentColor" stroke="none" />
                <rect x="8" y="16.5" width="3" height="2" fill="currentColor" stroke="none" />
                <rect x="8" y="24.5" width="3" height="2" fill="currentColor" stroke="none" />
              </svg>
            ),
          },
          {
            label: "Cost discipline",
            value: "$0 platform cost",
            desc: "No software seats, no vendor lock-in. The Institute is the engagement, not a SaaS bill.",
            glyph: (
              <svg viewBox="0 0 36 36" aria-hidden="true" stroke="currentColor" strokeWidth="1.5" fill="none" className="w-9 h-9">
                <circle cx="18" cy="18" r="13" />
                <line x1="9" y1="27" x2="27" y2="9" strokeLinecap="square" />
              </svg>
            ),
          },
        ].map((card) => (
          <div
            key={card.label}
            className="p-s6 border-l border-hairline first:border-l-0 sm:[&:nth-child(3)]:border-l-0 sm:[&:nth-child(3)]:border-t lg:[&:nth-child(3)]:border-t-0 lg:[&:nth-child(3)]:border-l"
          >
            <span className="text-terra block mb-s4">{card.glyph}</span>
            <p className="font-serif-sc text-label-sm uppercase tracking-widest text-slate mb-s2">
              {card.label}
            </p>
            <p className="font-serif text-display-xs text-ink leading-snug mb-s2">
              {card.value}
            </p>
            <p className="text-body-sm text-ink/80 leading-relaxed">{card.desc}</p>
          </div>
        ))}
        </div>
      </div>

      {/* Three engagement tiles */}
      <Section variant="linen" padding="default">
        <SectionHeader
          label="Engagement"
          title="Three ways to enroll."
        />
        <div className="grid md:grid-cols-3 gap-px bg-hairline border-y border-strong mt-s6">
          {enrollmentTiers.map((tier) => {
            const pillar = TIER_PILLAR[tier.id];
            const isCalendly = tier.cta.href === "calendly";
            const ctaHref = isCalendly
              ? process.env.NEXT_PUBLIC_CALENDLY_URL ?? "#"
              : tier.cta.href;
            return (
              <PillarCard
                key={tier.id}
                pillar={pillar}
                stripe
                surface="linen"
                className="border-l-0 border-r-0 border-t-0 border-b-0"
              >
                <p className="font-mono text-label-sm uppercase tracking-widest text-terra mb-s2">
                  {tier.scaleLabel}
                </p>
                <PillarCard.Title level={3}>{tier.name}</PillarCard.Title>
                <PillarCard.Designation>{tier.tagline}</PillarCard.Designation>
                <ul className="border-y border-hairline py-s3 my-s4 space-y-s1 text-body-sm">
                  {tier.included.map((item) => (
                    <li key={item} className="grid grid-cols-[12px_1fr] gap-s2">
                      <span aria-hidden="true" className="font-mono text-terra">
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Cta variant="secondary" href={ctaHref}>
                  {tier.cta.label} →
                </Cta>
              </PillarCard>
            );
          })}
        </div>
      </Section>

      {/* Pilot CTA — the recommended start */}
      <Section variant="dark" divider="none" padding="default" id="inquiry">
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-s10 items-center">
          <div>
            <p className="font-serif-sc text-label-md uppercase tracking-widest text-cream mb-s3">
              Begin where it makes sense
            </p>
            <h2 className="font-serif text-display-md text-bone leading-tight">
              Start with a coached cohort. Scale on what works.
            </h2>
            <p className="text-body-md text-cream mt-s4 leading-relaxed">
              A 10-seat cohort over eight weeks. Practitioners ship reviewed
              AI workflows; leadership gets the readiness data to plan the
              next step.
            </p>
          </div>
          <div className="border-l border-cream/20 pl-s8">
            <p className="font-mono text-label-md uppercase tracking-widest text-cream mb-s4">
              What&rsquo;s included
            </p>
            <ul className="space-y-s2 text-body-sm text-cream">
              {[
                "10 AiBI-Practitioner seats",
                "Weekly coaching for 8 weeks",
                "Institutional readiness diagnostic",
                "Aggregate dashboard for your champion",
                "Capstone artifact review by an instructor",
              ].map((item) => (
                <li key={item} className="grid grid-cols-[12px_1fr] gap-s2">
                  <span aria-hidden="true" className="font-mono text-cream">
                    —
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-s5">
              <Cta href={CTAS.contactInstitute.href} tone="dark">
                {CTAS.contactInstitute.label}
              </Cta>
            </div>
          </div>
        </div>
      </Section>
    </MarketingPage>
  );
}
