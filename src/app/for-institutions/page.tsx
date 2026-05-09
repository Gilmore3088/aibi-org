import type { Metadata } from "next";
import { MarketingPage } from "@/components/system/templates";
import {
  Section,
  SectionHeader,
  PillarCard,
  Cta,
  Marginalia,
  ToolGrid,
  SkillGrid,
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
            Capability,{" "}
            <em className="not-italic text-terra">not a platform.</em>
          </>
        ),
        lede: (
          <>
            An education engagement for community banks and credit unions. Your bankers
            leave with reviewed AI workflows; your leadership leaves with a readiness
            baseline and a governance plan; your examiners see a defensible posture.
            Nothing to install. No vendor lock-in. Just capability that compounds.
          </>
        ),
        primaryCta: CTAS.requestPilot,
        secondaryCta: CTAS.beginAssessment,
        aside: (
          <Marginalia label="The engagement, in four lines">
            <ul className="space-y-s3 text-body-sm leading-relaxed">
              <li>
                <span className="font-mono text-mono-sm tabular-nums text-terra mr-s2">01</span>
                A coached cohort, an institution-wide program, or a leadership advisory.
              </li>
              <li>
                <span className="font-mono text-mono-sm tabular-nums text-terra mr-s2">02</span>
                Practitioners ship reviewed AI artifacts. Leadership gets a readiness baseline.
              </li>
              <li>
                <span className="font-mono text-mono-sm tabular-nums text-terra mr-s2">03</span>
                Aligned with SR 11-7, TPRM, ECOA / Reg B, and the AIEOG Lexicon.
              </li>
              <li>
                <span className="font-mono text-mono-sm tabular-nums text-terra mr-s2">04</span>
                No platform purchase. No vendor lock-in.
              </li>
            </ul>
          </Marginalia>
        ),
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
          },
          {
            label: "Readiness baseline",
            value: "Institutional diagnostic",
            desc: "8 dimensions, regulator-aligned, run before and after the engagement.",
          },
          {
            label: "Governance posture",
            value: "Inventory + policy stack",
            desc: "The artifact examiners ask for, drafted by the people who will maintain it.",
          },
          {
            label: "Cost discipline",
            value: "$0 platform cost",
            desc: "No software seats, no vendor lock-in. The Institute is the engagement, not a SaaS bill.",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="p-s6 border-l border-hairline first:border-l-0 sm:[&:nth-child(3)]:border-l-0 sm:[&:nth-child(3)]:border-t lg:[&:nth-child(3)]:border-t-0 lg:[&:nth-child(3)]:border-l"
          >
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

      {/* §01 — Three engagement tiles */}
      <Section variant="linen" padding="default">
        <SectionHeader
          number="01"
          label="Engagement"
          title="Three ways to enroll, one free briefing to find the right fit."
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

      {/* §02 — Tools, named */}
      <Section variant="parch" padding="default">
        <SectionHeader
          number="02"
          label="Tools, named"
          title="Six platforms. No abstractions."
        />
        <ToolGrid className="mt-s8" />
      </Section>

      {/* §03 — Skills, verb-stated */}
      <Section variant="linen" padding="default">
        <SectionHeader
          number="03"
          label="Skills, verb-stated"
          title="What practitioners can do on day one."
        />
        <SkillGrid className="mt-s8" />
      </Section>

      {/* §03 — Pilot CTA */}
      <Section variant="dark" divider="none" padding="default" id="inquiry">
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-s10 items-center">
          <div>
            <p className="font-serif-sc text-label-md uppercase tracking-widest text-amber-light mb-s3">
              Begin where it makes sense
            </p>
            <h2 className="font-serif text-display-md text-bone leading-tight">
              Start with a coached cohort. Scale on what works.
            </h2>
            <p className="text-body-md text-cream mt-s4 leading-relaxed">
              The fastest way to see the Institute&rsquo;s shape inside your bank is a 10-seat
              coached cohort over eight weeks. Practitioners ship reviewed AI workflows;
              leadership gets the readiness data to plan the next step. No platform
              purchase. No vendor lock-in.
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
                  <span aria-hidden="true" className="font-mono text-amber-light">
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
