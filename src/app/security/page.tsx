import type { Metadata } from "next";
import { Section, SectionHeader, Cta } from "@/components/system";
import { GuideRequestForm } from "./_components/GuideRequestForm";

export const metadata: Metadata = {
  title: "Security & Governance — AI built for regulated institutions",
  description:
    "Aligned with SR 11-7, Interagency TPRM Guidance, ECOA / Reg B, and the AIEOG AI Lexicon. Free Safe AI Use Guide for community banks and credit unions.",
};

const GUIDE_CHAPTERS = [
  {
    title: "The never-paste list",
    description:
      "The non-negotiable data types that must never touch a public LLM: PII, member records, non-public examination data, and the compliance reasoning behind each exclusion.",
  },
  {
    title: "Private cloud vs. public model",
    description:
      "When private inference is required, when a public model is acceptable, and the decision tree every staff member should run before pasting anything into a tool.",
  },
  {
    title: "Mapping to SR 11-7",
    description:
      "How model risk management guidance applies to generative AI, with specific language you can drop into your AI governance framework.",
  },
  {
    title: "Vendor evaluation scoring",
    description:
      "The five-question framework for evaluating AI vendors against your risk posture, including concentration risk thresholds.",
  },
  {
    title: "Shadow AI discovery",
    description:
      "A structured method for identifying the AI tools your staff are already using without your knowledge, and bringing them inside a governance perimeter without killing adoption.",
  },
  {
    title: "Examiner readiness",
    description:
      "What to have on the table when an examiner walks in. Based on the AIEOG AI Lexicon vocabulary (US Treasury, FBIIC, FSSCC, February 2026).",
  },
] as const;

export default function SecurityPage() {
  return (
    <main>
      {/* Pillar B (cobalt) hero — the only page where cobalt dominates */}
      <section className="bg-cobalt text-bone px-s7 py-s12 md:py-s16 border-b border-strong">
        <div className="max-w-wide mx-auto grid lg:grid-cols-[1.5fr_1fr] gap-s10 items-end">
          <div>
            <p className="font-serif-sc text-label-md uppercase tracking-widest text-bone/70 mb-s4">
              Boundary-Safe · Pillar B
            </p>
            <h1 className="font-serif text-display-lg md:text-display-xl text-bone leading-tight tracking-tightish">
              AI governance built for institutions that get examined.
            </h1>
            <p className="text-body-lg text-bone/85 mt-s5 leading-relaxed max-w-narrow">
              Every recommendation from the Institute is grounded in the shared
              vocabulary of the AIEOG AI Lexicon — published by the US Treasury, FBIIC,
              and FSSCC in February 2026 — the first official cross-agency vocabulary for
              financial AI governance.
            </p>
            <p className="text-body-md text-bone/80 mt-s4 leading-relaxed max-w-narrow">
              If your board has been asking whether AI is safe for a regulated
              institution, the answer is not a brochure. It is a framework: SR 11-7 for
              model risk, Interagency TPRM Guidance for vendor oversight, and ECOA with
              Reg B for fair lending — applied to generative AI through the AIEOG
              vocabulary.
            </p>
          </div>
          <aside className="border border-bone/20 bg-bone/[0.05] p-s7">
            <p className="font-serif-sc text-label-md uppercase tracking-widest text-cream mb-s2">
              Free download
            </p>
            <h2 className="font-serif text-display-xs text-bone leading-tight mb-s4">
              The Safe AI Use Guide.
            </h2>
            <p className="text-body-sm text-bone/85 mb-s5 leading-relaxed">
              Six chapters. Written for community banks and credit unions. One page per
              chapter. Maps directly to SR 11-7 and the AIEOG AI Lexicon.
            </p>
            <GuideRequestForm />
          </aside>
        </div>
      </section>

      {/* §01 — What's inside */}
      <Section variant="linen" padding="default">
        <SectionHeader
          number="01"
          label="What is inside"
          title="Six chapters your compliance officer will actually read."
        />
        <div className="grid md:grid-cols-2 gap-x-s10 gap-y-s8 mt-s8">
          {GUIDE_CHAPTERS.map((chapter, idx) => (
            <article
              key={chapter.title}
              className="border-t border-strong pt-s5"
            >
              <p className="font-mono text-mono-sm tabular-nums text-cobalt mb-s3">
                {String(idx + 1).padStart(2, "0")}
              </p>
              <h3 className="font-serif text-display-xs text-ink leading-snug mb-s3">
                {chapter.title}
              </h3>
              <p className="text-body-md text-ink/80 leading-relaxed">
                {chapter.description}
              </p>
            </article>
          ))}
        </div>
      </Section>

      {/* §02 — Engagement upsell */}
      <Section variant="parchDark" divider="none" padding="default" container="narrow">
        <SectionHeader
          number="02"
          label="Not just a PDF"
          title="The guide is the starting point. The engagement is how it gets operationalized."
        />
        <p className="text-body-md text-ink/80 mt-s4 leading-relaxed">
          A governance guide is not the same as a governance framework. An engagement
          with the Institute installs the framework inside your institution — with named
          owners, a review cadence, and documented alignment to every applicable
          regulatory reference.
        </p>
        <div className="mt-s8">
          <Cta href="/for-institutions">See how we work →</Cta>
        </div>
      </Section>
    </main>
  );
}
