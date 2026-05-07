import type { Metadata } from "next";
import { MarketingPage } from "@/components/system/templates";
import { Section, SectionHeader, PillarCard, Cta, Marginalia } from "@/components/system";
import { enrollmentTiers } from "@content/institutions/v1";
import { TOOLS } from "@content/curriculum/tools";
import { SKILLS } from "@content/curriculum/skills";
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
      {/* Value prop band — what your institution actually gets */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 bg-parch-dark border-y border-strong">
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
                <p className="text-body-sm text-ink/80 leading-relaxed mb-s4">
                  {tier.summary}
                </p>
                <div className="bg-parch p-s4 mb-s4 border-l-2 border-l-terra">
                  <p className="font-mono text-label-sm uppercase tracking-widest text-slate mb-s2">
                    What&rsquo;s included
                  </p>
                  <ul className="space-y-s1 text-body-sm">
                    {tier.included.map((item) => (
                      <li key={item} className="grid grid-cols-[12px_1fr] gap-s2">
                        <span aria-hidden="true" className="font-mono text-terra">
                          —
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Cta variant="secondary" href={ctaHref}>
                  {tier.cta.label} →
                </Cta>
              </PillarCard>
            );
          })}
        </div>
      </Section>

      {/* §02 — Tools & skills */}
      <Section variant="parch" padding="default">
        <SectionHeader
          number="02"
          label="What your bankers will use, and leave knowing how to do"
          title="The tools and skills inside the engagement."
          subtitle="Vendor-named tools. Verb-stated skills. Each one ties back to a specific module of the curriculum."
        />
        <div className="grid md:grid-cols-2 gap-s10 mt-s6 border-t border-strong pt-s6">
          <div>
            <h3 className="font-mono text-label-md uppercase tracking-widest text-terra mb-s4">
              Tools your bankers will use
            </h3>
            <ul className="space-y-0">
              {TOOLS.map((tool, idx) => (
                <li
                  key={tool.slug}
                  className="border-b border-hairline py-s3 grid grid-cols-[28px_1fr] gap-s3 items-baseline text-body-sm"
                >
                  <span className="font-mono text-mono-sm tabular-nums text-slate">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <strong className="font-serif text-body-md text-ink block">
                      {tool.name}
                      <span className="font-sans text-body-sm font-normal text-slate ml-s2">
                        · {tool.vendor}
                      </span>
                    </strong>
                    <span className="text-body-sm text-slate">{tool.note}</span>
                    <span className="block font-mono text-label-sm uppercase tracking-widest text-dust mt-s1">
                      Modules{" "}
                      {tool.modules.map((m) => String(m).padStart(2, "0")).join(" · ")}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-label-md uppercase tracking-widest text-terra mb-s4">
              Skills your bankers will leave with
            </h3>
            <ul className="space-y-0">
              {SKILLS.map((skill, idx) => (
                <li
                  key={skill.slug}
                  className="border-b border-hairline py-s3 grid grid-cols-[28px_1fr] gap-s3 items-baseline text-body-sm"
                >
                  <span className="font-mono text-mono-sm tabular-nums text-slate">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <strong className="font-serif text-body-md text-ink block">
                      {skill.verb}
                    </strong>
                    <span className="text-body-sm text-slate">{skill.note}</span>
                    <span className="block font-mono text-label-sm uppercase tracking-widest text-dust mt-s1">
                      Modules{" "}
                      {skill.modules.map((m) => String(m).padStart(2, "0")).join(" · ")}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
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
