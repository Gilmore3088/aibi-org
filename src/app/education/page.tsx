import type { Metadata } from "next";
import { MarketingPage } from "@/components/system/templates";
import {
  Section,
  SectionHeader,
  Cta,
  Marginalia,
  SkillGrid,
  ProductMark,
  type ProductMarkKind,
} from "@/components/system";
import { InteractiveSkillsPreview } from "@/components/sections/InteractiveSkillsPreview";
import { InquiryForm } from "@/app/certifications/_components/InquiryForm";
import { modules } from "@content/courses/foundation-program";
import { getEnrollment as getPEnrollment } from "@/app/courses/foundation/program/_lib/getEnrollment";

export const metadata: Metadata = {
  title: "Education | The AI Banking Institute",
  description:
    "Free classes and three certification tracks for community banks and credit unions. Start with the AI Readiness Assessment, then earn AiBI-Foundation, AiBI-S, or AiBI-L credentials.",
};

export default async function EducationPage() {
  const pEnrollment = await getPEnrollment();
  const completedCount = pEnrollment?.completed_modules?.length ?? 0;
  const isPEnrolled = pEnrollment !== null;

  interface AssessmentTile {
    readonly tag: string;
    readonly tagTone: "free" | "paid";
    readonly title: string;
    readonly subtitle: string;
    readonly facts: readonly { readonly label: string; readonly value: string }[];
    readonly cta: string;
    readonly href: string;
    readonly mark: ProductMarkKind;
  }

  const assessments: readonly AssessmentTile[] = [
    {
      tag: "Free",
      tagTone: "free",
      title: "Free AI Readiness Assessment",
      mark: "assessment-free",
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
      tag: "$99 · $79 at 10+ by request",
      tagTone: "paid",
      title: "In-Depth Assessment",
      mark: "assessment-indepth",
      subtitle:
        "Forty-eight questions across eight readiness dimensions. Individual report, plus an anonymized aggregate dashboard for institution leaders.",
      facts: [
        { label: "Questions", value: "48" },
        { label: "Time", value: "20 min" },
        { label: "Format", value: "Individual + institution rollup" },
        { label: "Cost", value: "$99 individual · $79/seat at 10+ by request" },
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
              AiBI-Foundation · in progress
            </p>
            <Cta href="/courses/foundation/program" variant="secondary">
              Resume the program →
            </Cta>
          </Marginalia>
        ) : undefined,
        payload: (
          <div className="grid md:grid-cols-2 gap-px bg-hairline border-y border-strong">
            {assessments.map((a) => (
              <article key={a.title} className="bg-linen p-s8 lg:p-s10 flex flex-col">
                <ProductMark kind={a.mark} size={48} className="mb-s4" />
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
                <dl className="grid grid-cols-2 border-y border-strong mb-s6">
                  {a.facts.map((f, i) => {
                    const isStat = i < 2;
                    const isLeft = i % 2 === 0;
                    const isTopRow = i < 2;
                    return (
                      <div
                        key={f.label}
                        className={[
                          "py-s4",
                          isLeft ? "pr-s5" : "pl-s5",
                          !isLeft && "border-l border-hairline",
                          isTopRow && "border-b border-hairline",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <dt className="font-mono text-mono-xs uppercase tracking-widest text-ink/55 mb-s2">
                          {f.label}
                        </dt>
                        {isStat ? (
                          <dd className="font-serif italic text-4xl md:text-5xl text-terra leading-none tabular-nums">
                            {f.value}
                          </dd>
                        ) : (
                          <dd className="font-serif text-body-md text-ink leading-snug">
                            {f.value}
                          </dd>
                        )}
                      </div>
                    );
                  })}
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
              AiBI-Foundation team pricing starts at 10 seats. Specialist and Leader
              programs are coming after the Foundation is validated with real learners.
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
