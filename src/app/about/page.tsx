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
            It takes two and a half hours. She knows it is inefficient. She has mentioned
            it in three different meetings. Nothing has changed. That banker could fix it
            herself in an afternoon. She just does not know that yet.
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
      {/* Mission narrative — the original About voice, preserved */}
      <Section variant="parchDark" padding="default" container="narrow">
        <div className="space-y-s6 text-body-lg leading-relaxed text-ink/85">
          <p className="font-serif italic text-display-sm text-terra">
            The AI Banking Institute exists for her.
          </p>
          <p>
            Not for the twenty largest banks in the country, who have the budgets and the
            teams and the consultants. For the community banks and credit unions that
            anchor towns and neighborhoods and small businesses — the ones that remember
            your name, that lend to people an algorithm would have rejected, that show up
            when it matters.
          </p>
          <p>
            Those institutions have something the large banks do not: people who are
            deeply, personally invested in the community they serve. They have passion.
            They have institutional knowledge. They have relationships no technology can
            replicate.
          </p>
          <p>
            What they have not had, until now, is a framework that puts AI in their
            hands — not the hands of a vendor, not the hands of a hired expert, but their
            own hands.
          </p>
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
