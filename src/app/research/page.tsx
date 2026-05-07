import type { Metadata } from "next";
import { MarketingPage } from "@/components/system/templates";
import { Section, SectionHeader, EssayArchive, NewsletterCard } from "@/components/system";
import { BRAND, CTAS } from "@content/copy";
import { listEssayMeta } from "@content/essays/_lib/registry";

export const metadata: Metadata = {
  title: `Research — The AI Banking Brief`,
  description:
    "A working record of how community banks and credit unions are actually adopting AI. Sourced numbers, named regulators, the artifacts you can lift from. Published fortnightly.",
};

export default async function ResearchPage() {
  const essays = await listEssayMeta();
  const featured = essays[0];

  return (
    <MarketingPage
      hero={{
        eyebrow: "Research from the Institute",
        title: <>The AI Banking Brief.</>,
        lede: (
          <>
            A working record of how community banks and credit unions are actually
            adopting AI &mdash; with sourced numbers, named regulators, and the artifacts
            you can lift from. Published fortnightly to a list of operators.
          </>
        ),
        primaryCta: CTAS.beginAssessment,
        aside: (
          <NewsletterCard
            heading="Join the operator list."
            blurb={`Read by AI champions, examiners, and committee members at ${BRAND.audience}.`}
            proof="No tracking pixels · one-click unsubscribe"
          />
        ),
      }}
    >
      {featured && (
        <Section variant="parch" padding="default">
          <SectionHeader number="01" label="Lead essay" title={featured.title} />
          {featured.dek && (
            <p className="font-serif italic text-body-lg text-ink/80 leading-relaxed max-w-narrow mt-s4">
              {featured.dek}
            </p>
          )}
          <div className="mt-s6">
            <a
              href={`/research/${featured.slug}`}
              className="text-terra border-b border-terra pb-[2px] font-medium"
            >
              Read the full essay →
            </a>
          </div>
        </Section>
      )}

      <Section variant="linen" padding="default" divider="none">
        <SectionHeader
          number="02"
          label="Archive"
          title="Recent issues"
          subtitle="Newest first. The full archive is searchable by topic."
        />
        <EssayArchive items={essays} className="mt-s6" />
      </Section>
    </MarketingPage>
  );
}
