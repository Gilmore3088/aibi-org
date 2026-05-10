import type { Metadata } from "next";
import { MarketingPage } from "@/components/system/templates";
import {
  Section,
  SectionHeader,
  Cta,
} from "@/components/system";
import { CTAS } from "@content/copy";

export const metadata: Metadata = {
  title: "For Institutions | The AI Banking Institute",
  description:
    "Three ways to bring AiBI capability into your bank — without buying a platform. Coached cohort · institution-wide program · leadership advisory.",
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
      {/* Three ways to build */}
      <Section variant="linen" padding="default">
        <SectionHeader
          label="Engagement"
          title="Three ways to build."
        />
        <div className="grid md:grid-cols-3 gap-px bg-hairline border-y border-strong mt-s6">
          {[
            {
              scale: "Free · diagnostic",
              name: "Readiness Assessment",
              tagline: "Twelve questions, three minutes — see where you stand.",
              included: [
                "Your readiness score and tier",
                "The dimension dragging you down",
                "A starter artifact you can take to your team this week",
              ],
              cta: { href: "/assessment", label: "Begin the assessment" },
            },
            {
              scale: "Per-banker",
              name: "Courses",
              tagline: "AiBI Foundations. Self-paced, scored on reviewed work.",
              included: [
                "Twelve self-paced modules",
                "Three reviewed AI artifacts per practitioner",
                "$295 individual · $199/seat at 10+",
              ],
              cta: { href: "/courses/aibi-p", label: "View the curriculum" },
            },
            {
              scale: "Institution-wide",
              name: "Organizational Rollout",
              tagline: "A coached cohort, an aggregate dashboard, a defensible posture.",
              included: [
                "10-seat coached cohort over eight weeks",
                "Institutional readiness baseline + post-engagement diagnostic",
                "Aggregate dashboard for your champion",
              ],
              cta: {
                href: process.env.NEXT_PUBLIC_CALENDLY_URL ?? "#inquiry",
                label: "Request a pilot",
              },
            },
          ].map((tier) => (
            <article
              key={tier.name}
              className="bg-linen px-s6 py-s8 flex flex-col"
            >
              <p className="font-mono text-label-sm uppercase tracking-widest text-terra mb-s3">
                {tier.scale}
              </p>
              <h3 className="font-serif text-display-sm leading-snug text-ink">
                {tier.name}
              </h3>
              <p className="font-serif italic text-body-md text-slate leading-snug mt-s2">
                {tier.tagline}
              </p>
              <ul className="border-y border-hairline py-s4 my-s5 space-y-s2 text-body-sm">
                {tier.included.map((item) => (
                  <li key={item} className="grid grid-cols-[14px_1fr] gap-s2 items-start">
                    <span aria-hidden="true" className="font-mono text-terra leading-snug">
                      —
                    </span>
                    <span className="text-ink/80 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <Cta variant="secondary" href={tier.cta.href}>
                  {tier.cta.label} →
                </Cta>
              </div>
            </article>
          ))}
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
                "10 AiBI Foundations seats",
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
