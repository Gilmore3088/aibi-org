import type { Metadata } from "next";
import { MarketingPage } from "@/components/system/templates";
import { Section, SectionHeader, EditorialQuote, Marginalia } from "@/components/system";
import { BRAND, PRINCIPLES, CTAS } from "@content/copy";

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
            There is a banker somewhere right now who has been doing the same thing every
            Tuesday morning for <em className="not-italic text-terra">six years.</em>
          </>
        ),
        lede: (
          <>
            It takes two and a half hours. She knows it is inefficient. She could fix it
            herself in an afternoon — she just does not know that yet.
          </>
        ),
        primaryCta: CTAS.beginAssessment,
        aside: (
          <Marginalia label="Founder">
            <h4 className="font-serif text-display-xs leading-snug">{BRAND.founder.name}</h4>
            <p className="font-serif italic text-body-sm text-slate mt-s1">
              {BRAND.founder.role}
            </p>
            {BRAND.founder.bio && (
              <p className="text-body-sm leading-relaxed border-t border-hairline pt-s3 mt-s4">
                {BRAND.founder.bio}
              </p>
            )}
          </Marginalia>
        ),
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
              What was missing
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border-y border-strong mt-s6">
          {PRINCIPLES.map((p) => (
            <div key={p.number} className="bg-linen p-s6">
              <p className="font-mono text-mono-sm uppercase tracking-wider text-terra mb-s2">
                {p.number}
              </p>
              <h3 className="font-serif text-display-xs leading-snug mb-s2">{p.title}</h3>
              <p className="text-body-sm text-ink/80 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* §02 — Contact */}
      <Section variant="dark" padding="default" divider="none">
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-s10 items-center">
          <div>
            <p className="font-serif-sc text-label-md uppercase tracking-widest text-amber-light mb-s3">
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
              className="font-serif text-display-xs text-amber-light border-b border-amber-light hover:text-bone hover:border-bone pb-[2px]"
            >
              {BRAND.emails.contact}
            </a>
          </div>
        </div>
      </Section>
    </MarketingPage>
  );
}
