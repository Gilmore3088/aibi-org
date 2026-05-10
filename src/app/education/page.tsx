import type { Metadata } from "next";
import { MarketingPage } from "@/components/system/templates";
import {
  Section,
  SectionHeader,
  CertificationLadder,
  Cta,
  Marginalia,
  SkillGrid,
} from "@/components/system";
import { InteractiveSkillsPreview } from "@/components/sections/InteractiveSkillsPreview";
import { InquiryForm } from "@/app/certifications/_components/InquiryForm";
import { modules } from "@content/courses/aibi-p";
import { getEnrollment as getPEnrollment } from "@/app/courses/aibi-p/_lib/getEnrollment";

export const metadata: Metadata = {
  title: "Education | The AI Banking Institute",
  description:
    "Free classes and three certification tracks for community banks and credit unions. Start with the AI Readiness Assessment, then earn AiBI Foundations, AiBI-S, or AiBI-L credentials.",
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

  interface AssessmentTile {
    readonly tag: string;
    readonly tagTone: "free" | "paid";
    readonly title: string;
    readonly subtitle: string;
    readonly facts: readonly { readonly label: string; readonly value: string }[];
    readonly cta: string;
    readonly href: string;
  }

  const assessments: readonly AssessmentTile[] = [
    {
      tag: "Free",
      tagTone: "free",
      title: "Free AI Readiness Assessment",
      subtitle:
        "A quick diagnostic for your institution. Score, tier, and a tailored starter artifact you can take to your team this week.",
      facts: [
        { label: "Questions", value: "12" },
        { label: "Time", value: "3 min" },
        { label: "Format", value: "Self-serve · mobile-ready" },
        { label: "Cost", value: "Free — no email gate to see your score" },
      ],
      cta: "Take the free assessment →",
      href: "/assessment/start",
    },
    {
      tag: "$99 · $79 at 10+",
      tagTone: "paid",
      title: "In-Depth Assessment",
      subtitle:
        "Forty-eight questions across eight readiness dimensions. Individual report, plus an anonymized aggregate dashboard for institution leaders.",
      facts: [
        { label: "Questions", value: "48" },
        { label: "Time", value: "20 min" },
        { label: "Format", value: "Individual + institution rollup" },
        { label: "Cost", value: "$99 · $79/seat at 10+" },
      ],
      cta: "Begin the In-Depth Assessment →",
      href: "/assessment/in-depth",
    },
  ];

  return (
    <MarketingPage
      hero={{
        eyebrow: "Education",
        title: <>Use our assessments to measure you or your team&rsquo;s readiness.</>,
        divider: "hairline",
        aside: isPEnrolled ? (
          <Marginalia label="Your progress">
            <h4 className="font-serif text-display-xs leading-snug">
              {completedCount}/{modules.length} modules complete
            </h4>
            <p className="font-serif italic text-body-sm text-slate mt-s1 mb-s4">
              AiBI Foundations · in progress
            </p>
            <Cta href="/courses/aibi-p" variant="secondary">
              Resume the program →
            </Cta>
          </Marginalia>
        ) : undefined,
        payload: (
          <div className="grid md:grid-cols-2 gap-px bg-hairline border-y border-strong">
            {assessments.map((a) => (
              <article key={a.title} className="bg-linen p-s8 lg:p-s10 flex flex-col">
                <div className="flex items-center mb-s5">
                  <span
                    className={
                      a.tagTone === "free"
                        ? "font-serif-sc text-mono-sm uppercase tracking-widest text-terra border border-terra px-s3 py-[3px]"
                        : "font-serif-sc text-mono-sm uppercase tracking-widest text-terra bg-parch-dark border border-terra px-s3 py-[3px]"
                    }
                  >
                    {a.tag}
                  </span>
                </div>
                <h3 className="font-serif text-display-sm leading-snug mb-s3">{a.title}</h3>
                <p className="text-body-md leading-relaxed text-ink/80 mb-s6">{a.subtitle}</p>
                <dl className="grid grid-cols-2 gap-y-s3 gap-x-s5 border-t border-hairline pt-s5 mb-s6">
                  {a.facts.map((f) => (
                    <div key={f.label}>
                      <dt className="font-serif-sc text-mono-xs uppercase tracking-wider text-ink/50 mb-[2px]">
                        {f.label}
                      </dt>
                      <dd className="font-mono text-body-sm tabular-nums text-ink">{f.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-auto">
                  <Cta variant="secondary" href={a.href}>
                    {a.cta}
                  </Cta>
                </div>
              </article>
            ))}
          </div>
        ),
      }}
    >

      {/* Free Classes */}
      <Section variant="parch" padding="default">
        <SectionHeader
          label="Classes · Free"
          title="Other free entry points."
          subtitle="Subscribe to the Brief, watch a five-minute class. No purchase required."
        />
        <div className="grid sm:grid-cols-2 gap-px bg-hairline border-y border-strong mt-s6">
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

      {/* Certification ladder */}
      <Section variant="linen" padding="default">
        <SectionHeader
          label="Certifications · Paid"
          title="Three credentials, one ladder."
          subtitle="Each certification builds on the previous. Earn the credential that matches your role today and advance when you are ready."
        />
        <CertificationLadder
          className="mt-s6"
          rungs={[
            {
              level: "Foundations",
              stepLabel: "01",
              code: "AiBI Foundations",
              title: "Banking AI Foundations",
              designation: "Personal AI proficiency for every staff member",
              pillar: "application",
              facts: [
                { label: "Audience", value: "All staff" },
                { label: "Format", value: "Self-paced online" },
                { label: "Effort", value: `${modules.length} modules`, mono: true },
                { label: "Tuition", value: "$295 · $199/seat at 10+", mono: true },
              ],
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
              href: "/coming-soon?interest=leader",
              comingSoon: true,
            },
          ]}
        />
      </Section>

      {/* Capabilities preview — interactive tabs */}
      <InteractiveSkillsPreview />

      {/* Skills — what practitioners can do on day one */}
      <Section variant="linen" padding="default">
        <SectionHeader
          label="Skills"
          title="What practitioners can do on day one."
        />
        <SkillGrid className="mt-s8" />
      </Section>

      {/* Inquiry */}
      <Section variant="parch" padding="default" container="narrow" id="inquiry-form">
        <SectionHeader
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
            <p className="font-serif-sc text-label-md uppercase tracking-widest text-cream mb-s3">
              Team and institutional enrollment
            </p>
            <h2 className="font-serif text-display-md text-bone leading-tight">
              Need team certification or executive workshops?
            </h2>
            <p className="text-body-md text-cream mt-s4 leading-relaxed max-w-narrow">
              AiBI Foundations team pricing starts at 10 seats. Specialist and Leader
              programs are coming after the Foundations is validated with real learners.
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
