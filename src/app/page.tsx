import type { Metadata } from "next";
import { MarketingPage } from "@/components/system/templates";
import {
  Section,
  SectionHeader,
  TransformationArc,
  CertificationLadder,
  Cta,
} from "@/components/system";
import { ROIDossier } from "@/components/sections/ROIDossier";
import { cn } from "@/lib/utils/cn";
import { BRAND, CTAS } from "@content/copy";
import { citation } from "@content/citations";

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description:
    "An education company for community banks and credit unions. Begin with an eight-question readiness diagnostic. Continue through three certifications aligned with the regulators' criteria.",
};

export default function HomePage() {
  return (
    <MarketingPage
      hero={{
        eyebrow: "A Proficiency Standard for Community Banking",
        title: (
          <>
            Turning bankers into <em className="not-italic text-terra">builders.</em>
          </>
        ),
        lede: (
          <>
            An education company for community banks and credit unions. Begin with an
            eight-question readiness diagnostic. Continue through three certifications —
            from working AI literacy to enterprise leadership — aligned with the
            regulators&rsquo; criteria. Built for the people inside your bank, not the
            vendors selling to it.
          </>
        ),
        primaryCta: CTAS.beginAssessment,
        secondaryCta: CTAS.viewCurriculum,
        aside: <HeroFactsPlate />,
      }}
      kpis={[
        {
          label: "Curriculum",
          value: "9 modules",
          delta: "~12 hrs, self-paced",
          desc: "From AI literacy to a working portfolio",
        },
        {
          label: "Practitioner output",
          value: "3 artifacts",
          delta: "peer & instructor reviewed",
          desc: "Real workflows shipped during the program",
        },
        {
          label: "Roles served",
          value: "Bank-wide",
          delta: "tellers → executives",
          desc: "Ops, lending, compliance, risk, executive",
        },
        {
          label: "Frameworks aligned",
          value: "4",
          delta: "SR 11-7 · TPRM · ECOA · AIEOG",
          desc: "Examiner-ready by design, not by accident",
        },
      ]}
      closing={{
        eyebrow: "Begin where you are",
        title: "Start with the readiness assessment.",
        body: "Eight questions, three minutes on a phone. You'll know your readiness level, your top gaps, and the first practical exercise to complete.",
        cta: CTAS.takeAssessment,
      }}
    >
      {/* §01 — The Path: transformation arc */}
      <Section variant="linen" padding="default">
        <SectionHeader
          number="01"
          label="The Path"
          title="From the work bankers do today, to the work AI lets them do."
          subtitle="Three stages, one banker. The institution gains capability because its people gained capability."
        />
        <TransformationArc
          stages={[
            {
              stageLabel: "Stage 01 · Today",
              title: "The banker",
              body: (
                <>
                  Skilled at the work. AI feels adjacent — either hyped, restricted, or
                  both. Curiosity is real; permission is unclear.
                </>
              ),
              attributes: [
                "Domain expertise",
                "Manual or partial workflows",
                "Risk-aware, AI-uncertain",
              ],
            },
            {
              stageLabel: "Stage 02 · The Path",
              title: "The practitioner",
              body: (
                <>
                  Working AI literacy, role-relevant artifacts, examiner-ready posture.
                  Permission becomes operational.
                </>
              ),
              attributes: [
                "Three reviewed AI artifacts",
                "Regulator-aligned guardrails",
                "AiBI-Practitioner credential",
              ],
            },
            {
              stageLabel: "Stage 03 · In a year",
              title: "The builder",
              body: (
                <>
                  The banker who turns institution-specific problems into AI-native
                  workflows the bank actually uses, with leadership a path away.
                </>
              ),
              attributes: [
                "Functional AI ownership",
                "AiBI-S specialist track",
                "Path to AiBI-L leadership",
              ],
            },
          ]}
          className="mt-s6"
        />
      </Section>

      {/* §02 — Modeled value: editorial ROI dossier */}
      <ROIDossier />

      {/* §03 — Credentials: certification ladder */}
      <Section variant="linen" padding="default">
        <SectionHeader
          number="03"
          label="Credentials"
          title="Three certifications. One ladder."
          subtitle="A defined progression from individual capability to institutional leadership."
        />
        <CertificationLadder
          className="mt-s6"
          rungs={[
            {
              level: "Practitioner",
              stepLabel: "01",
              code: "AiBI-Practitioner",
              title: "AiBI-Practitioner",
              designation: "Banking AI Practitioner · The AI Banking Institute",
              pillar: "application",
              facts: [
                { label: "Format", value: "Self-paced" },
                { label: "Effort", value: "12 modules", mono: true },
                { label: "Outcome", value: "Working AI literacy" },
                { label: "Tuition", value: "$295 · $199/seat at 10+", mono: true },
              ],
              blurb:
                "For everyone in the bank: tellers, lenders, ops, compliance. Ends with a portfolio of reviewed AI artifacts.",
              href: "/courses/aibi-p",
            },
            {
              level: "Specialist",
              stepLabel: "02",
              code: "AiBI-Specialist",
              title: "AiBI-Specialist",
              designation: "Banking AI Specialist · The AI Banking Institute",
              pillar: "understanding",
              facts: [
                { label: "Format", value: "Self-paced, role-tracked" },
                { label: "Effort", value: "Track-dependent", mono: true },
                { label: "Outcome", value: "Domain-deep AI capability" },
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
              title: "AiBI-Leader",
              designation: "Banking AI Leader · The AI Banking Institute",
              pillar: "awareness",
              facts: [
                { label: "Format", value: "Cohort-supported" },
                { label: "Effort", value: "Capstone", mono: true },
                { label: "Outcome", value: "Enterprise AI strategy" },
                { label: "Tuition", value: "Coming soon" },
              ],
              blurb:
                "For executives and board members. Governance, vendor risk, AI strategy, and the SR 11-7 stack.",
              href: "/coming-soon?interest=leader",
              comingSoon: true,
            },
          ]}
        />
        <div className="mt-s8 text-center">
          <Cta variant="secondary" href="/education">
            View the full education catalog →
          </Cta>
        </div>
      </Section>
    </MarketingPage>
  );
}

/**
 * Hero "facts plate" — sourced industry statistics that anchor the hero's
 * brand promise. Treated like the masthead-side data plate of an annual
 * report: one large monumental number on top, two smaller stats beneath
 * it as a 2-column row, framed with hairlines and a parch-dark wash.
 */
function HeroFactsPlate() {
  const lead = citation("personetics-switch-for-ai");
  const skill = citation("gartner-skills-gap");
  const gov = citation("gartner-no-governance");

  return (
    <aside
      aria-label="Industry context"
      className="bg-parch-dark border border-strong"
    >
      <div className="px-s5 py-s3 border-b border-strong flex items-baseline justify-between bg-ink text-bone">
        <p className="font-mono text-label-md uppercase tracking-widest">
          Industry · at a glance
        </p>
        <p className="font-mono text-label-sm uppercase tracking-widest text-cream/70">
          Sourced
        </p>
      </div>

      {/* Lead statistic */}
      <div className="px-s6 py-s5 border-b border-hairline">
        <p className="font-mono text-display-xl tabular-nums text-terra leading-none">
          {lead.value}
        </p>
        <p className="font-serif text-body-md text-ink leading-snug mt-s3">
          {lead.claim}
        </p>
        <p className="font-mono text-label-sm uppercase tracking-widest text-dust mt-s3">
          {lead.short}
        </p>
      </div>

      {/* Two supporting statistics */}
      <div className="grid grid-cols-2">
        {[skill, gov].map((c, i) => (
          <div
            key={c.slug}
            className={cn(
              "px-s5 py-s4",
              i === 1 && "border-l border-hairline"
            )}
          >
            <p className="font-mono text-display-sm tabular-nums text-ink leading-none">
              {c.value}
            </p>
            <p className="text-body-sm text-ink/85 leading-snug mt-s2">
              {c.claim}
            </p>
            <p className="font-mono text-label-sm uppercase tracking-widest text-dust mt-s2">
              {c.short}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
