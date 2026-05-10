import type { Metadata } from "next";
import { MarketingPage } from "@/components/system/templates";
import { Section, Cta } from "@/components/system";
import { ROIDossier } from "@/components/sections/ROIDossier";
import { HomeContextStrip } from "@/components/sections/HomeContextStrip";
import { BRAND } from "@content/copy";

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description:
    "An education company for community banks and credit unions. Begin with a twelve-question readiness diagnostic; earn the AiBI-Foundation credential when you are ready.",
};

export default function HomePage() {
  return (
    <>
      <HomeContextStrip />
      <MarketingPage
      hero={{
        eyebrow: "An institute for community banking",
        title: (
          <>
            Turning Bankers into <em className="text-terra">Builders.</em>
          </>
        ),
        lede: (
          <span className="font-serif italic">
            Independent AI assessment and education for community banks and
            credit unions.
          </span>
        ),
        primaryCta: { href: "/assessment/start", label: "Take the assessment" },
        secondaryCta: { href: "/courses/aibi-p", label: "View the curriculum" },
        divider: "hairline",
      }}
    >
      {/* Two-tile split — assessment + certification */}
      <Section variant="linen" padding="default" divider="none">
        <div className="grid md:grid-cols-2 -mx-s7">
          {/* Left tile — Readiness Assessment, on cream */}
          <div className="bg-linen px-s7 py-s12 md:py-s14 md:pr-s10 border-r border-hairline">
            <h2 className="font-serif text-display-lg md:text-display-xl text-ink leading-[1.05] tracking-tightish max-w-[14ch]">
              AI <em className="text-terra">Readiness</em> Assessment
            </h2>
            <p className="text-body-lg text-ink/80 leading-relaxed mt-s6 max-w-[36ch]">
              Twelve questions, three minutes. A score, a tier, and a tailored
              starter artifact you can take to your team this week.
            </p>
            <div className="mt-s8">
              <Cta variant="secondary" href="/assessment/start">
                Begin the assessment →
              </Cta>
            </div>
          </div>

          {/* Right tile — Practitioner Certification, on parch */}
          <div className="bg-parch px-s7 py-s12 md:py-s14 md:pl-s10">
            <h2 className="font-serif text-display-lg md:text-display-xl text-ink leading-[1.05] tracking-tightish max-w-[14ch]">
              AiBI-<em className="text-terra">Practitioner</em> Certification
            </h2>
            <p className="text-body-lg text-ink/80 leading-relaxed mt-s6 max-w-[36ch]">
              Twelve self-paced modules. The community-banking AI proficiency
              standard, scored on reviewed work — not multiple-choice quizzes.
            </p>
            <div className="mt-s8">
              <Cta variant="secondary" href="/courses/aibi-p">
                View the curriculum →
              </Cta>
            </div>
          </div>
        </div>
      </Section>

      {/* Savings calculator — the closing payload */}
      <ROIDossier />
    </MarketingPage>
    </>
  );
}
