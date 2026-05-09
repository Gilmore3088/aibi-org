import type { Metadata } from "next";
import { MarketingPage } from "@/components/system/templates";
import { Section, Cta } from "@/components/system";

export const metadata: Metadata = {
  title: "Start the AI Readiness Assessment | The AI Banking Institute",
  description:
    "Two assessments for community banks and credit unions. The free three-minute readiness diagnostic, or the institutional-grade In-Depth Assessment.",
};

interface AssessmentTile {
  readonly audience: string;
  readonly title: React.ReactNode;
  readonly deliverables: readonly string[];
  readonly facts: readonly { readonly label: string; readonly value: string }[];
  readonly cta: { readonly href: string; readonly label: string };
  readonly surface: "linen" | "parch";
}

const TILES: readonly AssessmentTile[] = [
  {
    surface: "linen",
    audience: "Best for individuals",
    title: (
      <>
        AI <em className="text-terra">Readiness</em> Assessment
      </>
    ),
    deliverables: [
      "Your readiness score",
      "Your tier band",
      "A tailored starter artifact for your team",
    ],
    facts: [
      { label: "Questions", value: "12" },
      { label: "Time", value: "3 min" },
      { label: "Format", value: "Self-serve · mobile-ready" },
      { label: "Cost", value: "Free" },
    ],
    cta: { href: "/assessment", label: "Begin the free assessment →" },
  },
  {
    surface: "parch",
    audience: "Best for teams or groups",
    title: (
      <>
        <em className="text-terra">In-Depth</em> Assessment
      </>
    ),
    deliverables: [
      "Score across eight readiness dimensions",
      "A full individual report",
      "An anonymized aggregate dashboard for institution leaders",
    ],
    facts: [
      { label: "Questions", value: "48" },
      { label: "Time", value: "20 min" },
      { label: "Format", value: "Individual + institution rollup" },
      { label: "Cost", value: "$99 · $79/seat at 10+" },
    ],
    cta: { href: "/assessment/in-depth", label: "Begin the In-Depth Assessment →" },
  },
];

export default function AssessmentStartPage() {
  return (
    <MarketingPage
      hero={{
        eyebrow: "Two assessments",
        title: (
          <>
            How ready is your <em className="text-terra">bank?</em>
          </>
        ),
        lede: (
          <span className="font-serif italic">
            Three minutes free, or twenty for the institutional-grade In-Depth
            Assessment.
          </span>
        ),
        divider: "hairline",
      }}
    >
      {/* Two-tile split — same composition as the homepage */}
      <Section variant="linen" padding="default" divider="none">
        <div className="grid md:grid-cols-2 -mx-s7">
          {TILES.map((tile, idx) => {
            const surfaceClass =
              tile.surface === "parch" ? "bg-parch" : "bg-linen";
            const sideClass =
              idx === 0
                ? "md:pr-s10 border-r border-hairline"
                : "md:pl-s10";
            return (
              <article
                key={tile.cta.href}
                className={`${surfaceClass} px-s7 py-s12 md:py-s14 ${sideClass} flex flex-col`}
              >
                <p className="font-mono text-label-md uppercase tracking-widest text-terra mb-s5">
                  {tile.audience}
                </p>
                <h2 className="font-serif text-display-lg md:text-display-xl text-ink leading-[1.05] tracking-tightish max-w-[14ch]">
                  {tile.title}
                </h2>
                <div className="mt-s8 max-w-[40ch]">
                  <p className="font-mono text-label-md uppercase tracking-widest text-slate mb-s4">
                    What you get
                  </p>
                  <ul className="space-y-s3">
                    {tile.deliverables.map((d) => (
                      <li
                        key={d}
                        className="grid grid-cols-[1.25rem_1fr] gap-s2 items-start font-serif text-body-lg text-ink leading-snug"
                      >
                        <span aria-hidden="true" className="text-terra pt-[2px]">
                          —
                        </span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <dl className="grid grid-cols-2 gap-y-s4 gap-x-s5 border-t border-hairline pt-s6 mt-s8 max-w-[40ch]">
                  {tile.facts.map((f) => (
                    <div key={f.label}>
                      <dt className="font-mono text-label-sm uppercase tracking-widest text-slate">
                        {f.label}
                      </dt>
                      <dd className="font-mono tabular-nums text-body-md text-ink mt-s1">
                        {f.value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-s8">
                  <Cta variant="secondary" href={tile.cta.href}>
                    {tile.cta.label}
                  </Cta>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      {/* Single trust line — no boxed chrome, just a hairline-divided strip */}
      <Section variant="linen" padding="default" divider="none">
        <div className="max-w-default mx-auto border-y border-hairline py-s5 grid sm:grid-cols-3 gap-s4">
          {[
            "No customer data required",
            "No technical knowledge required",
            "Built for regulated institutions",
          ].map((point) => (
            <p
              key={point}
              className="font-mono text-label-md uppercase tracking-widest text-slate text-center"
            >
              {point}
            </p>
          ))}
        </div>
      </Section>
    </MarketingPage>
  );
}
