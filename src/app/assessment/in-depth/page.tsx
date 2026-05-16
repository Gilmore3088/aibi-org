// /assessment/in-depth — landing for the paid 48-question In-Depth Assessment.
//
// design-2.0 build. Uses MarketingPage + the same composition rhythm as the
// homepage and /assessment/start.
//
// Pricing per CLAUDE.md 2026-05-05: $99 individual, $79/seat at 10+.
// Stripe Checkout via PurchaseButton (./_components/PurchaseButton.tsx),
// which routes through /api/checkout/in-depth.

import type { Metadata } from "next";
import { MarketingPage } from "@/components/system/templates";
import { Section } from "@/components/system";
import { BRAND } from "@content/copy";
import { PurchaseButton } from "./_components/PurchaseButton";

export const metadata: Metadata = {
  title: "In-Depth Assessment | The AI Banking Institute",
  description:
    "A 48-question, eight-dimension diagnostic for community banks and credit unions. Individual report plus an anonymized aggregate dashboard for institution leaders.",
};

const DELIVERABLES = [
  "Forty-eight questions across eight readiness dimensions",
  "A full individual report with peer-band comparison",
  "An anonymized aggregate dashboard for institution leaders",
  "A starting playbook keyed to your lowest-scoring dimensions",
  "One free retake within twelve months",
] as const;

interface InDepthAssessmentPageProps {
  readonly searchParams?: { readonly reason?: string };
}

export default function InDepthAssessmentPage({
  searchParams,
}: InDepthAssessmentPageProps) {
  const noPurchase = searchParams?.reason === "no-purchase";

  return (
    <MarketingPage
      hero={{
        eyebrow: "In-Depth Assessment",
        title: (
          <>
            A <em className="text-terra">consulting-grade</em> diagnostic for
            your institution.
          </>
        ),
        lede: (
          <span className="font-serif italic">
            Twenty minutes. Eight readiness dimensions. A report you can take to
            your board.
          </span>
        ),
        secondaryCta: {
          href: "/assessment",
          label: "Or take the free 12-question version",
        },
        divider: "hairline",
      }}
    >
      {noPurchase && (
        <Section variant="parch" padding="default" divider="none">
          <div
            role="status"
            className="mx-auto max-w-default border border-terra/30 bg-terra/5 px-s6 py-s5 rounded-sharp"
          >
            <p className="font-mono text-mono-sm uppercase tracking-widest text-terra mb-s2">
              Purchase required
            </p>
            <p className="font-serif text-body-md text-ink leading-relaxed">
              The forty-eight-question In-Depth Assessment is paid. Purchase a
              seat below to unlock it. Already paid? Make sure you are signed
              in with the same email you used at checkout.
            </p>
          </div>
        </Section>
      )}
      {/* Pricing + deliverables side-by-side */}
      <Section variant="linen" padding="default" divider="none">
        <div className="grid md:grid-cols-2 -mx-s7">
          {/* Pricing tile */}
          <div className="bg-linen px-s7 py-s12 md:py-s14 md:pr-s10 border-r border-hairline flex flex-col">
            <p className="font-mono text-label-md uppercase tracking-widest text-terra mb-s5">
              Pricing
            </p>
            <div className="grid grid-cols-2 gap-s8">
              <div>
                <p className="font-mono text-display-md tabular-nums text-ink leading-none">
                  $99
                </p>
                <p className="font-mono text-label-md uppercase tracking-widest text-slate mt-s3">
                  Per individual
                </p>
              </div>
              <div>
                <p className="font-mono text-display-md tabular-nums text-ink leading-none">
                  $79
                </p>
                <p className="font-mono text-label-md uppercase tracking-widest text-slate mt-s3">
                  Per seat · 10+
                </p>
              </div>
            </div>
            <p className="text-body-sm text-ink/70 leading-relaxed mt-s10 max-w-[40ch]">
              Pay once. Take the diagnostic. Receive the report. One free
              retake within twelve months.
            </p>
            <div className="mt-s8">
              <PurchaseButton />
            </div>
            <p className="font-serif text-body-md text-ink/85 mt-s6 max-w-[40ch]">
              Want your whole team to benefit? Contact us for ten or more.
            </p>
            <p className="font-mono text-mono-xs uppercase tracking-wider text-slate mt-s3">
              Email{" "}
              <a
                href={`mailto:${BRAND.emails.contact}?subject=In-Depth%20Assessment%20%E2%80%94%2010%2B%20seats`}
                className="text-terra border-b border-terra hover:text-terra-light hover:border-terra-light"
              >
                {BRAND.emails.contact}
              </a>
            </p>
          </div>

          {/* Deliverables tile */}
          <div className="bg-parch px-s7 py-s12 md:py-s14 md:pl-s10 flex flex-col">
            <p className="font-mono text-label-md uppercase tracking-widest text-terra mb-s5">
              What you get
            </p>
            <ul className="space-y-s4 max-w-[44ch]">
              {DELIVERABLES.map((d) => (
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
        </div>
      </Section>

      {/* Trust strip */}
      <Section variant="linen" padding="default" divider="none">
        <div className="max-w-default mx-auto border-y border-hairline py-s5 grid sm:grid-cols-3 gap-s4">
          {[
            "Individual + institution rollup",
            "Aligned with SR 11-7 + TPRM",
            "No customer data required",
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
