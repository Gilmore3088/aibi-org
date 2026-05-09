import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MarketingPage } from "@/components/system/templates";
import { Section, SectionHeader, EditorialQuote } from "@/components/system";
import { BRAND, PRINCIPLES, CTAS } from "@content/copy";

const PRINCIPLE_GLYPHS: Record<string, ReactNode> = {
  "01": (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="12" r="5" fill="currentColor" />
      <rect x="4" y="22" width="24" height="1" fill="currentColor" />
      <rect x="4" y="26" width="24" height="1" fill="currentColor" opacity="0.4" />
    </svg>
  ),
  "02": (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 6 L4 6 L4 26 L9 26" />
      <path d="M23 6 L28 6 L28 26 L23 26" />
      <rect x="13" y="13" width="6" height="6" fill="currentColor" stroke="none" />
    </svg>
  ),
  "03": (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      {[8, 13, 18, 23].map((y) => (
        <rect key={y} x="4" y={y} width="24" height="1.5" fill="currentColor" />
      ))}
    </svg>
  ),
  "04": (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="4" width="20" height="24" />
      <path d="M11 16 L15 20 L22 11" strokeWidth="2" strokeLinecap="square" />
    </svg>
  ),
  "05": (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      {[
        [4, 14], [10, 18], [16, 10], [22, 22], [28, 16],
      ].map(([x, h], i) => (
        <rect key={i} x={x - 1} y={28 - h} width="2" height={h} fill="currentColor" />
      ))}
    </svg>
  ),
  "06": (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="4" y="11" width="24" height="2.5" fill="currentColor" />
      <rect x="4" y="18" width="24" height="2.5" fill="currentColor" />
    </svg>
  ),
};

export const metadata: Metadata = {
  title: `About — ${BRAND.name}`,
  description:
    "The AI Banking Institute exists for the community banks and credit unions that anchor towns and neighborhoods — not for the twenty largest banks. Here is why.",
};

export default function AboutPage() {
  return (
    <MarketingPage
      hero={{
        eyebrow: "About the Institute",
        title: (
          <>
            An education company for community banks
            and <em className="not-italic text-terra">credit unions.</em>
          </>
        ),
        tagline: "Built on regulator-aligned criteria. Tuition published. Methodology published.",
        lede: BRAND.mission,
        primaryCta: CTAS.beginAssessment,
      }}
    >
      {/* Mission monument + three-card distillation */}
      <Section variant="parchDark" padding="default">
        <div className="grid md:grid-cols-[1fr_auto] gap-s10 items-center">
          <p className="font-serif italic text-display-lg leading-[1.02] text-terra max-w-narrow">
            For the institutions that anchor towns.
          </p>
          {/* Stat monument — sourced */}
          <div className="md:text-right border-l md:border-l border-hairline md:pl-s10">
            <p className="font-mono text-[clamp(4rem,12vw,9rem)] leading-none tabular-nums text-ink tracking-tight">
              8,400
            </p>
            <p className="font-serif-sc text-label-md uppercase tracking-widest text-ink/60 mt-s3">
              Community banks &amp; credit unions
            </p>
            <p className="font-mono text-mono-xs uppercase tracking-wider text-ink/45 mt-s1">
              FDIC + NCUA · 2025
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-hairline border-y border-strong mt-s10">
          <div className="bg-parch p-s6">
            {/* Glyph — single tall column = the few towers */}
            <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" className="text-terra mb-s4">
              <rect x="18" y="4" width="4" height="32" fill="currentColor" />
              <line x1="4" y1="36" x2="36" y2="36" stroke="currentColor" strokeWidth="1" />
            </svg>
            <p className="font-serif-sc text-label-md uppercase tracking-widest text-terra mb-s3">
              Not for
            </p>
            <p className="font-serif text-display-xs leading-snug text-ink">
              The twenty largest banks.
            </p>
            <p className="text-body-sm text-ink/75 leading-relaxed mt-s3">
              They have the budgets, the teams, the consultants.
            </p>
          </div>

          <div className="bg-parch p-s6">
            {/* Glyph — row of varied bars = the many community institutions */}
            <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" className="text-terra mb-s4">
              {[
                [4, 20], [9, 14], [14, 22], [19, 12],
                [24, 18], [29, 16], [34, 24],
              ].map(([x, h], i) => (
                <rect key={i} x={x} y={36 - h} width="2" height={h} fill="currentColor" />
              ))}
              <line x1="2" y1="36" x2="38" y2="36" stroke="currentColor" strokeWidth="1" />
            </svg>
            <p className="font-serif-sc text-label-md uppercase tracking-widest text-terra mb-s3">
              Built for
            </p>
            <p className="font-serif text-display-xs leading-snug text-ink">
              The institutions that anchor towns.
            </p>
            <p className="text-body-sm text-ink/75 leading-relaxed mt-s3">
              Community banks and credit unions with passion, knowledge, and relationships
              no technology can replicate.
            </p>
          </div>

          <div className="bg-parch p-s6">
            {/* Glyph — open framework holding a tool inside */}
            <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" className="text-terra mb-s4">
              <rect x="4" y="4" width="32" height="32" stroke="currentColor" strokeWidth="1" fill="none" />
              <rect x="14" y="14" width="12" height="12" fill="currentColor" />
            </svg>
            <p className="font-serif-sc text-label-md uppercase tracking-widest text-terra mb-s3">
              What we built
            </p>
            <p className="font-serif text-display-xs leading-snug text-ink">
              A framework that puts AI in their hands.
            </p>
            <p className="text-body-sm text-ink/75 leading-relaxed mt-s3">
              Not the vendor's. Not a hired expert's. Theirs.
            </p>
          </div>
        </div>
      </Section>

      {/* Editorial pull quote — the mission rendered as content */}
      <Section variant="dark" padding="default" container="narrow">
        <EditorialQuote variant="dark" size="lg" attribution="Mission · The AI Banking Institute">
          We turn bankers into builders. Not efficiency ratios, though we improve those.
          Not compliance readiness, though we build that too. Those are the outcomes. The
          mission is something more human: giving people who care deeply about their work
          a new set of tools and watching what they build with them.
        </EditorialQuote>
      </Section>

      {/* §01 — Principles */}
      <Section variant="linen" padding="default">
        <SectionHeader
          number="01"
          label="How we work"
          title="Six principles, applied without exception."
          subtitle="Internal rules, made public."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border-y border-hairline mt-s10">
          {PRINCIPLES.map((p) => (
            <div key={p.number} className="bg-linen p-s8 lg:p-s10">
              <div className="flex items-start justify-between mb-s6">
                <span className="text-terra">{PRINCIPLE_GLYPHS[p.number]}</span>
                <span className="font-mono text-mono-sm uppercase tracking-wider text-ink/40 tabular-nums">
                  {p.number}
                </span>
              </div>
              <h3 className="font-serif text-display-xs leading-snug text-ink mb-s3">
                {p.title}
              </h3>
              <p className="text-body-sm text-ink/75 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* §02 — Contact */}
      <Section variant="dark" padding="default" divider="none">
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-s10 items-center">
          <div>
            <p className="font-serif-sc text-label-md uppercase tracking-widest text-cream mb-s3">
              Talk to the Institute
            </p>
            <h2 className="font-serif text-display-md text-bone leading-tight">
              Press, partnerships, examiner inquiries, or program questions.
            </h2>
            <p className="text-body-md text-cream mt-s4 leading-relaxed">
              We respond within one business day.
            </p>
          </div>
          <div className="md:text-right">
            <p className="font-mono text-label-md uppercase tracking-widest text-cream/70 mb-s2">
              Mail
            </p>
            <a
              href={`mailto:${BRAND.emails.contact}`}
              className="font-serif text-display-xs text-bone border-b border-bone/60 hover:text-cream hover:border-cream pb-[2px]"
            >
              {BRAND.emails.contact}
            </a>
          </div>
        </div>
      </Section>
    </MarketingPage>
  );
}
