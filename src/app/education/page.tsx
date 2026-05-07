import type { Metadata } from "next";
import { MarketingPage } from "@/components/system/templates";
import {
  Section,
  SectionHeader,
  CertificationLadder,
  Cta,
  Marginalia,
} from "@/components/system";
import { SampleQuestion } from "@/components/sections/SampleQuestion";
import { InquiryForm } from "@/app/certifications/_components/InquiryForm";
import { modules } from "@content/courses/aibi-p";
import { getEnrollment as getPEnrollment } from "@/app/courses/aibi-p/_lib/getEnrollment";
import { CTAS } from "@content/copy";

export const metadata: Metadata = {
  title: "Education | The AI Banking Institute",
  description:
    "Free classes and three certification tracks for community banks and credit unions. Start with the AI Readiness Assessment, then earn AiBI-Practitioner, AiBI-S, or AiBI-L credentials.",
};

interface FreeClass {
  readonly title: string;
  readonly subtitle: string;
  readonly cta: string;
  readonly href: string;
  readonly available: boolean;
}

export default async function EducationPage() {
  const pEnrollment = await getPEnrollment();
  const completedCount = pEnrollment?.completed_modules?.length ?? 0;
  const isPEnrolled = pEnrollment !== null;

  const freeClasses: readonly FreeClass[] = [
    {
      title: "AI Readiness Assessment",
      subtitle:
        "Eight questions, three minutes. Get your readiness score and a tailored next-step recommendation.",
      cta: "Take the assessment",
      href: "/assessment/start",
      available: true,
    },
    {
      title: "The AI Banking Brief",
      subtitle:
        "Fortnightly research on regulatory updates, vendor moves, and practical AI use cases for community FIs.",
      cta: "Subscribe",
      href: "/research",
      available: true,
    },
    {
      title: "Short-form classes",
      subtitle:
        "Five-minute video lessons on regulatory framing, vendor evaluation, and Acceptable Use practices.",
      cta: "Coming soon",
      href: "#",
      available: false,
    },
  ];

  return (
    <MarketingPage
      hero={{
        eyebrow: "Education",
        title: <>Build the capability that endures.</>,
        lede: (
          <>
            Tools change. The judgment to deploy AI responsibly inside a regulated
            institution does not. Start free; earn the Practitioner credential when you&rsquo;re
            ready. Specialist and Leader programs are coming after the foundation loop is
            validated.
          </>
        ),
        primaryCta: CTAS.beginAssessment,
        aside: isPEnrolled ? (
          <Marginalia label="Your progress">
            <h4 className="font-serif text-display-xs leading-snug">
              {completedCount}/{modules.length} modules complete
            </h4>
            <p className="font-serif italic text-body-sm text-slate mt-s1 mb-s4">
              AiBI-Practitioner · in progress
            </p>
            <Cta href="/courses/aibi-p" variant="secondary">
              Resume the program →
            </Cta>
          </Marginalia>
        ) : undefined,
      }}
    >
      {/* §01 — Free Classes */}
      <Section variant="parch" padding="default">
        <SectionHeader
          number="01"
          label="Classes · Free"
          title="Start where you are."
          subtitle="Short, free entry points. No purchase required. Designed to give you a clear answer in under five minutes."
        />
        <div className="grid sm:grid-cols-3 gap-px bg-hairline border-y border-strong mt-s6">
          {freeClasses.map((cls) => (
            <article
              key={cls.title}
              className="bg-linen p-s6 flex flex-col"
            >
              <h3 className="font-serif text-display-xs leading-snug mb-s3">{cls.title}</h3>
              <p className="text-body-sm leading-relaxed text-ink/80 flex-1 mb-s5">
                {cls.subtitle}
              </p>
              {cls.available ? (
                <Cta variant="secondary" href={cls.href}>
                  {cls.cta} →
                </Cta>
              ) : (
                <span className="font-serif-sc text-mono-sm uppercase tracking-widest text-ink/40 border-b border-hairline pb-[1px] self-start">
                  {cls.cta}
                </span>
              )}
            </article>
          ))}
        </div>
      </Section>

      {/* §02 — Certification ladder */}
      <Section variant="linen" padding="default">
        <SectionHeader
          number="02"
          label="Certifications · Paid"
          title="Three credentials, one ladder."
          subtitle="Each certification builds on the previous. Earn the credential that matches your role today and advance when you are ready."
        />
        <CertificationLadder
          className="mt-s6"
          rungs={[
            {
              level: "Practitioner",
              stepLabel: "01",
              code: "AiBI-Practitioner",
              title: "Banking AI Practitioner",
              designation: "Personal AI proficiency for every staff member",
              pillar: "application",
              facts: [
                { label: "Audience", value: "All staff" },
                { label: "Format", value: "Self-paced online" },
                { label: "Effort", value: `${modules.length} modules`, mono: true },
                { label: "Tuition", value: "$295 · $199/seat at 10+", mono: true },
              ],
              blurb:
                "For everyone in the bank: tellers, lenders, ops, compliance, executive support. Ends with a portfolio of reviewed AI artifacts.",
              href: "/courses/aibi-p",
            },
            {
              level: "Specialist",
              stepLabel: "02",
              code: "AiBI-Specialist",
              title: "Banking AI Specialist",
              designation: "Advanced workflows, agents, and internal AI systems",
              pillar: "understanding",
              facts: [
                { label: "Audience", value: "Department managers" },
                { label: "Format", value: "Self-paced, role-tracked" },
                { label: "Effort", value: "Track-dependent", mono: true },
                { label: "Tuition", value: "Coming soon" },
              ],
              blurb:
                "Role-specific tracks: Ops, Lending, Compliance, Risk. For practitioners ready to lead AI within a function.",
              href: "/coming-soon?interest=specialist",
              comingSoon: true,
            },
            {
              level: "Leader",
              stepLabel: "03",
              code: "AiBI-Leader",
              title: "Banking AI Leader",
              designation: "Team-level rollout and executive AI leadership",
              pillar: "awareness",
              facts: [
                { label: "Audience", value: "C-suite & board" },
                { label: "Format", value: "Cohort-supported" },
                { label: "Effort", value: "Capstone", mono: true },
                { label: "Tuition", value: "Coming soon" },
              ],
              blurb:
                "Governance, vendor risk, AI strategy, and the SR 11-7 stack. Optional fractional Chief AI Officer engagement.",
              href: "/coming-soon?interest=leader",
              comingSoon: true,
            },
          ]}
        />
      </Section>

      {/* §03 — Sample question */}
      <SampleQuestion />

      {/* §04 — Inquiry */}
      <Section variant="parch" padding="default" container="narrow" id="inquiry-form">
        <SectionHeader
          number="04"
          label="Talk to us"
          title="Questions before you commit?"
        />
        <div className="mt-s6">
          <InquiryForm />
        </div>
      </Section>

      {/* §05 — Team / institutional CTA */}
      <Section variant="dark" divider="none" padding="default">
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-s10 items-center">
          <div>
            <p className="font-serif-sc text-label-md uppercase tracking-widest text-amber-light mb-s3">
              Team and institutional enrollment
            </p>
            <h2 className="font-serif text-display-md text-bone leading-tight">
              Need team certification or executive workshops?
            </h2>
            <p className="text-body-md text-cream mt-s4 leading-relaxed max-w-narrow">
              AiBI-Practitioner team pricing starts at 10 seats. Specialist and Leader
              programs are coming after the Practitioner is validated with real learners.
            </p>
          </div>
          <div>
            <Cta href="/for-institutions" tone="dark">
              Read the institutional engagement page →
            </Cta>
          </div>
        </div>
      </Section>
    </MarketingPage>
  );
}
