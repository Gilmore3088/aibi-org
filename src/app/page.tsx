import type { Metadata } from "next";
import { MarketingPage } from "@/components/system/templates";
import { Section, Cta } from "@/components/system";
import { ROIDossier } from "@/components/sections/ROIDossier";
import { HomeContextStrip } from "@/components/sections/HomeContextStrip";
import { BRAND } from "@content/copy";

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description:
    "An education company for community banks and credit unions. Begin with a free twelve-question readiness diagnostic; deepen the diagnosis with the In-Depth Assessment; earn the AiBI-Foundation credential when you are ready.",
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
        secondaryCta: { href: "/courses/foundation/program", label: "View the curriculum" },
        divider: "hairline",
      }}
    >
      {/* Three-tile ladder — Free Assessment · In-Depth Assessment · Foundation Course */}
      <Section variant="linen" padding="default" divider="none">
        <div className="grid md:grid-cols-3 -mx-s7">
          {/* Tile 1 — Free Readiness Assessment */}
          <div className="bg-linen px-s7 py-s12 md:py-s14 md:pr-s8 border-r border-hairline">
            <p className="font-mono text-label-md uppercase tracking-widest text-terra mb-s4">
              Free
            </p>
            <h2 className="font-serif text-display-md md:text-display-lg text-ink leading-[1.05] tracking-tightish max-w-[14ch]">
              AI <em className="text-terra">Readiness</em> Assessment
            </h2>
            <p className="text-body-md text-ink/80 leading-relaxed mt-s5 max-w-[36ch]">
              Twelve questions, three minutes. A score, a tier, and a tailored
              starter artifact you can take to your team this week.
            </p>
            <div className="mt-s7">
              <Cta variant="secondary" href="/assessment/start">
                Begin the free assessment →
              </Cta>
            </div>
          </div>

          {/* Tile 2 — In-Depth Assessment (paid diagnostic) */}
          <div className="bg-parch px-s7 py-s12 md:py-s14 md:px-s8 border-r border-hairline">
            <p className="font-mono text-label-md uppercase tracking-widest text-terra mb-s4">
              $99 · $79 at 10+
            </p>
            <h2 className="font-serif text-display-md md:text-display-lg text-ink leading-[1.05] tracking-tightish max-w-[14ch]">
              In-<em className="text-terra">Depth</em> Assessment
            </h2>
            <p className="text-body-md text-ink/80 leading-relaxed mt-s5 max-w-[36ch]">
              You leave with your in-depth score, AI assets you can use
              immediately, and a playbook to launch your first AI win.
              Anonymized team rollup included.
            </p>
            <div className="mt-s7">
              <Cta variant="secondary" href="/assessment/in-depth">
                See the In-Depth Assessment →
              </Cta>
            </div>
          </div>

          {/* Tile 3 — AiBI-Foundation course (paid, lifetime access) */}
          <div className="bg-linen px-s7 py-s12 md:py-s14 md:pl-s8">
            <p className="font-mono text-label-md uppercase tracking-widest text-terra mb-s4">
              $295 · $199 at 10+ · Lifetime access
            </p>
            <h2 className="font-serif text-display-md md:text-display-lg text-ink leading-[1.05] tracking-tightish max-w-[14ch]">
              AiBI-<em className="text-terra">Foundation</em>
            </h2>
            <p className="text-body-md text-ink/80 leading-relaxed mt-s5 max-w-[36ch]">
              Learn how to build the prompts, agents, and AI workflows your
              daily banking work demands — and earn the AiBI-Foundation
              credential your examiner respects.
            </p>
            <div className="mt-s7">
              <Cta variant="secondary" href="/courses/foundation/program">
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
